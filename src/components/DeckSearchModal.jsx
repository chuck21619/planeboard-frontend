import { useState } from "react";

export default function DeckSearchModal({ cards, onClose }) {
  const [query, setQuery] = useState("");
  const filteredCards = cards.filter((card) =>
    card.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      style={{
        position: "fixed",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "400px",
        maxHeight: "60vh",
        overflowY: "auto",
        backgroundColor: "white",
        border: "1px solid #ccc",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
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
            style={{ width: 70, height: 94, objectFit: "contain" }}
          />
        ))}
      </div>
    </div>
  );
}
