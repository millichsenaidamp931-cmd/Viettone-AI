import React, { useState } from 'react';
import {
  Settings2,
  Volume2,
  VolumeX,
  Sparkles,
  GitBranch,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  Mic,
  Cpu,
} from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { playCelebrationChime } from '../../utils/audioSynthesizer';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundFxEnabled: boolean;
  onToggleSoundFx: () => void;
  onOpenTeacherModal: () => void;
  onOpenArchitecture: () => void;
  onOpenModelSettings: () => void;
  onClearHistory: () => void;
  isModelReady: boolean;
  isFallback: boolean;
  modelUrl: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundFxEnabled,
  onToggleSoundFx,
  onOpenTeacherModal,
  onOpenArchitecture,
  onOpenModelSettings,
  onClearHistory,
  isModelReady,
  isFallback,
  modelUrl,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleTestChime = () => {
    playCelebrationChime('success');
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Cài đặt hệ thống"
      subtitle="Tùy chỉnh âm thanh, mô hình AI, mẫu chuẩn giáo viên và dữ liệu"
      icon={<Settings2 className="w-5 h-5" />}
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-4">
        {/* 1. Tùy chỉnh Âm thanh hiệu ứng */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              {soundFxEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                Âm thanh hiệu ứng & Chimes
              </h4>
              <p className="text-xs text-slate-500">
                Phát chuông ngũ cung êm dịu khi đạt tiến bộ hoặc mốc luyện tập
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {soundFxEnabled && (
              <button
                type="button"
                onClick={handleTestChime}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Nghe thử âm thanh"
              >
                Thử
              </button>
            )}

            <button
              type="button"
              onClick={onToggleSoundFx}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                soundFxEnabled ? 'bg-red-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={soundFxEnabled}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  soundFxEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. Quản lý Mẫu chuẩn Giáo viên */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                Mẫu chuẩn Giáo viên (Teacher Reference)
              </h4>
              <p className="text-xs text-slate-500">
                Ghi âm mẫu giáo viên chuẩn hoặc tải file audio F0 đối chiếu thực tế
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenTeacherModal();
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer shrink-0"
          >
            Quản lý mẫu
          </button>
        </div>

        {/* 3. Mô hình AI Teachable Machine & Cấu hình */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  Mô hình AI Teachable Machine
                </h4>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isModelReady
                      ? isFallback
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isModelReady
                        ? isFallback
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  {isModelReady ? (isFallback ? 'Mô phỏng F0' : 'Sẵn sàng') : 'Đang tải'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5" title={modelUrl}>
                URL: {modelUrl}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenModelSettings();
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          >
            Đổi URL
          </button>
        </div>

        {/* 4. Sơ đồ kiến trúc thuật toán (Architecture Flow) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-100">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                Sơ đồ Kiến trúc & Luồng xử lý Code
              </h4>
              <p className="text-xs text-slate-500">
                Biểu đồ luồng dữ liệu thời gian thực từ AudioContext qua Teachable Machine và DTW F0
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenArchitecture();
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 transition-colors cursor-pointer shrink-0"
          >
            Xem sơ đồ
          </button>
        </div>

        {/* 5. Xóa lịch sử dữ liệu luyện tập */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  Xóa toàn bộ lịch sử luyện tập
                </h4>
                <p className="text-xs text-slate-500">
                  Đặt lại dữ liệu tiến độ và streak về trạng thái ban đầu
                </p>
              </div>
            </div>

            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer shrink-0"
              >
                Xóa dữ liệu
              </button>
            ) : null}
          </div>

          {showClearConfirm && (
            <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="font-semibold">
                  Bạn có chắc chắn muốn xóa toàn bộ lịch sử luyện tập và chuỗi ngày rèn luyện? Thao tác này không thể hoàn tác.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearHistory();
                    setShowClearConfirm(false);
                    onClose();
                  }}
                  className="px-3 py-1 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 cursor-pointer shadow-xs"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
