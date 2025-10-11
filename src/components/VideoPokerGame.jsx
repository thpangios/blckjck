import React, { useState, useEffect } from 'react';
import { Settings, BarChart3, RotateCcw, Info, X, ArrowLeft, Brain, TrendingUp, Zap } from 'lucide-react';
import { VideoPokerRules } from '../utils/videoPokerRules';
import { VideoPokerStrategy } from '../utils/videoPokerStrategy';

function VideoPokerGame({ onBack }) {
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [held, setHeld] = useState([false, false, false, false, false]);
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(1); // 1-5 coins
  const [gameState, setGameState] = useState('betting'); // betting, dealt, drawing, result
  const [winningHand, setWinningHand] = useState(null);
  const [payout, setPayout] = useState(0);
  const [variant, setVariant] = useState('jacksOrBetter'); // jacksOrBetter, deucesWild, bonusPoker
  
  // Training mode
  const [trainingMode, setTrainingMode] = useState(true);
  const [optimalHold, setOptimalHold] = useState(null);
  const [showStrategy, setShowStrategy] = useState(true);

  // Statistics
  const [stats, setStats] = useState({
    handsPlayed: 0,
    royalFlushes: 0,
    straightFlushes: 0,
    fourOfAKinds: 0,
    fullHouses: 0,
    wins: 0,
    profitLoss: 0
  });

  // UI State
  const [showStats, setShowStats] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [message, setMessage] = useState('Place your bet and deal!');

  // Initialize deck
  useEffect(() => {
    createDeck();
  }, []);

  const createDeck = () => {
    const newDeck = [];
    for (let suit of VideoPokerRules.suits) {
      for (let value of VideoPokerRules.values) {
        newDeck.push({ suit, value, id: `${value}${suit}-${Math.random()}` });
      }
    }
    setDeck(shuffleDeck(newDeck));
  };

  const shuffleDeck = (cards) => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Deal initial hand
  const deal = () => {
    if (balance < bet) {
      setMessage('Insufficient balance!');
      return;
    }

    setBalance(balance - bet);
    
    // Reshuffle if needed
    let currentDeck = deck.length < 10 ? shuffleDeck(createNewDeck()) : [...deck];
    
    const newHand = currentDeck.slice(0, 5);
    setHand(newHand);
    setDeck(currentDeck.slice(5));
    setHeld([false, false, false, false, false]);
    setGameState('dealt');
    setWinningHand(null);
    setPayout(0);
    setMessage('Select cards to hold, then draw');

    // Calculate optimal strategy
    if (trainingMode) {
      const optimal = VideoPokerStrategy.getOptimalHold(newHand, variant, bet);
      setOptimalHold(optimal);
    }
  };

  const createNewDeck = () => {
    const newDeck = [];
    for (let suit of VideoPokerRules.suits) {
      for (let value of VideoPokerRules.values) {
        newDeck.push({ suit, value, id: `${value}${suit}-${Math.random()}` });
      }
    }
    return newDeck;
  };

  // Toggle hold on card
  const toggleHold = (index) => {
    if (gameState !== 'dealt') return;
    
    const newHeld = [...held];
    newHeld[index] = !newHeld[index];
    setHeld(newHeld);
  };

  // Draw (replace non-held cards)
  const draw = () => {
    if (gameState !== 'dealt') return;

    setGameState('drawing');
    setMessage('Drawing...');

    let currentDeck = [...deck];
    const newHand = [...hand];
    
    for (let i = 0; i < 5; i++) {
      if (!held[i]) {
        if (currentDeck.length === 0) {
          currentDeck = shuffleDeck(createNewDeck());
        }
        newHand[i] = currentDeck[0];
        currentDeck = currentDeck.slice(1);
      }
    }

    setHand(newHand);
    setDeck(currentDeck);

    setTimeout(() => {
      evaluateHand(newHand);
    }, 500);
  };

  // Evaluate final hand
  const evaluateHand = (finalHand) => {
    const result = VideoPokerRules.evaluateHand(finalHand, variant);
    const winAmount = VideoPokerRules.getPayout(result, variant, bet);

    setWinningHand(result);
    setPayout(winAmount);
    setBalance(prev => prev + winAmount);
    setGameState('result');

    if (result) {
      setMessage(`${result}! Win ${winAmount} credits`);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        handsPlayed: prev.handsPlayed + 1,
        wins: prev.wins + 1,
        royalFlushes: prev.royalFlushes + (result === 'Royal Flush' ? 1 : 0),
        straightFlushes: prev.straightFlushes + (result === 'Straight Flush' ? 1 : 0),
        fourOfAKinds: prev.fourOfAKinds + (result.includes('Four') ? 1 : 0),
        fullHouses: prev.fullHouses + (result === 'Full House' ? 1 : 0),
        profitLoss: prev.profitLoss + (winAmount - bet)
      }));
    } else {
      setMessage('No winning hand');
      setStats(prev => ({
        ...prev,
        handsPlayed: prev.handsPlayed + 1,
        profitLoss: prev.profitLoss - bet
      }));
    }
  };

  // Max bet shortcut
  const maxBet = () => {
    if (gameState === 'betting' || gameState === 'result') {
      setBet(5);
      setTimeout(() => deal(), 200);
    }
  };

  // Reset game
  const resetGame = () => {
    setBalance(10000);
    setBet(1);
    setGameState('betting');
    setHand([]);
    setHeld([false, false, false, false, false]);
    setWinningHand(null);
    setPayout(0);
    setMessage('Place your bet and deal!');
    setStats({
      handsPlayed: 0,
      royalFlushes: 0,
      straightFlushes: 0,
      fourOfAKinds: 0,
      fullHouses: 0,
      wins: 0,
      profitLoss: 0
    });
    createDeck();
  };

  const paytable = VideoPokerRules.paytables[variant];
  const canDeal = (gameState === 'betting' || gameState === 'result') && balance >= bet;
  const canDraw = gameState === 'dealt';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-4">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 fade-in-up">
        <div className="glass-strong rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-center flex-wrap gap-4">
            
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="glass px-4 py-2 rounded-lg hover:bg-opacity-60 transition-all flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <div className="text-4xl font-bold player-label neon-text">
                🎰 VIDEO POKER
              </div>
            </div>
            
            <div className="flex gap-6 items-center flex-wrap">
              <div className="stat-card p-3 rounded-xl">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Credits</div>
                <div className="text-3xl font-bold text-yellow-400 font-mono">{balance}</div>
              </div>

              <div className="stat-card p-3 rounded-xl">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Bet</div>
                <div className="text-2xl font-bold text-green-400 font-mono">{bet} coin{bet > 1 ? 's' : ''}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPaytable(!showPaytable)}
                  className="glass p-3 rounded-lg hover:bg-opacity-60 transition-all hover:scale-105"
                >
                  <Info size={20} className="text-purple-400" />
                </button>

                <button
                  onClick={() => setShowStats(!showStats)}
                  className="glass p-3 rounded-lg hover:bg-opacity-60 transition-all hover:scale-105"
                >
                  <BarChart3 size={20} className="text-blue-400" />
                </button>

                <button
                  onClick={resetGame}
                  className="glass px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 hover:bg-opacity-40 transition-all"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Game Variant Selector */}
          <div className="mt-4 flex gap-4 items-center justify-center flex-wrap border-t border-gray-700 pt-4">
            <div className="flex gap-2">
              {[
                { id: 'jacksOrBetter', name: 'Jacks or Better' },
                { id: 'deucesWild', name: 'Deuces Wild' },
                { id: 'bonusPoker', name: 'Bonus Poker' }
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => {
                    if (gameState === 'betting' || gameState === 'result') {
                      setVariant(v.id);
                      setMessage('Variant changed! Place your bet.');
                    }
                  }}
                  disabled={gameState !== 'betting' && gameState !== 'result'}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    variant === v.id
                      ? 'bg-purple-600 text-white'
                      : 'glass hover:bg-opacity-60'
                  } ${(gameState !== 'betting' && gameState !== 'result') ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {v.name}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={trainingMode}
                onChange={(e) => setTrainingMode(e.target.checked)}
                className="w-5 h-5 cursor-pointer"
              />
              <Brain size={22} className="text-blue-400 group-hover:text-blue-300" />
              <span className="font-semibold text-lg">Training Mode</span>
            </label>

            {trainingMode && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStrategy}
                  onChange={(e) => setShowStrategy(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm">Show Hints</span>
              </label>
            )}
          </div>

          {/* Strategy Advice */}
          {trainingMode && showStrategy && optimalHold && gameState === 'dealt' && (
            <div className="mt-4 training-overlay rounded-xl p-4 slide-in-top">
              <div className="flex items-start gap-3">
                <TrendingUp size={20} className="text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-bold text-yellow-300 text-lg mb-1">
                    OPTIMAL PLAY: {optimalHold.holdIndices.length === 0 ? 'Draw All 5' : `Hold ${optimalHold.holdIndices.length} card${optimalHold.holdIndices.length > 1 ? 's' : ''}`}
                  </div>
                  <div className="text-sm text-gray-200">{optimalHold.reasoning}</div>
                  <div className="text-xs text-gray-400 mt-1">Expected Value: ~{optimalHold.expectedValue.toFixed(1)} credits</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Screen */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-purple-900 to-purple-950 rounded-3xl shadow-2xl p-8 border-8 border-yellow-800">
          
          {/* Message Display */}
          <div className="text-center mb-8">
            <div className="glass-strong inline-block px-8 py-4 rounded-2xl">
              <p className="text-2xl font-bold text-yellow-300">{message}</p>
            </div>
          </div>

          {/* Cards */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {hand.map((card, index) => (
              <div key={card.id} className="relative">
                {/* Hold Indicator */}
                {held[index] && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full font-bold text-sm pulse-gold">
                    HELD
                  </div>
                )}
                
                {/* Optimal Hold Hint */}
                {trainingMode && showStrategy && optimalHold && gameState === 'dealt' && 
                 optimalHold.holdIndices.includes(index) && !held[index] && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full font-bold text-xs animate-pulse">
                    HOLD
                  </div>
                )}

                <button
                  onClick={() => toggleHold(index)}
                  disabled={gameState !== 'dealt'}
                  className={`transition-all ${
                    held[index] ? 'transform -translate-y-4' : ''
                  } ${gameState === 'dealt' ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                >
                  <PokerCard card={card} />
                </button>
              </div>
            ))}
          </div>

          {/* Win Display */}
          {winningHand && payout > 0 && (
            <div className="text-center mb-8 fade-in-up">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-12 py-6 rounded-2xl inline-block shadow-2xl">
                <div className="text-4xl font-bold mb-2">{winningHand}</div>
                <div className="text-2xl font-mono">WIN: {payout} CREDITS</div>
              </div>
            </div>
          )}

          {/* Bet Controls */}
          {(gameState === 'betting' || gameState === 'result') && (
            <div className="flex justify-center gap-4 mb-6 flex-wrap">
              {[1, 2, 3, 4, 5].map(amount => (
                <button
                  key={amount}
                  onClick={() => setBet(amount)}
                  disabled={balance < amount}
                  className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${
                    bet === amount
                      ? 'bg-yellow-500 text-black ring-4 ring-yellow-300'
                      : 'glass hover:bg-opacity-60'
                  } ${balance < amount ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  {amount} COIN{amount > 1 ? 'S' : ''}
                </button>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            {canDeal && (
              <>
                <button
                  onClick={deal}
                  className="btn-premium glass-strong px-12 py-5 rounded-2xl font-bold text-2xl transition-all hover:bg-green-600 hover:bg-opacity-60 hover:scale-105 shadow-xl"
                >
                  DEAL
                </button>
                <button
                  onClick={maxBet}
                  disabled={balance < 5}
                  className="btn-premium glass-strong px-8 py-5 rounded-2xl font-bold text-xl transition-all hover:bg-purple-600 hover:bg-opacity-60 hover:scale-105 shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap size={24} />
                  MAX BET
                </button>
              </>
            )}

            {canDraw && (
              <button
                onClick={draw}
                className="btn-premium glass-strong px-16 py-6 rounded-2xl font-bold text-3xl transition-all hover:bg-blue-600 hover:bg-opacity-60 hover:scale-105 shadow-2xl pulse-gold"
              >
                DRAW
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Paytable Modal */}
      {showPaytable && (
        <Modal onClose={() => setShowPaytable(false)} title={`PAYTABLE - ${variant.toUpperCase().replace(/([A-Z])/g, ' $1').trim()}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Hand</th>
                  {[1, 2, 3, 4, 5].map(coins => (
                    <th key={coins} className="text-center py-3 px-2">{coins} Coin{coins > 1 ? 's' : ''}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(paytable).map(([hand, payouts]) => (
                  <tr key={hand} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="py-3 px-4 font-semibold">{hand}</td>
                    {payouts.map((payout, i) => (
                      <td key={i} className={`text-center py-3 px-2 font-mono ${i === 4 ? 'text-yellow-400 font-bold' : ''}`}>
                        {payout}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-sm text-gray-400 text-center">
              <p>* 5 coin bet offers best return on Royal Flush</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Statistics Modal */}
      {showStats && (
        <Modal onClose={() => setShowStats(false)} title="VIDEO POKER STATISTICS">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Hands Played" value={stats.handsPlayed} color="gray" />
            <StatCard label="Royal Flushes" value={stats.royalFlushes} color="purple" icon="👑" />
            <StatCard label="Straight Flushes" value={stats.straightFlushes} color="blue" />
            <StatCard label="Four of a Kinds" value={stats.fourOfAKinds} color="green" />
            <StatCard label="Full Houses" value={stats.fullHouses} color="orange" />
            <StatCard label="Wins" value={stats.wins} color="green" />
            <StatCard 
              label="Profit/Loss" 
              value={stats.profitLoss > 0 ? `+${stats.profitLoss}` : stats.profitLoss} 
              color={stats.profitLoss >= 0 ? 'green' : 'red'} 
              className="col-span-2 md:col-span-3"
            />
            <StatCard 
              label="Win Rate" 
              value={stats.handsPlayed > 0 ? `${((stats.wins / stats.handsPlayed) * 100).toFixed(1)}%` : '0%'} 
              color="blue" 
              className="col-span-2 md:col-span-3"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

// Poker Card Component
function PokerCard({ card }) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  
  return (
    <div className="w-32 h-48 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-2xl border-2 border-gray-300 p-4 flex flex-col justify-between transform transition-all card-3d">
      <div className={`text-3xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
        <div className="font-mono">{card.value}</div>
        <div className="text-5xl leading-none">{card.suit}</div>
      </div>
      <div className="text-center text-6xl">
        <div className={isRed ? 'text-red-600' : 'text-black'}>{card.suit}</div>
      </div>
      <div className={`text-3xl font-bold text-right rotate-180 ${isRed ? 'text-red-600' : 'text-black'}`}>
        <div className="font-mono">{card.value}</div>
        <div className="text-5xl leading-none">{card.suit}</div>
      </div>
    </div>
  );
}

// Reusable Components
function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50 fade-in-up">
      <div className="glass-strong rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 glass-strong border-b border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-yellow-400 player-label tracking-wider">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-all hover:scale-110">
            <X size={28} />
          </button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon, className = '' }) {
  const colors = {
    gray: 'from-gray-700 to-gray-800',
    purple: 'from-purple-700 to-purple-900',
    blue: 'from-blue-700 to-blue-900',
    green: 'from-green-700 to-green-900',
    orange: 'from-orange-700 to-orange-900',
    red: 'from-red-700 to-red-900'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-5 shadow-lg hover:scale-105 transition-all ${className}`}>
      <div className="text-gray-300 text-sm uppercase tracking-wider mb-2">{label}</div>
      <div className="text-4xl font-bold font-mono flex items-center gap-2">
        {icon && <span className="text-3xl">{icon}</span>}
        {value}
      </div>
    </div>
  );
}

export default VideoPokerGame;
