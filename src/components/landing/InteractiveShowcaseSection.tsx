import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Mic, Activity, CheckCircle, ArrowRight, Sparkles, Sliders, Check } from 'lucide-react';
import { VIETNAMESE_TONES } from '../../data/tones';
import { playToneAudio } from '../../utils/audioSynthesizer';
import beLacCharImg from '../../assets/images/be_lac_character_1794143374801.jpg';

interface InteractiveShowcaseSectionProps {
  onGoToApp: () => void;
}

export const InteractiveShowcaseSection: React.FC<InteractiveShowcaseSectionProps> = ({ onGoToApp }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Chọn thanh và nghe mẫu',
      description:
        'Lựa chọn 1 trong 6 thanh điệu (ngang, sắc, huyền, hỏi, ngã, nặng) cùng từ vựng mục tiêu. Nghe phát âm mẫu và âm sắc mô phỏng cao độ để ghi nhớ ngữ điệu trước khi đọc.',
      details: [
        '6 thẻ thanh điệu trực quan với ký hiệu ngữ âm',
        'Âm mẫu chuẩn hỗ trợ giọng đọc tiếng Việt và sóng cao độ',
        'Mẹo định hướng vị trí vòm họng và độ mở khẩu hình',
      ],
      previewType: 'tone_selection',
    },
    {
      number: '02',
      title: 'Đọc vào microphone',
      description:
        'Nhấn nút micro lớn và phát âm từ vựng. Bộ phát hiện giọng nói (VAD) tự động lọc bỏ khoảng lặng thừa ở đầu và cuối bản ghi, cân bằng âm lượng RMS giúp bản ghi chuẩn xác.',
      details: [
        'VAD Preprocessor tự động nhận diện Onset/Offset tiếng nói',
        'Peak Normalization chống rè và hạn chế méo tiếng',
        'Xử lý trực tiếp trong RAM, không lưu dữ liệu nhạy cảm',
      ],
      previewType: 'mic_record',
    },
    {
      number: '03',
      title: 'Nhìn thấy AI phân tích',
      description:
        'Mô hình Teachable Machine CNN phân tích phổ tần số Spectrogram đồng thời thuật toán YIN trích xuất đường cao độ cơ bản F0 theo chuỗi mili-giây.',
      details: [
        'Xác suất 6 thanh điệu tức thời theo thời gian thực',
        'Đường cong cao độ F0 (Hz) biểu diễn trực quan',
        'Bộ dung hợp Hybrid giải quyết mâu thuẫn vật lý',
      ],
      previewType: 'ai_analysis',
    },
    {
      number: '04',
      title: 'Nhận phản hồi và luyện tiếp',
      description:
        'Hệ thống so khớp đường F0 của bạn với mẫu chuẩn bằng Dynamic Time Warping (DTW), hiển thị điểm tương đồng 0–100, lời khuyên sửa khẩu hình và Bé Lạc đồng hành khích lệ.',
      details: [
        'Điểm tương đồng F0 chính xác (0–100)',
        'Lời khuyên sư phạm: "Cần nâng cao độ", "Hạ giọng đều"',
        'Cộng dồn chuỗi ngày rèn luyện và mở khóa huy hiệu',
      ],
      previewType: 'feedback_result',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-[#F8FAFC] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#EF233C]"
          >
            <span>Quy trình tương tác</span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-slate-500 normal-case tracking-normal font-semibold">
              4 bước sư phạm trực quan
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#101827] tracking-tight leading-tight"
          >
            Học phát âm bằng mắt và tai.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 leading-relaxed text-pretty"
          >
            Từng bước luyện tập được tối ưu để học sinh quan sát sự khác biệt giữa cách mình nói
            và chuẩn ngữ âm của giáo viên.
          </motion.p>
        </div>

        {/* Desktop Sticky Showcase Layout / Mobile Sequential */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ================= LEFT COLUMN: STEP LIST (CLICKABLE OR SCROLLABLE) ================= */}
          <div className="lg:col-span-5 space-y-4">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={step.number}
                  onClick={() => setActiveStep(idx)}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 cursor-pointer text-left ${
                    isActive
                      ? 'bg-white border-red-500 shadow-md shadow-red-500/10'
                      : 'bg-white/70 hover:bg-white border-slate-200/90 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-red-50 text-[#EF233C]'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      BƯỚC {step.number}
                    </span>
                    <h3
                      className={`text-base sm:text-lg font-bold tracking-tight ${
                        isActive ? 'text-[#101827]' : 'text-slate-800'
                      }`}
                    >
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Bullet points for active step */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600"
                    >
                      {step.details.map((detail) => (
                        <div key={detail} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ================= RIGHT COLUMN: INTERACTIVE STICKY PREVIEW CARD ================= */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl min-h-[440px] flex flex-col justify-between relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Dynamic Preview Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-slate-300">
                    Mô phỏng Giao diện Thực · Bước {steps[activeStep].number}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {steps[activeStep].previewType}
                </span>
              </div>

              {/* Step Animated Dynamic Content Area */}
              <div className="py-6 flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {/* PREVIEW 01: TONE SELECTION & SAMPLE LISTENING */}
                  {activeStep === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.35 }}
                      className="space-y-4"
                    >
                      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl font-black text-amber-400">má</span>
                            <div>
                              <div className="font-bold text-sm text-white">Thanh Sắc (Dấu ´)</div>
                              <div className="text-xs text-slate-400">Vút lên dốc nhanh: 320Hz ↗ 490Hz</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => playToneAudio('sac')}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Nghe mẫu</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          "Mẹo: Hãy nâng cao độ vút lên dốc như nốt Sol lên nốt Đố trong âm nhạc."
                        </p>
                      </div>

                      <div className="grid grid-cols-6 gap-1.5 text-center text-xs">
                        {VIETNAMESE_TONES.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => playToneAudio(t.id)}
                            className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-xl cursor-pointer transition-colors"
                          >
                            <div className="font-bold text-white text-sm">{t.word}</div>
                            <div className="text-[10px] text-slate-400">{t.symbol}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* PREVIEW 02: MICROPHONE RECORDING WITH VAD */}
                  {activeStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.35 }}
                      className="space-y-4"
                    >
                      <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center space-y-4">
                        <div className="relative inline-block">
                          <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-600/40 animate-pulse">
                            <Mic className="w-8 h-8" />
                          </div>
                          <div className="absolute -inset-2 rounded-full border border-red-500/40 animate-ping pointer-events-none" />
                        </div>

                        <div>
                          <div className="text-sm font-bold text-white">Đang thu âm tiếng nói...</div>
                          <div className="text-xs text-slate-400 mt-1">
                            VAD Preprocessor đang phân tích năng lượng RMS
                          </div>
                        </div>

                        {/* Animated Voice Waveform Simulator */}
                        <div className="flex items-center justify-center gap-1.5 h-10">
                          {[30, 60, 90, 45, 80, 100, 65, 85, 40, 70, 95, 50, 30].map((h, i) => (
                            <div
                              key={i}
                              className="w-1.5 bg-gradient-to-t from-red-500 to-amber-400 rounded-full transition-all duration-150"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-center text-[11px] text-slate-400">
                        Cắt bỏ 180ms khoảng lặng trước khi chuyển vào mạng nơ-ron
                      </div>
                    </motion.div>
                  )}

                  {/* PREVIEW 03: DUAL-STREAM AI ANALYSIS */}
                  {activeStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.35 }}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                          <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5" />
                            <span>Nhánh YIN F0</span>
                          </div>
                          <div className="text-[11px] text-slate-300">
                            Cao độ: <strong>335Hz ↗ 482Hz</strong>
                          </div>
                          <div className="text-[10px] text-emerald-400 mt-1">
                            Quy luật: Dốc lên đúng chuẩn thanh sắc
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                          <div className="text-amber-400 font-bold mb-1 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Nhánh CNN Model</span>
                          </div>
                          <div className="text-[11px] text-slate-300">
                            Xác suất: <strong>Thanh sắc (94%)</strong>
                          </div>
                          <div className="text-[10px] text-cyan-400 mt-1">
                            Độ tự tin: Rất cao (Unanimous)
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Bộ dung hợp Hybrid Engine: Đồng thuận tuyệt đối 6 thanh</span>
                      </div>
                    </motion.div>
                  )}

                  {/* PREVIEW 04: DTW SCORE & ADVICE */}
                  {activeStep === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.35 }}
                      className="space-y-3"
                    >
                      <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-800/90 border border-slate-700 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-400">Độ tương đồng đường cao độ F0</div>
                          <div className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
                            89<span className="text-base text-slate-400">/100</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            So sánh qua thuật toán Dynamic Time Warping (DTW)
                          </div>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-bold text-lg">
                          +11
                        </div>
                      </div>

                      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400 shrink-0 bg-white shadow-2xs">
                          <img src={beLacCharImg} alt="Bé Lạc" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">Bé Lạc đồng hành:</p>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            "Tuyệt vời! Đường cao độ của bạn đang gần với mẫu hơn lần trước 11 điểm F0!"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Action in Preview */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Sẵn sàng tự mình trải nghiệm?
                </span>
                <button
                  type="button"
                  onClick={onGoToApp}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <span>Bắt đầu ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
