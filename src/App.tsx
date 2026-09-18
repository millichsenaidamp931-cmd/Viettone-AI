/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TEACHABLE_MACHINE_MODEL_URL } from './config';
import { VIETNAMESE_TONES } from './data/tones';
import { ToneItem } from './types';
import { speechEngineInstance, RecognitionCallbackPayload } from './services/speechRecognizer';
import { Header } from './components/Header';
import { ToneSelector } from './components/ToneSelector';
import { MicController } from './components/MicController';
import { AiProbabilityBars } from './components/AiProbabilityBars';
import { ResultFeedback } from './components/ResultFeedback';
import { ModelSettingsModal } from './components/ModelSettingsModal';
import { PitchGuideInfo } from './components/PitchGuideInfo';
import { ShieldCheck, Info } from 'lucide-react';

export default function App() {
  // State quản lý mô hình
  const [modelUrl, setModelUrl] = useState<string>(TEACHABLE_MACHINE_MODEL_URL);
  const [isModelReady, setIsModelReady] = useState<boolean>(false);
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);
  const [modelErrorMessage, setModelErrorMessage] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // State chọn thanh và microphone
  const [selectedTone, setSelectedTone] = useState<ToneItem>(VIETNAMESE_TONES[4]); // Mặc định: mã (thanh ngã) như ví dụ yêu cầu
  const [isListening, setIsListening] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState<number>(0);

  // State xác suất và kết quả AI
  const [currentProbabilities, setCurrentProbabilities] = useState<Record<string, number>>({
    'Thanh ngang': 0.16,
    'Thanh sắc': 0.17,
    'Thanh huyền': 0.16,
    'Thanh hỏi': 0.17,
    'Thanh ngã': 0.17,
    'Thanh nặng': 0.17,
  });
  const [topToneName, setTopToneName] = useState<string | null>(null);
  const [topToneScore, setTopToneScore] = useState<number>(0);

  // State đánh giá so sánh kết quả cuối cùng
  const [feedbackStatus, setFeedbackStatus] = useState<
    'idle' | 'listening' | 'matched' | 'unmatched' | 'low_confidence'
  >('idle');
  const [finalWinnerTone, setFinalWinnerTone] = useState<string | null>(null);
  const [finalConfidence, setFinalConfidence] = useState<number>(0);

  // Bộ đếm thời gian tự động gom mẫu ổn định khi người dùng phát âm
  const listeningTimerRef = useRef<number | null>(null);
  const speechDetectedRef = useRef<boolean>(false);

  // 1. Tải mô hình khi khởi động
  const initModel = useCallback(async (urlToLoad: string) => {
    setIsModelReady(false);
    setModelErrorMessage('');
    const result = await speechEngineInstance.loadModel(urlToLoad);
    setIsModelReady(result.success);
    setIsFallbackMode(result.isFallback);
    if (result.error) {
      setModelErrorMessage(result.error);
    }
  }, []);

  useEffect(() => {
    initModel(modelUrl);

    // Giải phóng recognizer khi component unmount
    return () => {
      speechEngineInstance.destroy();
      if (listeningTimerRef.current) {
        clearTimeout(listeningTimerRef.current);
      }
    };
  }, [initModel, modelUrl]);

  // 2. Xử lý khung dữ liệu nhận diện liên tục từ speech-commands
  const handleFrameUpdate = useCallback((payload: RecognitionCallbackPayload) => {
    setAudioVolume(payload.audioVolume);

    // Bỏ qua nếu chỉ là Background Noise và chưa có giọng nói
    if (payload.isBackgroundNoise) {
      return;
    }

    speechDetectedRef.current = true;
    setCurrentProbabilities(payload.normalizedToneScores);

    if (payload.topTone) {
      setTopToneName(payload.topTone);
      setTopToneScore(payload.topToneScore);
    }
  }, []);

  // 3. Kết thúc một đợt đọc và ổn định dự đoán (Ổn định dự đoán)
  const finalizeRecognition = useCallback(async () => {
    await speechEngineInstance.stopListening();
    setIsListening(false);
    setAudioVolume(0);

    if (listeningTimerRef.current) {
      clearTimeout(listeningTimerRef.current);
      listeningTimerRef.current = null;
    }

    // Lấy kết quả trung bình xác suất & majority voting qua các cửa sổ âm thanh
    const stabilized = speechEngineInstance.getStabilizedResult();

    if (stabilized.isStable && stabilized.winnerTone) {
      setCurrentProbabilities(stabilized.averageScores);
      setTopToneName(stabilized.winnerTone);
      setTopToneScore(stabilized.confidence);
      setFinalWinnerTone(stabilized.winnerTone);
      setFinalConfidence(stabilized.confidence);

      // So sánh với thanh người dùng đã chọn
      if (stabilized.winnerTone.trim().toLowerCase() === selectedTone.name.trim().toLowerCase()) {
        setFeedbackStatus('matched');
      } else {
        setFeedbackStatus('unmatched');
      }
    } else {
      // Độ tự tin quá thấp hoặc chưa ổn định qua nhiều cửa sổ
      setFeedbackStatus('low_confidence');
      setFinalWinnerTone(null);
      setFinalConfidence(0);
    }
  }, [selectedTone]);

  // 4. Bắt đầu lắng nghe
  const handleStartListening = async () => {
    setPermissionError(null);
    setFeedbackStatus('listening');
    setTopToneName(null);
    setTopToneScore(0);
    speechDetectedRef.current = false;

    const started = await speechEngineInstance.startListening(
      handleFrameUpdate,
      (errType, message) => {
        setIsListening(false);
        setFeedbackStatus('idle');
        if (errType === 'permission_denied') {
          setPermissionError(message);
        } else {
          setModelErrorMessage(message);
        }
      }
    );

    if (started) {
      setIsListening(true);

      // Thu thập mẫu trong ~1.6 giây để gom đủ các cửa sổ âm thanh liên tiếp ổn định
      listeningTimerRef.current = window.setTimeout(() => {
        finalizeRecognition();
      }, 1800);
    }
  };

  // 5. Nút dừng đọc thủ công
  const handleStopListening = () => {
    finalizeRecognition();
  };

  // 6. Chọn thanh điệu tiếp theo
  const handleNextTone = () => {
    const currentIndex = VIETNAMESE_TONES.findIndex((t) => t.id === selectedTone.id);
    const nextIndex = (currentIndex + 1) % VIETNAMESE_TONES.length;
    setSelectedTone(VIETNAMESE_TONES[nextIndex]);
    setFeedbackStatus('idle');
    setTopToneName(null);
  };

  // 7. Thử đọc lại
  const handleRetry = () => {
    setFeedbackStatus('idle');
    handleStartListening();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Be_Vietnam_Pro',sans-serif]">
      {/* Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        isModelReady={isModelReady}
        isFallback={isFallbackMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center">
        {/* Step 1: Tone Selector */}
        <section className="w-full mb-2">
          <ToneSelector
            selectedTone={selectedTone}
            onSelectTone={(tone) => {
              if (isListening) return;
              setSelectedTone(tone);
              setFeedbackStatus('idle');
              setTopToneName(null);
            }}
            disabled={isListening}
          />
        </section>

        {/* Step 2: Microphone Control */}
        <section className="w-full">
          <MicController
            isListening={isListening}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            audioVolume={audioVolume}
            permissionError={permissionError}
            onRetryPermission={handleStartListening}
            selectedWord={selectedTone.word}
          />
        </section>

        {/* Step 3: Result Feedback Banner */}
        <section className="w-full">
          <ResultFeedback
            status={feedbackStatus}
            targetTone={selectedTone}
            predictedToneName={finalWinnerTone || topToneName}
            confidence={finalConfidence || topToneScore}
            onNextTone={handleNextTone}
            onRetry={handleRetry}
          />
        </section>

        {/* Step 4: AI Probability Bars for all 6 tones */}
        <section className="w-full mt-2">
          <AiProbabilityBars
            probabilities={currentProbabilities}
            topToneName={topToneName}
            topToneScore={topToneScore}
            isListening={isListening}
            selectedToneName={selectedTone.name}
          />
        </section>

        {/* Fallback Notice Banner if Model URL hasn't been configured yet */}
        {isFallbackMode && (
          <div className="w-full mt-5 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-amber-950">
                Thông báo cấu hình Teachable Machine
              </p>
              <p className="text-amber-800 mt-0.5">
                Biến <code>TEACHABLE_MACHINE_MODEL_URL</code> hiện đang sử dụng liên kết mẫu. Khi bạn hoàn tất huấn luyện mô hình trên Google Teachable Machine Audio (với 7 class: Background Noise và 6 thanh), hãy dán URL vào phần &ldquo;Cài đặt&rdquo; ở góc trên. Hiện tại, hệ thống hỗ trợ bộ phân tích âm vực Web Audio API để bạn có thể kiểm thử đầy đủ ngay.
              </p>
            </div>
          </div>
        )}

        {/* Privacy Mandate Notice */}
        <div className="w-full mt-8 pt-4 border-t border-slate-200/80 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Âm thanh được AI xử lý trực tiếp trên thiết bị và không được VietTone AI tải lên máy chủ.
          </span>
        </div>
      </main>

      {/* Settings Modal */}
      <ModelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentModelUrl={modelUrl}
        onSaveModelUrl={async (newUrl) => {
          setModelUrl(newUrl);
          await initModel(newUrl);
          setIsSettingsOpen(false);
        }}
        isFallback={isFallbackMode}
        modelError={modelErrorMessage}
      />

      {/* Pitch Guide Modal */}
      <PitchGuideInfo
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
