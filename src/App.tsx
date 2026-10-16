/**
 * VietTone AI - Version 2.0 (Modern Educational SaaS Dashboard)
 * Luyện nghe và phát âm 6 thanh điệu tiếng Việt
 * 
 * Bố cục 3 màn hình chuyên biệt:
 * 1. Luyện phát âm (2 cột trên desktop, kết quả tức thì không cần cuộn trang)
 * 2. Lộ trình học tập (4 bước sư phạm, đánh giá đủ 3 lượt, gợi ý thanh tiếp theo)
 * 3. Tiến bộ của tôi (Dashboard phân tích 7 ngày, lịch sử và điểm số F0)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TEACHABLE_MACHINE_MODEL_URL } from './config';
import { VIETNAMESE_TONES } from './data/tones';
import {
  ToneItem,
  ToneId,
  F0ContourData,
  ReferenceToneSample,
  F0ScoreResult,
  FeedbackAssessment,
  PracticeAttempt,
  ToneRoadmapStat,
} from './types';
import { speechEngineInstance, RecognitionCallbackPayload } from './services/speechRecognizer';
import { PitchEstimator } from './services/pitchEstimator';
import { ReferenceAudioService } from './services/referenceAudioService';
import { F0ScoringService } from './services/f0Scoring';
import { FeedbackAdvisor } from './services/feedbackAdvisor';
import { ProgressStorage } from './services/progressStorage';

import { Header } from './components/Header';
import { BottomNav, MainTabType } from './components/BottomNav';
import { ToneSelector } from './components/ToneSelector';
import { MicController } from './components/MicController';
import { AiProbabilityBars } from './components/AiProbabilityBars';
import { F0ContourChart } from './components/F0ContourChart';
import { F0ScoreCard } from './components/F0ScoreCard';
import { DetailedFeedback } from './components/DetailedFeedback';
import { LearningRoadmap } from './components/LearningRoadmap';
import { ProgressDashboard } from './components/ProgressDashboard';
import { ModelSettingsModal } from './components/ModelSettingsModal';
import { PitchGuideInfo } from './components/PitchGuideInfo';
import { TeacherReferenceModal } from './components/TeacherReferenceModal';

import { ShieldCheck, Info } from 'lucide-react';

export default function App() {
  // State điều hướng 3 Tab chính (Educational SaaS layout)
  const [activeTab, setActiveTab] = useState<MainTabType>('practice');

  // State quản lý mô hình Teachable Machine
  const [modelUrl, setModelUrl] = useState<string>(TEACHABLE_MACHINE_MODEL_URL);
  const [isModelReady, setIsModelReady] = useState<boolean>(false);
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);
  const [modelErrorMessage, setModelErrorMessage] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState<boolean>(false);

  // State chọn thanh và microphone
  const [selectedTone, setSelectedTone] = useState<ToneItem>(VIETNAMESE_TONES[4]); // Mặc định: mã (thanh ngã)
  const [isListening, setIsListening] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState<number>(0);

  // State xác suất thời gian thực
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

  // State kết quả F0 & Phản hồi của lượt đọc
  const [userContour, setUserContour] = useState<F0ContourData | null>(null);
  const [refSample, setRefSample] = useState<ReferenceToneSample | null>(null);
  const [f0ScoreResult, setF0ScoreResult] = useState<F0ScoreResult | null>(null);
  const [feedbackAssessment, setFeedbackAssessment] = useState<FeedbackAssessment | null>(null);

  // Tiến trình và lịch sử lưu trữ cục bộ
  const [historyAttempts, setHistoryAttempts] = useState<PracticeAttempt[]>([]);
  const [roadmapStats, setRoadmapStats] = useState<ToneRoadmapStat[]>([]);
  const [recent7Days, setRecent7Days] = useState<
    Array<{ dateStr: string; displayDate: string; attemptsCount: number; avgScore: number | null }>
  >([]);

  const listeningTimerRef = useRef<number | null>(null);
  const speechDetectedRef = useRef<boolean>(false);

  // Tải dữ liệu lưu trữ từ localStorage
  const refreshStorageData = useCallback(() => {
    const attempts = ProgressStorage.getAllAttempts();
    const stats = ProgressStorage.getToneStats();
    const days = ProgressStorage.getRecent7DaysProgress();
    setHistoryAttempts(attempts);
    setRoadmapStats(stats);
    setRecent7Days(days);
  }, []);

  // Cập nhật mẫu tham chiếu khi đổi thanh
  const updateCurrentRefSample = useCallback((toneId: ToneId) => {
    const sample = ReferenceAudioService.getReferenceSample(toneId);
    setRefSample(sample);
  }, []);

  useEffect(() => {
    updateCurrentRefSample(selectedTone.id);
  }, [selectedTone.id, updateCurrentRefSample]);

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
    refreshStorageData();

    return () => {
      speechEngineInstance.destroy();
      if (listeningTimerRef.current) {
        clearTimeout(listeningTimerRef.current);
      }
    };
  }, [initModel, modelUrl, refreshStorageData]);

  // 2. Xử lý khung dữ liệu nhận diện liên tục từ speech-commands
  const handleFrameUpdate = useCallback((payload: RecognitionCallbackPayload) => {
    setAudioVolume(payload.audioVolume);

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

  // 3. Kết thúc một đợt đọc và tổng hợp F0 + Điểm số + Phản hồi
  const finalizeRecognition = useCallback(async () => {
    await speechEngineInstance.stopListening();
    setIsListening(false);
    setAudioVolume(0);

    if (listeningTimerRef.current) {
      clearTimeout(listeningTimerRef.current);
      listeningTimerRef.current = null;
    }

    // A. Lấy kết quả AI từ Teachable Machine
    const stabilized = speechEngineInstance.getStabilizedResult();
    const finalScores = stabilized.averageScores;
    const finalTopTone = stabilized.winnerTone;
    const finalConfidence = stabilized.confidence;

    setCurrentProbabilities(finalScores);
    setTopToneName(finalTopTone);
    setTopToneScore(finalConfidence);

    // B. Lấy buffer âm thanh thực tế của lượt đọc và phân tích F0 (YIN/Autocorrelation)
    const recordedAudio = speechEngineInstance.getLastRecordedAudio();
    let contour: F0ContourData | null = null;

    if (recordedAudio && recordedAudio.buffer.length > 0) {
      contour = PitchEstimator.extractF0Contour(
        recordedAudio.buffer,
        recordedAudio.sampleRate
      );
    } else {
      contour = {
        points: [],
        durationMs: 0,
        meanPitchHz: 0,
        minPitchHz: 0,
        maxPitchHz: 0,
        pitchRangeHz: 0,
        pitchSlopeHzPerSec: 0,
        isReliable: false,
        unreliableReason: 'Chưa thu nhận được tín hiệu âm thanh từ microphone.',
        voicedFramesCount: 0,
        totalFramesCount: 0,
      };
    }
    setUserContour(contour);

    // C. Lấy mẫu tham chiếu chuẩn thật
    const currentRef = ReferenceAudioService.getReferenceSample(selectedTone.id);
    setRefSample(currentRef);

    // D. Tính điểm tương đồng F0 (0–100)
    const f0ScoreRes = F0ScoringService.calculateF0Similarity(contour, currentRef);
    setF0ScoreResult(f0ScoreRes);

    // E. Phản hồi sư phạm chỉ rõ lỗi có thể cải thiện
    const assessment = FeedbackAdvisor.generateAssessment({
      targetTone: selectedTone,
      predictedToneName: finalTopTone,
      probabilities: finalScores,
      userContour: contour,
      refSample: currentRef,
      f0ScoreResult: f0ScoreRes,
    });
    setFeedbackAssessment(assessment);

    // F. Lưu lượt luyện vào localStorage
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const isMatch =
      finalTopTone?.trim().toLowerCase() === selectedTone.name.trim().toLowerCase();

    let audioQuality: PracticeAttempt['audioQuality'] = 'good';
    if (!contour.isReliable) {
      audioQuality = 'unreliable_pitch';
    }

    const attempt: PracticeAttempt = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      dateStr,
      targetToneId: selectedTone.id,
      targetToneName: selectedTone.name,
      targetWord: selectedTone.word,
      predictedToneName: finalTopTone,
      confidence: finalConfidence,
      top2Margin: assessment.top2Margin,
      isAiConfident: assessment.isAiConfident,
      isMatch,
      hasReliableF0: contour.isReliable,
      f0Score: f0ScoreRes.score,
      meanPitchHz: contour.meanPitchHz || undefined,
      audioQuality,
      adviceSummary: assessment.headline,
    };

    ProgressStorage.saveAttempt(attempt);
    refreshStorageData();
  }, [selectedTone, refreshStorageData]);

  // 4. Bắt đầu lắng nghe
  const handleStartListening = async () => {
    setPermissionError(null);
    setUserContour(null);
    setF0ScoreResult(null);
    setFeedbackAssessment(null);
    setTopToneName(null);
    setTopToneScore(0);
    speechDetectedRef.current = false;

    const started = await speechEngineInstance.startListening(
      handleFrameUpdate,
      (errType, message) => {
        setIsListening(false);
        if (errType === 'permission_denied') {
          setPermissionError(message);
        } else {
          setModelErrorMessage(message);
        }
      }
    );

    if (started) {
      setIsListening(true);
      listeningTimerRef.current = window.setTimeout(() => {
        finalizeRecognition();
      }, 1900);
    }
  };

  const handleStopListening = () => {
    finalizeRecognition();
  };

  const handleNextTone = () => {
    const currentIndex = VIETNAMESE_TONES.findIndex((t) => t.id === selectedTone.id);
    const nextIndex = (currentIndex + 1) % VIETNAMESE_TONES.length;
    setSelectedTone(VIETNAMESE_TONES[nextIndex]);
    setUserContour(null);
    setF0ScoreResult(null);
    setFeedbackAssessment(null);
  };

  const handleSelectToneById = (toneId: ToneId) => {
    if (isListening) return;
    const tone = VIETNAMESE_TONES.find((t) => t.id === toneId);
    if (tone) {
      setSelectedTone(tone);
      setUserContour(null);
      setF0ScoreResult(null);
      setFeedbackAssessment(null);
      setActiveTab('practice');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleClearHistory = () => {
    ProgressStorage.clearHistory();
    refreshStorageData();
  };

  const nextRecommendation = ProgressStorage.getNextRecommendedTone();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Be_Vietnam_Pro',sans-serif] pb-20 md:pb-8">
      {/* SaaS Navigation Header */}
      <Header
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        isModelReady={isModelReady}
        isFallback={isFallbackMode}
      />

      {/* Main SaaS Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* ================= TAB 1: LUYỆN PHÁT ÂM (STUDIO - 2 CỘT DESKTOP) ================= */}
        {activeTab === 'practice' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* CỘT TRÁI (LỰA CHỌN, MICROPHONE, VÀ PHẢN HỒI LỖI CẢI THIỆN) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Compact Tone Selector */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs">
                <ToneSelector
                  selectedTone={selectedTone}
                  onSelectTone={(tone) => {
                    if (isListening) return;
                    setSelectedTone(tone);
                    setUserContour(null);
                    setF0ScoreResult(null);
                    setFeedbackAssessment(null);
                  }}
                  disabled={isListening}
                />
              </div>

              {/* Large Microphone Controller */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
                <MicController
                  isListening={isListening}
                  onStartListening={handleStartListening}
                  onStopListening={handleStopListening}
                  audioVolume={audioVolume}
                  permissionError={permissionError}
                  onRetryPermission={handleStartListening}
                  selectedWord={selectedTone.word}
                />
              </div>

              {/* Detailed Feedback & Pedagogical Advice (Hoặc trạng thái chờ) */}
              <DetailedFeedback
                assessment={feedbackAssessment}
                targetTone={selectedTone}
                isListening={isListening}
                onRetry={handleStartListening}
                onNextTone={handleNextTone}
              />
            </div>

            {/* CỘT PHẢI (XÁC SUẤT 6 THANH, ĐIỂM F0, VÀ BIỂU ĐỒ ĐỐI CHIẾU) */}
            <div className="lg:col-span-7 space-y-3">
              {/* Xác suất dự đoán 6 thanh của AI Teachable Machine */}
              <AiProbabilityBars
                probabilities={currentProbabilities}
                topToneName={topToneName}
                topToneScore={topToneScore}
                isListening={isListening}
                selectedToneName={selectedTone.name}
              />

              {/* Thẻ điểm tương đồng F0 (0–100) độc lập */}
              {f0ScoreResult && (
                <F0ScoreCard
                  f0Result={f0ScoreResult}
                  aiConfidencePercent={Math.round(topToneScore * 100)}
                  topToneName={topToneName}
                />
              )}

              {/* Biểu đồ đường cao độ F0 (Hz/ms) */}
              <F0ContourChart
                userContour={userContour}
                refSample={refSample}
                targetToneName={selectedTone.name}
                isListening={isListening}
                onOpenTeacherModal={() => setIsTeacherModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 2: LỘ TRÌNH HỌC TẬP (ROADMAP) ================= */}
        {activeTab === 'roadmap' && (
          <div className="animate-in fade-in duration-200">
            <LearningRoadmap
              stats={roadmapStats}
              nextRecommended={nextRecommendation}
              onSelectToneId={handleSelectToneById}
            />
          </div>
        )}

        {/* ================= TAB 3: TIẾN BỘ CỦA TÔI (PROGRESS / ANALYTICS) ================= */}
        {activeTab === 'progress' && (
          <div className="animate-in fade-in duration-200">
            <ProgressDashboard
              attempts={historyAttempts}
              stats={roadmapStats}
              recent7Days={recent7Days}
              onClearHistory={handleClearHistory}
              onSelectAttemptTone={handleSelectToneById}
            />
          </div>
        )}

        {/* Thông báo Fallback nếu URL mô hình chưa kết nối */}
        {isFallbackMode && (
          <div className="w-full mt-4 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-amber-950">Chế độ phân tích âm vực thời gian thực</p>
              <p className="text-amber-800 mt-0.5">
                Mô hình đang kết nối URL: <code>{modelUrl}</code>. Toàn bộ giải thuật F0, chấm điểm tương đồng DTW và các tính năng học tập đang hoạt động trực tiếp trên trình duyệt.
              </p>
            </div>
          </div>
        )}

        {/* Footer Privacy Notice */}
        <div className="w-full mt-6 pt-3 border-t border-slate-200/80 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Âm thanh và dữ liệu luyện tập được xử lý trực tiếp trên thiết bị của bạn, hoàn toàn không gửi lên máy chủ.
          </span>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Cố định ở đáy) */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Model Settings & Teacher Reference Modal */}
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
        onOpenTeacherModal={() => setIsTeacherModalOpen(true)}
      />

      {/* Pitch Guide Modal */}
      <PitchGuideInfo
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Teacher Reference Samples Management Modal */}
      <TeacherReferenceModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onSamplesUpdated={() => {
          updateCurrentRefSample(selectedTone.id);
          refreshStorageData();
        }}
      />
    </div>
  );
}
