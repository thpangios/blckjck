import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import ProfileSettings from './ProfileSettings';
import AIAssistantGreeting from './AIAssistantGreeting';
import { LogOut, Settings, Brain, Lock } from 'lucide-react';
import PricingPage from './PricingPage';

// ==================== HAND ANALYZER CARD WITH ACCESS GATE ====================
function HandAnalyzerCard({ onSelectGame }) {
  const { canAccessHandAnalyzer, planType } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleClick = () => {
    if (canAccessHandAnalyzer()) {
      onSelectGame('handanalyzer');
    } else {
      setShowUpgrade(true);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={handleClick}
          className={`w-full group rounded-2xl p-6 transition-all duration-300 border-2 ${
            canAccessHandAnalyzer()
              ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 border-purple-400 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/50'
              : 'bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 border-gray-600 hover:border-yellow-500 cursor-pointer'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${
                canAccessHandAnalyzer() ? 'bg-white/10' : 'bg-gray-700/50'
              }`}>
                {canAccessHandAnalyzer() ? (
                  <Brain className="text-white" size={40} />
                ) : (
                  <Lock className="text-gray-400" size={40} />
                )}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-white">
                    🧠 Hand Analyzer
                  </h3>
                  {canAccessHandAnalyzer() ? (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-bold">
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="text-xs bg-rose-500 text-white px-2 py-1 rounded-full font-bold">
                      ACE PRO ONLY
                    </span>
                  )}
                </div>
                <p className={`text-sm ${
                  canAccessHandAnalyzer() ? 'text-purple-200' : 'text-gray-400'
                }`}>
                  {canAccessHandAnalyzer() 
                    ? 'Choose your own cards and get professional strategy analysis'
                    : 'Unlock with Ace Pro - Custom card selection & advanced training'
                  }
                </p>
              </div>
            </div>
            <div className="hidden md:block text-4xl group-hover:translate-x-2 transition-transform">
              {canAccessHandAnalyzer() ? (
                <span className="text-white">→</span>
              ) : (
                <span className="text-gray-400">🔒</span>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <PricingPage 
            onClose={() => setShowUpgrade(false)}
            onSelectPlan={() => setShowUpgrade(false)}
          />
        </div>
      )}
    </>
  );
}

// ==================== MAIN GAME SELECTOR COMPONENT ====================
function GameSelector({ onSelectGame }) {
  const { signOut, user } = useAuth();
  const { planType, isPremium } = useSubscription();
  const [showSettings, setShowSettings] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black flex items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        
        {/* User Info, Settings & Logout */}
        <div className="absolute top-4 right-4 flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-white font-semibold">{user?.email}</p>
            <div className="flex items-center gap-2 justify-end">
              <p className="text-gray-400 text-sm">
                {planType === 'free' && '🆓 Free Plan'}
                {planType === 'ace' && '♠️ Ace Plan'}
                {planType === 'ace_pro' && '♥️ Ace Pro'}
              </p>
              {planType === 'free' && (
                <button
                  onClick={() => setShowPricing(true)}
                  className="text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold hover:bg-yellow-400 transition"
                >
                  UPGRADE
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(true)}
            className="glass p-3 rounded-lg hover:bg-yellow-600 hover:bg-opacity-40 transition-all flex items-center gap-2"
            title="Profile Settings"
          >
            <Settings size={20} />
            <span className="hidden md:inline">Settings</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="glass p-3 rounded-lg hover:bg-red-600 hover:bg-opacity-40 transition-all flex items-center gap-2"
          >
            <LogOut size={20} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-yellow-400 player-label mb-4">
            ACE EDGE
          </h1>
          <p className="text-xl text-gray-300">Select Your Game</p>
        </div>

        {/* Hand Analyzer Feature Banner with Access Gate */}
        <HandAnalyzerCard onSelectGame={onSelectGame} />

        {/* Game Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          
          {/* Blackjack Card */}
          <button
            onClick={() => onSelectGame('blackjack')}
            className="group glass-strong rounded-3xl p-8 hover:scale-105 transition-all duration-300 hover:ring-4 hover:ring-yellow-400 btn-premium"
          >
            <div className="text-center">
              <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform">
                🃏
              </div>
              <h2 className="text-3xl font-bold player-label text-yellow-400 mb-4">
                BLACKJACK
              </h2>
              <p className="text-gray-300 mb-4 text-sm">
                Classic 21 with card counting and strategy training
              </p>
              <div className="text-xs text-gray-400">House Edge: ~0.5%</div>
            </div>
          </button>

          {/* Baccarat Card */}
          <button
            onClick={() => onSelectGame('baccarat')}
            className="group glass-strong rounded-3xl p-8 hover:scale-105 transition-all duration-300 hover:ring-4 hover:ring-yellow-400 btn-premium"
          >
            <div className="text-center">
              <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform">
                🎰
              </div>
              <h2 className="text-3xl font-bold player-label text-yellow-400 mb-4">
                BACCARAT
              </h2>
              <p className="text-gray-300 mb-4 text-sm">
                Player vs Banker with roadmaps and patterns
              </p>
              <div className="text-xs text-gray-400">House Edge: 1.06%</div>
            </div>
          </button>

          {/* Video Poker Card */}
          <button
            onClick={() => onSelectGame('videopoker')}
            className="group glass-strong rounded-3xl p-8 hover:scale-105 transition-all duration-300 hover:ring-4 hover:ring-yellow-400 btn-premium"
          >
            <div className="text-center">
              <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform">
                🎴
              </div>
              <h2 className="text-3xl font-bold player-label text-yellow-400 mb-4">
                VIDEO POKER
              </h2>
              <p className="text-gray-300 mb-4 text-sm">
                Jacks or Better with optimal strategy
              </p>
              <div className="text-xs text-gray-400">RTP: 99.54%</div>
            </div>
          </button>

          {/* Pai Gow Poker Card */}
          <button
            onClick={() => onSelectGame('paigowpoker')}
            className="group glass-strong rounded-3xl p-8 hover:scale-105 transition-all duration-300 hover:ring-4 hover:ring-yellow-400 btn-premium"
          >
            <div className="text-center">
              <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform">
                🀄
              </div>
              <h2 className="text-3xl font-bold player-label text-yellow-400 mb-4">
                PAI GOW
              </h2>
              <p className="text-gray-300 mb-4 text-sm">
                Split 7 cards into HIGH and LOW hands
              </p>
              <div className="text-xs text-gray-400">House Edge: 1.46%</div>
            </div>
          </button>

        </div>

        {/* Info Footer */}
        <div className="text-center mt-12 text-gray-400 text-sm">
          <p className="font-semibold text-lg text-yellow-400 mb-2">🏆 Professional Casino Training Suite</p>
          <p>Master optimal strategies • Track statistics • Practice card counting</p>
          <p className="mt-2">Built with real casino rules and mathematics</p>
        </div>
      </div>

      {/* Profile Settings Modal */}
      <ProfileSettings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        onShowPricing={() => {
          setShowSettings(false);
          setShowPricing(true);
        }}
      />

      {/* Pricing Page */}
      {showPricing && (
        <PricingPage 
          onClose={() => setShowPricing(false)}
          onSelectPlan={(plan) => {
            console.log('Selected plan:', plan);
            setShowPricing(false);
          }}
        />
      )}

      {/* AI Assistant with Greeting */}
      <AIAssistantGreeting />
    </div>
  );
}

export default GameSelector;
