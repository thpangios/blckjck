import React, { useState, useEffect } from 'react';
import { DollarSign, RotateCcw, Info } from 'lucide-react';

// Card suits and values
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Create a shoe with multiple decks
const createShoe = (numDecks = 6) => {
  const shoe = [];
  for (let i = 0; i < numDecks; i++) {
    for (let suit of SUITS) {
      for (let value of VALUES) {
        shoe.push({ suit, value, id: `${value}${suit}-${i}` });
      }
    }
  }
  return shuffle(shoe);
};

// Shuffle array
const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Calculate hand value
const calculateHandValue = (hand) => {
  let value = 0;
  let aces = 0;

  for (let card of hand) {
    if (card.value === 'A') {
      aces += 1;
      value += 11;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }

  return value;
};

// Check if hand is blackjack
const isBlackjack = (hand) => {
  return hand.length === 2 && calculateHandValue(hand) === 21;
};

function App() {
  const [shoe, setShoe] = useState(createShoe(6));
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [splitHand, setSplitHand] = useState(null);
  const [currentHand, setCurrentHand] = useState('main'); // 'main' or 'split'
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(0);
  const [splitBet, setSplitBet] = useState(0);
  const [gameState, setGameState] = useState('betting'); // betting, playing, dealer, gameOver
  const [message, setMessage] = useState('Place your bet!');
  const [showDealerCard, setShowDealerCard] = useState(false);
  const [cardsDealt, setCardsDealt] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [ties, setTies] = useState(0);
  const [canDouble, setCanDouble] = useState(false);
  const [canSplit, setCanSplit] = useState(false);
  const [canInsurance, setCanInsurance] = useState(false);
  const [insurance, setInsurance] = useState(false);
  const [insuranceBet, setInsuranceBet] = useState(0);

  // Check if shoe needs reshuffling (25% penetration remaining)
  useEffect(() => {
    const totalCards = 6 * 52;
    const cardsRemaining = shoe.length;
    if (cardsRemaining < totalCards * 0.25 && gameState === 'betting') {
      setShoe(createShoe(6));
      setCardsDealt(0);
      setMessage('Shuffling new shoe...');
      setTimeout(() => setMessage('Place your bet!'), 1500);
    }
  }, [shoe.length, gameState]);

  // Deal a card from shoe
  const dealCard = () => {
    if (shoe.length === 0) {
      setShoe(createShoe(6));
      setCardsDealt(0);
      return shoe[0];
    }
    const card = shoe[0];
    setShoe(shoe.slice(1));
    setCardsDealt(prev => prev + 1);
    return card;
  };

  // Place bet
  const placeBet = (amount) => {
    if (balance >= amount && gameState === 'betting') {
      setBet(amount);
    }
  };

  // Start new game
  const startGame = () => {
    if (bet === 0 || bet > balance) {
      setMessage('Please place a valid bet!');
      return;
    }

    setBalance(balance - bet);
    const card1 = dealCard();
    const card2 = dealCard();
    const dealerCard1 = dealCard();
    const dealerCard2 = dealCard();

    setPlayerHand([card1, card2]);
    setDealerHand([dealerCard1, dealerCard2]);
    setGameState('playing');
    setShowDealerCard(false);
    setSplitHand(null);
    setCurrentHand('main');
    setInsurance(false);
    setInsuranceBet(0);

    // Check for player blackjack
    if (isBlackjack([card1, card2])) {
      if (dealerCard1.value === 'A' || ['K', 'Q', 'J', '10'].includes(dealerCard1.value)) {
        setShowDealerCard(true);
        if (isBlackjack([dealerCard1, dealerCard2])) {
          setMessage('Push! Both have Blackjack!');
          setBalance(balance);
          setTies(ties + 1);
          setGameState('gameOver');
        } else {
          setMessage('Blackjack! You win 3:2!');
          setBalance(balance + bet * 2.5);
          setWins(wins + 1);
          setGameState('gameOver');
        }
      } else {
        setShowDealerCard(true);
        setMessage('Blackjack! You win 3:2!');
        setBalance(balance + bet * 2.5);
        setWins(wins + 1);
        setGameState('gameOver');
      }
      return;
    }

    // Check for insurance
    if (dealerCard1.value === 'A') {
      setCanInsurance(true);
      setMessage('Dealer showing Ace. Insurance?');
    } else {
      setMessage('Your turn!');
    }

    // Check for double down (first two cards)
    setCanDouble(true);

    // Check for split
    if (card1.value === card2.value) {
      setCanSplit(balance >= bet);
    } else {
      setCanSplit(false);
    }
  };

  // Player hits
  const hit = () => {
    const hand = currentHand === 'main' ? playerHand : splitHand;
    const newCard = dealCard();
    const newHand = [...hand, newCard];

    if (currentHand === 'main') {
      setPlayerHand(newHand);
    } else {
      setSplitHand(newHand);
    }

    setCanDouble(false);
    setCanSplit(false);
    setCanInsurance(false);

    const handValue = calculateHandValue(newHand);
    if (handValue > 21) {
      if (currentHand === 'main' && splitHand !== null) {
        setCurrentHand('split');
        setMessage('Playing split hand...');
        setCanDouble(splitHand.length === 2);
      } else {
        setMessage('Bust! Dealer wins!');
        setLosses(losses + 1);
        setGameState('gameOver');
      }
    } else if (handValue === 21) {
      stand();
    }
  };

  // Player stands
  const stand = () => {
    if (currentHand === 'main' && splitHand !== null) {
      setCurrentHand('split');
      setMessage('Playing split hand...');
      setCanDouble(splitHand.length === 2);
      setCanSplit(false);
      setCanInsurance(false);
      return;
    }

    setCanDouble(false);
    setCanSplit(false);
    setCanInsurance(false);
    setGameState('dealer');
    setShowDealerCard(true);
    playDealer();
  };

  // Dealer plays
  const playDealer = () => {
    setTimeout(() => {
      let currentDealerHand = [...dealerHand];
      let dealerValue = calculateHandValue(currentDealerHand);

      const dealerInterval = setInterval(() => {
        // Dealer hits on 16 or less, stands on soft 17
        if (dealerValue < 17 || (dealerValue === 17 && currentDealerHand.some(c => c.value === 'A') && 
            calculateHandValue(currentDealerHand.filter(c => c.value !== 'A')) + 11 + 
            (currentDealerHand.filter(c => c.value === 'A').length - 1) === 17)) {
          const newCard = dealCard();
          currentDealerHand = [...currentDealerHand, newCard];
          setDealerHand(currentDealerHand);
          dealerValue = calculateHandValue(currentDealerHand);
        } else {
          clearInterval(dealerInterval);
          determineWinner(currentDealerHand);
        }
      }, 800);
    }, 500);
  };

  // Determine winner
  const determineWinner = (finalDealerHand) => {
    const dealerValue = calculateHandValue(finalDealerHand);
    const playerValue = calculateHandValue(playerHand);
    const splitValue = splitHand ? calculateHandValue(splitHand) : null;

    let totalWinnings = 0;
    let winCount = 0;
    let lossCount = 0;
    let tieCount = 0;
    let resultMessage = '';

    // Check main hand
    if (playerValue > 21) {
      resultMessage += 'Main hand: Bust! ';
      lossCount++;
    } else if (dealerValue > 21) {
      resultMessage += 'Main hand: Dealer bust! You win! ';
      totalWinnings += bet * 2;
      winCount++;
    } else if (playerValue > dealerValue) {
      resultMessage += 'Main hand: You win! ';
      totalWinnings += bet * 2;
      winCount++;
    } else if (playerValue < dealerValue) {
      resultMessage += 'Main hand: Dealer wins! ';
      lossCount++;
    } else {
      resultMessage += 'Main hand: Push! ';
      totalWinnings += bet;
      tieCount++;
    }

    // Check split hand
    if (splitHand !== null) {
      if (splitValue > 21) {
        resultMessage += 'Split hand: Bust!';
        lossCount++;
      } else if (dealerValue > 21) {
        resultMessage += 'Split hand: Dealer bust! You win!';
        totalWinnings += splitBet * 2;
        winCount++;
      } else if (splitValue > dealerValue) {
        resultMessage += 'Split hand: You win!';
        totalWinnings += splitBet * 2;
        winCount++;
      } else if (splitValue < dealerValue) {
        resultMessage += 'Split hand: Dealer wins!';
        lossCount++;
      } else {
        resultMessage += 'Split hand: Push!';
        totalWinnings += splitBet;
        tieCount++;
      }
    }

    // Insurance payout
    if (insurance && isBlackjack(finalDealerHand)) {
      totalWinnings += insuranceBet * 3;
      resultMessage += ' Insurance pays 2:1!';
    }

    setBalance(balance => balance + totalWinnings);
    setWins(wins => wins + winCount);
    setLosses(losses => losses + lossCount);
    setTies(ties => ties + tieCount);
    setMessage(resultMessage);
    setGameState('gameOver');
  };

  // Double down
  const doubleDown = () => {
    if (balance < bet) {
      setMessage('Insufficient balance to double down!');
      return;
    }

    setBalance(balance - bet);
    if (currentHand === 'main') {
      setBet(bet * 2);
    } else {
      setSplitBet(splitBet * 2);
    }

    const newCard = dealCard();
    if (currentHand === 'main') {
      setPlayerHand([...playerHand, newCard]);
    } else {
      setSplitHand([...splitHand, newCard]);
    }

    setCanDouble(false);
    setCanSplit(false);
    setCanInsurance(false);
    
    setTimeout(() => stand(), 500);
  };

  // Split hand
  const split = () => {
    if (balance < bet || !canSplit) return;

    setBalance(balance - bet);
    setSplitBet(bet);
    
    const card1 = playerHand[0];
    const card2 = playerHand[1];
    
    const newCard1 = dealCard();
    const newCard2 = dealCard();
    
    setPlayerHand([card1, newCard1]);
    setSplitHand([card2, newCard2]);
    setCurrentHand('main');
    setCanSplit(false);
    setCanDouble(true);
    setCanInsurance(false);
    setMessage('Playing first hand...');
  };

  // Take insurance
  const takeInsurance = () => {
    const insuranceAmount = bet / 2;
    if (balance < insuranceAmount) {
      setMessage('Insufficient balance for insurance!');
      return;
    }

    setBalance(balance - insuranceAmount);
    setInsuranceBet(insuranceAmount);
    setInsurance(true);
    setCanInsurance(false);
    setMessage('Insurance taken. Your turn!');
  };

  // Decline insurance
  const declineInsurance = () => {
    setCanInsurance(false);
    setMessage('Your turn!');
  };

  // New round
  const newRound = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setSplitHand(null);
    setBet(0);
    setSplitBet(0);
    setGameState('betting');
    setMessage('Place your bet!');
    setShowDealerCard(false);
    setCanDouble(false);
    setCanSplit(false);
    setCanInsurance(false);
    setInsurance(false);
    setInsuranceBet(0);
    setCurrentHand('main');
  };

  // Reset game
  const resetGame = () => {
    setBalance(1000);
    setWins(0);
    setLosses(0);
    setTies(0);
    setShoe(createShoe(6));
    setCardsDealt(0);
    newRound();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-black bg-opacity-50 rounded-lg p-4 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-yellow-400">♠♥ BLACKJACK ♦♣</div>
          </div>
          
          <div className="flex gap-6 items-center flex-wrap">
            <div className="text-center">
              <div className="text-xs text-gray-400">Balance</div>
              <div className="text-2xl font-bold text-green-400">${balance}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Cards Dealt</div>
              <div className="text-lg">{cardsDealt} / {6 * 52}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Record</div>
              <div className="text-sm">
                <span className="text-green-400">{wins}W</span> - 
                <span className="text-red-400">{losses}L</span> - 
                <span className="text-yellow-400">{ties}T</span>
              </div>
            </div>
            <button
              onClick={resetGame}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
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
                    ? `Hand Value: ${calculateHandValue(dealerHand)}`
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
              <div className="flex justify-center gap-8">
                {playerHand.length > 0 && (
                  <div className="text-xl">
                    Main Hand: {calculateHandValue(playerHand)}
                    {bet > 0 && <span className="text-green-400 ml-2">(${bet})</span>}
                    {currentHand === 'main' && splitHand && (
                      <span className="ml-2 text-yellow-400">← ACTIVE</span>
                    )}
                  </div>
                )}
                {splitHand && (
                  <div className="text-xl">
                    Split Hand: {calculateHandValue(splitHand)}
                    <span className="text-green-400 ml-2">(${splitBet})</span>
                    {currentHand === 'split' && (
                      <span className="ml-2 text-yellow-400">← ACTIVE</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center gap-8">
              {/* Main Hand */}
              <div className="flex gap-2 flex-wrap justify-center">
                {playerHand.map((card) => (
                  <Card key={card.id} card={card} />
                ))}
              </div>

              {/* Split Hand */}
              {splitHand && (
                <div className="flex gap-2 flex-wrap justify-center">
                  {splitHand.map((card) => (
                    <Card key={card.id} card={card} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Betting Area */}
          {gameState === 'betting' && (
            <div className="mt-12">
              <div className="bg-black bg-opacity-40 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-center mb-4 text-yellow-400">Place Your Bet</h3>
                <div className="flex justify-center gap-4 flex-wrap mb-4">
                  {[5, 25, 100, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => placeBet(amount)}
                      disabled={balance < amount}
                      className={`relative w-20 h-20 rounded-full border-4 font-bold text-lg transition-transform hover:scale-110 ${
                        bet === amount ? 'ring-4 ring-yellow-400' : ''
                      } ${
                        amount === 5 ? 'bg-red-600 border-red-800' :
                        amount === 25 ? 'bg-green-600 border-green-800' :
                        amount === 100 ? 'bg-blue-600 border-blue-800' :
                        'bg-purple-600 border-purple-800'
                      } ${balance < amount ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                {bet > 0 && (
                  <div className="text-center">
                    <p className="text-lg mb-4">Current bet: <span className="text-green-400 font-bold">${bet}</span></p>
                    <button
                      onClick={startGame}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-bold text-xl transition"
                    >
                      DEAL
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {gameState === 'playing' && (
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              {canInsurance && (
                <>
                  <button
                    onClick={takeInsurance}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition"
                  >
                    Insurance (${bet / 2})
                  </button>
                  <button
                    onClick={declineInsurance}
                    className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-bold transition"
                  >
                    No Insurance
                  </button>
                </>
              )}
              {!canInsurance && (
                <>
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
                  {canDouble && (
                    <button
                      onClick={doubleDown}
                      disabled={balance < bet}
                      className="bg-yellow-600 hover:bg-yellow-700 px-6 py-4 rounded-lg font-bold text-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      DOUBLE
                    </button>
                  )}
                  {canSplit && (
                    <button
                      onClick={split}
                      disabled={balance < bet}
                      className="bg-purple-600 hover:bg-purple-700 px-6 py-4 rounded-lg font-bold text-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      SPLIT
                    </button>
                  )}
                </>
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

      {/* Rules */}
      <div className="max-w-7xl mx-auto mt-6">
        <details className="bg-black bg-opacity-50 rounded-lg p-4">
          <summary className="cursor-pointer font-bold text-yellow-400 flex items-center gap-2">
            <Info size={20} />
            House Rules
          </summary>
          <div className="mt-4 text-sm space-y-2 text-gray-300">
            <p>• Dealer stands on soft 17</p>
            <p>• Blackjack pays 3:2</p>
            <p>• Insurance pays 2:1</p>
            <p>• Double down on any two cards</p>
            <p>• Split any pair</p>
            <p>• 6-deck shoe, reshuffled at 25% penetration</p>
            <p>• Minimum bet: $5</p>
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
    <div className="w-24 h-36 bg-white rounded-lg shadow-lg border-2 border-gray-300 p-2 flex flex-col justify-between">
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

export default App;
