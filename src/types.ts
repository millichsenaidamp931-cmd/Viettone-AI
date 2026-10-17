export type ToneId = 'ngang' | 'sac' | 'huyen' | 'hoi' | 'nga' | 'nang';

export interface ToneItem {
  id: ToneId;
  word: string;
  name: string;
  toneTitle: string;
  symbol: string;
  diacriticName: string;
  pitchDescription: string;
  guideTip: string;
  color: {
    bg: string;
    border: string;
    text: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
  };
}

export interface PredictionResult {
  className: string;
  probability: number;
}

export interface StabilityAssessment {
  status: 'listening' | 'stabilizing' | 'success' | 'low_confidence' | 'ambient_noise' | 'error';
  recognizedToneName: string | null;
  confidence: number;
  allProbabilities: { [key: string]: number };
  sampleCount: number;
  message?: string;
}

export interface AudioStats {
  volume: number;
  isSpeaking: boolean;
}

// =================== VERSION 2.0 TYPES ===================

/** Điểm dữ liệu F0 tại một thời điểm */
export interface PitchPoint {
  timeMs: number;
  pitchHz: number;
  clarity: number;
  isVoiced: boolean;
}

/** Kết quả phân tích đường nét cao độ F0 của một lượt đọc */
export interface F0ContourData {
  points: PitchPoint[];
  durationMs: number;
  meanPitchHz: number;
  minPitchHz: number;
  maxPitchHz: number;
  pitchRangeHz: number;
  pitchSlopeHzPerSec: number;
  isReliable: boolean;
  unreliableReason?: string;
  voicedFramesCount: number;
  totalFramesCount: number;
}

/** Mẫu tham chiếu chuẩn cho một thanh */
export interface ReferenceToneSample {
  toneId: ToneId;
  toneName: string;
  word: string;
  sourceType: 'teacher_recorded' | 'audio_uploaded' | 'acoustic_standard';
  sourceTitle: string;
  updatedAt: number;
  contour: PitchPoint[];
  durationMs: number;
  audioBlobUrl?: string;
}

/** Kết quả chấm điểm tương đồng F0 (0-100) */
export interface F0ScoreResult {
  score: number | null; // 0-100 hoặc null nếu không đủ điều kiện
  isCalculable: boolean;
  reason?: string;
  breakdown?: {
    shapeSimilarity: number;
    trendSimilarity: number;
    dtwSimilarity: number;
  };
  educationalNote: string;
}

/** Đánh giá độ tin cậy và phản hồi gợi ý cải thiện */
export interface FeedbackAssessment {
  targetTone: ToneItem;
  predictedToneName: string | null;
  confidence: number;
  top2Margin: number;
  isAiConfident: boolean;
  isF0Reliable: boolean;
  f0ScoreResult: F0ScoreResult;
  userContour: F0ContourData | null;
  referenceSample: ReferenceToneSample | null;
  refSample?: ReferenceToneSample | null;
  statusBadge: {
    label: string;
    type: 'success' | 'warning' | 'uncertain' | 'info';
  };
  headline: string;
  adviceText: string;
  f0SpecificObservation?: string;
  improvementTip: string;
}

/** Lượt luyện tập được lưu trữ */
export interface PracticeAttempt {
  id: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD
  targetToneId: ToneId;
  targetToneName: string;
  targetWord: string;
  predictedToneName: string | null;
  confidence: number;
  top2Margin: number;
  isAiConfident: boolean;
  isMatch: boolean;
  hasReliableF0: boolean;
  f0Score: number | null;
  meanPitchHz?: number;
  audioQuality: 'good' | 'too_quiet' | 'unreliable_pitch' | 'noisy';
  adviceSummary: string;
}

/** Thống kê theo từng thanh điệu */
export interface ToneRoadmapStat {
  toneId: ToneId;
  toneName: string;
  word: string;
  totalAttempts: number;
  validAttempts: number;
  avgF0Score: number | null;
  matchRatio: number;
  hasEnoughData: boolean; // Cần >= 3 lượt hợp lệ
  observation: string;
  recommendedAction: string;
}

// =================== VERSION 2.1 MOTIVATION ENGINE TYPES ===================

export type MotivationStateType =
  | 'first_attempt'       // Trạng thái A: Hoàn thành lượt đầu tiên
  | 'ai_recognized'       // Trạng thái B: AI nhận diện rõ thanh mục tiêu
  | 'ai_uncertain'        // Trạng thái C: AI chưa chắc chắn
  | 'f0_improved'         // Trạng thái D: Điểm F0 được cải thiện (>= 5 điểm)
  | 'ten_attempts'        // Trạng thái E: Hoàn thành 10 lượt luyện
  | 'three_day_streak'    // Trạng thái F: Luyện tập 3 ngày liên tiếp
  | 'repeated_uncertain'  // Trạng thái G: Luyện nhiều lần nhưng AI vẫn chưa chắc chắn
  | 'ready';              // Trạng thái sẵn sàng trước khi ghi âm

export type MascotMood = 'excited' | 'cheering' | 'comforting' | 'proud' | 'focused' | 'ready';

/** Thông điệp động viên do MotivationEngine lựa chọn */
export interface MotivationMessage {
  state: MotivationStateType;
  headline: string;
  subtext: string;
  f0Delta?: number;
  prevScore?: number;
  currentScore?: number;
  mascotMood: MascotMood;
  celebrate: boolean;
  timestamp?: number;
}

/** Thông tin chuỗi ngày luyện tập (Streak) */
export interface StreakInfo {
  currentStreak: number;
  isActiveToday: boolean;
  lastActiveDate: string | null;
  totalDaysActive: number;
}

/** Huy hiệu cột mốc thành tích */
export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isUnlocked: boolean;
  unlockedDate?: string;
  currentValue: number;
  targetValue: number;
  category: 'habit' | 'persistence' | 'f0' | 'tones';
}
