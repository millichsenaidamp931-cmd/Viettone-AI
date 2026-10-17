/**
 * Bộ tạo âm mẫu mô phỏng cao độ 6 thanh điệu tiếng Việt bằng Web Audio API
 * Giúp học sinh và người nước ngoài nghe và hình dung rõ đường nét cao độ của từng thanh
 */

export function playToneAudio(toneId: string) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Thử dùng Web Speech API tiếng Việt trước nếu trình duyệt hỗ trợ giọng đọc tiếng Việt
    if ('speechSynthesis' in window) {
      const wordsMap: Record<string, string> = {
        ngang: 'ma',
        sac: 'má',
        huyen: 'mà',
        hoi: 'mả',
        nga: 'mã',
        nang: 'mạ',
      };
      const textToSpeak = wordsMap[toneId] || 'ma';
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.85;
      
      const viVoices = window.speechSynthesis.getVoices().filter(v => v.lang.includes('vi'));
      if (viVoices.length > 0) {
        utterance.voice = viVoices[0];
        window.speechSynthesis.speak(utterance);
        // Đồng thời phát âm nền cao độ
      }
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);

    switch (toneId) {
      case 'ngang':
        // Thanh ngang: Bằng phẳng, ổn định (khoảng 330Hz)
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.linearRampToValueAtTime(330, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.start(now);
        osc.stop(now + 0.65);
        break;

      case 'sac':
        // Thanh sắc: Bắt đầu trung bình (330Hz) rồi vút nhanh lên cao (480Hz)
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(490, now + 0.55);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;

      case 'huyen':
        // Thanh huyền: Bắt đầu thấp vừa (310Hz) và trầm dần xuống (220Hz)
        osc.frequency.setValueAtTime(310, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.start(now);
        osc.stop(now + 0.65);
        break;

      case 'hoi':
        // Thanh hỏi: Xuống thấp rồi lượn nhẹ lên lại (300Hz -> 220Hz -> 310Hz)
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.65);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
        break;

      case 'nga':
        // Thanh ngã: Lên cao, khựng ngắt thanh môn (dip), rồi vút lên (330Hz -> 430Hz)
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.25);
        gain.gain.setValueAtTime(0.02, now + 0.28); // khựng thanh môn
        gain.gain.setValueAtTime(0.18, now + 0.32);
        osc.frequency.exponentialRampToValueAtTime(460, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.start(now);
        osc.stop(now + 0.65);
        break;

      case 'nang':
        // Thanh nặng: Rơi dốc xuống đáy (300Hz -> 190Hz) và ngắt dứt khoát
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.32);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35); // ngắt ngắn
        osc.start(now);
        osc.stop(now + 0.36);
        break;

      default:
        osc.frequency.setValueAtTime(330, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
  } catch (e) {
    console.warn('Audio synthesis not supported or blocked:', e);
  }
}

const SOUND_FX_KEY = 'viettone_sound_fx_enabled';

export function isSoundFxEnabled(): boolean {
  try {
    const val = localStorage.getItem(SOUND_FX_KEY);
    return val !== 'false'; // Mặc định bật
  } catch {
    return true;
  }
}

export function setSoundFxEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_FX_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignore error
  }
}

/**
 * Phát âm thanh chúc mừng / khích lệ du dương bằng Web Audio API
 * Sử dụng chuỗi thang âm ngũ cung ấm áp, không cần bất kỳ file âm thanh nào từ bên ngoài
 */
export function playCelebrationChime(type: 'success' | 'milestone' | 'encourage' = 'success'): void {
  if (!isSoundFxEnabled()) return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Chuỗi nốt ngũ cung (C5, D5, E5, G5, A5) mang âm sắc Việt trong trẻo
    const notes =
      type === 'milestone'
        ? [523.25, 659.25, 783.99, 1046.5] // C5 - E5 - G5 - C6 (rực rỡ)
        : type === 'success'
        ? [523.25, 659.25, 783.99] // C5 - E5 - G5 (vui tươi)
        : [587.33, 659.25]; // D5 - E5 (nhẹ nhàng, ấm áp)

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.001, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.46);
    });
  } catch (e) {
    console.warn('Could not play celebration sound:', e);
  }
}
