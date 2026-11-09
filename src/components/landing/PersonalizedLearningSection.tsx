import React from 'react';
import { motion } from 'motion/react';
import { Compass, TrendingUp, Flame, Award, ArrowRight, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import beLacCharImg from '../../assets/images/be_lac_character_1794143374801.jpg';

interface PersonalizedLearningSectionProps {
  onGoToApp: () => void;
}

export const PersonalizedLearningSection: React.FC<PersonalizedLearningSectionProps> = ({ onGoToApp }) => {
  return (
    <section id="roadmap" className="py-24 sm:py-32 bg-white relative overflow-hidden">
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
            <span>Hệ Thống Động Lực Học Tập</span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-slate-500 normal-case tracking-normal font-semibold">
              VietTone Motivation Engine
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#101827] tracking-tight leading-tight"
          >
            Lộ trình cá nhân & Người bạn đồng hành.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 leading-relaxed text-pretty"
          >
            Lấy cảm hứng từ cơ chế khích lệ của Duolingo nhưng xây dựng riêng cho ngữ âm tiếng Việt,
            giúp bạn kiên trì và hình thành thói quen rèn luyện mỗi ngày.
          </motion.p>
        </div>

        {/* Bento Grid: 4 complementary cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: 4-Step Roadmap Preview (Span 8) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-8 rounded-3xl bg-slate-50 border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between shadow-xs"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-red-100 text-[#EF233C] flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#101827] text-lg">Lộ trình 4 giai đoạn sư phạm</h3>
                    <p className="text-xs text-slate-500">Phát triển tự nhiên từ nhận biết đến thuần thục</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  Pedagogical Framework
                </span>
              </div>

              {/* 4 Steps timeline preview */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3">
                <div className="p-3 bg-white rounded-2xl border border-slate-200/80">
                  <div className="text-[10px] font-mono font-bold text-slate-400">GIAI ĐOẠN 1</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">Khám phá</div>
                  <div className="text-[11px] text-slate-500 mt-1">Nghe mẫu, làm quen ngữ điệu</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200/80">
                  <div className="text-[10px] font-mono font-bold text-slate-400">GIAI ĐOẠN 2</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">Định hình</div>
                  <div className="text-[11px] text-slate-500 mt-1">Luyện đọc và đối chiếu F0</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200/80">
                  <div className="text-[10px] font-mono font-bold text-slate-400">GIAI ĐOẠN 3</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">Tinh chỉnh</div>
                  <div className="text-[11px] text-slate-500 mt-1">Sửa lỗi gãy, dốc, cao độ</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-red-200 bg-red-50/30">
                  <div className="text-[10px] font-mono font-bold text-red-500">GIAI ĐOẠN 4</div>
                  <div className="font-bold text-red-700 text-sm mt-0.5">Làm chủ</div>
                  <div className="text-[11px] text-red-600/80 mt-1">Chuỗi &gt;80 điểm F0 ổn định</div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500">
              <span>Đánh giá khách quan dựa trên lịch sử tối thiểu 3 lượt đọc</span>
              <button
                type="button"
                onClick={onGoToApp}
                className="text-[#EF233C] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Xem lộ trình chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Card 2: Bé Lạc Companion (Span 4) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-4 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 p-6 sm:p-7 flex flex-col justify-between shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300 shadow-xs bg-white">
                  <img src={beLacCharImg} alt="Bé Lạc" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                  Bé Lạc AI
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">Người bạn đồng hành</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Động viên thông minh dựa trên kết quả thực tế, không dùng lời sáo rỗng.
                </p>
              </div>

              <div className="p-3.5 bg-white/90 rounded-2xl border border-amber-200 text-xs text-slate-700 space-y-1 shadow-2xs">
                <div className="font-bold text-amber-900">Thông điệp gần nhất:</div>
                <p className="italic">
                  "Ba ngày bền bỉ! Bạn đang tạo nên một thói quen học tập rất tốt."
                </p>
              </div>
            </div>

            <div className="text-[11px] text-amber-800/80 font-medium pt-3">
              Quy tắc động viên dựa trên dữ liệu thực tế
            </div>
          </motion.div>

          {/* Card 3: Streak Tracker & Habit (Span 5) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-5 rounded-3xl bg-slate-900 text-white p-6 sm:p-7 flex flex-col justify-between shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                  <Flame className="w-5 h-5 fill-orange-400" />
                </div>
                <span className="text-xs font-mono text-orange-300">Daily Streak</span>
              </div>

              <div>
                <div className="text-3xl font-black font-mono text-orange-400 flex items-baseline gap-2">
                  <span>3 NGÀY</span>
                  <span className="text-xs text-slate-400 font-sans font-normal">liên tiếp</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Luyện tập mỗi ngày giúp cơ quan phát âm ghi nhớ cao độ tự nhiên.
                  Hệ thống tự động đồng bộ ngày học qua LocalStorage.
                </p>
              </div>

              <div className="flex items-center gap-1.5 pt-2">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => (
                  <div
                    key={d}
                    className={`flex-1 py-1.5 rounded-lg text-center font-mono text-[11px] ${
                      i < 3
                        ? 'bg-orange-500 text-white font-bold'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 4: Milestone Badges (Span 7) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-7 rounded-3xl bg-slate-50 border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Huy hiệu thành tích</h3>
                    <p className="text-xs text-slate-500">Ghi nhận từng mốc nỗ lực bền bỉ</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center">
                  <div className="text-2xl mb-1">🌱</div>
                  <div className="font-bold text-xs text-slate-800">Khởi đầu tự tin</div>
                  <div className="text-[10px] text-slate-400">Lượt đọc đầu tiên</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="font-bold text-xs text-slate-800">Kiên trì 10 lượt</div>
                  <div className="text-[10px] text-slate-400">Đạt 10 lần luyện</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="font-bold text-xs text-slate-800">Chuỗi 3 ngày</div>
                  <div className="text-[10px] text-slate-400">Duy trì thói quen</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="font-bold text-xs text-slate-800">Cao độ chuẩn</div>
                  <div className="text-[10px] text-slate-400">Điểm F0 &gt; 80</div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Huy hiệu được cấp tự động sau mỗi lượt đọc đủ điều kiện</span>
              <button
                type="button"
                onClick={onGoToApp}
                className="font-bold text-[#101827] hover:text-[#EF233C] transition-colors cursor-pointer"
              >
                Mở ứng dụng
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
