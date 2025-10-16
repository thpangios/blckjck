// /src/App.jsx
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

// Components
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import GameSelector from './components/GameSelector';
import BlackjackGame from './components/BlackjackGame';
import BaccaratGame from './components/BaccaratGame';
import VideoPokerGame from './components/VideoPokerGame';
import PaiGowPokerGame from './components/PaiGowPokerGame';
import SuccessPage from './components/SuccessPage';
import HandAnalyzer from './components/HandAnalyzer'; // ✅ NEW IMPORT

function AppContent() {
  const { user, loading } = useAuth();
  const [selectedGame, setSelectedGame] = useState(null);
  const [showLanding, setShowLanding] = useState(true);

  // 🔄 Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl animate-bounce">♠</span>
            <span
              className="text-4xl animate-bounce text-red-500"
              style={{ animationDelay: '0.1s' }}
            >
              ♥
            </span>
            <span
              className="text-4xl animate-bounce text-red-500"
              style={{ animationDelay: '0.2s' }}
            >
              ♦
            </span>
            <span
              className="text-4xl animate-bounce"
              style={{ animationDelay: '0.3s' }}
            >
              ♣
            </span>
          </div>
          <p className="text-white text-xl font-bold">Loading Ace Edge...</p>
        </div>
      </div>
    );
  }

  // 🏠 Show landing page if not logged in and not yet dismissed
  if (!user && showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  // 🔐 Show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  // 🃏 Show game pages based on selectedGame
  switch (selectedGame) {
    case 'blackjack':
      return <BlackjackGame onBack={() => setSelectedGame(null)} />;
    case 'baccarat':
      return <BaccaratGame onBack={() => setSelectedGame(null)} />;
    case 'videopoker':
      return <VideoPokerGame onBack={() => setSelectedGame(null)} />;
    case 'paigowpoker':
      return <PaiGowPokerGame onBack={() => setSelectedGame(null)} />;
    case 'success':
      return <SuccessPage onBack={() => setSelectedGame(null)} />;
    case 'handanalyzer': // ✅ NEW ROUTE FOR HAND ANALYZER
      return <HandAnalyzer onBack={() => setSelectedGame(null)} />;
    default:
      return <GameSelector onSelectGame={setSelectedGame} />;
  }
}

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <AppContent />
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
