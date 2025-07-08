export function getNextFlipIndex(card) {
  const current = card.flipIndex ?? 0;
  return (current + 1) % card.numFaces;
}

export function updateCardTokens(cards, uid, tokens) {
  return cards.map((card) =>
    card.uid === uid ? { ...card, tokens } : card
  );
}