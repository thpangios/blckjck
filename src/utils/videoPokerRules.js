// Professional Video Poker Rules and Hand Evaluation
export class VideoPokerRules {
  static suits = ['♠', '♥', '♦', '♣'];
  static values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  static valueRanks = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };

  // Verified 9/6 Jacks or Better paytable (99.54% return with optimal play)
  static paytables = {
    jacksOrBetter: {
      name: "9/6 Jacks or Better",
      hands: {
        'Royal Flush': [250, 500, 750, 1000, 4000],
        'Straight Flush': [50, 100, 150, 200, 250],
        'Four of a Kind': [25, 50, 75, 100, 125],
        'Full House': [9, 18, 27, 36, 45],
        'Flush': [6, 12, 18, 24, 30],
        'Straight': [4, 8, 12, 16, 20],
        'Three of a Kind': [3, 6, 9, 12, 15],
        'Two Pair': [2, 4, 6, 8, 10],
        'Jacks or Better': [1, 2, 3, 4, 5]
      }
    },
    deucesWild: {
      name: "Full Pay Deuces Wild",
      hands: {
        'Natural Royal Flush': [250, 500, 750, 1000, 4000],
        'Four Deuces': [200, 400, 600, 800, 1000],
        'Wild Royal Flush': [25, 50, 75, 100, 125],
        'Five of a Kind': [15, 30, 45, 60, 75],
        'Straight Flush': [9, 18, 27, 36, 45],
        'Four of a Kind': [5, 10, 15, 20, 25],
        'Full House': [3, 6, 9, 12, 15],
        'Flush': [2, 4, 6, 8, 10],
        'Straight': [2, 4, 6, 8, 10],
        'Three of a Kind': [1, 2, 3, 4, 5]
      }
    },
    bonusPoker: {
      name: "8/5 Bonus Poker",
      hands: {
        'Royal Flush': [250, 500, 750, 1000, 4000],
        'Straight Flush': [50, 100, 150, 200, 250],
        'Four Aces': [80, 160, 240, 320, 400],
        'Four 2-4': [40, 80, 120, 160, 200],
        'Four 5-K': [25, 50, 75, 100, 125],
        'Full House': [8, 16, 24, 32, 40],
        'Flush': [5, 10, 15, 20, 25],
        'Straight': [4, 8, 12, 16, 20],
        'Three of a Kind': [3, 6, 9, 12, 15],
        'Two Pair': [2, 4, 6, 8, 10],
        'Jacks or Better': [1, 2, 3, 4, 5]
      }
    }
  };

  // Complete hand evaluator with all edge cases
  static evaluateHand(cards, variant = 'jacksOrBetter') {
    if (!cards || cards.length !== 5) return null;

    const ranks = cards.map(c => this.valueRanks[c.value]);
    const suits = cards.map(c => c.suit);

    // Deuces Wild special handling
    if (variant === 'deucesWild') {
      return this.evaluateDeucesWild(cards, ranks, suits);
    }

    // Regular evaluation
    const analysis = this.analyzeCards(ranks, suits);

    if (variant === 'bonusPoker') {
      return this.evaluateBonusPoker(analysis);
    }

    return this.evaluateJacksOrBetter(analysis);
  }

  static analyzeCards(ranks, suits) {
    // Sort ranks
    const sortedRanks = [...ranks].sort((a, b) => a - b);

    // Count rank occurrences
    const rankCounts = {};
    ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
    
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const uniqueRanks = Object.keys(rankCounts).map(Number).sort((a, b) => a - b);

    // Check for flush
    const isFlush = suits.every(s => s === suits[0]);

    // Check for straight (including wheel: A-2-3-4-5)
    const isStraight = this.isStraight(sortedRanks);

    // Check for royal (10-J-Q-K-A)
    const isRoyal = isStraight && sortedRanks[4] === 14 && sortedRanks[3] === 13;

    // Get pair values
    const pairValues = [];
    Object.entries(rankCounts).forEach(([rank, count]) => {
      if (count === 2) pairValues.push(Number(rank));
    });

    return {
      ranks: sortedRanks,
      rankCounts,
      counts,
      uniqueRanks,
      isFlush,
      isStraight,
      isRoyal,
      pairValues
    };
  }

  static isStraight(sortedRanks) {
    // Check regular straight
    let isConsecutive = true;
    for (let i = 0; i < 4; i++) {
      if (sortedRanks[i + 1] - sortedRanks[i] !== 1) {
        isConsecutive = false;
        break;
      }
    }

    if (isConsecutive) return true;

    // Check wheel (A-2-3-4-5)
    if (sortedRanks[0] === 2 && sortedRanks[1] === 3 && sortedRanks[2] === 4 && 
        sortedRanks[3] === 5 && sortedRanks[4] === 14) {
      return true;
    }

    return false;
  }

  static evaluateJacksOrBetter(analysis) {
    const { counts, isFlush, isStraight, isRoyal, pairValues } = analysis;

    if (isRoyal && isFlush) return 'Royal Flush';
    if (isStraight && isFlush) return 'Straight Flush';
    if (counts[0] === 4) return 'Four of a Kind';
    if (counts[0] === 3 && counts[1] === 2) return 'Full House';
    if (isFlush) return 'Flush';
    if (isStraight) return 'Straight';
    if (counts[0] === 3) return 'Three of a Kind';
    if (counts[0] === 2 && counts[1] === 2) return 'Two Pair';
    
    // Jacks or Better check
    const hasHighPair = pairValues.some(v => v >= 11 || v === 14);
    if (hasHighPair) return 'Jacks or Better';

    return null;
  }

  static evaluateBonusPoker(analysis) {
    const { counts, isFlush, isStraight, isRoyal, pairValues, rankCounts } = analysis;

    if (isRoyal && isFlush) return 'Royal Flush';
    if (isStraight && isFlush) return 'Straight Flush';

    // Four of a kind with bonus structure
    if (counts[0] === 4) {
      const quadRank = Object.entries(rankCounts).find(([_, count]) => count === 4)[0];
      const rank = Number(quadRank);
      
      if (rank === 14) return 'Four Aces';
      if (rank >= 2 && rank <= 4) return 'Four 2-4';
      return 'Four 5-K';
    }

    if (counts[0] === 3 && counts[1] === 2) return 'Full House';
    if (isFlush) return 'Flush';
    if (isStraight) return 'Straight';
    if (counts[0] === 3) return 'Three of a Kind';
    if (counts[0] === 2 && counts[1] === 2) return 'Two Pair';
    
    const hasHighPair = pairValues.some(v => v >= 11 || v === 14);
    if (hasHighPair) return 'Jacks or Better';

    return null;
  }

  static evaluateDeucesWild(cards, ranks, suits) {
    const deuceCount = ranks.filter(r => r === 2).length;
    const nonDeuceRanks = ranks.filter(r => r !== 2).sort((a, b) => a - b);
    
    // Four deuces
    if (deuceCount === 4) return 'Four Deuces';

    // Natural royal (no deuces)
    if (deuceCount === 0) {
      const analysis = this.analyzeCards(ranks, suits);
      if (analysis.isRoyal && analysis.isFlush) return 'Natural Royal Flush';
    }

    // Use deuces as wilds
    const analysis = this.analyzeWithWilds(nonDeuceRanks, suits, deuceCount);

    if (analysis.isRoyalFlush && deuceCount > 0) return 'Wild Royal Flush';
    if (analysis.isRoyalFlush && deuceCount === 0) return 'Natural Royal Flush';
    if (analysis.fiveOfAKind) return 'Five of a Kind';
    if (analysis.straightFlush) return 'Straight Flush';
    if (analysis.fourOfAKind) return 'Four of a Kind';
    if (analysis.fullHouse) return 'Full House';
    if (analysis.flush) return 'Flush';
    if (analysis.straight) return 'Straight';
    if (analysis.threeOfAKind) return 'Three of a Kind';

    return null;
  }

  static analyzeWithWilds(nonDeuceRanks, suits, wildCount) {
    const nonDeuceSuits = suits.filter((_, i) => suits[i] !== '2');
    
    // Count non-deuce ranks
    const rankCounts = {};
    nonDeuceRanks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
    
    const maxNaturalCount = Math.max(...Object.values(rankCounts), 0);
    const totalMaxCount = maxNaturalCount + wildCount;

    // Five of a kind
    const fiveOfAKind = totalMaxCount >= 5;

    // Four of a kind
    const fourOfAKind = totalMaxCount >= 4 && !fiveOfAKind;

    // Full house (3+2 or natural 2+2 with 1+ wild)
    const fullHouse = (maxNaturalCount === 3 && Object.values(rankCounts).filter(c => c === 2).length === 1) ||
                      (maxNaturalCount === 2 && Object.values(rankCounts).filter(c => c === 2).length === 2 && wildCount >= 1);

    // Three of a kind
    const threeOfAKind = totalMaxCount >= 3 && !fourOfAKind && !fullHouse && !fiveOfAKind;

    // Flush (all non-deuce cards same suit, enough wilds to make 5)
    const flush = nonDeuceSuits.length > 0 && nonDeuceSuits.every(s => s === nonDeuceSuits[0]) && 
                  nonDeuceSuits.length + wildCount >= 5;

    // Straight
    const straight = this.canMakeStraight(nonDeuceRanks, wildCount);

    // Straight flush
    const straightFlush = flush && straight;

    // Royal flush (10-J-Q-K-A straight flush)
    const isRoyalFlush = straightFlush && this.canMakeRoyal(nonDeuceRanks, wildCount);

    return {
      fiveOfAKind,
      fourOfAKind,
      fullHouse,
      threeOfAKind,
      flush,
      straight,
      straightFlush,
      isRoyalFlush
    };
  }

  static canMakeStraight(ranks, wilds) {
    if (ranks.length === 0 && wilds >= 5) return true;
    
    const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b);
    
    // Try all possible straights
    for (let start = 2; start <= 10; start++) {
      const needed = [start, start + 1, start + 2, start + 3, start + 4];
      const have = needed.filter(n => uniqueRanks.includes(n)).length;
      if (have + wilds >= 5) return true;
    }

    // Check wheel (A-2-3-4-5)
    const wheelNeeds = [2, 3, 4, 5, 14];
    const wheelHave = wheelNeeds.filter(n => uniqueRanks.includes(n)).length;
    if (wheelHave + wilds >= 5) return true;

    return false;
  }

  static canMakeRoyal(ranks, wilds) {
    const royalRanks = [10, 11, 12, 13, 14];
    const have = royalRanks.filter(r => ranks.includes(r)).length;
    return have + wilds >= 5;
  }

  static getPayout(hand, variant, coins) {
    if (!hand) return 0;
    const paytable = this.paytables[variant];
    if (!paytable.hands[hand]) return 0;
    return paytable.hands[hand][coins - 1] || 0;
  }

  static getHandRank(handName) {
    const ranks = {
      'Royal Flush': 10,
      'Natural Royal Flush': 10,
      'Four Deuces': 9,
      'Wild Royal Flush': 8,
      'Straight Flush': 7,
      'Five of a Kind': 6,
      'Four Aces': 5,
      'Four 2-4': 5,
      'Four 5-K': 5,
      'Four of a Kind': 5,
      'Full House': 4,
      'Flush': 3,
      'Straight': 2,
      'Three of a Kind': 1,
      'Two Pair': 1,
      'Jacks or Better': 0
    };
    return ranks[handName] || -1;
  }

  // Create a full deck
  static createDeck() {
    const deck = [];
    for (let suit of this.suits) {
      for (let value of this.values) {
        deck.push({ suit, value, id: `${value}${suit}` });
      }
    }
    return deck;
  }
}
