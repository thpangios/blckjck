import React, { useState } from 'react';
import { AlertCircle, Crown, X } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import PricingPage from './PricingPage'; // updated import path ✅

function TrainingLimitBanner({ onUpgrade }) {
  const { planType, remainingTrainingRounds } = useSubscription();
  const [showPricing, setShowPricing] = useState(false);

  if (planType !== 'free') return null;

  const isLimitReached = remainingTrainingRounds === 0;
  const isWarning = remainingTrainingRounds <= 2 && remainingTrainingRounds > 0;

  if (!isLimitReached && !isWarning) return null;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      setShowPricing(true);
    }
  };

  return (
    <>
      {/* === Banner === */}
      {isLimitReached ? (
        <div className="glass-strong rounded-2xl p-6 border-l-4 border-red-500 mb-6 slide-in-top">
          <div className="flex items-start gap-4">
            <AlertCircle size={32} className="text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-300 mb-2">
                Daily Training Limit Reached
              </h3>
              <p className="text-gray-300 mb-4">
                You've completed all 5 free training rounds for today. Training mode is now disabled until tomorrow.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleUpgrade}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-6 py-3 rounded-lg transition-all flex items-center gap-2 shadow-lg"
                >
                  <Crown size={20} />
                  Upgrade for Unlimited Training
                </button>
                <div className="glass px-4 py-3 rounded-lg">
                  <span className="text-sm text-gray-400">
                    You can still play in casual mode without limits
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-strong rounded-2xl p-4 border-l-4 border-yellow-500 mb-6 slide-in-top">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-gray-200">
                <span className="font-bold text-yellow-300">{remainingTrainingRounds}</span> training round
                {remainingTrainingRounds !== 1 ? 's' : ''} remaining today
              </p>
            </div>
            <button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2"
            >
              <Crown size={16} />
              Go Unlimited
            </button>
          </div>
        </div>
      )}

      {/* === Modal for Pricing Page === */}
    {showPricing && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="relative bg-gray-900 rounded-2xl p-0 w-full max-w-6xl shadow-xl overflow-y-auto max-h-[90vh]">
      <PricingPage onClose={() => setShowPricing(false)} />
    </div>
  </div>
)}


    </>
  );
}

export default TrainingLimitBanner;
