import React, { useEffect } from 'react';

function Confetti({ trigger, duration = 3000 }) {
  useEffect(() => {
    if (!trigger) return;

    const colors = ['#D4AF37', '#B8941E', '#F4E4A6', '#FFD700', '#FFA500'];
    const confettiCount = 50;
    const confettiElements = [];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;
      document.body.appendChild(confetti);
      confettiElements.push(confetti);
    }

    const timeout = setTimeout(() => {
      confettiElements.forEach(el => el.remove());
    }, duration);

    return () => {
      clearTimeout(timeout);
      confettiElements.forEach(el => el.remove());
    };
  }, [trigger, duration]);

  return null;
}

export default Confetti;
