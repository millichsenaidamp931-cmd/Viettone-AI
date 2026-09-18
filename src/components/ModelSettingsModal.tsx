import React, { useState } from 'react';
import { X, Check, Globe, RefreshCw, Layers, ShieldCheck, AlertTriangle } from 'lucide-react';
import { TONE_CLASSES } from '../config';

interface ModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModelUrl: string;
  onSaveModelUrl: (newUrl: string) => Promise<void>;
  isFallback: boolean;
  modelError?: string;
}

export const ModelSettingsModal: React.FC<ModelSettingsModalProps> = ({
  isOpen,
  onClose,
  currentModelUrl,
  onSaveModelUrl,
  isFallback,
  modelError,
}) => {
  const [urlInput, setUrlInput] = useState(currentModelUrl);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    setUrlInput(currentModelUrl);
  }, [currentModelUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSaveModelUrl(urlInput);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Cấu hình Teachable Machine
              </h2>
              <p className="text-xs text-slate-500">
                Google Audio Project – Nhận diện 6 thanh điệu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4 text-xs sm:text-sm text-slate-600">
          {/* Status Alert */}
          {isFallback ? (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold mb-0.5">Chế độ Phân tích Âm vực Trực tiếp (Web Audio)</p>
                <p className="text-amber-800">
                  {modelError || 'URL Teachable Machine chưa có sẵn. Hệ thống đang phân tích cao độ bằng Web Audio API để bạn có thể thử phát âm ngay.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-emerald-900 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold mb-0.5">Mô hình Teachable Machine đã sẵn sàng</p>
                <p className="text-emerald-800">
                  Mô hình được tải trực tiếp vào bộ nhớ trình duyệt qua thư viện speech-commands.
                </p>
              </div>
            </div>
          )}

          {/* Form to update URL */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Đường dẫn mô hình (TEACHABLE_MACHINE_MODEL_URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-mono"
                  required
                />
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm shrink-0 flex items-center gap-1.5 transition-colors"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Tải lại'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Tự động tải <code>model.json</code> và <code>metadata.json</code> từ URL này.
              </p>
            </div>
          </form>

          {/* Required 7 Classes info */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs mb-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Yêu cầu chính xác 7 lớp (Classes) trong Teachable Machine:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {TONE_CLASSES.map((clsName, idx) => (
                <div
                  key={clsName}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                >
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center text-slate-700">
                    {idx + 1}
                  </span>
                  <span className="truncate">{clsName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy reminder */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-slate-600 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Mô hình chạy hoàn toàn trên trình duyệt, không gửi âm thanh lên máy chủ.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
