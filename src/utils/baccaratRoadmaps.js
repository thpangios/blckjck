// Professional Baccarat Roadmap Generator
export class BaccaratRoadmaps {
  
  // Generate Bead Plate (珠盘路) - Basic chronological record
  static generateBeadPlate(results) {
    // 6 rows x unlimited columns grid
    const beadPlate = [];
    let row = 0;
    let col = 0;

    results.forEach(result => {
      if (!beadPlate[col]) beadPlate[col] = [];
      beadPlate[col][row] = result;
      
      row++;
      if (row >= 6) {
        row = 0;
        col++;
      }
    });

    return beadPlate;
  }

  // Generate Big Road (大路) - Main pattern display
  static generateBigRoad(results) {
    const bigRoad = [];
    let col = 0;
    let row = 0;
    let lastResult = null;

    results.forEach((result, index) => {
      // Skip ties in big road (they're marked on existing results)
      if (result === 'tie') {
        // Mark tie on last entry
        if (bigRoad[col] && bigRoad[col][row - 1]) {
          bigRoad[col][row - 1].tie = (bigRoad[col][row - 1].tie || 0) + 1;
        }
        return;
      }

      // Start new column if result changed
      if (result !== lastResult) {
        if (lastResult !== null) col++;
        row = 0;
      }

      if (!bigRoad[col]) bigRoad[col] = [];
      bigRoad[col][row] = { result, tie: 0 };

      row++;
      lastResult = result;
    });

    return bigRoad;
  }

  // Generate Big Eye Boy (大眼仔路) - Derivative road
  static generateBigEyeBoy(bigRoad) {
    return this.generateDerivativeRoad(bigRoad, 1, 1);
  }

  // Generate Small Road (小路)
  static generateSmallRoad(bigRoad) {
    return this.generateDerivativeRoad(bigRoad, 2, 0);
  }

  // Generate Cockroach Road (曱甴路/蟑螂路)
  static generateCockroachRoad(bigRoad) {
    return this.generateDerivativeRoad(bigRoad, 3, 0);
  }

  // Helper for derivative roads
  static generateDerivativeRoad(bigRoad, skipColumns, skipRows) {
    const derivative = [];
    let dCol = 0;
    let dRow = 0;

    for (let col = skipColumns + 1; col < bigRoad.length; col++) {
      for (let row = 0; row < bigRoad[col].length; row++) {
        if (row === 0 && col === skipColumns + 1 && row < skipRows) continue;

        // Compare with reference column
        const refCol = col - skipColumns;
        const refRow = row - skipRows;

        let isRed; // Red = repeating pattern, Blue = not repeating

        if (bigRoad[refCol]) {
          if (row === 0) {
            // Check if previous column exists
            isRed = bigRoad[refCol - 1] !== undefined;
          } else {
            // Check if reference position exists
            isRed = bigRoad[refCol][refRow] !== undefined;
          }
        } else {
          isRed = false;
        }

        // Add to derivative road
        if (row === 0 || bigRoad[col][row].result !== bigRoad[col][row - 1].result) {
          if (row > 0) dCol++;
          dRow = 0;
        }

        if (!derivative[dCol]) derivative[dCol] = [];
        derivative[dCol][dRow] = isRed ? 'red' : 'blue';
        dRow++;
      }
    }

    return derivative;
  }

  // Analyze patterns and streaks
  static analyzePatterns(results) {
    let currentStreak = 0;
    let currentStreakType = null;
    let longestBankerStreak = 0;
    let longestPlayerStreak = 0;
    let chops = 0;
    let lastNonTie = null;

    const patterns = {
      currentStreak: 0,
      currentStreakType: null,
      longestBankerStreak: 0,
      longestPlayerStreak: 0,
      chops: 0,
      lastPattern: [],
      isChopping: false,
      isDragonTail: false
    };

    results.forEach((result, index) => {
      if (result === 'tie') return;

      if (result === currentStreakType) {
        currentStreak++;
      } else {
        // Streak ended
        if (currentStreakType === 'banker') {
          longestBankerStreak = Math.max(longestBankerStreak, currentStreak);
        } else if (currentStreakType === 'player') {
          longestPlayerStreak = Math.max(longestPlayerStreak, currentStreak);
        }

        // Check for chop
        if (lastNonTie && lastNonTie !== result && currentStreak === 1) {
          chops++;
        }

        currentStreak = 1;
        currentStreakType = result;
      }

      lastNonTie = result;
    });

    // Final streak check
    if (currentStreakType === 'banker') {
      longestBankerStreak = Math.max(longestBankerStreak, currentStreak);
    } else if (currentStreakType === 'player') {
      longestPlayerStreak = Math.max(longestPlayerStreak, currentStreak);
    }

    // Get last 10 results pattern
    const last10 = results.slice(-10).filter(r => r !== 'tie');
    patterns.lastPattern = last10;

    // Detect chopping (alternating)
    const last6 = last10.slice(-6);
    patterns.isChopping = last6.length >= 4 && 
      last6.every((r, i) => i === 0 || r !== last6[i - 1]);

    // Detect dragon tail (long streak)
    patterns.isDragonTail = currentStreak >= 6;

    patterns.currentStreak = currentStreak;
    patterns.currentStreakType = currentStreakType;
    patterns.longestBankerStreak = longestBankerStreak;
    patterns.longestPlayerStreak = longestPlayerStreak;
    patterns.chops = chops;

    return patterns;
  }

  // Suggest next bet based on patterns
  static suggestBet(results) {
    if (results.length < 5) {
      return { suggestion: 'banker', confidence: 'low', reason: 'Insufficient data - Banker has statistical edge' };
    }

    const patterns = this.analyzePatterns(results);
    const last10 = patterns.lastPattern;

    // Count recent results
    const recentBanker = last10.filter(r => r === 'banker').length;
    const recentPlayer = last10.filter(r => r === 'player').length;

    // Strategy: Follow the streak or bet on reversal
    if (patterns.currentStreak >= 4) {
      // Long streak - could continue or reverse
      if (patterns.currentStreak >= 7) {
        return {
          suggestion: patterns.currentStreakType === 'banker' ? 'player' : 'banker',
          confidence: 'medium',
          reason: `Dragon tail (${patterns.currentStreak} ${patterns.currentStreakType}s) - bet on reversal`
        };
      }
      return {
        suggestion: patterns.currentStreakType,
        confidence: 'medium',
        reason: `Strong ${patterns.currentStreakType} streak (${patterns.currentStreak}) - ride the wave`
      };
    }

    if (patterns.isChopping) {
      const next = patterns.lastPattern[patterns.lastPattern.length - 1] === 'banker' ? 'player' : 'banker';
      return {
        suggestion: next,
        confidence: 'medium',
        reason: 'Chopping pattern detected - bet opposite'
      };
    }

    // Banker has slight statistical advantage
    if (recentBanker > recentPlayer + 2) {
      return {
        suggestion: 'player',
        confidence: 'low',
        reason: 'Banker has dominated - expect mean reversion'
      };
    }

    if (recentPlayer > recentBanker + 2) {
      return {
        suggestion: 'banker',
        confidence: 'low',
        reason: 'Player has dominated - expect mean reversion'
      };
    }

    return {
      suggestion: 'banker',
      confidence: 'low',
      reason: 'No clear pattern - Banker has 1.06% house edge vs 1.24% on Player'
    };
  }
}
