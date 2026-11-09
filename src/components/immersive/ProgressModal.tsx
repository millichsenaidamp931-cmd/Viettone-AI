import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { PracticeAttempt, ToneRoadmapStat, StreakInfo, MilestoneBadge, ToneId } from '../../types';
import { ProgressDashboard } from '../ProgressDashboard';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempts: PracticeAttempt[];
  stats: ToneRoadmapStat[];
  recent7Days: Array<{
    dateStr: string;
    displayDate: string;
    attemptsCount: number;
    avgScore: number | null;
  }>;
  streakInfo: StreakInfo;
  badges: MilestoneBadge[];
  onClearHistory: () => void;
  onSelectAttemptTone: (toneId: ToneId) => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  onClose,
  attempts,
  stats,
  recent7Days,
  streakInfo,
  badges,
  onClearHistory,
  onSelectAttemptTone,
}) => {
  const handleSelectTone = (toneId: ToneId) => {
    onSelectAttemptTone(toneId);
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Tiến bộ của tôi & Lịch sử luyện tập"
      subtitle="Thống kê thực tế lưu trữ 100% trên trình duyệt của bạn"
      icon={<TrendingUp className="w-5 h-5" />}
      maxWidthClass="max-w-5xl"
    >
      <div className="space-y-4">
        <ProgressDashboard
          attempts={attempts}
          stats={stats}
          recent7Days={recent7Days}
          streakInfo={streakInfo}
          badges={badges}
          onClearHistory={onClearHistory}
          onSelectAttemptTone={handleSelectTone}
        />
      </div>
    </ModalWrapper>
  );
};
