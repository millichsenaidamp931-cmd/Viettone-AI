/**
 * VietTone AI - Thành phần phản hồi sư phạm chi tiết (Detailed Pedagogical Feedback)
 * 
 * Hiển thị thanh mục tiêu, thanh AI dự đoán, độ tin cậy, điểm F0 và các gợi ý cải thiện nhẹ nhàng.
 * Khi chưa đọc: Hiển thị trạng thái chờ sẵn sàng trực quan.
 */

import React from 'react';
import { FeedbackAssessment, ToneItem } from '../types';
import {
  AlertCircle,
  CheckCircle,
  Sparkles,
  Lightbulb,
  Volume2,
  ArrowRight,
  RotateCcw,
  Mic,
} from 'lucide-react';
import { playToneAudio } from '../utils/audioSynthesizer';

interface DetailedFeedbackProps {
  assessment: FeedbackAssessment | null;
  targetTone: ToneItem;
  isListening: boolean;
  onRetry: () => void;
  onNextTone: () => void;
}

export const DetailedFeedback: React.FC<DetailedFeedbackProps> = ({
  assessment,
  targetTone,
  isListening,
  onRetry,
  onNextTone,
}) => {
  // Trạng thái 1: Chưa có lượt đọc hoặc đang chờ ghi âm mới
  if (!assessment) {
    return (
      <div className="w-full rounded-2xl p-4 sm:p-5 my-2 border border-slate-200/90 bg-white shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              {isListening
                ? 'Đang lắng nghe và ghi nhận giọng đọc...'
                : 'Sẵn sàng thu âm lượt mới'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isListening
                ? `Giữ mic ổn định và phát âm rõ từ "${targetTone.word}" (${targetTone.name.toLowerCase()}).`
                : `Phát âm to rõ từ "${targetTone.word}" để AI nhận diện và trích xuất đường cao độ F0 đối chiếu.`}
            </p>

            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => playToneAudio(targetTone.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Nghe lại mẫu &ldquo;{targetTone.word}&rdquo;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    predictedToneName,
    confidence,
    statusBadge,
    headline,
    adviceText,
    f0SpecificObservation,
    improvementTip,
  } = assessment;

  const confPercent = Math.round(confidence * 100);
  const isSuccess = statusBadge.type === 'success';
  const isWarning = statusBadge.type === 'warning';

  return (
    <div
      className={`w-full rounded-2xl p-4 sm:p-5 my-2 border-2 shadow-2xs transition-all ${
        isSuccess
          ? 'bg-emerald-50/70 border-emerald-300'
          : isWarning
          ? 'bg-amber-50/70 border-amber-300'
          : 'bg-slate-50 border-slate-300'
      }`}
    >
      {/* Header trạng thái */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/70">
        <div className="flex items-start gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              isSuccess
                ? 'bg-emerald-100 text-emerald-700'
                : isWarning
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {isSuccess ? (
              <CheckCircle className="w-4 h-4" />
            ) : isWarning ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                {headline}
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSuccess
                    ? 'bg-emerald-200 text-emerald-900'
                    : isWarning
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                {statusBadge.label}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-0.5">{adviceText}</p>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Đọc lại</span>
          </button>
          <button
            type="button"
            onClick={onNextTone}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <span>Thanh tiếp</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Thông tin đối chiếu mục tiêu và AI */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
            Mục tiêu
          </span>
          <div className="text-xs font-bold text-slate-900 mt-0.5 flex items-center justify-between">
            <span>
              {targetTone.word} – {targetTone.name}
            </span>
          </div>
        </div>

        <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80">
          <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
            AI nghe được
          </span>
          <div className="text-xs font-bold text-slate-900 mt-0.5 flex items-center justify-between">
            <span className="uppercase text-amber-700 truncate">
              {predictedToneName || 'Chưa rõ'}
            </span>
            <span className="text-[11px] font-mono font-semibold text-slate-500">
              {confPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Quan sát ngữ âm & F0 */}
      {f0SpecificObservation && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="font-medium text-slate-800 text-[11px] sm:text-xs">
            {f0SpecificObservation}
          </p>
        </div>
      )}

      {/* Gợi ý cải thiện */}
      <div className="mt-2 p-2.5 rounded-xl bg-red-50/80 border border-red-200 text-xs text-red-900 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
        <p className="text-[11px] sm:text-xs">
          <strong className="text-red-950">Gợi ý luyện tập: </strong>
          <span>{improvementTip}</span>
        </p>
      </div>
    </div>
  );
};
