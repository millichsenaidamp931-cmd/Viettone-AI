export type ToneId = 'ngang' | 'sac' | 'huyen' | 'hoi' | 'nga' | 'nang';

export interface ToneItem {
  id: ToneId;
  word: string;
  name: string;
  toneTitle: string;
  symbol: string;
  diacriticName: string;
  pitchDescription: string;
  guideTip: string;
  color: {
    bg: string;
    border: string;
    text: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
  };
}

export interface PredictionResult {
  className: string;
  probability: number;
}

export interface StabilityAssessment {
  status: 'listening' | 'stabilizing' | 'success' | 'low_confidence' | 'ambient_noise' | 'error';
  recognizedToneName: string | null;
  confidence: number;
  allProbabilities: { [key: string]: number };
  sampleCount: number;
  message?: string;
}

export interface AudioStats {
  volume: number;
  isSpeaking: boolean;
}
