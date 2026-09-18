import React from 'react';
import { Volume2, Sparkles, Settings2, ShieldCheck, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  isModelReady: boolean;
  isFallback: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenGuide,
  isModelReady,
  isFallback,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-sm font-bold text-lg tracking-wider">
            VT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                VietTone <span className="text-red-600 font-black">AI</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/60">
                Dự án AI Lớp 6
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium line-clamp-1">
              Luyện nghe và phát âm 6 thanh điệu tiếng Việt bằng trí tuệ nhân tạo
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Model Status Indicator */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
            title="Xem hoặc thay đổi URL mô hình Teachable Machine"
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
            <span className="hidden md:inline">
              {isModelReady
                ? isFallback
                  ? 'Mô phỏng âm vực'
                  : 'Teachable Machine'
                : 'Đang tải model...'}
            </span>
            <Settings2 className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
          </button>

          {/* Guide button */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Hướng dẫn 6 thanh điệu"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
