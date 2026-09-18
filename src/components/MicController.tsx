import React, { useEffect, useState } from 'react';
import { Mic, Square, AlertCircle, RefreshCw, AudioWaveform } from 'lucide-react';

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
  // Animated wave heights based on audio volume
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
    <div className="w-full flex flex-col items-center justify-center my-6">
      {/* Permission Error Banner */}
      {permissionError && (
        <div className="mb-4 w-full max-w-md bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-semibold mb-1">Chưa thể truy cập Microphone</p>
            <p className="text-amber-800">{permissionError}</p>
            <p className="text-amber-700 mt-1">
              Hãy nhấn biểu tượng 🔒 hoặc 🎙 trên thanh địa chỉ của trình duyệt để cấp quyền Microphone.
            </p>
            <button
              type="button"
              onClick={onRetryPermission}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 text-white rounded-lg font-medium text-xs hover:bg-amber-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Main Microphone Button Container */}
      <div className="flex flex-col items-center">
        {!isListening ? (
          <button
            type="button"
            onClick={onStartListening}
            className="group relative flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white font-bold text-lg sm:text-xl shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5 text-white animate-bounce" />
            </div>
            <span>🎙 Bắt đầu đọc</span>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              {/* Audio visualizer */}
              <div className="flex items-center gap-1.5 h-12 px-4 py-2 bg-red-50 rounded-2xl border border-red-200">
                {bars.map((height, idx) => (
                  <div
                    key={idx}
                    className="w-1.5 bg-red-600 rounded-full transition-all duration-100"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              {/* Stop Button */}
              <button
                type="button"
                onClick={onStopListening}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white font-bold text-base shadow-md hover:bg-slate-800 active:scale-98 transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white text-white" />
                <span>Dừng đọc</span>
              </button>
            </div>

            {/* Listening Status Indicator */}
            <div className="flex items-center gap-2 text-sm font-medium text-red-600 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>Đang nghe... Hãy phát âm rõ ràng từ: &ldquo;{selectedWord}&rdquo;</span>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500 mt-2 text-center">
          Nhấn nút, sau đó phát âm rõ chữ tiếng Việt vào mic.
        </p>
      </div>
    </div>
  );
};
