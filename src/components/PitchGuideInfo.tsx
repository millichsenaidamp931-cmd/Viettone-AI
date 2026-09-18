import React from 'react';
import { X, Volume2, BookOpen } from 'lucide-react';
import { VIETNAMESE_TONES } from '../data/tones';
import { playToneAudio } from '../utils/audioSynthesizer';

interface PitchGuideInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PitchGuideInfo: React.FC<PitchGuideInfoProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Sổ tay 6 thanh điệu tiếng Việt
              </h2>
              <p className="text-xs text-slate-500">
                Đặc trưng âm điệu cho học sinh và người nước ngoài
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          {VIETNAMESE_TONES.map((tone) => (
            <div
              key={tone.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-all flex items-start justify-between gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-extrabold text-slate-900">{tone.word}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                    {tone.name}
                  </span>
                  <span className="text-xs text-slate-600 font-semibold">{tone.symbol}</span>
                </div>
                <p className="text-xs text-slate-600 mb-1">{tone.pitchDescription}</p>
                <p className="text-[11px] text-red-700 font-medium bg-red-50/60 p-1.5 rounded-lg">
                  💡 Mẹo: {tone.guideTip}
                </p>
              </div>

              <button
                type="button"
                onClick={() => playToneAudio(tone.id)}
                className="shrink-0 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-200 transition-colors shadow-2xs"
                title="Nghe mẫu phát âm"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-colors"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
