// Professional Deck and Shoe Management with Card Counting
export class DeckManager {
  constructor(numDecks = 6, penetration = 0.75) {
    this.numDecks = numDecks;
    this.penetration = penetration;
    this.shoe = [];
    this.discards = [];
    this.cutCardPosition = Math.floor(numDecks * 52 * penetration);
    this.runningCount = 0;
    this.cardsDealt = 0;
    this.totalCards = numDecks * 52;
    this.initialize();
  }

  initialize() {
    this.shoe = this.createShoe();
    this.discards = [];
    this.runningCount = 0;
    this.cardsDealt = 0;
    this.burnCard();
  }

  createShoe() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const shoe = [];

    for (let deck = 0; deck < this.numDecks; deck++) {
      for (let suit of suits) {
        for (let value of values) {
          shoe.push({
            suit,
            value,
            id: `${value}${suit}-${deck}-${Math.random()}`
          });
        }
      }
    }

    return this.shuffle(shoe);
  }

  shuffle(array) {
    const newArray = [...array];
    // Fisher-Yates shuffle - perfectly unbiased
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  burnCard() {
    if (this.shoe.length > 0) {
      const card = this.shoe.shift();
      this.discards.push(card);
      this.updateCount(card);
      this.cardsDealt++;
    }
  }

  dealCard() {
    if (this.needsReshuffle()) {
      this.initialize();
    }
    
    const card = this.shoe.shift();
    this.discards.push(card);
    this.updateCount(card);
    this.cardsDealt++;
    return card;
  }

  updateCount(card) {
    // Hi-Lo counting system
    const value = card.value;
    if (['2', '3', '4', '5', '6'].includes(value)) {
      this.runningCount += 1;
    } else if (['10', 'J', 'Q', 'K', 'A'].includes(value)) {
      this.runningCount -= 1;
    }
    // 7, 8, 9 are neutral (0)
  }

  getTrueCount() {
    const decksRemaining = this.getDecksRemaining();
    if (decksRemaining <= 0) return 0;
    return Math.round((this.runningCount / decksRemaining) * 10) / 10;
  }

  getRunningCount() {
    return this.runningCount;
  }

  getDecksRemaining() {
    return this.shoe.length / 52;
  }

  needsReshuffle() {
    return this.shoe.length <= (this.totalCards * (1 - this.penetration));
  }

  getCardsRemaining() {
    return this.shoe.length;
  }

  getPenetration() {
    return ((this.cardsDealt / this.totalCards) * 100).toFixed(1);
  }

  getPenetrationDecimal() {
    return this.cardsDealt / this.totalCards;
  }

  // Calculate player advantage based on true count
  getPlayerAdvantage() {
    const tc = this.getTrueCount();
    // Each +1 in true count = approximately +0.5% player advantage
    const baseHouseEdge = -0.5; // Assume -0.5% house edge with basic strategy
    const advantage = baseHouseEdge + (tc * 0.5);
    return Math.round(advantage * 100) / 100;
  }

  // Get optimal bet multiplier based on Kelly Criterion
  getOptimalBetMultiplier(bankroll, baseBet) {
    const advantage = this.getPlayerAdvantage();
    if (advantage <= 0) return 1; // Min bet when no advantage

    // Simplified Kelly: (advantage / variance)
    // For blackjack, variance ≈ 1.3
    const kellyFraction = advantage / 1.3;
    
    // Use fractional Kelly (more conservative)
    const fractionalKelly = kellyFraction * 0.5; // Half Kelly for safety
    
    // Convert to bet multiplier (1-12 spread typical)
    const betMultiplier = Math.max(1, Math.min(12, Math.ceil(fractionalKelly * 100)));
    
    return betMultiplier;
  }

  // Get recommended bet based on true count
  getRecommendedBet(baseBet) {
    const tc = this.getTrueCount();
    const penetration = this.getPenetrationDecimal();

    // Don't increase bets until sufficient penetration
    if (penetration < 0.25) return baseBet;

    // Conservative betting spread based on true count
    if (tc <= 0) return baseBet; // Min bet
    if (tc >= 1 && tc < 2) return baseBet * 2;
    if (tc >= 2 && tc < 3) return baseBet * 4;
    if (tc >= 3 && tc < 4) return baseBet * 6;
    if (tc >= 4 && tc < 5) return baseBet * 8;
    if (tc >= 5) return baseBet * 12; // Max bet

    return baseBet;
  }

  // Calculate "heat" level (casino suspicion)
  getHeatLevel(betHistory) {
    if (!betHistory || betHistory.length < 10) return 0;

    // Calculate bet spread
    const recentBets = betHistory.slice(-20);
    const maxBet = Math.max(...recentBets);
    const minBet = Math.min(...recentBets);
    const spread = maxBet / minBet;

    // Calculate bet variance
    const betChanges = [];
    for (let i = 1; i < recentBets.length; i++) {
      const change = Math.abs(recentBets[i] - recentBets[i-1]) / recentBets[i-1];
      betChanges.push(change);
    }
    const avgBetChange = betChanges.reduce((a, b) => a + b, 0) / betChanges.length;

    // Heat level calculation
    let heat = 0;
    
    // Spread over 1-8 is noticeable
    if (spread > 8) heat += 3;
    else if (spread > 6) heat += 2;
    else if (spread > 4) heat += 1;

    // Frequent large bet changes
    if (avgBetChange > 0.5) heat += 2;
    else if (avgBetChange > 0.3) heat += 1;

    // High win rate with high spread
    return Math.min(10, heat);
  }

  // Get count composition (for advanced players)
  getCountComposition() {
    const lowCards = this.discards.filter(c => ['2', '3', '4', '5', '6'].includes(c.value)).length;
    const neutralCards = this.discards.filter(c => ['7', '8', '9'].includes(c.value)).length;
    const highCards = this.discards.filter(c => ['10', 'J', 'Q', 'K', 'A'].includes(c.value)).length;

    return {
      low: lowCards,
      neutral: neutralCards,
      high: highCards,
      total: this.cardsDealt
    };
  }

  // Calculate expected cards remaining by type
  getExpectedRemaining() {
    const composition = this.getCountComposition();
    const cardsPerValue = this.numDecks * 4;

    return {
      low: (cardsPerValue * 5) - composition.low, // 2-6 = 5 values
      neutral: (cardsPerValue * 3) - composition.neutral, // 7-9 = 3 values
      high: (cardsPerValue * 5) - composition.high, // 10-A = 5 values (16 tens per deck)
      aces: this.numDecks * 4 - this.discards.filter(c => c.value === 'A').length
    };
  }
}
