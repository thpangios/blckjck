import { VideoPokerRules } from './videoPokerRules';

// Video Poker Strategy Calculator
export class VideoPokerStrategy {
  // Generate all possible hold combinations
  static getAllHoldCombinations(cards) {
    const combinations = [];
    
    // Generate all 32 possible combinations (2^5)
    for (let i = 0; i < 32; i++) {
      const holds = [];
      for (let j = 0; j < 5; j++) {
        if (i & (1 << j)) {
          holds.push(j);
        }
      }
      if (holds.length > 0) {
        combinations.push(holds);
      }
    }

    // Add empty combination (draw all 5)
    combinations.push([]);

    return combinations;
  }

  // Calculate expected value for a hold combination
  static calculateEV(cards, holdIndices, variant, coins) {
    // This is a simplified EV calculation
    // In a real implementation, you'd calculate exact EV based on remaining deck
    const heldCards = holdIndices.map(i => cards[i]);
    const analysis = VideoPokerRules.analyzeHand(heldCards, variant === 'deucesWild');
    
    // Estimate based on current partial hand
    let ev = 0;

    if (heldCards.length === 5) {
      // Already have 5 cards, evaluate as-is
      const hand = VideoPokerRules.evaluateHand(heldCards, variant);
      return VideoPokerRules.getPayout(hand, variant, coins);
    }

    // Simplified heuristic scoring
    if (analysis.isRoyalFlush) ev = 4000;
    else if (analysis.isStraightFlush) ev = 250;
    else if (analysis.isFourOfAKind) ev = 125;
    else if (analysis.isFullHouse) ev = 45;
    else if (analysis.isFlush) ev = 30;
    else if (analysis.isStraight) ev = 20;
    else if (analysis.isThreeOfAKind) ev = 15;
    else if (analysis.isTwoPair) ev = 10;
    else if (analysis.isJacksOrBetter) ev = 5;

    // Adjust EV based on drawing potential
    const drawCount = 5 - heldCards.length;
    const drawPenalty = Math.pow(0.7, drawCount);
    
    return ev * drawPenalty;
  }

  // Get optimal hold strategy
  static getOptimalHold(cards, variant, coins) {
    const combinations = this.getAllHoldCombinations(cards);
    let bestEV = -1;
    let bestHold = [];
    let bestReasoning = '';

    for (const holdIndices of combinations) {
      const ev = this.calculateEV(cards, holdIndices, variant, coins);
      
      if (ev > bestEV) {
        bestEV = ev;
        bestHold = holdIndices;
        bestReasoning = this.getHoldReasoning(cards, holdIndices, variant);
      }
    }

    return {
      holdIndices: bestHold,
      expectedValue: bestEV,
      reasoning: bestReasoning
    };
  }

  // Get reasoning for hold decision
  static getHoldReasoning(cards, holdIndices, variant) {
    if (holdIndices.length === 0) {
      return 'Draw all 5 cards - no winning combination';
    }

    const heldCards = holdIndices.map(i => cards[i]);
    const analysis = VideoPokerRules.analyzeHand(heldCards, variant === 'deucesWild');

    if (holdIndices.length === 5) {
      const hand = VideoPokerRules.evaluateHand(heldCards, variant);
      return `Hold all - you have ${hand}`;
    }

    if (analysis.isFourOfAKind) return 'Hold four of a kind, draw 1';
    if (analysis.isThreeOfAKind) return 'Hold three of a kind, draw 2 for full house or four of a kind';
    if (analysis.isTwoPair) return 'Hold two pair, draw 1 for full house';
    if (analysis.isJacksOrBetter) return 'Hold high pair (Jacks or better), draw 3';

    // Check for drawing hands
    const suits = heldCards.map(c => c.suit);
    const values = heldCards.map(c => VideoPokerRules.valueMap[c.value]).sort((a, b) => a - b);

    if (suits.every(s => s === suits[0]) && heldCards.length === 4) {
      return 'Draw to flush (4 suited cards)';
    }

    if (this.isOpenEndedStraightDraw(values)) {
      return 'Draw to open-ended straight';
    }

    if (values.includes(14) || values.includes(13) || values.includes(12) || values.includes(11)) {
      return 'Hold high cards for potential pairs';
    }

    return `Hold ${heldCards.length} cards`;
  }

  static isOpenEndedStraightDraw(values) {
    if (values.length !== 4) return false;
    
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i + 1] - values[i] !== 1) return false;
    }
    return true;
  }
}
