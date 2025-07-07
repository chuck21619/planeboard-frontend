export function getNextFlipIndex(card) {
  const current = card.flipIndex ?? 0;
  return (current + 1) % card.numFaces;
}