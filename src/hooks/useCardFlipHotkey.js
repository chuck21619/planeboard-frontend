import { useEffect } from "react";
import { getNextFlipIndex } from "../utils/cardUtils";
import { sendMessage } from "../ws";

export function useCardFlipHotkey({
  hoveredCard,
  draggingCard,
  setDraggingCard,
  setHoveredCard,
  setCards,
  spectator,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (spectator) return;
      if (event.key !== "f" && event.key !== "F") return;
      if (!hoveredCard) return;

      if (draggingCard) {
        const newFlipIndex = getNextFlipIndex(draggingCard);
        setDraggingCard((prev) => ({ ...prev, flipIndex: newFlipIndex }));
        setHoveredCard((prev) => ({ ...prev, flipIndex: newFlipIndex }));
        return;
      }

      const cardId = hoveredCard.id;
      setCards((prevCards) => {
        const targetCard = prevCards.find((card) => card.id === cardId);
        if (!targetCard) return prevCards;

        const newFlipIndex = getNextFlipIndex(targetCard);
        const updated = prevCards.map((card) =>
          card.id === cardId ? { ...card, flipIndex: newFlipIndex } : card
        );

        sendMessage({
          type: "FLIP_CARD",
          id: cardId,
          flipIndex: newFlipIndex,
        });

        setHoveredCard((prev) => ({ ...prev, flipIndex: newFlipIndex }));
        return updated;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hoveredCard, draggingCard, setDraggingCard, setHoveredCard, setCards]);
}
