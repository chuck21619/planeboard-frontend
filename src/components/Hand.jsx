import { useState, useEffect } from "react";

export default function Hand({ hand }) {
  const cardWidth = 64;
  const maxWidth = window.innerWidth - 40;
  const totalCardWidth = hand.length * cardWidth;
  const overlap = totalCardWidth > maxWidth;

  const overlapAmount = overlap
    ? (totalCardWidth - maxWidth) / (hand.length - 1)
    : 0;

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
        >
          <CardWithPreload card={card} cardWidth={cardWidth} />
        </div>
      ))}
    </div>
  );
}

function CardWithPreload({ card, cardWidth }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = card.imageUrl;
    img.onload = () => setLoaded(true);
  }, [card.imageUrl]);

  return (
    <div className="card-in-hand">
      {!loaded && (
        <div className={`card-placeholder ${loaded ? "hidden" : ""}`}>
          {card.name}
        </div>
      )}
      <img
        src={card.imageUrl}
        alt={card.name}
        className={`card-img ${loaded ? "visible" : "hidden"}`}
        style={{ width: cardWidth, height: 89 }}
      />
    </div>
  );
}
