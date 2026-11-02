/**
 * VietTone AI - Vietnamese Acoustic Phonetic Tone Classifier (Bộ phân loại âm vị học F0)
 * 
 * Phân tích hình thái đường cong cao độ F0 (Pitch Contour Morphology) và các đặc trưng
 * thời gian/năng lượng chuẩn của 6 thanh điệu tiếng Việt:
 * 1. Thanh ngang (Level / Mid-High Flat): Bằng phẳng, biên độ dao động hẹp, độ lệch chuẩn nhỏ.
 * 2. Thanh sắc (High Rising): Bắt đầu trung bình, vút mạnh lên cao, đỉnh ở cuối âm tiết.
 * 3. Thanh huyền (Low Falling): Bắt đầu trung bình/thấp, thoải đều xuống thấp, đường đi mượt mà.
 * 4. Thanh hỏi (Dipping-Rising): Hạ thấp ở nửa đầu, võng xuống rồi ngóc lên ở nửa sau.
 * 5. Thanh ngã (High Broken-Rising): Dải cao độ rộng, có khựng/gãy thanh môn rồi vút lên rất cao.
 * 6. Thanh nặng (Short Drop / Glottalized): Rơi nhanh xuống thấp, thời lượng ngắn, ngắt đột ngột.
 */

import { F0ContourData } from '../types';

export interface AcousticToneScore {
  toneProbabilities: Record<string, number>;
  topTone: string;
  confidence: number;
  features: {
    meanPitchHz: number;
    startPitchHz: number;
    endPitchHz: number;
    minPitchHz: number;
    maxPitchHz: number;
    pitchSlopeHzPerSec: number;
    pitchRangeHz: number;
    pitchDeltaHz: number;
    dipDepthHz: number;
    riseFromDipHz: number;
    dipPositionRatio: number;
    voicedDurationMs: number;
  };
  phoneticDiagnostic: string;
}

export class AcousticToneClassifier {
  /**
   * Phân loại thanh điệu dựa trên đặc trưng hình thái F0 từ dữ liệu YIN
   */
  public static classifyContour(contour: F0ContourData): AcousticToneScore {
    const toneKeys = [
      'Thanh ngang',
      'Thanh sắc',
      'Thanh huyền',
      'Thanh hỏi',
      'Thanh ngã',
      'Thanh nặng',
    ];

    // Mặc định phân phối đều nếu không có dữ liệu F0 đáng tin cậy
    const defaultDistribution: Record<string, number> = {
      'Thanh ngang': 0.166,
      'Thanh sắc': 0.167,
      'Thanh huyền': 0.166,
      'Thanh hỏi': 0.167,
      'Thanh ngã': 0.167,
      'Thanh nặng': 0.167,
    };

    const emptyFeatures = {
      meanPitchHz: 0,
      startPitchHz: 0,
      endPitchHz: 0,
      minPitchHz: 0,
      maxPitchHz: 0,
      pitchSlopeHzPerSec: 0,
      pitchRangeHz: 0,
      pitchDeltaHz: 0,
      dipDepthHz: 0,
      riseFromDipHz: 0,
      dipPositionRatio: 0,
      voicedDurationMs: 0,
    };

    if (!contour.isReliable || contour.points.length === 0) {
      return {
        toneProbabilities: defaultDistribution,
        topTone: 'Thanh ngang',
        confidence: 0.167,
        features: emptyFeatures,
        phoneticDiagnostic: 'Đường F0 chưa đủ dữ liệu hoặc không đáng tin cậy để phân loại âm vị.',
      };
    }

    const voicedPoints = contour.points.filter((p) => p.isVoiced && p.pitchHz > 0);
    if (voicedPoints.length < 5) {
      return {
        toneProbabilities: defaultDistribution,
        topTone: 'Thanh ngang',
        confidence: 0.167,
        features: emptyFeatures,
        phoneticDiagnostic: 'Số khung âm thanh có cao độ quá ít.',
      };
    }

    const pitches = voicedPoints.map((p) => p.pitchHz);
    const n = pitches.length;

    // 1. Trích xuất đặc trưng hình thái đường cong
    const segLen = Math.max(2, Math.floor(n * 0.25));
    const startSegment = pitches.slice(0, segLen);
    const endSegment = pitches.slice(-segLen);

    const startPitchHz = Math.round(startSegment.reduce((a, b) => a + b, 0) / startSegment.length);
    const endPitchHz = Math.round(endSegment.reduce((a, b) => a + b, 0) / endSegment.length);
    const minPitchHz = Math.min(...pitches);
    const maxPitchHz = Math.max(...pitches);
    const pitchRangeHz = maxPitchHz - minPitchHz;
    const pitchDeltaHz = endPitchHz - startPitchHz; // >0 là đi lên, <0 là đi xuống

    // Tìm điểm trũng (dip / valley)
    let minIdx = 0;
    for (let i = 1; i < n; i++) {
      if (pitches[i] < pitches[minIdx]) minIdx = i;
    }
    const dipPositionRatio = minIdx / Math.max(1, n - 1); // Vị trí điểm thấp nhất (0.0 -> 1.0)
    const dipDepthHz = Math.max(0, startPitchHz - minPitchHz);
    const riseFromDipHz = Math.max(0, endPitchHz - minPitchHz);

    // Thời lượng phần có tiếng nói (ms)
    const firstPointTime = voicedPoints[0].timeMs;
    const lastPointTime = voicedPoints[voicedPoints.length - 1].timeMs;
    const voicedDurationMs = Math.max(80, lastPointTime - firstPointTime);

    // Độ lệch chuẩn cao độ (Standard deviation)
    const mean = contour.meanPitchHz || pitches.reduce((a, b) => a + b, 0) / n;
    const variance = pitches.reduce((acc, p) => acc + (p - mean) * (p - mean), 0) / n;
    const stdDev = Math.sqrt(variance);

    const features = {
      meanPitchHz: contour.meanPitchHz,
      startPitchHz,
      endPitchHz,
      minPitchHz,
      maxPitchHz,
      pitchSlopeHzPerSec: contour.pitchSlopeHzPerSec,
      pitchRangeHz,
      pitchDeltaHz,
      dipDepthHz,
      riseFromDipHz,
      dipPositionRatio,
      voicedDurationMs,
    };

    // 2. Chấm điểm tương thích (Likelihood scoring) cho từng thanh
    const rawScores: Record<string, number> = {
      'Thanh ngang': 0.1,
      'Thanh sắc': 0.1,
      'Thanh huyền': 0.1,
      'Thanh hỏi': 0.1,
      'Thanh ngã': 0.1,
      'Thanh nặng': 0.1,
    };

    // --- A. Thanh ngang (Bằng phẳng, range nhỏ, delta nhỏ, stdDev nhỏ) ---
    let ngangScore = 0.15;
    if (Math.abs(pitchDeltaHz) <= 15 && pitchRangeHz <= 28) {
      ngangScore += 0.55;
    } else if (Math.abs(pitchDeltaHz) <= 22 && pitchRangeHz <= 35) {
      ngangScore += 0.35;
    }
    if (stdDev <= 10) ngangScore += 0.20;
    if (voicedDurationMs >= 220) ngangScore += 0.10;
    // Phạt nếu có độ dốc quá lớn hoặc trũng sâu
    if (Math.abs(pitchDeltaHz) > 30 || dipDepthHz > 25) ngangScore *= 0.2;
    rawScores['Thanh ngang'] = ngangScore;

    // --- B. Thanh sắc (Đi lên rõ rệt, end > start, delta > +20, đỉnh ở cuối) ---
    let sacScore = 0.15;
    if (pitchDeltaHz >= 25) {
      sacScore += 0.55;
      if (pitchDeltaHz >= 40) sacScore += 0.20;
    } else if (pitchDeltaHz >= 15) {
      sacScore += 0.30;
    }
    if (contour.pitchSlopeHzPerSec > 35) sacScore += 0.20;
    // Nếu đỉnh cao nhất nằm ở 35% cuối
    const maxIdx = pitches.indexOf(maxPitchHz);
    if (maxIdx >= Math.floor(n * 0.60)) sacScore += 0.15;
    // Phạt nếu rơi xuống
    if (pitchDeltaHz < -10) sacScore *= 0.1;
    rawScores['Thanh sắc'] = sacScore;

    // --- C. Thanh huyền (Hạ dần đều, start > end, delta < -18, dốc âm) ---
    let huyenScore = 0.15;
    if (pitchDeltaHz <= -20) {
      huyenScore += 0.50;
      if (pitchDeltaHz <= -35) huyenScore += 0.20;
    } else if (pitchDeltaHz <= -12) {
      huyenScore += 0.28;
    }
    if (contour.pitchSlopeHzPerSec < -25) huyenScore += 0.20;
    if (voicedDurationMs >= 200) huyenScore += 0.15; // Thanh huyền kéo dài hơn thanh nặng
    // Phạt nếu vút lên hoặc quá ngắn
    if (pitchDeltaHz > 15) huyenScore *= 0.1;
    if (voicedDurationMs < 160) huyenScore *= 0.5;
    rawScores['Thanh huyền'] = huyenScore;

    // --- D. Thanh hỏi (Hình võng / Dip: xuống ở giữa rồi ngóc lên ở cuối) ---
    let hoiScore = 0.15;
    const isDipInMiddle = dipPositionRatio >= 0.25 && dipPositionRatio <= 0.80;
    if (isDipInMiddle && dipDepthHz >= 14 && riseFromDipHz >= 12) {
      hoiScore += 0.65;
      if (dipDepthHz >= 20 && riseFromDipHz >= 18) hoiScore += 0.25;
    } else if (isDipInMiddle && dipDepthHz >= 10 && riseFromDipHz >= 8) {
      hoiScore += 0.35;
    }
    // Thanh hỏi thường có độ dài tương đối
    if (voicedDurationMs >= 220) hoiScore += 0.10;
    // Phạt nếu chỉ dốc thẳng một chiều không có võng
    if (!isDipInMiddle || riseFromDipHz < 6) hoiScore *= 0.3;
    rawScores['Thanh hỏi'] = hoiScore;

    // --- E. Thanh ngã (Vút cao, biên độ cực lớn > 45Hz, hoặc có gãy rồi bay lên cao) ---
    let ngaScore = 0.15;
    if (pitchDeltaHz >= 25 && pitchRangeHz >= 45) {
      ngaScore += 0.60;
      if (pitchRangeHz >= 60) ngaScore += 0.20;
    } else if (pitchDeltaHz >= 18 && pitchRangeHz >= 35) {
      ngaScore += 0.35;
    }
    // Thanh ngã thường đạt tần số cao nhất trong các thanh
    if (maxPitchHz > mean * 1.18) ngaScore += 0.15;
    // Phạt nếu đi xuống hoặc quá phẳng
    if (pitchDeltaHz < 0 || pitchRangeHz < 20) ngaScore *= 0.1;
    rawScores['Thanh ngã'] = ngaScore;

    // --- F. Thanh nặng (Rơi nhanh, thời lượng ngắn < 230ms, ngắt âm thanh môn) ---
    let nangScore = 0.15;
    if (pitchDeltaHz <= -15 && voicedDurationMs <= 240) {
      nangScore += 0.55;
      if (voicedDurationMs <= 180) nangScore += 0.25;
    } else if (pitchDeltaHz <= -10 && voicedDurationMs <= 280) {
      nangScore += 0.35;
    }
    // Phạt nếu kéo dài hoặc đi lên
    if (voicedDurationMs > 320) nangScore *= 0.3;
    if (pitchDeltaHz > 10) nangScore *= 0.1;
    rawScores['Thanh nặng'] = nangScore;

    // 3. Chuẩn hóa xác suất (Softmax / Normalization) về tổng 1.0
    let totalScore = 0;
    for (const k of toneKeys) {
      rawScores[k] = Math.max(0.01, rawScores[k]);
      totalScore += rawScores[k];
    }

    const toneProbabilities: Record<string, number> = {};
    let topTone = 'Thanh ngang';
    let topConfidence = 0;

    for (const k of toneKeys) {
      const prob = Math.round((rawScores[k] / totalScore) * 1000) / 1000;
      toneProbabilities[k] = prob;
      if (prob > topConfidence) {
        topConfidence = prob;
        topTone = k;
      }
    }

    // 4. Tạo mô tả nhận định âm vị học
    let diagnostic = '';
    if (topTone === 'Thanh sắc') {
      diagnostic = `Cao độ vút lên rõ (+${pitchDeltaHz}Hz, độ dốc ${contour.pitchSlopeHzPerSec}Hz/s), phù hợp đặc trưng thanh sắc.`;
    } else if (topTone === 'Thanh huyền') {
      diagnostic = `Cao độ thoải đều xuống (-${Math.abs(pitchDeltaHz)}Hz), ngân dài êm ái, phù hợp đặc trưng thanh huyền.`;
    } else if (topTone === 'Thanh ngang') {
      diagnostic = `Đường cao độ bằng phẳng (biến thiên chỉ ${pitchRangeHz}Hz), ổn định ở âm vực giữa.`;
    } else if (topTone === 'Thanh hỏi') {
      diagnostic = `Đường cao độ trũng xuống ở giữa (-${dipDepthHz}Hz) rồi ngóc lên (+${riseFromDipHz}Hz), đặc trưng hình võng của thanh hỏi.`;
    } else if (topTone === 'Thanh ngã') {
      diagnostic = `Dải âm biến thiên rất rộng (${pitchRangeHz}Hz) và vút lên cực đại, đặc trưng thanh ngã.`;
    } else if (topTone === 'Thanh nặng') {
      diagnostic = `Âm tiết ngắn (${voicedDurationMs}ms), cao độ rơi nhanh rồi ngắt, đặc trưng thanh nặng.`;
    }

    return {
      toneProbabilities,
      topTone,
      confidence: topConfidence,
      features,
      phoneticDiagnostic: diagnostic,
    };
  }
}
