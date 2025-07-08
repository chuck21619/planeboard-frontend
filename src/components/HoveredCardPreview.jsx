import React from "react";

export default function HoveredCardPreview({ hoveredCard }) {
  if (!hoveredCard) return null;

  const src =
    hoveredCard.flipIndex === 0
      ? hoveredCard.imageUrl
      : hoveredCard.flipIndex === 1
      ? hoveredCard.numFaces === 2
        ? "/defaultCardBack.jpg"
        : hoveredCard.imageUrlBack
      : "/defaultCardBack.jpg";

  return (
    <div className="hover-preview">
      <img src={src} alt={hoveredCard.name} />
    </div>
  );
}
