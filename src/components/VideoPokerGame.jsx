import React, { useState, useEffect } from 'react';
import { Settings, BarChart3, RotateCcw, Info, X, ArrowLeft, Brain, TrendingUp, Zap, Calculator } from 'lucide-react';
import { VideoPokerRules } from '../utils/videoPokerRules';
import { VideoPokerStrategy } from '../utils/videoPokerStrategy';
import AICoach from './AICoach';
import { buildGameContext } from '../utils/aiCoachService';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../lib/supabase';
import TrainingLimitBanner from './TrainingLimitBanner';

function VideoPokerGame({ onBack }) {
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [held, setHeld] = useState([false, false, false, false, false]);
  const { user } = useAuth();
  const { incrementTrainingRounds, canPlayTraining } = useSubscription();
const [balance, setBalance] = useState(10000); // Default fallback
const [initialBankroll, setInitialBankroll] = useState(10000);
  const [bet, setBet] = useState(5); // Default to max bet
  const [gameState, setGameState] = useState('betting');
  const [winningHand, setWinningHand] = useState(null);
  const [payout, setPayout] = useState(0);
  const [variant, setVariant] = useState('jacksOrBetter');
  
  // Training mode
  const [trainingMode, setTrainingMode] = useState(true);
  const [optimalHold, setOptimalHold] = useState(null);
  const [showStrategy, setShowStrategy] = useState(true);
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [calculating, setCalculating] = useState(false);

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
    royalFlushes: 0,
    straightFlushes: 0,
    fourOfAKinds: 0,
    fullHouses: 0,
    flushes: 0,
    straights: 0,
    wins: 0,
    optimalPlays: 0,
    totalDecisions: 0,
    profitLoss: 0
  });

  // UI State
  const [showStats, setShowStats] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [message, setMessage] = useState('Bet MAX and deal for best odds!');
  const [lastDecision, setLastDecision] = useState(null);

  useEffect(() => {
    createDeck();
  }, []);

  const createDeck = () => {
    const newDeck = VideoPokerRules.createDeck();
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

  const deal = async () => {
    if (balance < bet) {
      setMessage('Insufficient balance!');
      return;
    }

    setBalance(balance - bet);
    
    let currentDeck = deck.length < 10 ? shuffleDeck(VideoPokerRules.createDeck()) : [...deck];
    
    const newHand = currentDeck.slice(0, 5);
    setHand(newHand);
    setDeck(currentDeck.slice(5));
    setHeld([false, false, false, false, false]);
    setGameState('dealt');
    setWinningHand(null);
    setPayout(0);
    setMessage('Select cards to hold, then draw');
    setLastDecision(null);

    // Calculate optimal strategy
    if (trainingMode) {
      setCalculating(true);
      setMessage('Analyzing optimal strategy...');
      
      // Use setTimeout to allow UI to update
      setTimeout(() => {
        const optimal = VideoPokerStrategy.getOptimalHold(newHand, variant, bet);
        setOptimalHold(optimal);
        setCalculating(false);
        setMessage('Select cards to hold, then draw');
      }, 100);
    }
  };

  const toggleHold = (index) => {
    if (gameState !== 'dealt' || calculating) return;
    
    const newHeld = [...held];
    newHeld[index] = !newHeld[index];
    setHeld(newHeld);
  };

  const draw = () => {
    if (gameState !== 'dealt') return;

    // Check if player followed optimal strategy
    if (trainingMode && optimalHold) {
      const playerHold = held.map((h, i) => h ? i : -1).filter(i => i >= 0);
      const optimalIndices = [...optimalHold.holdIndices].sort();
      const playerIndices = [...playerHold].sort();
      
      const isOptimal = JSON.stringify(optimalIndices) === JSON.stringify(playerIndices);
      
      setLastDecision({
        isOptimal,
        playerHold: playerIndices,
        optimalHold: optimalIndices,
        evLoss: isOptimal ? 0 : (optimalHold.expectedValue - (optimalHold.allOptions.find(o => 
          JSON.stringify([...o.holdIndices].sort()) === JSON.stringify(playerIndices)
        )?.ev || 0))
      });

      setStats(prev => ({
        ...prev,
        totalDecisions: prev.totalDecisions + 1,
        optimalPlays: prev.optimalPlays + (isOptimal ? 1 : 0)
      }));
    }

    setGameState('drawing');
    setMessage('Drawing...');

    let currentDeck = [...deck];
    const newHand = [...hand];
    
    for (let i = 0; i < 5; i++) {
      if (!held[i]) {
        if (currentDeck.length === 0) {
          currentDeck = shuffleDeck(VideoPokerRules.createDeck());
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

  const evaluateHand = async (finalHand) => {
    const result = VideoPokerRules.evaluateHand(finalHand, variant);
    const winAmount = VideoPokerRules.getPayout(result, variant, bet);

    setWinningHand(result);
    setPayout(winAmount);
    setBalance(prev => prev + winAmount);
    setGameState('result');

    if (result) {
      setMessage(`${result}! Win ${winAmount} credits`);
      
      setStats(prev => ({
        ...prev,
        handsPlayed: prev.handsPlayed + 1,
        wins: prev.wins + 1,
        royalFlushes: prev.royalFlushes + (result.includes('Royal') ? 1 : 0),
        straightFlushes: prev.straightFlushes + (result === 'Straight Flush' ? 1 : 0),
        fourOfAKinds: prev.fourOfAKinds + (result.includes('Four') ? 1 : 0),
        fullHouses: prev.fullHouses + (result === 'Full House' ? 1 : 0),
        flushes: prev.flushes + (result === 'Flush' ? 1 : 0),
        straights: prev.straights + (result === 'Straight' && !result.includes('Flush') ? 1 : 0),
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

    if (trainingMode) {
      await incrementTrainingRounds('videopoker');
    }
  };

  const maxBet = () => {
    if (gameState === 'betting' || gameState === 'result') {
      setBet(5);
      setTimeout(() => deal(), 200);
    }
  };

const resetGame = () => {
  setBalance(initialBankroll); // Use saved preference instead of hardcoded value
    setBet(5);
    setGameState('betting');
    setHand([]);
    setHeld([false, false, false, false, false]);
    setWinningHand(null);
    setPayout(0);
    setMessage('Bet MAX and deal for best odds!');
    setLastDecision(null);
    setStats({
      handsPlayed: 0,
      royalFlushes: 0,
      straightFlushes: 0,
      fourOfAKinds: 0,
      fullHouses: 0,
      flushes: 0,
      straights: 0,
      wins: 0,
      optimalPlays: 0,
      totalDecisions: 0,
      profitLoss: 0
    });
    createDeck();
  };

  const paytable = VideoPokerRules.paytables[variant];
  const canDeal = (gameState === 'betting' || gameState === 'result') && balance >= bet;
  const canDraw = gameState === 'dealt' && !calculating;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-4">
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

              {trainingMode && stats.totalDecisions > 0 && (
                <div className="stat-card p-3 rounded-xl">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Accuracy</div>
                  <div className="text-2xl font-bold text-blue-400 font-mono">
                    {((stats.optimalPlays / stats.totalDecisions) * 100).toFixed(1)}%
                  </div>
                </div>
              )}

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
                { id: 'jacksOrBetter', name: 'Jacks or Better', rtp: '99.54%' },
                { id: 'deucesWild', name: 'Deuces Wild', rtp: '100.76%' },
                { id: 'bonusPoker', name: 'Bonus Poker', rtp: '99.17%' }
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => {
                    if (gameState === 'betting' || gameState === 'result') {
                      setVariant(v.id);
                      setMessage(`${v.name} selected! RTP: ${v.rtp} with optimal play`);
                    }
                  }}
                  disabled={gameState !== 'betting' && gameState !== 'result'}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    variant === v.id
                      ? 'bg-purple-600 text-white ring-2 ring-yellow-400'
                      : 'glass hover:bg-opacity-60'
                  } ${(gameState !== 'betting' && gameState !== 'result') ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div>{v.name}</div>
                  <div className="text-xs text-gray-300">{v.rtp}</div>
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
          {trainingMode && showStrategy && optimalHold && gameState === 'dealt' && !calculating && (
            <div className="mt-4 training-overlay rounded-xl p-4 slide-in-top">
              <div className="flex items-start gap-3">
                <TrendingUp size={20} className="text-yellow-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-yellow-300 text-lg mb-1">
                    OPTIMAL PLAY: {optimalHold.holdIndices.length === 0 ? 'Draw All 5' : 
                      `Hold card${optimalHold.holdIndices.length > 1 ? 's' : ''} ${optimalHold.holdIndices.map(i => i + 1).join(', ')}`}
                  </div>
                  <div className="text-sm text-gray-200 mb-2">{optimalHold.reasoning}</div>
                  <div className="text-xs text-gray-400">Expected Value: {optimalHold.expectedValue.toFixed(3)} credits per coin bet</div>
                  
                  <button
                    onClick={() => setShowAllOptions(!showAllOptions)}
                    className="mt-2 text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1"
                  >
                    <Calculator size={14} />
                    {showAllOptions ? 'Hide' : 'Show'} all options
                  </button>

                  {showAllOptions && optimalHold.allOptions && (
                    <div className="mt-3 glass p-3 rounded-lg max-h-48 overflow-y-auto">
                      <div className="text-xs font-bold mb-2 text-gray-300">Top 10 Hold Strategies:</div>
                      {optimalHold.allOptions.map((option, i) => (
                        <div key={i} className={`text-xs py-1 ${i === 0 ? 'text-yellow-300 font-bold' : 'text-gray-300'}`}>
                          {i + 1}. {option.description} - EV: {option.ev.toFixed(3)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Decision Feedback */}
          {lastDecision && gameState === 'result' && (
            <div className={`mt-4 rounded-xl p-4 slide-in-top ${lastDecision.isOptimal ? 'feedback-success' : 'feedback-error'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{lastDecision.isOptimal ? '✓' : '✗'}</span>
                <div>
                  <div className="font-bold text-lg">
                    {lastDecision.isOptimal ? 'Perfect Play!' : 'Suboptimal Decision'}
                  </div>
                  {!lastDecision.isOptimal && (
                    <div className="text-sm mt-1">
                      <div>You held cards: {lastDecision.playerHold.length === 0 ? 'none (drew all 5)' : lastDecision.playerHold.map(i => i + 1).join(', ')}</div>
                      <div>Optimal hold: {lastDecision.optimalHold.length === 0 ? 'none (draw all 5)' : lastDecision.optimalHold.map(i => i + 1).join(', ')}</div>
                      <div className="text-red-300 mt-1">EV lost: {lastDecision.evLoss.toFixed(3)} credits</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {calculating && (
            <div className="mt-4 bg-blue-900 bg-opacity-50 rounded-xl p-4 flex items-center gap-3">
              <div className="animate-spin">⚙️</div>
              <div className="text-sm">Calculating optimal strategy using combinatorial analysis...</div>
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
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full font-bold text-sm pulse-gold z-10">
                    HELD
                  </div>
                )}
                
                {/* Optimal Hold Hint */}
                {trainingMode && showStrategy && optimalHold && gameState === 'dealt' && !calculating &&
                 optimalHold.holdIndices.includes(index) && !held[index] && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full font-bold text-xs animate-pulse z-10">
                    ▼ HOLD
                  </div>
                )}

                {/* Card Number Label */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm font-bold">
                  {index + 1}
                </div>

                <button
                  onClick={() => toggleHold(index)}
                  disabled={gameState !== 'dealt' || calculating}
                  className={`transition-all ${
                    held[index] ? 'transform -translate-y-4' : ''
                  } ${(gameState === 'dealt' && !calculating) ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
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
                  } ${balance < amount ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${
                    amount === 5 ? 'ring-2 ring-green-400' : ''
                  }`}
                >
                  {amount} COIN{amount > 1 ? 'S' : ''}
                  {amount === 5 && <div className="text-xs text-green-200">BEST ODDS</div>}
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
                  className="btn-premium glass-strong px-8 py-5 rounded-2xl font-bold text-xl transition-all hover:bg-purple-600 hover:bg-opacity-60 hover:scale-105 shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed pulse-gold"
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
        <Modal onClose={() => setShowPaytable(false)} title={`${paytable.name.toUpperCase()}`}>
          <div className="mb-4 text-sm text-gray-300">
            <p>Expected Return: {variant === 'jacksOrBetter' ? '99.54%' : variant === 'deucesWild' ? '100.76%' : '99.17%'} with perfect play</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Hand</th>
                  {[1, 2, 3, 4, 5].map(coins => (
                    <th key={coins} className={`text-center py-3 px-2 ${coins === 5 ? 'text-yellow-400' : ''}`}>
                      {coins} Coin{coins > 1 ? 's' : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(paytable.hands).map(([hand, payouts]) => (
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
            <div className="mt-4 text-sm text-gray-400">
              <p>⭐ 5 coin bet offers 800:1 bonus on Royal Flush (4000 credits vs 1000)</p>
              <p className="mt-1">💡 Always bet max coins for optimal return percentage</p>
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
            <StatCard label="Flushes" value={stats.flushes} color="cyan" />
            <StatCard label="Straights" value={stats.straights} color="indigo" />
            <StatCard label="Wins" value={stats.wins} color="green" />
            <StatCard 
              label="Profit/Loss" 
              value={stats.profitLoss > 0 ? `+${stats.profitLoss}` : stats.profitLoss} 
              color={stats.profitLoss >= 0 ? 'green' : 'red'} 
              className="col-span-2"
            />
            <StatCard 
              label="Win Rate" 
              value={stats.handsPlayed > 0 ? `${((stats.wins / stats.handsPlayed) * 100).toFixed(1)}%` : '0%'} 
              color="blue" 
            />
            {trainingMode && stats.totalDecisions > 0 && (
              <StatCard 
                label="Strategy Accuracy" 
                value={`${((stats.optimalPlays / stats.totalDecisions) * 100).toFixed(1)}%`} 
                color="indigo" 
                subtitle={`${stats.optimalPlays} / ${stats.totalDecisions} optimal`}
                className="col-span-2 md:col-span-3"
              />
            )}
          </div>
        </Modal>
      )}
       {/* AI Strategy Coach */}
      <AICoach 
        game="videopoker"
        gameState={{
          hand,
          held,
          variant,
          bet,
          balance,
          optimalHold,
          gameState,
          trainingMode,
          lastDecision,
          winningHand,
          payout
        }}
        visible={true}
      />
    </div>
  );
}

// RoyalEdge Playing Card Component – Video Poker (Unified Blackjack Style)
function PokerCard({ card, held = false, onClick, disabled = false }) {
  const isRed = card.suit === "♥" || card.suit === "♦";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {/* HELD badge */}
      {held && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold z-20 shadow-lg animate-pulse">
          HELD
        </div>
      )}

      {/* 🂡 Card Face — Blackjack-style precision & polish */}
      <div
        className={`card-face w-28 h-40 rounded-xl relative overflow-hidden border ${
          held ? "border-yellow-400 ring-4 ring-yellow-400" : "border-neutral-300"
        } bg-gradient-to-br from-neutral-50 to-neutral-100 shadow-[0_8px_12px_rgba(0,0,0,0.25)]
          transform-gpu transition-transform duration-200 ${
            !disabled &&
            "hover:-translate-y-1 hover:rotate-[0.5deg] hover:shadow-[0_12px_18px_rgba(0,0,0,0.35)]"
          }`}
      >
        {/* Subtle highlight gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-transparent pointer-events-none" />

        {/* Light sheen bar */}
        <div className="absolute top-0 left-0 w-[55%] h-full bg-gradient-to-r from-white/10 to-transparent opacity-40" />

        {/* Inner gold edge for premium look */}
        <div
          className={`absolute inset-[3px] rounded-lg border ${
            held ? "border-yellow-400/60" : "border-yellow-400/30"
          }`}
        />

        {/* Card content */}
        <div className="relative flex flex-col justify-between h-full px-2 pt-3 pb-4 z-10">
          {/* Top corner */}
          <div
            className={`text-[1.05rem] font-semibold font-[Inter] leading-tight tracking-tight ${
              isRed ? "text-red-600" : "text-gray-800"
            }`}
          >
            <div className="leading-[1.1]">{card.value}</div>
            <div className="text-2xl leading-none mt-[2px]">{card.suit}</div>
          </div>

          {/* Center emblem */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className={`text-5xl ${
                isRed
                  ? "text-red-600 drop-shadow-[0_1px_2px_rgba(255,0,0,0.25)]"
                  : "text-gray-800 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
              }`}
            >
              {card.suit}
            </div>
          </div>

          {/* Bottom corner (mirrored, visible, clean spacing) */}
          <div
            className={`absolute bottom-2 right-2 text-[1.05rem] font-semibold font-[Inter] text-right rotate-180 ${
              isRed ? "text-red-600" : "text-gray-800"
            }`}
          >
            <div className="leading-[1.1]">{card.value}</div>
            <div className="text-2xl leading-none mt-[2px]">{card.suit}</div>
          </div>
        </div>
      </div>
    </button>
  );
}

// Reusable Components
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
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-all hover:scale-110">
            <X size={28} />
          </button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon, subtitle, className = '' }) {
  const colors = {
    gray: 'from-gray-700 to-gray-800',
    purple: 'from-purple-700 to-purple-900',
    blue: 'from-blue-700 to-blue-900',
    green: 'from-green-700 to-green-900',
    orange: 'from-orange-700 to-orange-900',
    red: 'from-red-700 to-red-900',
    cyan: 'from-cyan-700 to-cyan-900',
    indigo: 'from-indigo-700 to-indigo-900'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-5 shadow-lg hover:scale-105 transition-all ${className}`}>
      <div className="text-gray-300 text-sm uppercase tracking-wider mb-2">{label}</div>
      <div className="text-4xl font-bold font-mono flex items-center gap-2">
        {icon && <span className="text-3xl">{icon}</span>}
        {value}
      </div>
      {subtitle && <div className="text-xs text-gray-400 mt-2">{subtitle}</div>}
    </div>
  );
}

export default VideoPokerGame;
