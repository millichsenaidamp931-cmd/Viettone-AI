/**
 * VietTone AI - Speech Commands & Teachable Machine Audio Engine
 * Xử lý mô hình Teachable Machine qua thư viện @tensorflow-models/speech-commands
 * và hỗ trợ bộ phân tích âm vực thời gian thực trên trình duyệt.
 */

import '@tensorflow/tfjs';
import * as speechCommands from '@tensorflow-models/speech-commands';
import { PRED_CONFIG, TONE_CLASSES } from '../config';

/**
 * Ánh xạ nhãn trả về từ Teachable Machine sang 7 class chuẩn tiếng Việt
 * Hỗ trợ cả 2 bộ nhãn phổ biến trong Teachable Machine:
 * 1) 'ma', 'má', 'mà', 'mả', 'mã', 'mạ', 'Background Noise' (như model URL cDF6WszFL)
 * 2) 'Thanh ngang', 'Thanh sắc', 'Thanh huyền', 'Thanh hỏi', 'Thanh ngã', 'Thanh nặng', 'Background Noise'
 */
export function mapModelLabelToTone(label: string): string {
  const norm = label.trim().toLowerCase();

  if (
    norm.includes('noise') ||
    norm.includes('background') ||
    norm === '_background_noise_'
  ) {
    return 'Background Noise';
  }

  if (
    norm === 'ma' ||
    norm === 'thanh ngang' ||
    norm.includes('ngang') ||
    norm === 'khong dau' ||
    norm === 'không dấu'
  ) {
    return 'Thanh ngang';
  }

  if (
    norm === 'má' ||
    norm === 'thanh sắc' ||
    norm === 'thanh sac' ||
    norm.includes('sắc') ||
    norm.includes('sac')
  ) {
    return 'Thanh sắc';
  }

  if (
    norm === 'mà' ||
    norm === 'thanh huyền' ||
    norm === 'thanh huyen' ||
    norm.includes('huyền') ||
    norm.includes('huyen')
  ) {
    return 'Thanh huyền';
  }

  if (
    norm === 'mả' ||
    norm === 'thanh hỏi' ||
    norm === 'thanh hoi' ||
    norm.includes('hỏi') ||
    norm.includes('hoi')
  ) {
    return 'Thanh hỏi';
  }

  if (
    norm === 'mã' ||
    norm === 'thanh ngã' ||
    norm === 'thanh nga' ||
    norm.includes('ngã') ||
    norm.includes('nga')
  ) {
    return 'Thanh ngã';
  }

  if (
    norm === 'mạ' ||
    norm === 'thanh nặng' ||
    norm === 'thanh nang' ||
    norm.includes('nặng') ||
    norm.includes('nang')
  ) {
    return 'Thanh nặng';
  }

  return label;
}

export type RecognizerStatus =
  | 'unloaded'
  | 'loading'
  | 'ready'
  | 'listening'
  | 'error'
  | 'permission_denied'
  | 'fallback_active';

export interface RecognitionCallbackPayload {
  rawScores: Record<string, number>;
  normalizedToneScores: Record<string, number>;
  topTone: string | null;
  topToneScore: number;
  isBackgroundNoise: boolean;
  audioVolume: number;
}

export class VietToneSpeechEngine {
  private recognizer: speechCommands.SpeechCommandRecognizer | null = null;
  private isListeningState: boolean = false;
  private currentModelUrl: string = '';
  private labels: string[] = [];
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private fallbackInterval: number | null = null;
  private isFallbackMode: boolean = false;

  // Lịch sử điểm số để ổn định dự đoán qua cửa sổ ~1 giây
  private predictionBuffer: {
    timestamp: number;
    scores: Record<string, number>;
    isNoise: boolean;
  }[] = [];

  constructor() {}

  public getLabels(): string[] {
    if (this.labels.length > 0) return this.labels;
    return [...TONE_CLASSES];
  }

  public getIsListening(): boolean {
    return this.isListeningState;
  }

  public getIsFallbackMode(): boolean {
    return this.isFallbackMode;
  }

  /**
   * Tải mô hình Teachable Machine từ URL
   */
  public async loadModel(modelUrl: string): Promise<{ success: boolean; isFallback: boolean; error?: string }> {
    this.currentModelUrl = modelUrl.trim();
    if (!this.currentModelUrl.endsWith('/')) {
      this.currentModelUrl += '/';
    }

    const checkpointURL = this.currentModelUrl + 'model.json';
    const metadataURL = this.currentModelUrl + 'metadata.json';

    try {
      // Dừng recognizer cũ nếu có
      await this.stopListening();
      this.recognizer = null;

      console.log('[VietTone AI] Đang nạp mô hình Teachable Machine từ URL:', this.currentModelUrl);

      // Kiểm tra và lấy metadata.json bằng GET để xác nhận kết nối và CORS
      const testFetch = await fetch(metadataURL);
      if (!testFetch.ok) {
        throw new Error(`Không thể tải metadata.json (Mã lỗi HTTP ${testFetch.status})`);
      }
      const metadata = await testFetch.json();
      console.log('[VietTone AI] Đã tải metadata.json:', metadata);

      this.recognizer = speechCommands.create(
        'BROWSER_FFT',
        undefined,
        checkpointURL,
        metadataURL
      );

      await this.recognizer.ensureModelLoaded();
      this.labels = this.recognizer.wordLabels();
      console.log('[VietTone AI] Đã tải hoàn tất mô hình Teachable Machine! Word labels:', this.labels);
      this.isFallbackMode = false;

      return { success: true, isFallback: false };
    } catch (err: unknown) {
      console.warn('[VietTone AI] Lỗi khi tải mô hình Teachable Machine:', err);
      // Khi URL chưa hợp lệ, chuyển sang chế độ phân tích âm thanh trực tiếp (fallback)
      this.isFallbackMode = true;
      this.labels = [...TONE_CLASSES];
      const errorMessage = err instanceof Error ? err.message : 'Không thể kết nối đến URL mô hình Teachable Machine';
      return {
        success: true,
        isFallback: true,
        error: errorMessage,
      };
    }
  }

  /**
   * Bắt đầu lắng nghe microphone và suy luận âm thanh
   */
  public async startListening(
    onFrameUpdate: (payload: RecognitionCallbackPayload) => void,
    onError: (errorType: 'permission_denied' | 'engine_error', message: string) => void
  ): Promise<boolean> {
    if (this.isListeningState) {
      return true;
    }

    this.predictionBuffer = [];

    // Kiểm tra và xin quyền microphone
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });
    } catch (permErr: unknown) {
      console.error('Không có quyền truy cập microphone:', permErr);
      onError('permission_denied', 'Bạn đã từ chối hoặc trình duyệt chặn quyền truy cập Microphone.');
      return false;
    }

    // Thiết lập Web Audio Analyser để đo volume và phân tích năng lượng âm thanh
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024;
      source.connect(this.analyser);
    } catch (audioCtxErr) {
      console.warn('Không thể khởi tạo Web Audio Analyser:', audioCtxErr);
    }

    this.isListeningState = true;

    // Trường hợp 1: Có mô hình Teachable Machine thực tế
    if (this.recognizer && !this.isFallbackMode) {
      try {
        await this.recognizer.listen(
          async (result) => {
            if (!this.isListeningState) return;

            const scores = result.scores as Float32Array | number[];
            const rawScores: Record<string, number> = {};
            const labels = this.recognizer?.wordLabels() || this.labels;

            for (let i = 0; i < labels.length; i++) {
              rawScores[labels[i]] = scores[i] !== undefined ? scores[i] : 0;
            }

            const volume = this.getAudioVolume();
            this.processPredictionFrame(rawScores, volume, onFrameUpdate);
          },
          {
            includeSpectrogram: false,
            probabilityThreshold: 0.1,
            invokeCallbackOnNoiseAndUnknown: true,
            overlapFactor: 0.5,
          }
        );
        return true;
      } catch (listenErr: unknown) {
        console.warn('Lỗi khi kích hoạt recognizer.listen, chuyển sang chế độ phân tích âm vực:', listenErr);
        this.isFallbackMode = true;
      }
    }

    // Trường hợp 2: Chế độ phân tích âm vực cao độ trực tiếp (khi chưa có URL Teachable Machine hoàn chỉnh)
    this.startFallbackAnalysis(onFrameUpdate);
    return true;
  }

  /**
   * Tính toán âm lượng hiện tại từ AnalyserNode
   */
  private getAudioVolume(): number {
    if (!this.analyser) return 0;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);

    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / bufferLength);
    return Math.min(1, rms * 4); // Khuếch đại nhẹ để thể hiện độ nhạy
  }

  /**
   * Phân tích cao độ F0 (Fundamental Frequency) bằng giải thuật Autocorrelation
   */
  private detectPitch(analyser: AnalyserNode, sampleRate: number): { pitch: number; clarity: number } {
    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    // Tính năng lượng RMS
    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) {
      sumSquares += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sumSquares / buffer.length);
    if (rms < 0.015) {
      return { pitch: -1, clarity: 0 };
    }

    // Autocorrelation
    const maxShift = Math.floor(sampleRate / 80); // Min pitch 80Hz (giọng nam trầm)
    const minShift = Math.floor(sampleRate / 600); // Max pitch 600Hz (giọng nữ/trẻ em cao)
    let bestCorrelation = 0;
    let bestShift = -1;

    for (let shift = minShift; shift <= maxShift; shift++) {
      let correlation = 0;
      for (let i = 0; i < buffer.length - shift; i++) {
        correlation += buffer[i] * buffer[i + shift];
      }
      correlation = correlation / (buffer.length - shift);

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestShift = shift;
      }
    }

    const clarity = bestCorrelation / (sumSquares / buffer.length);
    if (bestShift > 0 && clarity > 0.4) {
      const pitch = sampleRate / bestShift;
      return { pitch, clarity };
    }

    return { pitch: -1, clarity: 0 };
  }

  /**
   * Xử lý một khung dự đoán âm thanh và chuẩn hoá xác suất của 6 thanh điệu
   */
  private processPredictionFrame(
    rawScores: Record<string, number>,
    volume: number,
    onFrameUpdate: (payload: RecognitionCallbackPayload) => void
  ) {
    // 1. Ánh xạ mọi nhãn (dù là 'ma', 'má' hay 'Thanh ngang', 'Thanh sắc') về 7 class chuẩn
    const mappedScores: Record<string, number> = {
      'Background Noise': 0,
      'Thanh ngang': 0,
      'Thanh sắc': 0,
      'Thanh huyền': 0,
      'Thanh hỏi': 0,
      'Thanh ngã': 0,
      'Thanh nặng': 0,
    };

    for (const [rawLabel, score] of Object.entries(rawScores)) {
      const standardName = mapModelLabelToTone(rawLabel);
      if (standardName in mappedScores) {
        mappedScores[standardName] = Math.max(mappedScores[standardName], score);
      } else {
        mappedScores[standardName] = score;
      }
    }

    const bgNoiseScore = mappedScores['Background Noise'] ?? 0;
    const isBackgroundNoise = bgNoiseScore > 0.70 && volume < PRED_CONFIG.AUDIO_VOLUME_THRESHOLD;

    // Lọc ra 6 thanh điệu (loại bỏ Background Noise)
    const toneKeys = [
      'Thanh ngang',
      'Thanh sắc',
      'Thanh huyền',
      'Thanh hỏi',
      'Thanh ngã',
      'Thanh nặng',
    ];

    let totalToneScore = 0;
    const toneScoresMap: Record<string, number> = {};

    for (const key of toneKeys) {
      const score = Math.max(0.0001, mappedScores[key] ?? 0);
      toneScoresMap[key] = score;
      totalToneScore += score;
    }

    // Chuẩn hoá tỉ lệ phần trăm của 6 thanh về tổng 1 (100%)
    const normalizedScores: Record<string, number> = {};
    let topTone: string | null = null;
    let topToneScore = 0;

    for (const key of toneKeys) {
      const normalized = totalToneScore > 0 ? toneScoresMap[key] / totalToneScore : 0.166;
      normalizedScores[key] = normalized;

      if (normalized > topToneScore) {
        topToneScore = normalized;
        topTone = key;
      }
    }

    // Lưu vào buffer trượt để làm mượt dự đoán
    const now = Date.now();
    this.predictionBuffer.push({
      timestamp: now,
      scores: normalizedScores,
      isNoise: isBackgroundNoise,
    });

    // Chỉ giữ các mẫu trong khoảng PRED_CONFIG.BUFFER_TIME_MS (~1.1 giây)
    this.predictionBuffer = this.predictionBuffer.filter(
      (item) => now - item.timestamp <= PRED_CONFIG.BUFFER_TIME_MS
    );

    onFrameUpdate({
      rawScores: mappedScores,
      normalizedToneScores: normalizedScores,
      topTone: isBackgroundNoise ? null : topTone,
      topToneScore,
      isBackgroundNoise,
      audioVolume: volume,
    });
  }

  /**
   * Chế độ phân tích âm vực thời gian thực (Realtime Pitch & Contour Engine)
   * Sử dụng khi Teachable Machine URL chưa được nạp hoặc đang trong quá trình huấn luyện
   */
  private startFallbackAnalysis(
    onFrameUpdate: (payload: RecognitionCallbackPayload) => void
  ) {
    const pitchHistory: number[] = [];
    const sampleRate = this.audioContext?.sampleRate || 44100;

    this.fallbackInterval = window.setInterval(() => {
      if (!this.isListeningState || !this.analyser) return;

      const volume = this.getAudioVolume();
      const { pitch, clarity } = this.detectPitch(this.analyser, sampleRate);

      if (pitch > 80 && pitch < 600 && clarity > 0.4 && volume > 0.03) {
        pitchHistory.push(pitch);
        if (pitchHistory.length > 15) pitchHistory.shift();
      }

      // Xây dựng xác suất dựa trên đặc trưng cao độ đường cong tiếng Việt
      const scores: Record<string, number> = {
        'Background Noise': volume < 0.03 ? 0.95 : 0.05,
        'Thanh ngang': 0.1,
        'Thanh sắc': 0.1,
        'Thanh huyền': 0.1,
        'Thanh hỏi': 0.1,
        'Thanh ngã': 0.1,
        'Thanh nặng': 0.1,
      };

      if (pitchHistory.length >= 4 && volume >= 0.03) {
        const startPitch = pitchHistory.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const endPitch = pitchHistory.slice(-3).reduce((a, b) => a + b, 0) / 3;
        const minPitch = Math.min(...pitchHistory);
        const maxPitch = Math.max(...pitchHistory);
        const pitchDelta = endPitch - startPitch;
        const pitchRange = maxPitch - minPitch;

        if (pitchDelta > 28) {
          // Đi lên rõ -> Thanh sắc hoặc Thanh ngã
          if (pitchRange > 65) {
            scores['Thanh ngã'] = 0.65;
            scores['Thanh sắc'] = 0.25;
          } else {
            scores['Thanh sắc'] = 0.72;
            scores['Thanh ngã'] = 0.18;
          }
        } else if (pitchDelta < -25) {
          // Đi xuống -> Thanh huyền hoặc Thanh nặng
          if (pitchHistory.length <= 6 || volume < 0.08) {
            scores['Thanh nặng'] = 0.75;
            scores['Thanh huyền'] = 0.18;
          } else {
            scores['Thanh huyền'] = 0.70;
            scores['Thanh nặng'] = 0.20;
          }
        } else if (minPitch < startPitch - 15 && endPitch > minPitch + 10) {
          // Đi xuống rồi ngoắc lên -> Thanh hỏi
          scores['Thanh hỏi'] = 0.78;
          scores['Thanh huyền'] = 0.12;
        } else {
          // Bằng phẳng, ít biến thiên -> Thanh ngang
          scores['Thanh ngang'] = 0.78;
          scores['Thanh huyền'] = 0.12;
        }
      }

      this.processPredictionFrame(scores, volume, onFrameUpdate);
    }, 180);
  }

  /**
   * Tính toán kết quả ổn định từ bộ đệm dự đoán (~1 giây)
   * Sử dụng trung bình xác suất và majority voting
   */
  public getStabilizedResult(): {
    isStable: boolean;
    winnerTone: string | null;
    confidence: number;
    averageScores: Record<string, number>;
    reason?: string;
  } {
    const validFrames = this.predictionBuffer.filter(
      (item) => !item.isNoise
    );

    const toneKeys = [
      'Thanh ngang',
      'Thanh sắc',
      'Thanh huyền',
      'Thanh hỏi',
      'Thanh ngã',
      'Thanh nặng',
    ];

    const averageScores: Record<string, number> = {};
    for (const key of toneKeys) averageScores[key] = 0;

    if (validFrames.length < PRED_CONFIG.MIN_PREDICTIONS_COUNT) {
      return {
        isStable: false,
        winnerTone: null,
        confidence: 0,
        averageScores,
        reason: 'Chưa thu đủ mẫu âm thanh (cần tối thiểu 3 cửa sổ âm thanh liên tiếp).',
      };
    }

    // 1. Tính trung bình xác suất của từng thanh
    for (const frame of validFrames) {
      for (const key of toneKeys) {
        averageScores[key] += frame.scores[key] || 0;
      }
    }

    for (const key of toneKeys) {
      averageScores[key] /= validFrames.length;
    }

    // 2. Tìm thanh có xác suất trung bình cao nhất
    let winnerTone: string | null = null;
    let maxAvgScore = 0;

    for (const key of toneKeys) {
      if (averageScores[key] > maxAvgScore) {
        maxAvgScore = averageScores[key];
        winnerTone = key;
      }
    }

    // 3. Majority Voting: Đếm số lượng frame mà winner đứng đầu
    let winnerFrameCount = 0;
    for (const frame of validFrames) {
      let topInFrame = '';
      let topScoreInFrame = 0;
      for (const key of toneKeys) {
        if ((frame.scores[key] || 0) > topScoreInFrame) {
          topScoreInFrame = frame.scores[key] || 0;
          topInFrame = key;
        }
      }
      if (topInFrame === winnerTone) {
        winnerFrameCount++;
      }
    }

    const majorityRatio = winnerFrameCount / validFrames.length;
    const isConfident = maxAvgScore >= PRED_CONFIG.MIN_CONFIDENCE_THRESHOLD;
    const isStable = isConfident && majorityRatio >= 0.55;

    return {
      isStable,
      winnerTone,
      confidence: maxAvgScore,
      averageScores,
      reason: !isConfident
        ? 'Độ tự tin chưa đủ cao'
        : !isStable
        ? 'Dự đoán chưa ổn định qua các cửa sổ âm'
        : undefined,
    };
  }

  /**
   * Dừng lắng nghe microphone và giải phóng tài nguyên
   */
  public async stopListening(): Promise<void> {
    this.isListeningState = false;

    if (this.fallbackInterval !== null) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }

    if (this.recognizer && this.recognizer.isListening()) {
      try {
        await this.recognizer.stopListening();
      } catch (stopErr) {
        console.warn('Lỗi khi gọi recognizer.stopListening:', stopErr);
      }
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        await this.audioContext.close();
      } catch (closeErr) {
        console.warn('Lỗi khi đóng AudioContext:', closeErr);
      }
      this.audioContext = null;
    }

    this.analyser = null;
  }

  /**
   * Huỷ hoàn toàn engine
   */
  public async destroy(): Promise<void> {
    await this.stopListening();
    this.recognizer = null;
    this.predictionBuffer = [];
  }
}

// Singleton instance dùng chung trong ứng dụng để tránh tạo nhiều recognizer
export const speechEngineInstance = new VietToneSpeechEngine();
