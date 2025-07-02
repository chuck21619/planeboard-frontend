export function removeCardFromDeck(decks, playerId, cardId) {
  const playerDeck = decks[playerId];
  if (!playerDeck) return decks;

  return {
    ...decks,
    [playerId]: {
      ...playerDeck,
      cards: playerDeck.cards.filter((card) => card.id !== cardId),
    },
  };
}

export function removeTopCardFromDeck(decks, playerId) {
  const playerDeck = decks[playerId];
  if (!playerDeck) return decks;

  return {
    ...decks,
    [playerId]: {
      ...playerDeck,
      cards: playerDeck.cards.slice(1),
    },
  };
}

export function addCardToDeck(decks, playerId, card) {
  const playerDeck = decks[playerId];
  if (!playerDeck) return decks;

  return {
    ...decks,
    [playerId]: {
      ...playerDeck,
      cards: [...playerDeck.cards, card],
    },
  };
}

export function removePlayerDeck(decks, playerId) {
  const { [playerId]: _, ...rest } = decks;
  return rest;
}
