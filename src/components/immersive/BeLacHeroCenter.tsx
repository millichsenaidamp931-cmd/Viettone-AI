import React from 'react';
import { Target, Volume2 } from 'lucide-react';
import { ToneItem, FeedbackAssessment } from '../../types';
import { playToneAudio } from '../../utils/audioSynthesizer';
import { AnimatedBeLac, BeLacAnimationState } from './AnimatedBeLac';

interface BeLacHeroCenterProps {
  selectedTone: ToneItem;
  isListening: boolean;
  isAnalyzing?: boolean;
  audioVolume: number;
  assessment?: FeedbackAssessment | null;
  permissionError?: string | null;
  isIntroActive?: boolean;
  onIntroComplete?: () => void;
}

export const BeLacHeroCenter: React.FC<BeLacHeroCenterProps> = ({
  selectedTone,
  isListening,
  isAnalyzing = false,
  audioVolume,
  assessment = null,
  permissionError = null,
  isIntroActive = false,
  onIntroComplete,
}) => {
  const handlePlaySample = () => {
    playToneAudio(selectedTone.id);
  };

  // Xác định trạng thái của Bé Lạc dựa trên tương tác thực tế
  let mascotState: BeLacAnimationState = 'idle';

  if (permissionError) {
    mascotState = 'error';
  } else if (isListening) {
    mascotState = 'listening';
  } else if (isAnalyzing) {
    mascotState = 'thinking';
  } else if (isIntroActive) {
    mascotState = 'intro';
  } else if (assessment) {
    const isMatch =
      assessment.predictedToneName?.trim().toLowerCase() ===
      selectedTone.name.trim().toLowerCase();
    mascotState = isMatch ? 'success' : 'uncertain';
  }

  // Chiều cao thanh sóng âm thanh hai bên
  const waveHeightsLeft = [6, 12, 18, 10, 16, 22, 14, 8];
  const waveHeightsRight = [8, 14, 22, 16, 10, 18, 12, 6];

  return (
    <div className="flex flex-col items-center justify-center text-center select-none pt-0 pb-1 w-full max-w-xl mx-auto">
      {/* 1. Nhân vật Bé Lạc tương tác đa trạng thái (Animated Mascot) */}
      <AnimatedBeLac
        state={mascotState}
        audioVolume={audioVolume}
        imageSrc="/assets/be-lac.png"
        altText="Bé Lạc - VietTone AI"
        onClick={handlePlaySample}
        onIntroComplete={onIntroComplete}
        showBadge={true}
      />

      {/* 2. Tên nhân vật: ✦ Bé Lạc ✦ */}
      <div className="mt-1 flex items-center justify-center gap-2 font-black tracking-wide drop-shadow-[0_2px_8px_rgba(255,145,0,0.6)]">
        <span className="text-amber-300 text-sm sm:text-base">✦</span>
        <span className="text-white font-black text-lg sm:text-xl">Bé Lạc</span>
        <span className="text-amber-300 text-sm sm:text-base">✦</span>
      </div>

      {/* 3. Dải hiển thị Thanh mục tiêu kẹp giữa 2 dải sóng âm */}
      <div className="mt-2.5 flex items-center justify-center gap-2 sm:gap-3.5 w-full">
        {/* Sóng âm bên trái */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {waveHeightsLeft.map((h, i) => (
            <div
              key={`wl-${i}`}
              className="w-0.5 sm:w-1 bg-gradient-to-t from-orange-400 to-amber-300 rounded-full transition-all duration-150 shadow-[0_0_6px_rgba(255,145,0,0.6)]"
              style={{
                height: isListening
                  ? `${Math.max(4, h * (1 + audioVolume * 2.2))}px`
                  : `${h}px`,
              }}
            />
          ))}
        </div>

        {/* Capsule Thanh mục tiêu */}
        <button
          type="button"
          onClick={handlePlaySample}
          className="group inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-slate-950/45 hover:bg-slate-900/60 backdrop-blur-md border border-white/25 shadow-lg shadow-black/25 hover:border-amber-400/60 transition-all cursor-pointer text-white"
          title={`Nghe phát âm chuẩn: ${selectedTone.word}`}
        >
          <div className="w-5.5 h-5.5 rounded-full bg-red-500/30 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform border border-amber-400/40">
            <Target className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <span className="text-sm sm:text-base text-white/90 font-medium">
            Thanh mục tiêu:
          </span>
          <span className="text-base sm:text-lg font-black text-[#FFB703] tracking-tight group-hover:underline drop-shadow-xs">
            {selectedTone.word}
          </span>
          <Volume2 className="w-4 h-4 text-white/70 group-hover:text-amber-300 transition-colors" />
        </button>

        {/* Sóng âm bên phải */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {waveHeightsRight.map((h, i) => (
            <div
              key={`wr-${i}`}
              className="w-0.5 sm:w-1 bg-gradient-to-t from-orange-400 to-amber-300 rounded-full transition-all duration-150 shadow-[0_0_6px_rgba(255,145,0,0.6)]"
              style={{
                height: isListening
                  ? `${Math.max(4, h * (1 + audioVolume * 2.2))}px`
                  : `${h}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 4. Bốn chốt kết nối dạng viên nang (Capsule connectors) */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2 -mb-2 z-10">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 shadow-[0_0_8px_rgba(255,145,0,0.6)] border border-white/50"
          />
        ))}
      </div>
    </div>
  );
};
