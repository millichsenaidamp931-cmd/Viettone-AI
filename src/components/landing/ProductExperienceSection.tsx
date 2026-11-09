import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Activity, Compass, ArrowRight, ShieldCheck, Zap, Layers, BarChart3 } from 'lucide-react';

interface ProductExperienceSectionProps {
  onGoToApp: () => void;
}

export const ProductExperienceSection: React.FC<ProductExperienceSectionProps> = ({ onGoToApp }) => {
  return (
    <section id="features" className="py-24 sm:py-32 bg-white relative overflow-hidden">
      {/* Decorative hairline divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-6xl h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#EF233C]"
          >
            <span>Trải nghiệm sản phẩm</span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-slate-500 normal-case tracking-normal font-semibold">
              Được thiết kế cho thế hệ học sinh mới
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#101827] tracking-tight leading-tight"
          >
            Một cách mới để luyện thanh điệu tiếng Việt.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 leading-relaxed text-pretty"
          >
            Không chỉ phán đoán đúng hay sai. VietTone AI kết hợp mạng nơ-ron học chuyển giao
            cùng giải thuật trích xuất cao độ vật lý, giúp bạn nhìn thấy rõ ngữ điệu từng phát âm.
          </motion.p>
        </div>

        {/* Asymmetric Bento Grid (3 distinct blocks with visual weight hierarchy) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* ================= BLOCK 1: AI 6 TONES SPECTROGRAM (HERO CARD - SPAN 7) ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 rounded-3xl bg-slate-900 text-white p-7 sm:p-9 border border-slate-800 flex flex-col justify-between shadow-xl relative overflow-hidden group"
          >
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-red-600/15 transition-colors" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-[#EF233C] flex items-center justify-center border border-red-500/30">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                  TensorFlow.js CNN + VAD
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  1. AI nhận diện 6 thanh điệu tức thì
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Mô hình Google Teachable Machine Audio chạy trực tiếp trên trình duyệt qua Web Audio API.
                  Phân tích phổ âm thanh FFT trong từng mili-giây và tính xác suất cho cả 6 thanh:
                  ngang (ma), sắc (má), huyền (mà), hỏi (mả), ngã (mã), nặng (mạ).
                </p>
              </div>

              {/* Visual Interactive Preview of 6 Tone Bars */}
              <div className="pt-4 space-y-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Phổ phân phối xác suất thời gian thực</span>
                  <span className="text-emerald-400 font-mono font-bold">Thanh Sắc: 96%</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-12 text-slate-400 font-mono">má (sắc)</span>
                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full w-[96%]" />
                    </div>
                    <span className="w-8 text-right font-mono font-bold text-white">96%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-12 text-slate-400 font-mono">mã (ngã)</span>
                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-700 rounded-full w-[3%]" />
                    </div>
                    <span className="w-8 text-right font-mono text-slate-400">3%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-12 text-slate-400 font-mono">mả (hỏi)</span>
                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-700 rounded-full w-[1%]" />
                    </div>
                    <span className="w-8 text-right font-mono text-slate-400">1%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 relative z-10">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Không giật lag, hoạt động offline
              </span>
              <button
                type="button"
                onClick={onGoToApp}
                className="text-white hover:text-[#EF233C] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Thử ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* ================= RIGHT COLUMN (SPAN 5): BLOCKS 2 & 3 STACKED ================= */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* ================= BLOCK 2: F0 PITCH ESTIMATION ================= */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-3xl bg-[#F8FAFC] border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Web Audio · YIN Algorithm
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#101827] tracking-tight">
                    2. Phân tích đường cao độ F0
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Trích xuất tần số cơ bản của dây thanh quản (Hz) theo chuỗi thời gian.
                    Tự động loại bỏ nhiễu và so sánh độ tương đồng hình học với giọng mẫu chuẩn
                    của giáo viên bằng thuật toán Dynamic Time Warping (DTW).
                  </p>
                </div>

                {/* Pitch Mini Wave Graphic */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
                    <span className="text-xs font-medium text-slate-700">Độ dốc cao độ F0</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-700">
                    320Hz ↗ 490Hz (Dốc lên)
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ================= BLOCK 3: PERSONAL ROADMAP & STREAK ================= */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="rounded-3xl bg-[#F8FAFC] border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Bé Lạc Companion
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#101827] tracking-tight">
                    3. Lộ trình và tiến bộ cá nhân
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Theo dõi hành trình chinh phục 6 thanh qua 4 bước sư phạm: Khám phá,
                    Định hình, Tinh chỉnh và Làm chủ. Hệ thống lưu tiến độ tự động trên máy
                    và đề xuất bài luyện tiếp theo phù hợp với bạn.
                  </p>
                </div>

                {/* Mini Motivation Engine Callout */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                  <span className="text-xl">🐣</span>
                  <p className="text-xs text-slate-600 italic">
                    "AI đã nhận diện rõ thanh bạn đang luyện. Hãy tiếp tục duy trì nhé!"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
