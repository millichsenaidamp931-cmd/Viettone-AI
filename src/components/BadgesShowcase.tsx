/**
 * VietTone AI - Bảng Cột Mốc & Huy Hiệu Rèn Luyện (Badges Showcase)
 * 
 * Tính toán 100% từ dữ liệu thực tế đã lưu trong localStorage, không tạo dữ liệu giả.
 * Khuyến khích người học tích lũy thói quen theo từng bước nhỏ.
 */

import React from 'react';
import { MilestoneBadge } from '../types';
import {
  Award,
  Sprout,
  TrendingUp,
  Target,
  Compass,
  Crown,
  Flame,
  Shield,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface BadgesShowcaseProps {
  badges: MilestoneBadge[];
}

export const BadgesShowcase: React.FC<BadgesShowcaseProps> = ({ badges }) => {
  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const className = `w-5 h-5 ${isUnlocked ? 'text-amber-600' : 'text-slate-400'}`;

    switch (iconName) {
      case 'sprout':
        return <Sprout className={className} />;
      case 'trending-up':
        return <TrendingUp className={className} />;
      case 'target':
        return <Target className={className} />;
      case 'compass':
        return <Compass className={className} />;
      case 'crown':
        return <Crown className={className} />;
      case 'flame':
        return <Flame className={className} />;
      case 'shield':
        return <Shield className={className} />;
      case 'award':
      default:
        return <Award className={className} />;
    }
  };

  return (
    <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Huy hiệu & Cột mốc nỗ lực</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Ghi nhận từng bước kiên trì trên hành trình làm chủ 6 thanh điệu
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            {unlockedCount}/{badges.length} đã đạt
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {badges.map((badge) => {
          const isUnlocked = badge.isUnlocked;
          const progressPercent = Math.min(
            100,
            Math.round((badge.currentValue / badge.targetValue) * 100)
          );

          return (
            <div
              key={badge.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-white border-amber-200 shadow-2xs hover:border-amber-300'
                  : 'bg-white/60 border-slate-200/70 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-amber-100/90 shadow-2xs ring-2 ring-amber-300/40'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {renderBadgeIcon(badge.iconName, isUnlocked)}
                  </div>

                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Đã đạt
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      <Lock className="w-2.5 h-2.5" />
                      {badge.currentValue}/{badge.targetValue}
                    </span>
                  )}
                </div>

                <h4
                  className={`text-xs font-bold leading-tight ${
                    isUnlocked ? 'text-slate-900' : 'text-slate-700'
                  }`}
                >
                  {badge.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                  {badge.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100">
                {isUnlocked ? (
                  <p className="text-[10px] text-amber-700 font-semibold truncate">
                    ✨ Mở khóa thành công
                  </p>
                ) : (
                  <div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Tiến độ: {progressPercent}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
