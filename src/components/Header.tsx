import React from 'react';
import { Settings2, HelpCircle, Mic, Compass, TrendingUp } from 'lucide-react';
import { MainTabType } from './BottomNav';

interface HeaderProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  isModelReady: boolean;
  isFallback: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onChangeTab,
  onOpenSettings,
  onOpenGuide,
  isModelReady,
  isFallback,
}) => {
  const tabs = [
    { id: 'practice' as MainTabType, label: 'Luyện phát âm', icon: Mic },
    { id: 'roadmap' as MainTabType, label: 'Lộ trình học tập', icon: Compass },
    { id: 'progress' as MainTabType, label: 'Tiến bộ của tôi', icon: TrendingUp },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-2xs font-extrabold text-base tracking-wider">
            VT
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-slate-900 tracking-tight">
                VietTone <span className="text-red-600">AI</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-red-50 text-red-700 border border-red-200/60 rounded">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
              Luyện 6 thanh điệu tiếng Việt
            </p>
          </div>
        </div>

        {/* Desktop Central Navigation Tabs */}
        <nav className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-red-600 shadow-2xs border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* AI Model Status Badge */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 cursor-pointer"
            title="Cài đặt mô hình AI và Mẫu chuẩn Giáo viên"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isModelReady
                  ? isFallback
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-emerald-500'
                  : 'bg-slate-400'
              }`}
            />
            <span className="hidden lg:inline text-[11px] font-semibold">
              {isModelReady
                ? isFallback
                  ? 'Mô phỏng F0'
                  : 'Teachable Machine'
                : 'Đang tải AI...'}
            </span>
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Guide Button */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Hướng dẫn 6 thanh điệu"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
