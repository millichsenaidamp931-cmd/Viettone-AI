import React from 'react';
import { X, GitBranch, Cpu, Activity, Sparkles, CheckCircle2, Download, Layers } from 'lucide-react';
import flowDiagramImg from '../assets/images/code_flow_diagram_1793629394100.jpg';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  VietTone AI – Sơ đồ Luồng Xử lý & Kiến trúc Hệ thống
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
                  Hybrid Engine v2.1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Code Flow Diagram: VAD Preprocessing + Teachable Machine + YIN F0 Pitch Tracking + Hybrid Decision
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={flowDiagramImg}
              download="VietTone_AI_Code_Flow_Diagram.jpg"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="Tải ảnh sơ đồ gốc chất lượng cao"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải ảnh</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto py-4 space-y-5 pr-1">
          {/* Main Diagram View */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/60 shadow-inner group">
            <img
              src={flowDiagramImg}
              alt="VietTone AI Code Flow Diagram"
              className="w-full h-auto object-contain rounded-2xl transition-transform duration-300"
              loading="eager"
            />
            <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-xs border border-slate-800">
              High Resolution Architecture Blueprint
            </div>
          </div>

          {/* Module Explanations Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Box 1: Preprocessing & VAD */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1.5">
                <Activity className="w-4 h-4" />
                <span>1. Tiền xử lý & VAD</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                <code>vadPreprocessor.ts</code> tính năng lượng RMS để phát hiện giọng nói, cắt bỏ khoảng lặng thừa ở đầu và cuối bản ghi, chuẩn hóa âm lượng (Peak Normalization) giúp tín hiệu đầu vào chuẩn xác.
              </p>
            </div>

            {/* Box 2: Dual Stream Processing */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-1.5">
                <Layers className="w-4 h-4" />
                <span>2. Song luồng: AI + Vật lý F0</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                <strong>Nhánh 1:</strong> Teachable Machine (CNN Spectrogram) dự đoán xác suất 6 thanh.<br />
                <strong>Nhánh 2:</strong> Thuật toán YIN trích xuất đường cao độ thực F0 (Hz) & phân loại ngữ âm học theo độ dốc, điểm gãy, âm vực.
              </p>
            </div>

            {/* Box 3: Hybrid Engine & DTW */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span>3. Quyết định Hybrid & Chấm điểm DTW</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                <code>hybridToneEngine.ts</code> giải quyết mâu thuẫn vật lý (bác bỏ phán đoán sai của CNN khi đường cao độ ngược chiều). <code>F0ScoringService</code> tính điểm tương đồng DTW (0–100) đối chiếu giọng mẫu giáo viên.
              </p>
            </div>
          </div>

          {/* Key Advantages Checklist */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/60 text-xs">
            <h4 className="font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Ưu điểm kiến trúc Hybrid kết hợp VAD:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-cyan-200/90">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                <span>Bảo toàn 100% URL Teachable Machine và metadata ban đầu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                <span>Loại bỏ độ trễ và nhầm lẫn do khoảng lặng micro</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                <span>Phản biện vật lý đường cao độ ngăn chặn nhận diện sai</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                <span>Hoạt động 100% offline trên trình duyệt người dùng (Client-side)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            Architecture: Web Audio API • YIN F0 • CNN Transfer Learning • DTW
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
