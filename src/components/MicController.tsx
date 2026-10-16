import React, { useEffect, useState } from 'react';
import { Mic, Square, AlertCircle, RefreshCw } from 'lucide-react';

interface MicControllerProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  audioVolume: number;
  permissionError: string | null;
  onRetryPermission: () => void;
  selectedWord: string;
}

export const MicController: React.FC<MicControllerProps> = ({
  isListening,
  onStartListening,
  onStopListening,
  audioVolume,
  permissionError,
  onRetryPermission,
  selectedWord,
}) => {
  const [bars, setBars] = useState<number[]>([15, 20, 10, 25, 12]);

  useEffect(() => {
    if (!isListening) return;
    const interval = setInterval(() => {
      const volMultiplier = Math.max(0.2, audioVolume * 3);
      setBars([
        Math.min(100, Math.floor(15 + Math.random() * 60 * volMultiplier)),
        Math.min(100, Math.floor(25 + Math.random() * 75 * volMultiplier)),
        Math.min(100, Math.floor(35 + Math.random() * 85 * volMultiplier)),
        Math.min(100, Math.floor(25 + Math.random() * 75 * volMultiplier)),
        Math.min(100, Math.floor(15 + Math.random() * 60 * volMultiplier)),
      ]);
    }, 100);
    return () => clearInterval(interval);
  }, [isListening, audioVolume]);

  return (
    <div className="w-full flex flex-col items-center justify-center my-3">
      {/* Permission Error Banner */}
      {permissionError && (
        <div className="mb-3 w-full bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-2.5 rounded-xl flex items-start gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold mb-0.5">Chưa thể truy cập Microphone</p>
            <p className="text-amber-800">{permissionError}</p>
            <button
              type="button"
              onClick={onRetryPermission}
              className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 text-white rounded-lg font-medium text-xs hover:bg-amber-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Cấp quyền lại
            </button>
          </div>
        </div>
      )}

      {/* Main Microphone Button */}
      {!isListening ? (
        <button
          type="button"
          onClick={onStartListening}
          className="group relative flex items-center justify-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white font-extrabold text-base sm:text-lg shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer w-full max-w-sm justify-center"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <Mic className="w-4 h-4 text-white animate-bounce" />
          </div>
          <span>Bắt đầu đọc</span>
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2 w-full max-w-sm">
          <div className="flex items-center justify-between w-full gap-3 bg-red-50/80 p-2 rounded-2xl border border-red-200">
            {/* Visualizer */}
            <div className="flex items-center gap-1.5 h-10 px-3 flex-1 justify-center">
              {bars.map((height, idx) => (
                <div
                  key={idx}
                  className="w-1.5 bg-red-600 rounded-full transition-all duration-100"
                  style={{ height: `${Math.max(12, height)}%` }}
                />
              ))}
            </div>

            {/* Stop Button */}
            <button
              type="button"
              onClick={onStopListening}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-xs hover:bg-slate-800 active:scale-98 transition-all shrink-0 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Dừng</span>
            </button>
          </div>

          <p className="text-xs font-semibold text-red-600 animate-pulse text-center">
            Đang nghe... Hãy phát âm rõ: &ldquo;{selectedWord}&rdquo;
          </p>
        </div>
      )}

      <p className="text-[11px] text-slate-400 mt-1.5 text-center">
        Nhấn nút và đọc to, rõ ràng vào microphone
      </p>
    </div>
  );
};
