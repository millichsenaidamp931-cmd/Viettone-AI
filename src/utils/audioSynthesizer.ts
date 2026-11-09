/**
 * Bộ phát âm mẫu 6 thanh điệu tiếng Việt:
 * 1. Ưu tiên phát trực tiếp các file ghi âm chuẩn (.ogg / .mp3 / .wav) từ thư mục /assets/tones/
 * 2. Tự động chuyển đổi mượt mà và ngắt âm cũ khi người dùng bấm liên tiếp
 * 3. Nếu trình duyệt chặn hoặc gặp lỗi mạng, dự phòng bằng Web Speech API + Web Audio Oscillator F0
 */

// Bộ đệm audio element cho 6 thanh điệu
const toneAudioElements: Record<string, HTMLAudioElement> = {};
let currentPlayingAudio: HTMLAudioElement | null = null;

function getToneAudioElement(toneId: string): HTMLAudioElement {
  if (toneAudioElements[toneId]) {
    return toneAudioElements[toneId];
  }

  const audio = new Audio();
  
  // Kiểm tra định dạng audio được trình duyệt hỗ trợ tốt nhất
  let preferredExt = 'mp3';
  if (audio.canPlayType && audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, '')) {
    preferredExt = 'ogg';
  } else if (audio.canPlayType && audio.canPlayType('audio/mpeg').replace(/no/, '')) {
    preferredExt = 'mp3';
  } else if (audio.canPlayType && audio.canPlayType('audio/wav').replace(/no/, '')) {
    preferredExt = 'wav';
  }

  audio.src = `/assets/tones/tone-${toneId}.${preferredExt}`;
  audio.preload = 'auto';

  // Dự phòng nếu lỗi tải file chính thì thử các định dạng còn lại
  const fallbackUrls = [
    `/assets/tones/tone-${toneId}.ogg`,
    `/assets/tones/tone-${toneId}.mp3`,
    `/assets/tones/tone-${toneId}.wav`,
    `/viettone-home/assets/tone-${toneId}.ogg`,
    `/viettone-home/assets/tone-${toneId}.mp3`,
  ];
  let fallbackIndex = 0;

  audio.addEventListener('error', () => {
    while (fallbackIndex < fallbackUrls.length) {
      const nextUrl = fallbackUrls[fallbackIndex++];
      if (nextUrl !== audio.src) {
        audio.src = nextUrl;
        audio.load();
        audio.play().catch(() => {});
        return;
      }
    }
  });

  toneAudioElements[toneId] = audio;
  return audio;
}

function fallbackSynthesizer(toneId: string) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Thử dùng Web Speech API tiếng Việt
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
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.85;
      
      const viVoices = window.speechSynthesis.getVoices().filter(v => v.lang.includes('vi'));
      if (viVoices.length > 0) {
        utterance.voice = viVoices[0];
      }
      window.speechSynthesis.speak(utterance);
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);

    switch (toneId) {
      case 'ngang':
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.linearRampToValueAtTime(330, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.start(now);
        osc.stop(now + 0.65);
        break;

      case 'sac':
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(490, now + 0.55);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;

      case 'huyen':
        osc.frequency.setValueAtTime(310, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.start(now);
        osc.stop(now + 0.65);
        break;

      case 'hoi':
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.65);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
        break;

      case 'nga':
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.25);
        gain.gain.setValueAtTime(0.02, now + 0.28);
        gain.gain.setValueAtTime(0.18, now + 0.32);
        osc.frequency.exponentialRampToValueAtTime(460, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.start(now);
        osc.stop(now + 0.65);
        break;

      case 'nang':
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.32);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
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
    console.warn('Audio synthesis fallback error:', e);
  }
}

let practiceIntroAudio: HTMLAudioElement | null = null;
let currentEncourageAudio: HTMLAudioElement | null = null;

export const ENCOURAGE_VOICE_MESSAGES = [
  'Bạn thử xem phần Mẹo luyện rồi đọc lại nhé! Bé Lạc tin bạn sẽ tiến bộ hơn đấy!',
  'Đừng vội nhé! Hãy nghe lại giọng mẫu, chú ý cách lên xuống của thanh điệu rồi thử lại cùng mình nào!',
  'Mình cùng xem biểu đồ cao độ F0 để tìm điểm khác biệt nhé! Sau đó thử phát âm thêm một lần nữa nào!',
] as const;

let lastEncourageIndex = -1;

export function stopAnyVoiceAudio() {
  if (currentPlayingAudio) {
    try {
      currentPlayingAudio.pause();
      currentPlayingAudio.currentTime = 0;
    } catch {
      // Ignore
    }
  }
  if (practiceIntroAudio) {
    try {
      practiceIntroAudio.pause();
      practiceIntroAudio.currentTime = 0;
    } catch {
      // Ignore
    }
  }
  if (currentEncourageAudio) {
    try {
      currentEncourageAudio.pause();
      currentEncourageAudio.currentTime = 0;
    } catch {
      // Ignore
    }
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}

export function playRandomEncourageAudio(onEnded?: () => void): number {
  if (!isSoundFxEnabled()) return -1;

  stopAnyVoiceAudio();

  // Chọn ngẫu nhiên 1 trong 3 file audio (tránh lặp lại câu vừa phát trước đó nếu có thể)
  const choices = [1, 2, 3];
  const candidates = choices.filter((c) => c !== lastEncourageIndex);
  const chosenIndex = candidates[Math.floor(Math.random() * candidates.length)] || choices[0];
  lastEncourageIndex = chosenIndex;

  const key = `encourage-${chosenIndex}`;

  const audio = new Audio();
  let preferredExt = 'mp3';
  if (audio.canPlayType && audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, '')) {
    preferredExt = 'ogg';
  } else if (audio.canPlayType && audio.canPlayType('audio/mpeg').replace(/no/, '')) {
    preferredExt = 'mp3';
  } else if (audio.canPlayType && audio.canPlayType('audio/wav').replace(/no/, '')) {
    preferredExt = 'wav';
  }

  audio.src = `/assets/tones/${key}.${preferredExt}`;
  audio.preload = 'auto';

  const fallbackUrls = [
    `/assets/tones/${key}.ogg`,
    `/assets/tones/${key}.mp3`,
    `/assets/tones/${key}.wav`,
    `/viettone-home/assets/${key}.mp3`,
  ];
  let fbIdx = 0;
  audio.addEventListener('error', () => {
    if (fbIdx < fallbackUrls.length) {
      audio.src = fallbackUrls[fbIdx++];
      audio.load();
      audio.play().catch(() => {});
    }
  });

  if (onEnded) {
    const handleEnded = () => {
      audio.removeEventListener('ended', handleEnded);
      onEnded();
    };
    audio.addEventListener('ended', handleEnded);
  }

  currentEncourageAudio = audio;

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch((err) => {
      console.warn(`Autoplay ${key} bị hạn chế, dùng Web Speech API dự phòng:`, err);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          const utterance = new SpeechSynthesisUtterance(ENCOURAGE_VOICE_MESSAGES[chosenIndex - 1]);
          utterance.lang = 'vi-VN';
          utterance.rate = 1.0;
          const viVoices = window.speechSynthesis.getVoices().filter((v) => v.lang.includes('vi'));
          if (viVoices.length > 0) utterance.voice = viVoices[0];
          window.speechSynthesis.speak(utterance);
        } catch {
          // Ignore
        }
      }
    });
  }

  return chosenIndex;
}

export function playPracticeWelcomeAudio(toneId: string, onEnded?: () => void) {
  if (!isSoundFxEnabled()) return;

  stopAnyVoiceAudio();

  // Tạo hoặc tái sử dụng intro audio
  if (!practiceIntroAudio) {
    const audio = new Audio();
    let preferredExt = 'mp3';
    if (audio.canPlayType && audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, '')) {
      preferredExt = 'ogg';
    } else if (audio.canPlayType && audio.canPlayType('audio/mpeg').replace(/no/, '')) {
      preferredExt = 'mp3';
    } else if (audio.canPlayType && audio.canPlayType('audio/wav').replace(/no/, '')) {
      preferredExt = 'wav';
    }
    audio.src = `/assets/tones/practice-intro.${preferredExt}`;
    audio.preload = 'auto';

    // Dự phòng đường dẫn phụ nếu cần
    const fallbackUrls = [
      `/assets/tones/practice-intro.ogg`,
      `/assets/tones/practice-intro.mp3`,
      `/assets/tones/practice-intro.wav`,
      `/viettone-home/assets/practice-intro.mp3`,
    ];
    let fbIdx = 0;
    audio.addEventListener('error', () => {
      if (fbIdx < fallbackUrls.length) {
        audio.src = fallbackUrls[fbIdx++];
        audio.load();
        audio.play().catch(() => {});
      }
    });

    practiceIntroAudio = audio;
  }

  const audio = practiceIntroAudio;
  audio.currentTime = 0;

  // Khi kết thúc lời thoại "Bé Lạc đã sẵn sàng! Nhấn nút micro và đọc to từ"
  // Lập tức phát tiếp file âm thanh của từ tương ứng với thanh đã chọn (ví dụ "mã")
  const handleIntroEnded = () => {
    audio.removeEventListener('ended', handleIntroEnded);
    setTimeout(() => {
      playToneAudio(toneId);
      if (onEnded) onEnded();
    }, 120);
  };

  audio.addEventListener('ended', handleIntroEnded);

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch((err) => {
      console.warn('Autoplay practice-intro bị chặn hoặc lỗi, gắn listener chạm để phát:', err);
      // Nếu browser chặn autoplay thì khi người dùng chạm màn hình lần đầu sẽ tự phát
      const handleUserClick = () => {
        window.removeEventListener('click', handleUserClick);
        window.removeEventListener('touchstart', handleUserClick);
        audio.play().catch(() => {});
      };
      window.addEventListener('click', handleUserClick, { once: true });
      window.addEventListener('touchstart', handleUserClick, { once: true });
    });
  }
}

export function playToneAudio(toneId: string) {
  // Dừng file âm thanh đang phát trước đó nếu có
  stopAnyVoiceAudio();

  try {
    const audio = getToneAudioElement(toneId);
    currentPlayingAudio = audio;
    audio.currentTime = 0;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn(`File audio tone-${toneId} không thể phát tự động, chuyển sang bộ tổng hợp dự phòng:`, err);
        fallbackSynthesizer(toneId);
      });
    }
  } catch (err) {
    console.warn('Không thể khởi tạo audio element, dùng fallback:', err);
    fallbackSynthesizer(toneId);
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
