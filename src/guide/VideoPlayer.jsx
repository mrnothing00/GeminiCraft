import React, { useEffect, useRef, useState } from 'react';

export function VideoPlayer({ script, onComplete }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      playVideo();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const playVideo = () => {
    const startTime = performance.now();
    const duration = script.duration_seconds || 15;

    // Speak narration using Web Speech API
    const utterance = new SpeechSynthesisUtterance(script.narration);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);

    const animate = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000;
      setCurrentTime(elapsed);

      if (elapsed >= duration) {
        setIsPlaying(false);
        onComplete();
        return;
      }

      // Execute keyframes at their scheduled times
      script.keyframes.forEach(keyframe => {
        if (Math.abs(keyframe.time - elapsed) < 0.1 && !keyframe.executed) {
          executeKeyframe(keyframe);
          keyframe.executed = true;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const executeKeyframe = (keyframe) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    switch (keyframe.action) {
      case 'highlight_component':
        // Draw highlight around component
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(50, 50, 100, 100); // Would use actual component coords
        break;

      case 'animate_wire':
        // Draw animated wire
        animateWire(ctx, keyframe.from, keyframe.to, keyframe.duration || 1);
        break;

      case 'show_text':
        // Show overlay text
        ctx.font = '16px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText(keyframe.text, 20, 20);
        break;
    }
  };

  const animateWire = (ctx, from, to, duration) => {
    // Simple line drawing animation
    // In real implementation, this would integrate with your canvas
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  return (
    <div className="bg-gray-900 rounded p-2">
      <canvas
        ref={canvasRef}
        width={360}
        height={200}
        className="w-full rounded"
      />
      
      <div className="flex justify-between items-center mt-2 text-white text-sm">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        
        <span>{currentTime.toFixed(1)}s / {script.duration_seconds}s</span>
      </div>
    </div>
  );
}