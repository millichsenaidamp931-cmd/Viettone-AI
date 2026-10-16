import React from 'react';
import { Volume2, CheckCircle2 } from 'lucide-react';
import { VIETNAMESE_TONES } from '../data/tones';
import { ToneItem } from '../types';
import { playToneAudio } from '../utils/audioSynthesizer';

interface ToneSelectorProps {
  selectedTone: ToneItem;
  onSelectTone: (tone: ToneItem) => void;
  disabled?: boolean;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  selectedTone,
  onSelectTone,
  disabled = false,
}) => {
  const handlePlayAudio = (e: React.MouseEvent, toneId: string) => {
    e.stopPropagation();
    playToneAudio(toneId);
  };

  return (
    <div className="w-full space-y-3">
      {/* Target Word Banner (Compact Modern SaaS) */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold opacity-85 px-1.5 py-0.5 rounded bg-white/20">
              Mục tiêu luyện
            </span>
            <span className="text-xs sm:text-sm font-semibold opacity-95">
              {selectedTone.name} ({selectedTone.symbol})
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              {selectedTone.word}
            </span>
            <span className="text-xs opacity-90 line-clamp-1 hidden sm:inline">
              – {selectedTone.pitchDescription}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => handlePlayAudio(e, selectedTone.id)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-red-700 hover:bg-red-50 font-bold text-xs shadow-xs transition-transform active:scale-95 shrink-0 cursor-pointer"
          title={`Nghe phát âm chuẩn: ${selectedTone.word}`}
        >
          <Volume2 className="w-4 h-4 text-red-600" />
          <span>Nghe mẫu</span>
        </button>
      </div>

      {/* 6 Compact Tone Buttons (Grid 3x2 on mobile, 6 cols on larger) */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
        {VIETNAMESE_TONES.map((tone) => {
          const isSelected = tone.id === selectedTone.id;

          return (
            <button
              key={tone.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectTone(tone)}
              className={`group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border-2 transition-all duration-150 text-center w-full cursor-pointer select-none ${
                isSelected
                  ? 'border-red-600 bg-red-50/80 shadow-xs ring-2 ring-red-500/20 translate-y-[-1px]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSelected && (
                <div className="absolute top-1 right-1 text-red-600">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-red-100" />
                </div>
              )}

              {/* Word & Symbol */}
              <div className="flex items-baseline justify-center gap-1">
                <span
                  className={`text-xl sm:text-2xl font-black ${
                    isSelected ? 'text-red-700' : 'text-slate-800'
                  }`}
                >
                  {tone.word}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {tone.symbol}
                </span>
              </div>

              {/* Tone Name & mini audio button */}
              <div className="w-full flex items-center justify-between gap-1 mt-1 pt-1 border-t border-slate-100/80">
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold truncate ${
                    isSelected ? 'text-red-800' : 'text-slate-600'
                  }`}
                >
                  {tone.name.replace('Thanh ', '')}
                </span>

                <button
                  type="button"
                  onClick={(e) => handlePlayAudio(e, tone.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                  title={`Nghe: ${tone.word}`}
                >
                  <Volume2 className="w-3 h-3" />
                </button>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
