import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Info, Volume2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { VIETNAMESE_TONES } from '../../data/tones';
import { playToneAudio } from '../../utils/audioSynthesizer';

interface F0ExplainedSectionProps {
  onGoToApp: () => void;
}

export const F0ExplainedSection: React.FC<F0ExplainedSectionProps> = ({ onGoToApp }) => {
  const [selectedToneIdx, setSelectedToneIdx] = useState(1); // Default: má (thanh sắc)
  const currentTone = VIETNAMESE_TONES[selectedToneIdx];

  // Definition of typical pitch contours for the 6 Vietnamese tones
  const toneF0Details: Record<
    string,
    {
      hzRange: string;
      direction: string;
      refPath: string;
      studentPath: string;
      score: number;
      explanation: string;
    }
  > = {
    ngang: {
      hzRange: '320Hz – 335Hz',
      direction: 'Bằng phẳng, ngang đều',
      refPath: 'M 20 100 L 480 100',
      studentPath: 'M 20 105 Q 250 97 480 102',
      score: 93,
      explanation: 'Thanh ngang giữ một cao độ tương đối ổn định suốt chiều dài âm tiết.',
    },
    sac: {
      hzRange: '310Hz ↗ 490Hz',
      direction: 'Vút lên cao dốc',
      refPath: 'M 20 150 Q 200 115 480 35',
      studentPath: 'M 20 145 Q 220 110 480 42',
      score: 91,
      explanation: 'Thanh sắc bắt đầu ở tầm trung bình và vút nhanh lên âm vực cao nhất.',
    },
    huyen: {
      hzRange: '300Hz ↘ 210Hz',
      direction: 'Trầm xuống dần, dịu êm',
      refPath: 'M 20 60 Q 240 120 480 165',
      studentPath: 'M 20 65 Q 230 125 480 160',
      score: 89,
      explanation: 'Thanh huyền hạ thấp dần đều, ngân nhẹ và kết thúc ở vùng âm vực trầm.',
    },
    hoi: {
      hzRange: '290Hz ↘ 210Hz ↗ 310Hz',
      direction: 'Võng xuống rồi uốn lượn lên',
      refPath: 'M 20 70 Q 200 170 300 155 Q 390 140 480 90',
      studentPath: 'M 20 75 Q 190 165 295 150 Q 380 135 480 100',
      score: 86,
      explanation: 'Thanh hỏi có điểm võng (dip) hạ sâu trước khi hơi lượn nhẹ lên lại.',
    },
    nga: {
      hzRange: '320Hz ↗ 390Hz [Khựng] ↗ 470Hz',
      direction: 'Lên cao, ngắt thanh môn, vút lên',
      refPath: 'M 20 85 Q 160 55 240 95 Q 260 115 280 85 Q 370 45 480 25',
      studentPath: 'M 20 90 Q 150 60 235 100 Q 260 120 285 90 Q 365 50 480 32',
      score: 84,
      explanation: 'Thanh ngã đi lên, có khựng ngắt thanh môn đột ngột ở giữa rồi lại vút lên.',
    },
    nang: {
      hzRange: '290Hz ⤓ 180Hz (Ngắt dứt)',
      direction: 'Rơi thẳng xuống đáy, dứt khoát',
      refPath: 'M 20 75 Q 150 140 310 180',
      studentPath: 'M 20 80 Q 140 145 300 175',
      score: 90,
      explanation: 'Thanh nặng tụt nhanh xuống đáy âm vực và bị chặn dứt khoát bởi thanh môn.',
    },
  };

  const currentF0 = toneF0Details[currentTone.id] || toneF0Details['sac'];

  return (
    <section id="f0-explained" className="py-24 sm:py-32 bg-[#101827] text-white relative overflow-hidden">
      {/* Subtle Grid on dark background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(#FFFFFF 1px, transparent 1px), radial-gradient(#FFFFFF 1px, #101827 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400"
          >
            <span>Công nghệ Phân tích Cao độ F0</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-slate-400 normal-case tracking-normal font-semibold">
              Fundamental Frequency Tracking
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight"
          >
            Nhìn thấy thanh điệu trong chính giọng nói.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 leading-relaxed text-pretty"
          >
            Tiếng Việt là ngôn ngữ thanh điệu. Khi bạn nói, tần số dao động cơ bản của dây
            thanh quản (F0) vẽ nên đường nét riêng biệt cho từng thanh.
          </motion.p>
        </div>

        {/* Tone Selector Tabs for Interactive F0 Chart */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {VIETNAMESE_TONES.map((tone, idx) => {
            const isSelected = idx === selectedToneIdx;
            return (
              <button
                key={tone.id}
                type="button"
                onClick={() => {
                  setSelectedToneIdx(idx);
                  playToneAudio(tone.id);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md shadow-red-600/30 -translate-y-0.5'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                }`}
              >
                <span className="font-mono text-sm">{tone.word}</span>
                <span className="text-[11px] font-normal opacity-85">({tone.name.replace('Thanh ', '')})</span>
              </button>
            );
          })}
        </div>

        {/* Big Interactive F0 Chart Display */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-white font-mono">{currentTone.word}</span>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{currentTone.name}</span>
                    <span className="text-xs font-mono text-cyan-400">({currentF0.direction})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{currentF0.explanation}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => playToneAudio(currentTone.id)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Nghe thanh này</span>
              </button>

              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  Độ tương đồng F0 (DTW)
                </div>
                <div className="text-lg font-mono font-bold text-emerald-400">
                  {currentF0.score}/100
                </div>
              </div>
            </div>
          </div>

          {/* SVG F0 Visualization Canvas */}
          <div className="py-6">
            <div className="h-64 sm:h-80 w-full bg-slate-950 rounded-2xl relative overflow-hidden border border-slate-800/80 p-4 flex flex-col justify-between">
              {/* Pitch Axis (Hz) Labels on Left */}
              <div className="absolute left-3 top-3 bottom-3 flex flex-col justify-between text-[10px] font-mono text-slate-500 pointer-events-none">
                <span>500 Hz (Cao vút)</span>
                <span>400 Hz</span>
                <span>300 Hz (Trung bình)</span>
                <span>200 Hz</span>
                <span>100 Hz (Trầm sâu)</span>
              </div>

              {/* Time Axis Labels on Bottom */}
              <div className="absolute left-24 right-4 bottom-2 flex justify-between text-[10px] font-mono text-slate-500 pointer-events-none">
                <span>0 ms (Bắt đầu âm tiết)</span>
                <span>150 ms</span>
                <span>300 ms</span>
                <span>450 ms</span>
                <span>600 ms (Kết thúc)</span>
              </div>

              {/* Grid Lines */}
              <svg
                className="w-full h-full pl-20 pr-4 pb-6 pt-2"
                viewBox="0 0 500 200"
                preserveAspectRatio="none"
              >
                <line x1="0" y1="20" x2="500" y2="20" stroke="#1E293B" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="65" x2="500" y2="65" stroke="#1E293B" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="#1E293B" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1="155" x2="500" y2="155" stroke="#1E293B" strokeDasharray="4 4" strokeWidth="1" />

                {/* Reference Curve (Cyan Neon Line) */}
                <path
                  d={currentF0.refPath}
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />

                {/* Student Pitch Curve (Emerald/Amber Dotted Line) */}
                <path
                  d={currentF0.studentPath}
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              </svg>

              {/* Legend Badges */}
              <div className="absolute top-4 right-5 flex items-center gap-4 text-xs font-mono bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-xs">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <span className="w-3 h-1 bg-cyan-400 rounded-full" />
                  Mẫu tham chiếu chuẩn
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-3 h-1 bg-emerald-400 border-b border-dashed" />
                  Đường giọng người học
                </span>
              </div>
            </div>
          </div>

          {/* Transparent Scientific Disclaimer & Note */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-slate-300">Ghi chú minh họa:</strong> Biểu đồ trên trang giới thiệu
                dùng dữ liệu minh họa. Trong ứng dụng <code className="text-cyan-400 font-mono">/app</code>,
                biểu đồ vẽ 100% dữ liệu thực được trích xuất từ giọng nói thật của bạn qua Web Audio API.
              </p>
            </div>

            <button
              type="button"
              onClick={onGoToApp}
              className="inline-flex items-center gap-1 text-white hover:text-cyan-400 font-bold shrink-0 transition-colors cursor-pointer"
            >
              <span>Luyện đường F0 thật</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
