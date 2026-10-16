import React from 'react';
import { F0ScoreResult } from '../types';
import { Award, AlertCircle, Info } from 'lucide-react';

interface F0ScoreCardProps {
  f0Result: F0ScoreResult | null;
  aiConfidencePercent: number;
  topToneName: string | null;
}

export const F0ScoreCard: React.FC<F0ScoreCardProps> = ({
  f0Result,
  aiConfidencePercent,
  topToneName,
}) => {
  if (!f0Result) return null;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs my-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* CỘT 1: Độ giống đường cao độ F0 */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Độ giống đường cao độ F0
              </span>
            </div>

            {f0Result.isCalculable && f0Result.score !== null ? (
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  <span className="text-red-600 font-black">{f0Result.score}</span>
                  <span className="text-sm font-bold text-slate-500">/100</span>
                </div>

                {f0Result.breakdown && (
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                    <span>Dáng: <strong>{f0Result.breakdown.shapeSimilarity}%</strong></span>
                    <span>•</span>
                    <span>Dốc: <strong>{f0Result.breakdown.trendSimilarity}%</strong></span>
                    <span>•</span>
                    <span>DTW: <strong>{f0Result.breakdown.dtwSimilarity}%</strong></span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-1.5 text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 text-xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-[11px]">{f0Result.reason}</span>
              </div>
            )}
          </div>

          <p className="text-[10px] text-slate-400 mt-2 italic flex items-start gap-1 leading-snug">
            <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
            <span>Điểm F0 chỉ phản ánh tương đồng cao độ, không phải đánh giá toàn diện.</span>
          </p>
        </div>

        {/* CỘT 2: Độ tin cậy AI Teachable Machine */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Độ tin cậy Teachable Machine
              </span>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                <span className="text-amber-600 font-black">{aiConfidencePercent}%</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                AI nghe: <strong className="text-slate-900 uppercase">{topToneName || 'Chưa rõ'}</strong>
              </p>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-2 italic flex items-start gap-1 leading-snug">
            <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
            <span>Mô hình âm phổ Teachable Machine đo độc lập với giải thuật F0.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
