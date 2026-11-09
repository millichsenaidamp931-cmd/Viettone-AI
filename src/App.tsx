/**
 * VietTone AI - Immersive Learning Experience (Hala Rabbit inspired structure with Bé Lạc centerpiece)
 * Luyện nghe và phát âm 6 thanh điệu tiếng Việt cùng Người bạn đồng hành Bé Lạc
 * 
 * Bố cục Immersive:
 * 1. Minimal Header: Logo, Streak, 5 Popups (Phân tích, Lộ trình, Tiến bộ, Thành tích, Cài đặt), Sound FX
 * 2. Centerpiece Bé Lạc: Bé Lạc ở trung tâm, hiệu ứng sóng âm khi đang nghe, thanh mục tiêu và nút nghe mẫu
 * 3. Khung hội thoại Bé Lạc: Nút Microphone nổi bật, sóng âm âm lượng thực, KẾT QUẢ AI TRỰC TIẾP KHÔNG CẦN POPUP
 * 4. Sáu thẻ thanh điệu: Dưới cùng màn hình (6 cột Desktop, 3x2 Mobile), thứ tự ma, má, mà, mả, mã, mạ
 * 5. Các công cụ phân tích, lộ trình, tiến độ, thành tích và cài đặt được đưa gọn vào popup / modal độc lập
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
  StreakInfo,
  MilestoneBadge,
  MotivationMessage,
} from './types';
import { speechEngineInstance, RecognitionCallbackPayload } from './services/speechRecognizer';
import { PitchEstimator } from './services/pitchEstimator';
import { ReferenceAudioService } from './services/referenceAudioService';
import { F0ScoringService } from './services/f0Scoring';
import { FeedbackAdvisor } from './services/feedbackAdvisor';
import { ProgressStorage } from './services/progressStorage';
import { MotivationEngine } from './services/motivationEngine';
import { HybridToneEngine } from './services/hybridToneEngine';
import {
  isSoundFxEnabled,
  setSoundFxEnabled,
  playCelebrationChime,
  playPracticeWelcomeAudio,
  playRandomEncourageAudio,
  stopAnyVoiceAudio,
  ENCOURAGE_VOICE_MESSAGES,
} from './utils/audioSynthesizer';

// Immersive Redesign Components
import { MinimalHeader } from './components/immersive/MinimalHeader';
import { BeLacHeroCenter } from './components/immersive/BeLacHeroCenter';
import { BeLacDialogueBox } from './components/immersive/BeLacDialogueBox';
import { SixToneCardsBottom } from './components/immersive/SixToneCardsBottom';
import { AnalysisModal } from './components/immersive/AnalysisModal';
import { RoadmapModal } from './components/immersive/RoadmapModal';
import { ProgressModal } from './components/immersive/ProgressModal';
import { AchievementsModal } from './components/immersive/AchievementsModal';
import { SettingsModal } from './components/immersive/SettingsModal';

// Existing System Modals & Effects
import { ModelSettingsModal } from './components/ModelSettingsModal';
import { PitchGuideInfo } from './components/PitchGuideInfo';
import { TeacherReferenceModal } from './components/TeacherReferenceModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { ConfettiEffect } from './components/ConfettiEffect';
import { VietToneHomeEmbedded } from './components/VietToneHomeEmbedded';
import { getInitialRoute, navigateTo, getQueryParam, AppRoute } from './utils/router';

import { ShieldCheck, Info } from 'lucide-react';

export default function App() {
  // Client-side router state ('/' landing page or '/app' learning studio)
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => getInitialRoute());

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getInitialRoute());
      const toneParam = getQueryParam('tone');
      if (toneParam) {
        const found = VIETNAMESE_TONES.find((t) => t.id === toneParam.toLowerCase());
        if (found) {
          setSelectedTone(found);
          setUserContour(null);
          setF0ScoreResult(null);
          setFeedbackAssessment(null);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (route: AppRoute, toneId?: string) => {
    stopAnyVoiceAudio();
    setEncourageVoiceText(null);
    const queryParams = toneId ? { tone: toneId } : undefined;
    navigateTo(route, queryParams);
    setCurrentRoute(route);
    if (toneId) {
      const found = VIETNAMESE_TONES.find((t) => t.id === toneId);
      if (found) {
        setSelectedTone(found);
        setUserContour(null);
        setF0ScoreResult(null);
        setFeedbackAssessment(null);
        setMotivationMessage(MotivationEngine.getReadyMessage(found, streakInfo));
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // State 5 Popup chính của Immersive Redesign
  const [isAnalysisOpen, setIsAnalysisOpen] = useState<boolean>(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState<boolean>(false);
  const [isProgressOpen, setIsProgressOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // State các Modal phụ trợ hệ thống
  const [isModelUrlModalOpen, setIsModelUrlModalOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState<boolean>(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);

  // State quản lý mô hình Teachable Machine
  const [modelUrl, setModelUrl] = useState<string>(TEACHABLE_MACHINE_MODEL_URL);
  const [isModelReady, setIsModelReady] = useState<boolean>(false);
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);
  const [modelErrorMessage, setModelErrorMessage] = useState<string>('');

  // State chọn thanh và microphone (hỗ trợ đọc query param ?tone=)
  const [selectedTone, setSelectedTone] = useState<ToneItem>(() => {
    const toneParam = getQueryParam('tone');
    if (toneParam) {
      const found = VIETNAMESE_TONES.find((t) => t.id === toneParam.toLowerCase());
      if (found) return found;
    }
    return VIETNAMESE_TONES[4]; // Mặc định: mã (thanh ngã)
  });

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
  const [encourageVoiceText, setEncourageVoiceText] = useState<string | null>(null);

  // Tiến trình và lịch sử lưu trữ cục bộ (100% localStorage)
  const [historyAttempts, setHistoryAttempts] = useState<PracticeAttempt[]>([]);
  const [roadmapStats, setRoadmapStats] = useState<ToneRoadmapStat[]>([]);
  const [recent7Days, setRecent7Days] = useState<
    Array<{ dateStr: string; displayDate: string; attemptsCount: number; avgScore: number | null }>
  >([]);
  const [streakInfo, setStreakInfo] = useState<StreakInfo>({
    currentStreak: 0,
    isActiveToday: false,
    lastActiveDate: null,
    totalDaysActive: 0,
  });
  const [milestoneBadges, setMilestoneBadges] = useState<MilestoneBadge[]>([]);

  // Motivation Engine & Gamification States
  const [soundFxEnabled, setSoundFxEnabledState] = useState<boolean>(isSoundFxEnabled());
  const [motivationMessage, setMotivationMessage] = useState<MotivationMessage>(() =>
    MotivationEngine.getReadyMessage(VIETNAMESE_TONES[4], {
      currentStreak: 0,
      isActiveToday: false,
      lastActiveDate: null,
      totalDaysActive: 0,
    })
  );
  const [isConfettiActive, setIsConfettiActive] = useState<boolean>(false);

  const listeningTimerRef = useRef<number | null>(null);
  const speechDetectedRef = useRef<boolean>(false);
  const practiceIntroPlayedRef = useRef<boolean>(false);

  // Tự động phát âm thanh chào mừng "Bé Lạc đã sẵn sàng! Nhấn nút micro và đọc to từ" + từ mẫu khi tải trang luyện tập
  useEffect(() => {
    if (currentRoute === '/app') {
      if (!practiceIntroPlayedRef.current) {
        practiceIntroPlayedRef.current = true;
        const timer = window.setTimeout(() => {
          playPracticeWelcomeAudio(selectedTone.id);
        }, 350);
        return () => window.clearTimeout(timer);
      }
    } else {
      // Khi trở về trang chủ, reset cờ và dừng mọi âm thanh đang phát
      practiceIntroPlayedRef.current = false;
      stopAnyVoiceAudio();
    }
  }, [currentRoute, selectedTone.id]);

  // Tải dữ liệu lưu trữ từ localStorage
  const refreshStorageData = useCallback(() => {
    const attempts = ProgressStorage.getAllAttempts();
    const stats = ProgressStorage.getToneStats();
    const days = ProgressStorage.getRecent7DaysProgress();
    const streak = ProgressStorage.getStreakInfo();
    const badges = ProgressStorage.getMilestoneBadges();

    setHistoryAttempts(attempts);
    setRoadmapStats(stats);
    setRecent7Days(days);
    setStreakInfo(streak);
    setMilestoneBadges(badges);
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

  // Cập nhật thông điệp sẵn sàng khi streak hoặc selectedTone thay đổi (nếu chưa có lượt đọc gần đây)
  useEffect(() => {
    if (!feedbackAssessment) {
      setMotivationMessage(MotivationEngine.getReadyMessage(selectedTone, streakInfo));
    }
  }, [selectedTone, streakInfo, feedbackAssessment]);

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

  // 3. Kết thúc một đợt đọc và tổng hợp F0 + Điểm số + Phản hồi + Motivation Engine
  const finalizeRecognition = useCallback(async () => {
    await speechEngineInstance.stopListening();
    setIsListening(false);
    setAudioVolume(0);

    if (listeningTimerRef.current) {
      clearTimeout(listeningTimerRef.current);
      listeningTimerRef.current = null;
    }

    // A. Lấy buffer âm thanh thực tế của lượt đọc
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

    // B. Lấy kết quả AI từ Teachable Machine
    const stabilized = speechEngineInstance.getStabilizedResult();

    // C. MÔ HÌNH LAI: Kết hợp Teachable Machine + Bộ phân loại âm vị học F0
    const hybridRes = HybridToneEngine.evaluateHybrid(stabilized.averageScores, contour);

    setCurrentProbabilities(hybridRes.combinedScores);
    setTopToneName(hybridRes.topTone);
    setTopToneScore(hybridRes.topScore);

    // D. Lấy mẫu tham chiếu chuẩn thật
    const currentRef = ReferenceAudioService.getReferenceSample(selectedTone.id);
    setRefSample(currentRef);

    // E. Tính điểm tương đồng F0 (0–100)
    const f0ScoreRes = F0ScoringService.calculateF0Similarity(contour, currentRef);
    setF0ScoreResult(f0ScoreRes);

    // F. Phản hồi sư phạm chỉ rõ lỗi có thể cải thiện kết hợp giải thích mô hình lai
    const assessment = FeedbackAdvisor.generateAssessment({
      targetTone: selectedTone,
      predictedToneName: hybridRes.topTone,
      probabilities: hybridRes.combinedScores,
      userContour: contour,
      refSample: currentRef,
      f0ScoreResult: f0ScoreRes,
      hybridExplanation: hybridRes.explanation,
      agreementStatus: hybridRes.agreementStatus,
    });
    setFeedbackAssessment(assessment);

    // G. Lưu lượt luyện vào localStorage
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const isMatch =
      hybridRes.topTone?.trim().toLowerCase() === selectedTone.name.trim().toLowerCase();

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
      predictedToneName: hybridRes.topTone,
      confidence: hybridRes.topScore,
      top2Margin: assessment.top2Margin,
      isAiConfident: hybridRes.isAiConfident,
      isMatch,
      hasReliableF0: contour.isReliable,
      f0Score: f0ScoreRes.score,
      meanPitchHz: contour.meanPitchHz || undefined,
      audioQuality,
      adviceSummary: assessment.headline,
      engineMode: 'hybrid',
      hybridAgreement: hybridRes.agreementStatus,
    };

    ProgressStorage.saveAttempt(attempt);

    // H. Motivation Engine: Đánh giá và chọn thông điệp động viên
    const allUpdatedAttempts = ProgressStorage.getAllAttempts();
    const updatedStreak = ProgressStorage.getStreakInfo();
    const motMessage = MotivationEngine.evaluateAttempt(attempt, allUpdatedAttempts, updatedStreak);
    setMotivationMessage(motMessage);

    // Kích hoạt hiệu ứng ăn mừng hoặc giọng động viên của Bé Lạc
    if (isMatch) {
      setEncourageVoiceText(null);
      if (motMessage.celebrate) {
        setIsConfettiActive(true);
        if (motMessage.state === 'ten_attempts' || motMessage.state === 'three_day_streak') {
          playCelebrationChime('milestone');
        } else {
          playCelebrationChime('success');
        }
      } else {
        playCelebrationChime('success');
      }
    } else {
      // Người dùng chưa nói đúng (isMatch = false)
      // Phát âm thanh khích lệ nhẹ nhàng và ngẫu nhiên 1 trong 3 file audio hướng dẫn của Bé Lạc
      playCelebrationChime('encourage');
      window.setTimeout(() => {
        const chosenIdx = playRandomEncourageAudio();
        if (chosenIdx > 0 && chosenIdx <= ENCOURAGE_VOICE_MESSAGES.length) {
          setEncourageVoiceText(ENCOURAGE_VOICE_MESSAGES[chosenIdx - 1]);
        }
      }, 350);
    }

    refreshStorageData();
  }, [selectedTone, refreshStorageData]);

  // 4. Bắt đầu lắng nghe
  const handleStartListening = async () => {
    stopAnyVoiceAudio();
    setEncourageVoiceText(null);
    setPermissionError(null);
    setUserContour(null);
    setF0ScoreResult(null);
    setFeedbackAssessment(null);
    setTopToneName(null);
    setTopToneScore(0);
    setIsConfettiActive(false);
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
    stopAnyVoiceAudio();
    setEncourageVoiceText(null);
    const currentIndex = VIETNAMESE_TONES.findIndex((t) => t.id === selectedTone.id);
    const nextIndex = (currentIndex + 1) % VIETNAMESE_TONES.length;
    const nextTone = VIETNAMESE_TONES[nextIndex];
    setSelectedTone(nextTone);
    setUserContour(null);
    setF0ScoreResult(null);
    setFeedbackAssessment(null);
    setMotivationMessage(MotivationEngine.getReadyMessage(nextTone, streakInfo));
  };

  const handleSelectToneById = (toneId: ToneId) => {
    if (isListening) return;
    stopAnyVoiceAudio();
    setEncourageVoiceText(null);
    const tone = VIETNAMESE_TONES.find((t) => t.id === toneId);
    if (tone) {
      setSelectedTone(tone);
      setUserContour(null);
      setF0ScoreResult(null);
      setFeedbackAssessment(null);
      setMotivationMessage(MotivationEngine.getReadyMessage(tone, streakInfo));
    }
  };

  const handleClearHistory = () => {
    ProgressStorage.clearHistory();
    refreshStorageData();
    setMotivationMessage(
      MotivationEngine.getReadyMessage(selectedTone, {
        currentStreak: 0,
        isActiveToday: false,
        lastActiveDate: null,
        totalDaysActive: 0,
      })
    );
  };

  const handleToggleSoundFx = () => {
    const next = !soundFxEnabled;
    setSoundFxEnabled(next);
    setSoundFxEnabledState(next);
  };

  const nextRecommendation = ProgressStorage.getNextRecommendedTone();
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayAttemptsCount = historyAttempts.filter((a) => a.dateStr === todayDateStr).length;

  return (
    <>
      {currentRoute === '/' ? (
        <VietToneHomeEmbedded
          onOpenLearning={(toneId) => handleNavigate('/app', toneId)}
          onOpenArchitecture={() => setIsArchitectureOpen(true)}
        />
      ) : (
        <div className="min-h-screen bg-[url('/assets/practice-bg.jpg')] bg-cover bg-center bg-no-repeat bg-fixed relative flex flex-col font-['Be_Vietnam_Pro',sans-serif] text-white selection:bg-red-500 selection:text-white">
          {/* Lớp phủ gradient nhẹ giúp tăng chiều sâu và độ tương phản */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/60 pointer-events-none -z-0" />

          {/* Hiệu ứng pháo hoa hoa giấy ăn mừng nhẹ nhàng */}
          <ConfettiEffect
            active={isConfettiActive}
            onComplete={() => setIsConfettiActive(false)}
          />

          {/* 1. Header Tối Giản */}
          <MinimalHeader
            onGoHome={() => handleNavigate('/')}
            onOpenAnalysis={() => setIsAnalysisOpen(true)}
            onOpenRoadmap={() => setIsRoadmapOpen(true)}
            onOpenProgress={() => setIsProgressOpen(true)}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenArchitecture={() => setIsArchitectureOpen(true)}
            streakInfo={streakInfo}
            soundFxEnabled={soundFxEnabled}
            onToggleSoundFx={handleToggleSoundFx}
            isModelReady={isModelReady}
            isFallback={isFallbackMode}
            hasRecentAttempt={Boolean(feedbackAssessment)}
          />

          {/* 2. Main Immersive Learning Content (Không cuộn dài, Bé Lạc trung tâm) */}
          <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-6 py-3 sm:py-5 flex flex-col justify-between items-center gap-3">
            {/* A. Bé Lạc trung tâm & Thanh mục tiêu */}
            <BeLacHeroCenter
              selectedTone={selectedTone}
              isListening={isListening}
              audioVolume={audioVolume}
              assessment={feedbackAssessment}
            />

            {/* B. Khung hội thoại Bé Lạc (Microphone & KẾT QUẢ AI TRỰC TIẾP) */}
            <BeLacDialogueBox
              selectedTone={selectedTone}
              isListening={isListening}
              audioVolume={audioVolume}
              permissionError={permissionError}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              onRetryPermission={handleStartListening}
              assessment={feedbackAssessment}
              userContour={userContour}
              f0ScoreResult={f0ScoreResult}
              onOpenAnalysis={() => setIsAnalysisOpen(true)}
              encourageVoiceText={encourageVoiceText}
            />

            {/* C. Sáu thẻ thanh điệu dưới cùng (ma, má, mà, mả, mã, mạ) */}
            <SixToneCardsBottom
              selectedTone={selectedTone}
              onSelectTone={(tone) => {
                if (isListening) return;
                stopAnyVoiceAudio();
                setEncourageVoiceText(null);
                setSelectedTone(tone);
                setUserContour(null);
                setF0ScoreResult(null);
                setFeedbackAssessment(null);
                setMotivationMessage(MotivationEngine.getReadyMessage(tone, streakInfo));
              }}
              disabled={isListening}
            />

            {/* Fallback Mode Note nếu URL mô hình lỗi mạng */}
            {isFallbackMode && (
              <div className="w-full p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[11px] flex items-center gap-2 shadow-xs backdrop-blur-md">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  Chế độ mô phỏng F0 thời gian thực đang chạy trực tiếp trên trình duyệt.
                </span>
              </div>
            )}

            {/* Footer Quyền riêng tư */}
            <div className="w-full pt-1 pb-1 flex items-center justify-center gap-1.5 text-center text-[10px] sm:text-xs text-white/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                Âm thanh được phân tích trực tiếp trên thiết bị của bạn, tuyệt đối bảo mật.
              </span>
            </div>
          </main>
        </div>
      )}

      {/* ================= 5 POPUP / MODAL CHUYÊN BIỆT ================= */}

      {/* POPUP 1 – Phân tích AI & Đường nét F0 */}
      <AnalysisModal
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        selectedTone={selectedTone}
        currentProbabilities={currentProbabilities}
        topToneName={topToneName}
        topToneScore={topToneScore}
        userContour={userContour}
        refSample={refSample}
        f0ScoreResult={f0ScoreResult}
        feedbackAssessment={feedbackAssessment}
        isListening={isListening}
        onRetry={handleStartListening}
        onNextTone={handleNextTone}
        onOpenTeacherModal={() => setIsTeacherModalOpen(true)}
      />

      {/* POPUP 2 – Lộ trình học tập */}
      <RoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
        stats={roadmapStats}
        nextRecommended={nextRecommendation}
        streakInfo={streakInfo}
        onSelectToneId={handleSelectToneById}
      />

      {/* POPUP 3 – Tiến bộ của tôi & Lịch sử */}
      <ProgressModal
        isOpen={isProgressOpen}
        onClose={() => setIsProgressOpen(false)}
        attempts={historyAttempts}
        stats={roadmapStats}
        recent7Days={recent7Days}
        streakInfo={streakInfo}
        badges={milestoneBadges}
        onClearHistory={handleClearHistory}
        onSelectAttemptTone={handleSelectToneById}
      />

      {/* POPUP 4 – Thành tích & Streak */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        streakInfo={streakInfo}
        badges={milestoneBadges}
        todayAttemptsCount={todayAttemptsCount}
      />

      {/* POPUP 5 – Cài đặt hệ thống */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundFxEnabled={soundFxEnabled}
        onToggleSoundFx={handleToggleSoundFx}
        onOpenTeacherModal={() => setIsTeacherModalOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenModelSettings={() => setIsModelUrlModalOpen(true)}
        onClearHistory={handleClearHistory}
        isModelReady={isModelReady}
        isFallback={isFallbackMode}
        modelUrl={modelUrl}
      />

      {/* Modal Đổi URL Teachable Machine */}
      <ModelSettingsModal
        isOpen={isModelUrlModalOpen}
        onClose={() => setIsModelUrlModalOpen(false)}
        currentModelUrl={modelUrl}
        onSaveModelUrl={async (newUrl) => {
          setModelUrl(newUrl);
          await initModel(newUrl);
          setIsModelUrlModalOpen(false);
        }}
        isFallback={isFallbackMode}
        modelError={modelErrorMessage}
        onOpenTeacherModal={() => setIsTeacherModalOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
      />

      {/* Modal Hướng dẫn 6 thanh điệu */}
      <PitchGuideInfo
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Modal Quản lý Mẫu chuẩn Giáo viên */}
      <TeacherReferenceModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onSamplesUpdated={() => {
          updateCurrentRefSample(selectedTone.id);
          refreshStorageData();
        }}
      />

      {/* Modal Sơ đồ Kiến trúc & Luồng xử lý */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </>
  );
}
