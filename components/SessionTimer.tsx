import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour

const SessionTimer: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const storedSession = localStorage.getItem('admin_session');
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          const now = Date.now();
          const timeSinceLastActivity = now - sessionData.lastActivity;
          const remaining = SESSION_TIMEOUT - timeSinceLastActivity;
          
          setTimeRemaining(Math.max(0, remaining));
          
          // Show warning when less than 5 minutes remaining
          setShowWarning(remaining < 5 * 60 * 1000 && remaining > 0);
        } catch (error) {
          console.error('Error reading session:', error);
        }
      }
    };

    // Update every second
    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (timeRemaining === 0) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
      showWarning 
        ? 'bg-red-50 text-red-700 border border-red-200' 
        : 'bg-gray-50 text-gray-600 border border-gray-200'
    }`}>
      {showWarning ? (
        <AlertCircle size={16} className="animate-pulse" />
      ) : (
        <Clock size={16} />
      )}
      <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
      {showWarning && (
        <span className="text-xs">còn lại</span>
      )}
    </div>
  );
};

export default SessionTimer;
