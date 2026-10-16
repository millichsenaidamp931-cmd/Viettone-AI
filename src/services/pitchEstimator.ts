/**
 * VietTone AI - Pitch Estimation Engine (Thuật toán ước lượng cao độ cơ bản F0)
 * 
 * Sử dụng giải thuật YIN cải tiến với CMNDF (Cumulative Mean Normalized Difference)
 * kết hợp Parabolic Interpolation và 3-point Median Filtering.
 * Phù hợp hoàn hảo với ngữ âm học tiếng Việt (dải F0 từ 80Hz đến 600Hz).
 */

import { F0ContourData, PitchPoint } from '../types';
import { PRED_CONFIG } from '../config';

export class PitchEstimator {
  /**
   * Phân tích cao độ F0 từ toàn bộ mảng mẫu âm thanh (Float32Array) thu thập được
   */
  public static extractF0Contour(
    audioBuffer: Float32Array,
    sampleRate: number,
    options?: {
      frameSize?: number;
      hopSize?: number;
    }
  ): F0ContourData {
    const frameSize = options?.frameSize || 2048;
    const hopSize = options?.hopSize || 512; // ~11.6ms tại 44.1kHz

    const points: PitchPoint[] = [];
    const minLag = Math.floor(sampleRate / PRED_CONFIG.F0_MAX_HZ); // max ~600Hz
    const maxLag = Math.floor(sampleRate / PRED_CONFIG.F0_MIN_HZ); // min ~80Hz

    let voicedCount = 0;
    let totalFrames = 0;
    let totalClarity = 0;

    const totalSamples = audioBuffer.length;
    if (totalSamples < frameSize) {
      return {
        points: [],
        durationMs: (totalSamples / sampleRate) * 1000,
        meanPitchHz: 0,
        minPitchHz: 0,
        maxPitchHz: 0,
        pitchRangeHz: 0,
        pitchSlopeHzPerSec: 0,
        isReliable: false,
        unreliableReason: 'Âm thanh thu được quá ngắn (dưới 100ms) để trích xuất F0.',
        voicedFramesCount: 0,
        totalFramesCount: 0,
      };
    }

    // 1. Chia khung thời gian và chạy YIN trên từng khung
    for (let offset = 0; offset + frameSize <= totalSamples; offset += hopSize) {
      totalFrames++;
      const timeMs = Math.round((offset / sampleRate) * 1000);
      const frame = audioBuffer.subarray(offset, offset + frameSize);

      // Tính năng lượng RMS của khung
      let sumSquares = 0;
      for (let i = 0; i < frameSize; i++) {
        sumSquares += frame[i] * frame[i];
      }
      const rms = Math.sqrt(sumSquares / frameSize);

      // Nếu dưới ngưỡng năng lượng -> khung câm/unvoiced
      if (rms < PRED_CONFIG.F0_RMS_VOICED_THRESHOLD) {
        points.push({
          timeMs,
          pitchHz: 0,
          clarity: 0,
          isVoiced: false,
        });
        continue;
      }

      // 2. Thuật toán YIN: Bước 1 - Difference function
      const halfSize = Math.floor(frameSize / 2);
      const diff = new Float32Array(maxLag + 1);

      for (let tau = 0; tau <= maxLag; tau++) {
        let sum = 0;
        for (let j = 0; j < halfSize; j++) {
          const delta = frame[j] - frame[j + tau];
          sum += delta * delta;
        }
        diff[tau] = sum;
      }

      // Bước 2: Cumulative Mean Normalized Difference Function (CMNDF)
      const cmndf = new Float32Array(maxLag + 1);
      cmndf[0] = 1;
      let runningSum = 0;

      for (let tau = 1; tau <= maxLag; tau++) {
        runningSum += diff[tau];
        if (runningSum > 0) {
          cmndf[tau] = (diff[tau] * tau) / runningSum;
        } else {
          cmndf[tau] = 1;
        }
      }

      // Bước 3: Absolute Thresholding
      const threshold = 0.20;
      let chosenTau = -1;

      for (let tau = minLag; tau <= maxLag; tau++) {
        if (cmndf[tau] < threshold) {
          while (tau + 1 <= maxLag && cmndf[tau + 1] < cmndf[tau]) {
            tau++;
          }
          chosenTau = tau;
          break;
        }
      }

      // Nếu không vượt threshold, tìm cực tiểu toàn cục tốt nhất trong dải
      if (chosenTau === -1) {
        let minVal = 1.0;
        let bestIdx = -1;
        for (let tau = minLag; tau <= maxLag; tau++) {
          if (cmndf[tau] < minVal) {
            minVal = cmndf[tau];
            bestIdx = tau;
          }
        }
        // Chỉ chấp nhận nếu cực tiểu đủ rõ nét
        if (minVal < 0.45 && bestIdx !== -1) {
          chosenTau = bestIdx;
        }
      }

      if (chosenTau >= minLag && chosenTau <= maxLag) {
        // Bước 4: Parabolic Interpolation quanh chosenTau để đạt độ chính xác sub-sample
        const x0 = chosenTau > minLag ? chosenTau - 1 : chosenTau;
        const x2 = chosenTau < maxLag ? chosenTau + 1 : chosenTau;
        let refinedTau = chosenTau;

        if (x0 !== chosenTau && x2 !== chosenTau) {
          const s0 = cmndf[x0];
          const s1 = cmndf[chosenTau];
          const s2 = cmndf[x2];
          const denom = 2 * (s0 - 2 * s1 + s2);
          if (Math.abs(denom) > 1e-6) {
            refinedTau = chosenTau + (s0 - s2) / denom;
          }
        }

        const pitchHz = sampleRate / refinedTau;
        const clarity = Math.max(0, Math.min(1, 1 - cmndf[chosenTau]));

        if (
          pitchHz >= PRED_CONFIG.F0_MIN_HZ &&
          pitchHz <= PRED_CONFIG.F0_MAX_HZ &&
          clarity >= PRED_CONFIG.F0_CLARITY_THRESHOLD
        ) {
          points.push({
            timeMs,
            pitchHz: Math.round(pitchHz * 10) / 10,
            clarity: Math.round(clarity * 100) / 100,
            isVoiced: true,
          });
          voicedCount++;
          totalClarity += clarity;
        } else {
          points.push({
            timeMs,
            pitchHz: 0,
            clarity: Math.round(clarity * 100) / 100,
            isVoiced: false,
          });
        }
      } else {
        points.push({
          timeMs,
          pitchHz: 0,
          clarity: 0,
          isVoiced: false,
        });
      }
    }

    // 3. Làm mượt chuỗi F0 bằng 3-point Median Filter để triệt tiêu lỗi nhảy quãng tám (octave jump)
    const smoothedPoints = this.applyMedianFilter(points);

    // 4. Lọc các frame có tiếng nói để tính toán thông số thống kê
    const voicedPitches = smoothedPoints
      .filter((p) => p.isVoiced && p.pitchHz > 0)
      .map((p) => p.pitchHz);

    const durationMs = Math.round((totalSamples / sampleRate) * 1000);

    if (voicedPitches.length < PRED_CONFIG.F0_MIN_VOICED_FRAMES) {
      return {
        points: smoothedPoints,
        durationMs,
        meanPitchHz: 0,
        minPitchHz: 0,
        maxPitchHz: 0,
        pitchRangeHz: 0,
        pitchSlopeHzPerSec: 0,
        isReliable: false,
        unreliableReason: 'Giọng đọc quá ngắn hoặc chưa rõ nguyên âm để nhận diện cao độ F0 đáng tin cậy.',
        voicedFramesCount: voicedPitches.length,
        totalFramesCount: totalFrames,
      };
    }

    const avgClarity = totalClarity / Math.max(1, voicedCount);
    if (avgClarity < 0.40) {
      return {
        points: smoothedPoints,
        durationMs,
        meanPitchHz: 0,
        minPitchHz: 0,
        maxPitchHz: 0,
        pitchRangeHz: 0,
        pitchSlopeHzPerSec: 0,
        isReliable: false,
        unreliableReason: 'Tín hiệu có độ rõ cao độ thấp do lẫn tạp âm hoặc âm lượng mic quá nhỏ.',
        voicedFramesCount: voicedPitches.length,
        totalFramesCount: totalFrames,
      };
    }

    // Tính mean, min, max
    const sumP = voicedPitches.reduce((a, b) => a + b, 0);
    const meanPitchHz = Math.round((sumP / voicedPitches.length) * 10) / 10;
    const minPitchHz = Math.round(Math.min(...voicedPitches) * 10) / 10;
    const maxPitchHz = Math.round(Math.max(...voicedPitches) * 10) / 10;
    const pitchRangeHz = Math.round((maxPitchHz - minPitchHz) * 10) / 10;

    // Tính độ dốc (slope) từ 20% đầu đến 20% cuối của phân đoạn voiced
    const segLen = Math.max(2, Math.floor(voicedPitches.length * 0.25));
    const startSegment = voicedPitches.slice(0, segLen);
    const endSegment = voicedPitches.slice(-segLen);
    const startAvg = startSegment.reduce((a, b) => a + b, 0) / startSegment.length;
    const endAvg = endSegment.reduce((a, b) => a + b, 0) / endSegment.length;
    const voicedDurationSec = (voicedPitches.length * hopSize) / sampleRate;
    const pitchSlopeHzPerSec =
      voicedDurationSec > 0 ? Math.round(((endAvg - startAvg) / voicedDurationSec) * 10) / 10 : 0;

    return {
      points: smoothedPoints,
      durationMs,
      meanPitchHz,
      minPitchHz,
      maxPitchHz,
      pitchRangeHz,
      pitchSlopeHzPerSec,
      isReliable: true,
      voicedFramesCount: voicedPitches.length,
      totalFramesCount: totalFrames,
    };
  }

  /**
   * Lọc trung vị 3 điểm (3-point Median Filter) trên các điểm có voiced
   */
  private static applyMedianFilter(points: PitchPoint[]): PitchPoint[] {
    const result: PitchPoint[] = points.map((p) => ({ ...p }));

    for (let i = 1; i < result.length - 1; i++) {
      if (result[i - 1].isVoiced && result[i].isVoiced && result[i + 1].isVoiced) {
        const trio = [result[i - 1].pitchHz, result[i].pitchHz, result[i + 1].pitchHz];
        trio.sort((a, b) => a - b);
        result[i].pitchHz = trio[1]; // Giá trị median
      }
    }

    return result;
  }
}
