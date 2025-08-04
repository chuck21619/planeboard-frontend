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
  selectedCards,
  setSelectedCards,
}) {
  if (!visible || !card) return null;

  const handleMove = (placement) => {
    const cardsToMove = selectedCards.length !== 0 ? selectedCards : [card];
    const moveCard = () => {
      if (dragSource === "board") {
        if (selectedCards.length == 0) {
          setCards((prev) => prev.filter((c) => c.id !== card.id));
        } else {
          setCards((prev) =>
            prev.filter((c) => !selectedCards.some((sc) => sc.id === c.id))
          );
        }
      }
      setHand((prev) =>
        prev.filter((c) => !cardsToMove.some((mc) => mc.id === c.id))
      );
    };

    const sendCardMessage = (type) => {
      if (selectedCards.length !== 0) {
        sendMessage({
          type,
          username: deckId,
          source: dragSource,
          cards: selectedCards,
        });
      } else {
        sendMessage({
          type,
          username: deckId,
          source: dragSource,
          card: card,
        });
      }
    };

    if (placement === "top") {
      if (selectedCards.length == 0) {
        setDecks((prev) => {
          const copy = { ...prev };
          const target = [...(copy[deckId]?.cards || [])];
          copy[deckId].cards = [card, ...target];
          return copy;
        });
        moveCard();
        sendCardMessage("CARD_TO_TOP_OF_DECK");
      } else {
        setDecks((prev) => {
          const copy = { ...prev };
          const target = [...(copy[deckId]?.cards || [])];
          copy[deckId].cards = [...cardsToMove, ...target];
          return copy;
        });
        moveCard();
        sendCardMessage("CARDS_TO_TOP_OF_DECK");
      }
    } else if (placement === "bottom") {
      if (selectedCards.length == 0) {
        setDecks((prev) => {
          const copy = { ...prev };
          const target = [...(copy[deckId]?.cards || [])];
          copy[deckId].cards = [...target, card];
          return copy;
        });
        moveCard();
        sendCardMessage("CARD_TO_BOTTOM_OF_DECK");
      } else {
        setDecks((prev) => {
          const copy = { ...prev };
          const target = [...(copy[deckId]?.cards || [])];
          copy[deckId].cards = [...target, ...cardsToMove];
          return copy;
        });
        moveCard();
        sendCardMessage("CARDS_TO_BOTTOM_OF_DECK");
      }
    } else if (placement === "shuffle") {
      if (selectedCards.length == 0) {
        moveCard();
        sendCardMessage("CARD_TO_SHUFFLE_IN_DECK");
      } else {
        setDecks((prev) => {
          const copy = { ...prev };
          const shuffled = [
            ...(copy[deckId]?.cards || []),
            ...cardsToMove,
          ].sort(() => Math.random() - 0.5);
          copy[deckId].cards = shuffled;
          return copy;
        });
        moveCard();
        sendCardMessage("CARDS_TO_SHUFFLE_IN_DECK");
      }
    }

    setSelectedCards([]);
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
