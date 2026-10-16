/**
 * VietTone AI - Local Storage & Progress Tracking Service
 * 
 * Quản lý lưu trữ tiến trình cá nhân 100% trên trình duyệt (localStorage).
 * Không gửi bất kỳ dữ liệu âm thanh hay lịch sử nào lên máy chủ.
 * Xử lý lỗi an toàn và không tạo dữ liệu giả lập.
 */

import { PracticeAttempt, ToneId, ToneRoadmapStat } from '../types';
import { VIETNAMESE_TONES } from '../data/tones';
import { PRED_CONFIG } from '../config';

const STORAGE_KEY = 'viettone_v2_practice_history';

export class ProgressStorage {
  private static inMemoryFallback: PracticeAttempt[] = [];

  /**
   * Lấy toàn bộ lịch sử các lượt luyện
   */
  public static getAllAttempts(): PracticeAttempt[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [...this.inMemoryFallback];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.sort((a, b) => b.timestamp - a.timestamp);
    } catch (e) {
      console.warn('Không thể đọc dữ liệu từ localStorage, sử dụng bộ nhớ tạm:', e);
      return [...this.inMemoryFallback];
    }
  }

  /**
   * Lưu một lượt luyện mới
   */
  public static saveAttempt(attempt: PracticeAttempt): void {
    try {
      const current = this.getAllAttempts();
      const updated = [attempt, ...current].slice(0, 100); // Giới hạn 100 lượt gần nhất để tối ưu dung lượng
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Lỗi khi ghi vào localStorage, lưu vào inMemoryFallback:', e);
      this.inMemoryFallback = [attempt, ...this.inMemoryFallback].slice(0, 50);
    }
  }

  /**
   * Xóa toàn bộ lịch sử luyện tập
   */
  public static clearHistory(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.inMemoryFallback = [];
      return true;
    } catch (e) {
      console.error('Lỗi khi xóa dữ liệu localStorage:', e);
      return false;
    }
  }

  /**
   * Tính toán thống kê theo 6 thanh điệu
   * Chỉ tính các lượt hợp lệ (có F0 đáng tin cậy hoặc phát âm rõ)
   */
  public static getToneStats(): ToneRoadmapStat[] {
    const attempts = this.getAllAttempts();

    return VIETNAMESE_TONES.map((tone) => {
      const toneAttempts = attempts.filter((a) => a.targetToneId === tone.id);
      const validAttempts = toneAttempts.filter(
        (a) => a.audioQuality === 'good' || a.hasReliableF0
      );

      // Điểm F0 trung bình từ các lượt có điểm hợp lệ
      const f0Scores = validAttempts
        .map((a) => a.f0Score)
        .filter((s): s is number => typeof s === 'number' && s >= 0);

      const avgF0 =
        f0Scores.length > 0
          ? Math.round(f0Scores.reduce((a, b) => a + b, 0) / f0Scores.length)
          : null;

      const matchCount = toneAttempts.filter((a) => a.isMatch).length;
      const matchRatio =
        toneAttempts.length > 0 ? Math.round((matchCount / toneAttempts.length) * 100) : 0;

      // Cần tối thiểu 3 lượt hợp lệ trước khi đưa ra nhận xét sơ bộ
      const hasEnoughData = validAttempts.length >= PRED_CONFIG.MIN_VALID_ATTEMPTS_FOR_DIAGNOSIS;

      let observation = '';
      let recommendedAction = '';

      if (!hasEnoughData) {
        observation = `Đã có ${validAttempts.length}/${PRED_CONFIG.MIN_VALID_ATTEMPTS_FOR_DIAGNOSIS} lượt hợp lệ. Hãy luyện thêm để hệ thống có đủ dữ liệu nhận xét.`;
        recommendedAction = 'Tiếp tục luyện tập thêm các lượt để gom đủ dữ liệu.';
      } else {
        if (tone.id === 'hoi' || tone.id === 'nga' || tone.id === 'nang') {
          observation = `Gợi ý luyện tập dựa trên ${validAttempts.length} lượt: Thanh ${tone.name.toLowerCase()} mang đặc trưng thanh quản/ngắt âm đặc thù.`;
          recommendedAction = 'Ưu tiên bấm "Nghe mẫu" và luyện theo 4 bước chậm rãi.';
        } else if (avgF0 !== null && avgF0 >= 80) {
          observation = `Gợi ý luyện tập dựa trên ${validAttempts.length} lượt: Đường nét cao độ khá tương đồng với mẫu (${avgF0}/100).`;
          recommendedAction = 'Duy trì nhịp phát âm ổn định và chuyển sang các thanh khác.';
        } else if (avgF0 !== null && avgF0 < 65) {
          observation = `Gợi ý luyện tập dựa trên ${validAttempts.length} lượt: Đường cao độ trung bình đạt ${avgF0}/100, cần chú ý độ dốc âm vực.`;
          recommendedAction = `${tone.guideTip}`;
        } else {
          observation = `Gợi ý luyện tập dựa trên ${validAttempts.length} lượt: Đang tiến bộ ổn định (${avgF0 || matchRatio}%).`;
          recommendedAction = 'Đọc chậm rồi đọc lại ở tốc độ tự nhiên.';
        }
      }

      return {
        toneId: tone.id,
        toneName: tone.name,
        word: tone.word,
        totalAttempts: toneAttempts.length,
        validAttempts: validAttempts.length,
        avgF0Score: avgF0,
        matchRatio,
        hasEnoughData,
        observation,
        recommendedAction,
      };
    });
  }

  /**
   * Tính toán dữ liệu tiến bộ 7 ngày gần nhất (từ ngày T-6 đến hôm nay)
   */
  public static getRecent7DaysProgress(): Array<{
    dateStr: string;
    displayDate: string;
    attemptsCount: number;
    avgScore: number | null;
  }> {
    const attempts = this.getAllAttempts();
    const result: Array<{
      dateStr: string;
      displayDate: string;
      attemptsCount: number;
      avgScore: number | null;
    }> = [];

    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const displayDate = `${day}/${month}`;

      const daysAttempts = attempts.filter((a) => a.dateStr === dateStr);
      const scores = daysAttempts
        .map((a) => a.f0Score)
        .filter((s): s is number => typeof s === 'number' && s >= 0);

      const avgScore =
        scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

      result.push({
        dateStr,
        displayDate,
        attemptsCount: daysAttempts.length,
        avgScore,
      });
    }

    return result;
  }

  /**
   * Đề xuất thanh cần luyện tiếp theo dựa trên dữ liệu thực tế
   */
  public static getNextRecommendedTone(): {
    toneId: ToneId;
    reason: string;
  } {
    const stats = this.getToneStats();

    // 1. Ưu tiên thanh chưa đủ 3 lượt hợp lệ
    const underData = stats.find((s) => !s.hasEnoughData);
    if (underData) {
      return {
        toneId: underData.toneId,
        reason: `Cần luyện thêm thanh ${underData.toneName.toLowerCase()} (mới có ${underData.validAttempts}/3 lượt)`,
      };
    }

    // 2. Ưu tiên thanh có điểm F0 thấp nhất
    const sortedByScore = [...stats]
      .filter((s) => s.avgF0Score !== null)
      .sort((a, b) => (a.avgF0Score || 0) - (b.avgF0Score || 0));

    if (sortedByScore.length > 0 && (sortedByScore[0].avgF0Score || 0) < 75) {
      return {
        toneId: sortedByScore[0].toneId,
        reason: `Thanh ${sortedByScore[0].toneName.toLowerCase()} có điểm F0 thấp hơn (${sortedByScore[0].avgF0Score}/100), hãy luyện thêm`,
      };
    }

    // 3. Nếu đều tốt, đề xuất thanh ngã hoặc thanh hỏi (thanh khó)
    return {
      toneId: 'nga',
      reason: 'Luyện tập củng cố thanh ngã (thanh có độ lượn và ngắt âm thanh môn đặc sắc)',
    };
  }
}
