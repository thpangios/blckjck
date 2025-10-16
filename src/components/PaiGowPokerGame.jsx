import React, { useState, useEffect } from 'react';
import { Settings, BarChart3, RotateCcw, Info, X, ArrowLeft, Brain, Shuffle, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { PaiGowPokerRules } from '../utils/paiGowPokerRules';
import { PaiGowPokerStrategy } from '../utils/paiGowPokerStrategy';
import AICoach from './AICoach';
import { buildGameContext } from '../utils/aiCoachService';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../lib/supabase';
import TrainingLimitBanner from './TrainingLimitBanner';

function PaiGowPokerGame({ onBack }) {
  const [deck, setDeck] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);

  // Player's set hands
  const [playerHigh5, setPlayerHigh5] = useState([]);
  const [playerLow2, setPlayerLow2] = useState([]);

  // Dealer's set hands
  const [dealerHigh5, setDealerHigh5] = useState([]);
  const [dealerLow2, setDealerLow2] = useState([]);

  const { user } = useAuth();
  const { incrementTrainingRounds, canPlayTraining } = useSubscription();
const [balance, setBalance] = useState(10000); // Default fallback
const [initialBankroll, setInitialBankroll] = useState(10000);
  const [bet, setBet] = useState(100);
  const [fortuneBet, setFortuneBet] = useState(0);
  const [pendingCommission, setPendingCommission] = useState(0);
  
  const [gameState, setGameState] = useState('betting'); // betting, setting, comparing, result
  const [message, setMessage] = useState('Place your bet and deal!');
  const [result, setResult] = useState(null);
  
  // Training mode
  const [trainingMode, setTrainingMode] = useState(true);
  const [showHouseWay, setShowHouseWay] = useState(true);
  const [houseWaySet, setHouseWaySet] = useState(null);
  const [optimalSet, setOptimalSet] = useState(null);
  const [isFoul, setIsFoul] = useState(false);

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
    wins: 0,
    losses: 0,
    pushes: 0,
    houseWayFollowed: 0,
    totalDecisions: 0,
    profitLoss: 0,
    fortuneWins: 0
  });
  
  // UI State
  const [showStats, setShowStats] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);

  useEffect(() => {
    createDeck();
  }, []);

  const createDeck = () => {
    const newDeck = PaiGowPokerRules.createDeck();
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

  const deal = () => {
    if (balance < bet) {
      setMessage('Insufficient balance!');
      return;
    }

    const totalBet = bet + fortuneBet;
    setBalance(balance - totalBet);

    let currentDeck = deck.length < 20 ? shuffleDeck(PaiGowPokerRules.createDeck()) : [...deck];
    
    // Deal 7 cards to player and dealer
    const playerHand = currentDeck.slice(0, 7);
    const dealerHand = currentDeck.slice(7, 14);
    
    setPlayerCards(playerHand);
    setDealerCards(dealerHand);
    setDeck(currentDeck.slice(14));
    
    setPlayerHigh5([]);
    setPlayerLow2([]);
    setDealerHigh5([]);
    setDealerLow2([]);
    setSelectedCards([]);
    setIsFoul(false);
    
    setGameState('setting');
    setMessage('Set your hand: Select 5 cards for HIGH hand, 2 for LOW hand');

    // Calculate House Way and optimal for training
    if (trainingMode) {
      const houseWay = PaiGowPokerStrategy.setHouseWay(playerHand);
      setHouseWaySet(houseWay);
      
      const optimal = PaiGowPokerStrategy.findOptimalSet(playerHand);
      setOptimalSet(optimal);
    }
  };

  const toggleCardSelection = (card) => {
    if (gameState !== 'setting') return;

    const isSelected = selectedCards.some(c => c.id === card.id);
    
    if (isSelected) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
    } else {
      if (selectedCards.length < 5) {
        setSelectedCards([...selectedCards, card]);
      }
    }
  };

  const setHigh = () => {
    if (selectedCards.length !== 5) {
      setMessage('Select exactly 5 cards for HIGH hand!');
      return;
    }

    setPlayerHigh5(selectedCards);
    setPlayerLow2(playerCards.filter(c => !selectedCards.some(sc => sc.id === c.id)));
    setSelectedCards([]);
    setMessage('Review your hands and confirm');
  };

  const setLow = () => {
    if (selectedCards.length !== 2) {
      setMessage('Select exactly 2 cards for LOW hand!');
      return;
    }

    setPlayerLow2(selectedCards);
    setPlayerHigh5(playerCards.filter(c => !selectedCards.some(sc => sc.id === c.id)));
    setSelectedCards([]);
    setMessage('Review your hands and confirm');
  };

  const useHouseWay = () => {
    if (!houseWaySet) return;
    
    setPlayerHigh5(houseWaySet.high5);
    setPlayerLow2(houseWaySet.low2);
    setSelectedCards([]);
    setMessage('House Way applied - Confirm to play');
  };

  const clearHands = () => {
    setPlayerHigh5([]);
    setPlayerLow2([]);
    setSelectedCards([]);
    setIsFoul(false);
    setMessage('Set your hand: Select 5 cards for HIGH hand, 2 for LOW hand');
  };

  const confirmHands = () => {
    if (playerHigh5.length !== 5 || playerLow2.length !== 2) {
      setMessage('You must set both HIGH (5 cards) and LOW (2 cards) hands!');
      return;
    }

    // Check for foul hand
    if (PaiGowPokerRules.isFoulHand(playerHigh5, playerLow2)) {
      setIsFoul(true);
      setMessage('FOUL HAND! Your LOW hand beats your HIGH hand. You lose automatically!');
      setTimeout(() => resolveFoul(), 2000);
      return;
    }

    setIsFoul(false);
    setGameState('comparing');
    setMessage('Dealer is setting their hand...');

    // Track if player followed House Way
    if (trainingMode && houseWaySet) {
      const followedHouseWay = 
        JSON.stringify(playerHigh5.map(c => c.id).sort()) === 
        JSON.stringify(houseWaySet.high5.map(c => c.id).sort());
      
      setStats(prev => ({
        ...prev,
        totalDecisions: prev.totalDecisions + 1,
        houseWayFollowed: prev.houseWayFollowed + (followedHouseWay ? 1 : 0)
      }));
    }

    // Dealer sets using House Way
    setTimeout(() => {
      const dealerSet = PaiGowPokerStrategy.setHouseWay(dealerCards);
      setDealerHigh5(dealerSet.high5);
      setDealerLow2(dealerSet.low2);
      
      setTimeout(() => compareHands(dealerSet), 1500);
    }, 1000);
  };

  const resolveFoul = () => {
    setStats(prev => ({
      ...prev,
      handsPlayed: prev.handsPlayed + 1,
      losses: prev.losses + 1,
      profitLoss: prev.profitLoss - bet
    }));
    
    setGameState('result');
    setResult({ outcome: 'loss', reason: 'Foul hand' });
  };

  const compareHands = async (dealerSet) => {
    const playerHigh5Eval = PaiGowPokerRules.evaluate5CardHand(playerHigh5);
    const playerLow2Eval = PaiGowPokerRules.evaluate2CardHand(playerLow2);
    const dealerHigh5Eval = PaiGowPokerRules.evaluate5CardHand(dealerSet.high5);
    const dealerLow2Eval = PaiGowPokerRules.evaluate2CardHand(dealerSet.low2);

    const highResult = PaiGowPokerRules.compareHands(playerHigh5Eval, dealerHigh5Eval);
    const lowResult = PaiGowPokerRules.compareHands(playerLow2Eval, dealerLow2Eval);

    let outcome;
    let winnings = 0;
    let resultMsg = '';

    if (highResult > 0 && lowResult > 0) {
      // Player wins both
      const payout = bet * 2 * 0.95; // 5% commission
      const commission = bet * 0.05;
      winnings = payout;
      setPendingCommission(prev => prev + commission);
      outcome = 'win';
      resultMsg = 'You win both hands!';
      
      setStats(prev => ({
        ...prev,
        wins: prev.wins + 1
      }));
    } else if (highResult < 0 && lowResult < 0) {
      // Dealer wins both
      outcome = 'loss';
      resultMsg = 'Dealer wins both hands';
      
      setStats(prev => ({
        ...prev,
        losses: prev.losses + 1
      }));
    } else if (highResult === 0 && lowResult === 0) {
      // Exact copy - dealer wins
      outcome = 'loss';
      resultMsg = 'Copy! Dealer wins on tie';
      
      setStats(prev => ({
        ...prev,
        losses: prev.losses + 1
      }));
    } else {
      // Split - push
      winnings = bet;
      outcome = 'push';
      resultMsg = 'Push! One hand each';
      
      setStats(prev => ({
        ...prev,
        pushes: prev.pushes + 1
      }));
    }

    // Check Fortune bonus
    if (fortuneBet > 0) {
      const fortuneResult = PaiGowPokerRules.evaluateFortuneBonus(playerCards);
      if (fortuneResult) {
        const fortunePayout = fortuneBet * fortuneResult.payout;
        winnings += fortunePayout;
        resultMsg += ` | Fortune: ${fortuneResult.hand} (+$${fortunePayout})!`;
        
        setStats(prev => ({
          ...prev,
          fortuneWins: prev.fortuneWins + 1
        }));
      }
    }

    setBalance(prev => prev + winnings);
    
    setStats(prev => ({
      ...prev,
      handsPlayed: prev.handsPlayed + 1,
      profitLoss: prev.profitLoss + (winnings - bet - fortuneBet)
    }));

    setMessage(resultMsg);
    setGameState('result');
    setResult({
      outcome,
      reason: resultMsg,
      playerHigh5Eval,
      playerLow2Eval,
      dealerHigh5Eval,
      dealerLow2Eval,
      highResult,
      lowResult
    });

    if (trainingMode) {
      await incrementTrainingRounds('paigowpoker');
    }
  };

  const newRound = () => {
    setPlayerCards([]);
    setDealerCards([]);
    setPlayerHigh5([]);
    setPlayerLow2([]);
    setDealerHigh5([]);
    setDealerLow2([]);
    setSelectedCards([]);
    setHouseWaySet(null);
    setOptimalSet(null);
    setResult(null);
    setIsFoul(false);
    setGameState('betting');
    setMessage('Place your bet and deal!');
  };

  const resetGame = () => {
  setBalance(initialBankroll); // Use saved preference instead of hardcoded value
    setBet(100);
    setFortuneBet(0);
    setPendingCommission(0);
    setStats({
      handsPlayed: 0,
      wins: 0,
      losses: 0,
      pushes: 0,
      houseWayFollowed: 0,
      totalDecisions: 0,
      profitLoss: 0,
      fortuneWins: 0
    });
    createDeck();
    newRound();
  };

  const canDeal = gameState === 'betting' && balance >= bet;
  const canSet = gameState === 'setting';
  const canConfirm = gameState === 'setting' && playerHigh5.length === 5 && playerLow2.length === 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black text-white p-4">
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
                🀄 PAI GOW POKER
              </div>
            </div>
            
            <div className="flex gap-6 items-center flex-wrap">
              <div className="stat-card p-3 rounded-xl">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Credits</div>
                <div className="text-3xl font-bold text-yellow-400 font-mono">${balance}</div>
              </div>

              <div className="stat-card p-3 rounded-xl">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Bet</div>
                <div className="text-2xl font-bold text-green-400 font-mono">${bet}</div>
              </div>

              {pendingCommission > 0 && (
                <div className="stat-card p-3 rounded-xl">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Commission</div>
                  <div className="text-xl font-bold text-orange-400 font-mono">${pendingCommission.toFixed(2)}</div>
                </div>
              )}

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

          {/* Training Mode Controls */}
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

            {trainingMode && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHouseWay}
                  onChange={(e) => setShowHouseWay(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm">Show House Way</span>
              </label>
            )}

            {stats.totalDecisions > 0 && (
              <div className="stat-card p-2 px-4 rounded-lg">
                <span className="text-xs text-gray-400">House Way Accuracy: </span>
                <span className="text-lg font-bold text-blue-400">
                  {((stats.houseWayFollowed / stats.totalDecisions) * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* House Way Display */}
          {trainingMode && showHouseWay && houseWaySet && gameState === 'setting' && (
            <div className="mt-4 training-overlay rounded-xl p-4 slide-in-top">
              <div className="flex items-start gap-3">
                <TrendingUp size={20} className="text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-bold text-yellow-300 text-lg mb-1">HOUSE WAY RECOMMENDATION</div>
                  <div className="text-sm text-gray-200 mb-2">
                    HIGH: {PaiGowPokerRules.evaluate5CardHand(houseWaySet.high5).description}
                    <br />
                    LOW: {PaiGowPokerRules.evaluate2CardHand(houseWaySet.low2).description}
                  </div>
                  <button
                    onClick={useHouseWay}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Use House Way
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Foul Warning */}
          {isFoul && (
            <div className="mt-4 bg-red-900 bg-opacity-50 rounded-xl p-4 border-l-4 border-red-400 slide-in-top">
              <div className="flex items-center gap-3">
                <AlertCircle size={24} className="text-red-400" />
                <div>
                  <div className="font-bold text-xl text-red-300">FOUL HAND!</div>
                  <div className="text-sm text-gray-200">Your 2-card LOW hand is stronger than your 5-card HIGH hand. This results in an automatic loss!</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-7xl mx-auto">
        <div className="felt-texture table-border rounded-[3rem] shadow-2xl p-8 relative">
          
          {/* Message */}
          <div className="text-center mb-8">
            <div className="glass-strong inline-block px-8 py-4 rounded-2xl">
              <p className="text-2xl font-bold text-yellow-300">{message}</p>
            </div>
          </div>

          {/* Dealer's Hands */}
          {(gameState === 'comparing' || gameState === 'result') && dealerHigh5.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold player-label text-red-400 mb-4 text-center tracking-widest">
                DEALER
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Dealer High */}
                <div className={`glass rounded-2xl p-6 ${
                  result?.highResult < 0 ? 'ring-4 ring-red-400' : 
                  result?.highResult > 0 ? 'ring-4 ring-green-400' : ''
                }`}>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-300 mb-2">HIGH HAND (5 cards)</h3>
                    {result && (
                      <div className="text-lg font-semibold text-yellow-400">
                        {result.dealerHigh5Eval.description}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {dealerHigh5.map(card => (
                      <div key={card.id} className="card-deal">
                        <PaiGowCard card={card} small />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dealer Low */}
                <div className={`glass rounded-2xl p-6 ${
                  result?.lowResult < 0 ? 'ring-4 ring-red-400' : 
                  result?.lowResult > 0 ? 'ring-4 ring-green-400' : ''
                }`}>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-300 mb-2">LOW HAND (2 cards)</h3>
                    {result && (
                      <div className="text-lg font-semibold text-yellow-400">
                        {result.dealerLow2Eval.description}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center gap-2">
                    {dealerLow2.map(card => (
                      <div key={card.id} className="card-deal">
                        <PaiGowCard card={card} small />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Player's 7 Cards (During Setting) */}
          {gameState === 'setting' && playerCards.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-center text-yellow-400 mb-4">
                YOUR 7 CARDS - Select {selectedCards.length < 5 ? '5 for HIGH' : '2 for LOW'}
              </h2>
              <div className="flex justify-center gap-3 flex-wrap mb-6">
                {playerCards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => toggleCardSelection(card)}
                    className={`transition-all ${
                      selectedCards.some(c => c.id === card.id)
                        ? 'transform -translate-y-4 ring-4 ring-yellow-400'
                        : 'hover:scale-105'
                    }`}
                  >
                    <PaiGowCard card={card} />
                  </button>
                ))}
              </div>

              {/* Setting Buttons */}
              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={setHigh}
                  disabled={selectedCards.length !== 5}
                  className="btn-premium glass-strong px-8 py-4 rounded-2xl font-bold text-xl transition-all hover:bg-blue-600 hover:bg-opacity-60 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  SET HIGH (5)
                </button>
                <button
                  onClick={setLow}
                  disabled={selectedCards.length !== 2}
                  className="btn-premium glass-strong px-8 py-4 rounded-2xl font-bold text-xl transition-all hover:bg-purple-600 hover:bg-opacity-60 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  SET LOW (2)
                </button>
                <button
                  onClick={clearHands}
                  className="btn-premium glass px-6 py-4 rounded-2xl font-bold text-lg transition-all hover:bg-red-600 hover:bg-opacity-60"
                >
                  CLEAR
                </button>
              </div>
            </div>
          )}

          {/* Player's Set Hands */}
          {(playerHigh5.length > 0 || playerLow2.length > 0) && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold player-label text-blue-400 mb-4 text-center tracking-widest">
                PLAYER
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Player High */}
                {playerHigh5.length > 0 && (
                  <div className={`glass rounded-2xl p-6 ${
                    result?.highResult > 0 ? 'ring-4 ring-green-400' : 
                    result?.highResult < 0 ? 'ring-4 ring-red-400' : ''
                  }`}>
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-300 mb-2">HIGH HAND (5 cards)</h3>
                      {result && (
                        <div className="text-lg font-semibold text-yellow-400">
                          {result.playerHigh5Eval.description}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {playerHigh5.map(card => (
                        <div key={card.id} className="card-deal">
                          <PaiGowCard card={card} small />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Player Low */}
                {playerLow2.length > 0 && (
                  <div className={`glass rounded-2xl p-6 ${
                    result?.lowResult > 0 ? 'ring-4 ring-green-400' : 
                    result?.lowResult < 0 ? 'ring-4 ring-red-400' : ''
                  }`}>
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-300 mb-2">LOW HAND (2 cards)</h3>
                      {result && (
                        <div className="text-lg font-semibold text-yellow-400">
                          {result.playerLow2Eval.description}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center gap-2">
                      {playerLow2.map(card => (
                        <div key={card.id} className="card-deal">
                          <PaiGowCard card={card} small />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Betting Area */}
          {gameState === 'betting' && (
            <div className="mt-12 fade-in-up">
              <div className="glass-strong rounded-2xl p-8 max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-center mb-6 text-yellow-400 player-label tracking-wider">
                  PLACE YOUR BET
                </h3>
                
                {/* Main Bet */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-gray-300">Main Bet</label>
                  <div className="flex gap-4 flex-wrap justify-center">
                    {[25, 50, 100, 250, 500].map(amount => (
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
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fortune Bonus */}
                <div className="mb-6 border-t border-gray-700 pt-6">
                  <label className="block text-sm font-semibold mb-2 text-purple-400">
                    Fortune Bonus (Optional)
                  </label>
                  <div className="text-xs text-gray-400 mb-3">
                    Side bet pays on premium hands (Straight or better)
                  </div>
                  <div className="flex gap-4 flex-wrap justify-center">
                    {[0, 5, 10, 25].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setFortuneBet(amount)}
                        disabled={amount > 0 && balance < bet + amount}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${
                          fortuneBet === amount
                            ? 'bg-purple-500 text-white ring-4 ring-purple-300'
                            : 'glass hover:bg-opacity-60'
                        } ${(amount > 0 && balance < bet + amount) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                      >
                        {amount === 0 ? 'None' : `$${amount}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deal Button */}
                <button
                  onClick={deal}
                  disabled={!canDeal}
                  className="w-full btn-premium glass-strong px-12 py-5 rounded-2xl font-bold text-3xl transition-all hover:bg-green-600 hover:bg-opacity-60 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed pulse-gold"
                >
                  DEAL
                </button>
              </div>
            </div>
          )}

          {/* Confirm Button */}
          {canConfirm && (
            <div className="mt-8 text-center fade-in-up">
              <button
                onClick={confirmHands}
                className="btn-premium glass-strong px-16 py-6 rounded-2xl font-bold text-3xl transition-all hover:bg-green-600 hover:bg-opacity-60 hover:scale-105 shadow-2xl pulse-gold"
              >
                CONFIRM HANDS
              </button>
            </div>
          )}

          {/* New Round Button */}
          {gameState === 'result' && (
            <div className="mt-8 text-center fade-in-up">
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
        <Modal onClose={() => setShowStats(false)} title="PAI GOW POKER STATISTICS">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Hands Played" value={stats.handsPlayed} color="gray" />
            <StatCard label="Wins" value={stats.wins} color="green" />
            <StatCard label="Losses" value={stats.losses} color="red" />
            <StatCard label="Pushes" value={stats.pushes} color="yellow" icon="🤝" />
            <StatCard label="Fortune Wins" value={stats.fortuneWins} color="purple" icon="🎰" />
            <StatCard 
              label="Profit/Loss" 
              value={`$${stats.profitLoss > 0 ? '+' : ''}${stats.profitLoss.toFixed(2)}`} 
              color={stats.profitLoss >= 0 ? 'green' : 'red'} 
              className="col-span-2"
            />
            {stats.handsPlayed > 0 && (
              <>
                <StatCard 
                  label="Win Rate" 
                  value={`${((stats.wins / stats.handsPlayed) * 100).toFixed(1)}%`} 
                  color="blue" 
                />
                <StatCard 
                  label="Push Rate" 
                  value={`${((stats.pushes / stats.handsPlayed) * 100).toFixed(1)}%`} 
                  color="yellow" 
                />
                {stats.totalDecisions > 0 && (
                  <StatCard 
                    label="House Way %" 
                    value={`${((stats.houseWayFollowed / stats.totalDecisions) * 100).toFixed(1)}%`} 
                    color="indigo" 
                  />
                )}
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Rules Modal */}
      {showRules && (
        <Modal onClose={() => setShowRules(false)} title="PAI GOW POKER RULES">
          <div className="space-y-4 text-gray-300 text-sm">
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">Objective</h3>
              <p>Create two poker hands from 7 cards: a 5-card HIGH hand and a 2-card LOW hand. Both must beat the dealer's corresponding hands to win.</p>
            </div>
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">Hand Requirements</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>HIGH hand (5 cards) must be stronger than LOW hand (2 cards)</li>
                <li>If LOW beats HIGH = FOUL HAND (automatic loss)</li>
                <li>Dealer sets using "House Way" algorithm</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">The Joker</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Semi-wild: completes straights and flushes</li>
                <li>Otherwise acts as an Ace</li>
                <li>Can create Five Aces (4 Aces + Joker)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">Winning</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Win both hands = Win (5% commission)</li>
                <li>Win one, lose one = Push (no winner)</li>
                <li>Lose both hands = Lose</li>
                <li>Exact tie (copy) = Dealer wins</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">Fortune Bonus</h3>
              <p className="mb-2">Side bet pays on premium 5-card hands from your 7 cards:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>7-Card SF: 8000:1</div>
                <div>Royal + Match: 2000:1</div>
                <div>7-Card SF w/ Joker: 1000:1</div>
                <div>Five Aces: 400:1</div>
                <div>Royal Flush: 150:1</div>
                <div>Straight Flush: 50:1</div>
                <div>Four of a Kind: 25:1</div>
                <div>Full House: 5:1</div>
                <div>Flush: 4:1</div>
                <div>Three of a Kind: 3:1</div>
                <div>Straight: 2:1</div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* AI Strategy Coach */}
      <AICoach 
        game="paigowpoker"
        gameState={{
          playerCards,
          playerHigh5,
          playerLow2,
          dealerHigh5,
          dealerLow2,
          houseWaySet,
          bet,
          balance,
          gameState,
          trainingMode
        }}
        visible={true}
      />
    </div>
  );
}
// RoyalEdge Playing Card Component - Pai Gow Poker
function PaiGowCard({ card, small = false }) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  const isJoker = card.rank === 'JOKER';
  
  const sizeClasses = small ? 'w-20 h-28' : 'w-28 h-40';
  const textSize = small ? 'text-base' : 'text-lg';
  const suitTopSize = small ? 'text-xl' : 'text-2xl';
  const centerSize = small ? 'text-4xl' : 'text-5xl';
  const padding = small ? 'p-1.5 pb-2' : 'p-2 pb-3';
  
  if (isJoker) {
    return (
      <div className={`${sizeClasses} rounded-xl relative overflow-hidden border border-purple-400 bg-gradient-to-br from-purple-600 to-purple-800 shadow-[0_8px_12px_rgba(0,0,0,0.25)]
        transform-gpu transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_12px_18px_rgba(0,0,0,0.35)]`}
      >
        {/* Magical gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 via-transparent to-transparent pointer-events-none" />
        {/* Inner gold edge */}
        <div className="absolute inset-[3px] rounded-lg border border-yellow-400/50" />
        {/* Content */}
        <div className="relative flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-5xl mb-1">🃏</div>
            <div className="text-xs font-bold text-yellow-300 tracking-wider">JOKER</div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div
      className={`card-face ${sizeClasses} rounded-xl relative overflow-hidden border border-neutral-300 bg-gradient-to-br from-neutral-50 to-neutral-100 shadow-[0_8px_12px_rgba(0,0,0,0.25)]
        transform-gpu transition-transform duration-200 hover:-translate-y-1 hover:rotate-[0.5deg] hover:shadow-[0_12px_18px_rgba(0,0,0,0.35)]`}
    >
      {/* Subtle highlight gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-transparent pointer-events-none" />
      {/* Light sheen bar */}
      <div className="absolute top-0 left-0 w-[55%] h-full bg-gradient-to-r from-white/10 to-transparent opacity-40" />
      {/* Inner gold edge for premium look */}
      <div className="absolute inset-[3px] rounded-lg border border-yellow-400/30" />
      {/* Content Layer */}
      <div className={`relative flex flex-col justify-between h-full ${padding}`}>
        {/* Top corner */}
        <div
          className={`${textSize} font-semibold font-[Inter] leading-tight tracking-tight ${
            isRed ? 'text-red-600' : 'text-gray-800'
          }`}
        >
          <div>{card.rank}</div>
          <div className={`${suitTopSize} leading-none mt-[2px]`}>{card.suit}</div>
        </div>
        {/* Center emblem */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className={`${centerSize} drop-shadow-sm ${
              isRed ? 'text-red-600' : 'text-gray-800'
            }`}
          >
            {card.suit}
          </div>
        </div>
        {/* Bottom corner (mirrored and visible) */}
        <div
          className={`${textSize} font-semibold font-[Inter] leading-tight tracking-tight text-right rotate-180 ${
            isRed ? 'text-red-600' : 'text-gray-800'
          }`}
        >
          <div>{card.rank}</div>
          <div className={`${suitTopSize} leading-none mt-[2px]`}>{card.suit}</div>
        </div>
      </div>
    </div>
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

function StatCard({ label, value, color, icon, className = '' }) {
  const colors = {
    gray: 'from-gray-700 to-gray-800',
    green: 'from-green-700 to-green-900',
    red: 'from-red-700 to-red-900',
    yellow: 'from-yellow-600 to-yellow-800',
    purple: 'from-purple-700 to-purple-900',
    blue: 'from-blue-700 to-blue-900',
    indigo: 'from-indigo-700 to-indigo-900'
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

export default PaiGowPokerGame;
