/**
 * VietTone AI - Dashboard Tiến bộ của tôi (Personal Progress Dashboard)
 * 
 * Lưu trữ 100% trên trình duyệt (localStorage), không sinh dữ liệu giả.
 * Hiển thị thống kê tổng quan, chuỗi ngày rèn luyện (Streak), huy hiệu thành tích,
 * biểu đồ 7 ngày, điểm 6 thanh, danh sách lịch sử và hộp xác nhận xóa.
 */

import React, { useState } from 'react';
import { PracticeAttempt, ToneRoadmapStat, StreakInfo, MilestoneBadge } from '../types';
import {
  TrendingUp,
  Calendar,
  History,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Flame,
  Award,
  Sparkles,
} from 'lucide-react';
import { BadgesShowcase } from './BadgesShowcase';

interface ProgressDashboardProps {
  attempts: PracticeAttempt[];
  stats: ToneRoadmapStat[];
  recent7Days: Array<{
    dateStr: string;
    displayDate: string;
    attemptsCount: number;
    avgScore: number | null;
  }>;
  streakInfo: StreakInfo;
  badges: MilestoneBadge[];
  onClearHistory: () => void;
  onSelectAttemptTone: (toneId: PracticeAttempt['targetToneId']) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  attempts,
  stats,
  recent7Days,
  streakInfo,
  badges,
  onClearHistory,
  onSelectAttemptTone,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Tính các con số thống kê tổng hợp từ dữ liệu thật
  const totalAttemptsCount = attempts.length;
  const validAttemptsWithF0 = attempts.filter(
    (a) => typeof a.f0Score === 'number' && a.f0Score >= 0
  );
  const overallAvgF0 =
    validAttemptsWithF0.length > 0
      ? Math.round(
          validAttemptsWithF0.reduce((acc, a) => acc + (a.f0Score || 0), 0) /
            validAttemptsWithF0.length
        )
      : null;

  const totalMatchesCount = attempts.filter((a) => a.isMatch).length;
  const overallMatchRatio =
    totalAttemptsCount > 0 ? Math.round((totalMatchesCount / totalAttemptsCount) * 100) : 0;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs my-3 sm:my-4 space-y-6">
      {/* Tiêu đề & Nút xóa lịch sử */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Tiến bộ của tôi
            </h2>
            <p className="text-xs text-slate-500">
              Nhật ký rèn luyện và cột mốc thói quen được lưu trữ bảo mật cục bộ trên thiết bị của bạn
            </p>
          </div>
        </div>

        {totalAttemptsCount > 0 && (
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-700 font-medium text-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa lịch sử</span>
          </button>
        )}
      </div>

      {/* Thẻ chuỗi ngày học tập (Streak Banner) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-red-50 border border-orange-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Flame className="w-7 h-7 fill-amber-300 text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black text-slate-900">
                Chuỗi {streakInfo.currentStreak} ngày rèn luyện
              </span>
              {streakInfo.isActiveToday ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Đã luyện hôm nay
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Luyện ngay để giữ chuỗi!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {streakInfo.currentStreak >= 3
                ? 'Thật tuyệt vời! Bạn đang duy trì thói quen học tập rất đều đặn và kiên trì.'
                : streakInfo.currentStreak > 0
                ? 'Mỗi ngày dành 3-5 phút luyện phát âm sẽ giúp tai nghe và cơ quan phát âm hòa nhịp tự nhiên.'
                : 'Hãy bắt đầu lượt đọc đầu tiên hôm nay để thắp sáng chuỗi ngày rèn luyện nhé!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0 text-xs text-slate-600 font-medium">
          <span className="px-2.5 py-1 rounded-xl bg-white/80 border border-orange-200 font-bold text-orange-800">
            Tổng {streakInfo.totalDaysActive} ngày học tích lũy
          </span>
        </div>
      </div>

      {/* Trạng thái trống (Zero State) - Không tạo dữ liệu giả */}
      {totalAttemptsCount === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-slate-200/60">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800">
            Chưa có lịch sử luyện tập nào
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Hãy bắt đầu bằng cách chọn một thanh điệu và bấm &ldquo;🎙 Bắt đầu đọc&rdquo;. Toàn bộ tiến trình, điểm F0 và huy hiệu sẽ được ghi lại tự động và bảo mật trên thiết bị này.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 3 Thẻ chỉ số tổng quan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Tổng số lượt luyện
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {totalAttemptsCount}
                <span className="text-xs font-normal text-slate-500 ml-1">lượt</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {validAttemptsWithF0.length} lượt đủ điều kiện trích xuất F0
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Điểm F0 trung bình
              </span>
              <div className="text-2xl sm:text-3xl font-black text-red-600 mt-1">
                {overallAvgF0 !== null ? `${overallAvgF0}/100` : '--/100'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {overallAvgF0 !== null ? 'Tính từ các lượt F0 hợp lệ' : 'Chưa có đủ lượt F0 hợp lệ'}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Tỉ lệ AI nhận diện khớp
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                {overallMatchRatio}%
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {totalMatchesCount}/{totalAttemptsCount} lượt trùng thanh mục tiêu
              </p>
            </div>
          </div>

          {/* Biểu đồ 7 ngày gần nhất */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-3">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Tiến độ và số lượt luyện 7 ngày gần nhất</span>
            </h3>

            <div className="grid grid-cols-7 gap-2 items-end h-28 pt-2">
              {recent7Days.map((day) => {
                const maxAttempts = Math.max(1, ...recent7Days.map((d) => d.attemptsCount));
                const heightPercent =
                  day.attemptsCount > 0
                    ? Math.max(18, Math.round((day.attemptsCount / maxAttempts) * 100))
                    : 6;

                return (
                  <div key={day.dateStr} className="flex flex-col items-center h-full justify-end">
                    <div className="text-[10px] font-bold text-slate-700 mb-1">
                      {day.attemptsCount > 0 ? day.attemptsCount : '-'}
                    </div>
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                        day.attemptsCount > 0
                          ? 'bg-gradient-to-t from-red-600 to-amber-500'
                          : 'bg-slate-200'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                      title={`${day.displayDate}: ${day.attemptsCount} lượt, Điểm F0 TB: ${
                        day.avgScore !== null ? `${day.avgScore}/100` : 'chưa có'
                      }`}
                    />
                    <span className="text-[10px] text-slate-500 mt-1.5 font-medium">
                      {day.displayDate}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bảng Cột Mốc & Huy Hiệu (Badges Showcase) */}
          <BadgesShowcase badges={badges} />

          {/* Điểm F0 trung bình theo 6 thanh điệu */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Điểm tương đồng F0 trung bình theo từng thanh
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {stats.map((s) => (
                <div
                  key={s.toneId}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center"
                >
                  <span className="text-xs font-bold text-slate-800 block">
                    {s.word} ({s.toneName})
                  </span>
                  <div className="text-base font-black text-slate-900 mt-1">
                    {s.avgF0Score !== null ? (
                      <span className="text-red-600">{s.avgF0Score}/100</span>
                    ) : (
                      <span className="text-slate-400 text-xs font-normal">Chưa có điểm</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {s.validAttempts} lượt hợp lệ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lịch sử các lượt gần đây */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Lịch sử các lượt đọc gần đây
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {attempts.slice(0, 15).map((a, idx) => {
                const dateObj = new Date(a.timestamp);
                const timeString = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj
                  .getMinutes()
                  .toString()
                  .padStart(2, '0')}`;

                // Kiểm tra xem lượt này có cải thiện F0 so với lượt trước đó của cùng thanh không
                let improvementDelta: number | null = null;
                if (typeof a.f0Score === 'number') {
                  const prevAttempt = attempts.slice(idx + 1).find(
                    (p) => p.targetToneId === a.targetToneId && typeof p.f0Score === 'number'
                  );
                  if (prevAttempt && typeof prevAttempt.f0Score === 'number') {
                    const delta = a.f0Score - prevAttempt.f0Score;
                    if (delta >= 5) {
                      improvementDelta = delta;
                    }
                  }
                }

                return (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/70 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {a.isMatch ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900">
                            {a.targetWord} ({a.targetToneName})
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">
                            AI: {a.predictedToneName || 'Không rõ'}
                          </span>

                          {improvementDelta !== null && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Sparkles className="w-2.5 h-2.5" />+{improvementDelta} F0
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{a.adviceSummary}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {a.f0Score !== null ? (
                        <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                          F0: {a.f0Score}/100
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          Không có F0
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{timeString}</span>
                      <button
                        type="button"
                        onClick={() => onSelectAttemptTone(a.targetToneId)}
                        className="text-[11px] text-red-600 hover:text-red-700 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
                      >
                        Luyện lại
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Thông báo quyền riêng tư và lưu trữ cục bộ */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          Dữ liệu tiến trình được lưu trữ hoàn toàn trên trình duyệt của thiết bị này và không truyền tải lên máy chủ.
        </span>
      </div>

      {/* Hộp xác nhận xóa lịch sử */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Xóa toàn bộ lịch sử luyện tập?
            </h3>
            <p className="text-xs text-slate-600 mt-1.5">
              Hành động này sẽ xóa tất cả các lượt đọc, chuỗi ngày rèn luyện và huy hiệu đã lưu trên thiết bị này. Bạn không thể hoàn tác sau khi xóa.
            </p>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  setShowConfirmModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
