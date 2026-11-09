import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Heart, Sparkles } from 'lucide-react';

interface FinalCtaSectionProps {
  onGoToApp: () => void;
  onOpenArchitecture?: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onGoToApp, onOpenArchitecture }) => {
  return (
    <footer className="bg-slate-900 text-white relative overflow-hidden">
      {/* Top CTA Banner Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-r from-[#EF233C] via-[#FF5722] to-[#FF9100] p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
        >
          {/* Subtle Ambient Shapes */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-black/10 blur-2xl pointer-events-none" />

          {/* Left Text Block */}
          <div className="max-w-2xl space-y-3 text-center md:text-left relative z-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-100/90 font-mono">
              VietTone AI 3.0 Platform
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Bắt đầu hành trình luyện tiếng Việt của bạn.
            </h2>
            <p className="text-sm sm:text-base text-red-100 max-w-xl leading-relaxed">
              Trải nghiệm ngay trên trình duyệt mà không cần cài đặt hoặc đăng ký tài khoản.
              Luyện 6 thanh điệu, nghe đối chiếu F0 và xây dựng sự tự tin mỗi ngày.
            </p>
          </div>

          {/* Right Action Button */}
          <div className="relative z-10 shrink-0">
            <button
              type="button"
              onClick={onGoToApp}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#101827] hover:bg-black text-white font-bold text-base shadow-xl transition-all duration-200 hover:scale-105 active:scale-100 cursor-pointer"
            >
              <span>Trải nghiệm VietTone AI</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-6 border-t border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Col (Span 5) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#EF233C] to-[#FF9100] flex items-center justify-center text-white font-black text-sm">
                VT
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                VietTone <span className="text-[#EF233C]">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Dự án nghiên cứu và phát triển giải pháp hỗ trợ học sinh và người nước ngoài
              luyện nghe, phát âm 6 thanh điệu tiếng Việt ứng dụng AI, Web Audio API và
              thuật toán bóc tách cao độ F0.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Client-side. Quyền riêng tư microphone được bảo đảm an toàn.</span>
            </div>
          </div>

          {/* Links Col 1 (Span 4) */}
          <div className="md:col-span-4 space-y-2 text-xs">
            <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-2">
              Khám phá ứng dụng
            </div>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={onGoToApp}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Phòng Luyện phát âm (Studio)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onGoToApp}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Lộ trình 4 giai đoạn học tập
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onGoToApp}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Bảng tiến bộ & Chuỗi ngày streak
                </button>
              </li>
              {onOpenArchitecture && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenArchitecture}
                    className="hover:text-cyan-400 transition-colors cursor-pointer text-cyan-400/90"
                  >
                    Sơ đồ luồng xử lý Code Flow Diagram
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Team & Tech Col (Span 3) */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-2">
              Công nghệ lõi
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              • Google Teachable Machine Audio CNN<br />
              • Web Audio API & Thuật toán YIN F0<br />
              • Dynamic Time Warping (DTW)<br />
              • VAD Voice Activity Preprocessor<br />
              • React, TypeScript & Tailwind CSS
            </p>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 mt-8 border-t border-slate-800 text-center sm:flex sm:justify-between sm:items-center text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} VietTone AI. Dự án Giáo dục Ngữ âm Tiếng Việt.</p>
          <p className="mt-2 sm:mt-0 flex items-center justify-center gap-1">
            Xây dựng với tâm huyết vì vẻ đẹp ngôn ngữ tiếng Việt
          </p>
        </div>
      </div>
    </footer>
  );
};
