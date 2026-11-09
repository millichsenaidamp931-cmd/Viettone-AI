import React from 'react';
import { Compass } from 'lucide-react';
import { ModalWrapper } from './ModalWrapper';
import { ToneRoadmapStat, ToneId, StreakInfo } from '../../types';
import { LearningRoadmap } from '../LearningRoadmap';

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ToneRoadmapStat[];
  nextRecommended: { toneId: ToneId; reason: string };
  streakInfo: StreakInfo;
  onSelectToneId: (toneId: ToneId) => void;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({
  isOpen,
  onClose,
  stats,
  nextRecommended,
  streakInfo,
  onSelectToneId,
}) => {
  const handleSelectTone = (toneId: ToneId) => {
    onSelectToneId(toneId);
    onClose(); // Đóng popup và tự động focus thanh được chọn trên màn hình chính
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Lộ trình học tập 6 thanh điệu"
      subtitle="Quy trình 4 bước sư phạm & đề xuất thanh tiếp theo theo dữ liệu thực tế"
      icon={<Compass className="w-5 h-5" />}
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-4">
        <LearningRoadmap
          stats={stats}
          nextRecommended={nextRecommended}
          streakInfo={streakInfo}
          onSelectToneId={handleSelectTone}
        />
      </div>
    </ModalWrapper>
  );
};
