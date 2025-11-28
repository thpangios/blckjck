import React, { useState, useEffect } from 'react';
import { Settings, BarChart3, RotateCcw, Info, X, ArrowLeft, Brain } from 'lucide-react';
import { DeckManager } from '../utils/deckManager';
import { BaccaratRules } from '../utils/baccaratRules';
import BaccaratRoadmapDisplay from './BaccaratRoadmapDisplay';
import AICoach from './AICoach';
import { buildGameContext } from '../utils/aiCoachService';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../lib/supabase';
import TrainingLimitBanner from './TrainingLimitBanner';

function BaccaratGame({ onBack }) {
  const [deckManager, setDeckManager] = useState(null);
  const [playerHand, setPlayerHand] = useState([]);
  const [bankerHand, setBankerHand] = useState([]);
  const { user } = useAuth();
  const { incrementTrainingRounds, canPlayTraining } = useSubscription();
  const [trainingMode, setTrainingMode] = useState(false);
const [balance, setBalance] = useState(10000); // Default fallback
const [initialBankroll, setInitialBankroll] = useState(10000);
  const [gameState, setGameState] = useState('betting'); // betting, dealing, reveal, gameOver
  const [message, setMessage] = useState('Place your bets');
  
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

  // Load user's starting bankroll preference
useEffect(() => {
  const loadStartingBankroll = async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('starting_bankroll')
          .eq('id', user.id)
          .single();

        if (data && data.starting_bankroll) {
          setBalance(data.starting_bankroll);
          setInitialBankroll(data.starting_bankroll);
        }
      } catch (error) {
        console.error('Error loading starting bankroll:', error);
      }
    }
  };

  loadStartingBankroll();
}, [user]);

  // Statistics
  const [stats, setStats] = useState({
    handsPlayed: 0,
    playerWins: 0,
    bankerWins: 0,
    ties: 0,
    profitLoss: 0
  });

  // Roadmap (all results history)
  const [roadmap, setRoadmap] = useState([]);
  
  // Commission tracking
  const [pendingCommission, setPendingCommission] = useState(0);

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

    const currentTotal = playerBet + bankerBet + tieBet + playerPairBet + bankerPairBet;

    switch(betType) {
      case 'player':
        if (currentTotal - playerBet + amount <= balance) {
          setPlayerBet(playerBet + amount);
        }
        break;
      case 'banker':
        if (currentTotal - bankerBet + amount <= balance) {
          setBankerBet(bankerBet + amount);
        }
        break;
      case 'tie':
        if (currentTotal - tieBet + amount <= balance) {
          setTieBet(tieBet + amount);
        }
        break;
      case 'playerPair':
        if (currentTotal - playerPairBet + amount <= balance) {
          setPlayerPairBet(playerPairBet + amount);
        }
        break;
      case 'bankerPair':
        if (currentTotal - bankerPairBet + amount <= balance) {
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
    const totalBet = playerBet + bankerBet + tieBet + playerPairBet + bankerPairBet;
    
    if (totalBet === 0) {
      setMessage('Place at least one bet!');
      return;
    }

    if (balance < totalBet) {
      setMessage('Insufficient balance!');
      return;
    }

    // Deduct bets from balance
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
        setPlayerTotal(BaccaratRules.calculateHandValue(finalPlayerHand));
        setMessage('Player draws third card');
      }

      setTimeout(() => {
        const playerThirdCard = finalPlayerHand.length === 3 ? finalPlayerHand[2] : null;
        const shouldBankerDraw = BaccaratRules.bankerDraws(bTotal, playerThirdCard);

        if (shouldBankerDraw) {
          const bankerThird = deckManager.dealCard();
          finalBankerHand = [...bHand, bankerThird];
          setBankerHand(finalBankerHand);
          setBankerTotal(BaccaratRules.calculateHandValue(finalBankerHand));
          setMessage('Banker draws third card');
        }

        setTimeout(() => {
          resolveHand(finalPlayerHand, finalBankerHand);
        }, 1000);
      }, needsCard.player ? 1000 : 0);
    }, 500);
  };

  // Resolve hand and pay out
  const resolveHand = async (finalPlayerHand, finalBankerHand) => {
    const pTotal = BaccaratRules.calculateHandValue(finalPlayerHand);
    const bTotal = BaccaratRules.calculateHandValue(finalBankerHand);

    setPlayerTotal(pTotal);
    setBankerTotal(bTotal);

    const result = BaccaratRules.determineWinner(pTotal, bTotal);
    setWinner(result);

    // Add to roadmap
    setRoadmap(prev => [...prev, result]);

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
      const bankerPayout = bankerBet * 2 * 0.95; // 1:1 minus 5% commission
      const commission = bankerBet * 2 * 0.05;
      winnings += bankerPayout;
      setPendingCommission(prev => prev + commission);
      resultMsg = 'Banker wins!';
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

    setMessage(resultMsg);
    setGameState('gameOver');

    if (trainingMode) {
      await incrementTrainingRounds('baccarat');
    }
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
  setBalance(initialBankroll); // Use saved preference instead of hardcoded value
    setStats({
      handsPlayed: 0,
      playerWins: 0,
      bankerWins: 0,
      ties: 0,
      profitLoss: 0
    });
    setRoadmap([]);
    setPendingCommission(0);
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
      {trainingMode && (
        <div className="max-w-7xl mx-auto">
          <TrainingLimitBanner />
        </div>
      )}
      
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

          {/* Training Mode Toggle */}
          <div className="mt-4 flex gap-4 items-center justify-center flex-wrap border-t border-gray-700 pt-4">
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
          </div>
        </div>
      </div>

      {/* Roadmap Display */}
      <div className="max-w-7xl mx-auto mb-6 fade-in-up">
        <BaccaratRoadmapDisplay results={roadmap} pendingCommission={pendingCommission} />
      </div>

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
              value={`$${stats.profitLoss > 0 ? '+' : ''}${stats.profitLoss.toFixed(2)}`} 
              color={stats.profitLoss >= 0 ? 'green' : 'red'} 
              className="col-span-2"
            />
            {stats.handsPlayed > 0 && (
              <>
                <StatCard 
                  label="Banker %" 
                  value={`${((stats.bankerWins / stats.handsPlayed) * 100).toFixed(1)}%`} 
                  color="red" 
                />
                <StatCard 
                  label="Player %" 
                  value={`${((stats.playerWins / stats.handsPlayed) * 100).toFixed(1)}%`} 
                  color="blue" 
                />
                <StatCard 
                  label="Tie %" 
                  value={`${((stats.ties / stats.handsPlayed) * 100).toFixed(1)}%`} 
                  color="green" 
                />
              </>
            )}
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
                <li>Total is the last digit (e.g., 15 = 5)</li>
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
                <li>All drawing is automatic - no player decisions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">House Edge</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Banker: 1.06% (best bet)</li>
                <li>Player: 1.24%</li>
                <li>Tie: 14.36% (avoid!)</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
            {/* AI Strategy Coach */}
      <AICoach 
        game="baccarat"
        gameState={{
          playerHand,
          bankerHand,
          playerTotal,
          bankerTotal,
          roadmap,
          playerBet,
          bankerBet,
          tieBet,
          gameState,
          balance
        }}
        visible={true}
      />
    </div>
  );
}

// RoyalEdge Playing Card Component - Baccarat
function BaccaratCard({ card }) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  
  return (
    <div
      className="card-face w-28 h-40 rounded-xl relative overflow-hidden border border-neutral-300 bg-gradient-to-br from-neutral-50 to-neutral-100 shadow-[0_8px_12px_rgba(0,0,0,0.25)]
        transform-gpu transition-transform duration-200 hover:-translate-y-1 hover:rotate-[0.5deg] hover:shadow-[0_12px_18px_rgba(0,0,0,0.35)]"
    >
      {/* Subtle highlight gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-transparent pointer-events-none" />
      {/* Light sheen bar */}
      <div className="absolute top-0 left-0 w-[55%] h-full bg-gradient-to-r from-white/10 to-transparent opacity-40" />
      {/* Inner gold edge for premium look */}
      <div className="absolute inset-[3px] rounded-lg border border-yellow-400/30" />
      {/* Content Layer */}
      <div className="relative flex flex-col justify-between h-full p-2 pb-3">
        {/* Top corner */}
        <div
          className={`text-lg font-semibold font-[Inter] leading-tight tracking-tight ${
            isRed ? 'text-red-600' : 'text-gray-800'
          }`}
        >
          <div>{card.value}</div>
          <div className="text-2xl leading-none mt-[2px]">{card.suit}</div>
        </div>
        {/* Center emblem */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className={`text-5xl drop-shadow-sm ${
              isRed ? 'text-red-600' : 'text-gray-800'
            }`}
          >
            {card.suit}
          </div>
        </div>
        {/* Bottom corner (mirrored and visible) */}
        <div
          className={`text-lg font-semibold font-[Inter] leading-tight tracking-tight text-right rotate-180 ${
            isRed ? 'text-red-600' : 'text-gray-800'
          }`}
        >
          <div>{card.value}</div>
          <div className="text-2xl leading-none mt-[2px]">{card.suit}</div>
        </div>
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
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-6 text-center ${small ? '' : 'min-h-[200px]'} flex flex-col justify-between transition-all hover:scale-105`}>
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
    <div 
      className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50 fade-in-up"
      onClick={onClose}
    >
      <div 
        className="glass-strong rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
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
