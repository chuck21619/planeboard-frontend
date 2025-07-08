import React from "react";

export default function DraggingCardImage({
  draggingCard,
  dragSource,
  hasMoved,
  pointerPos,
}) {
  if (!draggingCard || dragSource !== "deckSearch" || !hasMoved) return null;

  const src =
    draggingCard.flipIndex === 0
      ? draggingCard.imageUrl
      : draggingCard.flipIndex === 1
      ? draggingCard.numFaces === 2
        ? "/defaultCardBack.jpg"
        : draggingCard.imageUrlBack
      : "/defaultCardBack.jpg";

  return (
    <img
      src={src}
      alt={draggingCard.name}
      style={{
        position: "fixed",
        pointerEvents: "none",
        top: pointerPos.y - 45,
        left: pointerPos.x - 32,
        width: 64,
        borderRadius: 8,
        zIndex: 11000,
        opacity: 0.8,
        userSelect: "none",
      }}
    />
  );
}
