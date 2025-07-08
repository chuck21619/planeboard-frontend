import { updateCardTokens } from "./cardUtils";

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

export function updateDeckTokens(decks, uid, tokens) {
  const updatedDecks = { ...decks };

  for (const [deckId, deck] of Object.entries(updatedDecks)) {
    updatedDecks[deckId] = {
      ...deck,
      cards: updateCardTokens(deck.cards || [], uid, tokens),
      commanders: updateCardTokens(deck.commanders || [], uid, tokens),
    };
  }

  return updatedDecks;
}
