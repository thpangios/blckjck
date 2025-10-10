import React, { useState, useEffect } from 'react';
import { Settings, TrendingUp, Brain, BarChart3, RotateCcw, Info, X } from 'lucide-react';
import { DeckManager } from './utils/deckManager';
import { HandCalculator } from './utils/handCalculator';
import { BasicStrategy } from './utils/basicStrategy';

function App() {
  // Game state
  const [deckManager, setDeckManager] = useState(null);
  const [playerHands, setPlayerHands] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [balance, setBalance] = useState(1000);
  const [gameState, setGameState] = useState('betting'); // betting, playing, dealer, gameOver
  const [message, setMessage] = useState('Place your bet to start!');
  const [showDealerCard, setShowDealerCard] = useState(false);

  // Settings and rules
  const [rules, setRules] = useState({
    numDecks: 6,
    penetration: 0.75,
    dealerHitsSoft17: false,
    blackjackPays: 1.5, // 3:2
    doubleAfterSplit: true,
    resplitAces: false,
    hitSplitAces: false,
    maxSplits: 3,
    surrenderAllowed: false,
    insuranceAllowed: true
  });

  // Training mode
  const [trainingMode, setTrainingMode] = useState(true);
  const [showStrategy, setShowStrategy] = useState(false);
  const [strategyAdvice, setStrategyAdvice] = useState(null);
  const [showProbabilities, setShowProbabilities] = useState(false);
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

  // Initialize deck manager
  useEffect(() => {
    const dm = new DeckManager(rules.numDecks, rules.penetration);
    setDeckManager(dm);
  }, [rules.numDecks, rules.penetration]);

  // Initialize basic strategy
  const basicStrategy = new BasicStrategy(rules);

  // Place bet
  const placeBet = (amount) => {
    if (balance >= amount && gameState === 'betting') {
      const newHand = {
        cards: [],
        bet: amount,
        status: 'active', // active, stood, busted, blackjack
        doubled: false,
        surrendered: false
      };
      setPlayerHands([newHand]);
      setBalance(balance - amount);
      startGame([newHand]);
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

    // Check for player blackjack
    if (HandCalculator.isBlackjack([card1, card2])) {
      setShowDealerCard(true);
      if (HandCalculator.isBlackjack([dealerCard1, dealerCard2])) {
        setMessage('Push! Both have Blackjack!');
        resolveHand(updatedHands[0], 'push');
      } else {
        setMessage('Blackjack! You win!');
        resolveHand(updatedHands[0], 'blackjack');
      }
      return;
    }

    // Show strategy advice in training mode
    if (trainingMode) {
      updateStrategyAdvice(updatedHands[0].cards, dealerCard1, true, true, 1);
    }

    setMessage('Your turn! What will you do?');
  };

  // Update strategy advice
  const updateStrategyAdvice = (playerCards, dealerCard, canDouble, canSplit, handCount) => {
    const advice = basicStrategy.getOptimalPlay(
      playerCards,
      dealerCard,
      canDouble,
      canSplit,
      handCount
    );
    setStrategyAdvice(advice);
  };

  // Check decision correctness
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

  // Player hits
  const hit = () => {
    checkDecision('HIT');

    const currentHand = playerHands[currentHandIndex];
    const newCard = deckManager.dealCard();
    const updatedCards = [...currentHand.cards, newCard];

    const updatedHands = [...playerHands];
    updatedHands[currentHandIndex] = {
      ...currentHand,
      cards: updatedCards
    };
    setPlayerHands(updatedHands);

    const handValue = HandCalculator.calculateValue(updatedCards);

    if (handValue > 21) {
      updatedHands[currentHandIndex].status = 'busted';
      setPlayerHands(updatedHands);
      if (currentHandIndex < playerHands.length - 1) {
        setCurrentHandIndex(currentHandIndex + 1);
        setMessage(`Hand ${currentHandIndex + 2} - Your turn!`);
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
        setMessage('Bust! All hands complete.');
        endGame(updatedHands);
      }
    } else if (handValue === 21) {
      stand();
    } else {
      if (trainingMode) {
        updateStrategyAdvice(
          updatedCards,
          dealerHand[0],
          false,
          false,
          playerHands.length
        );
      }
    }
  };

  // Player stands
  const stand = () => {
    checkDecision('STAND');

    const updatedHands = [...playerHands];
    updatedHands[currentHandIndex].status = 'stood';
    setPlayerHands(updatedHands);

    if (currentHandIndex < playerHands.length - 1) {
      setCurrentHandIndex(currentHandIndex + 1);
      setMessage(`Hand ${currentHandIndex + 2} - Your turn!`);
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
      setMessage('All hands complete. Dealer playing...');
      setShowDealerCard(true);
      setGameState('dealer');
      setTimeout(() => playDealer(updatedHands), 1000);
    }
  };

  // Double down
  const doubleDown = () => {
    const currentHand = playerHands[currentHandIndex];
    
    if (balance < currentHand.bet) {
      setMessage('Insufficient balance to double down!');
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
        setMessage(`Hand ${currentHandIndex + 2} - Your turn!`);
      }, 500);
    } else {
      setTimeout(() => {
        setMessage('All hands complete. Dealer playing...');
        setShowDealerCard(true);
        setGameState('dealer');
        setTimeout(() => playDealer(updatedHands), 1000);
      }, 500);
    }
  };

  // Split
  const split = () => {
    const currentHand = playerHands[currentHandIndex];
    
    if (balance < currentHand.bet) {
      setMessage('Insufficient balance to split!');
      return;
    }

    if (playerHands.length >= rules.maxSplits + 1) {
      setMessage(`Maximum ${rules.maxSplits} splits allowed!`);
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

    setMessage(`Hand ${currentHandIndex + 1} - Your turn!`);

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

  // Surrender
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
      setMessage(`Hand ${currentHandIndex + 2} - Your turn!`);
    } else {
      setMessage('Hand surrendered. Round complete.');
      endGame(updatedHands);
    }
  };

  // Dealer plays
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

  // Resolve all hands
  const resolveAllHands = (hands, finalDealerHand) => {
    const dealerValue = HandCalculator.calculateValue(finalDealerHand);
    const dealerBusted = dealerValue > 21;

    let totalWinnings = 0;
    let wins = 0;
    let losses = 0;
    let pushes = 0;

    hands.forEach(hand => {
      if (hand.status === 'surrendered') {
        return; // Already handled
      }

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

    const resultMsg = `${wins} Win${wins !== 1 ? 's' : ''}, ${losses} Loss${losses !== 1 ? 'es' : ''}, ${pushes} Push${pushes !== 1 ? 'es' : ''}`;
    setMessage(resultMsg);
    setGameState('gameOver');
  };

  // Resolve single hand
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
    }

    setBalance(prev => prev + winnings);
    setGameState('gameOver');
  };

  // End game
  const endGame = (hands) => {
    setGameState('gameOver');
  };

  // New round
  const newRound = () => {
    setPlayerHands([]);
    setDealerHand([]);
    setCurrentHandIndex(0);
    setGameState('betting');
    setMessage('Place your bet to start!');
    setShowDealerCard(false);
    setStrategyAdvice(null);
    setLastDecision(null);
  };

  // Reset game
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
    if (deckManager) {
      deckManager.initialize();
    }
    newRound();
  };

  if (!deckManager) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  const currentHand = playerHands[currentHandIndex];
  const canDouble = currentHand && currentHand.cards.length === 2 && gameState === 'playing';
  const canSplit = currentHand && HandCalculator.canSplit(currentHand.cards) && 
                   playerHands.length <= rules.maxSplits && gameState === 'playing';
  const canSurrender = rules.surrenderAllowed && currentHand && 
                       currentHand.cards.length === 2 && gameState === 'playing';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-black bg-opacity-50 rounded-lg p-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-yellow-400">♠♥ BLACKJACK TRAINING ♦♣</div>
            </div>
            
            <div className="flex gap-4 items-center flex-wrap">
              <div className="text-center">
                <div className="text-xs text-gray-400">Balance</div>
                <div className="text-2xl font-bold text-green-400">${balance}</div>
              </div>

              <div className="text-center">
                <div className="text-xs text-gray-400">True Count</div>
                <div className="text-xl font-mono text-yellow-400">
                  {deckManager.getTrueCount() > 0 ? '+' : ''}{deckManager.getTrueCount()}
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-gray-400">Penetration</div>
                <div className="text-sm">{deckManager.getPenetration()}%</div>
              </div>

              <button
                onClick={() => setShowStats(!showStats)}
                className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition"
                title="Statistics"
              >
                <BarChart3 size={20} />
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-purple-600 hover:bg-purple-700 p-2 rounded-lg transition"
                title="Settings"
              >
                <Settings size={20} />
              </button>

              <button
                onClick={resetGame}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          </div>

          {/* Training Mode Toggle */}
          <div className="mt-4 flex gap-4 items-center justify-center flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trainingMode}
                onChange={(e) => setTrainingMode(e.target.checked)}
                className="w-5 h-5"
              />
              <Brain size={20} className="text-blue-400" />
              <span className="font-semibold">Training Mode</span>
            </label>

            {trainingMode && (
              <>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showStrategy}
                    onChange={(e) => setShowStrategy(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Show Strategy Hints</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showProbabilities}
                    onChange={(e) => setShowProbabilities(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Show Probabilities</span>
                </label>
              </>
            )}
          </div>

          {/* Strategy Advice */}
          {trainingMode && showStrategy && strategyAdvice && gameState === 'playing' && (
            <div className="mt-4 bg-blue-900 bg-opacity-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-yellow-400" />
                <span className="font-bold text-yellow-400">Optimal Play:</span>
              </div>
              <div className="text-lg font-bold text-white">{strategyAdvice.action}</div>
              <div className="text-sm text-gray-300">{strategyAdvice.reason}</div>
            </div>
          )}

          {/* Last Decision Feedback */}
          {lastDecision && (
            <div className={`mt-4 rounded-lg p-3 ${lastDecision.correct ? 'bg-green-900 bg-opacity-50' : 'bg-red-900 bg-opacity-50'}`}>
              <div className="font-bold">
                {lastDecision.correct ? '✓ Correct!' : '✗ Not Optimal'}
              </div>
              {!lastDecision.correct && (
                <div className="text-sm">
                  You chose {lastDecision.action}, but {lastDecision.optimal} was optimal.
                  <br />
                  <span className="text-gray-300">{lastDecision.reason}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Game Table */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-green-800 rounded-3xl shadow-2xl p-8 relative border-8 border-yellow-900">
          {/* Dealer Section */}
          <div className="mb-12">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">DEALER</h2>
              {dealerHand.length > 0 && (
                <div className="text-xl">
                  {showDealerCard 
                    ? `Hand Value: ${HandCalculator.calculateValue(dealerHand)}`
                    : `Showing: ${dealerHand[0].value}${dealerHand[0].suit}`
                  }
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-2 flex-wrap">
              {dealerHand.map((card, index) => (
                <Card 
                  key={card.id} 
                  card={card} 
                  hidden={index === 1 && !showDealerCard}
                />
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="text-center my-8">
            <div className="bg-black bg-opacity-60 inline-block px-8 py-4 rounded-lg">
              <p className="text-2xl font-bold text-yellow-300">{message}</p>
            </div>
          </div>

          {/* Player Section */}
          <div>
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">PLAYER</h2>
            </div>
            
            <div className="flex justify-center gap-4 flex-wrap">
              {playerHands.map((hand, index) => (
                <div 
                  key={index}
                  className={`border-4 rounded-lg p-4 ${
                    index === currentHandIndex && gameState === 'playing'
                      ? 'border-yellow-400 bg-yellow-900 bg-opacity-20'
                      : 'border-transparent'
                  }`}
                >
                  <div className="text-center mb-2">
                    <div className="font-bold">
                      Hand {index + 1}
                      {hand.status === 'busted' && <span className="text-red-400 ml-2">(BUST)</span>}
                      {hand.status === 'stood' && <span className="text-blue-400 ml-2">(STOOD)</span>}
                      {hand.status === 'surrendered' && <span className="text-orange-400 ml-2">(SURRENDER)</span>}
                      {hand.status === 'blackjack' && <span className="text-yellow-400 ml-2">(BLACKJACK!)</span>}
                    </div>
                    <div className="text-lg">
                      Value: {HandCalculator.calculateValue(hand.cards)}
                      {HandCalculator.isSoft(hand.cards) && <span className="text-sm text-gray-300"> (soft)</span>}
                    </div>
                    <div className="text-green-400">${hand.bet}{hand.doubled && ' (Doubled)'}</div>
                  </div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {hand.cards.map((card) => (
                      <Card key={card.id} card={card} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Betting Area */}
          {gameState === 'betting' && (
            <div className="mt-12">
              <div className="bg-black bg-opacity-40 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-center mb-4 text-yellow-400">Place Your Bet</h3>
                <div className="flex justify-center gap-4 flex-wrap">
                  {[5, 10, 25, 50, 100, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => placeBet(amount)}
                      disabled={balance < amount}
                      className={`relative w-20 h-20 rounded-full border-4 font-bold text-lg transition-transform hover:scale-110 ${
                        amount === 5 ? 'bg-white text-black border-gray-300' :
                        amount === 10 ? 'bg-red-600 border-red-800' :
                        amount === 25 ? 'bg-green-600 border-green-800' :
                        amount === 50 ? 'bg-blue-600 border-blue-800' :
                        amount === 100 ? 'bg-black text-white border-gray-600' :
                        'bg-purple-600 border-purple-800'
                      } ${balance < amount ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {gameState === 'playing' && (
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              <button
                onClick={hit}
                className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg font-bold text-xl transition"
              >
                HIT
              </button>
              <button
                onClick={stand}
                className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-lg font-bold text-xl transition"
              >
                STAND
              </button>
              {canDouble && balance >= currentHand.bet && (
                <button
                  onClick={doubleDown}
                  className="bg-yellow-600 hover:bg-yellow-700 px-6 py-4 rounded-lg font-bold text-xl transition"
                >
                  DOUBLE
                </button>
              )}
              {canSplit && balance >= currentHand.bet && (
                <button
                  onClick={split}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-4 rounded-lg font-bold text-xl transition"
                >
                  SPLIT
                </button>
              )}
              {canSurrender && (
                <button
                  onClick={surrender}
                  className="bg-orange-600 hover:bg-orange-700 px-6 py-4 rounded-lg font-bold text-xl transition"
                >
                  SURRENDER
                </button>
              )}
            </div>
          )}

          {/* New Round Button */}
          {gameState === 'gameOver' && (
            <div className="mt-8 text-center">
              <button
                onClick={newRound}
                className="bg-green-600 hover:bg-green-700 px-12 py-4 rounded-lg font-bold text-2xl transition"
              >
                NEW ROUND
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Modal */}
      {showStats && (
        <Modal onClose={() => setShowStats(false)} title="Session Statistics">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-gray-400 text-sm">Hands Played</div>
              <div className="text-3xl font-bold">{stats.handsPlayed}</div>
            </div>
            <div className="bg-green-900 p-4 rounded-lg">
              <div className="text-gray-300 text-sm">Wins</div>
              <div className="text-3xl font-bold text-green-400">{stats.wins}</div>
            </div>
            <div className="bg-red-900 p-4 rounded-lg">
              <div className="text-gray-300 text-sm">Losses</div>
              <div className="text-3xl font-bold text-red-400">{stats.losses}</div>
            </div>
            <div className="bg-yellow-900 p-4 rounded-lg">
              <div className="text-gray-300 text-sm">Pushes</div>
              <div className="text-3xl font-bold text-yellow-400">{stats.pushes}</div>
            </div>
            <div className="bg-purple-900 p-4 rounded-lg">
              <div className="text-gray-300 text-sm">Blackjacks</div>
              <div className="text-3xl font-bold text-purple-400">{stats.blackjacks}</div>
            </div>
            <div className={`p-4 rounded-lg ${stats.profitLoss >= 0 ? 'bg-green-900' : 'bg-red-900'}`}>
              <div className="text-gray-300 text-sm">Profit/Loss</div>
              <div className={`text-3xl font-bold ${stats.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${stats.profitLoss > 0 ? '+' : ''}{stats.profitLoss}
              </div>
            </div>
            <div className="bg-blue-900 p-4 rounded-lg col-span-2">
              <div className="text-gray-300 text-sm">Win Rate</div>
              <div className="text-3xl font-bold text-blue-400">
                {stats.handsPlayed > 0 ? ((stats.wins / stats.handsPlayed) * 100).toFixed(1) : 0}%
              </div>
            </div>
            {trainingMode && stats.totalDecisions > 0 && (
              <div className="bg-indigo-900 p-4 rounded-lg col-span-2">
                <div className="text-gray-300 text-sm">Strategy Accuracy</div>
                <div className="text-3xl font-bold text-indigo-400">
                  {((stats.correctDecisions / stats.totalDecisions) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {stats.correctDecisions} / {stats.totalDecisions} optimal decisions
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Modal onClose={() => setShowSettings(false)} title="Game Settings">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Number of Decks</label>
              <select
                value={rules.numDecks}
                onChange={(e) => setRules({...rules, numDecks: parseInt(e.target.value)})}
                className="w-full bg-gray-800 border border-gray-600 rounded p-2"
              >
                <option value="1">1 Deck</option>
                <option value="2">2 Decks</option>
                <option value="6">6 Decks</option>
                <option value="8">8 Decks</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Blackjack Pays</label>
              <select
                value={rules.blackjackPays}
                onChange={(e) => setRules({...rules, blackjackPays: parseFloat(e.target.value)})}
                className="w-full bg-gray-800 border border-gray-600 rounded p-2"
              >
                <option value="1.5">3:2</option>
                <option value="1.2">6:5</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rules.dealerHitsSoft17}
                onChange={(e) => setRules({...rules, dealerHitsSoft17: e.target.checked})}
                className="w-5 h-5"
              />
              <span>Dealer Hits Soft 17</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rules.doubleAfterSplit}
                onChange={(e) => setRules({...rules, doubleAfterSplit: e.target.checked})}
                className="w-5 h-5"
              />
              <span>Double After Split (DAS)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rules.surrenderAllowed}
                onChange={(e) => setRules({...rules, surrenderAllowed: e.target.checked})}
                className="w-5 h-5"
              />
              <span>Surrender Allowed</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rules.resplitAces}
                onChange={(e) => setRules({...rules, resplitAces: e.target.checked})}
                className="w-5 h-5"
              />
              <span>Re-split Aces</span>
            </label>

            <div>
              <label className="block text-sm font-semibold mb-2">Maximum Splits</label>
              <select
                value={rules.maxSplits}
                onChange={(e) => setRules({...rules, maxSplits: parseInt(e.target.value)})}
                className="w-full bg-gray-800 border border-gray-600 rounded p-2"
              >
                <option value="1">1 Split</option>
                <option value="2">2 Splits</option>
                <option value="3">3 Splits</option>
                <option value="4">4 Splits</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  const dm = new DeckManager(rules.numDecks, rules.penetration);
                  setDeckManager(dm);
                  setShowSettings(false);
                  newRound();
                }}
                className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold transition"
              >
                Apply Settings & Restart
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rules Info */}
      <div className="max-w-7xl mx-auto mt-6">
        <details className="bg-black bg-opacity-50 rounded-lg p-4">
          <summary className="cursor-pointer font-bold text-yellow-400 flex items-center gap-2">
            <Info size={20} />
            Current House Rules
          </summary>
          <div className="mt-4 text-sm space-y-2 text-gray-300">
            <p>• {rules.numDecks}-deck shoe</p>
            <p>• Dealer {rules.dealerHitsSoft17 ? 'hits' : 'stands'} on soft 17</p>
            <p>• Blackjack pays {rules.blackjackPays === 1.5 ? '3:2' : '6:5'}</p>
            <p>• Double after split: {rules.doubleAfterSplit ? 'Yes' : 'No'}</p>
            <p>• Surrender: {rules.surrenderAllowed ? 'Allowed' : 'Not allowed'}</p>
            <p>• Re-split aces: {rules.resplitAces ? 'Yes' : 'No'}</p>
            <p>• Maximum splits: {rules.maxSplits}</p>
            <p>• Reshuffled at {(rules.penetration * 100).toFixed(0)}% penetration</p>
          </div>
        </details>
      </div>
    </div>
  );
}

// Card Component
function Card({ card, hidden = false }) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  
  if (hidden) {
    return (
      <div className="w-24 h-36 bg-blue-900 border-2 border-blue-700 rounded-lg flex items-center justify-center shadow-lg">
        <div className="text-4xl text-blue-700">♠</div>
      </div>
    );
  }
  
  return (
    <div className="w-24 h-36 bg-white rounded-lg shadow-lg border-2 border-gray-300 p-2 flex flex-col justify-between transform transition-transform hover:scale-105">
      <div className={`text-2xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
        {card.value}
        <div className="text-3xl">{card.suit}</div>
      </div>
      <div className={`text-2xl font-bold text-right ${isRed ? 'text-red-600' : 'text-black'} rotate-180`}>
        {card.value}
        <div className="text-3xl">{card.suit}</div>
      </div>
    </div>
  );
}

// Modal Component
function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-yellow-400">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default App;
