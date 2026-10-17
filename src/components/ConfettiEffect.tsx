/**
 * VietTone AI - Confetti & Celebration Sparks Effect
 * 
 * Hiệu ứng pháo hoa hoa giấy ăn mừng nhẹ nhàng trên HTML5 Canvas.
 * Tự động biến mất sau 2.5 giây, hoàn toàn không phụ thuộc thư viện ngoài.
 */

import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export const ConfettiEffect: React.FC<ConfettiProps> = ({ active, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Bảng màu truyền thống Việt & hiện đại: Đỏ cờ, vàng sao, cam tươi, xanh lục, xanh ngọc
    const colors = ['#dc2626', '#ea580c', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];

    const particles: Particle[] = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: width * 0.5 + (Math.random() - 0.5) * 200,
        y: height * 0.35 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 8 - 4,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      });
    }

    let animationFrameId: number;
    let startTime = Date.now();

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      let allDead = true;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // Trọng lực nhẹ
        p.vx *= 0.98; // Ma sát không khí
        p.rotation += p.rotationSpeed;

        if (elapsed > 1600) {
          p.opacity = Math.max(0, 1 - (elapsed - 1600) / 900);
        }

        if (p.opacity > 0 && p.y < height) {
          allDead = false;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
          ctx.restore();
        }
      });

      if (!allDead && elapsed < 2600) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        if (onComplete) onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
};
