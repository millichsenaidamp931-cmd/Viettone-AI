/**
 * VietTone AI - Modal Quản lý mẫu chuẩn của Giáo viên / Quản trị viên
 * 
 * Cho phép ghi âm giọng đọc chuẩn trực tiếp hoặc tải file âm thanh thật
 * để làm mẫu F0 đối chiếu chấm điểm, thay thế hoặc bổ sung cho mẫu âm học thực nghiệm.
 */

import React, { useState } from 'react';
import { ToneId, ReferenceToneSample } from '../types';
import { VIETNAMESE_TONES } from '../data/tones';
import { ReferenceAudioService } from '../services/referenceAudioService';
import {
  X,
  Mic,
  Square,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Volume2,
} from 'lucide-react';

interface TeacherReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSamplesUpdated: () => void;
}

export const TeacherReferenceModal: React.FC<TeacherReferenceModalProps> = ({
  isOpen,
  onClose,
  onSamplesUpdated,
}) => {
  const [activeRecordingToneId, setActiveRecordingToneId] = useState<ToneId | null>(null);
  const [recordingMediaStream, setRecordingMediaStream] = useState<MediaStream | null>(null);
  const [recordingContext, setRecordingContext] = useState<AudioContext | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Float32Array[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const samplesStatus = ReferenceAudioService.getAllSamplesStatus();

  // Bắt đầu ghi âm mẫu chuẩn từ Microphone của giáo viên
  const handleStartRecord = async (toneId: ToneId) => {
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(2048, 1, 1);
      const chunks: Float32Array[] = [];

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        chunks.push(new Float32Array(input));
      };

      const muteGain = ctx.createGain();
      muteGain.gain.setValueAtTime(0, ctx.currentTime);

      source.connect(processor);
      processor.connect(muteGain);
      muteGain.connect(ctx.destination);

      setRecordingMediaStream(stream);
      setRecordingContext(ctx);
      setRecordedChunks(chunks);
      setActiveRecordingToneId(toneId);
    } catch (err: unknown) {
      console.error('Không thể truy cập microphone giáo viên:', err);
      setErrorMessage('Không thể mở microphone. Vui lòng cấp quyền truy cập.');
    }
  };

  // Dừng ghi âm và phân tích F0 mẫu thật của giáo viên
  const handleStopRecord = async (toneId: ToneId) => {
    if (!recordingContext || recordedChunks.length === 0) {
      cleanupRecording();
      return;
    }

    try {
      const sampleRate = recordingContext.sampleRate;
      const totalLength = recordedChunks.reduce((acc, c) => acc + c.length, 0);
      const merged = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of recordedChunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }

      cleanupRecording();

      const sample = await ReferenceAudioService.saveTeacherSampleFromAudioBuffer(
        toneId,
        merged,
        sampleRate,
        'teacher_recorded',
        `Mẫu ghi âm trực tiếp của Giáo viên (${new Date().toLocaleTimeString('vi-VN')})`
      );

      setStatusMessage(`Đã lưu thành công mẫu chuẩn cho ${sample.toneName} (${sample.word})!`);
      onSamplesUpdated();
    } catch (err: unknown) {
      cleanupRecording();
      const msg = err instanceof Error ? err.message : 'Lỗi khi trích xuất F0 mẫu âm thanh.';
      setErrorMessage(msg);
    }
  };

  const cleanupRecording = () => {
    if (recordingMediaStream) {
      recordingMediaStream.getTracks().forEach((track) => track.stop());
      setRecordingMediaStream(null);
    }
    if (recordingContext && recordingContext.state !== 'closed') {
      recordingContext.close();
      setRecordingContext(null);
    }
    setRecordedChunks([]);
    setActiveRecordingToneId(null);
  };

  // Tải file âm thanh WAV/MP3 từ máy tính lên để làm mẫu chuẩn
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    toneId: ToneId
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);

      const sample = await ReferenceAudioService.saveTeacherSampleFromAudioBuffer(
        toneId,
        channelData,
        audioBuffer.sampleRate,
        'audio_uploaded',
        `Mẫu tải lên: ${file.name}`
      );

      ctx.close();
      setStatusMessage(`Đã cập nhật mẫu chuẩn từ file "${file.name}" cho ${sample.toneName}!`);
      onSamplesUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể giải mã file âm thanh.';
      setErrorMessage(`Lỗi: ${msg}`);
    } finally {
      e.target.value = '';
    }
  };

  // Khôi phục về mẫu tham chiếu thực nghiệm mặc định
  const handleReset = (toneId: ToneId) => {
    ReferenceAudioService.resetTeacherSample(toneId);
    setStatusMessage(`Đã khôi phục về mẫu âm học thực nghiệm cho thanh này.`);
    onSamplesUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Quản lý mẫu chuẩn của Giáo viên</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                F0 Reference
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ghi âm giọng chuẩn của giáo viên hoặc tải file âm thanh thật để làm căn cứ chấm điểm F0
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              cleanupRecording();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông báo trạng thái */}
        {statusMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Danh sách 6 thanh */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          {samplesStatus.map((item) => {
            const isRecordingThis = activeRecordingToneId === item.toneId;
            const toneMeta = VIETNAMESE_TONES.find((t) => t.id === item.toneId);

            return (
              <div
                key={item.toneId}
                className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900">
                      {item.word}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      – {item.toneName}
                    </span>
                    {item.hasTeacherSample ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Giọng giáo viên thật
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                        Âm học thực nghiệm
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Nguồn: <strong className="text-slate-700">{item.sourceTitle}</strong>
                  </p>
                </div>

                {/* Nút hành động */}
                <div className="flex items-center flex-wrap gap-2 self-start sm:self-center shrink-0">
                  {/* Nút Ghi âm */}
                  {!isRecordingThis ? (
                    <button
                      type="button"
                      disabled={activeRecordingToneId !== null}
                      onClick={() => handleStartRecord(item.toneId)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Ghi âm mẫu</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStopRecord(item.toneId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-2xs animate-pulse cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Xong (Lưu mẫu)</span>
                    </button>
                  )}

                  {/* Nút Tải file */}
                  <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải file</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, item.toneId)}
                    />
                  </label>

                  {/* Nút Khôi phục nếu có mẫu giáo viên */}
                  {item.hasTeacherSample && (
                    <button
                      type="button"
                      onClick={() => handleReset(item.toneId)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                      title="Khôi phục mẫu mặc định"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex items-center justify-between text-xs text-slate-500">
          <span>Mẫu F0 được lưu trong bộ nhớ trình duyệt của thiết bị này.</span>
          <button
            type="button"
            onClick={() => {
              cleanupRecording();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
