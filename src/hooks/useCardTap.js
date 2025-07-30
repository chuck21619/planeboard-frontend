import { sendMessage } from "../ws";

export function useCardTap(setCards, hasMoved, selectedCards) {
  const tapCard = (id) => {
    if (hasMoved) return;

    const selectedIds = selectedCards.map((card) => card.id);
    const tappingMultiple = selectedIds.includes(id);
    let newTapped = null;

    setCards((prevCards) => {
      const updatedCards = prevCards.map((card) => {
        const shouldTap =
          (tappingMultiple && selectedIds.includes(card.id)) ||
          (!tappingMultiple && card.id === id);

        if (shouldTap) {
          if (newTapped === null) newTapped = !card.tapped;
          return { ...card, tapped: newTapped };
        }

        return card;
      });

      if (tappingMultiple) {
        sendMessage({
          type: "TAP_CARDS",
          cards: selectedCards,
          tapped: newTapped,
        });
      } else {
        sendMessage({
          type: "TAP_CARD",
          id,
          tapped: newTapped,
        });
      }

      return updatedCards;
    });
  };

  return tapCard;
}

