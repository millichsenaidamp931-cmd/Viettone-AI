/**
 * VietTone AI - Lộ trình học tập của bạn (Personal Learning Roadmap)
 * 
 * Hướng dẫn bài luyện 4 bước, đề xuất thanh cần luyện tiếp theo và
 * chỉ đưa ra nhận xét sơ bộ khi có đủ tối thiểu 3 lượt hợp lệ cho từng thanh.
 * Kết hợp thông điệp định hướng từ người bạn đồng hành Bé Lạc.
 */

import React from 'react';
import { ToneRoadmapStat, ToneId, StreakInfo } from '../types';
import { Compass, Volume2, BookOpen, ArrowRight, HelpCircle, Sparkles, Flame } from 'lucide-react';
import { playToneAudio } from '../utils/audioSynthesizer';

interface LearningRoadmapProps {
  stats: ToneRoadmapStat[];
  nextRecommended: { toneId: ToneId; reason: string };
  streakInfo: StreakInfo;
  onSelectToneId: (toneId: ToneId) => void;
}

export const LearningRoadmap: React.FC<LearningRoadmapProps> = ({
  stats,
  nextRecommended,
  streakInfo,
  onSelectToneId,
}) => {
  const practicedCount = stats.filter((s) => s.totalAttempts > 0).length;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs my-3 sm:my-4">
      {/* Tiêu đề khu vực */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Lộ trình học tập của bạn
            </h2>
            <p className="text-xs text-slate-500">
              Kế hoạch rèn luyện 6 thanh điệu cá nhân hoá dựa trên dữ liệu thực tế
            </p>
          </div>
        </div>

        {/* Thanh đề xuất luyện tiếp theo */}
        <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 px-3.5 py-2 rounded-xl text-xs shadow-2xs">
          <Sparkles className="w-4 h-4 text-red-600 shrink-0" />
          <div className="flex-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold block">
              Đề xuất luyện tiếp:
            </span>
            <span className="font-bold text-slate-900">
              {nextRecommended.reason}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectToneId(nextRecommended.toneId)}
            className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
          >
            Luyện ngay
          </button>
        </div>
      </div>

      {/* Thẻ bạn đồng hành khích lệ lộ trình */}
      <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-red-50/80 border border-amber-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-black text-sm">
            🦜
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              Mục tiêu thám hiểm: Đã trải nghiệm {practicedCount}/6 thanh điệu
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {practicedCount === 6
                ? 'Tuyệt vời! Bạn đã trải nghiệm trọn vẹn cả 6 thanh điệu tiếng Việt!'
                : `Hãy thử sức với các thanh còn lại để mở khóa huy hiệu "Lục Thanh Trọn Vẹn" nhé!`}
            </p>
          </div>
        </div>

        {streakInfo.currentStreak > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/90 rounded-lg border border-orange-200 text-xs font-bold text-orange-700 shrink-0">
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            <span>Chuỗi {streakInfo.currentStreak} ngày</span>
          </div>
        )}
      </div>

      {/* Trình tự bài luyện 4 bước chuẩn sư phạm */}
      <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
          <BookOpen className="w-3.5 h-3.5 text-red-600" />
          <span>Trình tự 4 bước luyện một thanh điệu chuẩn xác</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold inline-flex items-center justify-center text-[11px] mb-1.5">
              1
            </span>
            <p className="font-bold text-slate-900">Nghe mẫu chuẩn</p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Bấm &ldquo;Nghe mẫu&rdquo; để tai làm quen với độ cao và cách ngân.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold inline-flex items-center justify-center text-[11px] mb-1.5">
              2
            </span>
            <p className="font-bold text-slate-900">Đọc chậm rãi</p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Phát âm từ tốn, chú ý điều khiển hơi thở và cổ họng theo gợi ý.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold inline-flex items-center justify-center text-[11px] mb-1.5">
              3
            </span>
            <p className="font-bold text-slate-900">Xem biểu đồ & phản hồi</p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Đối chiếu đường F0 của bạn với mẫu để biết cần nâng hay hạ giọng.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold inline-flex items-center justify-center text-[11px] mb-1.5">
              4
            </span>
            <p className="font-bold text-slate-900">Đọc tốc độ bình thường</p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Lặp lại từ ở nhịp giao tiếp tự nhiên để ghi nhớ phản xạ cơ miệng.
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách tiến trình và nhận xét 6 thanh điệu */}
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
        Tình trạng và Gợi ý luyện tập theo từng thanh
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.toneId}
            className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-slate-900">
                    {s.word}
                  </span>
                  <span className="text-xs font-medium text-slate-600">
                    – {s.toneName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {s.avgF0Score !== null ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      F0: {s.avgF0Score}/100
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                      Chưa có điểm F0
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => playToneAudio(s.toneId)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Nghe mẫu"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Nhận xét sơ bộ */}
              <div className="mt-2 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                <p className="font-semibold text-slate-800">{s.observation}</p>
                <p className="text-[11px] text-slate-500 mt-1">{s.recommendedAction}</p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                {s.validAttempts >= 3 ? (
                  <span className="text-emerald-600 font-semibold">✓ Đủ dữ liệu ({s.validAttempts} lượt)</span>
                ) : (
                  <span>Cần thêm {Math.max(0, 3 - s.validAttempts)} lượt để đủ điều kiện</span>
                )}
              </span>

              <button
                type="button"
                onClick={() => onSelectToneId(s.toneId)}
                className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
              >
                <span>Chọn luyện</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 mt-4 italic flex items-center gap-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          Các nhận xét là &ldquo;Gợi ý luyện tập dựa trên dữ liệu hiện có&rdquo;, không tuyên bố chẩn đoán chính xác trình độ.
        </span>
      </p>
    </div>
  );
};
