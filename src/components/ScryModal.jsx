import { ReactSortable } from "react-sortablejs";
import { useState, useRef } from "react";
import { sendMessage } from "../ws";

export default function ScryModal({
  deck,
  count,
  onClose,
  setDecks,
  setHoveredDeckCardViewerCard,
}) {
  const topCards = deck.cards.slice(0, count);
  const restRef = useRef(deck.cards.slice(count)); // middle of the deck

  const [items, setItems] = useState([
    ...topCards.map((card) => ({
      id: card.id,
      type: "card",
      card,
    })),
    { id: "deck", type: "deck" },
  ]);

  const handleConfirm = () => {
    const deckIndex = items.findIndex((i) => i.type === "deck");

    const above = items
      .slice(0, deckIndex)
      .filter((i) => i.type === "card")
      .map((i) => i.card);

    const below = items
      .slice(deckIndex + 1)
      .filter((i) => i.type === "card")
      .map((i) => i.card);

    const newCards = [...above, ...restRef.current, ...below];

    setDecks((prev) => ({
      ...prev,
      [deck.id]: {
        ...prev[deck.id],
        cards: newCards,
      },
    }));

    deck.cards = newCards;
    sendMessage({
      type: "SCRY_RESOLVED",
      deck: deck,
    });

    onClose();
  };
  return (
    <div
      style={{
        position: "absolute",
        left: "0px",
        background: "rgba(0, 0, 0, 0.8)",
        padding: 20,
        height: "100vh",
        boxSizing: "border-box",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <ReactSortable
        list={items}
        setList={setItems}
        direction="vertical"
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        {items.map((item) =>
          item.type === "card" ? (
            <img
              key={item.id}
              src={item.card.imageUrl}
              alt={item.card.name}
              style={{
                width: 100,
                height: 140,
                border: "1px solid black",
                borderRadius: "8px",
              }}
              onMouseEnter={() =>
                setHoveredDeckCardViewerCard({ ...item.card, flipIndex: 0 })
              }
              onMouseLeave={() => setHoveredDeckCardViewerCard(null)}
            />
          ) : (
            <div
              key="deck"
              style={{
                width: 100,
                height: 140,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="/deck.png"
                style={{
                  width: 100,
                  height: 140,
                }}
              ></img>
            </div>
          )
        )}
      </ReactSortable>
      <br></br>
      <button onClick={handleConfirm}>Confirm</button>
    </div>
  );
}
