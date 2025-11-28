// Professional Pai Gow Poker Rules and Hand Evaluation
export class PaiGowPokerRules {
  
  // Standard ranks with joker
  static ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', 'JOKER'];
  static suits = ['♠', '♥', '♦', '♣'];
  static rankValues = { 
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 
    '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14, 'JOKER': 15 
  };

  // Create 53-card deck (52 + 1 joker)
  static createDeck() {
    const deck = [];
    
    // Regular 52 cards
    for (let suit of this.suits) {
      for (let rank of this.ranks.slice(0, -1)) { // Exclude JOKER
        deck.push({ rank, suit, id: `${rank}${suit}` });
      }
    }
    
    // Add joker
    deck.push({ rank: 'JOKER', suit: '🃏', id: 'JOKER' });
    
    return deck;
  }

  // Evaluate 5-card or 2-card hand
  static evaluateHand(cards, allowJoker = true) {
    if (cards.length === 5) {
      return this.evaluate5CardHand(cards, allowJoker);
    } else if (cards.length === 2) {
      return this.evaluate2CardHand(cards);
    }
    return null;
  }

  // Evaluate 5-card hand with joker rules
  static evaluate5CardHand(cards, allowJoker = true) {
    const hasJoker = cards.some(c => c.rank === 'JOKER');
    
    if (hasJoker && allowJoker) {
      return this.evaluateHandWithJoker(cards);
    }
    
    return this.evaluateStandardHand(cards);
  }

  // Evaluate hand with joker
  static evaluateHandWithJoker(cards) {
    const nonJokerCards = cards.filter(c => c.rank !== 'JOKER');
    
    // Check for 5 Aces (4 aces + joker)
    const aceCount = nonJokerCards.filter(c => c.rank === 'A').length;
    if (aceCount === 4) {
      return { 
        rank: 10, 
        name: 'Five Aces', 
        description: 'Four Aces + Joker',
        kickers: [14, 14, 14, 14, 14]
      };
    }

    // Try to make royal flush with joker
    const royalFlush = this.checkRoyalFlushWithJoker(nonJokerCards);
    if (royalFlush) {
      return { 
        rank: 9, 
        name: 'Royal Flush', 
        description: 'A-K-Q-J-10 suited',
        suit: royalFlush.suit,
        kickers: [14, 13, 12, 11, 10]
      };
    }

    // Try to make straight flush with joker
    const straightFlush = this.checkStraightFlushWithJoker(nonJokerCards);
    if (straightFlush) {
      return { 
        rank: 8, 
        name: 'Straight Flush', 
        description: 'Five cards in sequence, same suit',
        suit: straightFlush.suit,
        high: straightFlush.high,
        kickers: straightFlush.kickers
      };
    }

    // Check for four of a kind (already have 4 matching + joker makes 5)
    const fourOfKind = this.checkFourOfAKind(nonJokerCards);
    if (fourOfKind) {
      return {
        rank: 7,
        name: 'Four of a Kind',
        description: `Four ${fourOfKind.rank}s`,
        quad: fourOfKind.value,
        kicker: fourOfKind.kicker,
        kickers: [fourOfKind.value, fourOfKind.value, fourOfKind.value, fourOfKind.value, fourOfKind.kicker]
      };
    }

    // Check for full house with joker
    const fullHouse = this.checkFullHouseWithJoker(nonJokerCards);
    if (fullHouse) {
      return {
        rank: 6,
        name: 'Full House',
        description: `${fullHouse.trips}s over ${fullHouse.pair}s`,
        trips: fullHouse.tripsValue,
        pair: fullHouse.pairValue,
        kickers: [fullHouse.tripsValue, fullHouse.tripsValue, fullHouse.tripsValue, fullHouse.pairValue, fullHouse.pairValue]
      };
    }

    // Try to make flush with joker
    const flush = this.checkFlushWithJoker(nonJokerCards);
    if (flush) {
      return {
        rank: 5,
        name: 'Flush',
        description: 'Five cards of same suit',
        suit: flush.suit,
        kickers: flush.kickers
      };
    }

    // Try to make straight with joker
    const straight = this.checkStraightWithJoker(nonJokerCards);
    if (straight) {
      return {
        rank: 4,
        name: 'Straight',
        description: 'Five cards in sequence',
        high: straight.high,
        kickers: straight.kickers
      };
    }

    // Check for three of a kind with joker
    const trips = this.checkThreeOfAKind(nonJokerCards);
    if (trips) {
      return {
        rank: 3,
        name: 'Three of a Kind',
        description: `Three ${trips.rank}s`,
        trips: trips.value,
        kickers: [trips.value, trips.value, trips.value, ...trips.kickers]
      };
    }

    // Joker becomes ace if nothing else works
    // Check for pairs
    const pair = this.checkPair(nonJokerCards);
    if (pair) {
      return {
        rank: 1,
        name: 'One Pair',
        description: `Pair of ${pair.rank}s`,
        pair: pair.value,
        kickers: [pair.value, pair.value, 14, ...pair.kickers] // Joker as Ace
      };
    }

    // High card with joker as ace
    const highCards = nonJokerCards.map(c => this.rankValues[c.rank]).sort((a, b) => b - a);
    return {
      rank: 0,
      name: 'High Card',
      description: 'Ace high',
      kickers: [14, ...highCards.slice(0, 4)]
    };
  }

  // Evaluate standard hand (no joker)
  static evaluateStandardHand(cards) {
    const suits = cards.map(c => c.suit);
    const ranks = cards.map(c => this.rankValues[c.rank]);
    const sortedRanks = [...ranks].sort((a, b) => b - a);

    const isFlush = suits.every(s => s === suits[0]);
    const isStraight = this.checkStraightSequence(sortedRanks);

    // Royal Flush
    if (isFlush && isStraight && sortedRanks[0] === 14 && sortedRanks[4] === 10) {
      return {
        rank: 9,
        name: 'Royal Flush',
        description: 'A-K-Q-J-10 suited',
        suit: suits[0],
        kickers: sortedRanks
      };
    }

    // Straight Flush
    if (isFlush && isStraight) {
      return {
        rank: 8,
        name: 'Straight Flush',
        description: 'Five cards in sequence, same suit',
        suit: suits[0],
        high: sortedRanks[0],
        kickers: sortedRanks
      };
    }

    // Four of a Kind
    const quads = this.findMultiples(ranks, 4);
    if (quads.length > 0) {
      const kicker = ranks.find(r => r !== quads[0]);
      return {
        rank: 7,
        name: 'Four of a Kind',
        description: `Four ${this.getRankName(quads[0])}s`,
        quad: quads[0],
        kicker,
        kickers: [quads[0], quads[0], quads[0], quads[0], kicker]
      };
    }

    // Full House
    const trips = this.findMultiples(ranks, 3);
    const pairs = this.findMultiples(ranks, 2);
    if (trips.length > 0 && pairs.length > 0) {
      return {
        rank: 6,
        name: 'Full House',
        description: `${this.getRankName(trips[0])}s over ${this.getRankName(pairs[0])}s`,
        trips: trips[0],
        pair: pairs[0],
        kickers: [trips[0], trips[0], trips[0], pairs[0], pairs[0]]
      };
    }

    // Flush
    if (isFlush) {
      return {
        rank: 5,
        name: 'Flush',
        description: 'Five cards of same suit',
        suit: suits[0],
        kickers: sortedRanks
      };
    }

    // Straight
    if (isStraight) {
      return {
        rank: 4,
        name: 'Straight',
        description: 'Five cards in sequence',
        high: sortedRanks[0],
        kickers: sortedRanks
      };
    }

    // Three of a Kind
    if (trips.length > 0) {
      const kickers = ranks.filter(r => r !== trips[0]).sort((a, b) => b - a);
      return {
        rank: 3,
        name: 'Three of a Kind',
        description: `Three ${this.getRankName(trips[0])}s`,
        trips: trips[0],
        kickers: [trips[0], trips[0], trips[0], ...kickers]
      };
    }

    // Two Pair
    if (pairs.length >= 2) {
      const sortedPairs = pairs.sort((a, b) => b - a);
      const kicker = ranks.find(r => !pairs.includes(r));
      return {
        rank: 2,
        name: 'Two Pair',
        description: `${this.getRankName(sortedPairs[0])}s and ${this.getRankName(sortedPairs[1])}s`,
        highPair: sortedPairs[0],
        lowPair: sortedPairs[1],
        kicker,
        kickers: [sortedPairs[0], sortedPairs[0], sortedPairs[1], sortedPairs[1], kicker]
      };
    }

    // One Pair
    if (pairs.length === 1) {
      const kickers = ranks.filter(r => r !== pairs[0]).sort((a, b) => b - a);
      return {
        rank: 1,
        name: 'One Pair',
        description: `Pair of ${this.getRankName(pairs[0])}s`,
        pair: pairs[0],
        kickers: [pairs[0], pairs[0], ...kickers]
      };
    }

    // High Card
    return {
      rank: 0,
      name: 'High Card',
      description: `${this.getRankName(sortedRanks[0])} high`,
      kickers: sortedRanks
    };
  }

  // Evaluate 2-card hand
  static evaluate2CardHand(cards) {
    const ranks = cards.map(c => this.rankValues[c.rank === 'JOKER' ? 'A' : c.rank]);
    const sortedRanks = [...ranks].sort((a, b) => b - a);

    if (ranks[0] === ranks[1]) {
      return {
        rank: 1,
        name: 'Pair',
        description: `Pair of ${this.getRankName(ranks[0])}s`,
        pair: ranks[0],
        kickers: sortedRanks
      };
    }

    return {
      rank: 0,
      name: 'High Card',
      description: `${this.getRankName(sortedRanks[0])} high`,
      kickers: sortedRanks
    };
  }

  // Helper: Check for straight sequence
  static checkStraightSequence(sortedRanks) {
    // Check regular straight
    for (let i = 0; i < 4; i++) {
      if (sortedRanks[i] - sortedRanks[i + 1] !== 1) {
        // Check for wheel (A-2-3-4-5)
        if (sortedRanks[0] === 14 && sortedRanks[1] === 5 && 
            sortedRanks[2] === 4 && sortedRanks[3] === 3 && sortedRanks[4] === 2) {
          return true;
        }
        return false;
      }
    }
    return true;
  }

  // Helper: Find multiples (pairs, trips, quads)
  static findMultiples(ranks, count) {
    const rankCounts = {};
    ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
    return Object.keys(rankCounts)
      .filter(r => rankCounts[r] === count)
      .map(Number)
      .sort((a, b) => b - a);
  }

  // Check royal flush with joker
  static checkRoyalFlushWithJoker(cards) {
    const suitGroups = this.groupBySuit(cards);
    
    for (let suit in suitGroups) {
      const suited = suitGroups[suit];
      if (suited.length >= 4) {
        const ranks = suited.map(c => this.rankValues[c.rank]);
        const royalRanks = [14, 13, 12, 11, 10];
        const missing = royalRanks.filter(r => !ranks.includes(r));
        
        if (missing.length === 1) {
          return { suit, missing: missing[0] };
        }
      }
    }
    return null;
  }

  // Check straight flush with joker
  static checkStraightFlushWithJoker(cards) {
    const suitGroups = this.groupBySuit(cards);
    
    for (let suit in suitGroups) {
      const suited = suitGroups[suit];
      if (suited.length >= 4) {
        const ranks = suited.map(c => this.rankValues[c.rank]).sort((a, b) => b - a);
        
        // Try to find 4-card straight that can be completed with joker
        for (let i = 14; i >= 5; i--) {
          const needed = [i, i-1, i-2, i-3, i-4];
          const missing = needed.filter(n => !ranks.includes(n));
          
          if (missing.length === 1) {
            return { suit, high: i, kickers: needed };
          }
        }
      }
    }
    return null;
  }

  // Check full house with joker
  static checkFullHouseWithJoker(cards) {
    const rankCounts = {};
    cards.forEach(c => {
      const rank = this.rankValues[c.rank];
      rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });

    const pairs = Object.keys(rankCounts).filter(r => rankCounts[r] === 2).map(Number);
    
    // Two pairs + joker = full house
    if (pairs.length === 2) {
      const sortedPairs = pairs.sort((a, b) => b - a);
      return {
        trips: this.getRankName(sortedPairs[0]),
        tripsValue: sortedPairs[0],
        pair: this.getRankName(sortedPairs[1]),
        pairValue: sortedPairs[1]
      };
    }

    return null;
  }

  // Check flush with joker
  static checkFlushWithJoker(cards) {
    const suitGroups = this.groupBySuit(cards);
    
    for (let suit in suitGroups) {
      if (suitGroups[suit].length >= 4) {
        const ranks = suitGroups[suit].map(c => this.rankValues[c.rank]).sort((a, b) => b - a);
        return { suit, kickers: [14, ...ranks].slice(0, 5) }; // Joker as Ace
      }
    }
    return null;
  }

  // Check straight with joker
  static checkStraightWithJoker(cards) {
    const ranks = cards.map(c => this.rankValues[c.rank]).sort((a, b) => b - a);
    
    // Try all possible straights
    for (let high = 14; high >= 5; high--) {
      const needed = [high, high-1, high-2, high-3, high-4];
      const missing = needed.filter(n => !ranks.includes(n));
      
      if (missing.length === 1) {
        return { high, kickers: needed };
      }
    }
    
    return null;
  }

  // Check three of a kind
  static checkThreeOfAKind(cards) {
    const rankCounts = {};
    cards.forEach(c => {
      const rank = this.rankValues[c.rank];
      rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });

    const trips = Object.keys(rankCounts).find(r => rankCounts[r] === 3);
    if (trips) {
      const kickers = cards
        .filter(c => this.rankValues[c.rank] !== Number(trips))
        .map(c => this.rankValues[c.rank])
        .sort((a, b) => b - a);
      
      return {
        rank: this.getRankName(Number(trips)),
        value: Number(trips),
        kickers
      };
    }
    return null;
  }

  // Check four of a kind
  static checkFourOfAKind(cards) {
    const rankCounts = {};
    cards.forEach(c => {
      const rank = this.rankValues[c.rank];
      rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });

    const quad = Object.keys(rankCounts).find(r => rankCounts[r] === 4);
    if (quad) {
      const kicker = cards
        .find(c => this.rankValues[c.rank] !== Number(quad));
      
      return {
        rank: this.getRankName(Number(quad)),
        value: Number(quad),
        kicker: kicker ? this.rankValues[kicker.rank] : 0
      };
    }
    return null;
  }

  // Check pair
  static checkPair(cards) {
    const rankCounts = {};
    cards.forEach(c => {
      const rank = this.rankValues[c.rank];
      rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });

    const pair = Object.keys(rankCounts).find(r => rankCounts[r] === 2);
    if (pair) {
      const kickers = cards
        .filter(c => this.rankValues[c.rank] !== Number(pair))
        .map(c => this.rankValues[c.rank])
        .sort((a, b) => b - a);
      
      return {
        rank: this.getRankName(Number(pair)),
        value: Number(pair),
        kickers
      };
    }
    return null;
  }

  // Helper: Group cards by suit
  static groupBySuit(cards) {
    const groups = {};
    cards.forEach(c => {
      if (!groups[c.suit]) groups[c.suit] = [];
      groups[c.suit].push(c);
    });
    return groups;
  }

  // Helper: Get rank name
  static getRankName(value) {
    const names = {
      2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9',
      10: '10', 11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Ace'
    };
    return names[value] || value;
  }

  // Compare two hands (returns 1 if hand1 wins, -1 if hand2 wins, 0 if tie)
  static compareHands(hand1Eval, hand2Eval) {
    if (hand1Eval.rank !== hand2Eval.rank) {
      return hand1Eval.rank > hand2Eval.rank ? 1 : -1;
    }

    // Same rank, compare kickers
    for (let i = 0; i < Math.min(hand1Eval.kickers.length, hand2Eval.kickers.length); i++) {
      if (hand1Eval.kickers[i] !== hand2Eval.kickers[i]) {
        return hand1Eval.kickers[i] > hand2Eval.kickers[i] ? 1 : -1;
      }
    }

    return 0; // Exact tie (copy)
  }

  // Check if hand is foul (2-card hand beats 5-card hand)
  static isFoulHand(high5, low2) {
    const high5Eval = this.evaluate5CardHand(high5);
    const low2Eval = this.evaluate2CardHand(low2);

    // 2-card can only be pair or high card
    // If 2-card is a pair, check if it beats 5-card hand
    if (low2Eval.rank === 1) { // Pair in low hand
      if (high5Eval.rank === 0) return true; // High card in high hand
      if (high5Eval.rank === 1 && low2Eval.pair > high5Eval.pair) return true; // Better pair in low
    }

    // If both are high card, compare
    if (low2Eval.rank === 0 && high5Eval.rank === 0) {
      if (low2Eval.kickers[0] > high5Eval.kickers[0]) return true;
    }

    return false;
  }

  // Fortune Pai Gow Poker bonus payouts
  static fortunePaytable = {
    'Seven Card Straight Flush': 8000,
    'Royal Flush + Royal Match': 2000,
    'Seven Card Straight Flush with Joker': 1000,
    'Five Aces': 400,
    'Royal Flush': 150,
    'Straight Flush': 50,
    'Four of a Kind': 25,
    'Full House': 5,
    'Flush': 4,
    'Three of a Kind': 3,
    'Straight': 2
  };

  // Evaluate Fortune bonus
  static evaluateFortuneBonus(allSevenCards) {
    // Check for 7-card straight flush
    const suitGroups = this.groupBySuit(allSevenCards);
    for (let suit in suitGroups) {
      if (suitGroups[suit].length === 7) {
        const ranks = suitGroups[suit].map(c => this.rankValues[c.rank === 'JOKER' ? 'A' : c.rank]).sort((a, b) => a - b);
        if (this.is7CardStraight(ranks)) {
          const hasJoker = allSevenCards.some(c => c.rank === 'JOKER');
          if (hasJoker) {
            return { hand: 'Seven Card Straight Flush with Joker', payout: 1000 };
          }
          return { hand: 'Seven Card Straight Flush', payout: 8000 };
        }
      }
    }

    // Check for 5 Aces (4 aces + joker)
    const aceCount = allSevenCards.filter(c => c.rank === 'A').length;
    const hasJoker = allSevenCards.some(c => c.rank === 'JOKER');
    if (aceCount === 4 && hasJoker) {
      return { hand: 'Five Aces', payout: 400 };
    }

// Evaluate best 5-card hand
    const best5Card = this.findBest5CardHand(allSevenCards);
    const handEval5 = this.evaluate5CardHand(best5Card);

    if (handEval5.name === 'Royal Flush') {
      return { hand: 'Royal Flush', payout: 150 };
    }
    if (handEval5.name === 'Straight Flush') {
      return { hand: 'Straight Flush', payout: 50 };
    }
    if (handEval5.name === 'Four of a Kind') {
      return { hand: 'Four of a Kind', payout: 25 };
    }
    if (handEval5.name === 'Full House') {
      return { hand: 'Full House', payout: 5 };
    }
    if (handEval5.name === 'Flush') {
      return { hand: 'Flush', payout: 4 };
    }
    if (handEval5.name === 'Three of a Kind') {
      return { hand: 'Three of a Kind', payout: 3 };
    }
    if (handEval5.name === 'Straight') {
      return { hand: 'Straight', payout: 2 };
    }

    return null;
  }

  // Check if 7 cards form a straight
  static is7CardStraight(sortedRanks) {
    for (let i = 0; i < 6; i++) {
      if (sortedRanks[i + 1] - sortedRanks[i] !== 1) {
        return false;
      }
    }
    return true;
  }

// Find best 5-card hand from 7 cards
  static findBest5CardHand(cards) {
    const combinations = this.getCombinations(cards, 5);
    let bestHand = null;
    let bestEval = null;

    for (let combo of combinations) {
      const handEval = this.evaluate5CardHand(combo);
      if (!bestEval || handEval.rank > bestEval.rank || 
          (handEval.rank === bestEval.rank && this.compareHands(handEval, bestEval) > 0)) {
        bestHand = combo;
        bestEval = handEval;
      }
    }

    return bestHand;
  }

  // Get all combinations of k items from array
  static getCombinations(array, k) {
    const result = [];
    
    function combine(start, combo) {
      if (combo.length === k) {
        result.push([...combo]);
        return;
      }
      
      for (let i = start; i < array.length; i++) {
        combo.push(array[i]);
        combine(i + 1, combo);
        combo.pop();
      }
    }
    
    combine(0, []);
    return result;
  }
}
