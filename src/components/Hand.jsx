import { useState, useEffect } from "react";

export default function Hand({ hand }) {
  return (
    <div className="hand-container">
      {hand.map((card, index) => (
        <CardWithPreload key={index} card={card} />
      ))}
    </div>
  );
}

function CardWithPreload({ card }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = card.imageUrl;
    img.onload = () => setLoaded(true);
  }, [card.imageUrl]);

  return (
    <div className="card-in-hand card-wrapper">
      {!loaded && (
        <div className={`card-placeholder ${loaded ? "hidden" : ""}`}>
          {card.name}
        </div>
      )}
      <img
        src={card.imageUrl}
        alt={card.name}
        className={`card-img ${loaded ? "visible" : "hidden"}`}
      />
    </div>
  );
}
