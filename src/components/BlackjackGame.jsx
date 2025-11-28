import React, { useState, useEffect } from 'react';
import { Settings, TrendingUp, Brain, BarChart3, RotateCcw, Info, X, Palette, Eye, EyeOff } from 'lucide-react';
import { DeckManager } from '../utils/deckManager';
import { HandCalculator } from '../utils/handCalculator';
import { BasicStrategy } from '../utils/basicStrategy';
import CardCountingDisplay from './CardCountingDisplay';
import AICoach from './AICoach';
import { buildGameContext } from '../utils/aiCoachService';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../lib/supabase';
import TrainingLimitBanner from './TrainingLimitBanner';

function BlackjackGame({ onBack }) {
  // Game state
  const [deckManager, setDeckManager] = useState(null);
  const [playerHands, setPlayerHands] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const { user } = useAuth();
  const { incrementTrainingRounds, canPlayTraining, remainingTrainingRounds } = useSubscription();
const [balance, setBalance] = useState(10000); // Default fallback
const [initialBankroll, setInitialBankroll] = useState(10000);
  const [gameState, setGameState] = useState('betting');
  const [message, setMessage] = useState('Place your bet to start playing');
  const [showDealerCard, setShowDealerCard] = useState(false);
  const [betHistory, setBetHistory] = useState([]);
  const [baseBet, setBaseBet] = useState(10); // Base betting unit

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

  // Theme
  const [theme, setTheme] = useState('classic'); // classic, modern, high-contrast

  // Settings and rules
  const [rules, setRules] = useState({
    numDecks: 6,
    penetration: 0.75,
    dealerHitsSoft17: false,
    blackjackPays: 1.5,
    doubleAfterSplit: true,
    resplitAces: false,
    hitSplitAces: false,
    maxSplits: 3,
    surrenderAllowed: true,
    insuranceAllowed: true
  });

  // Training mode
  const [trainingMode, setTrainingMode] = useState(true);
  const [showStrategy, setShowStrategy] = useState(true);
  const [strategyAdvice, setStrategyAdvice] = useState(null);
  const [lastDecision, setLastDecision] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    handsPlayed: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    blackjacks: 0,
    correctDecisions: 0,
    totalDecisions: 0,
    profitLoss: 0
  });

  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [cardAnimation, setCardAnimation] = useState(true);

  // Initialize deck manager
  useEffect(() => {
    const dm = new DeckManager(rules.numDecks, rules.penetration);
    setDeckManager(dm);
  }, [rules.numDecks, rules.penetration]);

  const basicStrategy = new BasicStrategy(rules);

  // Place bet
  const placeBet = (amount) => {
    if (balance >= amount && gameState === 'betting') {
      const newHand = {
        cards: [],
        bet: amount,
        status: 'active',
        doubled: false,
        surrendered: false
      };
      setPlayerHands([newHand]);
      setBalance(balance - amount);

      // Track bet history for heat calculation
      setBetHistory(prev => [...prev, amount].slice(-30)); // Keep last 30 bets

      setTimeout(() => startGame([newHand]), 300);
    }
  };

  // Start new game
  const startGame = async (hands) => {
    if (!deckManager) return;

    if (trainingMode && !canPlayTraining()) {
      setMessage('Training limit reached! Disable training mode to continue playing.');
      setTrainingMode(false);
      return;
    }

    const card1 = deckManager.dealCard();
    const card2 = deckManager.dealCard();
    const dealerCard1 = deckManager.dealCard();
    const dealerCard2 = deckManager.dealCard();

    const updatedHands = hands.map(hand => ({
      ...hand,
      cards: [card1, card2]
    }));

    setPlayerHands(updatedHands);
    setDealerHand([dealerCard1, dealerCard2]);
    setCurrentHandIndex(0);
    setGameState('playing');
    setShowDealerCard(false);
    setLastDecision(null);

    if (HandCalculator.isBlackjack([card1, card2])) {
      setShowDealerCard(true);
      if (HandCalculator.isBlackjack([dealerCard1, dealerCard2])) {
        setMessage('Push! Both have Blackjack');
        await resolveHandAndTrack(updatedHands[0], 'push');
      } else {
        setMessage('🎉 BLACKJACK! You Win!');
        await resolveHandAndTrack(updatedHands[0], 'blackjack');
      }
      return;
    }

    if (trainingMode) {
      updateStrategyAdvice(updatedHands[0].cards, dealerCard1, true, true, 1);
    }

    setMessage('Make your move');
  };

  const updateStrategyAdvice = (playerCards, dealerCard, canDouble, canSplit, handCount) => {
    const advice = basicStrategy.getOptimalPlay(playerCards, dealerCard, canDouble, canSplit, handCount);
    setStrategyAdvice(advice);
  };

  const checkDecision = (action) => {
    if (trainingMode && strategyAdvice) {
      const isCorrect = action === strategyAdvice.action;
      setLastDecision({
        action,
        correct: isCorrect,
        optimal: strategyAdvice.action,
        reason: strategyAdvice.reason
      });

      setStats(prev => ({
        ...prev,
        correctDecisions: prev.correctDecisions + (isCorrect ? 1 : 0),
        totalDecisions: prev.totalDecisions + 1
      }));

      return isCorrect;
    }
    return null;
  };

  const hit = () => {
    checkDecision('HIT');
    const currentHand = playerHands[currentHandIndex];
    const newCard = deckManager.dealCard();
    const updatedCards = [...currentHand.cards, newCard];

    const updatedHands = [...playerHands];
    updatedHands[currentHandIndex] = { ...currentHand, cards: updatedCards };
    setPlayerHands(updatedHands);

    const handValue = HandCalculator.calculateValue(updatedCards);

    if (handValue > 21) {
      // Busted
      updatedHands[currentHandIndex].status = 'busted';
      setPlayerHands(updatedHands);
      if (currentHandIndex < playerHands.length - 1) {
        setCurrentHandIndex(currentHandIndex + 1);
        setMessage(`Hand ${currentHandIndex + 2} - Your turn`);
        if (trainingMode) {
          updateStrategyAdvice(
            updatedHands[currentHandIndex + 1].cards,
            dealerHand[0],
            updatedHands[currentHandIndex + 1].cards.length === 2,
            HandCalculator.canSplit(updatedHands[currentHandIndex + 1].cards) && playerHands.length < rules.maxSplits,
            playerHands.length
          );
        }
      } else {
        setMessage('Busted! Dealer wins');
        endGame(updatedHands);
      }
    } else if (handValue === 21) {
      // Got 21 - automatically move to next hand or dealer
      updatedHands[currentHandIndex].status = 'stood';
      setPlayerHands(updatedHands);

      if (currentHandIndex < playerHands.length - 1) {
        // Move to next hand
        setCurrentHandIndex(currentHandIndex + 1);
        setMessage(`Hand ${currentHandIndex + 2} - Your turn`);
        if (trainingMode) {
          updateStrategyAdvice(
            updatedHands[currentHandIndex + 1].cards,
            dealerHand[0],
            updatedHands[currentHandIndex + 1].cards.length === 2,
            HandCalculator.canSplit(updatedHands[currentHandIndex + 1].cards) && playerHands.length < rules.maxSplits,
            playerHands.length
          );
        }
      } else {
        // All hands complete - dealer plays
        setMessage('Dealer is playing...');
        setShowDealerCard(true);
        setGameState('dealer');
        setTimeout(() => playDealer(updatedHands), 1000);
      }
    } else {
      // Normal hit - update strategy advice
      if (trainingMode) {
        updateStrategyAdvice(updatedCards, dealerHand[0], false, false, playerHands.length);
      }
    }
  };

  const stand = () => {
    checkDecision('STAND');
    const updatedHands = [...playerHands];
    updatedHands[currentHandIndex].status = 'stood';
    setPlayerHands(updatedHands);

    if (currentHandIndex < playerHands.length - 1) {
      setCurrentHandIndex(currentHandIndex + 1);
      setMessage(`Hand ${currentHandIndex + 2} - Your turn`);
      if (trainingMode) {
        updateStrategyAdvice(
          updatedHands[currentHandIndex + 1].cards,
          dealerHand[0],
          updatedHands[currentHandIndex + 1].cards.length === 2,
          HandCalculator.canSplit(updatedHands[currentHandIndex + 1].cards) && playerHands.length < rules.maxSplits,
          playerHands.length
        );
      }
    } else {
      setMessage('Dealer is playing...');
      setShowDealerCard(true);
      setGameState('dealer');
      setTimeout(() => playDealer(updatedHands), 1000);
    }
  };

  const doubleDown = () => {
    const currentHand = playerHands[currentHandIndex];
    if (balance < currentHand.bet) {
      setMessage('Insufficient balance to double down');
      return;
    }

    checkDecision('DOUBLE');
    setBalance(balance - currentHand.bet);

    const newCard = deckManager.dealCard();
    const updatedCards = [...currentHand.cards, newCard];

    const updatedHands = [...playerHands];
    updatedHands[currentHandIndex] = {
      ...currentHand,
      cards: updatedCards,
      bet: currentHand.bet * 2,
      doubled: true,
      status: HandCalculator.calculateValue(updatedCards) > 21 ? 'busted' : 'stood'
    };
    setPlayerHands(updatedHands);

    if (currentHandIndex < playerHands.length - 1) {
      setTimeout(() => {
        setCurrentHandIndex(currentHandIndex + 1);
        setMessage(`Hand ${currentHandIndex + 2} - Your turn`);
      }, 500);
    } else {
      setTimeout(() => {
        setMessage('Dealer is playing...');
        setShowDealerCard(true);
        setGameState('dealer');
        setTimeout(() => playDealer(updatedHands), 1000);
      }, 500);
    }
  };

  const split = () => {
    const currentHand = playerHands[currentHandIndex];
    if (balance < currentHand.bet) {
      setMessage('Insufficient balance to split');
      return;
    }

    if (playerHands.length >= rules.maxSplits + 1) {
      setMessage(`Maximum ${rules.maxSplits} splits allowed`);
      return;
    }

    checkDecision('SPLIT');
    setBalance(balance - currentHand.bet);

    const card1 = currentHand.cards[0];
    const card2 = currentHand.cards[1];
    const newCard1 = deckManager.dealCard();
    const newCard2 = deckManager.dealCard();

    const hand1 = {
      cards: [card1, newCard1],
      bet: currentHand.bet,
      status: 'active',
      doubled: false,
      surrendered: false
    };

    const hand2 = {
      cards: [card2, newCard2],
      bet: currentHand.bet,
      status: 'active',
      doubled: false,
      surrendered: false
    };

    const updatedHands = [...playerHands];
    updatedHands.splice(currentHandIndex, 1, hand1, hand2);
    setPlayerHands(updatedHands);
    setMessage(`Hand ${currentHandIndex + 1} - Your turn`);

    if (trainingMode) {
      updateStrategyAdvice(
        hand1.cards,
        dealerHand[0],
        true,
        HandCalculator.canSplit(hand1.cards) && updatedHands.length < rules.maxSplits + 1,
        updatedHands.length
      );
    }
  };

  const surrender = () => {
    if (!rules.surrenderAllowed) return;

    checkDecision('SURRENDER');
    const currentHand = playerHands[currentHandIndex];
    setBalance(balance + currentHand.bet / 2);

    const updatedHands = [...playerHands];
    updatedHands[currentHandIndex] = {
      ...currentHand,
      status: 'surrendered',
      surrendered: true
    };
    setPlayerHands(updatedHands);

    if (currentHandIndex < playerHands.length - 1) {
      setCurrentHandIndex(currentHandIndex + 1);
      setMessage(`Hand ${currentHandIndex + 2} - Your turn`);
    } else {
      setMessage('Hand surrendered');
      endGame(updatedHands);
    }
  };

  const playDealer = (hands) => {
    let currentDealerHand = [...dealerHand];
    let dealerValue = HandCalculator.calculateValue(currentDealerHand);

    const dealerPlay = setInterval(() => {
      const isSoft = HandCalculator.isSoft(currentDealerHand);
      const shouldHit = dealerValue < 17 || (dealerValue === 17 && isSoft && rules.dealerHitsSoft17);

      if (shouldHit) {
        const newCard = deckManager.dealCard();
        currentDealerHand = [...currentDealerHand, newCard];
        setDealerHand(currentDealerHand);
        dealerValue = HandCalculator.calculateValue(currentDealerHand);
      } else {
        clearInterval(dealerPlay);
        resolveAllHands(hands, currentDealerHand);
      }
    }, 800);
  };

  const resolveAllHands = async (hands, finalDealerHand) => {
    const dealerValue = HandCalculator.calculateValue(finalDealerHand);
    const dealerBusted = dealerValue > 21;

    let totalWinnings = 0;
    let wins = 0;
    let losses = 0;
    let pushes = 0;

    hands.forEach(hand => {
      if (hand.status === 'surrendered') return;

      if (hand.status === 'busted') {
        losses++;
        return;
      }

      if (hand.status === 'blackjack') {
        totalWinnings += hand.bet * (1 + rules.blackjackPays);
        wins++;
        return;
      }

      const playerValue = HandCalculator.calculateValue(hand.cards);

      if (dealerBusted) {
        totalWinnings += hand.bet * 2;
        wins++;
      } else if (playerValue > dealerValue) {
        totalWinnings += hand.bet * 2;
        wins++;
      } else if (playerValue < dealerValue) {
        losses++;
      } else {
        totalWinnings += hand.bet;
        pushes++;
      }
    });

    setBalance(prev => prev + totalWinnings);

    setStats(prev => ({
      ...prev,
      handsPlayed: prev.handsPlayed + hands.length,
      wins: prev.wins + wins,
      losses: prev.losses + losses,
      pushes: prev.pushes + pushes,
      profitLoss: prev.profitLoss + (totalWinnings - hands.reduce((sum, h) => sum + h.bet, 0))
    }));

    const resultMsg = `${wins}W · ${losses}L · ${pushes}P`;
    setMessage(resultMsg);
    setGameState('gameOver');

    if (trainingMode) {
      await incrementTrainingRounds('blackjack');
    }
  };

  const resolveHand = async (hand, result) => {
    let winnings = 0;

    if (result === 'blackjack') {
      winnings = hand.bet * (1 + rules.blackjackPays);
      setStats(prev => ({
        ...prev,
        handsPlayed: prev.handsPlayed + 1,
        wins: prev.wins + 1,
        blackjacks: prev.blackjacks + 1,
        profitLoss: prev.profitLoss + (winnings - hand.bet)
      }));
    } else if (result === 'push') {
      winnings = hand.bet;
      setStats(prev => ({
        ...prev,
        handsPlayed: prev.handsPlayed + 1,
        pushes: prev.pushes + 1
      }));
    }

    setBalance(prev => prev + winnings);
    setGameState('gameOver');

    if (trainingMode) {
      await incrementTrainingRounds('blackjack');
    }
  };

  const resolveHandAndTrack = async (hand, result) => {
    await resolveHand(hand, result);
  };

  const endGame = (hands) => {
    setGameState('gameOver');
  };

  const newRound = () => {
    setPlayerHands([]);
    setDealerHand([]);
    setCurrentHandIndex(0);
    setGameState('betting');
    setMessage('Place your bet to start playing');
    setShowDealerCard(false);
    setStrategyAdvice(null);
    setLastDecision(null);
  };

  const resetGame = () => {
  setBalance(initialBankroll); // Use saved preference instead of hardcoded value
    setStats({
      handsPlayed: 0,
      wins: 0,
      losses: 0,
      pushes: 0,
      blackjacks: 0,
      correctDecisions: 0,
      totalDecisions: 0,
      profitLoss: 0
    });
    if (deckManager) {
      deckManager.initialize();
    }
    newRound();
  };

  if (!deckManager) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading casino...</div>
      </div>
    );
  }

  const currentHand = playerHands[currentHandIndex];
  const canDouble = currentHand && currentHand.cards.length === 2 && gameState === 'playing' && balance >= currentHand.bet;
  const canSplit = currentHand && HandCalculator.canSplit(currentHand.cards) &&
    playerHands.length <= rules.maxSplits && gameState === 'playing' && balance >= currentHand.bet;
  const canSurrender = rules.surrenderAllowed && currentHand &&
    currentHand.cards.length === 2 && gameState === 'playing';

  return (
    <div className={`min-h-screen ${theme === 'classic' ? 'theme-classic' : theme === 'modern' ? 'theme-modern' : 'theme-high-contrast'} bg-gradient-to-br from-gray-900 via-green-900 to-black p-4`}>
      {/* Training Limit Banner */}
      {trainingMode && (
        <div className="max-w-7xl mx-auto">
          <TrainingLimitBanner />
        </div>
      )}

      {/* Premium Header */}
      <div className="max-w-7xl mx-auto mb-6 fade-in-up">
        <div className="glass-strong rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-center flex-wrap gap-4">
            {/* Logo WITH Back Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="glass px-4 py-2 rounded-lg hover:bg-opacity-60 transition-all flex items-center gap-2"
              >
                ← Back
              </button>
              <div className="text-4xl font-bold player-label neon-text">
                ♠ BLACKJACK ♥
              </div>
            </div>
            {/* Stats Bar */}
            <div className="flex gap-6 items-center flex-wrap">
              <div className="stat-card p-3 rounded-xl">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Balance</div>
                <div className="text-3xl font-bold text-yellow-400 font-mono">${balance}</div>
              </div>
              <div className="stat-card p-3 rounded-xl">
                <div className="text-xs text-gray-400 uppercase tracking-wider">True Count</div>
                <div className={`text-2xl font-bold font-mono ${
                  deckManager.getTrueCount() > 2 ? 'text-green-400' :
                  deckManager.getTrueCount() < -2 ? 'text-red-400' : 'text-gray-300'
                }`}>
                  {deckManager.getTrueCount() > 0 ? '+' : ''}{deckManager.getTrueCount()}
                </div>
              </div>
              <div className="stat-card p-3 rounded-xl">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Penetration</div>
                <div className="text-xl font-mono text-blue-400">{deckManager.getPenetration()}%</div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="glass p-3 rounded-lg hover:bg-opacity-60 transition-all hover:scale-105"
                  title="Statistics"
                >
                  <BarChart3 size={20} className="text-blue-400" />
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="glass p-3 rounded-lg hover:bg-opacity-60 transition-all hover:scale-105"
                  title="Settings"
                >
                  <Settings size={20} className="text-purple-400" />
                </button>
                <button
                  onClick={resetGame}
                  className="glass px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 hover:bg-opacity-40 transition-all"
                >
                  <RotateCcw size={16} />
                  <span className="font-semibold">Reset</span>
                </button>
              </div>
            </div>
          </div>
          {/* Training Controls */}
          <div className="mt-6 flex gap-6 items-center justify-center flex-wrap border-t border-gray-700 pt-4">
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
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showStrategy}
                  onChange={(e) => setShowStrategy(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                {showStrategy ? <Eye size={18} className="text-green-400" /> : <EyeOff size={18} className="text-gray-400" />}
                <span className="text-sm">Strategy Hints</span>
              </label>
            )}
            <button
              onClick={() => {
                const themes = ['classic', 'modern', 'high-contrast'];
                const currentIndex = themes.indexOf(theme);
                setTheme(themes[(currentIndex + 1) % themes.length]);
              }}
              className="flex items-center gap-2 glass px-4 py-2 rounded-lg hover:bg-opacity-60 transition-all"
            >
              <Palette size={18} />
              <span className="text-sm capitalize">{theme}</span>
            </button>
          </div>
          {/* Strategy Advice Panel */}
          {trainingMode && showStrategy && strategyAdvice && gameState === 'playing' && (
            <div className="mt-4 training-overlay rounded-xl p-4 slide-in-top">
              <div className="flex items-start gap-3">
                <TrendingUp size={20} className="text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-bold text-yellow-300 text-lg mb-1">OPTIMAL PLAY: {strategyAdvice.action}</div>
                  <div className="text-sm text-gray-200">{strategyAdvice.reason}</div>
                </div>
              </div>
            </div>
          )}
          {/* Decision Feedback */}
          {lastDecision && (
            <div className={`mt-4 rounded-xl p-4 slide-in-top ${lastDecision.correct ? 'feedback-success' : 'feedback-error'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{lastDecision.correct ? '✓' : '✗'}</span>
                <div>
                  <div className="font-bold text-lg">
                    {lastDecision.correct ? 'Perfect Decision!' : 'Suboptimal Play'}
                  </div>
                  {!lastDecision.correct && (
                    <div className="text-sm mt-1">
                      You chose <span className="font-semibold">{lastDecision.action}</span>,
                      but <span className="font-semibold text-yellow-300">{lastDecision.optimal}</span> was optimal
                      <div className="text-gray-300 mt-1">{lastDecision.reason}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Card Counting Display Panel */}
      <div className="max-w-7xl mx-auto mb-6 fade-in-up">
        <CardCountingDisplay
          deckManager={deckManager}
          betHistory={betHistory}
          currentBet={playerHands[0]?.bet || 0}
          baseBet={baseBet}
        />
      </div>
      {/* Game Table */}
      <div className="max-w-7xl mx-auto">
        <div className="felt-texture table-border rounded-[3rem] shadow-2xl p-12 relative">
          {/* Dealer Section */}
          <div className="mb-16">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold player-label text-yellow-400 mb-3 tracking-widest">DEALER</h2>
              {dealerHand.length > 0 && (
                <div className="glass inline-block px-6 py-2 rounded-full">
                  <span className="text-2xl font-bold font-mono">
                    {showDealerCard
                      ? HandCalculator.calculateValue(dealerHand)
                      : `${dealerHand[0].value}${dealerHand[0].suit}`
                    }
                  </span>
                  {showDealerCard && HandCalculator.isSoft(dealerHand) && (
                    <span className="text-sm text-gray-400 ml-2">(soft)</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-center gap-3 flex-wrap">
              {dealerHand.map((card, index) => (
                <div key={card.id} className={cardAnimation ? 'card-deal' : ''} style={{ animationDelay: `${index * 0.1}s` }}>
                  <Card card={card} hidden={index === 1 && !showDealerCard} />
                </div>
              ))}
            </div>
          </div>
          {/* Message Display */}
          <div className="text-center my-10">
            <div className="glass-strong inline-block px-10 py-5 rounded-2xl">
              <p className="text-3xl font-bold text-yellow-300 tracking-wide">{message}</p>
            </div>
          </div>
          {/* Player Section */}
          <div className="mb-12">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold player-label text-yellow-400 mb-4 tracking-widest">PLAYER</h2>
            </div>
            <div className="flex justify-center gap-6 flex-wrap">
              {playerHands.map((hand, index) => (
                <div
                  key={index}
                  className={`glass-strong rounded-2xl p-6 transition-all duration-300 ${
                    index === currentHandIndex && gameState === 'playing'
                      ? 'ring-4 ring-yellow-400 pulse-gold'
                      : ''
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className="font-bold text-lg text-gray-300 mb-2">
                      Hand {index + 1}
                      {hand.status === 'busted' && <span className="text-red-400 ml-2">(BUST)</span>}
                      {hand.status === 'stood' && <span className="text-blue-400 ml-2">(STAND)</span>}
                      {hand.status === 'surrendered' && <span className="text-orange-400 ml-2">(SURRENDER)</span>}
                      {hand.status === 'blackjack' && <span className="text-yellow-400 ml-2 neon-text">(BLACKJACK!)</span>}
                    </div>
                    <div className="text-3xl font-bold font-mono mb-2">
                      {HandCalculator.calculateValue(hand.cards)}
                      {HandCalculator.isSoft(hand.cards) && <span className="text-sm text-gray-400 ml-2">(soft)</span>}
                    </div>
                    <div className="text-green-400 font-semibold text-lg">
                      ${hand.bet}{hand.doubled && ' (x2)'}
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center flex-wrap">
                    {hand.cards.map((card, cardIndex) => (
                      <div key={card.id} className={cardAnimation ? 'card-deal' : ''} style={{ animationDelay: `${cardIndex * 0.1}s` }}>
                        <Card card={card} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Betting Area */}
          {gameState === 'betting' && (
            <div className="mt-12 fade-in-up">
              <div className="glass-strong rounded-2xl p-8 max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-center mb-6 text-yellow-400 player-label tracking-wider">PLACE YOUR BET</h3>
                <div className="flex justify-center gap-5 flex-wrap mb-6">
                  {[5, 10, 25, 50, 100, 500].map((amount, index) => (
                    <button
                      key={amount}
                      onClick={() => placeBet(amount)}
                      disabled={balance < amount}
                      className={`chip-animate relative w-24 h-24 rounded-full border-4 font-bold text-xl transition-all hover:scale-110 btn-premium chip-glow ${
                        amount === 5 ? 'bg-white text-black border-gray-400' :
                          amount === 10 ? 'bg-red-600 border-red-800 text-white' :
                          amount === 25 ? 'bg-green-600 border-green-800 text-white' :
                          amount === 50 ? 'bg-blue-600 border-blue-800 text-white' :
                          amount === 100 ? 'bg-black text-yellow-400 border-yellow-600' :
                          'bg-purple-700 border-purple-900 text-white'
                      } ${balance < amount ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl'}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative z-10">
                        ${amount}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Action Buttons */}
          {gameState === 'playing' && (
            <div className="mt-10 flex justify-center gap-5 flex-wrap">
              <button
                onClick={hit}
                className="btn-premium glass-strong px-10 py-5 rounded-2xl font-bold text-2xl transition-all hover:bg-green-600 hover:bg-opacity-60 hover:scale-105 shadow-xl"
              >
                HIT
              </button>
              <button
                onClick={stand}
                className="btn-premium glass-strong px-10 py-5 rounded-2xl font-bold text-2xl transition-all hover:bg-red-600 hover:bg-opacity-60 hover:scale-105 shadow-xl"
              >
                STAND
              </button>
              {canDouble && (
                <button
                  onClick={doubleDown}
                  className="btn-premium glass-strong px-8 py-5 rounded-2xl font-bold text-2xl transition-all hover:bg-yellow-600 hover:bg-opacity-60 hover:scale-105 shadow-xl"
                >
                  DOUBLE
                </button>
              )}
              {canSplit && (
                <button
                  onClick={split}
                  className="btn-premium glass-strong px-8 py-5 rounded-2xl font-bold text-2xl transition-all hover:bg-purple-600 hover:bg-opacity-60 hover:scale-105 shadow-xl"
                >
                  SPLIT
                </button>
              )}
              {canSurrender && (
                <button
                  onClick={surrender}
                  className="btn-premium glass-strong px-8 py-5 rounded-2xl font-bold text-xl transition-all hover:bg-orange-600 hover:bg-opacity-60 hover:scale-105 shadow-xl"
                >
                  SURRENDER
                </button>
              )}
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
        <Modal onClose={() => setShowStats(false)} title="SESSION STATISTICS">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Hands Played" value={stats.handsPlayed} color="gray" />
            <StatCard label="Wins" value={stats.wins} color="green" />
            <StatCard label="Losses" value={stats.losses} color="red" />
            <StatCard label="Pushes" value={stats.pushes} color="yellow" />
            <StatCard label="Blackjacks" value={stats.blackjacks} color="purple" icon="🃏" />
            <StatCard
              label="Profit/Loss"
              value={`$${stats.profitLoss > 0 ? '+' : ''}${stats.profitLoss}`}
              color={stats.profitLoss >= 0 ? 'green' : 'red'}
            />
            <StatCard
              label="Win Rate"
              value={stats.handsPlayed > 0 ? `${((stats.wins / stats.handsPlayed) * 100).toFixed(1)}%` : '0%'}
              color="blue"
              className="col-span-2 md:col-span-3"
            />
            {trainingMode && stats.totalDecisions > 0 && (
              <StatCard
                label="Strategy Accuracy"
                value={`${((stats.correctDecisions / stats.totalDecisions) * 100).toFixed(1)}%`}
                color="indigo"
                subtitle={`${stats.correctDecisions} / ${stats.totalDecisions} optimal`}
                className="col-span-2 md:col-span-3"
              />
            )}
          </div>
        </Modal>
      )}
      {/* Settings Modal */}
      {showSettings && (
        <Modal onClose={() => setShowSettings(false)} title="GAME SETTINGS">
          <div className="space-y-6">
            <SettingSelect
              label="Number of Decks"
              value={rules.numDecks}
              onChange={(val) => setRules({ ...rules, numDecks: parseInt(val) })}
              options={[
                { value: 1, label: '1 Deck' },
                { value: 2, label: '2 Decks' },
                { value: 6, label: '6 Decks' },
                { value: 8, label: '8 Decks' }
              ]}
            />
            <SettingSelect
              label="Blackjack Pays"
              value={rules.blackjackPays}
              onChange={(val) => setRules({ ...rules, blackjackPays: parseFloat(val) })}
              options={[
                { value: 1.5, label: '3:2' },
                { value: 1.2, label: '6:5' }
              ]}
            />
            <SettingToggle
              label="Dealer Hits Soft 17"
              checked={rules.dealerHitsSoft17}
              onChange={(val) => setRules({ ...rules, dealerHitsSoft17: val })}
            />
            <SettingToggle
              label="Double After Split (DAS)"
              checked={rules.doubleAfterSplit}
              onChange={(val) => setRules({ ...rules, doubleAfterSplit: val })}
            />
            <SettingToggle
              label="Surrender Allowed"
              checked={rules.surrenderAllowed}
              onChange={(val) => setRules({ ...rules, surrenderAllowed: val })}
            />
            <SettingToggle
              label="Re-split Aces"
              checked={rules.resplitAces}
              onChange={(val) => setRules({ ...rules, resplitAces: val })}
            />
            <SettingSelect
              label="Maximum Splits"
              value={rules.maxSplits}
              onChange={(val) => setRules({ ...rules, maxSplits: parseInt(val) })}
              options={[
                { value: 1, label: '1 Split' },
                { value: 2, label: '2 Splits' },
                { value: 3, label: '3 Splits' },
                { value: 4, label: '4 Splits' }
              ]}
            />
            <div className="pt-6 border-t border-gray-700">
              <button
                onClick={() => {
                  const dm = new DeckManager(rules.numDecks, rules.penetration);
                  setDeckManager(dm);
                  setShowSettings(false);
                  newRound();
                }}
                className="w-full btn-premium glass-strong px-8 py-4 rounded-xl font-bold text-lg transition-all hover:bg-green-600 hover:bg-opacity-60"
              >
                APPLY SETTINGS & RESTART
              </button>
            </div>
          </div>
        </Modal>
      )}
{/* House Rules Footer */}
      <div className="max-w-7xl mx-auto mt-8 fade-in-up">
        <details className="glass-strong rounded-xl p-5">
          <summary className="cursor-pointer font-bold text-yellow-400 flex items-center gap-3 text-lg">
            <Info size={22} />
            HOUSE RULES
          </summary>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>{rules.numDecks}-deck shoe</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Dealer {rules.dealerHitsSoft17 ? 'hits' : 'stands'} on soft 17</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Blackjack pays {rules.blackjackPays === 1.5 ? '3:2' : '6:5'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Double after split: {rules.doubleAfterSplit ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Surrender: {rules.surrenderAllowed ? 'Allowed' : 'Not allowed'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Maximum {rules.maxSplits} splits allowed</span>
            </div>
          </div>
        </details>
      </div>

      {/* AI Strategy Coach */}
      <AICoach 
        game="blackjack"
        gameState={{
          playerHands,
          dealerHand,
          deckManager,
          gameState,
          balance,
          trainingMode
        }}
        visible={true}
      />

    </div>
  );
}

// RoyalEdge Playing Card Component
function Card({ card, hidden = false }) {
  const isRed = card.suit === '♥' || card.suit === '♦';

  if (hidden) {
    // 🂠 Card Back — elegant lattice & subtle depth
    return (
      <div className="card-back w-28 h-40 rounded-xl relative overflow-hidden border border-slate-700 shadow-[0_6px_12px_rgba(0,0,0,0.5)] transform-gpu">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black" />

        {/* Intricate gold lattice pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,215,0,0.12)_1px,transparent_0)] bg-[length:9px_9px] opacity-80" />

        {/* Gloss reflection */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 mix-blend-overlay" />

        {/* Inner glow */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-yellow-300/10 shadow-inner" />
      </div>
    );
  }

  // 🂡 Card Face — precision, hierarchy, and polish
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

// Modal Component
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

// Stat Card Component
function StatCard({ label, value, color, icon, subtitle, className = '' }) {
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
      {subtitle && <div className="text-xs text-gray-400 mt-2">{subtitle}</div>}
    </div>
  );
}

// Setting Components
function SettingSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-gray-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full glass-strong border border-gray-600 rounded-lg p-3 text-white font-semibold focus:ring-2 focus:ring-yellow-400 focus:outline-none"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function SettingToggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer glass p-4 rounded-lg hover:bg-opacity-60 transition-all">
      <span className="font-semibold text-gray-200">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-6 h-6 cursor-pointer"
      />
    </label>
  );
}

export default BlackjackGame;
