/**
 * VietTone AI - Hybrid Tone Decision Engine (Mô hình Lai Teachable Machine + Âm vị học F0)
 * 
 * Kết hợp thông minh giữa 2 nguồn tín hiệu độc lập:
 * 1. Mạng nơ-ron Teachable Machine (@tensorflow-models/speech-commands): Đánh giá phổ năng lượng âm thanh tổng thể.
 * 2. Bộ phân loại âm vị học F0 (Acoustic Phonetic Tone Classifier): Đánh giá quy luật biến thiên cao độ cơ bản và thời lượng.
 * 
 * Lợi ích:
 * - Triệt tiêu lỗi nhầm lẫn do lệch tần số cơ bản giữa giọng nam và giọng nữ.
 * - Phát hiện mâu thuẫn vật lý (ví dụ: F0 dốc lên mạnh nhưng TM đoán thanh huyền -> tự động điều chỉnh chính xác).
 * - Củng cố độ tin cậy khi cả 2 hệ thống đều đồng thuận.
 */

import { F0ContourData } from '../types';
import { AcousticToneScore, AcousticToneClassifier } from './acousticToneClassifier';

export interface HybridDecisionResult {
  combinedScores: Record<string, number>;
  topTone: string;
  topScore: number;
  tmTopTone: string | null;
  tmTopScore: number;
  acousticTopTone: string;
  acousticTopScore: number;
  isAiConfident: boolean;
  agreementStatus: 'full_agreement' | 'acoustic_corrected' | 'tm_dominant' | 'balanced';
  explanation: string;
  acousticAnalysis: AcousticToneScore;
}

export class HybridToneEngine {
  /**
   * Tính toán kết quả lai giữa Teachable Machine và Phân tích âm vị học F0
   */
  public static evaluateHybrid(
    tmScores: Record<string, number>,
    userContour: F0ContourData | null
  ): HybridDecisionResult {
    const toneKeys = [
      'Thanh ngang',
      'Thanh sắc',
      'Thanh huyền',
      'Thanh hỏi',
      'Thanh ngã',
      'Thanh nặng',
    ];

    // 1. Tìm Top-1 và Top-2 của Teachable Machine
    const sortedTm = toneKeys
      .map((k) => ({ tone: k, score: tmScores[k] || 0 }))
      .sort((a, b) => b.score - a.score);

    const tmTopTone = sortedTm[0]?.score > 0 ? sortedTm[0].tone : null;
    const tmTopScore = sortedTm[0]?.score || 0;
    const tmSecondScore = sortedTm[1]?.score || 0;

    // 2. Chạy bộ phân loại âm vị học F0
    const acousticRes = userContour
      ? AcousticToneClassifier.classifyContour(userContour)
      : AcousticToneClassifier.classifyContour({
          points: [],
          durationMs: 0,
          meanPitchHz: 0,
          minPitchHz: 0,
          maxPitchHz: 0,
          pitchRangeHz: 0,
          pitchSlopeHzPerSec: 0,
          isReliable: false,
          voicedFramesCount: 0,
          totalFramesCount: 0,
        });

    const acousticTopTone = acousticRes.topTone;
    const acousticTopScore = acousticRes.confidence;

    // 3. Quyết định trọng số kết hợp (Weighting Strategy)
    let tmWeight = 0.45;
    let acousticWeight = 0.55;
    let isAcousticCorrected = false;

    if (!userContour || !userContour.isReliable) {
      // Nếu F0 không tin cậy -> ưu tiên Teachable Machine
      tmWeight = 0.85;
      acousticWeight = 0.15;
    } else {
      // Kiểm tra mâu thuẫn vật lý rõ rệt giữa đường F0 thực tế và dự đoán TM:
      const { pitchDeltaHz, pitchSlopeHzPerSec } = acousticRes.features;

      // TH1: F0 dốc lên mạnh (Delta > +22Hz hoặc Slope > +25Hz/s) mà TM đoán là Thanh huyền hoặc Thanh nặng
      const isRisingAcoustic = pitchDeltaHz >= 22 || pitchSlopeHzPerSec >= 25;
      const isFallingTm = tmTopTone === 'Thanh huyền' || tmTopTone === 'Thanh nặng';
      if (isRisingAcoustic && isFallingTm) {
        // TM bị sai do lệch pitch baseline -> Ưu tiên F0 tuyệt đối
        acousticWeight = 0.80;
        tmWeight = 0.20;
        isAcousticCorrected = true;
      }

      // TH2: F0 dốc xuống mạnh (Delta < -20Hz) mà TM đoán là Thanh sắc hoặc Thanh ngã
      const isFallingAcoustic = pitchDeltaHz <= -20 || pitchSlopeHzPerSec <= -25;
      const isRisingTm = tmTopTone === 'Thanh sắc' || tmTopTone === 'Thanh ngã';
      if (isFallingAcoustic && isRisingTm) {
        acousticWeight = 0.80;
        tmWeight = 0.20;
        isAcousticCorrected = true;
      }

      // TH3: TM có độ tự tin thấp (<0.40) -> Tăng trọng số cho F0
      if (tmTopScore < 0.40) {
        acousticWeight = 0.70;
        tmWeight = 0.30;
      }
    }

    // 4. Tính điểm tổng hợp (Weighted Fusion)
    const combinedScores: Record<string, number> = {};
    let sumCombined = 0;

    for (const key of toneKeys) {
      const tmPart = tmScores[key] || 0.01;
      const acPart = acousticRes.toneProbabilities[key] || 0.01;
      const fused = tmPart * tmWeight + acPart * acousticWeight;
      combinedScores[key] = fused;
      sumCombined += fused;
    }

    // Chuẩn hóa về tổng = 1.0
    let topTone = 'Thanh ngang';
    let topScore = 0;

    for (const key of toneKeys) {
      const normalized = Math.round((combinedScores[key] / sumCombined) * 1000) / 1000;
      combinedScores[key] = normalized;
      if (normalized > topScore) {
        topScore = normalized;
        topTone = key;
      }
    }

    // 5. Đánh giá mức độ đồng thuận và thông điệp giải thích
    let agreementStatus: HybridDecisionResult['agreementStatus'] = 'balanced';
    let explanation = '';

    if (tmTopTone === acousticTopTone && tmTopTone !== null) {
      agreementStatus = 'full_agreement';
      explanation = `Cả mô hình Teachable Machine và phân tích F0 đều đồng thuận xác định ${topTone}.`;
    } else if (isAcousticCorrected) {
      agreementStatus = 'acoustic_corrected';
      explanation = `Bộ phân loại F0 đã hiệu chỉnh chính xác ${topTone} dựa trên đặc trưng vật lý âm thanh (triệt tiêu sai lệch do cao độ cá nhân).`;
    } else if (!userContour?.isReliable) {
      agreementStatus = 'tm_dominant';
      explanation = `Ưu tiên mô hình Teachable Machine do đường cao độ F0 lẫn tạp âm hoặc quá ngắn.`;
    } else {
      agreementStatus = 'balanced';
      explanation = `Kết hợp đa chiều giữa phổ tần số Teachable Machine và xu hướng cao độ F0.`;
    }

    // Đánh giá AI chắc chắn: top1 >= 0.65 và margin >= 0.15
    const sortedCombined = Object.values(combinedScores).sort((a, b) => b - a);
    const topMargin = sortedCombined[0] - (sortedCombined[1] || 0);
    const isAiConfident = topScore >= 0.65 && topMargin >= 0.14;

    return {
      combinedScores,
      topTone,
      topScore,
      tmTopTone,
      tmTopScore,
      acousticTopTone,
      acousticTopScore,
      isAiConfident,
      agreementStatus,
      explanation,
      acousticAnalysis: acousticRes,
    };
  }
}
