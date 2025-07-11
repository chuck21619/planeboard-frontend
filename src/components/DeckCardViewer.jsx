import { useState } from "react";

export default function DeckCardViewer({
  deckId,
  decks,
  onClose,
  setHoveredDeckCardViewerCard,
  getCardMouseDownHandler,
  draggingCard,
  peekCardsData = {cards: [], position: ""},
}) {
  const [query, setQuery] = useState("");
  const cards = decks[deckId]?.cards || [];
  const filteredCards =
    peekCardsData.cards.length > 0
      ? peekCardsData.cards
      : cards.filter((card) =>
          card.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div
      className="deck-card-viewer"
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
      <h3>
        {peekCardsData.cards.length == 0
          ? "Search Deck"
          : "Viewing " + peekCardsData.position}
      </h3>

      {peekCardsData.cards != [] && (
        <input
          autoFocus
          type="text"
          placeholder="Search cards..."
          value={query}
          disabled={!!draggingCard}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
        />
      )}

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
            onMouseDown={getCardMouseDownHandler(card, "deckCardViewer", 0)}
            onMouseEnter={() =>
              setHoveredDeckCardViewerCard({ ...card, flipIndex: 0 })
            }
            onMouseLeave={() => setHoveredDeckCardViewerCard(null)}
          />
        ))}
      </div>
    </div>
  );
}
