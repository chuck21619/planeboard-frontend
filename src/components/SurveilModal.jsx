import { ReactSortable } from "react-sortablejs";
import { useState, useRef } from "react";
import { sendMessage } from "../ws";

export default function SurveilModal({
  deck,
  count,
  onClose,
  setDecks,
  setHoveredSearchCard,
  setCards,
  isRotated,
}) {
  const surveilCards = deck.cards.slice(0, count);
  const restRef = useRef(deck.cards.slice(count)); // untouched rest of deck
  console.log("Deck cards:", deck.cards);
  console.log("Count:", count);
  const [topItems, setTopItems] = useState(
    surveilCards.map((card) => ({
      id: card.id,
      type: "card",
      card,
    }))
  );

  const [graveyardItems, setGraveyardItems] = useState([]);

  const handleConfirm = () => {
    const kept = topItems.map((i) => i.card);
    const toGraveyard = graveyardItems.map((i) => i.card);

    const newDeck = [...kept, ...restRef.current];

    setDecks((prev) => ({
      ...prev,
      [deck.id]: {
        ...prev[deck.id],
        cards: newDeck,
      },
    }));

    deck.cards = newDeck;
    const placedGraveyard = toGraveyard.map((card, index) => ({
      ...card,
      x: deck.x,
      y: deck.y + (isRotated ? (-100-(index*10)) : (100+index*10)),
      flipIndex: 0,
      owner: deck.id,
      tapped: false,
    }));

    setCards((prev) => [...prev, ...placedGraveyard]);
    sendMessage({
      type: "SURVEIL_RESOLVED",
      deck: deck,
      cards: placedGraveyard,
    });

    onClose();
  };

  const renderCard = (item) => (
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
      onMouseEnter={() => setHoveredSearchCard({ ...item.card, flipIndex: 0 })}
      onMouseLeave={() => setHoveredSearchCard(null)}
    />
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        background: "rgba(0, 0, 0, 0.8)",
        padding: 20,
        height: "100vh",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", gap: "40px" }}>
        <div>
          <h3 style={{ color: "white" }}>Keep on Top</h3>
          <ReactSortable
            group="surveil"
            list={topItems}
            setList={setTopItems}
            direction="vertical"
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {topItems.map(renderCard)}
          </ReactSortable>
        </div>

        <div>
          <h3 style={{ color: "white" }}>Send to Graveyard</h3>
          <ReactSortable
            group="surveil"
            list={graveyardItems}
            setList={setGraveyardItems}
            direction="vertical"
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {graveyardItems.map(renderCard)}
          </ReactSortable>
        </div>
      </div>

      <br />
      <button onClick={handleConfirm}>Confirm</button>
    </div>
  );
}
