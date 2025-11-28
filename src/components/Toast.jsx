import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} className="text-green-400" />,
  };

  const styles = {
    success: 'from-green-600/90 to-green-700/90 border-green-400',
  };

  return (
    <div className="fixed top-6 right-6 z-[100] animate-fade-in-up">
      <div className={`bg-gradient-to-r ${styles[type]} backdrop-blur-lg border rounded-xl shadow-2xl px-6 py-4 flex items-center gap-3 min-w-[300px]`}>
        {icons[type]}
        <p className="text-white font-semibold flex-1">{message}</p>
        <button
          onClick={onClose}
          className="glass p-1 rounded-lg hover:bg-white/20 transition-all"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default Toast;
