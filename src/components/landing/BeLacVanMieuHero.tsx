import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, ArrowRight, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { VIETNAMESE_TONES } from '../../data/tones';
import { playToneAudio } from '../../utils/audioSynthesizer';

interface BeLacVanMieuHeroProps {
  onStartPractice: (toneId?: string) => void;
  onExploreFeatures: () => void;
}

export const BeLacVanMieuHero: React.FC<BeLacVanMieuHeroProps> = ({
  onStartPractice,
  onExploreFeatures,
}) => {
  const [activeToneId, setActiveToneId] = useState<string | null>(null);

  // Exact coordinates matching /public/assets/aistudio/image_36d1f537.png
  // Aspect ratio: 1772 x 1033
  const toneCardHotspots = [
    {
      id: 'sac',
      word: 'má',
      name: 'Thanh Sắc',
      desc: '320Hz ↗ 490Hz (Vút cao)',
      // Top-left card
      style: { top: '24.5%', left: '33.8%', width: '9.2%', height: '14.5%' },
    },
    {
      id: 'ngang',
      word: 'ma',
      name: 'Thanh Ngang',
      desc: '330Hz (Bằng phẳng)',
      // Mid-left card
      style: { top: '41.5%', left: '32.2%', width: '9.2%', height: '14.5%' },
    },
    {
      id: 'nang',
      word: 'mạ',
      name: 'Thanh Nặng',
      desc: '290Hz ⤓ 180Hz (Ngắt dứt)',
      // Bottom-left card
      style: { top: '65.5%', left: '36.8%', width: '9.2%', height: '14.5%' },
    },
    {
      id: 'huyen',
      word: 'mà',
      name: 'Thanh Huyền',
      desc: '300Hz ↘ 210Hz (Trầm dần)',
      // Top-right card
      style: { top: '25.0%', left: '67.2%', width: '9.2%', height: '14.5%' },
    },
    {
      id: 'hoi',
      word: 'mả',
      name: 'Thanh Hỏi',
      desc: '290Hz ↘ 210Hz ↗ 310Hz (Võng lượn)',
      // Mid-right card
      style: { top: '40.0%', left: '73.2%', width: '9.2%', height: '14.5%' },
    },
    {
      id: 'nga',
      word: 'mã',
      name: 'Thanh Ngã',
      desc: '320Hz ↗ 470Hz (Khựng gãy)',
      // Bottom-right card
      style: { top: '55.5%', left: '73.2%', width: '9.2%', height: '14.5%' },
    },
  ];

  const handleToneClick = (toneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveToneId(toneId);
    playToneAudio(toneId);
    // Directly navigate to /app with selected tone
    onStartPractice(toneId);
  };

  const handleToneHover = (toneId: string) => {
    setActiveToneId(toneId);
    playToneAudio(toneId);
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#172333] pt-16 sm:pt-20">
      {/* ================= DESKTOP & TABLET VIEW: FULL RESOLUTION 16:9 INTERACTIVE HERO ================= */}
      <div className="hidden md:block relative w-full max-w-[1920px] mx-auto select-none">
        {/* Main Reference Artwork Canvas */}
        <div className="relative w-full aspect-[1772/1033] overflow-hidden">
          <img
            src="/assets/aistudio/image_36d1f537.png"
            alt="Bé Lạc tại Văn Miếu, ngôi trường tiếng Việt – VietTone AI"
            className="w-full h-full object-cover pointer-events-none"
            loading="eager"
          />

          {/* INTERACTIVE HOTSPOTS LAYER */}
          <div className="absolute inset-0">
            {/* 1. Primary CTA: "▶ Bắt đầu học ngay" */}
            <button
              type="button"
              onClick={() => onStartPractice()}
              style={{
                top: '53.8%',
                left: '2.5%',
                width: '15.6%',
                height: '6.4%',
              }}
              className="absolute rounded-full cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] ring-2 ring-transparent hover:ring-amber-300/80 shadow-lg shadow-orange-600/30 group"
              title="Bắt đầu học ngay 6 thanh điệu tiếng Việt"
              aria-label="Bắt đầu học ngay"
            >
              <span className="sr-only">Bắt đầu học ngay</span>
              {/* Subtle hover shimmer */}
              <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* 2. Secondary CTA: "Khám phá VietTone AI >" */}
            <button
              type="button"
              onClick={onExploreFeatures}
              style={{
                top: '53.8%',
                left: '18.4%',
                width: '15.8%',
                height: '6.4%',
              }}
              className="absolute rounded-full cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] ring-2 ring-transparent hover:ring-white/80 shadow-md group"
              title="Khám phá các tính năng của VietTone AI"
              aria-label="Khám phá VietTone AI"
            >
              <span className="sr-only">Khám phá VietTone AI</span>
              <span className="absolute inset-0 rounded-full bg-white/15 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* 3. The 6 Interactive Tone Cards (ma, má, mà, mả, mã, mạ) */}
            {toneCardHotspots.map((card) => {
              const isActive = activeToneId === card.id;

              return (
                <div
                  key={card.id}
                  style={card.style}
                  onClick={(e) => handleToneClick(card.id, e)}
                  onMouseEnter={() => handleToneHover(card.id)}
                  onMouseLeave={() => setActiveToneId(null)}
                  className={`absolute rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-center group ${
                    isActive
                      ? 'scale-110 ring-4 ring-amber-300 shadow-2xl z-30'
                      : 'hover:scale-105 hover:ring-2 hover:ring-amber-200/90 z-20'
                  }`}
                  title={`${card.word} (${card.name}) - ${card.desc}. Bấm để luyện thanh này ngay!`}
                >
                  {/* Subtle pulsing highlight border when hovered */}
                  <div className="absolute inset-0 rounded-2xl bg-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Audio Speaker Hint Badge on Hover */}
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap bg-slate-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-300/80 shadow-md flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>Luyện "{card.word}"</span>
                  </div>
                </div>
              );
            })}

            {/* 4. Left Feature Badges: "Nghe phân biệt" & "Nói chuẩn thanh" */}
            <div
              style={{ top: '62.5%', left: '26.5%', width: '10.5%', height: '7.0%' }}
              onClick={() => onExploreFeatures()}
              className="absolute rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
              title="Nghe phân biệt âm sắc và cao độ"
            />
            <div
              style={{ top: '71.5%', left: '28.0%', width: '11.0%', height: '7.0%' }}
              onClick={() => onStartPractice()}
              className="absolute rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
              title="Nói chuẩn thanh điệu tiếng Việt"
            />

            {/* 5. Right Feature Badges: "Luyện tập cùng AI" & "Tiến bộ rõ ràng" */}
            <div
              style={{ top: '59.5%', left: '86.5%', width: '12.0%', height: '7.5%' }}
              onClick={() => onStartPractice()}
              className="absolute rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
              title="Luyện tập cùng AI nhận diện giọng nói"
            />
            <div
              style={{ top: '69.0%', left: '87.0%', width: '11.5%', height: '7.0%' }}
              onClick={() => onExploreFeatures()}
              className="absolute rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
              title="Theo dõi tiến bộ qua đường F0 và huy hiệu"
            />
          </div>
        </div>
      </div>

      {/* ================= MOBILE VIEW (<768px): ADAPTIVE & TAP-FRIENDLY ================= */}
      <div className="md:hidden px-4 py-8 space-y-6 text-white text-left">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
          <span>🏛️</span>
          <span>Bé Lạc tại Văn Miếu, ngôi trường tiếng Việt</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
          Học trọn vẹn <br />
          <span className="text-[#FFB347] drop-shadow-sm">
            6 thanh tiếng Việt
          </span>
        </h1>

        <p className="text-sm text-slate-200 leading-relaxed">
          Cùng Bé Lạc luyện nghe – nói – phát âm chuẩn 6 thanh với công nghệ AI thông minh, vui nhộn và hiệu quả.
        </p>

        {/* Mobile Visual Art Preview */}
        <div className="relative rounded-2xl overflow-hidden border border-amber-300/40 shadow-xl">
          <img
            src="/assets/aistudio/image_36d1f537.png"
            alt="Bé Lạc tại Văn Miếu"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Mobile 6 Tone Interactive Chips */}
        <div>
          <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Bấm nghe & chọn thanh để luyện:</span>
            <span className="text-[10px] text-slate-400 lowercase font-normal">chạm vào thẻ</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {VIETNAMESE_TONES.map((tone) => (
              <button
                key={tone.id}
                type="button"
                onClick={() => {
                  playToneAudio(tone.id);
                  onStartPractice(tone.id);
                }}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-center active:scale-95 transition-all cursor-pointer"
              >
                <div className="text-lg font-black text-white">{tone.word}</div>
                <div className="text-[10px] text-amber-300 font-bold">{tone.name.replace('Thanh ', '')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons for Mobile */}
        <div className="pt-2 space-y-2.5">
          <button
            type="button"
            onClick={() => onStartPractice()}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#FF5500] to-[#FF7700] text-white font-bold text-base shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Bắt đầu học ngay</span>
          </button>

          <button
            type="button"
            onClick={onExploreFeatures}
            className="w-full py-3 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm flex items-center justify-center gap-1.5"
          >
            <span>Khám phá VietTone AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
