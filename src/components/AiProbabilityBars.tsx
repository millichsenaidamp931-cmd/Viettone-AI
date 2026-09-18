import React from 'react';
import { VIETNAMESE_TONES } from '../data/tones';

interface AiProbabilityBarsProps {
  probabilities: Record<string, number>;
  topToneName: string | null;
  topToneScore: number;
  isListening: boolean;
  selectedToneName: string;
}

export const AiProbabilityBars: React.FC<AiProbabilityBarsProps> = ({
  probabilities,
  topToneName,
  topToneScore,
  isListening,
  selectedToneName,
}) => {
  // 6 standard classes
  const toneClasses = [
    'Thanh ngang',
    'Thanh sắc',
    'Thanh huyền',
    'Thanh hỏi',
    'Thanh ngã',
    'Thanh nặng',
  ];

  const topPercent = Math.round((topToneScore || 0) * 100);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
      {/* Top Banner / Detection Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Xác suất nhận diện 6 thanh</span>
            {isListening && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 animate-pulse">
                Real-time
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500">
            Mô hình AI liên tục đo lường và xếp hạng 6 thanh điệu
          </p>
        </div>

        {/* Highest Recognized Badge */}
        {topToneName ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white shadow-xs">
            <span className="text-xs text-slate-300 font-medium">AI nhận diện:</span>
            <span className="text-sm font-extrabold uppercase text-amber-300">
              {topToneName}
            </span>
            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-md">
              {topPercent}%
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium">
            <span>Đang chờ giọng đọc...</span>
          </div>
        )}
      </div>

      {/* Probability Bars for all 6 tones */}
      <div className="space-y-3.5">
        {toneClasses.map((toneName) => {
          const score = probabilities[toneName] ?? 0;
          const percent = Math.min(100, Math.max(0, Math.round(score * 100)));
          const isTop = topToneName === toneName && percent > 0;
          const isTarget = selectedToneName === toneName;

          // Find tone metadata
          const toneMeta = VIETNAMESE_TONES.find((t) => t.name === toneName);

          return (
            <div
              key={toneName}
              className={`p-2.5 sm:p-3 rounded-xl transition-colors ${
                isTop
                  ? 'bg-amber-50/60 border border-amber-300/80 shadow-xs'
                  : isTarget
                  ? 'bg-slate-50/80 border border-slate-200'
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              {/* Row Header */}
              <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${isTop ? 'text-slate-900' : 'text-slate-700'}`}>
                    {toneName}
                  </span>
                  {toneMeta && (
                    <span className="text-xs text-slate-600 font-normal">
                      ({toneMeta.word} – {toneMeta.symbol})
                    </span>
                  )}
                  {isTarget && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                      Mục tiêu
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-mono text-xs sm:text-sm font-bold ${
                      isTop ? 'text-amber-700 text-base' : 'text-slate-600'
                    }`}
                  >
                    {percent}%
                  </span>
                  {isTop && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white">
                      Cao nhất
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className={`h-full rounded-full transition-all duration-200 ease-out ${
                    isTop
                      ? 'bg-gradient-to-r from-amber-500 to-red-500 shadow-xs'
                      : isTarget
                      ? 'bg-slate-500'
                      : 'bg-slate-300'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
