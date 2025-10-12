// AI Coach Service - Webhook Handler
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n-railway-production-cc19.up.railway.app/webhook/ai-coach';

export async function sendToAICoach({ message, game, gameState, chatHistory = [] }) {
  try {
    const payload = {
      message,
      game,
      gameState,
      chatHistory: chatHistory.slice(-10), // Last 10 messages for context
      timestamp: new Date().toISOString()
    };

    console.log('Sending to AI Coach:', payload);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('AI Coach response:', data);

    return {
      answer: data.answer || data.message || 'I received your question but couldn\'t generate a response.',
      confidence: data.confidence || 'medium',
      timestamp: data.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('AI Coach service error:', error);
    throw new Error('Failed to connect to AI Coach. Please try again.');
  }
}

// Helper: Build game context for different games
export function buildGameContext(game, state) {
  switch (game) {
    case 'blackjack':
      return buildBlackjackContext(state);
    case 'baccarat':
      return buildBaccaratContext(state);
    case 'videopoker':
      return buildVideoPokerContext(state);
    case 'paigowpoker':
      return buildPaiGowContext(state);
    default:
      return state;
  }
}

function buildBlackjackContext(state) {
  return {
    playerHands: state.playerHands?.map(hand => ({
      cards: hand.cards?.map(c => `${c.value}${c.suit}`),
      total: hand.total,
      bet: hand.bet,
      isSoft: hand.isSoft,
      canSplit: hand.canSplit,
      canDouble: hand.canDouble
    })),
    dealerCards: state.dealerHand?.cards?.map(c => `${c.value}${c.suit}`),
    dealerUpCard: state.dealerHand?.cards?.[0] ? `${state.dealerHand.cards[0].value}${state.dealerHand.cards[0].suit}` : null,
    trueCount: state.deckManager?.getTrueCount?.(),
    runningCount: state.deckManager?.getRunningCount?.(),
    decksRemaining: state.deckManager?.getDecksRemaining?.(),
    penetration: state.deckManager?.getPenetration?.(),
    recommendedAction: state.recommendedAction,
    basicStrategyAction: state.basicStrategyAction
  };
}

function buildBaccaratContext(state) {
  return {
    playerHand: state.playerHand?.map(c => `${c.value}${c.suit}`),
    bankerHand: state.bankerHand?.map(c => `${c.value}${c.suit}`),
    playerTotal: state.playerTotal,
    bankerTotal: state.bankerTotal,
    roadmap: state.roadmap?.slice(-20), // Last 20 results
    currentBets: {
      player: state.playerBet,
      banker: state.bankerBet,
      tie: state.tieBet
    }
  };
}

function buildVideoPokerContext(state) {
  return {
    currentHand: state.cards?.map(c => `${c.rank}${c.suit}`),
    heldCards: state.heldCards,
    variant: state.variant,
    bet: state.bet,
    recommendedHold: state.recommendedHold,
    expectedValue: state.expectedValue
  };
}

function buildPaiGowContext(state) {
  return {
    sevenCards: state.playerCards?.map(c => `${c.rank}${c.suit}`),
    highHand: state.playerHigh5?.map(c => `${c.rank}${c.suit}`),
    lowHand: state.playerLow2?.map(c => `${c.rank}${c.suit}`),
    houseWaySuggestion: state.houseWaySet,
    bet: state.bet
  };
}
