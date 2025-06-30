import { useState, useEffect, useRef } from "react";

export function useHoveredCard(mousePos, cards, draggingCard, hoveredHandCard) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const ignoreNextChange = useRef(false);
  const lastCardId = useRef(null);

  useEffect(() => {
    if (ignoreNextChange.current) {
      ignoreNextChange.current = false;
      return;
    }

    let newHovered = null;

    if (draggingCard) {
      newHovered = draggingCard;
    } else if (hoveredHandCard) {
      newHovered = hoveredHandCard;
    } else {
      newHovered = cards.find((card) => {
        return (
          mousePos.x >= card.x &&
          mousePos.x <= card.x + 64 &&
          mousePos.y >= card.y &&
          mousePos.y <= card.y + 89
        );
      }) || null;
    }

    if (newHovered?.id === lastCardId.current) return;

    lastCardId.current = newHovered?.id || null;
    setHoveredCard(newHovered);
  }, [mousePos, cards, draggingCard, hoveredHandCard]);

  return { hoveredCard, setHoveredCard, ignoreNextChange };
}
