import React from 'react';
import { VIETNAMESE_TONES } from '../data/tones';
import { Sparkles } from 'lucide-react';

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
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
      {/* Top Headline */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span>Xác suất AI nhận diện 6 thanh</span>
            {isListening && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-700 animate-pulse">
                Live
              </span>
            )}
          </h2>
        </div>

        {/* Top Recognized Pill */}
        {topToneName ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] font-extrabold uppercase text-amber-300">
              {topToneName}
            </span>
            <span className="text-[10px] font-mono font-bold bg-white/20 px-1 py-0.2 rounded">
              {topPercent}%
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic">
            Chờ giọng đọc...
          </span>
        )}
      </div>

      {/* 6 Probability Bars */}
      <div className="space-y-2">
        {toneClasses.map((toneName) => {
          const score = probabilities[toneName] ?? 0;
          const percent = Math.min(100, Math.max(0, Math.round(score * 100)));
          const isTop = topToneName === toneName && percent > 0;
          const isTarget = selectedToneName === toneName;
          const toneMeta = VIETNAMESE_TONES.find((t) => t.name === toneName);

          return (
            <div
              key={toneName}
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                isTop
                  ? 'bg-amber-50/70 border border-amber-300/70'
                  : isTarget
                  ? 'bg-slate-50 border border-slate-200'
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold ${isTop ? 'text-slate-900' : 'text-slate-700'}`}>
                    {toneName}
                  </span>
                  {toneMeta && (
                    <span className="text-[11px] text-slate-500">
                      ({toneMeta.word})
                    </span>
                  )}
                  {isTarget && (
                    <span className="text-[9px] uppercase font-extrabold px-1 py-0.2 rounded bg-red-100 text-red-700">
                      Mục tiêu
                    </span>
                  )}
                </div>

                <span
                  className={`font-mono text-xs font-bold ${
                    isTop ? 'text-amber-700' : 'text-slate-500'
                  }`}
                >
                  {percent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    isTop
                      ? 'bg-gradient-to-r from-amber-500 to-red-500'
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
