import React from 'react';
import { Award, Flame, Sparkles, Target } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { MilestoneBadge, StreakInfo } from '../../types';
import { BadgesShowcase } from '../BadgesShowcase';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakInfo: StreakInfo;
  badges: MilestoneBadge[];
  todayAttemptsCount: number;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  streakInfo,
  badges,
  todayAttemptsCount,
}) => {
  const dailyTarget = 10;
  const dailyProgressPercent = Math.min(100, Math.round((todayAttemptsCount / dailyTarget) * 100));
  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Thành tích & Chuỗi ngày rèn luyện"
      subtitle="Ghi nhận từng nỗ lực nhỏ trên hành trình chinh phục 6 thanh điệu"
      icon={<Award className="w-5 h-5" />}
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Banner tổng quan: Chuỗi ngày & Mục tiêu hôm nay */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card Chuỗi ngày (Streak) */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-100">
                <Flame className="w-4 h-4 text-amber-200 fill-amber-200" />
                <span>Chuỗi ngày luyện tập</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-black">{streakInfo.currentStreak}</span>
                <span className="text-sm font-semibold opacity-90">ngày liên tiếp</span>
              </div>
              <p className="text-xs text-orange-100 mt-1">
                {streakInfo.isActiveToday
                  ? '✨ Hôm nay bạn đã duy trì chuỗi thành công!'
                  : 'Hãy luyện ít nhất 1 lượt hôm nay để giữ chuỗi nhé!'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Flame className="w-8 h-8 text-amber-200 fill-amber-200 animate-pulse" />
            </div>
          </div>

          {/* Card Mục tiêu hằng ngày */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Target className="w-4 h-4 text-red-600" />
                <span>Mục tiêu rèn luyện hôm nay</span>
              </div>
              <span className="text-xs font-bold text-slate-900">
                {todayAttemptsCount}/{dailyTarget} lượt
              </span>
            </div>

            <div className="my-2">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 to-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${dailyProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{dailyProgressPercent}% hoàn thành</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                {todayAttemptsCount >= dailyTarget ? 'Đã đạt mục tiêu!' : 'Cố lên bạn nhé!'}
              </span>
            </div>
          </div>
        </div>

        {/* Danh sách toàn bộ Huy hiệu & Cột mốc */}
        <BadgesShowcase badges={badges} />

        {/* Lời nhắn động viên */}
        <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-3.5 text-xs text-amber-900 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Bạn đã mở khóa <strong>{unlockedCount}/{badges.length}</strong> huy hiệu. Hãy kiên trì luyện tập mỗi ngày cùng Bé Lạc nhé!
          </span>
        </div>
      </div>
    </ModalWrapper>
  );
};
