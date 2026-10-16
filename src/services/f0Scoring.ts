/**
 * VietTone AI - Bộ thuật toán so sánh và chấm điểm đường cao độ F0 (F0 Similarity Scoring)
 * 
 * Áp dụng chuẩn hóa cao độ theo bán âm (semitones relative to median pitch)
 * kết hợp nội suy thời gian, hệ số tương quan hình dáng (Pearson) và Dynamic Time Warping (DTW).
 */

import { F0ContourData, ReferenceToneSample, F0ScoreResult } from '../types';

/**
 * Công thức tính điểm tương đồng F0 (0–100)
 * Được tách thành hàm riêng biệt để dễ dàng hiệu chuẩn thực nghiệm bằng dữ liệu kiểm thử.
 * 
 * @param shapeScore - Độ tương đồng hình dáng đường cong (0-100)
 * @param trendScore - Độ tương đồng độ dốc và chiều hướng âm vực (0-100)
 * @param dtwScore   - Độ tương đồng theo căn chỉnh biến dạng thời gian DTW (0-100)
 */
export function computeF0ScoreFormula(
  shapeScore: number,
  trendScore: number,
  dtwScore: number
): number {
  // Trọng số cấu hình:
  // - 45% cho hình dáng tổng thể (đường cong đi lên, đi xuống, bằng phẳng hay lượn sóng)
  // - 30% cho chiều hướng xu thế (Trend/Slope: độ dốc đầu-cuối)
  // - 25% cho độ lệch DTW sau khi đã căn chỉnh thời gian
  const weighted = 0.45 * shapeScore + 0.30 * trendScore + 0.25 * dtwScore;
  return Math.round(Math.max(0, Math.min(100, weighted)));
}

export class F0ScoringService {
  /**
   * Tính điểm tương đồng F0 giữa đường cao độ người học và mẫu chuẩn
   */
  public static calculateF0Similarity(
    userContour: F0ContourData | null,
    refSample: ReferenceToneSample | null
  ): F0ScoreResult {
    const educationalNote =
      'Điểm phản ánh mức tương đồng đường cao độ với mẫu tham chiếu, không phải đánh giá toàn diện phát âm.';

    // 1. Kiểm tra tính hợp lệ của giọng người học
    if (!userContour || !userContour.isReliable) {
      return {
        score: null,
        isCalculable: false,
        reason:
          userContour?.unreliableReason ||
          'Âm thanh thu được chưa đủ nguyên âm hoặc quá ngắn để trích xuất đường F0.',
        educationalNote,
      };
    }

    // 2. Kiểm tra mẫu chuẩn tham chiếu
    if (!refSample || !Array.isArray(refSample.contour) || refSample.contour.length === 0) {
      return {
        score: null,
        isCalculable: false,
        reason: 'Chưa có mẫu âm thanh chuẩn thật cho thanh này để đối chiếu.',
        educationalNote,
      };
    }

    // 3. Trích xuất các điểm có tiếng nói (voiced points)
    const userPitches = userContour.points
      .filter((p) => p.isVoiced && p.pitchHz > 0)
      .map((p) => p.pitchHz);

    const refPitches = refSample.contour
      .filter((p) => p.isVoiced && p.pitchHz > 0)
      .map((p) => p.pitchHz);

    if (userPitches.length < 5 || refPitches.length < 5) {
      return {
        score: null,
        isCalculable: false,
        reason: 'Số lượng khung âm thanh có cao độ quá ít để so sánh chính xác.',
        educationalNote,
      };
    }

    // 4. Chuẩn hóa cao độ sang đơn vị Bán Âm (Semitones) tương đối với trung vị (Median F0)
    // s(t) = 12 * log2(F0(t) / F0_median)
    // Phương pháp này loại bỏ hoàn toàn sự khác biệt giữa giọng nam (trầm), giọng nữ và học sinh (cao)
    const userMedian = this.calculateMedian(userPitches);
    const refMedian = this.calculateMedian(refPitches);

    const userSemitones = userPitches.map((f) => 12 * Math.log2(f / userMedian));
    const refSemitones = refPitches.map((f) => 12 * Math.log2(f / refMedian));

    // 5. Chuẩn hóa thời gian: Nội suy tuyến tính cả 2 đường về cùng K = 35 điểm thời gian
    const K = 35;
    const normUser = this.resampleArray(userSemitones, K);
    const normRef = this.resampleArray(refSemitones, K);

    // 6. Tính Shape Similarity (Hệ số tương quan Pearson r)
    const shapeSimilarity = this.calculatePearsonCorrelation(normUser, normRef);

    // 7. Tính Trend/Slope Similarity (Chiều hướng tăng/giảm từ đầu đến cuối)
    const userSlope = normUser[K - 1] - normUser[0];
    const refSlope = normRef[K - 1] - normRef[0];
    const slopeDiff = Math.abs(userSlope - refSlope);
    // Nếu độ lệch độ dốc trong vòng 3 bán âm thì điểm cao
    const trendSimilarity = Math.max(0, Math.min(100, Math.round(100 - slopeDiff * 14)));

    // 8. Tính DTW Similarity trên chuỗi bán âm
    const dtwDistance = this.calculateDTWDistance(normUser, normRef);
    const dtwSimilarity = Math.max(0, Math.min(100, Math.round(100 - (dtwDistance / K) * 25)));

    // 9. Tính điểm tổng hợp qua công thức riêng
    const finalScore = computeF0ScoreFormula(shapeSimilarity, trendSimilarity, dtwSimilarity);

    return {
      score: finalScore,
      isCalculable: true,
      breakdown: {
        shapeSimilarity,
        trendSimilarity,
        dtwSimilarity,
      },
      educationalNote,
    };
  }

  /**
   * Tính trung vị (Median) của mảng số
   */
  private static calculateMedian(values: number[]): number {
    if (values.length === 0) return 220;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Nội suy mảng về độ dài cố định K bằng phép nội suy tuyến tính (Linear Interpolation)
   */
  private static resampleArray(source: number[], targetLength: number): number[] {
    if (source.length === 0) return new Array(targetLength).fill(0);
    if (source.length === 1) return new Array(targetLength).fill(source[0]);

    const result: number[] = [];
    for (let i = 0; i < targetLength; i++) {
      const position = (i / (targetLength - 1)) * (source.length - 1);
      const lowIndex = Math.floor(position);
      const highIndex = Math.ceil(position);
      const fraction = position - lowIndex;

      const interpolated =
        source[lowIndex] * (1 - fraction) + source[highIndex] * fraction;
      result.push(interpolated);
    }
    return result;
  }

  /**
   * Tính hệ số tương quan Pearson giữa 2 chuỗi và quy đổi sang thang điểm 0-100
   */
  private static calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 50;

    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
    }
    const meanX = sumX / n;
    const meanY = sumY / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    const denominator = Math.sqrt(denomX * denomY);
    if (denominator === 0) {
      // Cả 2 chuỗi đều là đường nằm ngang phẳng tuyệt đối (như thanh ngang chuẩn)
      const diff = Math.abs(meanX - meanY);
      return diff < 1.0 ? 95 : 70;
    }

    const r = numerator / denominator; // [-1, 1]
    // Quy đổi r từ [-1, 1] sang [0, 100] với hệ số tập trung
    const scaled = Math.max(0, Math.min(100, Math.round(((r + 1) / 2) * 100)));
    return scaled;
  }

  /**
   * Tính khoảng cách Dynamic Time Warping (DTW) giữa 2 chuỗi
   */
  private static calculateDTWDistance(x: number[], y: number[]): number {
    const n = x.length;
    const m = y.length;
    const dtw: number[][] = Array.from({ length: n + 1 }, () =>
      new Array(m + 1).fill(Infinity)
    );

    dtw[0][0] = 0;

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const cost = Math.abs(x[i - 1] - y[j - 1]);
        dtw[i][j] =
          cost +
          Math.min(
            dtw[i - 1][j], // Insertion
            dtw[i][j - 1], // Deletion
            dtw[i - 1][j - 1] // Match
          );
      }
    }

    return dtw[n][m];
  }
}
