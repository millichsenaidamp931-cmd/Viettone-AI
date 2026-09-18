import React from 'react';
import { CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { ToneItem } from '../types';
import { VIETNAMESE_TONES } from '../data/tones';

interface ResultFeedbackProps {
  status: 'idle' | 'listening' | 'matched' | 'unmatched' | 'low_confidence';
  targetTone: ToneItem;
  predictedToneName: string | null;
  confidence: number;
  onNextTone: () => void;
  onRetry: () => void;
}

export const ResultFeedback: React.FC<ResultFeedbackProps> = ({
  status,
  targetTone,
  predictedToneName,
  confidence,
  onNextTone,
  onRetry,
}) => {
  if (status === 'idle') {
    return null;
  }

  if (status === 'listening') {
    return (
      <div className="w-full bg-blue-50/70 border border-blue-200 rounded-2xl p-5 text-center my-5 shadow-xs">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mb-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="text-sm font-semibold text-blue-900">
          Đang lắng nghe và gom các cửa sổ âm thanh...
        </p>
        <p className="text-xs text-blue-700 mt-1">
          Hãy giữ âm lượng ổn định và phát âm rõ từ &ldquo;{targetTone.word}&rdquo; ({targetTone.name.toLowerCase()}).
        </p>
      </div>
    );
  }

  if (status === 'low_confidence') {
    return (
      <div className="w-full bg-amber-50 border border-amber-200/90 rounded-2xl p-5 my-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-amber-900">
              AI chưa nhận diện chắc chắn. Hãy thử đọc lại.
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 mt-1">
              Âm thanh có thể hơi nhỏ hoặc lẫn tiếng ồn xung quanh. Bạn hãy lại gần microphone hơn và đọc dứt khoát nhé.
            </p>
            <div className="mt-3.5">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Thử đọc lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Find predicted tone item if any
  const predictedToneItem = VIETNAMESE_TONES.find((t) => t.name === predictedToneName);
  const confidencePercent = Math.round(confidence * 100);

  // Success Match Case
  if (status === 'matched') {
    return (
      <div className="w-full bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 sm:p-6 my-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold text-emerald-900">
                  ✓ Phù hợp với mẫu {targetTone.name.toUpperCase()}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                  {confidencePercent}%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-800 mt-1">
                Tuyệt vời! Bạn đã phát âm chính xác từ &ldquo;{targetTone.word}&rdquo; với cao độ chuẩn của {targetTone.name.toLowerCase()}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center shrink-0">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-50 font-semibold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Đọc lại
            </button>
            <button
              type="button"
              onClick={onNextTone}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <span>Luyện tiếp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unmatched Case (gentle supportive feedback, NO judging)
  if (status === 'unmatched') {
    return (
      <div className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl p-5 sm:p-6 my-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-semibold text-slate-900 space-y-1">
                <p>
                  Bạn đang luyện:{' '}
                  <span className="font-extrabold uppercase text-red-600">
                    {targetTone.word} – {targetTone.name.toLowerCase()}
                  </span>
                </p>
                <p>
                  AI nghe gần với:{' '}
                  <span className="font-extrabold uppercase text-amber-600">
                    {predictedToneItem ? predictedToneItem.word : ''} – {predictedToneName?.toLowerCase()}
                  </span>
                </p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-medium">
                Hãy thử lại nhé. {targetTone.guideTip}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center shrink-0">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Thử lại ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
