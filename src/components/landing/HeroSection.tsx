import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Volume2, Mic, Activity, Sparkles, CheckCircle2 } from 'lucide-react';
import { VIETNAMESE_TONES } from '../../data/tones';
import { playToneAudio } from '../../utils/audioSynthesizer';

interface HeroSectionProps {
  onStartPractice: () => void;
  onExploreFeatures: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartPractice,
  onExploreFeatures,
}) => {
  const [activeToneIndex, setActiveToneIndex] = useState(1); // Mặc định: má (thanh sắc)
  const currentTone = VIETNAMESE_TONES[activeToneIndex];

  const handlePreviewTone = (index: number) => {
    setActiveToneIndex(index);
    playToneAudio(VIETNAMESE_TONES[index].id);
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC]">
      {/* Subtle Geometric Background Grid (Anti-slop, clean technical aesthetic) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'radial-gradient(#101827 1px, transparent 1px), radial-gradient(#101827 1px, #F8FAFC 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />

      {/* Subtle Ambient Radial Highlight */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 rounded-full bg-red-100/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* ================= LEFT COLUMN: HERO TYPOGRAPHY & CTAS ================= */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Eyebrow - Clean unboxed text with letter spacing */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#EF233C]"
            >
              <span>VietTone AI</span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="text-slate-500 normal-case tracking-normal font-semibold">
                Công nghệ Nhận diện & Cao độ Ngữ âm
              </span>
            </motion.div>

            {/* Main Headline - Bold, large, impactful */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#101827] tracking-tight leading-[1.1] text-balance"
            >
              Tiếng Việt hay hơn, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#EF233C] via-[#FF5722] to-[#FF9100] bg-clip-text text-transparent">
                mỗi ngày.
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed text-pretty"
            >
              Luyện 6 thanh điệu tiếng Việt bằng trí tuệ nhân tạo. Nghe, đọc, phân tích
              cao độ và khám phá tiến bộ của bạn.
            </motion.p>

            {/* Primary & Secondary Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
            >
              <button
                type="button"
                onClick={onStartPractice}
                className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#EF233C] to-[#E01E37] text-white font-bold text-base shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                <span>Bắt đầu luyện tập</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={onExploreFeatures}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-200 shadow-2xs hover:border-slate-300 transition-all duration-200 cursor-pointer"
              >
                <span>Khám phá VietTone AI</span>
              </button>
            </motion.div>

            {/* Zero-Pill Metadata Line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500"
            >
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Hoàn toàn miễn phí</span>
              </div>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span>100% xử lý âm thanh trên trình duyệt</span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span>Không gửi dữ liệu lên máy chủ</span>
            </motion.div>
          </div>

          {/* ================= RIGHT COLUMN: INTERACTIVE PRODUCT MOCKUP ================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            {/* Browser Mockup Container */}
            <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-900/10 overflow-hidden">
              {/* Browser Window Titlebar */}
              <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400/90" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/90" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/90" />
                </div>
                <div className="px-3 py-1 rounded-md bg-white border border-slate-200/70 text-[11px] font-mono text-slate-600 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>viettone.ai/app/studio</span>
                </div>
                <div className="w-12 text-right text-[11px] text-slate-400 font-semibold">
                  Live
                </div>
              </div>

              {/* Inner Product Interface Mockup */}
              <div className="p-4 sm:p-5 space-y-4 bg-slate-50/50">
                {/* Tone Selector Row in Mockup */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Chọn 1 trong 6 thanh mẫu
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Bấm để nghe âm thanh mẫu
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {VIETNAMESE_TONES.map((tone, idx) => {
                      const isSelected = idx === activeToneIndex;
                      return (
                        <button
                          key={tone.id}
                          type="button"
                          onClick={() => handlePreviewTone(idx)}
                          className={`p-2 rounded-xl text-center border transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-500/30 -translate-y-0.5'
                              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="block text-base sm:text-lg font-black leading-tight">
                            {tone.word}
                          </span>
                          <span
                            className={`block text-[10px] font-semibold mt-0.5 ${
                              isSelected ? 'text-red-100' : 'text-slate-500'
                            }`}
                          >
                            {tone.name.replace('Thanh ', '')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated Target Word & Audio Action */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-black text-2xl">
                      {currentTone.word}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {currentTone.name}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          ({currentTone.toneTitle})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {currentTone.pitchDescription}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => playToneAudio(currentTone.id)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 transition-colors cursor-pointer shrink-0"
                    title="Nghe lại âm mẫu chuẩn"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Pitch Contour Visualization Card (Interactive Preview) */}
                <div className="p-3.5 rounded-2xl bg-[#101827] text-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold tracking-tight">Đường cao độ F0 thời gian thực</span>
                    </div>
                    <span className="text-[11px] text-cyan-300 font-mono">
                      YIN Algorithm: 180Hz – 480Hz
                    </span>
                  </div>

                  {/* Simulated Dynamic Pitch Wave SVG */}
                  <div className="h-24 w-full bg-slate-900/90 rounded-xl relative overflow-hidden flex items-center px-3">
                    <svg
                      className="w-full h-full overflow-visible"
                      viewBox="0 0 300 80"
                      preserveAspectRatio="none"
                    >
                      {/* Grid background lines */}
                      <line x1="0" y1="20" x2="300" y2="20" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                      <line x1="0" y1="40" x2="300" y2="40" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                      <line x1="0" y1="60" x2="300" y2="60" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />

                      {/* Reference Contour (Cyan) */}
                      {activeToneIndex === 0 && (
                        <path d="M 10 40 Q 150 40 290 40" fill="none" stroke="#38BDF8" strokeWidth="3" />
                      )}
                      {activeToneIndex === 1 && (
                        <path d="M 10 65 Q 120 48 290 15" fill="none" stroke="#F59E0B" strokeWidth="3" />
                      )}
                      {activeToneIndex === 2 && (
                        <path d="M 10 30 Q 150 55 290 70" fill="none" stroke="#10B981" strokeWidth="3" />
                      )}
                      {activeToneIndex === 3 && (
                        <path d="M 10 35 Q 120 70 200 65 T 290 42" fill="none" stroke="#A855F7" strokeWidth="3" />
                      )}
                      {activeToneIndex === 4 && (
                        <path d="M 10 30 Q 90 20 140 45 Q 180 50 290 12" fill="none" stroke="#F43F5E" strokeWidth="3" />
                      )}
                      {activeToneIndex === 5 && (
                        <path d="M 10 35 Q 100 60 180 75" fill="none" stroke="#6366F1" strokeWidth="3" />
                      )}

                      {/* Student Simulation Contour (Dotted white) */}
                      {activeToneIndex === 1 && (
                        <path d="M 10 62 Q 130 45 285 18" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 3" />
                      )}
                      {activeToneIndex !== 1 && (
                        <path d="M 10 42 Q 140 40 285 41" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 3" />
                      )}
                    </svg>

                    <div className="absolute top-2 right-3 flex items-center gap-3 text-[10px] font-mono">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <span className="w-2 h-0.5 bg-cyan-400" /> Mẫu chuẩn
                      </span>
                      <span className="flex items-center gap-1 text-white">
                        <span className="w-2 h-0.5 bg-white border-b border-dashed" /> Giọng học sinh
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">
                      Độ tương đồng đường nét F0 (DTW):
                    </span>
                    <span className="font-bold text-emerald-400 font-mono">
                      88/100 · Rất khớp
                    </span>
                  </div>
                </div>

                {/* Callout to enter app */}
                <button
                  type="button"
                  onClick={onStartPractice}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#EF233C] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Bật micro và luyện đọc ngay trong ứng dụng</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
