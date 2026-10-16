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
