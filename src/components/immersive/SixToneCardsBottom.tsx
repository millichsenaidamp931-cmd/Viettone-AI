import React from 'react';
import { Volume2, Check } from 'lucide-react';
import { VIETNAMESE_TONES } from '../../data/tones';
import { ToneItem } from '../../types';
import { playToneAudio } from '../../utils/audioSynthesizer';

interface SixToneCardsBottomProps {
  selectedTone: ToneItem;
  onSelectTone: (tone: ToneItem) => void;
  disabled?: boolean;
}

export const SixToneCardsBottom: React.FC<SixToneCardsBottomProps> = ({
  selectedTone,
  onSelectTone,
  disabled = false,
}) => {
  const handlePlaySample = (e: React.MouseEvent, toneId: string) => {
    e.stopPropagation();
    playToneAudio(toneId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto pt-1 pb-1">
      {/* Lưới 6 thẻ thanh điệu: 6 cột trên Desktop / Tablet, 3 cột x 2 hàng trên Mobile */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
        {VIETNAMESE_TONES.map((tone) => {
          const isSelected = tone.id === selectedTone.id;

          return (
            <div
              key={tone.id}
              role="button"
              tabIndex={disabled ? -1 : 0}
              onClick={() => {
                if (!disabled) onSelectTone(tone);
              }}
              onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                  onSelectTone(tone);
                }
              }}
              className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl sm:rounded-[22px] transition-all duration-200 cursor-pointer select-none text-center ${
                isSelected
                  ? 'bg-gradient-to-b from-orange-500/35 via-red-500/25 to-slate-950/60 backdrop-blur-md border-2 border-[#FF9100] shadow-[0_0_25px_rgba(255,145,0,0.5)] ring-2 ring-orange-400/40 translate-y-[-2px]'
                  : 'bg-slate-950/40 hover:bg-slate-900/60 backdrop-blur-md border border-white/20 text-white shadow-lg shadow-black/20 hover:border-white/35'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Badge Checkmark ở góc trên bên phải khi đang được chọn (như trong ảnh mẫu) */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-[#EF233C] to-[#FF9100] text-white flex items-center justify-center shadow-md shadow-orange-500/50 border border-white/40">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              {/* Hàng 1: Từ phát âm to đậm và Loa nghe mẫu bên cạnh */}
              <div className="flex items-center justify-center gap-1.5 w-full">
                <span
                  className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${
                    isSelected ? 'text-amber-300 drop-shadow-xs' : 'text-white'
                  }`}
                >
                  {tone.word}
                </span>

                {/* Loa nghe mẫu */}
                <button
                  type="button"
                  onClick={(e) => handlePlaySample(e, tone.id)}
                  className={`p-1 rounded-lg transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'text-amber-300 hover:text-white hover:bg-white/20'
                      : 'text-white/70 hover:text-amber-300 hover:bg-white/10'
                  }`}
                  title={`Nghe phát âm chuẩn: ${tone.word}`}
                  aria-label={`Nghe mẫu ${tone.word}`}
                >
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Hàng 2: Tên thanh bên dưới */}
              <div className="mt-1.5 w-full">
                <span
                  className={`text-[11px] sm:text-xs font-semibold block truncate ${
                    isSelected ? 'text-orange-200 font-bold' : 'text-white/70'
                  }`}
                >
                  {tone.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
