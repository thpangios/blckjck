// Video Poker Game Logic and Hand Evaluation
export class VideoPokerRules {
  static suits = ['♠', '♥', '♦', '♣'];
  static values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  static valueMap = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };

  // Paytables for different variants (per coin bet)
  static paytables = {
    jacksOrBetter: {
      'Royal Flush': [250, 500, 750, 1000, 4000],
      'Straight Flush': [50, 100, 150, 200, 250],
      'Four of a Kind': [25, 50, 75, 100, 125],
      'Full House': [9, 18, 27, 36, 45],
      'Flush': [6, 12, 18, 24, 30],
      'Straight': [4, 8, 12, 16, 20],
      'Three of a Kind': [3, 6, 9, 12, 15],
      'Two Pair': [2, 4, 6, 8, 10],
      'Jacks or Better': [1, 2, 3, 4, 5]
    },
    deucesWild: {
      'Royal Flush': [250, 500, 750, 1000, 4000],
      'Four Deuces': [200, 400, 600, 800, 1000],
      'Wild Royal Flush': [25, 50, 75, 100, 125],
      'Five of a Kind': [15, 30, 45, 60, 75],
      'Straight Flush': [9, 18, 27, 36, 45],
      'Four of a Kind': [5, 10, 15, 20, 25],
      'Full House': [3, 6, 9, 12, 15],
      'Flush': [2, 4, 6, 8, 10],
      'Straight': [2, 4, 6, 8, 10],
      'Three of a Kind': [1, 2, 3, 4, 5]
    },
    bonusPoker: {
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
  };

  // Evaluate hand
  static evaluateHand(cards, variant = 'jacksOrBetter') {
    if (variant === 'deucesWild') {
      return this.evaluateDeucesWild(cards);
    } else if (variant === 'bonusPoker') {
      return this.evaluateBonusPoker(cards);
    } else {
      return this.evaluateJacksOrBetter(cards);
    }
  }

  static evaluateJacksOrBetter(cards) {
    const result = this.analyzeHand(cards);

    if (result.isRoyalFlush) return 'Royal Flush';
    if (result.isStraightFlush) return 'Straight Flush';
    if (result.isFourOfAKind) return 'Four of a Kind';
    if (result.isFullHouse) return 'Full House';
    if (result.isFlush) return 'Flush';
    if (result.isStraight) return 'Straight';
    if (result.isThreeOfAKind) return 'Three of a Kind';
    if (result.isTwoPair) return 'Two Pair';
    if (result.isJacksOrBetter) return 'Jacks or Better';
    
    return null;
  }

  static evaluateDeucesWild(cards) {
    const deuces = cards.filter(c => c.value === '2').length;
    const result = this.analyzeHand(cards, true);

    if (deuces === 4) return 'Four Deuces';
    if (result.isRoyalFlush && deuces === 0) return 'Royal Flush';
    if (result.isRoyalFlush && deuces > 0) return 'Wild Royal Flush';
    if (result.isFiveOfAKind) return 'Five of a Kind';
    if (result.isStraightFlush) return 'Straight Flush';
    if (result.isFourOfAKind) return 'Four of a Kind';
    if (result.isFullHouse) return 'Full House';
    if (result.isFlush) return 'Flush';
    if (result.isStraight) return 'Straight';
    if (result.isThreeOfAKind) return 'Three of a Kind';

    return null;
  }

  static evaluateBonusPoker(cards) {
    const result = this.analyzeHand(cards);

    if (result.isRoyalFlush) return 'Royal Flush';
    if (result.isStraightFlush) return 'Straight Flush';
    
    // Special four of a kind checks for bonus poker
    if (result.isFourOfAKind) {
      const fourValue = result.ranks.find(r => r.count === 4).value;
      if (fourValue === 14) return 'Four Aces'; // Aces
      if (fourValue >= 2 && fourValue <= 4) return 'Four 2-4';
      return 'Four 5-K';
    }

    if (result.isFullHouse) return 'Full House';
    if (result.isFlush) return 'Flush';
    if (result.isStraight) return 'Straight';
    if (result.isThreeOfAKind) return 'Three of a Kind';
    if (result.isTwoPair) return 'Two Pair';
    if (result.isJacksOrBetter) return 'Jacks or Better';
    
    return null;
  }

  static analyzeHand(cards, allowWild = false) {
    const values = cards.map(c => this.valueMap[c.value]);
    const suits = cards.map(c => c.suit);
    const wilds = allowWild ? cards.filter(c => c.value === '2').length : 0;

    // Count occurrences
    const valueCounts = {};
    values.forEach(v => {
      if (allowWild && v === 2) return; // Don't count wilds in regular counts
      valueCounts[v] = (valueCounts[v] || 0) + 1;
    });

    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    const uniqueValues = Object.keys(valueCounts).map(Number).sort((a, b) => a - b);

    // Check flush
    const isFlush = suits.every(s => s === suits[0]);

    // Check straight (including wilds)
    const isStraight = this.checkStraight(uniqueValues, wilds);

    // Royal flush check
    const isRoyalFlush = isFlush && isStraight && 
      (uniqueValues.includes(14) && uniqueValues.includes(13) && uniqueValues.includes(12) && 
       uniqueValues.includes(11) && uniqueValues.includes(10));

    const isStraightFlush = isFlush && isStraight;

    // Apply wilds to counts
    const maxCount = counts[0] || 0;
    const adjustedMaxCount = maxCount + wilds;

    const isFiveOfAKind = adjustedMaxCount >= 5;
    const isFourOfAKind = adjustedMaxCount >= 4 && !isFiveOfAKind;
    const isFullHouse = (counts[0] === 3 && counts[1] === 2) || 
                        (counts[0] === 3 && wilds >= 2) ||
                        (counts[0] === 2 && counts[1] === 2 && wilds >= 1);
    const isThreeOfAKind = adjustedMaxCount >= 3 && !isFourOfAKind && !isFullHouse && !isFiveOfAKind;
    const isTwoPair = (counts[0] === 2 && counts[1] === 2) || (counts[0] === 2 && wilds >= 2);

    // Jacks or Better check
    const highPairs = uniqueValues.filter(v => v >= 11 && valueCounts[v] >= 2);
    const isJacksOrBetter = highPairs.length > 0 || (counts[0] === 2 && wilds >= 1 && uniqueValues.some(v => v >= 11));

    return {
      isRoyalFlush,
      isStraightFlush,
      isFiveOfAKind,
      isFourOfAKind,
      isFullHouse,
      isFlush,
      isStraight,
      isThreeOfAKind,
      isTwoPair,
      isJacksOrBetter,
      ranks: Object.entries(valueCounts).map(([value, count]) => ({ value: Number(value), count }))
    };
  }

  static checkStraight(values, wilds) {
    if (values.length + wilds < 5) return false;

    // Check for wheel (A-2-3-4-5)
    const wheelValues = [14, 2, 3, 4, 5];
    const wheelMatches = wheelValues.filter(v => values.includes(v)).length;
    if (wheelMatches + wilds >= 5) return true;

    // Check regular straights
    for (let i = 0; i <= values.length - 1; i++) {
      let consecutive = 1;
      let wildsUsed = 0;
      
      for (let j = values[i] + 1; j <= values[i] + 4; j++) {
        if (values.includes(j)) {
          consecutive++;
        } else if (wildsUsed < wilds) {
          consecutive++;
          wildsUsed++;
        } else {
          break;
        }
      }

      if (consecutive >= 5) return true;
    }

    return false;
  }

  static getPayout(hand, variant, coins) {
    if (!hand) return 0;
    const paytable = this.paytables[variant];
    if (!paytable[hand]) return 0;
    return paytable[hand][coins - 1];
  }

  static getHandRank(handName) {
    const ranks = {
      'Royal Flush': 10,
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
}
