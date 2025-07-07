import { useState, useEffect, useRef } from "react";

// Helper to test if a point is inside a rotated rectangle
function pointInRotatedRect(px, py, rect) {
  const { x, y, width, height, rotation } = rect;

  // Center of the rectangle
  const cx = x + width / 2;
  const cy = y + height / 2;

  // Convert point to rectangle's rotated space
  const angle = (-rotation * Math.PI) / 180;
  const dx = px - cx;
  const dy = py - cy;

  const rx = dx * Math.cos(angle) - dy * Math.sin(angle);
  const ry = dx * Math.sin(angle) + dy * Math.cos(angle);

  return Math.abs(rx) <= width / 2 && Math.abs(ry) <= height / 2;
}

export function useHoveredCard(
  mousePos,
  cards,
  draggingCard,
  hoveredHandCard,
  isRotated
) {
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
      var x = mousePos.x;
      var y = mousePos.y;
      if (isRotated) {
        x = -x;
        y = -y;
      }
      newHovered =
        cards.find((card) =>
          pointInRotatedRect(x, y, {
            x: card.x,
            y: card.y,
            width: 64,
            height: 89,
            rotation: card.tapped ? 90 : 0,
          })
        ) || null;
    }

    if (newHovered?.id === lastCardId.current) return;
    lastCardId.current = newHovered?.id || null;
    setHoveredCard(newHovered);
  }, [mousePos, cards, draggingCard, hoveredHandCard, isRotated]);

  return { hoveredCard, setHoveredCard, ignoreNextChange };
}
