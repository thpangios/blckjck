import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import GameSelector from './components/GameSelector';
import BlackjackGame from './components/BlackjackGame';
import BaccaratGame from './components/BaccaratGame';
import VideoPokerGame from './components/VideoPokerGame';
import PaiGowPokerGame from './components/PaiGowPokerGame';
import SuccessPage from './components/SuccessPage'; // ✅ Step 1: integrated

function AppContent() {
  const { user, loading } = useAuth();
  const [selectedGame, setSelectedGame] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [postLoginTransition, setPostLoginTransition] = useState(false); // ✅ Step 3: controls welcome/loading phase

  // Simulated short welcome delay after login
  useEffect(() => {
    if (user) {
      setPostLoginTransition(true);
      const timer = setTimeout(() => {
        setPostLoginTransition(false);
      }, 1200); // 1.2s welcome pause
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl animate-bounce">♠</span>
            <span className="text-4xl animate-bounce text-red-500" style={{ animationDelay: '0.1s' }}>♥</span>
            <span className="text-4xl animate-bounce text-red-500" style={{ animationDelay: '0.2s' }}>♦</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>♣</span>
          </div>
          <p className="text-white text-xl font-bold">Loading Ace Edge...</p>
        </div>
      </div>
    );
  }

  // Not logged in and landing screen visible
  if (!user && showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  // Not logged in but landing dismissed → show auth page
  if (!user) {
    return <AuthPage />;
  }

  // ✅ Post-login short transition before showing games
  if (postLoginTransition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <p className="text-2xl font-bold text-white mb-2">Welcome back!</p>
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ✅ Step 1: Stripe success page handling
  if (selectedGame === 'success') {
    return <SuccessPage onBack={() => setSelectedGame(null)} />;
  }

  // Game rendering
  if (selectedGame === 'blackjack') {
    return <BlackjackGame onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'baccarat') {
    return <BaccaratGame onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'videopoker') {
    return <VideoPokerGame onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'paigowpoker') {
    return <PaiGowPokerGame onBack={() => setSelectedGame(null)} />;
  }

  // Default view (after login)
  return <GameSelector onSelectGame={setSelectedGame} />;
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
