// /src/components/HandAnalyzer.jsx
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, RotateCcw, Brain, MessageCircle } from 'lucide-react';
import AICoach from './AICoach';
import { useSubscription } from '../contexts/SubscriptionContext';

// Card Picker Component
function CardPicker({ selectedCards, onSelectCard, maxCards, excludeCards = [] }) {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const isCardSelected = (rank, suit) => {
    return selectedCards.some(card => card.rank === rank && card.suit === suit);
  };

  const isCardExcluded = (rank, suit) => {
    return excludeCards.some(card => card.rank === rank && card.suit === suit);
  };

  const isDisabled = (rank, suit) => {
    if (isCardSelected(rank, suit)) return false;
    if (isCardExcluded(rank, suit)) return true;
    return selectedCards.length >= maxCards;
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Select Cards</h3>
        <span className="text-sm text-gray-400">
          {selectedCards.length} / {maxCards} selected
        </span>
      </div>
      
      <div className="space-y-3">
        {suits.map(suit => (
          <div key={suit} className="space-y-2">
            <div className={`text-xl font-bold ${suit === '♥' || suit === '♦' ? 'text-red-500' : 'text-white'}`}>
              {suit}
            </div>
            <div className="flex flex-wrap gap-2">
              {ranks.map(rank => {
                const selected = isCardSelected(rank, suit);
                const disabled = isDisabled(rank, suit);
                
                return (
                  <button
                    key={`${rank}${suit}`}
                    onClick={() => onSelectCard(rank, suit)}
                    disabled={disabled}
                    className={`
                      w-12 h-16 rounded-lg font-bold text-sm transition-all
                      ${selected 
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white scale-95 shadow-lg' 
                        : disabled
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                        : 'bg-gray-700 text-white hover:bg-gray-600 hover:scale-105'
                      }
                    `}
                  >
                    <div className={suit === '♥' || suit === '♦' ? 'text-red-500' : ''}>
                      {rank}
                      <div className="text-lg">{suit}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Selected Cards Display
function SelectedCardsDisplay({ cards, onRemoveCard, title }) {
  if (cards.length === 0) {
    return (
      <div className="bg-gray-800/30 rounded-xl p-8 border border-gray-700 border-dashed text-center">
        <p className="text-gray-500">No cards selected yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {cards.map((card, index) => (
          <button
            key={index}
            onClick={() => onRemoveCard(index)}
            className="relative w-16 h-24 bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-2xl font-bold ${card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-black'}`}>
                {card.rank}
              </div>
              <div className={`text-3xl ${card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-black'}`}>
                {card.suit}
              </div>
            </div>
            <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-20 rounded-lg transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}

// Blackjack Analysis
function BlackjackAnalysis({ playerCards, dealerCard }) {
  if (playerCards.length === 0) return null;

  const calculateHandValue = (cards) => {
    let value = 0;
    let aces = 0;

    cards.forEach(card => {
      if (card.rank === 'A') {
        aces++;
        value += 11;
      } else if (['J', 'Q', 'K'].includes(card.rank)) {
        value += 10;
      } else {
        value += parseInt(card.rank);
      }
    });

    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return { value, isSoft: aces > 0 };
  };

  const playerHand = calculateHandValue(playerCards);
  const dealerValue = dealerCard ? calculateHandValue([dealerCard]).value : null;

  const getRecommendation = () => {
    if (!dealerCard) return "Select dealer's upcard";
    if (playerHand.value > 21) return "BUST";
    if (playerHand.value === 21 && playerCards.length === 2) return "BLACKJACK!";
    
    const pairCard = playerCards.length === 2 && playerCards[0].rank === playerCards[1].rank;
    
    if (pairCard) {
      if (['A', '8'].includes(playerCards[0].rank)) return "SPLIT";
      if (['10', 'J', 'Q', 'K'].includes(playerCards[0].rank)) return "STAND";
      if (playerCards[0].rank === '9' && ![7, 10, 11].includes(dealerValue)) return "SPLIT";
      if (['2', '3', '7'].includes(playerCards[0].rank) && dealerValue <= 7) return "SPLIT";
      if (playerCards[0].rank === '6' && dealerValue <= 6) return "SPLIT";
      if (playerCards[0].rank === '4' && [5, 6].includes(dealerValue)) return "SPLIT";
    }

    if (playerCards.length === 2 && playerHand.value >= 9 && playerHand.value <= 11) {
      if (playerHand.value === 11) {
        return dealerValue === 11 ? "HIT" : "DOUBLE DOWN";
      }
      if (playerHand.value === 10 && dealerValue <= 9) return "DOUBLE DOWN";
      if (playerHand.value === 9 && dealerValue >= 3 && dealerValue <= 6) return "DOUBLE DOWN";
    }

    if (playerHand.isSoft) {
      if (playerHand.value >= 19) return "STAND";
      if (playerHand.value === 18) {
        if ([9, 10, 11].includes(dealerValue)) return "HIT";
        if (dealerValue >= 3 && dealerValue <= 6 && playerCards.length === 2) return "DOUBLE DOWN";
        return "STAND";
      }
      if (playerHand.value === 17 && [3, 4, 5, 6].includes(dealerValue) && playerCards.length === 2) return "DOUBLE DOWN";
      if ([15, 16].includes(playerHand.value) && [4, 5, 6].includes(dealerValue) && playerCards.length === 2) return "DOUBLE DOWN";
      if ([13, 14].includes(playerHand.value) && [5, 6].includes(dealerValue) && playerCards.length === 2) return "DOUBLE DOWN";
      return "HIT";
    }

    if (playerHand.value >= 17) return "STAND";
    if (playerHand.value <= 11) return "HIT";
    if (playerHand.value >= 13 && dealerValue <= 6) return "STAND";
    if (playerHand.value === 12) {
      if ([4, 5, 6].includes(dealerValue)) return "STAND";
      return "HIT";
    }
    
    return "HIT";
  };

  const recommendation = getRecommendation();

  return (
    <div className="bg-gradient-to-br from-green-900/30 to-gray-800/30 rounded-xl p-6 border border-green-500/30">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-yellow-400" size={24} />
        <h3 className="text-xl font-bold text-white">Blackjack Analysis</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Your Hand</p>
            <p className="text-3xl font-bold text-white">
              {playerHand.value}
              {playerHand.isSoft && <span className="text-sm text-green-400 ml-2">(Soft)</span>}
            </p>
          </div>
          
          {dealerCard && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Dealer Shows</p>
              <p className="text-3xl font-bold text-white">{dealerValue}</p>
            </div>
          )}
        </div>

        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-sm text-yellow-400 mb-2">Recommended Action</p>
          <p className="text-2xl font-bold text-yellow-300">{recommendation}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Basic Strategy Tips</p>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Always split Aces and 8s</li>
            <li>• Never split 10s or 5s</li>
            <li>• Stand on hard 17 or higher</li>
            <li>• Double on 11 (except vs Ace)</li>
            <li>• Surrender 16 vs dealer 9, 10, or Ace</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Video Poker Analysis
function VideoPokerAnalysis({ cards }) {
  if (cards.length !== 5) return null;

  const analyzeHand = () => {
    const rankCounts = {};
    const suitCounts = {};
    const ranks = cards.map(c => c.rank);
    
    cards.forEach(card => {
      rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
      suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
    });

    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const isFlush = Object.values(suitCounts).some(count => count === 5);
    
    const rankValues = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
    const values = ranks.map(r => rankValues[r]).sort((a, b) => a - b);
    const isStraight = values.every((val, i) => i === 0 || val === values[i - 1] + 1) ||
                       (values[0] === 2 && values[4] === 14 && values[1] === 3 && values[2] === 4 && values[3] === 5);

    const isRoyal = isStraight && values.includes(14) && values.includes(13) && values.includes(12) && values.includes(11) && values.includes(10);

    if (isRoyal && isFlush) return { hand: 'Royal Flush', payout: 800, rank: 10 };
    if (isStraight && isFlush) return { hand: 'Straight Flush', payout: 50, rank: 9 };
    if (counts[0] === 4) return { hand: 'Four of a Kind', payout: 25, rank: 8 };
    if (counts[0] === 3 && counts[1] === 2) return { hand: 'Full House', payout: 9, rank: 7 };
    if (isFlush) return { hand: 'Flush', payout: 6, rank: 6 };
    if (isStraight) return { hand: 'Straight', payout: 4, rank: 5 };
    if (counts[0] === 3) return { hand: 'Three of a Kind', payout: 3, rank: 4 };
    if (counts[0] === 2 && counts[1] === 2) return { hand: 'Two Pair', payout: 2, rank: 3 };
    
    const highPairs = Object.entries(rankCounts).filter(([rank, count]) => 
      count === 2 && ['A', 'K', 'Q', 'J'].includes(rank)
    );
    if (highPairs.length > 0) return { hand: 'Jacks or Better', payout: 1, rank: 2 };

    return { hand: 'No Pair', payout: 0, rank: 0 };
  };

  const result = analyzeHand();

  const getHoldRecommendation = () => {
    if (result.rank >= 7) return "HOLD ALL - Strong paying hand!";
    if (result.rank >= 4) return "HOLD ALL - Good hand";
    if (result.rank === 3) return "HOLD BOTH PAIRS";
    if (result.rank === 2) return "HOLD THE HIGH PAIR";
    
    const highCards = cards.filter(c => ['A', 'K', 'Q', 'J'].includes(c.rank));
    if (highCards.length >= 3) return `HOLD ${highCards.length} HIGH CARDS`;
    if (highCards.length === 2) return "HOLD 2 HIGH CARDS";
    if (highCards.length === 1) return "HOLD 1 HIGH CARD";
    
    return "DRAW 5 NEW CARDS";
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-gray-800/30 rounded-xl p-6 border border-purple-500/30">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-purple-400" size={24} />
        <h3 className="text-xl font-bold text-white">Video Poker Analysis</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Current Hand</p>
          <p className="text-2xl font-bold text-white">{result.hand}</p>
          <p className="text-lg text-green-400 mt-2">
            {result.payout > 0 ? `Payout: ${result.payout}x ✓` : 'No payout'}
          </p>
        </div>

        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-sm text-yellow-400 mb-2">Hold Recommendation</p>
          <p className="text-lg font-bold text-white">{getHoldRecommendation()}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Jacks or Better Pay Table (9/6)</p>
          <div className="grid grid-cols-2 text-sm text-gray-300 gap-1">
            <div className="flex justify-between"><span>Royal Flush</span><span className="text-yellow-400 font-bold">800x</span></div>
            <div className="flex justify-between"><span>Straight Flush</span><span className="text-purple-400 font-bold">50x</span></div>
            <div className="flex justify-between"><span>Four of a Kind</span><span className="text-blue-400 font-bold">25x</span></div>
            <div className="flex justify-between"><span>Full House</span><span className="text-green-400 font-bold">9x</span></div>
            <div className="flex justify-between"><span>Flush</span><span className="font-bold">6x</span></div>
            <div className="flex justify-between"><span>Straight</span><span className="font-bold">4x</span></div>
            <div className="flex justify-between"><span>Three of a Kind</span><span className="font-bold">3x</span></div>
            <div className="flex justify-between"><span>Two Pair</span><span className="font-bold">2x</span></div>
            <div className="flex justify-between"><span>Jacks or Better</span><span className="font-bold">1x</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pai Gow Poker Analysis
function PaiGowAnalysis({ cards }) {
  if (cards.length !== 7) return null;

  const evaluateHand = () => {
    const rankCounts = {};
    cards.forEach(card => {
      rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    });

    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const pairs = Object.entries(rankCounts).filter(([_, count]) => count === 2).map(([rank]) => rank);
    
    if (counts[0] === 4) return { type: "Four of a Kind", pairs };
    if (counts[0] === 3 && counts[1] === 3) return { type: "Two Three of a Kinds", pairs };
    if (counts[0] === 3 && counts[1] === 2) return { type: "Full House", pairs };
    if (counts[0] === 3) return { type: "Three of a Kind", pairs };
    if (counts[0] === 2 && counts[1] === 2 && counts[2] === 2) return { type: "Three Pairs", pairs };
    if (counts[0] === 2 && counts[1] === 2) return { type: "Two Pairs", pairs };
    if (counts[0] === 2) return { type: "One Pair", pairs };
    
    return { type: "High Card", pairs };
  };

  const handInfo = evaluateHand();

  const getHouseWaySuggestion = () => {
    switch(handInfo.type) {
      case "Three Pairs":
        return "Play the highest pair in the low hand (2-card)";
      case "Two Pairs":
        if (handInfo.pairs.includes('A')) {
          return "Split: Play Aces in high hand, other pair in low hand";
        }
        return "Play both pairs in high hand if combined rank ≤ 6, otherwise split";
      case "One Pair":
        return "Keep the pair in high hand (5-card), play two highest remaining cards in low hand";
      case "Four of a Kind":
        return "Keep four of a kind together unless it's Aces (split 2-2) or 7s and higher with Ace available";
      case "Full House":
        return "Play the pair in low hand (2-card), three of a kind in high hand";
      case "Three of a Kind":
        return "Keep trips in high hand, play two highest cards in low hand";
      default:
        return "Play 2nd and 3rd highest cards in low hand";
    }
  };

  return (
    <div className="bg-gradient-to-br from-red-900/30 to-gray-800/30 rounded-xl p-6 border border-red-500/30">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-red-400" size={24} />
        <h3 className="text-xl font-bold text-white">Pai Gow Poker Analysis</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Hand Type</p>
          <p className="text-2xl font-bold text-white">{handInfo.type}</p>
          {handInfo.pairs.length > 0 && (
            <p className="text-sm text-gray-400 mt-2">Pairs: {handInfo.pairs.join(', ')}</p>
          )}
        </div>

        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-sm text-yellow-400 mb-2">House Way Suggestion</p>
          <p className="text-base text-white leading-relaxed">{getHouseWaySuggestion()}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Key Pai Gow Rules</p>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Low hand (2 cards) must be lower than high hand (5 cards)</li>
            <li>• Win both hands = win (minus 5% commission)</li>
            <li>• Win one, lose one = push (tie)</li>
            <li>• Lose both hands = lose bet</li>
            <li>• Joker is semi-wild (completes straights/flushes or acts as Ace)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Main Hand Analyzer Component
export default function HandAnalyzer({ onBack }) {
  const { isPremium, canAccessFeature } = useSubscription();
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [dealerCard, setDealerCard] = useState(null);
  const [showDealerPicker, setShowDealerPicker] = useState(false);
  const [showAICoach, setShowAICoach] = useState(false);

  const games = [
    { id: 'blackjack', name: 'Blackjack', icon: '🃏', cards: 10, minCards: 2 },
    { id: 'videopoker', name: 'Video Poker', icon: '🎴', cards: 5, minCards: 5 },
    { id: 'paigowpoker', name: 'Pai Gow Poker', icon: '🀄', cards: 7, minCards: 7 }
  ];

  const handleSelectCard = (rank, suit) => {
    const card = { rank, suit };
    const isSelected = selectedCards.some(c => c.rank === rank && c.suit === suit);

    if (isSelected) {
      setSelectedCards(selectedCards.filter(c => !(c.rank === rank && c.suit === suit)));
    } else {
      const maxCards = selectedGame === 'blackjack' ? 10 : 
                       selectedGame === 'videopoker' ? 5 : 7;
      if (selectedCards.length < maxCards) {
        setSelectedCards([...selectedCards, card]);
      }
    }
  };

  const handleSelectDealerCard = (rank, suit) => {
    if (dealerCard?.rank === rank && dealerCard?.suit === suit) {
      setDealerCard(null);
    } else {
      setDealerCard({ rank, suit });
      setShowDealerPicker(false);
    }
  };

  const handleReset = () => {
    setSelectedCards([]);
    setDealerCard(null);
    setShowDealerPicker(false);
  };

  const currentGame = games.find(g => g.id === selectedGame);
  const canAnalyze = selectedGame === 'blackjack' ? selectedCards.length >= 2 :
                     selectedGame === 'videopoker' ? selectedCards.length === 5 :
                     selectedGame === 'paigowpoker' ? selectedCards.length === 7 :
                     false;

  // Build game state for AI Coach
  const buildGameState = () => {
    if (!canAnalyze) return null;
    
    return {
      playerCards: selectedCards.map(c => `${c.rank}${c.suit}`),
      dealerCard: dealerCard ? `${dealerCard.rank}${dealerCard.suit}` : null,
      mode: 'hand_analyzer'
    };
  };

  if (!selectedGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
            >
              <ArrowLeft size={24} />
              <span className="font-semibold">Back to Games</span>
            </button>
          </div>

          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="text-purple-400" size={48} />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Hand Analyzer
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Select your own cards and get professional strategy analysis with AI-powered insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {games.map(game => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border-2 border-gray-700 hover:border-purple-500 transition-all hover:scale-105 text-center group"
              >
                <div className="text-6xl mb-4">{game.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{game.name}</h3>
                <p className="text-gray-400">Select up to {game.cards} cards</p>
                <div className="mt-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Analyze Hand →
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div>
                <div className="text-purple-400 font-bold mb-2">1. Choose Game</div>
                <p>Select which game you want to analyze</p>
              </div>
              <div>
                <div className="text-purple-400 font-bold mb-2">2. Pick Cards</div>
                <p>Manually select cards from the deck</p>
              </div>
              <div>
                <div className="text-purple-400 font-bold mb-2">3. Get Analysis</div>
                <p>Receive optimal strategy and AI coaching</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              setSelectedGame(null);
              handleReset();
            }}
            className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="font-semibold">Change Game</span>
          </button>

          <div className="flex items-center gap-3">
            {isPremium && canAnalyze && (
              <button
                onClick={() => setShowAICoach(!showAICoach)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              >
                <MessageCircle size={18} />
                AI Coach
              </button>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            {currentGame?.name} Analyzer
          </h2>
          <p className="text-gray-400">Select your cards to get strategy analysis</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SelectedCardsDisplay 
              cards={selectedCards}
              onRemoveCard={(index) => {
                setSelectedCards(selectedCards.filter((_, i) => i !== index));
              }}
              title="Your Cards"
            />

            {selectedGame === 'blackjack' && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Dealer's Upcard</h3>
                {dealerCard ? (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setDealerCard(null)}
                      className="w-16 h-24 bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 group relative"
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`text-2xl font-bold ${dealerCard.suit === '♥' || dealerCard.suit === '♦' ? 'text-red-500' : 'text-black'}`}>
                          {dealerCard.rank}
                        </div>
                        <div className={`text-3xl ${dealerCard.suit === '♥' || dealerCard.suit === '♦' ? 'text-red-500' : 'text-black'}`}>
                          {dealerCard.suit}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-20 rounded-lg transition-opacity" />
                    </button>
                    <button
                      onClick={() => setShowDealerPicker(!showDealerPicker)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDealerPicker(!showDealerPicker)}
                    className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-semibold"
                  >
                    Select Dealer Card
                  </button>
                )}

                {showDealerPicker && (
                  <div className="mt-4">
                    <CardPicker
                      selectedCards={dealerCard ? [dealerCard] : []}
                      onSelectCard={handleSelectDealerCard}
                      maxCards={1}
                      excludeCards={selectedCards}
                    />
                  </div>
                )}
              </div>
            )}

            <CardPicker
              selectedCards={selectedCards}
              onSelectCard={handleSelectCard}
              maxCards={currentGame?.cards || 10}
              excludeCards={dealerCard ? [dealerCard] : []}
            />
          </div>

          <div>
            {canAnalyze ? (
              <>
                {selectedGame === 'blackjack' && (
                  <BlackjackAnalysis playerCards={selectedCards} dealerCard={dealerCard} />
                )}
                {selectedGame === 'videopoker' && (
                  <VideoPokerAnalysis cards={selectedCards} />
                )}
                {selectedGame === 'paigowpoker' && (
                  <PaiGowAnalysis cards={selectedCards} />
                )}
              </>
            ) : (
              <div className="bg-gray-800/30 rounded-xl p-12 border border-gray-700 border-dashed text-center h-full flex flex-col items-center justify-center">
                <Brain className="text-gray-600 mb-4" size={64} />
                <p className="text-gray-500 text-lg">
                  {selectedGame === 'blackjack' && 'Select at least 2 cards to see analysis'}
                  {selectedGame === 'videopoker' && 'Select exactly 5 cards to see analysis'}
                  {selectedGame === 'paigowpoker' && 'Select exactly 7 cards to see analysis'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Coach Sidebar */}
      {showAICoach && isPremium && (
        <div className="fixed right-0 top-0 h-full w-96 z-50">
          <AICoach 
            game={selectedGame}
            gameState={buildGameState()}
            visible={true}
          />
        </div>
      )}
    </div>
  );
}
