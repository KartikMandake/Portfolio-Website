import { useEffect, useState, useRef } from 'react';

export function useSecretLogin() {
  const [showLogin, setShowLogin] = useState(false);
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + Shift + L
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();           // don't trigger browser shortcuts
        setShowLogin(prev => !prev);  // toggle modal
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSecretTap = () => {
    tapCount.current += 1;

    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;        // reset if too slow
    }, 1500);

    if (tapCount.current >= 5) {
      tapCount.current = 0;
      setShowLogin(true);          // open login modal
    }
  };

  return { showLogin, setShowLogin, handleSecretTap };
}
