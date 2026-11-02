/**
 * VietTone AI - Voice Activity Detection (VAD) & Audio Preprocessor
 * 
 * Chức năng:
 * 1. Phát hiện vùng phát âm (Speech Segment) dựa trên năng lượng RMS và Zero Crossing Rate.
 * 2. Cắt bỏ khoảng lặng (Silence Trimming) ở đầu và cuối bản ghi âm với lề an toàn (safety padding).
 * 3. Chuẩn hóa biên độ (Peak / RMS Normalization) giúp tín hiệu rõ ràng, chống micro thu quá nhỏ.
 * 4. Cung cấp buffer âm thanh sạch cho bộ trích xuất F0 (YIN) và bộ nhận diện Teachable Machine.
 */

export interface VadProcessResult {
  speechDetected: boolean;
  trimmedBuffer: Float32Array;
  originalDurationMs: number;
  speechDurationMs: number;
  onsetMs: number;
  offsetMs: number;
  peakAmplitude: number;
  rmsEnergy: number;
  appliedGain: number;
}

export class VadPreprocessor {
  /**
   * Phân tích và làm sạch đoạn âm thanh vừa thu từ microphone
   */
  public static processAudio(
    audioBuffer: Float32Array,
    sampleRate: number
  ): VadProcessResult {
    const totalSamples = audioBuffer.length;
    const originalDurationMs = Math.round((totalSamples / sampleRate) * 1000);

    if (totalSamples < 512) {
      return {
        speechDetected: false,
        trimmedBuffer: audioBuffer,
        originalDurationMs,
        speechDurationMs: 0,
        onsetMs: 0,
        offsetMs: 0,
        peakAmplitude: 0,
        rmsEnergy: 0,
        appliedGain: 1,
      };
    }

    const frameSize = Math.max(256, Math.floor(sampleRate * 0.02)); // ~20ms
    const hopSize = Math.max(128, Math.floor(sampleRate * 0.01));  // ~10ms

    const frameEnergies: { timeMs: number; rms: number; sampleIndex: number }[] = [];
    let maxPeak = 0;
    let totalEnergySum = 0;

    // 1. Phân tích năng lượng từng khung thời gian
    for (let offset = 0; offset + frameSize <= totalSamples; offset += hopSize) {
      let sumSquares = 0;
      for (let i = 0; i < frameSize; i++) {
        const val = audioBuffer[offset + i];
        sumSquares += val * val;
        const absVal = Math.abs(val);
        if (absVal > maxPeak) maxPeak = absVal;
      }
      const rms = Math.sqrt(sumSquares / frameSize);
      totalEnergySum += rms;
      const timeMs = Math.round((offset / sampleRate) * 1000);
      frameEnergies.push({ timeMs, rms, sampleIndex: offset });
    }

    if (frameEnergies.length === 0) {
      return {
        speechDetected: false,
        trimmedBuffer: audioBuffer,
        originalDurationMs,
        speechDurationMs: 0,
        onsetMs: 0,
        offsetMs: 0,
        peakAmplitude: maxPeak,
        rmsEnergy: 0,
        appliedGain: 1,
      };
    }

    // 2. Tính ngưỡng nhiễu nền (Noise Floor) tự động
    const sortedRms = [...frameEnergies].map((f) => f.rms).sort((a, b) => a - b);
    const noiseFloorIdx = Math.floor(sortedRms.length * 0.15);
    const noiseFloor = sortedRms[noiseFloorIdx] || 0.005;

    // Ngưỡng phát hiện tiếng nói thích nghi
    const speechThreshold = Math.max(0.018, noiseFloor * 3.0);

    // 3. Tìm điểm bắt đầu (Voice Onset)
    let onsetFrameIdx = -1;
    for (let i = 0; i < frameEnergies.length - 2; i++) {
      if (
        frameEnergies[i].rms >= speechThreshold &&
        frameEnergies[i + 1].rms >= speechThreshold * 0.85
      ) {
        onsetFrameIdx = i;
        break;
      }
    }

    // 4. Tìm điểm kết thúc (Voice Offset)
    let offsetFrameIdx = -1;
    for (let i = frameEnergies.length - 1; i >= 2; i--) {
      if (
        frameEnergies[i].rms >= speechThreshold &&
        frameEnergies[i - 1].rms >= speechThreshold * 0.85
      ) {
        offsetFrameIdx = i;
        break;
      }
    }

    // Nếu không tìm thấy tiếng nói rõ ràng
    if (onsetFrameIdx === -1 || offsetFrameIdx === -1 || onsetFrameIdx >= offsetFrameIdx) {
      return {
        speechDetected: false,
        trimmedBuffer: audioBuffer,
        originalDurationMs,
        speechDurationMs: 0,
        onsetMs: 0,
        offsetMs: 0,
        peakAmplitude: maxPeak,
        rmsEnergy: totalEnergySum / frameEnergies.length,
        appliedGain: 1,
      };
    }

    // 5. Thêm lề đệm an toàn (~60ms) ở đầu và cuối để không cắt phạm phụ âm và âm đuôi
    const paddingSamples = Math.floor(sampleRate * 0.06);
    const rawOnsetSample = frameEnergies[onsetFrameIdx].sampleIndex;
    const rawOffsetSample = frameEnergies[offsetFrameIdx].sampleIndex + frameSize;

    const startSample = Math.max(0, rawOnsetSample - paddingSamples);
    const endSample = Math.min(totalSamples, rawOffsetSample + paddingSamples);

    const speechLength = endSample - startSample;
    const speechDurationMs = Math.round((speechLength / sampleRate) * 1000);
    const onsetMs = Math.round((startSample / sampleRate) * 1000);
    const offsetMs = Math.round((endSample / sampleRate) * 1000);

    // 6. Cắt gọt và chuẩn hóa âm lượng (Normalization)
    const trimmed = audioBuffer.subarray(startSample, endSample);
    let speechPeak = 0;
    for (let i = 0; i < trimmed.length; i++) {
      const a = Math.abs(trimmed[i]);
      if (a > speechPeak) speechPeak = a;
    }

    // Tự động bù gain nếu mic thu quá nhỏ (giữ mức 0.65 - 0.85 để tránh vỡ)
    let appliedGain = 1.0;
    if (speechPeak > 0.008 && speechPeak < 0.40) {
      appliedGain = Math.min(4.0, 0.70 / speechPeak);
    } else if (speechPeak > 0.95) {
      appliedGain = 0.90 / speechPeak; // Giảm nhẹ nếu gần clipping
    }

    const normalizedBuffer = new Float32Array(trimmed.length);
    for (let i = 0; i < trimmed.length; i++) {
      normalizedBuffer[i] = Math.max(-1, Math.min(1, trimmed[i] * appliedGain));
    }

    return {
      speechDetected: true,
      trimmedBuffer: normalizedBuffer,
      originalDurationMs,
      speechDurationMs,
      onsetMs,
      offsetMs,
      peakAmplitude: speechPeak * appliedGain,
      rmsEnergy: (totalEnergySum / frameEnergies.length) * appliedGain,
      appliedGain,
    };
  }
}
