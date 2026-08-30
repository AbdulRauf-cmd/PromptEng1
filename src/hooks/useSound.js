import { useState, useCallback, useRef } from 'react';

export function useSound() {
  const [isMuted, setIsMuted] = useState(true);
  const audioCtxRef = useRef(null);

  const getContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playBlip = useCallback((frequency = 800, duration = 0.08) => {
    if (isMuted) return;
    try {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Silently fail if audio isn't available
    }
  }, [isMuted, getContext]);

  const playHop = useCallback(() => {
    playBlip(600 + Math.random() * 400, 0.06);
  }, [playBlip]);

  const playSuccess = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getContext();
      const now = ctx.currentTime;
      
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.12, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.3);
      });
    } catch (e) {
      // Silently fail
    }
  }, [isMuted, getContext]);

  const playError = useCallback(() => {
    playBlip(200, 0.2);
  }, [playBlip]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (prev) {
        // Unmuting — ensure AudioContext is resumed (user gesture)
        try {
          const ctx = getContext();
          if (ctx.state === 'suspended') ctx.resume();
        } catch (e) {
          // ignore
        }
      }
      return !prev;
    });
  }, [getContext]);

  return { isMuted, toggleMute, playHop, playSuccess, playError };
}
