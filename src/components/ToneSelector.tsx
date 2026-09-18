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
    <div className="w-full">
      {/* Active Callout Banner */}
      <div className="mb-5 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white rounded-2xl p-4 sm:p-5 shadow-sm text-center">
        <span className="text-xs uppercase tracking-widest font-bold opacity-90 block mb-1">
          Mục tiêu luyện tập
        </span>
        <div className="text-2xl sm:text-3xl font-black tracking-tight">
          Hãy đọc: <span className="underline decoration-white/60 decoration-4 underline-offset-4 uppercase">{selectedTone.word}</span>
          <span className="text-lg sm:text-xl font-medium ml-2 opacity-95">
            – {selectedTone.name.toLowerCase()}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-red-50/90 mt-1 max-w-lg mx-auto">
          {selectedTone.guideTip}
        </p>
      </div>

      {/* 6 Big Tone Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {VIETNAMESE_TONES.map((tone) => {
          const isSelected = tone.id === selectedTone.id;

          return (
            <button
              key={tone.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectTone(tone)}
              className={`group relative flex flex-col items-center justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 text-left w-full cursor-pointer select-none ${
                isSelected
                  ? 'border-red-600 bg-red-50/70 shadow-md ring-3 ring-red-500/20 translate-y-[-2px]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute -top-2.5 -right-2 bg-red-600 text-white p-1 rounded-full shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}

              {/* Syllable Word */}
              <div className="w-full text-center mb-1">
                <span
                  className={`text-3xl sm:text-4xl font-extrabold tracking-tight block ${
                    isSelected ? 'text-red-700 scale-105' : 'text-slate-800'
                  } transition-transform`}
                >
                  {tone.word}
                </span>
              </div>

              {/* Tone Name */}
              <div className="w-full text-center">
                <span
                  className={`text-xs sm:text-sm font-bold block ${
                    isSelected ? 'text-red-800' : 'text-slate-700'
                  }`}
                >
                  {tone.name}
                </span>
                <span className="text-[11px] text-slate-500 block line-clamp-1 mt-0.5">
                  {tone.toneTitle}
                </span>
              </div>

              {/* Audio Listen Button */}
              <div className="mt-3 pt-2 w-full border-t border-slate-100 flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => handlePlayAudio(e, tone.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-red-600/10 text-red-700 hover:bg-red-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={`Nghe phát âm mẫu: ${tone.word}`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe mẫu</span>
                </button>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
