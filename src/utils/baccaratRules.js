// Baccarat Rules and Logic
export class BaccaratRules {
  static calculateHandValue(cards) {
    let total = 0;
    for (let card of cards) {
      if (card.value === 'A') {
        total += 1;
      } else if (['K', 'Q', 'J', '10'].includes(card.value)) {
        total += 0;
      } else {
        total += parseInt(card.value);
      }
    }
    return total % 10; // Baccarat uses modulo 10
  }

  static needsThirdCard(playerTotal, bankerTotal, playerCards, bankerCards) {
    // Player draws third card if total is 0-5, stands on 6-7
    const playerNeedsCard = playerTotal <= 5;
    
    return {
      player: playerNeedsCard,
      banker: this.bankerDraws(bankerTotal, playerCards.length === 3 ? playerCards[2] : null)
    };
  }

  static bankerDraws(bankerTotal, playerThirdCard) {
    // Banker drawing rules based on banker total and player's third card
    if (bankerTotal <= 2) return true;
    if (bankerTotal >= 7) return false;

    if (playerThirdCard === null) {
      // Player stood (has only 2 cards), banker draws on 0-5
      return bankerTotal <= 5;
    }

    // Player drew a third card
    const thirdCardValue = this.getCardValue(playerThirdCard);

    switch (bankerTotal) {
      case 3:
        return thirdCardValue !== 8;
      case 4:
        return [2, 3, 4, 5, 6, 7].includes(thirdCardValue);
      case 5:
        return [4, 5, 6, 7].includes(thirdCardValue);
      case 6:
        return [6, 7].includes(thirdCardValue);
      default:
        return false;
    }
  }

  static getCardValue(card) {
    if (card.value === 'A') return 1;
    if (['K', 'Q', 'J', '10'].includes(card.value)) return 0;
    return parseInt(card.value);
  }

  static determineWinner(playerTotal, bankerTotal) {
    if (playerTotal > bankerTotal) return 'player';
    if (bankerTotal > playerTotal) return 'banker';
    return 'tie';
  }

  static isPair(cards) {
    if (cards.length !== 2) return false;
    return this.getCardValue(cards[0]) === this.getCardValue(cards[1]);
  }

  static isNatural(total) {
    return total === 8 || total === 9;
  }
}
