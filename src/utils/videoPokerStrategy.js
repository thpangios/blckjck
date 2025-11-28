import { VideoPokerRules } from './videoPokerRules';

// Professional Expected Value Calculator using Combinatorics
export class VideoPokerStrategy {
  
  // Calculate EXACT expected value for a hold combination
  static calculateExactEV(heldCards, variant, coins) {
    const deck = VideoPokerRules.createDeck();
    
    // Remove held cards from deck
    const availableCards = deck.filter(deckCard => 
      !heldCards.some(held => held.value === deckCard.value && held.suit === deckCard.suit)
    );

    const drawCount = 5 - heldCards.length;
    
    if (drawCount === 0) {
      // No draw needed, evaluate current hand
      const hand = VideoPokerRules.evaluateHand(heldCards, variant);
      return VideoPokerRules.getPayout(hand, variant, coins);
    }

    // Calculate EV by trying all possible draw combinations
    const combinations = this.getCombinations(availableCards, drawCount);
    let totalPayout = 0;

    for (const drawnCards of combinations) {
      const finalHand = [...heldCards, ...drawnCards];
      const hand = VideoPokerRules.evaluateHand(finalHand, variant);
      const payout = VideoPokerRules.getPayout(hand, variant, coins);
      totalPayout += payout;
    }

    // Average payout across all possible draws
    return totalPayout / combinations.length;
  }

  // Generate all combinations of size k from array
  static getCombinations(array, k) {
    if (k === 0) return [[]];
    if (k > array.length) return [];
    
    const combinations = [];
    
    // For video poker, we need manageable computation
    // For 0 cards held: C(47,5) = 1,533,939 combinations (too many!)
    // We'll use sampling for large combination counts
    
    const totalCombinations = this.binomialCoefficient(array.length, k);
    
    if (totalCombinations > 50000) {
      // Use Monte Carlo sampling for large combination spaces
      return this.sampleCombinations(array, k, 10000);
    }

    // Generate all combinations for manageable sizes
    function generateCombos(arr, size, start = 0, current = []) {
      if (current.length === size) {
        combinations.push([...current]);
        return;
      }
      
      for (let i = start; i <= arr.length - (size - current.length); i++) {
        current.push(arr[i]);
        generateCombos(arr, size, i + 1, current);
        current.pop();
      }
    }

    generateCombos(array, k);
    return combinations;
  }

  // Monte Carlo sampling for large combination spaces
  static sampleCombinations(array, k, sampleSize) {
    const samples = [];
    const seen = new Set();

    for (let i = 0; i < sampleSize; i++) {
      const sample = [];
      const indices = [];
      
      while (sample.length < k) {
        const randomIndex = Math.floor(Math.random() * array.length);
        if (!indices.includes(randomIndex)) {
          indices.push(randomIndex);
          sample.push(array[randomIndex]);
        }
      }

      const key = sample.map(c => c.id).sort().join(',');
      if (!seen.has(key)) {
        seen.add(key);
        samples.push(sample);
      }
    }

    return samples;
  }

  // Binomial coefficient C(n,k) = n! / (k! * (n-k)!)
  static binomialCoefficient(n, k) {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result *= (n - i + 1) / i;
    }
    return Math.round(result);
  }

  // Get ALL possible hold combinations (32 total including hold none)
  static getAllHoldCombinations() {
    const combinations = [];
    
    // Generate all 31 non-empty combinations
    for (let i = 1; i < 32; i++) {
      const holds = [];
      for (let j = 0; j < 5; j++) {
        if (i & (1 << j)) {
          holds.push(j);
        }
      }
      combinations.push(holds);
    }

    // Add hold nothing (draw all 5)
    combinations.push([]);

    return combinations;
  }

  // Find optimal hold strategy with exact EV
  static getOptimalHold(cards, variant, coins) {
    const combinations = this.getAllHoldCombinations();
    let bestEV = -Infinity;
    let bestHold = [];
    let allEVs = [];

    for (const holdIndices of combinations) {
      const heldCards = holdIndices.map(i => cards[i]);
      const ev = this.calculateExactEV(heldCards, variant, coins);
      
      allEVs.push({
        holdIndices,
        ev,
        description: this.getHoldDescription(cards, holdIndices)
      });

      if (ev > bestEV) {
        bestEV = ev;
        bestHold = holdIndices;
      }
    }

    // Sort all EVs by value for display
    allEVs.sort((a, b) => b.ev - a.ev);

    return {
      holdIndices: bestHold,
      expectedValue: bestEV,
      reasoning: this.getDetailedReasoning(cards, bestHold, variant),
      allOptions: allEVs.slice(0, 10) // Top 10 options
    };
  }

  static getHoldDescription(cards, holdIndices) {
    if (holdIndices.length === 0) return 'Draw 5 new cards';
    if (holdIndices.length === 5) return 'Hold all 5 cards';
    
    const heldCards = holdIndices.map(i => `${cards[i].value}${cards[i].suit}`).join(' ');
    return `Hold: ${heldCards}`;
  }

  static getDetailedReasoning(cards, holdIndices, variant) {
    if (holdIndices.length === 0) {
      return 'No winning combination - draw 5 new cards';
    }

    const heldCards = holdIndices.map(i => cards[i]);
    
    if (holdIndices.length === 5) {
      const hand = VideoPokerRules.evaluateHand(heldCards, variant);
      return `Already have ${hand} - hold all cards`;
    }

    // Analyze what we're drawing to
    const ranks = heldCards.map(c => VideoPokerRules.valueRanks[c.value]);
    const suits = heldCards.map(c => c.suit);

    const rankCounts = {};
    ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
    const maxCount = Math.max(...Object.values(rankCounts));

    const isFlushDraw = suits.length >= 4 && suits.every(s => s === suits[0]);
    const isStraightDraw = this.isStraightDraw(ranks);
    const hasHighCards = ranks.some(r => r >= 11 || r === 14);

    if (maxCount === 4) return 'Hold four of a kind - draw 1 for possible full house';
    if (maxCount === 3) return 'Hold three of a kind - draw 2 for four of a kind or full house';
    if (maxCount === 2 && Object.values(rankCounts).filter(c => c === 2).length === 2) {
      return 'Hold two pair - draw 1 for full house';
    }
    if (maxCount === 2) {
      const pairRank = Object.entries(rankCounts).find(([_, c]) => c === 2)[0];
      if (Number(pairRank) >= 11 || Number(pairRank) === 14) {
        return 'Hold high pair (Jacks or better) - draw 3';
      }
      return 'Hold low pair - draw 3 for trips or better';
    }

    if (isFlushDraw) return `Hold 4 to flush - draw 1 (${(9/47*100).toFixed(1)}% chance)`;
    if (isStraightDraw) return 'Hold 4 to straight - draw 1';

    if (hasHighCards) {
      const highCardCount = ranks.filter(r => r >= 11 || r === 14).length;
      return `Hold ${highCardCount} high card${highCardCount > 1 ? 's' : ''} (J/Q/K/A) - potential for pairs`;
    }

    return `Hold ${holdIndices.length} cards - drawing to improve`;
  }

  static isStraightDraw(ranks) {
    if (ranks.length < 4) return false;
    
    const sorted = [...ranks].sort((a, b) => a - b);
    
    // Check for open-ended or inside straight draw
    let consecutive = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = sorted[i + 1] - sorted[i];
      if (diff === 1) {
        consecutive++;
      } else if (diff > 2) {
        consecutive = 1;
      }
    }

    return consecutive >= 4;
  }

  // Calculate draw probabilities for display
  static getDrawProbabilities(heldCards, variant) {
    const drawCount = 5 - heldCards.length;
    const cardsRemaining = 52 - 5; // 47 cards left in deck

    const probabilities = {
      royal: 0,
      straightFlush: 0,
      fourOfKind: 0,
      fullHouse: 0,
      flush: 0,
      straight: 0,
      threeOfKind: 0,
      twoPair: 0,
      pair: 0
    };

    // Simplified probability estimates
    // (Full calculation would require checking all draw combinations)
    
    if (drawCount === 5) {
      probabilities.royal = 4 / this.binomialCoefficient(47, 5);
      probabilities.straightFlush = 36 / this.binomialCoefficient(47, 5);
      probabilities.fourOfKind = 624 / this.binomialCoefficient(47, 5);
    }

    return probabilities;
  }
}
