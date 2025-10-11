import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from './Confetti';
import {
  Settings,
  TrendingUp,
  Brain,
  BarChart3,
  RotateCcw,
  Info,
  X,
  Palette,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { DeckManager } from '../utils/deckManager';
import { HandCalculator } from '../utils/handCalculator';
import { BasicStrategy } from '../utils/basicStrategy';
import CardCountingDisplay from './CardCountingDisplay';

/* ============================================================
   Sleek Casino — Blackjack Game Component
============================================================ */
function BlackjackGame({ onBack }) {
  // -------------------- React State -------------------- //
  const [deckManager, setDeckManager] = useState(null);
  const [playerHands, setPlayerHands] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [balance, setBalance] = useState(1000);
  const [gameState, setGameState] = useState('betting');
  const [message, setMessage] = useState('Place your bet to start playing');
  const [showDealerCard, setShowDealerCard] = useState(false);
  const [betHistory, setBetHistory] = useState([]);
  const [baseBet, setBaseBet] = useState(10);

  // Theme & training
  const [theme, setTheme] = useState('classic');
  const [trainingMode, setTrainingMode] = useState(true);
  const [showStrategy, setShowStrategy] = useState(true);
  const [strategyAdvice, setStrategyAdvice] = useState(null);
  const [lastDecision, setLastDecision] = useState(null);

  // Rule Set
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

  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [cardAnimation, setCardAnimation] = useState(true);

  // -------------------- Initialization -------------------- //
  useEffect(() => {
    const dm = new DeckManager(rules.numDecks, rules.penetration);
    setDeckManager(dm);
  }, [rules.numDecks, rules.penetration]);

  const basicStrategy = new BasicStrategy(rules);

  // -------------------- Game Logic -------------------- //
  const placeBet = (amount) => {
    if (balance >= amount && gameState === 'betting') {
      const newHand = { cards: [], bet: amount, status: 'active', doubled: false, surrendered: false };
      setPlayerHands([newHand]);
      setBalance(balance - amount);
      setBetHistory(prev => [...prev, amount].slice(-30));
      setTimeout(() => startGame([newHand]), 300);
    }
  };

  const startGame = (hands) => {
    if (!deckManager) return;
    const card1 = deckManager.dealCard();
    const card2 = deckManager.dealCard();
    const dealerCard1 = deckManager.dealCard();
    const dealerCard2 = deckManager.dealCard();

    const updatedHands = hands.map(h => ({ ...h, cards: [card1, card2] }));
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
        resolveHand(updatedHands[0], 'push');
      } else {
        setMessage('🎉 BLACKJACK! You Win!');
        resolveHand(updatedHands[0], 'blackjack');
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
      setLastDecision({ action, correct: isCorrect, optimal: strategyAdvice.action, reason: strategyAdvice.reason });
      setStats(prev => ({
        ...prev,
        correctDecisions: prev.correctDecisions + (isCorrect ? 1 : 0),
        totalDecisions: prev.totalDecisions + 1
      }));
      return isCorrect;
    }
    return null;
  };

  // -------------------- Actions -------------------- //
  const hit = () => {
    checkDecision('HIT');
    const currentHand = playerHands[currentHandIndex];
    const newCard = deckManager.dealCard();
    const updated = [...playerHands];
    updated[currentHandIndex] = { ...currentHand, cards: [...currentHand.cards, newCard] };
    setPlayerHands(updated);

    const handValue = HandCalculator.calculateValue(updated[currentHandIndex].cards);

    if (handValue > 21) {
      updated[currentHandIndex].status = 'busted';
      setPlayerHands(updated);
      nextHandOrDealer(updated, 'Busted! Dealer wins');
    } else if (handValue === 21) {
      updated[currentHandIndex].status = 'stood';
      setPlayerHands(updated);
      nextHandOrDealer(updated, 'Dealer is playing...');
    } else if (trainingMode) {
      updateStrategyAdvice(updated[currentHandIndex].cards, dealerHand[0], false, false, playerHands.length);
    }
  };

  const stand = () => {
    checkDecision('STAND');
    const updated = [...playerHands];
    updated[currentHandIndex].status = 'stood';
    setPlayerHands(updated);
    nextHandOrDealer(updated, 'Dealer is playing...');
  };

  const doubleDown = () => {
    const current = playerHands[currentHandIndex];
    if (balance < current.bet) {
      setMessage('Insufficient balance to double down');
      return;
    }
    checkDecision('DOUBLE');
    const newCard = deckManager.dealCard();
    const newBet = current.bet * 2;
    setBalance(balance - current.bet);

    const updated = [...playerHands];
    updated[currentHandIndex] = {
      ...current,
      cards: [...current.cards, newCard],
      bet: newBet,
      doubled: true,
      status: HandCalculator.calculateValue([...current.cards, newCard]) > 21 ? 'busted' : 'stood'
    };
    setPlayerHands(updated);
    nextHandOrDealer(updated, 'Dealer is playing...');
  };

  const split = () => {
    const current = playerHands[currentHandIndex];
    if (balance < current.bet) return setMessage('Insufficient balance to split');
    if (playerHands.length >= rules.maxSplits + 1) return setMessage(`Maximum ${rules.maxSplits} splits allowed`);

    checkDecision('SPLIT');
    setBalance(balance - current.bet);

    const [c1, c2] = current.cards;
    const new1 = deckManager.dealCard();
    const new2 = deckManager.dealCard();
    const h1 = { cards: [c1, new1], bet: current.bet, status: 'active', doubled: false, surrendered: false };
    const h2 = { cards: [c2, new2], bet: current.bet, status: 'active', doubled: false, surrendered: false };

    const updated = [...playerHands];
    updated.splice(currentHandIndex, 1, h1, h2);
    setPlayerHands(updated);
    setMessage(`Hand ${currentHandIndex + 1} - Your turn`);
    if (trainingMode) {
      updateStrategyAdvice(h1.cards, dealerHand[0], true, HandCalculator.canSplit(h1.cards), updated.length);
    }
  };

  const surrender = () => {
    if (!rules.surrenderAllowed) return;
    checkDecision('SURRENDER');
    const hand = playerHands[currentHandIndex];
    setBalance(balance + hand.bet / 2);
    const updated = [...playerHands];
    updated[currentHandIndex] = { ...hand, status: 'surrendered', surrendered: true };
    setPlayerHands(updated);
    nextHandOrDealer(updated, 'Hand surrendered');
  };

  const nextHandOrDealer = (updatedHands, msg) => {
    if (currentHandIndex < updatedHands.length - 1) {
      setCurrentHandIndex(currentHandIndex + 1);
      setMessage(`Hand ${currentHandIndex + 2} - Your turn`);
    } else {
      setMessage(msg);
      setShowDealerCard(true);
      setGameState('dealer');
      setTimeout(() => playDealer(updatedHands), 1000);
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
    let totalWinnings = 0, wins = 0, losses = 0, pushes = 0;

    hands.forEach(hand => {
      if (hand.status === 'surrendered') return;
      if (hand.status === 'busted') return losses++;
      if (hand.status === 'blackjack') {
        totalWinnings += hand.bet * (1 + rules.blackjackPays);
        return wins++;
      }
      const playerValue = HandCalculator.calculateValue(hand.cards);
      if (dealerBusted || playerValue > dealerValue) {
        totalWinnings += hand.bet * 2;
        wins++;
      } else if (playerValue < dealerValue) {
        losses++;
      } else {
        totalWinnings += hand.bet; pushes++;
      }
    });

    setBalance(prev => prev + totalWinnings);
    setStats(prev => ({
      ...prev,
      handsPlayed: prev.handsPlayed + hands.length,
      wins: prev.wins + wins,
      losses: prev.losses + losses,
      pushes: prev.pushes + pushes,
      profitLoss: prev.profitLoss + (totalWinnings - hands.reduce((sum,h)=>sum+h.bet,0))
    }));

    setMessage(`${wins}W · ${losses}L · ${pushes}P`);
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
      setStats(prev => ({ ...prev, handsPlayed: prev.handsPlayed + 1, pushes: prev.pushes + 1 }));
    }
    setBalance(prev => prev + winnings);
    setGameState('gameOver');
  };

  const newRound = () => {
    setPlayerHands([]); setDealerHand([]); setCurrentHandIndex(0);
    setGameState('betting');
    setMessage('Place your bet to start playing');
    setShowDealerCard(false); setStrategyAdvice(null); setLastDecision(null);
  };

  const resetGame = () => {
    setBalance(1000);
    setStats({
      handsPlayed:0,wins:0,losses:0,pushes:0,blackjacks:0,
      correctDecisions:0,totalDecisions:0,profitLoss:0
    });
    deckManager?.initialize();
    newRound();
  };

  if (!deckManager) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-2xl text-white">Loading Sleek Casino…</p>
      </div>
    );
  }

  // -------------------- UI Render (Header + Controls) -------------------- //
  return (
    <div className={`min-h-screen ${theme==='classic'?'theme-classic':theme==='modern'?'theme-modern':'theme-high-contrast'}
      bg-gradient-to-br from-gray-950 via-emerald-950 to-black p-4`}>
      
      {/* ======== HEADER ======== */}
      <div className="max-w-7xl mx-auto mb-6 fade-in-up-premium">
        <div className="glass-premium rounded-[2.5rem] p-6 border border-white/10 shadow-xl backdrop-blur-xl">
          <div className="flex justify-between flex-wrap items-center gap-4">

            {/* Back + Logo */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                onClick={onBack}
                className="btn-premium-secondary px-4 py-2 rounded-full flex items-center gap-2 shadow-md"
              >
                <ArrowLeft size={20}/><span className="tracking-wider font-bold">BACK</span>
              </motion.button>
              <h1 className="text-5xl font-black neon-text-premium tracking-wider">♠ BLACKJACK ♥</h1>
            </div>

            {/* Stats + Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              <StatMini label="Balance" value={`$${balance}`} glow="gold-shimmer"/>
              <StatMini label="True Count" value={deckManager.getTrueCount()} colorLogic/>
              <StatMini label="Penetration" value={`${deckManager.getPenetration()}%`} color="text-blue-400"/>

              <div className="flex gap-2">
                <IconBtn icon={<BarChart3 className="text-blue-400"/>} tooltip="Statistics" onClick={()=>setShowStats(!showStats)}/>
                <IconBtn icon={<Settings className="text-purple-400"/>} tooltip="Settings" onClick={()=>setShowSettings(!showSettings)}/>
                <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                  onClick={resetGame}
                  className="btn-premium-secondary px-4 py-2 rounded-full flex items-center gap-2">
                  <RotateCcw size={16}/><span className="tracking-wider font-bold">RESET</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* ======== TRAINING CONTROLS ======== */}
          <div className="mt-6 flex flex-wrap gap-6 items-center justify-center border-t border-white/10 pt-4">
            <motion.label whileHover={{scale:1.05}} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={trainingMode} onChange={e=>setTrainingMode(e.target.checked)}
                className="w-6 h-6 accent-casino-gold cursor-pointer"/>
              <Brain size={24} className="text-blue-400"/><span className="font-bold tracking-wider">TRAINING MODE</span>
            </motion.label>

            {trainingMode && (
              <motion.label initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}}
                className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={showStrategy} onChange={e=>setShowStrategy(e.target.checked)}
                  className="w-5 h-5 accent-casino-gold cursor-pointer"/>
                {showStrategy ? <Eye size={20} className="text-green-400"/> : <EyeOff size={20} className="text-gray-400"/>}
                <span className="text-sm">Strategy Hints</span>
              </motion.label>
            )}

            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
              onClick={()=>{
                const themes=['classic','modern','high-contrast'];
                const idx=themes.indexOf(theme);
                setTheme(themes[(idx+1)%themes.length]);
              }}
              className="glass-premium px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
              <Palette size={18}/><span className="capitalize text-sm">{theme}</span>
            </motion.button>
          </div>

          {/* ======== STRATEGY ADVICE ======== */}
          <AnimatePresence>
            {trainingMode && showStrategy && strategyAdvice && gameState==='playing' && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                className="mt-4 training-overlay-premium rounded-[2rem] p-4">
                <div className="flex gap-3">
                  <TrendingUp size={24} className="text-casino-gold mt-1"/>
                  <div>
                    <div className="font-bold text-xl text-casino-gold tracking-wider mb-1">
                      OPTIMAL PLAY: {strategyAdvice.action}
                    </div>
                    <div className="text-sm text-gray-200">{strategyAdvice.reason}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ======== DECISION FEEDBACK ======== */}
          <AnimatePresence>
            {lastDecision && (
              <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
                className={`mt-4 rounded-[2rem] p-4 ${lastDecision.correct?'feedback-success-premium':'feedback-error-premium'}`}>
                <div className="flex gap-3 items-start">
                  <motion.span initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:200}}
                    className="text-3xl">{lastDecision.correct?'✓':'✗'}</motion.span>
                  <div>
                    <div className="font-bold text-xl tracking-wider">
                      {lastDecision.correct?'PERFECT DECISION!':'SUBOPTIMAL PLAY'}
                    </div>
                    {!lastDecision.correct && (
                      <div className="text-sm mt-1">
                        You chose <b>{lastDecision.action}</b>, optimal is 
                        <b className="text-casino-gold">{lastDecision.optimal}</b>
                        <div className="text-gray-300 mt-1">{lastDecision.reason}</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ======== CARD COUNTING PANEL ======== */}
      <div className="max-w-7xl mx-auto mb-6 fade-in-up-premium">
        <CardCountingDisplay deckManager={deckManager} betHistory={betHistory}
          currentBet={playerHands[0]?.bet||0} baseBet={baseBet}/>
      </div>
  {/* =====================================================
          GAME TABLE
      ====================================================== */}
      <div className="max-w-7xl mx-auto">
        <div className="felt-texture-premium rounded-[2.5rem] border border-white/10 shadow-xl p-12 
                        backdrop-blur-xl relative hover:shadow-casino-glow transition-all duration-300">

          {/* ---------- Dealer Section ---------- */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-yellow-400 mb-4 tracking-widest">DEALER</h2>

            {dealerHand.length > 0 && (
              <div className="glass-premium inline-block px-8 py-3 rounded-full border border-white/10">
                <span className="text-2xl font-bold font-mono">
                  {showDealerCard
                    ? HandCalculator.calculateValue(dealerHand)
                    : `${dealerHand[0].value}${dealerHand[0].suit}`}
                </span>
                {showDealerCard && HandCalculator.isSoft(dealerHand) && (
                  <span className="text-sm text-gray-400 ml-2">(soft)</span>
                )}
              </div>
            )}

            <div className="flex justify-center gap-3 flex-wrap mt-6">
              {dealerHand.map((card, i) => (
                <motion.div key={card.id}
                  className={cardAnimation?'card-deal-premium':''}
                  style={{animationDelay:`${i*0.1}s`}}>
                  <Card card={card} hidden={i===1 && !showDealerCard}/>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Message Banner */}
          <div className="my-10 text-center">
            <div className="glass-premium inline-block px-10 py-5 rounded-[2rem] border border-white/10">
              <p className="text-3xl font-bold text-yellow-300 tracking-wide">{message}</p>
            </div>
          </div>

          {/* ---------- Player Section ---------- */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6 tracking-widest">PLAYER</h2>

            <div className="flex justify-center gap-6 flex-wrap">
              {playerHands.map((hand, i) => (
                <div key={i}
                  className={`glass-premium rounded-[2.5rem] p-8 shadow-lg border border-white/10 
                              backdrop-blur-xl transition-all duration-300 ${
                    i===currentHandIndex && gameState==='playing'
                      ? 'ring-2 ring-casino-gold/40 shadow-casino-glow hover:scale-[1.02]'
                      : ''
                  }`}>
                  <div className="mb-4">
                    <div className="font-bold text-gray-300 mb-2">
                      Hand {i+1}
                      {hand.status==='busted' && <span className="text-red-400 ml-2">(BUST)</span>}
                      {hand.status==='stood' && <span className="text-blue-400 ml-2">(STAND)</span>}
                      {hand.status==='surrendered' && <span className="text-orange-400 ml-2">(SURRENDER)</span>}
                      {hand.status==='blackjack' && <span className="text-yellow-400 ml-2 neon-text-premium">(BLACKJACK!)</span>}
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
                    {hand.cards.map((card, idx) => (
                      <motion.div key={card.id}
                        className={cardAnimation?'card-deal-premium':''}
                        style={{animationDelay:`${idx*0.1}s`}}>
                        <Card card={card}/>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---------- Betting Area ---------- */}
          {gameState==='betting' && (
            <div className="mt-12 fade-in-up-premium">
              <div className="glass-premium rounded-[2.5rem] p-10 max-w-3xl mx-auto 
                              border border-white/10 backdrop-blur-xl shadow-xl hover:shadow-casino-glow">
                <h3 className="text-3xl font-bold text-center mb-6 text-casino-gold tracking-widest">
                  PLACE YOUR BET
                </h3>
                <div className="flex justify-center gap-5 flex-wrap mb-6">
                  {[5,10,25,50,100,500].map((amt,i)=>(
                    <motion.button key={amt}
                      initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                      transition={{delay:i*0.1}}
                      whileHover={{scale:1.1}} whileTap={{scale:0.95}}
                      disabled={balance<amt}
                      onClick={()=>placeBet(amt)}
                      className={`chip-premium w-24 h-24 rounded-full font-bold text-xl shadow-md transition-all 
                        ${balance<amt?'opacity-30 cursor-not-allowed':'cursor-pointer'}
                        ${betHistory.at(-1)===amt?'ring-4 ring-casino-gold pulse-glow-premium':''}
                        ${amt===5?'bg-white text-black border-gray-400':
                           amt===10?'bg-gradient-to-br from-red-600 to-red-800 text-white':
                           amt===25?'bg-gradient-to-br from-green-600 to-green-800 text-white':
                           amt===50?'bg-gradient-to-br from-blue-600 to-blue-800 text-white':
                           amt===100?'bg-gradient-to-br from-black to-gray-900 text-casino-gold':
                           'bg-gradient-to-br from-purple-700 to-purple-900 text-white'}` }>
                      ${amt}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------- Action Buttons ---------- */}
          {gameState==='playing' && (
            <div className="mt-10 flex justify-center gap-5 flex-wrap">
              <ActionBtn label="HIT" onClick={hit}/>
              <ActionBtn label="STAND" onClick={stand}/>
              {currentHandIndex!==null && playerHands[currentHandIndex] && balance>=playerHands[currentHandIndex].bet && (
                <>
                  {playerHands[currentHandIndex].cards.length===2 && (
                    <ActionBtn label="DOUBLE" onClick={doubleDown}/>
                  )}
                  {HandCalculator.canSplit(playerHands[currentHandIndex].cards) && playerHands.length<=rules.maxSplits && (
                    <ActionBtn label="SPLIT" onClick={split}/>
                  )}
                  {rules.surrenderAllowed && playerHands[currentHandIndex].cards.length===2 && (
                    <SecondaryBtn label="SURRENDER" onClick={surrender}/>
                  )}
                </>
              )}
            </div>
          )}

          {/* ---------- New Round Button ---------- */}
          {gameState==='gameOver' && (
            <div className="mt-10 text-center fade-in-up-premium">
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                onClick={newRound}
                className="btn-premium-casino px-16 py-6 rounded-full text-3xl shadow-lg pulse-glow-premium">
                NEW ROUND
              </motion.button>
            </div>
          )}

          {message?.toUpperCase().includes('BLACKJACK') && gameState==='gameOver' && <Confetti/>}
        </div>
      </div>

      {/* ---------- MODALS ---------- */}
      {showStats && (
        <Modal onClose={()=>setShowStats(false)} title="SESSION STATISTICS">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Hands Played" value={stats.handsPlayed} color="gray"/>
            <StatCard label="Wins" value={stats.wins} color="green"/>
            <StatCard label="Losses" value={stats.losses} color="red"/>
            <StatCard label="Pushes" value={stats.pushes} color="yellow"/>
            <StatCard label="Blackjacks" value={stats.blackjacks} color="purple" icon="🂡"/>
            <StatCard label="Profit/Loss"
              value={`$${stats.profitLoss>0?'+':''}${stats.profitLoss}`}
              color={stats.profitLoss>=0?'green':'red'}/>
            {trainingMode&&stats.totalDecisions>0 && (
              <StatCard label="Strategy Accuracy"
                value={`${((stats.correctDecisions/stats.totalDecisions)*100).toFixed(1)}%`}
                subtitle={`${stats.correctDecisions} / ${stats.totalDecisions} optimal`} color="indigo"/>
            )}
          </div>
        </Modal>
      )}

      {showSettings && (
        <Modal onClose={()=>setShowSettings(false)} title="GAME SETTINGS">
          <div className="space-y-6">
            <SettingSelect label="Number of Decks" value={rules.numDecks}
              onChange={v=>setRules({...rules,numDecks:parseInt(v)})}
              options={[{value:1,label:'1 Deck'},{value:2,label:'2 Decks'},{value:6,label:'6 Decks'},{value:8,label:'8 Decks'}]}/>
            <SettingSelect label="Blackjack Pays" value={rules.blackjackPays}
              onChange={v=>setRules({...rules,blackjackPays:parseFloat(v)})}
              options={[{value:1.5,label:'3:2'},{value:1.2,label:'6:5'}]}/>
            <SettingToggle label="Dealer Hits Soft 17"
              checked={rules.dealerHitsSoft17}
              onChange={v=>setRules({...rules,dealerHitsSoft17:v})}/>
            <SettingToggle label="Double After Split (DAS)"
              checked={rules.doubleAfterSplit}
              onChange={v=>setRules({...rules,doubleAfterSplit:v})}/>
            <SettingToggle label="Surrender Allowed"
              checked={rules.surrenderAllowed}
              onChange={v=>setRules({...rules,surrenderAllowed:v})}/>
            <SettingSelect label="Maximum Splits" value={rules.maxSplits}
              onChange={v=>setRules({...rules,maxSplits:parseInt(v)})}
              options={[{value:1,label:'1 Split'},{value:2,label:'2 Splits'},{value:3,label:'3 Splits'},{value:4,label:'4 Splits'}]}/>
            <div className="pt-6 border-t border-white/10">
              <button onClick={()=>{
                const dm=new DeckManager(rules.numDecks,rules.penetration);
                setDeckManager(dm);setShowSettings(false);newRound();
              }} className="w-full btn-premium-casino px-8 py-4 rounded-full font-bold text-lg">
                APPLY SETTINGS & RESTART
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------- HOUSE RULES ---------- */}
      <div className="max-w-7xl mx-auto mt-10 fade-in-up-premium">
        <details className="glass-premium rounded-[2rem] p-5 border border-white/10">
          <summary className="cursor-pointer font-bold text-yellow-400 flex items-center gap-3 text-lg">
            <Info size={22}/> HOUSE RULES
          </summary>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
            <RuleItem text={`${rules.numDecks}-deck shoe`}/>
            <RuleItem text={`Dealer ${rules.dealerHitsSoft17?'hits':'stands'} on soft 17`}/>
            <RuleItem text={`Blackjack pays ${rules.blackjackPays===1.5?'3:2':'6:5'}`}/>
            <RuleItem text={`Double after split: ${rules.doubleAfterSplit?'Yes':'No'}`}/>
            <RuleItem text={`Surrender: ${rules.surrenderAllowed?'Allowed':'Not allowed'}`}/>
            <RuleItem text={`Maximum ${rules.maxSplits} splits allowed`}/>
          </div>
        </details>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   Helper Components
----------------------------------------------------------- */
const ActionBtn = ({label,onClick}) => (
  <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
    onClick={onClick}
    className="btn-premium-casino px-10 py-5 rounded-full text-2xl shadow-lg hover:shadow-casino-glow">
    {label}
  </motion.button>
);
const SecondaryBtn = ({label,onClick}) => (
  <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
    onClick={onClick}
    className="btn-premium-secondary px-8 py-5 rounded-full text-xl shadow-lg hover:shadow-casino-glow">
    {label}
  </motion.button>
);
const StatMini = ({label,value,glow,colorLogic,color})=>(
  <div className="glass-premium rounded-[2rem] p-4 shadow-md border border-white/10 text-center">
    <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
    {glow?<div className="text-3xl font-bold gold-shimmer">{value}</div>:
      colorLogic?
        <div className={`text-3xl font-bold ${
          value>2?'text-green-400':value<-2?'text-red-400':'text-gray-300'
        }`}>{value>0?`+${value}`:value}</div>:
        <div className={`text-3xl font-bold ${color}`}>{value}</div>}
  </div>
);
const IconBtn=({icon,tooltip,onClick})=>(
  <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}}
    onClick={onClick} title={tooltip}
    className="glass-premium p-3 rounded-full border border-transparent hover:border-casino-gold transition-all">
    {icon}
  </motion.button>
);
const RuleItem=({text})=>(
  <div className="flex items-center gap-2"><span className="text-green-400">✓</span><span>{text}</span></div>
);

/* ----------------- Card display ----------------- */
function Card({card,hidden=false}) {
  const isRed = card.suit==='♥'||card.suit==='♦';
  if(hidden){
    return (
      <div className="w-28 h-40 rounded-[1.5rem] border border-blue-800 
                      bg-gradient-to-br from-blue-900 to-blue-950 shadow-xl 
                      flex items-center justify-center backdrop-blur-sm">
        <div className="text-5xl text-blue-600">♠</div>
      </div>);
  }
  return (
    <div className="w-28 h-40 rounded-[1.5rem] border border-white/20 
                    bg-gradient-to-br from-white/90 to-white/70 shadow-xl 
                    backdrop-blur-sm p-3 flex flex-col justify-between 
                    transition-transform duration-300 hover:scale-[1.04] hover:shadow-casino-glow">
      <div className={`text-2xl font-bold ${isRed?'text-red-600':'text-black'}`}>
        <div className="font-mono leading-none">{card.value}</div>
        <div className="text-4xl leading-none">{card.suit}</div>
      </div>
      <div className="text-center text-5xl">{isRed?<span className="text-red-600">{card.suit}</span>:card.suit}</div>
      <div className={`text-2xl font-bold text-right rotate-180 ${isRed?'text-red-600':'text-black'}`}>
        <div className="font-mono leading-none">{card.value}</div>
        <div className="text-4xl leading-none">{card.suit}</div>
      </div>
    </div>);
}

/* ----------------- Modal ----------------- */
function Modal({children,onClose,title}) {
  return (
    <div className="fixed inset-0 modal-backdrop-premium flex items-center justify-center p-4 z-50 fade-in-up-premium">
      <div className="glass-premium rounded-[2.5rem] border border-white/10 backdrop-blur-xl 
                      max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 glass-premium border-b border-white/10 
                        p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-yellow-400 tracking-wider">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-all hover:scale-110">
            <X size={28}/>
          </button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>);
}

/* ----------------- Stat Card ----------------- */
function StatCard({label,value,color,icon,subtitle}) {
  const colors={
    gray:'from-gray-700 to-gray-800',
    green:'from-green-700 to-green-900',
    red:'from-red-700 to-red-900',
    yellow:'from-yellow-600 to-yellow-800',
    purple:'from-purple-700 to-purple-900',
    blue:'from-blue-700 to-blue-900',
    indigo:'from-indigo-700 to-indigo-900'
  };
  return (
    <div className={`glass-premium rounded-[2rem] p-6 shadow-lg hover:shadow-casino-glow 
                     hover:scale-[1.02] transition-all bg-gradient-to-br ${colors[color]}`}>
      <div className="text-gray-300 text-sm uppercase mb-2">{label}</div>
      <div className="text-4xl font-bold font-mono flex items-center gap-2">
        {icon && <span className="text-3xl">{icon}</span>}{value}
      </div>
      {subtitle && <div className="text-xs text-gray-400 mt-2">{subtitle}</div>}
    </div>);
}

/* ----------------- Setting controls ----------------- */
function SettingSelect({label,value,onChange,options}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-gray-300">{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)}
        className="w-full glass-premium border border-white/10 rounded-[1.5rem] p-3 
                   text-white font-semibold focus:ring-2 focus:ring-yellow-400 focus:outline-none">
        {options.map(o=><option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>)}
      </select>
    </div>);
}
const SettingToggle=({label,checked,onChange})=>(
  <label className="flex items-center justify-between cursor-pointer glass-premium 
                    p-5 rounded-[1.5rem] border border-white/10 hover:bg-white/5 transition-all">
    <span className="font-semibold text-gray-200">{label}</span>
    <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}
      className="w-6 h-6 cursor-pointer accent-casino-gold"/>
  </label>
);

export default BlackjackGame;
