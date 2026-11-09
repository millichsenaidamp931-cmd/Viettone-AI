import React from 'react';
import { Target, Volume2, Sparkles, Flame } from 'lucide-react';
import { ToneItem, FeedbackAssessment } from '../../types';
import { playToneAudio } from '../../utils/audioSynthesizer';

interface BeLacHeroCenterProps {
  selectedTone: ToneItem;
  isListening: boolean;
  audioVolume: number;
  assessment?: FeedbackAssessment | null;
}

export const BeLacHeroCenter: React.FC<BeLacHeroCenterProps> = ({
  selectedTone,
  isListening,
  audioVolume,
  assessment = null,
}) => {
  const handlePlaySample = () => {
    playToneAudio(selectedTone.id);
  };

  // Xác định 4 trạng thái của COOL Bé Lạc:
  // 1. LISTENING: Đang thu âm (hạ kính, nghiêng đầu, vòng sóng âm tai nghe)
  // 2. SUCCESS: AI nhận diện trùng thanh mục tiêu (đeo kính, nhảy vui mừng hai cánh vẫy)
  // 3. UNCERTAIN: AI chưa chắc chắn hoặc lệch thanh (hạ kính nhìn kỹ, nghiêng đầu suy nghĩ)
  // 4. IDLE: Sẵn sàng (đeo kính râm cool ngầu, cười tự tin, lắc lư nhẹ)
  type CoolMascotState = 'idle' | 'listening' | 'success' | 'uncertain';

  let mascotState: CoolMascotState = 'idle';

  if (isListening) {
    mascotState = 'listening';
  } else if (assessment) {
    const isMatch =
      assessment.predictedToneName?.trim().toLowerCase() ===
      selectedTone.name.trim().toLowerCase();
    mascotState = isMatch ? 'success' : 'uncertain';
  }

  // Chọn asset ảnh phù hợp cho từng trạng thái
  const getMascotAsset = () => {
    switch (mascotState) {
      case 'listening':
        return '/assets/be-lac-cool-listen.png';
      case 'success':
        return '/assets/be-lac-cool-success.png';
      case 'uncertain':
        return '/assets/be-lac-cool-listen.png';
      case 'idle':
      default:
        return '/assets/be-lac-cool.png';
    }
  };

  // Class animation tương ứng với từng trạng thái
  const getAnimationClass = () => {
    switch (mascotState) {
      case 'listening':
        return 'animate-listening-groove';
      case 'success':
        return 'animate-success-bounce';
      case 'uncertain':
        return 'animate-thoughtful-tilt';
      case 'idle':
      default:
        return 'animate-cool-sway group-hover:rotate-3 transition-transform duration-300';
    }
  };

  // Chiều cao thanh sóng âm thanh hai bên
  const waveHeightsLeft = [6, 12, 18, 10, 16, 22, 14, 8];
  const waveHeightsRight = [8, 14, 22, 16, 10, 18, 12, 6];

  return (
    <div className="flex flex-col items-center justify-center text-center select-none pt-0 pb-1 w-full max-w-xl mx-auto">
      {/* 1. Khu vực nhân vật Bé Lạc COOL */}
      <div className="relative flex items-center justify-center">
        {/* Vầng hào quang ánh sáng ấm áp theo trạng thái */}
        {mascotState === 'listening' ? (
          <>
            {/* Hào quang sóng âm tỏa ra xung quanh */}
            <div
              className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-red-500/35 via-orange-400/30 to-amber-300/35 animate-listening-wave -z-10 blur-md"
              style={{
                transform: `scale(${1 + Math.min(0.4, audioVolume * 2)})`,
              }}
            />
            <div className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-red-500/25 animate-ping -z-10 duration-1000" />
            
            {/* Vòng sóng âm nhỏ quanh 2 bên tai nghe (headphone wave rings) */}
            <div className="absolute -left-3 sm:-left-4 top-12 w-8 h-8 rounded-full border-2 border-amber-300/60 animate-headphone-pulse pointer-events-none" />
            <div className="absolute -right-3 sm:-right-4 top-12 w-8 h-8 rounded-full border-2 border-amber-300/60 animate-headphone-pulse pointer-events-none" />
          </>
        ) : mascotState === 'success' ? (
          <>
            <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-amber-400/40 via-yellow-300/30 to-emerald-400/25 animate-pulse -z-10 blur-xl" />
            <div className="absolute w-32 h-32 rounded-full bg-amber-400/30 animate-ping -z-10 duration-700" />
          </>
        ) : (
          <div className="absolute w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-gradient-to-b from-orange-400/30 via-red-500/20 to-transparent -z-10 blur-2xl" />
        )}

        {/* Khung chứa ảnh nhân vật Bé Lạc */}
        <div
          className="relative group cursor-pointer transition-transform duration-300"
          onClick={handlePlaySample}
          title="Bé Lạc COOL – Chạm để nghe mẫu thanh mục tiêu"
        >
          <img
            key={mascotState} // Buộc re-render mượt mà khi đổi trạng thái
            src={getMascotAsset()}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/assets/be-lac.png';
            }}
            alt="Bé Lạc COOL"
            className={`w-auto h-32 sm:h-40 md:h-44 object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)] ${getAnimationClass()}`}
          />

          {/* Badge trạng thái năng động phía trên góc Bé Lạc */}
          {mascotState === 'listening' && (
            <div className="absolute -top-1 -right-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#EF233C] to-[#FF9100] text-white text-[10px] font-extrabold shadow-md animate-bounce flex items-center gap-1 border border-white/30">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Đang nghe...</span>
            </div>
          )}

          {mascotState === 'success' && (
            <div className="absolute -top-1.5 -right-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 text-white text-[10px] font-extrabold shadow-md animate-bounce flex items-center gap-1 border border-white/30">
              <Sparkles className="w-3 h-3 text-amber-200" />
              <span>Tuyệt vời!</span>
            </div>
          )}

          {mascotState === 'uncertain' && (
            <div className="absolute -top-1.5 -right-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold shadow-md flex items-center gap-1 border border-white/30">
              <Sparkles className="w-3 h-3 text-white" />
              <span>Thử lại nhé</span>
            </div>
          )}

          {mascotState === 'idle' && (
            <div className="absolute -top-1 -right-2 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-amber-300 text-[9px] font-black uppercase tracking-wider shadow-xs border border-amber-400/30 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all">
              😎 Cool
            </div>
          )}
        </div>
      </div>

      {/* 2. Tên nhân vật: ✦ Bé Lạc ✦ */}
      <div className="mt-1 flex items-center justify-center gap-2 font-black text-sm sm:text-base tracking-wide drop-shadow-[0_2px_8px_rgba(255,145,0,0.6)]">
        <span className="text-amber-300 text-xs sm:text-sm">✦</span>
        <span className="text-white font-black text-base sm:text-lg">Bé Lạc</span>
        <span className="text-amber-300 text-xs sm:text-sm">✦</span>
      </div>

      {/* 3. Dải hiển thị Thanh mục tiêu kẹp giữa 2 dải sóng âm */}
      <div className="mt-2.5 flex items-center justify-center gap-2 sm:gap-3.5 w-full">
        {/* Sóng âm bên trái */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {waveHeightsLeft.map((h, i) => (
            <div
              key={`wl-${i}`}
              className="w-0.5 sm:w-1 bg-gradient-to-t from-orange-400 to-amber-300 rounded-full transition-all duration-150 shadow-[0_0_6px_rgba(255,145,0,0.6)]"
              style={{
                height: isListening
                  ? `${Math.max(4, h * (1 + audioVolume * 2.2))}px`
                  : `${h}px`,
              }}
            />
          ))}
        </div>

        {/* Capsule Thanh mục tiêu */}
        <button
          type="button"
          onClick={handlePlaySample}
          className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/45 hover:bg-slate-900/60 backdrop-blur-md border border-white/25 shadow-lg shadow-black/25 hover:border-amber-400/60 transition-all cursor-pointer text-white"
          title={`Nghe phát âm chuẩn: ${selectedTone.word}`}
        >
          <div className="w-5 h-5 rounded-full bg-red-500/30 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform border border-amber-400/40">
            <Target className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <span className="text-xs sm:text-sm text-white/90 font-medium">
            Thanh mục tiêu:
          </span>
          <span className="text-sm sm:text-base font-black text-[#FFB703] tracking-tight group-hover:underline drop-shadow-xs">
            {selectedTone.word}
          </span>
          <Volume2 className="w-3.5 h-3.5 text-white/70 group-hover:text-amber-300 transition-colors" />
        </button>

        {/* Sóng âm bên phải */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {waveHeightsRight.map((h, i) => (
            <div
              key={`wr-${i}`}
              className="w-0.5 sm:w-1 bg-gradient-to-t from-orange-400 to-amber-300 rounded-full transition-all duration-150 shadow-[0_0_6px_rgba(255,145,0,0.6)]"
              style={{
                height: isListening
                  ? `${Math.max(4, h * (1 + audioVolume * 2.2))}px`
                  : `${h}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 4. Bốn chốt kết nối dạng viên nang (Capsule connectors) */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2 -mb-2 z-10">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 shadow-[0_0_8px_rgba(255,145,0,0.6)] border border-white/50"
          />
        ))}
      </div>
    </div>
  );
};
