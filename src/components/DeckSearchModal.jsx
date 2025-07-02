import { useState } from "react";

export default function DeckSearchModal({
  cards,
  onClose,
  setHoveredCard,
  setDraggingCard,
  setDragSource,
  setPointerPos,
}) {
  const [query, setQuery] = useState("");
  const filteredCards = cards.filter((card) =>
    card.name.toLowerCase().includes(query.toLowerCase())
  );
  const handleMouseDown = (e, card) => {
    e.preventDefault();
    const { clientX, clientY } = e;
    // const rect = e.target.getBoundingClientRect();
    // const x = rect.left + rect.width / 2;
    // const y = rect.top + rect.height / 2;

    setDragSource("modal");
    setDraggingCard(card);
    setPointerPos({ x: clientX, y: clientY });
    // setDragPos({ x, y });
  };
  return (
    <div
      className="deck-search-modal"
      style={{
        position: "fixed",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "90vh",
        maxHeight: "80vh",
        overflowY: "auto",
        overflowX: "hidden",
        backgroundColor: "black",
        border: "1px solid #ccc",
        padding: "12px",
        zIndex: 10000,
      }}
    >
      <button onClick={onClose} style={{ float: "right" }}>
        ✖
      </button>
      <h3>Search Deck</h3>

      <input
        autoFocus
        type="text"
        placeholder="Search cards..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "center",
        }}
      >
        {filteredCards.length === 0 && <p>No cards found</p>}
        {filteredCards.map((card) => (
          <img
            key={card.id}
            src={card.imageUrl}
            alt={card.name}
            style={{
              borderRadius: "8px",
              width: 70,
              height: 94,
              objectFit: "contain",
            }}
            onMouseDown={(e) => handleMouseDown(e, card)}
            onMouseEnter={() => setHoveredCard(card)}
            onMouseLeave={() => setHoveredCard(null)}
          />
        ))}
      </div>
    </div>
  );
}
