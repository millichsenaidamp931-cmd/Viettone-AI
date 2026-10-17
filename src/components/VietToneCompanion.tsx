/**
 * VietTone Companion – Người bạn đồng hành Bé Lạc
 * 
 * Linh vật Bé Lạc lấy cảm hứng từ chim Lạc biểu trưng văn hóa Việt, được hiện đại hoá
 * với phong cách giáo dục thân thiện, có tai nghe thanh âm và biểu cảm sinh động.
 */

import React from 'react';
import { MotivationMessage, MascotMood } from '../types';
import { Sparkles, TrendingUp, Flame } from 'lucide-react';

interface VietToneCompanionProps {
  message: MotivationMessage;
  streakCount?: number;
  className?: string;
  compact?: boolean;
}

export const VietToneCompanion: React.FC<VietToneCompanionProps> = ({
  message,
  streakCount = 0,
  className = '',
  compact = false,
}) => {
  const { headline, subtext, mascotMood, f0Delta, state } = message;

  // Render SVG Mascot Bé Lạc theo biểu cảm
  const renderMascotSvg = (mood: MascotMood) => {
    return (
      <svg
        viewBox="0 0 100 100"
        className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md select-none shrink-0"
        aria-hidden="true"
      >
        <defs>
          {/* Gradient thân chim Lạc */}
          <linearGradient id="lacBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="60%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          {/* Gradient mào chim Lạc */}
          <linearGradient id="crestGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          {/* Tai nghe */}
          <linearGradient id="headphoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* 1. Vòng hào quang nếu hào hứng/ăn mừng */}
        {(mood === 'excited' || mood === 'cheering' || mood === 'proud') && (
          <circle cx="50" cy="50" r="46" fill="#fef3c7" opacity="0.6" className="animate-pulse" />
        )}

        {/* 2. Mào chim Lạc vút cao đặc trưng văn hoá Đông Sơn */}
        <path
          d="M 50,22 Q 40,6 26,10 Q 38,18 48,25 Z"
          fill="url(#crestGrad)"
        />
        <path
          d="M 52,20 Q 56,8 68,12 Q 58,19 51,24 Z"
          fill="url(#crestGrad)"
          opacity="0.9"
        />

        {/* 3. Thân mình mũm mĩm, đáng yêu */}
        <circle cx="50" cy="56" r="32" fill="url(#lacBodyGrad)" />
        {/* Bụng chim Lạc màu kem sáng */}
        <ellipse cx="50" cy="62" rx="20" ry="21" fill="#fffbeb" opacity="0.95" />

        {/* 4. Tai nghe học âm thanh (Headphones) */}
        <path
          d="M 22,54 A 28,28 0 0,1 78,54"
          fill="none"
          stroke="url(#headphoneGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Đệm tai nghe bên trái */}
        <rect x="18" y="46" width="9" height="18" rx="4" fill="#0f172a" />
        <rect x="20" y="49" width="3" height="12" rx="1.5" fill="#ef4444" />
        {/* Đệm tai nghe bên phải */}
        <rect x="73" y="46" width="9" height="18" rx="4" fill="#0f172a" />
        <rect x="77" y="49" width="3" height="12" rx="1.5" fill="#ef4444" />

        {/* 5. Đôi mắt biểu cảm */}
        {mood === 'excited' || mood === 'cheering' ? (
          // Mắt tít cười vui vẻ
          <g stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M 38,50 Q 43,45 48,50" />
            <path d="M 52,50 Q 57,45 62,50" />
            {/* Má hồng phấn */}
            <circle cx="34" cy="56" r="4.5" fill="#f87171" opacity="0.6" stroke="none" />
            <circle cx="66" cy="56" r="4.5" fill="#f87171" opacity="0.6" stroke="none" />
          </g>
        ) : mood === 'comforting' ? (
          // Mắt ấm áp, ân cần
          <g>
            <circle cx="42" cy="50" r="4.5" fill="#0f172a" />
            <circle cx="43.5" cy="48.5" r="1.8" fill="#ffffff" />
            <circle cx="58" cy="50" r="4.5" fill="#0f172a" />
            <circle cx="59.5" cy="48.5" r="1.8" fill="#ffffff" />
            {/* Lông mày ân cần */}
            <path d="M 38,44 Q 43,45 47,43" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 53,43 Q 57,45 62,44" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="35" cy="57" r="3.5" fill="#f87171" opacity="0.4" />
            <circle cx="65" cy="57" r="3.5" fill="#f87171" opacity="0.4" />
          </g>
        ) : (
          // Mắt to tròn, sáng ngời, sẵn sàng
          <g>
            <circle cx="42" cy="50" r="5" fill="#0f172a" />
            <circle cx="43.5" cy="48" r="2" fill="#ffffff" />
            <circle cx="40.5" cy="52" r="1" fill="#ffffff" />
            <circle cx="58" cy="50" r="5" fill="#0f172a" />
            <circle cx="59.5" cy="48" r="2" fill="#ffffff" />
            <circle cx="56.5" cy="52" r="1" fill="#ffffff" />
            <circle cx="35" cy="56" r="4" fill="#f87171" opacity="0.5" />
            <circle cx="65" cy="56" r="4" fill="#f87171" opacity="0.5" />
          </g>
        )}

        {/* 6. Mỏ chim Lạc vàng cam tinh nghịch */}
        <polygon points="50,53 45,59 55,59" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />

        {/* 7. Đôi cánh nhỏ */}
        {mood === 'cheering' || mood === 'excited' ? (
          // Vẫy 2 cánh lên cao
          <g fill="#ea580c">
            <path d="M 22,58 Q 12,46 18,38 Q 26,46 25,58 Z" />
            <path d="M 78,58 Q 88,46 82,38 Q 74,46 75,58 Z" />
          </g>
        ) : (
          // Cánh xếp gọn bên hông
          <g fill="#ea580c">
            <ellipse cx="23" cy="62" rx="4.5" ry="9" transform="rotate(-15 23 62)" />
            <ellipse cx="77" cy="62" rx="4.5" ry="9" transform="rotate(15 77 62)" />
          </g>
        )}

        {/* 8. Huân chương tự hào nếu là mốc 10 lượt hoặc streak 3 ngày */}
        {(mood === 'proud' || state === 'ten_attempts' || state === 'three_day_streak') && (
          <g transform="translate(44, 70)">
            <circle cx="6" cy="6" r="6" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            <path d="M 6,2 L 7.5,5 L 11,5.5 L 8.5,8 L 9,11 L 6,9.5 L 3,11 L 3.5,8 L 1,5.5 L 4.5,5 Z" fill="#ffffff" />
          </g>
        )}
      </svg>
    );
  };

  const isCelebratory = message.celebrate;
  const isF0Improved = typeof f0Delta === 'number' && f0Delta >= 5;

  return (
    <div
      className={`relative w-full rounded-2xl transition-all duration-300 border ${
        isF0Improved
          ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-amber-300 shadow-sm'
          : isCelebratory
          ? 'bg-gradient-to-r from-red-50/90 via-orange-50/80 to-amber-50/90 border-red-200/90 shadow-2xs'
          : 'bg-white border-slate-200/90 shadow-2xs'
      } ${compact ? 'p-3' : 'p-3.5 sm:p-4'} ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Linh vật Bé Lạc */}
        <div className="relative shrink-0">
          {renderMascotSvg(mascotMood)}
          {streakCount >= 3 && (
            <div
              className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full p-1 shadow-xs flex items-center justify-center text-[10px]"
              title={`Chuỗi ${streakCount} ngày luyện tập!`}
            >
              <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
            </div>
          )}
        </div>

        {/* Bong bóng lời động viên từ Bé Lạc */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100/80 text-red-700">
              Bé Lạc đồng hành
            </span>

            {isF0Improved && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                <TrendingUp className="w-3 h-3 text-emerald-700" />
                +{f0Delta} điểm F0
              </span>
            )}

            {isCelebratory && !isF0Improved && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Cố gắng lắm!
              </span>
            )}
          </div>

          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
            {headline}
          </h4>

          <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">
            {subtext}
          </p>
        </div>
      </div>
    </div>
  );
};
