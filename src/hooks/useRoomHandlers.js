import { useEffect } from "react";
import { connectToRoom, setOnMessageHandler, disconnect } from "../ws";
import {
  removeCardFromDeck,
  removeTopCardFromDeck,
  removePlayerDeck,
} from "../utils/deckUtils";
import { loadTokenData } from "../utils/loadTokenData";

export function useRoomHandlers({
  roomId,
  cards,
  setCards,
  setDecks,
  setHandSizes,
  setPositions,
  setHasJoined,
  setStagePosition,
  username,
  navigate,
  setLifeTotals,
  setTurn,
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
        setTurn(message.turn);
      } else if (message.type === "MOVE_CARD") {
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === message.id
              ? { ...card, x: message.x, y: message.y }
              : card
          )
        );
      } else if (message.type === "USER_JOINED") {
        setDecks(message.decks);
        setPositions(message.positions);
        setCards((prevCards) => [...prevCards, ...message.commanders]);
        if (message.users.includes(username)) {
          setHasJoined(true);
        }
        setLifeTotals(message.lifeTotals);
      } else if (message.type === "PLAYER_DREW_CARD") {
        setHandSizes((prev) => ({
          ...prev,
          [message.player]: message.handSize,
        }));
        setDecks((prevDecks) =>
          removeTopCardFromDeck(prevDecks, message.player)
        );
      } else if (message.type === "CARD_PLAYED_FROM_HAND") {
        const card = message.card;
        setCards((prev) => [...prev, message.card]);
        loadTokenData(card).then((cardWithTokens) => {
          if (!cardWithTokens.tokens) return;
          setCards((prev) =>
            prev.map((c) =>
              c.id === cardWithTokens.id
                ? { ...c, tokens: cardWithTokens.tokens }
                : c
            )
          );
        });
        setHandSizes((prev) => ({
          ...prev,
          [message.player]: message.handSize,
        }));
      } else if (message.type === "LIFE_TOTAL_UPDATED") {
        const { username, lifeTotal } = message;
        setLifeTotals((prev) => ({
          ...prev,
          [username]: lifeTotal,
        }));
      } else if (message.type === "SPAWN_TOKEN") {
        setCards((prev) => [...prev, message.token]);
      } else if (message.type === "CARD_PLAYED_FROM_LIBRARY") {
        const card = message.card;
        setCards((prev) => [...prev, message.card]);
        loadTokenData(card).then((cardWithTokens) => {
          if (!cardWithTokens.tokens) return;
          setCards((prev) =>
            prev.map((c) =>
              c.id === cardWithTokens.id
                ? { ...c, tokens: cardWithTokens.tokens }
                : c
            )
          );
        });
        setDecks((prevDecks) =>
          removeCardFromDeck(prevDecks, message.player, message.card.id)
        );
      } else if (message.type === "CARD_TAPPED") {
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === message.id ? { ...card, tapped: message.tapped } : card
          )
        );
      } else if (message.type === "RETURN_TO_HAND") {
        setCards((prevCards) =>
          prevCards.filter((card) => card.id !== message.id)
        );
        setHandSizes((prev) => ({
          ...prev,
          [message.player]: message.handSize,
        }));
      } else if (message.type === "TUTORED_TO_HAND") {
        setHandSizes((prev) => ({
          ...prev,
          [message.player]: message.handSize,
        }));
        setDecks((prevDecks) =>
          removeCardFromDeck(prevDecks, message.player, message.id)
        );
      } else if (message.type === "TURN_PASSED") {
        setTurn(message.turn);
      } else if (message.type === "USER_LEFT") {
        setTurn(message.turn);
        setPositions(message.positions);
        setCards((prevCards) =>
          prevCards.filter((card) => card.owner !== message.user)
        );
        setDecks((prevDecks) => removePlayerDeck(prevDecks, message.user));
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
  }, [roomId, setCards, setDecks, setHandSizes]);
}
