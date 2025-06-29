import { useState, useEffect } from "react";
import { useSharedImage } from "../hooks/useSharedImage";

export default function Hand({
  hand,
  draggingCard,
  setDraggingCard,
  setDragPos,
  setHoveredCard,
}) {
  const cardWidth = 64;
  const maxWidth = window.innerWidth - 40;
  const totalCardWidth = hand.length * cardWidth;
  const overlap = totalCardWidth > maxWidth;

  const overlapAmount = overlap
    ? (totalCardWidth - maxWidth) / (hand.length - 1)
    : 0;
  function handleMouseEnter(card) {
    setHoveredCard(card);
  }
  function handleMouseLeave(card) {
    if (!draggingCard || draggingCard.id !== card.id) {
      setHoveredCard(null);
    }
  }
  return (
    <div className="hand-container">
      {hand.map((card, i) => (
        <div
          key={card.id}
          className="card-wrapper"
          style={{
            marginLeft: i === 0 ? 0 : -overlapAmount,
            zIndex: i,
          }}
          onMouseDown={(e) => {
            const rect = e.target.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            setDraggingCard(card);
            setDragPos({ x, y });
          }}
          onMouseEnter={() => handleMouseEnter(card)}
          onMouseLeave={() => handleMouseLeave(card)}
        >
          <CardWithPreload card={card} cardWidth={cardWidth} />
        </div>
      ))}
    </div>
  );
}

function CardWithPreload({ card, cardWidth }) {
  const [loaded, setLoaded] = useState(false);
  const [wasCached, setWasCached] = useState(false);
  const image = useSharedImage(card.imageUrl);

  useEffect(() => {
    const img = new Image();
    img.src = card.imageUrl;

    if (img.complete) {
      setWasCached(true);
      setLoaded(true);
    } else {
      img.onload = () => setLoaded(true);
    }
  }, [card.imageUrl]);

  return (
    <div className="card-in-hand">
      {!image && <div className="card-placeholder">{card.name}</div>}
      {image && (
        <img
          src={card.imageUrl}
          alt={card.name}
          className={`card-img ${loaded ? "visible" : "hidden"} ${
            wasCached ? "no-fade" : ""
          }`}
          style={{ width: cardWidth, height: 89 }}
        />
      )}
    </div>
  );
}
