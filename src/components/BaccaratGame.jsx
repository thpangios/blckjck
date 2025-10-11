import React, { useState, useEffect } from 'react';
import { Settings, BarChart3, RotateCcw, Info, X, ArrowLeft } from 'lucide-react';
import { DeckManager } from '../utils/deckManager';
import { BaccaratRules } from '../utils/baccaratRules';
import { BaccaratAnalytics } from '../utils/baccaratAnalytics';
import BaccaratRoadmaps from './BaccaratRoadmaps';
import BaccaratStats from './BaccaratStats';

function BaccaratGame({ onBack }) {
  const [deckManager, setDeckManager] = useState(null);
  const [playerHand, setPlayerHand] = useState([]);
  const [bankerHand, setBankerHand] = useState([]);
  const [balance, setBalance] = useState(10000);
  const [gameState, setGameState] = useState('betting'); // betting, dealing, reveal, gameOver
  const [message, setMessage] = useState('Place your bets');
  const [analytics] = useState(new BaccaratAnalytics());
const [commissionOwed, setCommissionOwed] = useState(0);
  
  // Bets
  const [playerBet, setPlayerBet] = useState(0);
  const [bankerBet, setBankerBet] = useState(0);
  const [tieBet, setTieBet] = useState(0);
  const [playerPairBet, setPlayerPairBet] = useState(0);
  const [bankerPairBet, setBankerPairBet] = useState(0);

  // Game results
  const [winner, setWinner] = useState(null);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [bankerTotal, setBankerTotal] = useState(0);

  // Statistics
  const [stats, setStats] = useState({
    handsPlayed: 0,
    playerWins: 0,
    bankerWins: 0,
    ties: 0,
    profitLoss: 0
  });

  // Roadmap (last 20 results)
  const [roadmap, setRoadmap] = useState([]);

  // UI State
  const [showStats, setShowStats] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Initialize deck
  useEffect(() => {
    const dm = new DeckManager(8, 0.85); // 8-deck shoe, 85% penetration
    setDeckManager(dm);
  }, []);

  // Place bet
  const placeBet = (betType, amount) => {
    if (balance < amount || gameState !== 'betting') return;

    switch(betType) {
      case 'player':
        if (playerBet + amount <= balance - bankerBet - tieBet - playerPairBet - bankerPairBet) {
          setPlayerBet(playerBet + amount);
        }
        break;
      case 'banker':
        if (bankerBet + amount <= balance - playerBet - tieBet - playerPairBet - bankerPairBet) {
          setBankerBet(bankerBet + amount);
        }
        break;
      case 'tie':
        if (tieBet + amount <= balance - playerBet - bankerBet - playerPairBet - bankerPairBet) {
          setTieBet(tieBet + amount);
        }
        break;
      case 'playerPair':
        if (playerPairBet + amount <= balance - playerBet - bankerBet - tieBet - bankerPairBet) {
          setPlayerPairBet(playerPairBet + amount);
        }
        break;
      case 'bankerPair':
        if (bankerPairBet + amount <= balance - playerBet - bankerBet - tieBet - playerPairBet) {
          setBankerPairBet(bankerPairBet + amount);
        }
        break;
    }
  };

  // Clear all bets
  const clearBets = () => {
    if (gameState === 'betting') {
      setPlayerBet(0);
      setBankerBet(0);
      setTieBet(0);
      setPlayerPairBet(0);
      setBankerPairBet(0);
    }
  };

  // Deal cards
  const deal = () => {
    if (playerBet === 0 && bankerBet === 0 && tieBet === 0) {
      setMessage('Place at least one bet!');
      return;
    }

    // Deduct bets from balance
    const totalBet = playerBet + bankerBet + tieBet + playerPairBet + bankerPairBet;
    setBalance(balance - totalBet);

    setGameState('dealing');
    setMessage('Dealing...');

    // Deal initial 4 cards (player, banker, player, banker)
    const card1 = deckManager.dealCard();
    const card2 = deckManager.dealCard();
    const card3 = deckManager.dealCard();
    const card4 = deckManager.dealCard();

    setPlayerHand([card1, card3]);
    setBankerHand([card2, card4]);

    setTimeout(() => {
      const pTotal = BaccaratRules.calculateHandValue([card1, card3]);
      const bTotal = BaccaratRules.calculateHandValue([card2, card4]);
      
      setPlayerTotal(pTotal);
      setBankerTotal(bTotal);

      // Check for naturals (8 or 9)
      if (BaccaratRules.isNatural(pTotal) || BaccaratRules.isNatural(bTotal)) {
        setMessage('Natural!');
        setTimeout(() => resolveHand([card1, card3], [card2, card4]), 1500);
      } else {
        // Check third card rules
        drawThirdCards([card1, card3], [card2, card4]);
      }
    }, 1000);
  };

  // Draw third cards according to rules
  const drawThirdCards = (pHand, bHand) => {
    const pTotal = BaccaratRules.calculateHandValue(pHand);
    const bTotal = BaccaratRules.calculateHandValue(bHand);

    const needsCard = BaccaratRules.needsThirdCard(pTotal, bTotal, pHand, bHand);

    setTimeout(() => {
      let finalPlayerHand = [...pHand];
      let finalBankerHand = [...bHand];

      if (needsCard.player) {
        const playerThird = deckManager.dealCard();
        finalPlayerHand = [...pHand, playerThird];
        setPlayerHand(finalPlayerHand);
        setMessage('Player draws third card');
      }

      setTimeout(() => {
        const playerThirdCard = finalPlayerHand.length === 3 ? finalPlayerHand[2] : null;
        const shouldBankerDraw = BaccaratRules.bankerDraws(bTotal, playerThirdCard);

        if (shouldBankerDraw) {
          const bankerThird = deckManager.dealCard();
          finalBankerHand = [...bHand, bankerThird];
          setBankerHand(finalBankerHand);
          setMessage('Banker draws third card');
        }

        setTimeout(() => {
          resolveHand(finalPlayerHand, finalBankerHand);
        }, 1000);
      }, needsCard.player ? 1000 : 0);
    }, 500);
  };

// Resolve hand and pay out
  const resolveHand = (finalPlayerHand, finalBankerHand) => {
    const pTotal = BaccaratRules.calculateHandValue(finalPlayerHand);
    const bTotal = BaccaratRules.calculateHandValue(finalBankerHand);

    setPlayerTotal(pTotal);
    setBankerTotal(bTotal);

    const result = BaccaratRules.determineWinner(pTotal, bTotal);
    setWinner(result);

    // ✨ ADD THIS: Track analytics
    const isNatural = (pTotal === 8 || pTotal === 9 || bTotal === 8 || bTotal === 9) && 
                      finalPlayerHand.length === 2 && finalBankerHand.length === 2;
    analytics.addResult(result, pTotal, bTotal, isNatural);

    let winnings = 0;
    let resultMsg = '';

    // Main bets
    if (result === 'player') {
      winnings += playerBet * 2; // 1:1 payout
      resultMsg = 'Player wins!';
      setStats(prev => ({
        ...prev,
        playerWins: prev.playerWins + 1
      }));
    } else if (result === 'banker') {
      winnings += bankerBet * 2 * 0.95; // 1:1 minus 5% commission
      resultMsg = 'Banker wins!';
      // ✨ ADD THIS: Track commission
      if (bankerBet > 0) {
        const commission = Math.round(bankerBet * 0.05);
        setCommissionOwed(prev => prev + commission);
      }
      setStats(prev => ({
        ...prev,
        bankerWins: prev.bankerWins + 1
      }));
    } else {
      winnings += playerBet + bankerBet; // Return main bets on tie
      winnings += tieBet * 9; // 8:1 payout on tie
      resultMsg = 'Tie!';
      setStats(prev => ({
        ...prev,
        ties: prev.ties + 1
      }));
    }

    // Side bets
    if (BaccaratRules.isPair(finalPlayerHand) && playerPairBet > 0) {
      winnings += playerPairBet * 12; // 11:1 payout
      resultMsg += ' Player Pair!';
    }

    if (BaccaratRules.isPair(finalBankerHand) && bankerPairBet > 0) {
      winnings += bankerPairBet * 12; // 11:1 payout
      resultMsg += ' Banker Pair!';
    }

    setBalance(prev => prev + winnings);

    const totalBet = playerBet + bankerBet + tieBet + playerPairBet + bankerPairBet;
    const profit = winnings - totalBet;

    setStats(prev => ({
      ...prev,
      handsPlayed: prev.handsPlayed + 1,
      profitLoss: prev.profitLoss + profit
    }));

    // Add to roadmap
    setRoadmap(prev => [...prev, result].slice(-20));

    setMessage(resultMsg);
    setGameState('gameOver');
  };

  // New round
  const newRound = () => {
    setPlayerHand([]);
    setBankerHand([]);
    setPlayerBet(0);
    setBankerBet(0);
    setTieBet(0);
    setPlayerPairBet(0);
    setBankerPairBet(0);
    setWinner(null);
    setPlayerTotal(0);
    setBankerTotal(0);
    setGameState('betting');
    setMessage('Place your bets');
  };

  // Reset game
  const resetGame = () => {
    setBalance(10000);
    setStats({
      handsPlayed: 0,
      playerWins: 0,
      bankerWins: 0,
      ties: 0,
      profitLoss: 0
    });
    setRoadmap([]);
    if (deckManager) {
      deckManager.initialize();
    }
    newRound();
  };

  if (!deckManager) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  const totalBet = playerBet + bankerBet + tieBet + playerPairBet + bankerPairBet;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black text-white p-4">
      
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
                🎰 BACCARAT
              </div>
            </div>
            
            <div className="flex gap-6 items-center flex-wrap">
              <div className="stat-card p-3 rounded-xl">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Balance</div>
                <div className="text-3xl font-bold text-yellow-400 font-mono">${balance}</div>
              </div>

              <div className="stat-card p-3 rounded-xl">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Total Bet</div>
                <div className="text-2xl font-bold text-green-400 font-mono">${totalBet}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="glass p-3 rounded-lg hover:bg-opacity-60 transition-all hover:scale-105"
                >
                  <BarChart3 size={20} className="text-blue-400" />
                </button>

                <button
                  onClick={() => setShowRules(!showRules)}
                  className="glass p-3 rounded-lg hover:bg-opacity-60 transition-all hover:scale-105"
                >
                  <Info size={20} className="text-purple-400" />
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

          {/* Roadmap */}
          {roadmap.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Last 20 Results</div>
              <div className="flex gap-2 flex-wrap">
                {roadmap.map((result, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      result === 'player' ? 'bg-blue-600' :
                      result === 'banker' ? 'bg-red-600' :
                      'bg-green-600'
                    }`}
                  >
                    {result === 'player' ? 'P' : result === 'banker' ? 'B' : 'T'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ✨ ADD THIS ENTIRE SECTION */}
      {/* Analytics Dashboard */}
      <div className="max-w-7xl mx-auto mb-6 grid md:grid-cols-2 gap-6">
        {/* Roadmaps */}
        <div className="fade-in-up">
          <BaccaratRoadmaps analytics={analytics} />
        </div>

        {/* Statistics */}
        <div className="fade-in-up">
          <BaccaratStats analytics={analytics} />
        </div>
      </div>

      {/* Commission Tracker */}
      {commissionOwed > 0 && (
        <div className="max-w-7xl mx-auto mb-6 fade-in-up">
          <div className="bg-orange-900 bg-opacity-30 border border-orange-500 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💰</div>
              <div>
                <div className="font-bold text-orange-400">Commission Owed</div>
                <div className="text-sm text-gray-300">5% on Banker wins</div>
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-400 font-mono">
              ${commissionOwed}
            </div>
          </div>
        </div>
      )}
      {/* ✨ END OF NEW SECTION */}
      {/* Game Table */}
      <div className="max-w-7xl mx-auto">
        <div className="felt-texture table-border rounded-[3rem] shadow-2xl p-12 relative">
          
          {/* Banker Section */}
          <div className="mb-12">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold player-label text-red-400 mb-3 tracking-widest">BANKER</h2>
              {bankerHand.length > 0 && (
                <div className="glass inline-block px-6 py-3 rounded-full">
                  <span className="text-3xl font-bold font-mono">{bankerTotal}</span>
                  {winner === 'banker' && <span className="ml-3 text-yellow-400">👑 WINNER</span>}
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-3 flex-wrap">
              {bankerHand.map((card, index) => (
                <div key={card.id} className="card-deal" style={{animationDelay: `${index * 0.2}s`}}>
                  <BaccaratCard card={card} />
                </div>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="text-center my-10">
            <div className="glass-strong inline-block px-10 py-5 rounded-2xl">
              <p className="text-3xl font-bold text-yellow-300 tracking-wide">{message}</p>
            </div>
          </div>

          {/* Player Section */}
          <div className="mb-12">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold player-label text-blue-400 mb-3 tracking-widest">PLAYER</h2>
              {playerHand.length > 0 && (
                <div className="glass inline-block px-6 py-3 rounded-full">
                  <span className="text-3xl font-bold font-mono">{playerTotal}</span>
                  {winner === 'player' && <span className="ml-3 text-yellow-400">👑 WINNER</span>}
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-3 flex-wrap">
              {playerHand.map((card, index) => (
                <div key={card.id} className="card-deal" style={{animationDelay: `${index * 0.2}s`}}>
                  <BaccaratCard card={card} />
                </div>
              ))}
            </div>
          </div>

          {/* Betting Area */}
          {gameState === 'betting' && (
            <div className="mt-12 fade-in-up">
              <div className="glass-strong rounded-2xl p-8 max-w-5xl mx-auto">
                
                {/* Main Bets */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <BettingSpot
                    title="PLAYER"
                    subtitle="Pays 1:1"
                    amount={playerBet}
                    color="blue"
                    onBet={(amt) => placeBet('player', amt)}
                  />
                  <BettingSpot
                    title="TIE"
                    subtitle="Pays 8:1"
                    amount={tieBet}
                    color="green"
                    onBet={(amt) => placeBet('tie', amt)}
                  />
                  <BettingSpot
                    title="BANKER"
                    subtitle="Pays 0.95:1"
                    amount={bankerBet}
                    color="red"
                    onBet={(amt) => placeBet('banker', amt)}
                  />
                </div>

                {/* Side Bets */}
                <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
                  <BettingSpot
                    title="PLAYER PAIR"
                    subtitle="Pays 11:1"
                    amount={playerPairBet}
                    color="purple"
                    onBet={(amt) => placeBet('playerPair', amt)}
                    small
                  />
                  <BettingSpot
                    title="BANKER PAIR"
                    subtitle="Pays 11:1"
                    amount={bankerPairBet}
                    color="orange"
                    onBet={(amt) => placeBet('bankerPair', amt)}
                    small
                  />
                </div>

                {/* Chips */}
                <div className="flex justify-center gap-4 flex-wrap mb-6">
                  {[10, 25, 50, 100, 500, 1000].map((amount, index) => (
                    <div
                      key={amount}
                      className="chip-animate"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <Chip amount={amount} />
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 flex-wrap">
                  <button
                    onClick={clearBets}
                    className="btn-premium glass px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:bg-red-600 hover:bg-opacity-60 hover:scale-105"
                  >
                    CLEAR BETS
                  </button>
                  <button
                    onClick={deal}
                    disabled={totalBet === 0}
                    className="btn-premium glass-strong px-12 py-4 rounded-2xl font-bold text-2xl transition-all hover:bg-green-600 hover:bg-opacity-60 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed pulse-gold"
                  >
                    DEAL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* New Round Button */}
          {gameState === 'gameOver' && (
            <div className="mt-10 text-center fade-in-up">
              <button
                onClick={newRound}
                className="btn-premium glass-strong px-16 py-6 rounded-2xl font-bold text-3xl transition-all hover:bg-green-600 hover:bg-opacity-60 hover:scale-105 shadow-2xl pulse-gold"
              >
                NEW ROUND
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Modal */}
      {showStats && (
        <Modal onClose={() => setShowStats(false)} title="BACCARAT STATISTICS">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Hands Played" value={stats.handsPlayed} color="gray" />
            <StatCard label="Player Wins" value={stats.playerWins} color="blue" />
            <StatCard label="Banker Wins" value={stats.bankerWins} color="red" />
            <StatCard label="Ties" value={stats.ties} color="green" />
            <StatCard 
              label="Profit/Loss" 
              value={`$${stats.profitLoss > 0 ? '+' : ''}${stats.profitLoss}`} 
              color={stats.profitLoss >= 0 ? 'green' : 'red'} 
              className="col-span-2"
            />
          </div>
        </Modal>
      )}

      {/* Rules Modal */}
      {showRules && (
        <Modal onClose={() => setShowRules(false)} title="BACCARAT RULES">
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">Objective</h3>
              <p>Bet on which hand (Player or Banker) will have a total closest to 9</p>
            </div>
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">Card Values</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Aces = 1 point</li>
                <li>2-9 = Face value</li>
                <li>10, J, Q, K = 0 points</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">Payouts</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Player bet: 1:1</li>
                <li>Banker bet: 0.95:1 (5% commission)</li>
                <li>Tie bet: 8:1</li>
                <li>Player/Banker Pair: 11:1</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">Third Card Rules</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Player draws on 0-5, stands on 6-7</li>
                <li>Banker follows complex rules based on player's third card</li>
                <li>Naturals (8 or 9) = no more cards drawn</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Baccarat Card Component
function BaccaratCard({ card }) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  
  return (
    <div className="w-28 h-40 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-2xl border-2 border-gray-300 p-3 flex flex-col justify-between transform transition-all hover:scale-105 card-3d">
      <div className={`text-2xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
        <div className="font-mono">{card.value}</div>
        <div className="text-4xl leading-none">{card.suit}</div>
      </div>
      <div className="text-center text-5xl">
        <div className={isRed ? 'text-red-600' : 'text-black'}>{card.suit}</div>
      </div>
      <div className={`text-2xl font-bold text-right rotate-180 ${isRed ? 'text-red-600' : 'text-black'}`}>
        <div className="font-mono">{card.value}</div>
        <div className="text-4xl leading-none">{card.suit}</div>
      </div>
    </div>
  );
}

// Betting Spot Component
function BettingSpot({ title, subtitle, amount, color, onBet, small = false }) {
  const colors = {
    blue: 'from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800',
    red: 'from-red-700 to-red-900 hover:from-red-600 hover:to-red-800',
    green: 'from-green-700 to-green-900 hover:from-green-600 hover:to-green-800',
    purple: 'from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800',
    orange: 'from-orange-700 to-orange-900 hover:from-orange-600 hover:to-orange-800'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-6 text-center ${small ? '' : 'min-h-[200px]'} flex flex-col justify-between`}>
      <div>
        <h3 className="text-2xl font-bold player-label mb-2">{title}</h3>
        <p className="text-sm text-gray-300">{subtitle}</p>
      </div>
      {amount > 0 && (
        <div className="my-4">
          <div className="text-4xl font-bold font-mono text-yellow-400">${amount}</div>
        </div>
      )}
      <div className="flex gap-2 justify-center flex-wrap">
        {[10, 25, 50, 100].map(amt => (
          <button
            key={amt}
            onClick={() => onBet(amt)}
            className="glass px-3 py-1 rounded-lg text-sm font-semibold hover:bg-white hover:bg-opacity-20 transition-all"
          >
            +${amt}
          </button>
        ))}
      </div>
    </div>
  );
}

// Chip Component
function Chip({ amount }) {
  const colors = {
    10: 'bg-white text-black border-gray-400',
    25: 'bg-red-600 border-red-800 text-white',
    50: 'bg-blue-600 border-blue-800 text-white',
    100: 'bg-black text-yellow-400 border-yellow-600',
    500: 'bg-purple-700 border-purple-900 text-white',
    1000: 'bg-orange-600 border-orange-800 text-white'
  };

  return (
    <div className={`w-20 h-20 rounded-full border-4 font-bold text-lg transition-all hover:scale-110 chip-glow flex items-center justify-center cursor-default ${colors[amount]}`}>
      ${amount}
    </div>
  );
}

// Modal Component (reusable)
function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50 fade-in-up">
      <div className="glass-strong rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 glass-strong border-b border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-yellow-400 player-label tracking-wider">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all hover:scale-110"
          >
            <X size={28} />
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

// Stat Card
function StatCard({ label, value, color, className = '' }) {
  const colors = {
    gray: 'from-gray-700 to-gray-800',
    blue: 'from-blue-700 to-blue-900',
    red: 'from-red-700 to-red-900',
    green: 'from-green-700 to-green-900'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-5 shadow-lg hover:scale-105 transition-all ${className}`}>
      <div className="text-gray-300 text-sm uppercase tracking-wider mb-2">{label}</div>
      <div className="text-4xl font-bold font-mono">{value}</div>
    </div>
  );
}

export default BaccaratGame;
