import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import GameSelector from './components/GameSelector';
import BlackjackGame from './components/BlackjackGame';
import BaccaratGame from './components/BaccaratGame';
import VideoPokerGame from './components/VideoPokerGame';
import PaiGowPokerGame from './components/PaiGowPokerGame';

function AppContent() {
  const { user, loading } = useAuth();
  const [selectedGame, setSelectedGame] = React.useState(null);

  // Show loading while checking auth
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
          <p className="text-white text-xl font-bold">Loading Casino Royale...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  // Show games if logged in
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

  return <GameSelector onSelectGame={setSelectedGame} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
