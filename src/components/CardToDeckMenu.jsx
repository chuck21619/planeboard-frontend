import React from "react";
import { sendMessage } from "../ws";

export default function CardToDeckMenu({
  visible,
  card,
  deckId,
  position,
  dragSource,
  setHand,
  setCards,
  setDecks,
  onClose,
}) {
  if (!visible || !card) return null;

  const handleMove = (placement) => {
    const moveCard = () => {
      if (dragSource === "board") {
        setCards((prev) => prev.filter((c) => c.id !== card.id));
      }
      setHand((prev) => prev.filter((c) => c.id !== card.id));
    };

    const sendCardMessage = (type) => {
      sendMessage({
        type,
        username: deckId,
        source: dragSource,
        card: {
          id: card.id,
          name: card.name,
          imageUrl: card.imageUrl,
          imageUrlBack: card.imageUrlBack,
          uid: card.uid,
          hasTokens: card.hasTokens,
          numFaces: card.numFaces,
          x: 0,
          y: 0,
          tapped: false,
          flipIndex: 0,
        },
      });
    };

    if (placement === "top") {
      setDecks((prev) => {
        const copy = { ...prev };
        const target = [...(copy[deckId]?.cards || [])];
        copy[deckId].cards = [card, ...target];
        return copy;
      });
      moveCard();
      sendCardMessage("CARD_TO_TOP_OF_DECK");
    } else if (placement === "bottom") {
      setDecks((prev) => {
        const copy = { ...prev };
        const target = [...(copy[deckId]?.cards || [])];
        copy[deckId].cards = [...target, card];
        return copy;
      });
      moveCard();
      sendCardMessage("CARD_TO_BOTTOM_OF_DECK");
    } else if (placement === "shuffle") {
      moveCard();
      sendCardMessage("CARD_TO_SHUFFLE_IN_DECK");
    }

    onClose();
  };

  return (
    <div
      style={{
        position: "absolute",
        top: position.y - 1,
        left: position.x - 2,
        backgroundColor: "black",
        border: "1px solid #ccc",
        padding: "6px",
        zIndex: 9999,
        minWidth: "160px",
      }}
      onMouseLeave={onClose}
    >
      <div
        style={{ cursor: "pointer", padding: "4px 8px" }}
        onClick={() => handleMove("top")}
      >
        ⬆️ Top of Deck
      </div>
      <div
        style={{ cursor: "pointer", padding: "4px 8px" }}
        onClick={() => handleMove("shuffle")}
      >
        🔀 Shuffle Into Deck
      </div>
      <div
        style={{ cursor: "pointer", padding: "4px 8px" }}
        onClick={() => handleMove("bottom")}
      >
        ⬇️ Bottom of Deck
      </div>
    </div>
  );
}
