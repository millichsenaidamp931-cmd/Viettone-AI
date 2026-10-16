/**
 * VietTone AI - Biểu đồ đường cao độ F0 (Pitch Contour Chart)
 * 
 * Vẽ đường cao độ F0 (Hz) theo thời gian (ms) bằng HTML5 Canvas 2D.
 * Trực quan, nhãn trục rõ ràng, phù hợp học sinh lớp 6.
 * Tuyệt đối không sinh dữ liệu giả khi không đủ tín hiệu hoặc chưa có mẫu chuẩn.
 */

import React, { useEffect, useRef } from 'react';
import { F0ContourData, ReferenceToneSample } from '../types';
import { Activity, AlertTriangle, HelpCircle } from 'lucide-react';

interface F0ContourChartProps {
  userContour: F0ContourData | null;
  refSample: ReferenceToneSample | null;
  targetToneName: string;
  isListening: boolean;
  onOpenTeacherModal?: () => void;
}

export const F0ContourChart: React.FC<F0ContourChartProps> = ({
  userContour,
  refSample,
  targetToneName,
  isListening,
  onOpenTeacherModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const hasReliableUser = !!(userContour && userContour.isReliable);
  const hasValidRef = !!(refSample && Array.isArray(refSample.contour) && refSample.contour.length > 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const padding = { top: 20, right: 25, bottom: 40, left: 52 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    if (chartW <= 0 || chartH <= 0) return;

    const userVoiced = hasReliableUser
      ? userContour.points.filter((p) => p.isVoiced && p.pitchHz > 0)
      : [];
    const refVoiced = hasValidRef
      ? refSample.contour.filter((p) => p.isVoiced && p.pitchHz > 0)
      : [];

    const allPitches = [...userVoiced.map((p) => p.pitchHz), ...refVoiced.map((p) => p.pitchHz)];

    let minHz = 100;
    let maxHz = 400;

    if (allPitches.length > 0) {
      const minData = Math.min(...allPitches);
      const maxData = Math.max(...allPitches);
      minHz = Math.max(70, Math.floor((minData - 30) / 20) * 20);
      maxHz = Math.min(650, Math.ceil((maxData + 30) / 20) * 20);
      if (maxHz - minHz < 100) {
        maxHz = minHz + 100;
      }
    }

    let maxTimeMs = 700;
    if (userContour?.durationMs) {
      maxTimeMs = Math.max(maxTimeMs, userContour.durationMs);
    }
    if (refSample?.durationMs) {
      maxTimeMs = Math.max(maxTimeMs, refSample.durationMs);
    }
    maxTimeMs = Math.ceil(maxTimeMs / 100) * 100;

    // 1. Grid ngang & Y labels
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#f1f5f9';
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const yStep = Math.round((maxHz - minHz) / 4);
    for (let i = 0; i <= 4; i++) {
      const hzVal = minHz + i * yStep;
      const y = padding.top + chartH - ((hzVal - minHz) / (maxHz - minHz)) * chartH;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      ctx.fillText(`${hzVal} Hz`, padding.left - 6, y);
    }

    // 2. Grid dọc & X labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const xStepMs = Math.round(maxTimeMs / 4);
    for (let i = 0; i <= 4; i++) {
      const tMs = i * xStepMs;
      const x = padding.left + (tMs / maxTimeMs) * chartW;

      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartH);
      ctx.stroke();

      ctx.fillText(`${tMs} ms`, x, padding.top + chartH + 6);
    }

    // Trục chính
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Thời gian (ms)', padding.left + chartW / 2, padding.top + chartH + 24);

    ctx.save();
    ctx.translate(14, padding.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('F0 (Hz)', 0, 0);
    ctx.restore();

    // 3. Đường mẫu chuẩn (nét đứt xanh sky)
    if (hasValidRef && refVoiced.length > 1) {
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      let started = false;
      for (const p of refSample.contour) {
        if (!p.isVoiced || p.pitchHz <= 0) continue;
        const x = padding.left + (p.timeMs / maxTimeMs) * chartW;
        const y = padding.top + chartH - ((p.pitchHz - minHz) / (maxHz - minHz)) * chartH;

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // 4. Đường người học (nét liền đỏ cam)
    if (hasReliableUser && userVoiced.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();

      let started = false;
      for (const p of userContour.points) {
        if (!p.isVoiced || p.pitchHz <= 0) continue;
        const x = padding.left + (p.timeMs / maxTimeMs) * chartW;
        const y = padding.top + chartH - ((p.pitchHz - minHz) / (maxHz - minHz)) * chartH;

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      for (const p of userContour.points) {
        if (!p.isVoiced || p.pitchHz <= 0) continue;
        const x = padding.left + (p.timeMs / maxTimeMs) * chartW;
        const y = padding.top + chartH - ((p.pitchHz - minHz) / (maxHz - minHz)) * chartH;

        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }, [userContour, refSample, hasReliableUser, hasValidRef]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs my-2">
      {/* Tiêu đề & Chú giải */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-red-600 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
            Biểu đồ đường cao độ F0
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1">
            <span className="w-3 h-1 bg-red-600 rounded-full inline-block" />
            <span className="font-semibold text-slate-700">Giọng bạn</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-1 bg-sky-600 border-b border-dashed border-sky-400 inline-block" />
            <span className="font-semibold text-slate-700">Mẫu chuẩn ({targetToneName})</span>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative w-full h-44 sm:h-48 bg-slate-50/50 rounded-xl overflow-hidden border border-slate-200/60">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Trạng thái 1: Đang ghi âm */}
        {isListening && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-xs flex flex-col items-center justify-center text-center p-3">
            <Activity className="w-5 h-5 text-red-600 animate-pulse mb-1" />
            <p className="text-xs font-bold text-slate-800">
              Đang phân tích đường cao độ giọng nói...
            </p>
          </div>
        )}

        {/* Trạng thái 2: Chưa có lượt đọc nào */}
        {!isListening && !userContour && (
          <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center text-center p-3">
            <p className="text-xs font-semibold text-slate-600">
              Sẵn sàng vẽ đường cao độ F0.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sau khi phát âm, đường nét cao độ của bạn sẽ đối chiếu với mẫu chuẩn tại đây.
            </p>
          </div>
        )}

        {/* Trạng thái 3: Tín hiệu không đủ tốt */}
        {!isListening && userContour && !userContour.isReliable && (
          <div className="absolute inset-0 bg-amber-50/90 backdrop-blur-xs flex flex-col items-center justify-center text-center p-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mb-1" />
            <p className="text-xs font-bold text-amber-900">
              Chưa đủ điều kiện dựng F0
            </p>
            <p className="text-[11px] text-amber-800 mt-0.5 max-w-sm">
              {userContour.unreliableReason || 'Âm thanh quá ngắn hoặc chưa rõ nguyên âm.'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="truncate">
          Tham chiếu: <strong className="text-slate-700">{refSample?.sourceTitle || 'Mẫu âm học chuẩn'}</strong>
        </span>

        {onOpenTeacherModal && (
          <button
            type="button"
            onClick={onOpenTeacherModal}
            className="text-red-600 hover:text-red-700 font-semibold underline underline-offset-2 shrink-0 cursor-pointer ml-2"
          >
            Mẫu chuẩn Giáo viên
          </button>
        )}
      </div>
    </div>
  );
};
