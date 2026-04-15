import { useEffect, useMemo, useState } from 'react';

function formatRemainingTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function useOtpTimer(initialSeconds: number) {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setRemainingSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [remainingSeconds]);

  const formattedTime = useMemo(
    () => formatRemainingTime(remainingSeconds),
    [remainingSeconds]
  );

  return {
    canResend: remainingSeconds === 0,
    formattedTime,
    restartTimer: () => setRemainingSeconds(initialSeconds),
    remainingSeconds,
  };
}
