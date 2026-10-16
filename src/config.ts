/**
 * VietTone AI - Cấu hình mô hình Teachable Machine và Version 2.0
 */

export const TEACHABLE_MACHINE_MODEL_URL = 'https://teachablemachine.withgoogle.com/models/cDF6WszFL/';

export const TONE_CLASSES = [
  'Background Noise',
  'Thanh ngang',
  'Thanh sắc',
  'Thanh huyền',
  'Thanh hỏi',
  'Thanh ngã',
  'Thanh nặng',
] as const;

export const PRED_CONFIG = {
  // Ngưỡng tối thiểu để chấp nhận kết quả sơ bộ
  MIN_CONFIDENCE_THRESHOLD: 0.55,
  // Cửa sổ thời gian tích luỹ dự đoán để ổn định (ms)
  BUFFER_TIME_MS: 1100,
  // Ngưỡng năng lượng âm thanh để coi là đang có giọng nói
  AUDIO_VOLUME_THRESHOLD: 0.04,
  // Số lượng cửa sổ dự đoán tối thiểu cần thu thập
  MIN_PREDICTIONS_COUNT: 3,

  // ================= Version 2.0 Evaluation Thresholds =================
  // Ngưỡng đánh giá AI chắc chắn: Top-1 >= 0.70 và Top-1 - Top-2 >= 0.15
  AI_CONFIDENT_TOP1_MIN: 0.70,
  AI_CONFIDENT_MARGIN_MIN: 0.15,

  // Giới hạn cao độ giọng nói người Việt (80Hz nam trầm đến 600Hz nữ/trẻ em)
  F0_MIN_HZ: 80,
  F0_MAX_HZ: 600,
  // Số khung có tiếng nói (voiced) tối thiểu để F0 được coi là đáng tin cậy
  F0_MIN_VOICED_FRAMES: 7,
  // Độ rõ pitch tối thiểu (clarity / periodicity threshold)
  F0_CLARITY_THRESHOLD: 0.42,
  // Ngưỡng năng lượng RMS tối thiểu của một frame có tiếng nói
  F0_RMS_VOICED_THRESHOLD: 0.015,

  // Số lượt hợp lệ tối thiểu cho một thanh để đưa ra nhận xét sơ bộ
  MIN_VALID_ATTEMPTS_FOR_DIAGNOSIS: 3,
};
