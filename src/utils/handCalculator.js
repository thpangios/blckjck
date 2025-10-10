// Hand Value Calculations
export class HandCalculator {
  static calculateValue(hand) {
    let value = 0;
    let aces = 0;

    for (let card of hand) {
      if (card.value === 'A') {
        aces += 1;
        value += 11;
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }

    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }

    return value;
  }

  static isBlackjack(hand) {
    return hand.length === 2 && this.calculateValue(hand) === 21;
  }

  static isSoft(hand) {
    let hasAce = hand.some(card => card.value === 'A');
    if (!hasAce) return false;

    let value = 0;
    let aces = 0;

    for (let card of hand) {
      if (card.value === 'A') {
        aces += 1;
        value += 11;
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }

    return value <= 21 && aces > 0;
  }

  static canSplit(hand) {
    return hand.length === 2 && hand[0].value === hand[1].value;
  }

  static isPair(hand) {
    return this.canSplit(hand);
  }

  static isBust(hand) {
    return this.calculateValue(hand) > 21;
  }
}
