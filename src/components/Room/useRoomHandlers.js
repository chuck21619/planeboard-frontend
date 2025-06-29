import { useEffect } from "react";
import { connectToRoom, setOnMessageHandler, disconnect } from "../../ws";

export function useRoomHandlers({
  roomId,
  setCards,
  setDecks,
  setHand,
  setHandSizes,
  setPositions,
  setHasJoined,
  setStagePosition,
  username,
  navigate,
}) {
  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnect();
    };
    const handlePopState = () => {
      disconnect();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    setStagePosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    connectToRoom();

    setOnMessageHandler((message) => {
      if (message.type === "BOARD_STATE") {
        setCards(message.cards);
        setDecks(message.decks);
        setPositions(message.positions);
        setHandSizes(message.handSizes);
      } else if (message.type === "MOVE_CARD") {
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === message.id
              ? { ...card, x: message.x, y: message.y }
              : card
          )
        );
      } else if (message.type === "USER_JOINED") {
        setDecks(Object.values(message.decks));
        setPositions(message.positions);
        if (message.users.includes(username)) {
          setHasJoined(true);
        }
      } else if (message.type === "CARD_DRAWN") {
        setHand((prev) => [...prev, message.card]);
      } else if (message.type === "PLAYER_DREW_CARD") {
        setHandSizes((prev) => ({
          ...prev,
          [message.player]: message.handSize,
        }));
      } else if (message.type === "CARD_PLAYED") {
        setCards((prev) => [...prev, message.card]);
        setHandSizes((prev) => ({
          ...prev,
          [message.player]: message.handSize,
        }));
      } else if (message.type === "CARD_RETURNED") {
        setCards((prevCards) =>
          prevCards.filter((card) => card.id !== message.id)
        );
        setHandSizes((prev) => ({
          ...prev,
          [message.player]: message.handSize,
        }));
      } else if (message.type === "USER_LEFT") {
        setPositions(message.positions);
        setDecks((prevDecks) =>
          prevDecks.filter((deck) => deck.id !== message.user)
        );
        setHandSizes((prevSizes) => {
          const updated = { ...prevSizes };
          delete updated[message.user];
          return updated;
        });
      } else if (message.type === "ERROR") {
        alert(message.reason);
        disconnect();
        navigate("/");
      }
    });
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      disconnect();
    };
  }, [roomId]);
}
