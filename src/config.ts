/**
 * VietTone AI - Cấu hình mô hình Teachable Machine
 * 
 * Bạn có thể thay đổi đường dẫn URL mô hình Teachable Machine Audio đã huấn luyện tại đây.
 * Đường dẫn cần có định dạng kết thúc bằng dấu gạch chéo "/", ví dụ:
 * https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/
 * 
 * Model gồm chính xác 7 class:
 * 1. Background Noise
 * 2. Thanh ngang
 * 3. Thanh sắc
 * 4. Thanh huyền
 * 5. Thanh hỏi
 * 6. Thanh ngã
 * 7. Thanh nặng
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
  // Ngưỡng tối thiểu để chấp nhận kết quả (0.60 = 60%)
  MIN_CONFIDENCE_THRESHOLD: 0.55,
  // Cửa sổ thời gian tích luỹ dự đoán để ổn định (ms)
  BUFFER_TIME_MS: 1100,
  // Ngưỡng năng lượng âm thanh để coi là đang có giọng nói
  AUDIO_VOLUME_THRESHOLD: 0.04,
  // Số lượng cửa sổ dự đoán tối thiểu cần thu thập
  MIN_PREDICTIONS_COUNT: 3,
};
