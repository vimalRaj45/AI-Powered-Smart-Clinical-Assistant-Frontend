import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  frequencyData: Uint8Array;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording, frequencyData }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numBars = 32;
      const barWidth = 4;
      const gap = 3;
      const totalWidth = numBars * (barWidth + gap);
      const startX = (canvas.width - totalWidth) / 2;

      for (let i = 0; i < numBars; i++) {
        let value = 0;
        if (isRecording && frequencyData.length > 0) {
          const index = Math.floor((i / numBars) * frequencyData.length);
          value = frequencyData[index] || 0;
        }

        const barHeight = isRecording
          ? Math.max(4, (value / 255) * (canvas.height - 10))
          : 4;

        const x = startX + i * (barWidth + gap);
        const y = (canvas.height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isRecording) {
          gradient.addColorStop(0, '#0284c7');
          gradient.addColorStop(1, '#0369a1');
        } else {
          gradient.addColorStop(0, '#cbd5e1');
          gradient.addColorStop(1, '#94a3b8');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      if (isRecording) {
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isRecording, frequencyData]);

  return (
    <div className="w-full flex items-center justify-center h-12 bg-slate-50 rounded-xl border border-slate-200 px-4">
      <canvas
        ref={canvasRef}
        width={300}
        height={48}
        className="w-full max-w-[280px] h-10"
      />
    </div>
  );
};
