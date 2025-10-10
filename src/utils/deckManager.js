// Deck and Shoe Management
export class DeckManager {
  constructor(numDecks = 6, penetration = 0.75) {
    this.numDecks = numDecks;
    this.penetration = penetration;
    this.shoe = [];
    this.discards = [];
    this.cutCardPosition = Math.floor(numDecks * 52 * penetration);
    this.runningCount = 0;
    this.initialize();
  }

  initialize() {
    this.shoe = this.createShoe();
    this.discards = [];
    this.runningCount = 0;
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
    }
  }

  dealCard() {
    if (this.needsReshuffle()) {
      this.initialize();
    }
    
    const card = this.shoe.shift();
    this.discards.push(card);
    this.updateCount(card);
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
  }

  getTrueCount() {
    const decksRemaining = this.shoe.length / 52;
    return decksRemaining > 0 ? Math.round((this.runningCount / decksRemaining) * 10) / 10 : 0;
  }

  needsReshuffle() {
    return this.shoe.length <= (this.numDecks * 52 * (1 - this.penetration));
  }

  getCardsRemaining() {
    return this.shoe.length;
  }

  getPenetration() {
    const totalCards = this.numDecks * 52;
    const cardsDealt = totalCards - this.shoe.length;
    return ((cardsDealt / totalCards) * 100).toFixed(1);
  }
}
