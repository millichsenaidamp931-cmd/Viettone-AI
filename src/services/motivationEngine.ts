/**
 * VietTone Motivation Engine – Người bạn đồng hành luyện tiếng Việt (v2.1)
 * 
 * Hệ thống tạo động lực thông minh dựa trên luật (Rule-based), tuyệt đối không dùng
 * dữ liệu giả hoặc Gemini API.
 * 
 * Tuân thủ nghiêm ngặt các nguyên tắc sư phạm:
 * 1. Không kết luận người học phát âm đúng chỉ vì AI dự đoán có độ tin cậy cao.
 * 2. Không coi việc AI chưa chắc chắn là thất bại của người học.
 * 3. Điểm F0 cải thiện chỉ so sánh khi 2 lượt cùng thanh, cùng mẫu chuẩn, tăng >= 5 điểm.
 * 4. Ngôn từ ấm áp, tôn trọng, khuyến khích sự kiên trì theo tinh thần giáo dục tích cực.
 */

import { PracticeAttempt, MotivationMessage, StreakInfo, ToneItem } from '../types';

export class MotivationEngine {
  /**
   * Tạo thông điệp chào mừng / sẵn sàng trước khi ghi âm
   */
  public static getReadyMessage(targetTone: ToneItem, streakInfo: StreakInfo): MotivationMessage {
    if (streakInfo.currentStreak >= 2) {
      return {
        state: 'ready',
        headline: `Bạn đang có chuỗi ${streakInfo.currentStreak} ngày bền bỉ!`,
        subtext: `Cùng Bé Lạc luyện từ "${targetTone.word}" (${targetTone.name.toLowerCase()}) để giữ vững ngọn lửa học tập nhé!`,
        mascotMood: 'ready',
        celebrate: false,
      };
    }

    return {
      state: 'ready',
      headline: `Sẵn sàng luyện từ "${targetTone.word}" nào!`,
      subtext: `Hãy bấm "Nghe mẫu" rồi nhấn mic và phát âm to rõ từ "${targetTone.word}" (${targetTone.name.toLowerCase()}) nhé!`,
      mascotMood: 'ready',
      celebrate: false,
    };
  }

  /**
   * Đánh giá và chọn thông điệp động viên tối ưu sau mỗi lượt luyện tập
   */
  public static evaluateAttempt(
    currentAttempt: PracticeAttempt,
    allAttempts: PracticeAttempt[], // Danh sách đã bao gồm currentAttempt ở vị trí đầu [0]
    streakInfo: StreakInfo
  ): MotivationMessage {
    const totalCount = allAttempts.length;

    // A. Người học hoàn thành lượt đầu tiên
    if (totalCount === 1) {
      return {
        state: 'first_attempt',
        headline: 'Khởi đầu tuyệt vời! Mỗi lần luyện là một bước tiến.',
        subtext: 'Bạn vừa hoàn thành lượt luyện đầu tiên. Hãy bấm "Nghe mẫu" và cùng luyện tiếp các thanh tiếp theo nhé!',
        mascotMood: 'excited',
        celebrate: true,
      };
    }

    // F. Luyện tập 3 ngày liên tiếp (đạt mốc streak 3 ngày)
    // Kiểm tra xem lượt này có đưa streak lên 3 ngày hay không
    if (streakInfo.currentStreak === 3 && streakInfo.isActiveToday) {
      // Chỉ kích hoạt thông điệp này nếu là lượt đầu tiên hoặc các lượt hôm nay
      const todayAttempts = allAttempts.filter((a) => a.dateStr === currentAttempt.dateStr);
      if (todayAttempts.length <= 2) {
        return {
          state: 'three_day_streak',
          headline: 'Ba ngày bền bỉ! Bạn đang tạo nên một thói quen học tập tốt.',
          subtext: 'Luyện tập đều đặn hàng ngày là bí quyết tự nhiên nhất để đôi tai và thanh quản làm quen với thanh điệu tiếng Việt.',
          mascotMood: 'cheering',
          celebrate: true,
        };
      }
    }

    // E. Hoàn thành đúng 10 lượt luyện
    if (totalCount === 10) {
      return {
        state: 'ten_attempts',
        headline: 'Bạn đã hoàn thành 10 lượt luyện! Sự kiên trì rất đáng tự hào.',
        subtext: 'Sự kiên nhẫn luyện từng thanh sẽ giúp bạn tự tin hơn rất nhiều khi giao tiếp thực tế.',
        mascotMood: 'proud',
        celebrate: true,
      };
    }

    // G. Người học luyện nhiều lần nhưng AI vẫn chưa chắc chắn
    // Kiểm tra trong các lượt gần đây của cùng thanh mục tiêu (>= 3 lượt gần nhất đều không chắc chắn hoặc không khớp)
    const sameToneRecent = allAttempts
      .filter((a) => a.targetToneId === currentAttempt.targetToneId)
      .slice(0, 4);

    if (
      sameToneRecent.length >= 3 &&
      sameToneRecent.every((a) => !a.isAiConfident || !a.isMatch)
    ) {
      return {
        state: 'repeated_uncertain',
        headline: 'Bạn đã rất kiên trì. Hãy nghỉ một chút, nghe lại mẫu và thử khi sẵn sàng nhé!',
        subtext: 'Các thanh điệu tiếng Việt (đặc biệt thanh hỏi, ngã, nặng) có sự ngắt âm và đổi hướng cao độ độc đáo. Hãy nghe mẫu thật chậm và thả lỏng cơ miệng.',
        mascotMood: 'comforting',
        celebrate: false,
      };
    }

    // D. Điểm F0 được cải thiện (tăng >= 5 điểm so với lượt hợp lệ trước đó của CÙNG thanh)
    if (typeof currentAttempt.f0Score === 'number' && currentAttempt.f0Score >= 0) {
      // Tìm lượt hợp lệ trước đó của cùng thanh
      const previousSameTone = allAttempts.slice(1).find(
        (a) =>
          a.targetToneId === currentAttempt.targetToneId &&
          typeof a.f0Score === 'number' &&
          a.f0Score >= 0
      );

      if (previousSameTone && typeof previousSameTone.f0Score === 'number') {
        const delta = currentAttempt.f0Score - previousSameTone.f0Score;
        if (delta >= 5) {
          return {
            state: 'f0_improved',
            headline: 'Tuyệt vời! Đường cao độ của bạn đang gần với mẫu hơn lần trước!',
            subtext: `Mức tương đồng đường cao độ F0 tăng +${delta} điểm (từ ${previousSameTone.f0Score} lên ${currentAttempt.f0Score}/100) so với lượt trước!`,
            f0Delta: delta,
            prevScore: previousSameTone.f0Score,
            currentScore: currentAttempt.f0Score,
            mascotMood: 'excited',
            celebrate: true,
          };
        }
      }
    }

    // B. AI nhận diện rõ thanh mục tiêu
    // Khi AI dự đoán trùng thanh mục tiêu và kết quả đạt ngưỡng tin cậy
    if (currentAttempt.isMatch && currentAttempt.isAiConfident) {
      return {
        state: 'ai_recognized',
        headline: 'AI đã nhận ra thanh bạn đang luyện. Hãy duy trì nhé!',
        subtext: `Đặc trưng âm điệu của từ "${currentAttempt.targetWord}" (${currentAttempt.targetToneName.toLowerCase()}) được mô hình nhận diện rõ ràng với độ tin cậy ${Math.round(currentAttempt.confidence * 100)}%.`,
        mascotMood: 'cheering',
        celebrate: true,
      };
    }

    // C. AI chưa chắc chắn (không xem trường hợp này là thất bại)
    return {
      state: 'ai_uncertain',
      headline: 'Không sao, chúng mình nghe lại mẫu chuẩn rồi thử thêm một lần nhé!',
      subtext: 'Hãy bấm nút "Nghe mẫu", chú ý kéo dài nguyên âm và giữ khoảng cách micro đều đặn để thử lại nào.',
      mascotMood: 'comforting',
      celebrate: false,
    };
  }
}
