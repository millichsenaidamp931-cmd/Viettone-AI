import React from 'react';
import { BarChart3, HelpCircle } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import {
  ToneItem,
  FeedbackAssessment,
  F0ContourData,
  ReferenceToneSample,
  F0ScoreResult,
} from '../../types';
import { AiProbabilityBars } from '../AiProbabilityBars';
import { F0ScoreCard } from '../F0ScoreCard';
import { F0ContourChart } from '../F0ContourChart';
import { DetailedFeedback } from '../DetailedFeedback';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTone: ToneItem;
  currentProbabilities: Record<string, number>;
  topToneName: string | null;
  topToneScore: number;
  userContour: F0ContourData | null;
  refSample: ReferenceToneSample | null;
  f0ScoreResult: F0ScoreResult | null;
  feedbackAssessment: FeedbackAssessment | null;
  isListening: boolean;
  onRetry: () => void;
  onNextTone: () => void;
  onOpenTeacherModal: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  selectedTone,
  currentProbabilities,
  topToneName,
  topToneScore,
  userContour,
  refSample,
  f0ScoreResult,
  feedbackAssessment,
  isListening,
  onRetry,
  onNextTone,
  onOpenTeacherModal,
}) => {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Phân tích AI & Đường nét cao độ F0"
      subtitle="Báo cáo chuyên sâu kết hợp Mô hình Lai (Teachable Machine + Âm vị học F0)"
      icon={<BarChart3 className="w-5 h-5" />}
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Nếu chưa có lượt đọc nào */}
        {!feedbackAssessment && !userContour && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Chưa có dữ liệu lượt đọc</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hãy nhấn nút Microphone ở màn hình chính và đọc to từ &ldquo;{selectedTone.word}&rdquo; để AI phân tích xác suất 6 thanh và vẽ biểu đồ đường nét cao độ F0.
            </p>
          </div>
        )}

        {/* 1. Xác suất nhận diện 6 thanh */}
        <AiProbabilityBars
          probabilities={currentProbabilities}
          topToneName={topToneName}
          topToneScore={topToneScore}
          isListening={isListening}
          selectedToneName={selectedTone.name}
          hybridAgreement={feedbackAssessment?.agreementStatus}
          hybridExplanation={feedbackAssessment?.hybridExplanation}
        />

        {/* 2. Điểm tương đồng F0 (0–100) */}
        {f0ScoreResult && (
          <F0ScoreCard
            f0Result={f0ScoreResult}
            aiConfidencePercent={Math.round(topToneScore * 100)}
            topToneName={topToneName}
          />
        )}

        {/* 3. Biểu đồ đường cao độ F0 (Hz vs ms) */}
        <F0ContourChart
          userContour={userContour}
          refSample={refSample}
          targetToneName={selectedTone.name}
          isListening={isListening}
          onOpenTeacherModal={onOpenTeacherModal}
        />

        {/* 4. Phản hồi sư phạm chi tiết */}
        <DetailedFeedback
          assessment={feedbackAssessment}
          targetTone={selectedTone}
          isListening={isListening}
          onRetry={() => {
            onClose();
            onRetry();
          }}
          onNextTone={() => {
            onClose();
            onNextTone();
          }}
        />
      </div>
    </ModalWrapper>
  );
};
