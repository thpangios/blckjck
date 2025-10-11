// Professional Baccarat Analytics and Roadmap Generator
export class BaccaratAnalytics {
  constructor() {
    this.history = []; // Array of {result, playerTotal, bankerTotal, natural}
  }

  addResult(result, playerTotal, bankerTotal, isNatural = false) {
    this.history.push({
      result, // 'player', 'banker', 'tie'
      playerTotal,
      bankerTotal,
      natural: isNatural,
      timestamp: Date.now()
    });
  }

  getHistory() {
    return [...this.history];
  }

  clearHistory() {
    this.history = [];
  }

  // Generate Bead Road (simplest - just shows results)
  getBeadRoad() {
    return this.history.map(h => h.result);
  }

  // Generate Big Road (most important roadmap)
  getBigRoad() {
    const road = [];
    let currentStreak = null;
    let column = [];

    for (const hand of this.history) {
      if (hand.result === 'tie') {
        // Ties are marked on the previous result
        if (column.length > 0) {
          column[column.length - 1].ties = (column[column.length - 1].ties || 0) + 1;
        }
        continue;
      }

      if (currentStreak === null || currentStreak !== hand.result) {
        // New streak - start new column
        if (column.length > 0) {
          road.push(column);
        }
        column = [{ result: hand.result, natural: hand.natural }];
        currentStreak = hand.result;
      } else {
        // Continue streak - add to current column
        column.push({ result: hand.result, natural: hand.natural });
      }
    }

    if (column.length > 0) {
      road.push(column);
    }

    return road;
  }

  // Derived road patterns (Big Eye, Small, Cockroach)
  getBigEyeRoad() {
    return this.generateDerivedRoad(1, 1);
  }

  getSmallRoad() {
    return this.generateDerivedRoad(2, 0);
  }

  getCockroachRoad() {
    return this.generateDerivedRoad(3, 0);
  }

  generateDerivedRoad(skip, offset) {
    const bigRoad = this.getBigRoad();
    if (bigRoad.length < skip + 2) return [];

    const derived = [];
    let currentColor = null;
    let column = [];

    for (let i = skip + 1; i < bigRoad.length; i++) {
      const currentCol = bigRoad[i];
      const compareCol = bigRoad[i - skip];
      
      let color;
      if (currentCol.length === compareCol.length) {
        color = 'red'; // Same depth
      } else {
        color = 'blue'; // Different depth
      }

      if (currentColor === null || currentColor !== color) {
        if (column.length > 0) {
          derived.push(column);
        }
        column = [color];
        currentColor = color;
      } else {
        column.push(color);
      }
    }

    if (column.length > 0) {
      derived.push(column);
    }

    return derived;
  }

  // Shoe Statistics
  getShoeStats() {
    if (this.history.length === 0) {
      return {
        totalHands: 0,
        playerWins: 0,
        bankerWins: 0,
        ties: 0,
        playerPercent: 0,
        bankerPercent: 0,
        tiePercent: 0,
        naturals: 0,
        currentStreak: null,
        longestStreak: { type: null, length: 0 }
      };
    }

    const playerWins = this.history.filter(h => h.result === 'player').length;
    const bankerWins = this.history.filter(h => h.result === 'banker').length;
    const ties = this.history.filter(h => h.result === 'tie').length;
    const naturals = this.history.filter(h => h.natural).length;
    const totalHands = this.history.length;

    // Calculate current streak
    let currentStreak = { type: null, length: 0 };
    for (let i = this.history.length - 1; i >= 0; i--) {
      if (this.history[i].result === 'tie') continue;
      
      if (currentStreak.type === null) {
        currentStreak.type = this.history[i].result;
        currentStreak.length = 1;
      } else if (currentStreak.type === this.history[i].result) {
        currentStreak.length++;
      } else {
        break;
      }
    }

    // Find longest streak
    let longestStreak = { type: null, length: 0 };
    let tempStreak = { type: null, length: 0 };
    
    for (const hand of this.history) {
      if (hand.result === 'tie') continue;

      if (tempStreak.type === hand.result) {
        tempStreak.length++;
      } else {
        if (tempStreak.length > longestStreak.length) {
          longestStreak = { ...tempStreak };
        }
        tempStreak = { type: hand.result, length: 1 };
      }
    }

    if (tempStreak.length > longestStreak.length) {
      longestStreak = { ...tempStreak };
    }

    return {
      totalHands,
      playerWins,
      bankerWins,
      ties,
      playerPercent: ((playerWins / totalHands) * 100).toFixed(1),
      bankerPercent: ((bankerWins / totalHands) * 100).toFixed(1),
      tiePercent: ((ties / totalHands) * 100).toFixed(1),
      naturals,
      currentStreak,
      longestStreak
    };
  }

  // Pattern Analysis
  getPatternAnalysis() {
    const bigRoad = this.getBigRoad();
    if (bigRoad.length < 3) {
      return { pattern: 'insufficient_data', confidence: 0, recommendation: null };
    }

    // Analyze last 10 columns
    const recentCols = bigRoad.slice(-10);
    
    // Check for streaks (Dragon)
    const avgColumnLength = recentCols.reduce((sum, col) => sum + col.length, 0) / recentCols.length;
    if (avgColumnLength >= 3) {
      return {
        pattern: 'dragon',
        confidence: Math.min(95, avgColumnLength * 20),
        recommendation: 'Follow the streak',
        description: 'Long consecutive wins for one side'
      };
    }

    // Check for choppy pattern (alternating)
    const isChoppy = recentCols.every(col => col.length === 1);
    if (isChoppy) {
      return {
        pattern: 'chop',
        confidence: 85,
        recommendation: 'Bet opposite of last result',
        description: 'Alternating between Player and Banker'
      };
    }

    // Check for zigzag/streaky mix
    const shortColumns = recentCols.filter(col => col.length <= 2).length;
    if (shortColumns >= 7) {
      return {
        pattern: 'zigzag',
        confidence: 70,
        recommendation: 'Look for pattern breaks',
        description: 'Mixed pattern of short streaks'
      };
    }

    return {
      pattern: 'random',
      confidence: 50,
      recommendation: 'Bet on Banker (lowest house edge)',
      description: 'No clear pattern detected'
    };
  }

  // Predict next outcome (for entertainment - not real prediction!)
  getPrediction() {
    const pattern = this.getPatternAnalysis();
    const stats = this.getShoeStats();

    if (pattern.pattern === 'dragon' && stats.currentStreak.length >= 3) {
      return {
        prediction: stats.currentStreak.type,
        confidence: pattern.confidence,
        reason: `${stats.currentStreak.type} streak of ${stats.currentStreak.length}`
      };
    }

    if (pattern.pattern === 'chop') {
      const lastNonTie = this.history.filter(h => h.result !== 'tie').slice(-1)[0];
      const opposite = lastNonTie.result === 'player' ? 'banker' : 'player';
      return {
        prediction: opposite,
        confidence: pattern.confidence,
        reason: 'Choppy pattern - alternating results'
      };
    }

    return {
      prediction: 'banker',
      confidence: 50,
      reason: 'Banker has lowest house edge (1.06%)'
    };
  }

  // Calculate commission owed on banker wins
  calculateCommission(bankerWinnings) {
    return Math.round(bankerWinnings * 0.05);
  }

  // Export hand history for analysis
  exportHistory() {
    return this.history.map((h, i) => ({
      hand: i + 1,
      result: h.result.toUpperCase(),
      player: h.playerTotal,
      banker: h.bankerTotal,
      natural: h.natural ? 'Yes' : 'No'
    }));
  }
}

// Betting Systems
export class BaccaratBettingSystems {
  static martingale(lastBet, won, baseBet) {
    if (won) return baseBet;
    return lastBet * 2;
  }

  static fibonacci(betHistory, baseBet) {
    if (betHistory.length === 0) return baseBet;
    if (betHistory[betHistory.length - 1].won) {
      // Go back 2 steps in sequence
      return Math.max(baseBet, betHistory[betHistory.length - 1].amount / 2);
    }
    // Add last two bets
    const lastTwo = betHistory.slice(-2);
    if (lastTwo.length < 2) return baseBet * 2;
    return lastTwo[0].amount + lastTwo[1].amount;
  }

  static paroli(lastBet, won, baseBet, streak) {
    if (!won || streak >= 3) return baseBet;
    return lastBet * 2;
  }

  static oneTwoThreeSix(lastBet, won, baseBet, step) {
    const sequence = [1, 2, 3, 6];
    if (!won) return baseBet * sequence[0];
    const nextStep = Math.min(step + 1, 3);
    return baseBet * sequence[nextStep];
  }

  static dalembert(lastBet, won, baseBet) {
    if (won) return Math.max(baseBet, lastBet - baseBet);
    return lastBet + baseBet;
  }
}
