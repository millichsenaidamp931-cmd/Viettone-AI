import React, { useState } from 'react';
import {
  BarChart3,
  Compass,
  TrendingUp,
  Award,
  Settings2,
  Volume2,
  VolumeX,
  Home,
  Flame,
  MoreVertical,
  HelpCircle,
  GitBranch,
} from 'lucide-react';
import { StreakInfo } from '../../types';

interface MinimalHeaderProps {
  onGoHome: () => void;
  onOpenAnalysis: () => void;
  onOpenRoadmap: () => void;
  onOpenProgress: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenArchitecture?: () => void;
  streakInfo: StreakInfo;
  soundFxEnabled: boolean;
  onToggleSoundFx: () => void;
  isModelReady: boolean;
  isFallback: boolean;
  hasRecentAttempt?: boolean;
}

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({
  onGoHome,
  onOpenAnalysis,
  onOpenRoadmap,
  onOpenProgress,
  onOpenAchievements,
  onOpenSettings,
  onOpenGuide,
  onOpenArchitecture,
  streakInfo,
  soundFxEnabled,
  onToggleSoundFx,
  isModelReady,
  isFallback,
  hasRecentAttempt = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const streakDays = streakInfo.currentStreak;

  return (
    <header className="w-full bg-slate-950/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 shadow-sm text-white">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left Side: Trang chủ & Streak */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-white/95 hover:text-white hover:bg-white/15 transition-all cursor-pointer border border-white/10 bg-white/5"
            title="Quay lại Trang chủ giới thiệu"
          >
            <Home className="w-4 h-4 text-white/80" />
            <span className="hidden sm:inline">Trang chủ</span>
          </button>

          {/* Streak Flame Counter */}
          <button
            type="button"
            onClick={onOpenAchievements}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-sm font-bold transition-all cursor-pointer select-none ${
              streakDays > 0
                ? 'bg-orange-500/25 border-orange-400/50 text-orange-200 shadow-xs'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
            title={`Chuỗi ${streakDays} ngày luyện tập!`}
          >
            <Flame
              className={`w-4 h-4 ${
                streakDays > 0 ? 'text-orange-400 fill-orange-400 animate-pulse' : 'text-white/60'
              }`}
            />
            <span>{streakDays}</span>
            <span className="hidden md:inline text-xs font-medium text-white/70">ngày</span>
          </button>
        </div>

        {/* Center: Brand Logo [VT] VietTone AI v2.1 (như ảnh mẫu) */}
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={onGoHome}>
          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-[#EF233C] to-[#FF9100] flex items-center justify-center text-white shadow-md shadow-red-500/30 font-black text-sm tracking-wider border border-white/20">
            VT
          </div>
          <span className="text-lg sm:text-xl font-black text-white tracking-tight drop-shadow-xs">
            VietTone <span className="text-[#FF9100]">AI</span>
          </span>
          <span className="text-xs font-bold text-white/90 px-2 py-0.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xs">
            v2.1
          </span>
        </div>

        {/* Right Side: Quick Action Tabs (Desktop) + Sound + 3-dots Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Action Navigation on Desktop */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/15">
            <button
              type="button"
              onClick={onOpenAnalysis}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                hasRecentAttempt
                  ? 'bg-red-500/30 text-white border border-red-400/50 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
              title="Phân tích AI & F0"
            >
              <BarChart3 className="w-4 h-4 text-amber-300" />
              <span>Phân tích</span>
            </button>

            <button
              type="button"
              onClick={onOpenRoadmap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              title="Lộ trình học tập"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>Lộ trình</span>
            </button>

            <button
              type="button"
              onClick={onOpenProgress}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              title="Tiến bộ của tôi"
            >
              <TrendingUp className="w-4 h-4 text-amber-300" />
              <span>Tiến bộ</span>
            </button>

            <button
              type="button"
              onClick={onOpenAchievements}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              title="Thành tích & Huy hiệu"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Thành tích</span>
            </button>
          </nav>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={onToggleSoundFx}
            className={`p-1.5 rounded-xl transition-all cursor-pointer border border-white/10 ${
              soundFxEnabled
                ? 'text-amber-300 bg-amber-500/20 hover:bg-amber-500/30'
                : 'text-white/60 bg-white/5 hover:bg-white/10'
            }`}
            title={soundFxEnabled ? 'Âm thanh: Đang bật' : 'Âm thanh: Đã tắt'}
            aria-label="Bật tắt âm thanh"
          >
            {soundFxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* 3-dots Menu Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15 backdrop-blur-xs"
              title="Tùy chọn menu"
              aria-label="Mở menu tùy chọn"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Menu Popover */}
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-60 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAnalysis();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-white/95 hover:bg-white/15 cursor-pointer text-left"
                  >
                    <BarChart3 className="w-4 h-4 text-red-400" />
                    <span>Phân tích AI & Đường nét F0</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenRoadmap();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-white/95 hover:bg-white/15 cursor-pointer text-left"
                  >
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Lộ trình học tập 4 bước</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenProgress();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-white/95 hover:bg-white/15 cursor-pointer text-left"
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Tiến bộ & Lịch sử của tôi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAchievements();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-white/95 hover:bg-white/15 cursor-pointer text-left"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Huy hiệu & Chuỗi rèn luyện</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-white/95 hover:bg-white/15 cursor-pointer text-left"
                  >
                    <Settings2 className="w-4 h-4 text-slate-300" />
                    <span>Cài đặt & Mẫu giáo viên</span>
                  </button>

                  <div className="my-1.5 border-t border-white/15" />

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenGuide();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-white/85 hover:bg-white/10 cursor-pointer text-left"
                  >
                    <HelpCircle className="w-4 h-4 text-white/60" />
                    <span>Hướng dẫn 6 thanh điệu</span>
                  </button>

                  {onOpenArchitecture && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenArchitecture();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-white/80 hover:bg-white/10 cursor-pointer text-left"
                    >
                      <GitBranch className="w-4 h-4 text-cyan-400" />
                      <span>Sơ đồ kiến trúc thuật toán</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
