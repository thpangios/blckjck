// Basic Strategy Engine
export class BasicStrategy {
  constructor(rules) {
    this.rules = rules;
  }

  getOptimalPlay(playerHand, dealerUpCard, canDouble, canSplit, handCount) {
    const playerValue = this.calculateValue(playerHand);
    const dealerValue = this.getCardValue(dealerUpCard.value);
    const isSoft = this.isSoftHand(playerHand);
    const isPair = playerHand.length === 2 && playerHand[0].value === playerHand[1].value;

    // Pair splitting
    if (isPair && canSplit && handCount < 4) {
      const splitDecision = this.getSplitStrategy(playerHand[0].value, dealerValue);
      if (splitDecision === 'SPLIT') {
        return { action: 'SPLIT', reason: 'Basic strategy recommends splitting this pair' };
      }
    }

    // Soft hands (hands with Ace counted as 11)
    if (isSoft) {
      return this.getSoftHandStrategy(playerValue, dealerValue, canDouble);
    }

    // Hard hands
    return this.getHardHandStrategy(playerValue, dealerValue, canDouble);
  }

  getSplitStrategy(pairValue, dealerValue) {
    const splits = {
      'A': [2,3,4,5,6,7,8,9,10,11], // Always split Aces
      '8': [2,3,4,5,6,7,8,9,10,11], // Always split 8s
      '9': [2,3,4,5,6,8,9], // Split 9s except vs 7, 10, A
      '7': [2,3,4,5,6,7],
      '6': [2,3,4,5,6],
      '4': [5,6],
      '3': [2,3,4,5,6,7],
      '2': [2,3,4,5,6,7]
    };

    if (pairValue === '10' || pairValue === 'J' || pairValue === 'Q' || pairValue === 'K') {
      return 'STAND'; // Never split 10s
    }

    if (pairValue === '5') {
      return dealerValue <= 9 ? 'DOUBLE' : 'HIT'; // Never split 5s
    }

    return splits[pairValue]?.includes(dealerValue) ? 'SPLIT' : null;
  }

  getSoftHandStrategy(playerValue, dealerValue, canDouble) {
    // Soft 19-21
    if (playerValue >= 19) {
      return { action: 'STAND', reason: 'Always stand on soft 19 or better' };
    }

    // Soft 18
    if (playerValue === 18) {
      if (dealerValue >= 9) {
        return { action: 'HIT', reason: 'Hit soft 18 vs dealer 9, 10, or Ace' };
      }
      if (dealerValue >= 3 && dealerValue <= 6 && canDouble) {
        return { action: 'DOUBLE', reason: 'Double soft 18 vs dealer 3-6' };
      }
      return { action: 'STAND', reason: 'Stand on soft 18' };
    }

    // Soft 17
    if (playerValue === 17) {
      if (dealerValue >= 3 && dealerValue <= 6 && canDouble) {
        return { action: 'DOUBLE', reason: 'Double soft 17 vs dealer 3-6' };
      }
      return { action: 'HIT', reason: 'Hit soft 17' };
    }

    // Soft 13-16
    if (playerValue >= 13 && playerValue <= 16) {
      if (dealerValue >= 4 && dealerValue <= 6 && canDouble) {
        return { action: 'DOUBLE', reason: `Double soft ${playerValue} vs dealer 4-6` };
      }
      return { action: 'HIT', reason: `Hit soft ${playerValue}` };
    }

    return { action: 'HIT', reason: 'Hit to improve hand' };
  }

  getHardHandStrategy(playerValue, dealerValue, canDouble) {
    // 17 or higher
    if (playerValue >= 17) {
      return { action: 'STAND', reason: 'Always stand on hard 17 or higher' };
    }

    // 13-16
    if (playerValue >= 13 && playerValue <= 16) {
      if (dealerValue <= 6) {
        return { action: 'STAND', reason: `Stand on ${playerValue} vs dealer ${dealerValue}` };
      }
      return { action: 'HIT', reason: `Hit on ${playerValue} vs dealer ${dealerValue}` };
    }

    // 12
    if (playerValue === 12) {
      if (dealerValue >= 4 && dealerValue <= 6) {
        return { action: 'STAND', reason: 'Stand on 12 vs dealer 4-6' };
      }
      return { action: 'HIT', reason: 'Hit on 12' };
    }

    // 11
    if (playerValue === 11) {
      if (canDouble) {
        return { action: 'DOUBLE', reason: 'Always double on 11' };
      }
      return { action: 'HIT', reason: 'Hit on 11 (cannot double)' };
    }

    // 10
    if (playerValue === 10) {
      if (dealerValue <= 9 && canDouble) {
        return { action: 'DOUBLE', reason: 'Double 10 vs dealer 2-9' };
      }
      return { action: 'HIT', reason: 'Hit on 10' };
    }

    // 9
    if (playerValue === 9) {
      if (dealerValue >= 3 && dealerValue <= 6 && canDouble) {
        return { action: 'DOUBLE', reason: 'Double 9 vs dealer 3-6' };
      }
      return { action: 'HIT', reason: 'Hit on 9' };
    }

    // 8 or less
    return { action: 'HIT', reason: 'Always hit on 8 or less' };
  }

  calculateValue(hand) {
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

  isSoftHand(hand) {
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

  getCardValue(cardValue) {
    if (cardValue === 'A') return 11;
    if (['K', 'Q', 'J'].includes(cardValue)) return 10;
    return parseInt(cardValue);
  }
}
