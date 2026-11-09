import React, { useEffect, useRef } from 'react';

/**
 * VietToneHomeEmbedded.tsx
 * React wrapper for the VietTone AI Home page located at /viettone-home/index.html.
 * 
 * Bridges postMessage navigation events from the standalone Home page:
 * - "Bắt đầu học ngay" -> transitions to learning studio /app
 * - Clicking one of 6 tone cards -> transitions to /app?tone=ngang|sac|huyen|hoi|nga|nang
 */

export const APP_PATH = '/app';

interface VietToneHomeEmbeddedProps {
  onOpenLearning: (toneId?: string) => void;
  onOpenArchitecture?: () => void;
}

export const VietToneHomeEmbedded: React.FC<VietToneHomeEmbeddedProps> = ({
  onOpenLearning,
  onOpenArchitecture,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check / payload structure validation
      if (!event.data || typeof event.data !== 'object') return;

      const data = event.data;

      if (data.type === 'VIETTONE_NAVIGATE' || data.action === 'openLearning') {
        const toneId = data.tone || data.toneId;
        onOpenLearning(toneId || undefined);
      }

      if (data.type === 'VIETTONE_OPEN_ARCHITECTURE') {
        onOpenArchitecture?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onOpenLearning, onOpenArchitecture]);

  return (
    <div className="w-full h-screen overflow-hidden bg-[#172333]">
      <iframe
        ref={iframeRef}
        src="/viettone-home/index.html"
        title="VietTone AI Home"
        className="w-full h-full border-none block"
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="microphone; autoplay"
      />
    </div>
  );
};


export default VietToneHomeEmbedded;
