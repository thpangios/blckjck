import { supabase } from '../lib/supabase';

// AI Coach Service - Webhook Handler
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n-railway-production-cc19.up.railway.app/webhook/ai-coach';

// Helper: Save message to database
async function saveMessageToDatabase(userId, sessionId, role, content, gameType, gameState, confidence = null) {
  try {
    const { error } = await supabase
      .from('ai_chat_history')
      .insert({
        user_id: userId,
        session_id: sessionId,
        role,
        content,
        game_type: gameType,
        game_state: gameState,
        confidence
      });

    if (error) {
      console.error('Error saving message:', error);
    }
  } catch (err) {
    console.error('Failed to save message:', err);
  }
}

export async function sendToAICoach({ message, game, gameState, chatHistory = [], sessionId, userId }) {
  try {
    const payload = {
      message,
      game,
      gameState,
      chatHistory: chatHistory.slice(-10), // Last 10 messages for context
      timestamp: new Date().toISOString()
    };

    console.log('Sending to AI Coach:', payload);

    // Save user message to database
    if (userId && sessionId) {
      await saveMessageToDatabase(
        userId,
        sessionId,
        'user',
        message,
        game,
        gameState,
        null
      );
    }

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

    // Handle different response formats from n8n
    let answerText = '';
    let confidenceLevel = 'medium';
    
    // Check if response is an array (n8n format)
    if (Array.isArray(data) && data.length > 0) {
      answerText = data[0].output || data[0].answer || data[0].message || '';
      confidenceLevel = data[0].confidence || 'medium';
    } 
    // Check if response is an object
    else if (data.output) {
      answerText = data.output;
      confidenceLevel = data.confidence || 'medium';
    } 
    else if (data.answer) {
      answerText = data.answer;
      confidenceLevel = data.confidence || 'medium';
    } 
    else if (data.message) {
      answerText = data.message;
      confidenceLevel = data.confidence || 'medium';
    }
    else {
      answerText = 'I received your question but couldn\'t generate a response.';
    }

    // Save AI response to database
    if (userId && sessionId && answerText) {
      await saveMessageToDatabase(
        userId,
        sessionId,
        'assistant',
        answerText,
        game,
        gameState,
        confidenceLevel
      );
    }

    return {
      answer: answerText,
      confidence: confidenceLevel,
      timestamp: data.timestamp || data[0]?.timestamp || new Date().toISOString()
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
