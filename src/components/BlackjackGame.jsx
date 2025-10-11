import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, TrendingUp, Brain, BarChart3, RotateCcw, Info, X, Palette, Eye, EyeOff, ArrowLeft, Crown, Zap } from 'lucide-react';
import { DeckManager } from '../utils/deckManager';
import { HandCalculator } from '../utils/handCalculator';
import { BasicStrategy } from '../utils/basicStrategy';
import CardCountingDisplay from './CardCountingDisplay';
import Confetti from './Confetti';

function BlackjackGame({ onBack }) {
  // Game state
  const [deckManager, setDeckManager] = useState(null);
  const [playerHands, setPlayerHands] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [balance, setBalance] = useState(1000);
  const [gameState, setGameState] = useState('betting');
  const [message, setMessage] = useState('Place your bet to start playing');
  const [showDealerCard, setShowDealerCard] = useState(false);

  // Theme
  const [theme, setTheme] = useState('classic');

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

  // Bet history for heat calculation
  const [betHistory, setBetHistory] = useState([]);
  const [baseBet, setBaseBet] = useState(10);

  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

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
      setBetHistory(prev => [...prev, amount].slice(-30));
      setTimeout(() => startGame([newHand]), 300);
    }
  };

  // Start new game
  const startGame = (hands) => {
    if (!deckManager) return;

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

    // Check for dealer peek
    const dealerUpCard = dealerCard1.value;
    if (dealerUpCard === 'A' || ['10', 'J', 'Q', 'K'].includes(dealerUpCard)) {
      if (HandCalculator.isBlackjack([dealerCard1, dealerCard2])) {
        setShowDealerCard(true);
        if (HandCalculator.isBlackjack([card1, card2])) {
          setMessage('Push! Both have Blackjack');
          resolveHand(updatedHands[0], 'push');
        } else {
          setMessage('Dealer has Blackjack!');
          resolveHand(updatedHands[0], 'loss');
        }
        return;
      }
    }

    // Check for player blackjack
    if (HandCalculator.isBlackjack([card1, card2])) {
      setShowDealerCard(true);
      setMessage('🎉 BLACKJACK! You Win!');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      resolveHand(updatedHands[0], 'blackjack');
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
    } else {
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

    if (HandCalculator.calculateValue(updatedCards) > 21) {
      setMessage('Doubled and busted!');
    } else {
      setMessage(`Doubled! Total: ${HandCalculator.calculateValue(updatedCards)}`);
    }

    if (currentHandIndex < playerHands.length - 1) {
      setTimeout(() => {
        setCurrentHandIndex(currentHandIndex + 1);
        setMessage(`Hand ${currentHandIndex + 2} - Your turn`);
      }, 1000);
    } else {
      setTimeout(() => {
        setMessage('Dealer is playing...');
        setShowDealerCard(true);
        setGameState('dealer');
        setTimeout(() => playDealer(updatedHands), 1000);
      }, 1000);
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

  const resolveAllHands = (hands, finalDealerHand) => {
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

    if (wins > losses) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    const resultMsg = `${wins}W · ${losses}L · ${pushes}P`;
    setMessage(resultMsg);
    setGameState('gameOver');
  };

  const resolveHand = (hand, result) => {
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
    } else if (result === 'loss') {
      setStats(prev => ({
        ...prev,
        handsPlayed: prev.handsPlayed + 1,
        losses: prev.losses + 1,
        profitLoss: prev.profitLoss - hand.bet
      }));
    }

    setBalance(prev => prev + winnings);
    setGameState('gameOver');
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
    setBalance(1000);
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
    setBetHistory([]);
    if (deckManager) {
      deckManager.initialize();
    }
    newRound();
  };

  if (!deckManager) {
    return (
      <div className="min-h-screen casino-background flex items-center justify-center">
        <div className="loading-spinner-premium"></div>
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
    <div className="min-h-screen casino-background p-4">
      <Confetti trigger={showConfetti} />
      
      {/* Premium Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <div className="glass-premium-strong rounded-3xl p-6 shadow-2xl border-2 border-casino-gold/30">
          <div className="flex justify-between items-center flex-wrap gap-4">
            
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="btn-premium-secondary px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                <span className="hidden md:inline">Back</span>
              </motion.button>
              <div className="flex items-center gap-3">
                <Crown size={32} className="text-casino-gold" />
                <h1 className="text-4xl md:text-5xl font-display font-black neon-text-premium tracking-wider">
                  BLACKJACK
                </h1>
              </div>
            </div>
            
            {/* Stats Bar */}
            <div className="flex gap-4 items-center flex-wrap">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="stat-card-premium p-3 rounded-xl"
              >
                <div className="text-xs text-gray-400 uppercase tracking-wider font-body">Balance</div>
                <div className="text-3xl font-tech font-bold gold-shimmer">${balance}</div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="stat-card-premium p-3 rounded-xl"
              >
                <div className="text-xs text-gray-400 uppercase tracking-wider font-body">True Count</div>
                <div className={`text-2xl font-tech font-bold ${
                  deckManager.getTrueCount() > 2 ? 'text-green-400' : 
                  deckManager.getTrueCount() < -2 ? 'text-red-400' : 'text-gray-300'
                }`}>
                  {deckManager.getTrueCount() > 0 ? '+' : ''}{deckManager.getTrueCount()}
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="stat-card-premium p-3 rounded-xl"
              >
                <div className="text-xs text-gray-400 uppercase tracking-wider font-body">Penetration</div>
                <div className="text-xl font-tech text-blue-400">{deckManager.getPenetration()}%</div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowStats(!showStats)}
                  className="glass-premium p-3 rounded-xl hover:border-casino-gold border border-transparent transition-all"
                  title="Statistics"
                >
                  <BarChart3 size={20} className="text-blue-400" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSettings(!showSettings)}
                  className="glass-premium p-3 rounded-xl hover:border-casino-gold border border-transparent transition-all"
                  title="Settings"
                >
                  <Settings size={20} className="text-purple-400" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="btn-premium-secondary px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  <span className="hidden md:inline">Reset</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Training Controls */}
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-6 flex gap-6 items-center justify-center flex-wrap border-t border-casino-gold/20 pt-4"
          >
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={trainingMode}
                onChange={(e) => setTrainingMode(e.target.checked)}
                className="w-5 h-5 cursor-pointer accent-casino-gold"
              />
              <Brain size={22} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="font-heading text-lg tracking-wide">Training Mode</span>
            </label>

            {trainingMode && (
              <motion.label 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={showStrategy}
                  onChange={(e) => setShowStrategy(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-casino-gold"
                />
                {showStrategy ? <Eye size={18} className="text-green-400" /> : <EyeOff size={18} className="text-gray-400" />}
                <span className="text-sm font-body">Strategy Hints</span>
              </motion.label>
            )}
          </motion.div>

          {/* Strategy Advice */}
          <AnimatePresence>
            {trainingMode && showStrategy && strategyAdvice && gameState === 'playing' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 training-overlay-premium rounded-xl p-4 overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <Zap size={20} className="text-casino-gold mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-heading text-xl text-casino-gold mb-1 tracking-wide">
                      OPTIMAL: {strategyAdvice.action}
                    </div>
                    <div className="text-sm font-body text-gray-200">{strategyAdvice.reason}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Decision Feedback */}
          <AnimatePresence>
            {lastDecision && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`mt-4 rounded-xl p-4 ${lastDecision.correct ? 'feedback-success-premium' : 'feedback-error-premium'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{lastDecision.correct ? '✓' : '✗'}</span>
                  <div>
                    <div className="font-heading text-xl mb-1">
                      {lastDecision.correct ? 'Perfect Decision!' : 'Suboptimal Play'}
                    </div>
                    {!lastDecision.correct && (
                      <div className="text-sm font-body">
                        You chose <span className="font-bold">{lastDecision.action}</span>, 
                        but <span className="font-bold text-casino-gold">{lastDecision.optimal}</span> was optimal
                        <div className="text-gray-300 mt-1">{lastDecision.reason}</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Card Counting Display */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <CardCountingDisplay 
          deckManager={deckManager}
          betHistory={betHistory}
          currentBet={playerHands[0]?.bet || 0}
          baseBet={baseBet}
        />
      </motion.div>

      {/* Game Table */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-7xl mx-auto"
      >
        <div className="felt-texture-premium table-border-premium rounded-[4rem] shadow-2xl p-12 relative">
          
          {/* Dealer Section */}
          <div className="mb-16">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-6"
            >
              <h2 className="text-4xl font-display font-black text-casino-gold mb-3 tracking-widest neon-text-premium">
                DEALER
              </h2>
              {dealerHand.length > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="glass-premium-strong inline-block px-8 py-3 rounded-full"
                >
                  <span className="text-3xl font-tech font-bold">
                    {showDealerCard 
                      ? HandCalculator.calculateValue(dealerHand)
                      : `${dealerHand[0].value}${dealerHand[0].suit}`
                    }
                  </span>
                  {showDealerCard && HandCalculator.isSoft(dealerHand) && (
                    <span className="text-sm text-gray-400 ml-2">(soft)</span>
                  )}
                </motion.div>
              )}
            </motion.div>
            
            <div className="flex justify-center gap-4 flex-wrap">
              <AnimatePresence>
                {dealerHand.map((card, index) => (
                  <motion.div 
                    key={card.id}
                    initial={{ x: -200, y: -200, rotate: -45, opacity: 0 }}
                    animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                    transition={{ 
                      delay: index * 0.15,
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                  >
                    <PremiumCard card={card} hidden={index === 1 && !showDealerCard} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Message Display */}
          <motion.div 
            key={message}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center my-12"
          >
            <div className="glass-premium-strong inline-block px-12 py-6 rounded-2xl border-2 border-casino-gold/50">
              <p className="text-3xl font-display font-bold gold-shimmer tracking-wide">{message}</p>
            </div>
          </motion.div>

          {/* Player Section */}
          <div className="mb-12">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-6"
            >
              <h2 className="text-4xl font-display font-black text-casino-gold mb-4 tracking-widest neon-text-premium">
                PLAYER
              </h2>
            </motion.div>
            
            <div className="flex justify-center gap-6 flex-wrap">
              <AnimatePresence>
                {playerHands.map((hand, index) => (
                  <motion.div 
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`glass-premium-strong rounded-2xl p-6 transition-all duration-300 ${
                      index === currentHandIndex && gameState === 'playing'
                        ? 'ring-4 ring-casino-gold pulse-glow-premium'
                        : ''
                    }`}
                  >
                    <div className="text-center mb-4">
                      <div className="font-heading text-lg text-gray-300 mb-2">
                        Hand {index + 1}
                        {hand.status === 'busted' && <span className="text-red-400 ml-2">(BUST)</span>}
                        {hand.status === 'stood' && <span className="text-blue-400 ml-2">(STAND)</span>}
                        {hand.status === 'surrendered' && <span className="text-orange-400 ml-2">(SURRENDER)</span>}
                        {hand.status === 'blackjack' && <span className="text-casino-gold ml-2 neon-text-premium">(BLACKJACK!)</span>}
                      </div>
                      <div className="text-4xl font-tech font-bold mb-2">
                        {HandCalculator.calculateValue(hand.cards)}
                        {HandCalculator.isSoft(hand.cards) && <span className="text-sm text-gray-400 ml-2">(soft)</span>}
                      </div>
                      <div className="text-green-400 font-heading text-xl">
                        ${hand.bet}{hand.doubled && ' (x2)'}
                      </div>
                    </div>
                    <div className="flex gap-3 justify-center flex-wrap">
                      {hand.cards.map((card, cardIndex) => (
                        <motion.div 
                          key={card.id}
                          initial={{ x: -200, y: 200, rotate: 45, opacity: 0 }}
                          animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                          transition={{ 
                            delay: cardIndex * 0.1,
                            type: "spring",
                            stiffness: 200,
                            damping: 20
                          }}
                        >
                          <PremiumCard card={card} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Betting Area */}
          <AnimatePresence>
            {gameState === 'betting' && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="mt-12"
              >
                <div className="glass-premium-strong rounded-3xl p-8 max-w-3xl mx-auto border-2 border-casino-gold/30">
                  <h3 className="text-3xl font-display font-bold text-center mb-6 gold-shimmer tracking-wider">
                    PLACE YOUR BET
                  </h3>
                  <div className="flex justify-center gap-5 flex-wrap mb-6">
                    {[5, 10, 25, 50, 100, 500].map((amount, index) => (
                      <motion.button
                        key={amount}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.05, type: "spring" }}
                        whileHover={{ scale: 1.15, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => placeBet(amount)}
                        disabled={balance < amount}
                        className={`chip-premium w-24 h-24 rounded-full border-4 font-heading text-xl transition-all ${
                          amount === 5 ? 'bg-white text-black border-gray-400' :
                          amount === 10 ? 'bg-red-600 border-red-800 text-white' :
                          amount === 25 ? 'bg-green-600 border-green-800 text-white' :
                          amount === 50 ? 'bg-blue-600 border-blue-800 text-white' :
                          amount === 100 ? 'bg-black text-casino-gold border-casino-gold' :
                          'bg-purple-700 border-purple-900 text-white'
                        } ${balance < amount ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        ${amount}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <AnimatePresence>
            {gameState === 'playing' && (
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                className="mt-10 flex justify-center gap-5 flex-wrap"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={hit}
                  className="btn-premium-casino px-10 py-5 rounded-2xl text-2xl tracking-widest shadow-2xl"
                >
                  HIT
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stand}
                  className="btn-premium-casino px-10 py-5 rounded-2xl text-2xl tracking-widest shadow-2xl"
                >
                  STAND
                </motion.button>
                {canDouble && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={doubleDown}
                    className="btn-premium-casino px-8 py-5 rounded-2xl text-xl tracking-widest shadow-2xl"
                  >
                    DOUBLE
                  </motion.button>
                )}
                {canSplit && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={split}
                    className="btn-premium-casino px-8 py-5 rounded-2xl text-xl tracking-widest shadow-2xl"
                  >
                    SPLIT
                  </motion.button>
                )}
                {canSurrender && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={surrender}
                    className="btn-premium-secondary px-8 py-5 rounded-2xl text-lg tracking-widest shadow-2xl"
                  >
                    SURRENDER
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* New Round Button */}
          <AnimatePresence>
            {gameState === 'gameOver' && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="mt-10 text-center"
              >
                <motion.button
                  whileHover={{ scale: 1.08, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={newRound}
                  className="btn-premium-casino px-20 py-6 rounded-3xl text-3xl tracking-widest shadow-2xl pulse-glow-premium"
                >
                  NEW ROUND
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Statistics Modal */}
      <AnimatePresence>
        {showStats && (
          <PremiumModal onClose={() => setShowStats(false)} title="SESSION STATISTICS">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <PremiumStatCard label="Hands Played" value={stats.handsPlayed} color="gray" />
              <PremiumStatCard label="Wins" value={stats.wins} color="green" icon="🏆" />
              <PremiumStatCard label="Losses" value={stats.losses} color="red" />
              <PremiumStatCard label="Pushes" value={stats.pushes} color="yellow" />
              <PremiumStatCard label="Blackjacks" value={stats.blackjacks} color="purple" icon="🃏" />
              <PremiumStatCard 
                label="Profit/Loss" 
                value={`$${stats.profitLoss > 0 ? '+' : ''}${stats.profitLoss}`} 
                color={stats.profitLoss >= 0 ? 'green' : 'red'} 
              />
              <PremiumStatCard 
                label="Win Rate" 
                value={stats.handsPlayed > 0 ? `${((stats.wins / stats.handsPlayed) * 100).toFixed(1)}%` : '0%'} 
                color="blue" 
                className="col-span-2 md:col-span-3"
              />
              {trainingMode && stats.totalDecisions > 0 && (
                <PremiumStatCard 
                  label="Strategy Accuracy" 
                  value={`${((stats.correctDecisions / stats.totalDecisions) * 100).toFixed(1)}%`} 
                  color="indigo" 
                  subtitle={`${stats.correctDecisions} / ${stats.totalDecisions} optimal`}
                  className="col-span-2 md:col-span-3"
                />
              )}
            </div>
          </PremiumModal>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <PremiumModal onClose={() => setShowSettings(false)} title="GAME SETTINGS">
            {/* Settings content - keeping original functionality */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-heading mb-2 text-casino-gold">Number of Decks</label>
                <select
                  value={rules.numDecks}
                  onChange={(e) => setRules({...rules, numDecks: parseInt(e.target.value)})}
                  className="w-full glass-premium border border-casino-gold/30 rounded-xl p-3 font-body text-white focus:border-casino-gold focus:outline-none"
                >
                  <option value="1" className="bg-black">1 Deck</option>
                  <option value="2" className="bg-black">2 Decks</option>
                  <option value="6" className="bg-black">6 Decks</option>
                  <option value="8" className="bg-black">8 Decks</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-heading mb-2 text-casino-gold">Blackjack Pays</label>
                <select
                  value={rules.blackjackPays}
                  onChange={(e) => setRules({...rules, blackjackPays: parseFloat(e.target.value)})}
                  className="w-full glass-premium border border-casino-gold/30 rounded-xl p-3 font-body text-white focus:border-casino-gold focus:outline-none"
                >
                  <option value="1.5" className="bg-black">3:2</option>
                  <option value="1.2" className="bg-black">6:5</option>
                </select>
              </div>

              <label className="flex items-center justify-between cursor-pointer glass-premium p-4 rounded-xl hover:border-casino-gold border border-transparent transition-all">
                <span className="font-heading text-gray-200">Dealer Hits Soft 17</span>
                <input
                  type="checkbox"
                  checked={rules.dealerHitsSoft17}
                  onChange={(e) => setRules({...rules, dealerHitsSoft17: e.target.checked})}
                  className="w-6 h-6 cursor-pointer accent-casino-gold"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer glass-premium p-4 rounded-xl hover:border-casino-gold border border-transparent transition-all">
                <span className="font-heading text-gray-200">Double After Split (DAS)</span>
                <input
                  type="checkbox"
                  checked={rules.doubleAfterSplit}
                  onChange={(e) => setRules({...rules, doubleAfterSplit: e.target.checked})}
                  className="w-6 h-6 cursor-pointer accent-casino-gold"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer glass-premium p-4 rounded-xl hover:border-casino-gold border border-transparent transition-all">
                <span className="font-heading text-gray-200">Surrender Allowed</span>
                <input
                  type="checkbox"
                  checked={rules.surrenderAllowed}
                  onChange={(e) => setRules({...rules, surrenderAllowed: e.target.checked})}
                  className="w-6 h-6 cursor-pointer accent-casino-gold"
                />
              </label>

              <div className="pt-6 border-t border-casino-gold/20">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const dm = new DeckManager(rules.numDecks, rules.penetration);
                    setDeckManager(dm);
                    setShowSettings(false);
                    newRound();
                  }}
                  className="w-full btn-premium-casino px-8 py-4 rounded-xl text-lg tracking-widest"
                >
                  APPLY & RESTART
                </motion.button>
              </div>
            </div>
          </PremiumModal>
        )}
      </AnimatePresence>

      {/* House Rules */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-7xl mx-auto mt-8"
      >
        <details className="glass-premium-strong rounded-2xl overflow-hidden border border-casino-gold/20">
          <summary className="p-5 cursor-pointer font-heading text-lg text-casino-gold hover:bg-black/30 transition-colors flex items-center gap-3">
            <Info size={22} />
            HOUSE RULES
          </summary>
          <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-body text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-casino-gold">✓</span>
              <span>{rules.numDecks}-deck shoe</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-casino-gold">✓</span>
              <span>Dealer {rules.dealerHitsSoft17 ? 'hits' : 'stands'} on soft 17</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-casino-gold">✓</span>
              <span>Blackjack pays {rules.blackjackPays === 1.5 ? '3:2' : '6:5'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-casino-gold">✓</span>
              <span>Double after split: {rules.doubleAfterSplit ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-casino-gold">✓</span>
              <span>Surrender: {rules.surrenderAllowed ? 'Allowed' : 'Not allowed'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-casino-gold">✓</span>
              <span>Maximum {rules.maxSplits} splits allowed</span>
            </div>
          </div>
        </details>
      </motion.div>
    </div>
  );
}

// Premium Card Component
function PremiumCard({ card, hidden = false }) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  
  if (hidden) {
    return (
      <motion.div 
        whileHover={{ y: -10, rotateY: 10 }}
        className="w-32 h-48 card-back-premium card-premium"
      >
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.05 }}
      className="w-32 h-48 card-premium p-4 flex flex-col justify-between font-body"
    >
      <div className={`text-3xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
        <div className="font-tech">{card.value}</div>
        <div className="text-5xl leading-none">{card.suit}</div>
      </div>
      <div className="text-center text-6xl">
        <div className={isRed ? 'text-red-600' : 'text-black'}>{card.suit}</div>
      </div>
      <div className={`text-3xl font-bold text-right rotate-180 ${isRed ? 'text-red-600' : 'text-black'}`}>
        <div className="font-tech">{card.value}</div>
        <div className="text-5xl leading-none">{card.suit}</div>
      </div>
    </motion.div>
  );
}

// Premium Modal Component
function PremiumModal({ children, onClose, title }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 modal-backdrop-premium flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-premium-strong rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-casino-gold/30"
      >
        <div className="sticky top-0 glass-premium-strong border-b border-casino-gold/20 p-6 flex justify-between items-center">
          <h2 className="text-4xl font-display font-black gold-shimmer tracking-wider">{title}</h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-400 hover:text-casino-gold transition-colors"
          >
            <X size={32} />
          </motion.button>
        </div>
        <div className="p-8">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// Premium Stat Card Component
function PremiumStatCard({ label, value, color, icon, subtitle, className = '' }) {
  const colors = {
    gray: 'from-gray-700 to-gray-800 border-gray-600',
    green: 'from-green-700 to-green-900 border-green-600',
    red: 'from-red-700 to-red-900 border-red-600',
    yellow: 'from-yellow-600 to-yellow-800 border-yellow-600',
    purple: 'from-purple-700 to-purple-900 border-purple-600',
    blue: 'from-blue-700 to-blue-900 border-blue-600',
    indigo: 'from-indigo-700 to-indigo-900 border-indigo-600'
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-6 shadow-xl border-2 ${className}`}
    >
      <div className="text-gray-300 text-xs uppercase tracking-wider font-body mb-2">{label}</div>
      <div className="text-5xl font-tech font-bold flex items-center gap-3">
        {icon && <span className="text-4xl">{icon}</span>}
        {value}
      </div>
      {subtitle && <div className="text-xs text-gray-400 mt-2 font-body">{subtitle}</div>}
    </motion.div>
  );
}

export default BlackjackGame;
