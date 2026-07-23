import React, { useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';

/**
 * Audio Chime Synthesizer using Web Audio API
 * Plays a pleasant 2-tone notification chime without requiring external mp3 files
 */
const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // First tone (E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second tone (B5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.5);
  } catch (e) {
    // Web Audio API playback error
  }
};

export const AdminNotificationListener: React.FC = () => {
  const { showToast } = useToast();

  useEffect(() => {
    // Connect to Backend SSE Stream
    const eventSource = new EventSource('/api/notifications/stream');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'connected') return;

        // Play audio chime
        playNotificationChime();

        // Trigger visual Toast notification
        showToast(payload.message || 'Có thông báo mới!', 'info');
      } catch (err) {
        console.error('[AdminNotificationListener] Error parsing SSE payload:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('[AdminNotificationListener] SSE connection warning, auto-reconnecting...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [showToast]);

  return null; // Silent background listener component
};

export default AdminNotificationListener;
