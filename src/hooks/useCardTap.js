import { sendMessage } from "../ws";

export function useCardTap(setCards, hasMoved) {
  const tapCard = (id) => {
    if (hasMoved) return;
    let tapped;

    setCards((prevCards) => {
      const updatedCards = prevCards.map((card) => {
        if (card.id === id) {
          tapped = !card.tapped;
          return { ...card, tapped };
        }
        return card;
      });

      sendMessage({
        type: "TAP_CARD",
        id,
        tapped,
      });

      return updatedCards;
    });
  };

  return { tapCard };
}
