import React from 'react';
import { Spade, Heart, Diamond, Club } from 'lucide-react';

function GameSelector({ onSelectGame }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Casino Logo */}
        <div className="text-center mb-12 fade-in-up">
          <h1 className="text-6xl md:text-7xl font-bold player-label neon-text mb-4">
            ♠ CASINO ROYALE ♥
          </h1>
          <p className="text-xl text-gray-300">Select Your Game</p>
        </div>

        {/* Game Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Blackjack Card */}
          <button
            onClick={() => onSelectGame('blackjack')}
            className="group glass-strong rounded-3xl p-8 hover:scale-105 transition-all duration-300 hover:ring-4 hover:ring-yellow-400 btn-premium"
          >
            <div className="text-center">
              <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform">
                🃏
              </div>
              <h2 className="text-4xl font-bold player-label text-yellow-400 mb-4">
                BLACKJACK
              </h2>
              <p className="text-gray-300 mb-6">
                Classic 21 with training mode, card counting, and strategy hints
              </p>
              <div className="flex justify-center gap-4 text-3xl">
                <span>♠</span>
                <span className="text-red-500">♥</span>
                <span className="text-red-500">♦</span>
                <span>♣</span>
              </div>
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
              <h2 className="text-4xl font-bold player-label text-yellow-400 mb-4">
                BACCARAT
              </h2>
              <p className="text-gray-300 mb-6">
                Player vs Banker with roadmaps, pattern tracking, and side bets
              </p>
              <div className="flex justify-center gap-4 text-3xl">
                <span>♠</span>
                <span className="text-red-500">♥</span>
                <span className="text-red-500">♦</span>
                <span>♣</span>
              </div>
            </div>
          </button>

        </div>

        {/* Info Footer */}
        <div className="text-center mt-12 text-gray-400 text-sm">
          <p>Professional casino training simulator</p>
          <p className="mt-2">Practice strategies • Track statistics • Master the games</p>
        </div>
      </div>
    </div>
  );
}

export default GameSelector;
