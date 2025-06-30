import { useState, useEffect } from "react";

export function useHoveredCard(mousePos, cards, draggingCard, hoveredHandCard) {
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    if (draggingCard) {
      setHoveredCard(draggingCard);
      return;
    }
    if (hoveredHandCard) {
      setHoveredCard(hoveredHandCard);
      return;
    }

    const hovered = cards.find((card) => {
      return (
        mousePos.x >= card.x &&
        mousePos.x <= card.x + 64 &&
        mousePos.y >= card.y &&
        mousePos.y <= card.y + 89
      );
    });

    setHoveredCard(hovered || null);
  }, [mousePos, cards, draggingCard, hoveredHandCard]);

  return { hoveredCard, setHoveredCard };
}
