import { useEffect, useMemo, useState } from 'react';

type UseOtpTimerResult = {
  remainingSeconds: number;
  formattedTime: string;
  canResend: boolean;
  restartTimer: () => void;
};

export default function useOtpTimer(initialSeconds: number): UseOtpTimerResult {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [remainingSeconds]);

  return {
    remainingSeconds,
    formattedTime,
    canResend: remainingSeconds === 0,
    restartTimer: () => setRemainingSeconds(initialSeconds),
  };
}
