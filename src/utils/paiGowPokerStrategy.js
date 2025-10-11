import { PaiGowPokerRules } from './paiGowPokerRules';

// Pai Gow Poker Optimal Strategy Calculator
export class PaiGowPokerStrategy {
  
  // House Way algorithm - how dealer sets hands
  static setHouseWay(sevenCards) {
    const hand = PaiGowPokerRules.evaluate5CardHand(sevenCards);
    
    // No pair - place highest card in front, next 2 highest in back
    if (hand.rank === 0) {
      return this.setNoPair(sevenCards);
    }

    // One pair - keep pair in back, two highest other cards in front
    if (hand.rank === 1) {
      return this.setOnePair(sevenCards);
    }

    // Two pair - split based on rank
    if (hand.rank === 2) {
      return this.setTwoPair(sevenCards);
    }

    // Three of a kind - keep trips in back unless Aces
    if (hand.rank === 3) {
      return this.setThreeOfAKind(sevenCards);
    }

    // Straight or Flush - keep in back, play two highest in front
    if (hand.rank === 4 || hand.rank === 5) {
      return this.setStraightOrFlush(sevenCards);
    }

    // Full House - split unless pair is 2s
    if (hand.rank === 6) {
      return this.setFullHouse(sevenCards);
    }

    // Four of a Kind - split based on rank
    if (hand.rank === 7) {
      return this.setFourOfAKind(sevenCards);
    }

    // Straight Flush - play as straight or flush if it makes Ace-high front
    if (hand.rank === 8) {
      return this.setStraightFlush(sevenCards);
    }

    // Royal Flush or Five Aces - keep together unless can make pair of 7s or better in front
    if (hand.rank >= 9) {
      return this.setRoyalOrFiveAces(sevenCards);
    }

    // Default
    return this.setNoPair(sevenCards);
  }

  static setNoPair(cards) {
    const sorted = [...cards].sort((a, b) => 
      PaiGowPokerRules.rankValues[b.rank === 'JOKER' ? 'A' : b.rank] - 
      PaiGowPokerRules.rankValues[a.rank === 'JOKER' ? 'A' : a.rank]
    );
    
    return {
      high5: sorted.slice(2),
      low2: sorted.slice(0, 2)
    };
  }

  static setOnePair(cards) {
    const rankCounts = this.getRankCounts(cards);
    const pairRank = Object.keys(rankCounts).find(r => rankCounts[r] === 2);
    
    const pairCards = cards.filter(c => {
      const rank = c.rank === 'JOKER' ? 'A' : c.rank;
      return PaiGowPokerRules.rankValues[rank] === Number(pairRank);
    });
    
    const otherCards = cards.filter(c => !pairCards.includes(c)).sort((a, b) => 
      PaiGowPokerRules.rankValues[b.rank === 'JOKER' ? 'A' : b.rank] - 
      PaiGowPokerRules.rankValues[a.rank === 'JOKER' ? 'A' : a.rank]
    );
    
    return {
      high5: [...pairCards, ...otherCards.slice(2)],
      low2: otherCards.slice(0, 2)
    };
  }

  static setTwoPair(cards) {
    const rankCounts = this.getRankCounts(cards);
    const pairs = Object.keys(rankCounts)
      .filter(r => rankCounts[r] === 2)
      .map(Number)
      .sort((a, b) => b - a);
    
    if (pairs.length < 2) return this.setOnePair(cards);

    const highPair = pairs[0];
    const lowPair = pairs[1];
    
    // House Way rules for two pair:
    // - 7s or higher: split
    // - 2s through 6s: keep together if front can be King or better
    // - Aces: always split unless other pair is 6s or lower
    
    if (highPair === 14) { // Aces
      if (lowPair <= 6) {
        // Keep aces together if low pair is 6 or less
        return this.keepPairsTogether(cards, pairs);
      }
      // Split aces
      return this.splitPairs(cards, pairs);
    }
    
    if (highPair >= 7) {
      // Split pairs 7s and higher
      return this.splitPairs(cards, pairs);
    }
    
    // Low pairs (2-6): keep together
    return this.keepPairsTogether(cards, pairs);
  }

  static setThreeOfAKind(cards) {
    const rankCounts = this.getRankCounts(cards);
    const tripsRank = Object.keys(rankCounts).find(r => rankCounts[r] === 3);
    
    if (Number(tripsRank) === 14) { // Three Aces
      // Split: pair of aces in back, one ace in front
      const aces = cards.filter(c => {
        const rank = c.rank === 'JOKER' ? 'A' : c.rank;
        return PaiGowPokerRules.rankValues[rank] === 14;
      });
      const others = cards.filter(c => !aces.includes(c)).sort((a, b) => 
        PaiGowPokerRules.rankValues[b.rank === 'JOKER' ? 'A' : b.rank] - 
        PaiGowPokerRules.rankValues[a.rank === 'JOKER' ? 'A' : a.rank]
      );
      
      return {
        high5: [aces[0], aces[1], ...others.slice(1)],
        low2: [aces[2], others[0]]
      };
    }
    
    // Keep trips together
    const tripsCards = cards.filter(c => {
      const rank = c.rank === 'JOKER' ? 'A' : c.rank;
      return PaiGowPokerRules.rankValues[rank] === Number(tripsRank);
    });
    
    const others = cards.filter(c => !tripsCards.includes(c)).sort((a, b) => 
      PaiGowPokerRules.rankValues[b.rank === 'JOKER' ? 'A' : b.rank] - 
      PaiGowPokerRules.rankValues[a.rank === 'JOKER' ? 'A' : a.rank]
    );
    
    return {
      high5: [...tripsCards, ...others.slice(2)],
      low2: others.slice(0, 2)
    };
  }

  static setStraightOrFlush(cards) {
    // Find best 5-card straight or flush
    const best5 = this.findBestStraightOrFlush(cards);
    const remaining = cards.filter(c => !best5.includes(c));
    
    return {
      high5: best5,
      low2: remaining.sort((a, b) => 
        PaiGowPokerRules.rankValues[b.rank === 'JOKER' ? 'A' : b.rank] - 
        PaiGowPokerRules.rankValues[a.rank === 'JOKER' ? 'A' : a.rank]
      )
    };
  }

  static setFullHouse(cards) {
    const rankCounts = this.getRankCounts(cards);
    const tripsRank = Object.keys(rankCounts).find(r => rankCounts[r] === 3);
    const pairRank = Object.keys(rankCounts).find(r => rankCounts[r] === 2);
    
    // If pair is 2s, keep full house together
    if (Number(pairRank) === 2) {
      const tripsCards = cards.filter(c => {
        const rank = c.rank === 'JOKER' ? 'A' : c.rank;
        return PaiGowPokerRules.rankValues[rank] === Number(tripsRank);
      });
      const pairCards = cards.filter(c => {
        const rank = c.rank === 'JOKER' ? 'A' : c.rank;
        return PaiGowPokerRules.rankValues[rank] === Number(pairRank);
      });
      const other = cards.filter(c => !tripsCards.includes(c) && !pairCards.includes(c));
      
      return {
        high5: [...tripsCards, ...pairCards],
        low2: [...other, pairCards[0]].slice(0, 2)
      };
    }
    
    // Split: keep trips in back, pair in front
    const tripsCards = cards.filter(c => {
      const rank = c.rank === 'JOKER' ? 'A' : c.rank;
      return PaiGowPokerRules.rankValues[rank] === Number(tripsRank);
    });
    const pairCards = cards.filter(c => {
      const rank = c.rank === 'JOKER' ? 'A' : c.rank;
      return PaiGowPokerRules.rankValues[rank] === Number(pairRank);
    });
    
    return {
      high5: [...tripsCards, ...cards.filter(c => !tripsCards.includes(c) && !pairCards.includes(c))],
      low2: pairCards
    };
  }

  static setFourOfAKind(cards) {
    const rankCounts = this.getRankCounts(cards);
    const quadsRank = Number(Object.keys(rankCounts).find(r => rankCounts[r] === 4));
    
    // Four of a Kind rules:
    // 2-6: Keep together
    // 7-10: Split unless front can be King or better
    // J-K: Split
    // Aces: Split
    
    const quadsCards = cards.filter(c => {
      const rank = c.rank === 'JOKER' ? 'A' : c.rank;
      return PaiGowPokerRules.rankValues[rank] === quadsRank;
    });
    
    const others = cards.filter(c => !quadsCards.includes(c)).sort((a, b) => 
      PaiGowPokerRules.rankValues[b.rank === 'JOKER' ? 'A' : b.rank] - 
      PaiGowPokerRules.rankValues[a.rank === 'JOKER' ? 'A' : a.rank]
    );
    
    if (quadsRank <= 6) {
      // Keep together
      return {
        high5: [...quadsCards, others[2]],
        low2: others.slice(0, 2)
      };
    }
    
    if (quadsRank >= 11 || quadsRank === 14) {
      // Split
      return {
        high5: [quadsCards[0], quadsCards[1], ...others],
        low2: [quadsCards[2], quadsCards[3]]
      };
    }
    
    // 7-10: check if front can be K or better
    const frontRank = PaiGowPokerRules.rankValues[others[0].rank === 'JOKER' ? 'A' : others[0].rank];
    if (frontRank >= 13) {
      // Keep together
      return {
        high5: [...quadsCards, others[2]],
        low2: others.slice(0, 2)
      };
    }
    
    // Split
    return {
      high5: [quadsCards[0], quadsCards[1], ...others],
      low2: [quadsCards[2], quadsCards[3]]
    };
  }

  static setStraightFlush(cards) {
    // Try to make Ace-high or better in front while keeping straight flush
    const best5 = this.findBestStraightFlush(cards);
    const remaining = cards.filter(c => !best5.includes(c));
    
    const frontRank = PaiGowPokerRules.rankValues[remaining[0].rank === 'JOKER' ? 'A' : remaining[0].rank];
    
    // If front is Ace-high or better, keep straight flush
    if (frontRank >= 14) {
      return {
        high5: best5,
        low2: remaining
      };
    }
    
    // Otherwise, play as straight or flush if it makes better front
    return this.setStraightOrFlush(cards);
  }

  static setRoyalOrFiveAces(cards) {
    // Check if we can make pair of 7s or better in front
    const rankCounts = this.getRankCounts(cards);
    
    // For 5 aces, check if remaining cards make good front
    if (cards.filter(c => c.rank === 'A' || c.rank === 'JOKER').length >= 5) {
      const aces = cards.filter(c => c.rank === 'A' || c.rank === 'JOKER');
      const others = cards.filter(c => !aces.includes(c));
      
      return {
        high5: aces.slice(0, 5),
        low2: [...aces.slice(5), ...others].slice(0, 2)
      };
    }
    
    // Royal flush - keep together
    return {
      high5: cards.slice(0, 5),
      low2: cards.slice(5)
    };
  }

  // Helper methods
  static getRankCounts(cards) {
    const counts = {};
    cards.forEach(c => {
      const rank = c.rank === 'JOKER' ? 'A' : c.rank;
      const value = PaiGowPokerRules.rankValues[rank];
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }

  static splitPairs(cards, pairs) {
    const highPairCards = cards.filter(c => {
      const rank = c.rank === 'JOKER' ? 'A' : c.rank;
      return PaiGowPokerRules.rankValues[rank] === pairs[0];
    });
    
    const lowPairCards = cards.filter(c => {
      const rank = c.rank === 'JOKER' ? 'A' : c.rank;
      return PaiGowPokerRules.rankValues[rank] === pairs[1];
    });
    
    const others = cards.filter(c => !highPairCards.includes(c) && !lowPairCards.includes(c));
    
    return {
      high5: [...highPairCards, ...others],
      low2: lowPairCards
    };
  }

  static keepPairsTogether(cards, pairs) {
    const allPairCards = cards.filter(c => {
      const rank = c.rank === 'JOKER' ? 'A' : c.rank;
      const value = PaiGowPokerRules.rankValues[rank];
      return pairs.includes(value);
    });
    
    const others = cards.filter(c => !allPairCards.includes(c)).sort((a, b) => 
      PaiGowPokerRules.rankValues[b.rank === 'JOKER' ? 'A' : b.rank] - 
      PaiGowPokerRules.rankValues[a.rank === 'JOKER' ? 'A' : a.rank]
    );
    
    return {
      high5: [...allPairCards, ...others.slice(2)],
      low2: others.slice(0, 2)
    };
  }

 static findBestStraightOrFlush(cards) {
    // Find best 5-card combination that makes straight or flush
    const combos = PaiGowPokerRules.getCombinations(cards, 5);
    let best = null;
    let bestRank = -1;
    
    for (let combo of combos) {
      const handEval = PaiGowPokerRules.evaluate5CardHand(combo);
      if (handEval.rank >= 4 && handEval.rank > bestRank) { // Straight or better
        best = combo;
        bestRank = handEval.rank;
      }
    }
    
    return best || cards.slice(0, 5);
  }

  static findBestStraightFlush(cards) {
    const combos = PaiGowPokerRules.getCombinations(cards, 5);
    let best = null;
    let bestRank = -1;
    
    for (let combo of combos) {
      const handEval = PaiGowPokerRules.evaluate5CardHand(combo);
      if (handEval.rank === 8) { // Straight flush
        best = combo;
        bestRank = handEval.rank;
      }
    }
    
    return best || this.findBestStraightOrFlush(cards);
  }
  // Get all possible ways to set a hand
  static getAllPossibleSets(cards) {
    const allSets = [];
    const combos5 = PaiGowPokerRules.getCombinations(cards, 5);
    
    for (let high5 of combos5) {
      const low2 = cards.filter(c => !high5.includes(c));
      
      // Check if valid (not foul)
      if (!PaiGowPokerRules.isFoulHand(high5, low2)) {
        const high5Eval = PaiGowPokerRules.evaluate5CardHand(high5);
        const low2Eval = PaiGowPokerRules.evaluate2CardHand(low2);
        
        allSets.push({
          high5,
          low2,
          high5Eval,
          low2Eval,
          description: `${high5Eval.description} / ${low2Eval.description}`
        });
      }
    }
    
    return allSets;
  }

  // Find optimal set (maximize win probability)
  static findOptimalSet(cards) {
    const houseWay = this.setHouseWay(cards);
    const allSets = this.getAllPossibleSets(cards);
    
    // Score each set (higher = better)
    let bestSet = houseWay;
    let bestScore = this.scoreHandSet(houseWay);
    
    for (let set of allSets) {
      const score = this.scoreHandSet(set);
      if (score > bestScore) {
        bestSet = set;
        bestScore = score;
      }
    }
    
    return {
      ...bestSet,
      isHouseWay: JSON.stringify(bestSet.high5) === JSON.stringify(houseWay.high5)
    };
  }

  // Score a hand set (simple heuristic)
  static scoreHandSet(set) {
    const high5Eval = PaiGowPokerRules.evaluate5CardHand(set.high5);
    const low2Eval = PaiGowPokerRules.evaluate2CardHand(set.low2);
    
    // Weight high hand more heavily
    let score = high5Eval.rank * 100;
    
    // Add kicker values
    score += high5Eval.kickers.reduce((sum, k) => sum + k, 0);
    
    // Add low hand value (less weight)
    score += low2Eval.rank * 10;
    score += low2Eval.kickers.reduce((sum, k) => sum + k * 0.5, 0);
    
    return score;
  }
}
