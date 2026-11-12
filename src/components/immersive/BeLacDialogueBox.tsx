import React, { useEffect, useState } from 'react';
import {
  Mic,
  Square,
  RotateCcw,
  BarChart3,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { ToneItem, FeedbackAssessment, F0ContourData, F0ScoreResult } from '../../types';
import { TONE_NAME_MAP } from '../../data/tones';

interface BeLacDialogueBoxProps {
  selectedTone: ToneItem;
  isListening: boolean;
  audioVolume: number;
  permissionError: string | null;
  onStartListening: () => void;
  onStopListening: () => void;
  onRetryPermission: () => void;
  assessment: FeedbackAssessment | null;
  userContour: F0ContourData | null;
  f0ScoreResult: F0ScoreResult | null;
  onOpenAnalysis: () => void;
  encourageVoiceText?: string | null;
}

export const BeLacDialogueBox: React.FC<BeLacDialogueBoxProps> = ({
  selectedTone,
  isListening,
  audioVolume,
  permissionError,
  onStartListening,
  onStopListening,
  onRetryPermission,
  assessment,
  userContour,
  f0ScoreResult,
  onOpenAnalysis,
  encourageVoiceText = null,
}) => {
  // Sóng âm thanh hai bên Microphone
  const [leftWave, setLeftWave] = useState<number[]>([10, 16, 24, 14, 20, 28, 18, 12]);
  const [rightWave, setRightWave] = useState<number[]>([12, 18, 28, 20, 14, 24, 16, 10]);

  useEffect(() => {
    if (!isListening) return;
    const interval = setInterval(() => {
      const volMult = Math.max(0.3, audioVolume * 3.8);
      setLeftWave([
        Math.min(100, Math.floor((10 + Math.random() * 35) * volMult)),
        Math.min(100, Math.floor((16 + Math.random() * 50) * volMult)),
        Math.min(100, Math.floor((24 + Math.random() * 65) * volMult)),
        Math.min(100, Math.floor((14 + Math.random() * 45) * volMult)),
        Math.min(100, Math.floor((20 + Math.random() * 60) * volMult)),
        Math.min(100, Math.floor((28 + Math.random() * 70) * volMult)),
        Math.min(100, Math.floor((18 + Math.random() * 50) * volMult)),
        Math.min(100, Math.floor((12 + Math.random() * 40) * volMult)),
      ]);
      setRightWave([
        Math.min(100, Math.floor((12 + Math.random() * 40) * volMult)),
        Math.min(100, Math.floor((18 + Math.random() * 50) * volMult)),
        Math.min(100, Math.floor((28 + Math.random() * 70) * volMult)),
        Math.min(100, Math.floor((20 + Math.random() * 60) * volMult)),
        Math.min(100, Math.floor((14 + Math.random() * 45) * volMult)),
        Math.min(100, Math.floor((24 + Math.random() * 65) * volMult)),
        Math.min(100, Math.floor((16 + Math.random() * 50) * volMult)),
        Math.min(100, Math.floor((10 + Math.random() * 35) * volMult)),
      ]);
    }, 90);
    return () => clearInterval(interval);
  }, [isListening, audioVolume]);

  // Phân tích trạng thái dữ liệu thực tế
  type DialogueState =
    | 'ready'
    | 'listening'
    | 'confident_match'
    | 'confident_mismatch'
    | 'uncertain'
    | 'low_audio_quality'
    | 'no_valid_f0'
    | 'error';

  let dialogueState: DialogueState = 'ready';

  if (permissionError) {
    dialogueState = 'error';
  } else if (isListening) {
    dialogueState = 'listening';
  } else if (assessment) {
    const isQuietOrNoSignal =
      !userContour ||
      userContour.points.length === 0 ||
      userContour.unreliableReason?.includes('Chưa thu nhận') ||
      (userContour.voicedFramesCount === 0 && !assessment.isAiConfident);

    const isNoF0 = !userContour?.isReliable;

    if (isQuietOrNoSignal) {
      dialogueState = 'low_audio_quality';
    } else if (isNoF0 && !assessment.isAiConfident) {
      dialogueState = 'no_valid_f0';
    } else if (!assessment.isAiConfident) {
      dialogueState = 'uncertain';
    } else {
      const isMatch =
        assessment.predictedToneName?.trim().toLowerCase() ===
        selectedTone.name.trim().toLowerCase();
      dialogueState = isMatch ? 'confident_match' : 'confident_mismatch';
    }
  }

  // Lấy từ và thanh dự đoán
  const predictedToneItem = assessment?.predictedToneName
    ? TONE_NAME_MAP[assessment.predictedToneName]
    : null;
  const predictedWord = predictedToneItem
    ? predictedToneItem.word.toUpperCase()
    : assessment?.predictedToneName?.toUpperCase() || '—';

  // Lời nhắn theo trạng thái
  const getContent = () => {
    switch (dialogueState) {
      case 'listening':
        return {
          headline: 'Bé Lạc đang lắng nghe!',
          subheadline: `Hãy đọc từ "${selectedTone.word}" thật to và rõ nhé!`,
          subtext: 'Mình sẽ phân tích cao độ và nhận diện thanh điệu của bạn ngay.',
        };
      case 'confident_match':
        return {
          headline: `Bé Lạc nghe được thanh ${selectedTone.name.replace('Thanh ', '').toUpperCase()}!`,
          subheadline: 'AI đã nhận diện trùng thanh bạn chọn. Rất xuất sắc!',
          subtext: 'Đường nét cao độ của bạn khớp rất tốt với mẫu tham chiếu.',
        };
      case 'confident_mismatch': {
        const predName = assessment?.predictedToneName?.replace('Thanh ', '').toUpperCase() || '';
        const targetName = selectedTone.name.replace('Thanh ', '').toUpperCase();
        return {
          headline: `Bé Lạc nghe giống thanh ${predName} hơn!`,
          subheadline: `Bạn đang luyện thanh ${targetName}. Hãy nghe lại mẫu và thử lại nhé!`,
          subtext: 'Cùng nghe âm mẫu chuẩn để điều chỉnh đường cao độ nào.',
        };
      }
      case 'uncertain':
        return {
          headline: 'Bé Lạc vẫn chưa chắc chắn!',
          subheadline: 'Mình cùng nghe mẫu rồi thử lại lần nữa nhé!',
          subtext: 'Hãy ngân dài âm hơn một nhịp để AI bắt trọn đường nét thanh điệu.',
        };
      case 'low_audio_quality':
        return {
          headline: 'Bé Lạc chưa nghe rõ bạn nè!',
          subheadline: 'Hãy thử đọc to và rõ hơn nhé!',
          subtext: 'Mình sẽ lắng nghe để nhận diện đúng thanh điệu của bạn.',
        };
      case 'no_valid_f0':
        return {
          headline: 'Bé Lạc đã nghe bạn rồi!',
          subheadline: 'Nhưng chưa đủ dữ liệu đường cao độ để so sánh.',
          subtext: 'Hãy phát âm rõ nguyên âm và không thì thầm nhé.',
        };
      case 'error':
        return {
          headline: 'Bé Lạc đang gặp chút trục trặc!',
          subheadline: 'Hãy kiểm tra quyền truy cập microphone và thử lại nhé!',
          subtext: 'Đảm bảo trình duyệt đã được cấp phép sử dụng microphone.',
        };
      case 'ready':
      default:
        return {
          headline: 'Bé Lạc đã sẵn sàng!',
          subheadline: `Nhấn nút micro và đọc to từ "${selectedTone.word}" nhé!`,
          subtext: 'Mình sẽ lắng nghe để nhận diện đúng thanh điệu của bạn.',
        };
    }
  };

  const content = getContent();

  return (
    <div className="w-full max-w-2xl mx-auto relative z-20">
      {/* Khung hội thoại chính (Frosted Glass Container giống ảnh mẫu) */}
      <div className="bg-slate-950/50 backdrop-blur-xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.35)] rounded-[32px] sm:rounded-[38px] p-5 sm:p-7 text-center text-white transition-all duration-300">
        {/* Lỗi quyền microphone nếu có */}
        {permissionError && (
          <div className="mb-4 bg-amber-500/20 border border-amber-400/40 text-amber-200 px-3.5 py-2.5 rounded-2xl flex items-start gap-2.5 shadow-sm text-left">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Chưa thể truy cập Microphone</p>
              <p className="text-amber-200/90">{permissionError}</p>
              <button
                type="button"
                onClick={onRetryPermission}
                className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Cấp quyền lại
              </button>
            </div>
          </div>
        )}

        {/* 1. Khu vực MICROPHONE ở trung tâm phía trên với sóng âm hai bên */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-3 sm:mb-4">
          {/* Sóng âm bên trái */}
          <div className="flex items-center gap-0.5 sm:gap-1 h-10 sm:h-12 w-20 sm:w-28 justify-end">
            {leftWave.map((h, i) => (
              <div
                key={`lw-${i}`}
                className="w-1 sm:w-1.5 bg-gradient-to-t from-[#EF233C] via-[#FF9100] to-amber-300 rounded-full transition-all duration-100 shadow-[0_0_6px_rgba(255,145,0,0.5)]"
                style={{
                  height: isListening ? `${Math.max(8, h)}%` : `${h * 0.4}%`,
                  opacity: isListening ? 1 : 0.5,
                }}
              />
            ))}
          </div>

          {/* Nút Microphone Tròn Nổi Bật (Gradient Đỏ - Cam) */}
          <div className="relative shrink-0">
            {/* Hiệu ứng hào quang khi đang nghe */}
            {isListening && (
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-amber-400 animate-ping opacity-50 -z-10"
                style={{ transform: `scale(${1 + audioVolume * 1.6})` }}
              />
            )}

            {!isListening ? (
              <button
                type="button"
                onClick={onStartListening}
                className="group w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#EF233C] via-[#F43F5E] to-[#FF9100] text-white flex items-center justify-center shadow-[0_0_25px_rgba(239,35,60,0.55)] hover:shadow-[0_0_35px_rgba(255,145,0,0.75)] hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/30"
                title="Bấm để bắt đầu đọc"
                aria-label="Bắt đầu ghi âm phát âm"
              >
                <Mic className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-xs group-hover:scale-110 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onStopListening}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 border border-white/30 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                title="Dừng ghi âm"
                aria-label="Dừng ghi âm"
              >
                <Square className="w-5 h-5 fill-white text-white" />
              </button>
            )}
          </div>

          {/* Sóng âm bên phải */}
          <div className="flex items-center gap-0.5 sm:gap-1 h-10 sm:h-12 w-20 sm:w-28 justify-start">
            {rightWave.map((h, i) => (
              <div
                key={`rw-${i}`}
                className="w-1 sm:w-1.5 bg-gradient-to-t from-[#EF233C] via-[#FF9100] to-amber-300 rounded-full transition-all duration-100 shadow-[0_0_6px_rgba(255,145,0,0.5)]"
                style={{
                  height: isListening ? `${Math.max(8, h)}%` : `${h * 0.4}%`,
                  opacity: isListening ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </div>

        {/* 2. Tiêu đề và nội dung phản hồi của Bé Lạc */}
        <div className="space-y-1.5 mb-2">
          {/* Headline lớn với cặp tia sáng nhỏ hai bên (như ảnh mẫu) */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-amber-300 text-lg sm:text-xl font-black select-none drop-shadow-xs">
              ◟
            </span>
            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-sm">
              {content.headline}
            </h3>
            <span className="text-amber-300 text-lg sm:text-xl font-black select-none drop-shadow-xs">
              ◞
            </span>
          </div>

          {/* Subheadline (Màu vàng sáng ấm áp) */}
          <p className="text-sm sm:text-base md:text-lg font-extrabold text-[#FEF08A] drop-shadow-xs">
            {content.subheadline}
          </p>

          {/* Subtext hỗ trợ */}
          <p className="text-xs sm:text-sm text-white/85 max-w-lg mx-auto pt-0.5 leading-relaxed">
            {content.subtext}
          </p>
        </div>

        {/* 3. BẢNG KẾT QUẢ AI ĐỐI CHIẾU TRỰC TIẾP */}
        {assessment && !isListening && (
          <div className="mt-4 pt-3.5 border-t border-white/15 space-y-3 animate-in fade-in duration-200">
            {/* Lưới 4 chỉ số thực trên nền kính mờ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              {/* Bạn đang luyện */}
              <div className="bg-white/10 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-white/15">
                <span className="text-[11px] sm:text-xs uppercase font-bold text-white/70 block mb-0.5">
                  Bạn đang luyện
                </span>
                <span className="text-base sm:text-lg font-black text-white block truncate">
                  {selectedTone.word.toUpperCase()}
                </span>
                <span className="text-xs text-white/80 font-semibold block truncate">
                  {selectedTone.name}
                </span>
              </div>

              {/* AI nhận diện */}
              <div
                className={`p-2.5 sm:p-3 rounded-2xl border backdrop-blur-md ${
                  assessment.predictedToneName?.trim().toLowerCase() ===
                  selectedTone.name.trim().toLowerCase()
                    ? 'bg-emerald-500/25 border-emerald-400/50 text-white'
                    : 'bg-amber-500/25 border-amber-400/50 text-white'
                }`}
              >
                <span className="text-[11px] sm:text-xs uppercase font-bold text-white/70 block mb-0.5">
                  AI nhận diện
                </span>
                <span className="text-base sm:text-lg font-black block truncate text-amber-300">
                  {predictedWord}
                </span>
                <span className="text-xs font-bold block truncate opacity-95">
                  {assessment.predictedToneName || 'Chưa rõ'}
                </span>
              </div>

              {/* Độ tin cậy AI */}
              <div className="bg-white/10 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-white/15">
                <span className="text-[11px] sm:text-xs uppercase font-bold text-white/70 block mb-0.5">
                  Độ tin cậy AI
                </span>
                <span className="text-base sm:text-lg font-black text-white block">
                  {Math.round(assessment.confidence * 100)}%
                </span>
                <span className="text-xs text-white/80 font-semibold block truncate">
                  {assessment.isAiConfident ? 'Tự tin cao' : 'Cần thử lại'}
                </span>
              </div>

              {/* Điểm tương đồng F0 */}
              <div className="bg-white/10 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-white/15">
                <span className="text-[11px] sm:text-xs uppercase font-bold text-white/70 block mb-0.5">
                  Độ giống đường F0
                </span>
                {typeof f0ScoreResult?.score === 'number' && f0ScoreResult.score >= 0 ? (
                  <>
                    <span className="text-base sm:text-lg font-black text-amber-300 block">
                      {f0ScoreResult.score}
                      <span className="text-xs sm:text-sm text-white/70 font-normal">/100</span>
                    </span>
                    <span className="text-xs text-emerald-300 font-bold block truncate">
                      F0 hợp lệ
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-bold text-white/90 block my-1">
                      Chưa đủ F0
                    </span>
                    <span className="text-xs text-white/70 block truncate">
                      Nói to hơn nhé
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Lời khuyên sư phạm ngắn */}
            {assessment.adviceText && (
              <div className="bg-amber-500/15 p-3 rounded-2xl border border-amber-400/35 text-xs sm:text-sm text-amber-100 text-left flex items-start gap-2.5 backdrop-blur-xs">
                <Sparkles className="w-4.5 h-4.5 text-amber-300 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-white text-xs sm:text-sm">Mẹo luyện: </span>
                  <span className="text-xs sm:text-sm">{assessment.adviceText}</span>
                </div>
              </div>
            )}

            {/* 2 nút hành động: Đọc lại & Phân tích chi tiết */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={onStartListening}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#EF233C] to-[#FF9100] text-white font-bold text-sm sm:text-base shadow-lg shadow-red-500/35 hover:shadow-xl hover:shadow-red-500/45 active:scale-95 transition-all cursor-pointer border border-white/20"
              >
                <RotateCcw className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span>Đọc lại</span>
              </button>

              <button
                type="button"
                onClick={onOpenAnalysis}
                className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base border border-white/25 backdrop-blur-md shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-300" />
                <span>Phân tích chi tiết</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
