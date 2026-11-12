import React, { useEffect, useState } from 'react';
import { Sparkles, HelpCircle, AlertCircle } from 'lucide-react';

export type BeLacAnimationState =
  | 'intro'
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'success'
  | 'uncertain'
  | 'error';

export interface AnimatedBeLacProps {
  state: BeLacAnimationState;
  audioVolume?: number;
  imageSrc?: string;
  altText?: string;
  className?: string;
  onClick?: () => void;
  onIntroComplete?: () => void;
  showBadge?: boolean;
}

export const AnimatedBeLac: React.FC<AnimatedBeLacProps> = ({
  state,
  audioVolume = 0,
  imageSrc = '/assets/be-lac.png',
  altText = 'Bé Lạc - Linh vật học phát âm VietTone AI',
  className = '',
  onClick,
  onIntroComplete,
  showBadge = true,
}) => {
  // Quản lý hoàn thành intro sau 2000ms
  useEffect(() => {
    if (state === 'intro' && onIntroComplete) {
      const timer = window.setTimeout(() => {
        onIntroComplete();
      }, 2050);
      return () => window.clearTimeout(timer);
    }
  }, [state, onIntroComplete]);

  // Animation class cho nhân vật
  const getMascotAnimationClass = () => {
    switch (state) {
      case 'intro':
        return 'animate-be-lac-intro';
      case 'listening':
        return 'animate-be-lac-listening';
      case 'thinking':
        return 'animate-be-lac-thinking';
      case 'success':
        return 'animate-be-lac-success';
      case 'uncertain':
        return 'animate-be-lac-uncertain';
      case 'error':
        return 'transition-none';
      case 'idle':
      default:
        return 'animate-be-lac-idle group-hover:rotate-2 transition-transform duration-300';
    }
  };

  // Tính độ khuyếch đại của vòng sóng âm theo âm lượng thực của microphone
  const clampedVolume = Math.min(1, Math.max(0, audioVolume));
  const waveScale = 1 + clampedVolume * 0.45;

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      onClick={onClick}
    >
      {/* VÙNG HIỆU ỨNG NỀN & HÀO QUANG */}
      <div className="relative flex items-center justify-center">
        {/* 1. Hào quang khi LẮNG NGHE (Listening Aura & Waveform pulse) */}
        {state === 'listening' && (
          <>
            <div
              className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-red-500/35 via-orange-400/30 to-amber-300/35 animate-listening-wave -z-10 blur-md pointer-events-none transition-transform duration-75"
              style={{
                transform: `scale(${waveScale})`,
              }}
            />
            <div className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-red-500/20 animate-ping -z-10 duration-1000 pointer-events-none" />

            {/* Vòng sóng âm phát ra từ 2 bên tai nghe (headphone wave rings) */}
            <div
              className="absolute -left-3 sm:-left-4 top-10 sm:top-14 w-8 h-8 rounded-full border-2 border-amber-300/80 animate-be-lac-headphone-pulse pointer-events-none"
              style={{
                transform: `scale(${1 + clampedVolume * 0.8})`,
              }}
            />
            <div
              className="absolute -right-3 sm:-right-4 top-10 sm:top-14 w-8 h-8 rounded-full border-2 border-amber-300/80 animate-be-lac-headphone-pulse pointer-events-none"
              style={{
                transform: `scale(${1 + clampedVolume * 0.8})`,
              }}
            />
          </>
        )}

        {/* 2. Hào quang khi SUY NGHĨ (Thinking Aura) */}
        {state === 'thinking' && (
          <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-amber-500/25 via-orange-400/25 to-indigo-500/20 animate-pulse -z-10 blur-xl pointer-events-none" />
        )}

        {/* 3. Hào quang khi THÀNH CÔNG (Success Golden Aura & Sparkles) */}
        {state === 'success' && (
          <>
            <div className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-tr from-amber-400/45 via-yellow-300/35 to-emerald-400/30 animate-pulse -z-10 blur-xl pointer-events-none" />
            <div className="absolute w-36 h-36 rounded-full bg-amber-400/35 animate-ping -z-10 duration-700 pointer-events-none" />

            {/* Ngôi sao lấp lánh xung quanh Bé Lạc */}
            <div className="absolute -top-3 -left-2 text-amber-300 animate-be-lac-sparkle pointer-events-none">
              <Sparkles className="w-5 h-5 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
            </div>
            <div
              className="absolute -top-4 right-1 text-yellow-200 animate-be-lac-sparkle pointer-events-none"
              style={{ animationDelay: '250ms' }}
            >
              <Sparkles className="w-6 h-6 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
            </div>
            <div
              className="absolute top-12 -right-5 text-amber-400 animate-be-lac-sparkle pointer-events-none"
              style={{ animationDelay: '500ms' }}
            >
              <Sparkles className="w-4 h-4 drop-shadow-[0_0_6px_rgba(255,215,0,0.8)]" />
            </div>
          </>
        )}

        {/* 4. Hào quang khi CHƯA CHẮC CHẮN (Uncertain / Hint Aura) */}
        {state === 'uncertain' && (
          <div className="absolute w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-amber-500/25 via-orange-400/20 to-transparent -z-10 blur-xl pointer-events-none" />
        )}

        {/* 5. Hào quang khi INTRO / IDLE chuẩn */}
        {(state === 'idle' || state === 'intro') && (
          <div className="absolute w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-gradient-to-b from-orange-400/30 via-red-500/20 to-transparent -z-10 blur-2xl pointer-events-none" />
        )}

        {/* BONG BÓNG SUY NGHĨ (Khi Thinking) */}
        {state === 'thinking' && (
          <div className="absolute -top-5 sm:-top-7 -right-2 sm:-right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-amber-400/50 shadow-xl shadow-black/40">
            <span className="text-[11px] font-bold text-amber-300">Đang nghĩ</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
              <span
                className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        )}

        {/* BONG BÓNG THẮC MẮC (Khi Uncertain) */}
        {state === 'uncertain' && (
          <div className="absolute -top-4 sm:-top-6 -right-1 sm:-right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/90 text-slate-950 font-black text-xs rounded-full shadow-lg border border-white/40 animate-pulse">
            <HelpCircle className="w-3.5 h-3.5 text-slate-950" />
            <span>Thử lại nào!</span>
          </div>
        )}

        {/* KHUNG CHỨA ẢNH BÉ LẠC */}
        <div className="relative group cursor-pointer transition-transform duration-300">
          <img
            src={imageSrc}
            alt={altText}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/assets/be-lac.png';
            }}
            className={`w-auto h-32 sm:h-40 md:h-44 object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)] ${getMascotAnimationClass()}`}
          />

          {/* BADGE TRẠNG THÁI GÓC TRÊN */}
          {showBadge && (
            <>
              {state === 'intro' && (
                <div className="absolute -top-2 -right-3 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#EF233C] to-[#FF9100] text-white text-[11px] font-extrabold shadow-md border border-white/40 flex items-center gap-1 animate-bounce">
                  <span>👋 Chào bạn!</span>
                </div>
              )}

              {state === 'listening' && (
                <div className="absolute -top-1 -right-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#EF233C] to-[#FF9100] text-white text-[10px] font-extrabold shadow-md flex items-center gap-1 border border-white/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>Đang nghe...</span>
                </div>
              )}

              {state === 'success' && (
                <div className="absolute -top-2 -right-3 px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 text-white text-[11px] font-extrabold shadow-lg border border-white/40 flex items-center gap-1 animate-bounce">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Tuyệt vời!</span>
                </div>
              )}

              {state === 'error' && (
                <div className="absolute -top-1 -right-2 px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-[10px] font-bold shadow-md flex items-center gap-1 border border-white/30">
                  <AlertCircle className="w-3 h-3 text-white" />
                  <span>Kiểm tra mic</span>
                </div>
              )}

              {state === 'idle' && (
                <div className="absolute -top-1 -right-2 px-2.5 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-xs text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-xs border border-amber-400/35 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all">
                  ✦ Bé Lạc
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ĐỔ BÓNG MỀM DƯỚI CHÂN NHÂN VẬT (Đồng bộ nhịp thở/bay bổng) */}
      <div
        className={`w-28 sm:w-36 h-3 rounded-full bg-black/40 blur-xs mt-1.5 pointer-events-none ${
          state === 'error' ? 'opacity-30' : 'animate-be-lac-shadow'
        }`}
      />
    </div>
  );
};
