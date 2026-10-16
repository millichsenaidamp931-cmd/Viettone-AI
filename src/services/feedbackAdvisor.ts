/**
 * VietTone AI - Feedback & Pedagogical Advice Engine (Tư vấn sư phạm và phản hồi cải thiện)
 * 
 * Tuân thủ nghiêm ngặt các nguyên tắc:
 * 1. Không khẳng định người học phát âm sai chỉ vì AI dự đoán khác thanh mục tiêu.
 * 2. Đánh giá độ tin cậy riêng: Top-1 >= 0.70 và (Top-1 - Top-2) >= 0.15.
 * 3. Nếu chưa chắc chắn hoặc mâu thuẫn AI và F0 -> Hiển thị trạng thái chưa chắc chắn.
 * 4. Phân tích ngữ âm F0 đặc thù:
 *    - Thanh ngang: nếu F0 dao động -> giữ ổn định hơn.
 *    - Thanh sắc: nếu chưa tăng rõ -> nâng cao độ dần về cuối.
 *    - Thanh huyền: nếu chưa giảm rõ -> hạ cao độ dần.
 *    - Thanh hỏi: gợi ý xuống rồi lên khi dữ liệu rõ, không áp đặt phương ngữ.
 *    - Thanh ngã & thanh nặng: lưu ý đặc trưng thanh quản/ngắt âm/thời lượng, không kết luận chỉ bằng F0.
 */

import { ToneItem, F0ContourData, ReferenceToneSample, F0ScoreResult, FeedbackAssessment } from '../types';
import { PRED_CONFIG } from '../config';

export class FeedbackAdvisor {
  /**
   * Hàm đánh giá độ tin cậy riêng biệt của mô hình Teachable Machine
   * @returns { isConfident: boolean, top1Score: number, margin: number }
   */
  public static evaluateAiConfidence(
    probabilities: Record<string, number>,
    topToneName: string | null
  ): {
    isConfident: boolean;
    topToneName: string | null;
    topToneScore: number;
    top2Margin: number;
  } {
    const sorted = Object.entries(probabilities)
      .filter(([k]) => k !== 'Background Noise')
      .sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
      return { isConfident: false, topToneName: null, topToneScore: 0, top2Margin: 0 };
    }

    const top1 = sorted[0];
    const top2 = sorted.length > 1 ? sorted[1] : null;

    const topToneScore = top1[1];
    const top2Score = top2 ? top2[1] : 0;
    const top2Margin = Math.round((topToneScore - top2Score) * 100) / 100;

    const isConfident =
      topToneScore >= PRED_CONFIG.AI_CONFIDENT_TOP1_MIN &&
      top2Margin >= PRED_CONFIG.AI_CONFIDENT_MARGIN_MIN;

    return {
      isConfident,
      topToneName: top1[0],
      topToneScore,
      top2Margin,
    };
  }

  /**
   * Tạo bản đánh giá tổng hợp và lời khuyên cải thiện
   */
  public static generateAssessment(params: {
    targetTone: ToneItem;
    predictedToneName: string | null;
    probabilities: Record<string, number>;
    userContour: F0ContourData | null;
    refSample: ReferenceToneSample | null;
    f0ScoreResult: F0ScoreResult;
  }): FeedbackAssessment {
    const {
      targetTone,
      predictedToneName,
      probabilities,
      userContour,
      refSample,
      f0ScoreResult,
    } = params;

    const { isConfident, topToneScore, top2Margin } = this.evaluateAiConfidence(
      probabilities,
      predictedToneName
    );

    const isF0Reliable = !!userContour?.isReliable;
    const isToneMatched =
      predictedToneName?.trim().toLowerCase() === targetTone.name.trim().toLowerCase();

    // 1. Trường hợp AI chưa đủ chắc chắn hoặc F0 không tin cậy
    if (!isConfident || !isF0Reliable) {
      let adviceText = 'AI chưa nhận diện chắc chắn. Hãy nghe mẫu chuẩn và thử đọc lại.';
      if (!isF0Reliable && userContour?.unreliableReason) {
        adviceText = `${userContour.unreliableReason} Hãy thử lại gần mic và phát âm rõ tiếng hơn.`;
      }

      return {
        targetTone,
        predictedToneName,
        confidence: topToneScore,
        top2Margin,
        isAiConfident: false,
        isF0Reliable,
        f0ScoreResult,
        userContour,
        refSample,
        referenceSample: refSample,
        statusBadge: {
          label: 'Chưa đủ chắc chắn',
          type: 'uncertain',
        },
        headline: 'AI chưa nhận diện chắc chắn. Hãy nghe mẫu chuẩn và thử đọc lại',
        adviceText,
        improvementTip: `Nghe lại âm mẫu của từ "${targetTone.word}" (${targetTone.name}) và phát âm to, rõ ràng hơn vào mic.`,
      };
    }

    // 2. Kiểm tra xung đột giữa kết quả phân loại AI và đường F0
    // Ví dụ: AI nhận diện Thanh sắc, nhưng điểm tương đồng F0 với Thanh sắc lại cực thấp hoặc F0 dốc xuống
    const hasConflict =
      isToneMatched &&
      f0ScoreResult.isCalculable &&
      f0ScoreResult.score !== null &&
      f0ScoreResult.score < 40;

    if (hasConflict) {
      return {
        targetTone,
        predictedToneName,
        confidence: topToneScore,
        top2Margin,
        isAiConfident: true,
        isF0Reliable,
        f0ScoreResult,
        userContour,
        refSample,
        referenceSample: refSample,
        statusBadge: {
          label: 'Cần lắng nghe kỹ hơn',
          type: 'uncertain',
        },
        headline: 'Kết quả có sự khác biệt giữa âm phổ AI và đường cao độ F0',
        adviceText:
          'AI nhận diện gần với thanh mục tiêu nhưng đường cong cao độ F0 dao động khác mẫu chuẩn. Hãy nghe lại âm mẫu để điều chỉnh nhịp đọc.',
        improvementTip: targetTone.guideTip,
      };
    }

    // 3. Phân tích đặc trưng F0 cụ thể theo từng thanh điệu
    const f0Observation = this.analyzeF0Characteristics(targetTone.id, userContour);

    // 4. Trường hợp khớp (Matched)
    if (isToneMatched) {
      const scoreStr =
        f0ScoreResult.isCalculable && f0ScoreResult.score !== null
          ? ` (Độ giống F0: ${f0ScoreResult.score}/100)`
          : '';

      return {
        targetTone,
        predictedToneName,
        confidence: topToneScore,
        top2Margin,
        isAiConfident: true,
        isF0Reliable,
        f0ScoreResult,
        userContour,
        refSample,
        referenceSample: refSample,
        statusBadge: {
          label: 'Rất tốt',
          type: 'success',
        },
        headline: `Phù hợp với thanh ${targetTone.name}${scoreStr}`,
        adviceText: `Bạn đã phát âm từ "${targetTone.word}" rất rõ ràng và sát với ngữ điệu chuẩn của ${targetTone.name.toLowerCase()}.`,
        f0SpecificObservation: f0Observation,
        improvementTip: 'Hãy tiếp tục giữ phong độ này và thử thách các thanh tiếp theo!',
      };
    }

    // 5. Trường hợp AI nhận diện sang thanh khác (Hỗ trợ sư phạm, không khẳng định sai)
    return {
      targetTone,
      predictedToneName,
      confidence: topToneScore,
      top2Margin,
      isAiConfident: true,
      isF0Reliable,
      f0ScoreResult,
      userContour,
      refSample,
      referenceSample: refSample,
      statusBadge: {
        label: 'Gợi ý cải thiện',
        type: 'warning',
      },
      headline: `AI nghe gần giống với ${predictedToneName || 'một thanh khác'}`,
      adviceText: `Bạn đang luyện từ "${targetTone.word}" (${targetTone.name.toLowerCase()}). Có thể đường nét cao độ hoặc cách ngân giọng chưa trùng khớp với mẫu.`,
      f0SpecificObservation: f0Observation,
      improvementTip: targetTone.guideTip,
    };
  }

  /**
   * Phân tích đặc trưng cao độ F0 theo từng quy tắc ngữ âm học
   */
  private static analyzeF0Characteristics(
    toneId: ToneItem['id'],
    userContour: F0ContourData | null
  ): string {
    if (!userContour || !userContour.isReliable) return '';

    const voiced = userContour.points.filter((p) => p.isVoiced && p.pitchHz > 0);
    if (voiced.length < 5) return '';

    const pitches = voiced.map((p) => p.pitchHz);
    const startP = pitches.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const endP = pitches.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const delta = endP - startP;
    const pitchRange = userContour.pitchRangeHz;

    switch (toneId) {
      case 'ngang':
        // Thanh ngang: nếu dao động nhiều (>25Hz) -> giữ ổn định hơn
        if (pitchRange > 25) {
          return 'Quan sát F0: Cao độ giọng có độ chênh lệch dao động. Hãy thả lỏng và giữ hơi thở đều để giọng đi thẳng ngang ổn định.';
        }
        return 'Quan sát F0: Đường cao độ khá bằng phẳng và đều đặn, rất đúng đặc tính thanh ngang.';

      case 'sac':
        // Thanh sắc: nếu không tăng rõ (<20Hz) -> nâng cao độ dần về cuối
        if (delta < 20) {
          return 'Quan sát F0: Giọng chưa có độ vút lên cao rõ rệt ở phần đuôi. Hãy đẩy nhẹ cao độ vút lên cao dần về cuối từ.';
        }
        return 'Quan sát F0: Đường cao độ có xu hướng nâng cao dần về cuối rất tích cực.';

      case 'huyen':
        // Thanh huyền: nếu không giảm rõ (> -15Hz) -> hạ cao độ dần
        if (delta > -15) {
          return 'Quan sát F0: Giọng chưa trầm xuống đều. Hãy thả lỏng cổ họng và nhẹ nhàng hạ giọng xuống thấp dần.';
        }
        return 'Quan sát F0: Đường cao độ hạ dần xuống mức trầm đều đặn.';

      case 'hoi':
        // Thanh hỏi: chỉ gợi ý xuống rồi lên khi dữ liệu rõ; không áp đặt phương ngữ
        return 'Quan sát F0: Thanh hỏi thường có xu hướng trũng xuống rồi lượn nhẹ lên lại (hoặc tuỳ thuộc thói quen phát âm phương ngữ của bạn).';

      case 'nga':
        // Thanh ngã: không kết luận chỉ dựa vào F0 vì còn có ngắt thanh quản (glottalization)
        return 'Quan sát F0 & Ngữ âm: Thanh ngã có đặc trưng ngắt thanh môn (khựng nhẹ ở cổ họng) rồi mới vút lên cao; đường F0 chỉ phản ánh một phần cao độ.';

      case 'nang':
        // Thanh nặng: không kết luận chỉ dựa vào F0 vì có đặc trưng ngắn gọn dứt khoát và thanh môn hóa
        return 'Quan sát F0 & Ngữ âm: Thanh nặng rơi xuống đáy âm vực rất nhanh và ngắt dứt khoát; thời lượng ngắn là yếu tố then chốt bên cạnh F0.';

      default:
        return '';
    }
  }
}
