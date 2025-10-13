import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import AIAssistantGreeting from './AIAssistantGreeting';
import { LogOut, Settings } from 'lucide-react';

function GameSelector({ onSelectGame }) {
  const { signOut, user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

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
    <p className="text-gray-400 text-sm">Welcome back!</p>
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
/>

{/* AI Assistant with Greeting */}
<AIAssistantGreeting />
    </div>
  );
}

export default GameSelector;
