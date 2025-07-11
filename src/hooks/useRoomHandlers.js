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
  setCounters,
  setDiceRollers,
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
        setCounters(message.counters);
        setDiceRollers(message.diceRollers);
      } else if (message.type === "MOVE_CARD") {
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === message.id
              ? {
                  ...card,
                  x: message.x,
                  y: message.y,
                  flipIndex: message.flipIndex,
                }
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
      } else if (message.type === "CARD_FLIPPED") {
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === message.id
              ? { ...card, flipIndex: message.flipIndex }
              : card
          )
        );
      } else if (
        message.type === "CARD_TO_TOP_OF_DECK" ||
        message.type === "CARD_TO_BOTTOM_OF_DECK"
      ) {
        const { deckId, deckCards, handSize, id: removedId, source } = message;
        if (source === "board") {
          setCards((prevCards) =>
            prevCards.filter((card) => card.id !== removedId)
          );
        }
        setDecks((prev) => {
          const newDecks = { ...prev };
          if (newDecks[deckId]) {
            newDecks[deckId].cards = deckCards;
          }
          return newDecks;
        });
        setHandSizes((prev) => {
          return { ...prev, ...handSize };
        });
      } else if (message.type === "CARD_TO_SHUFFLE_IN_DECK") {
        const { deckId, deckCards, handSize, id: removedId, source } = message;
        if (source === "board") {
          setCards((prevCards) =>
            prevCards.filter((card) => card.id !== removedId)
          );
        }
        setDecks((prev) => {
          const newDecks = { ...prev };
          if (newDecks[deckId]) {
            newDecks[deckId].cards = deckCards;
          }
          return newDecks;
        });
        setHandSizes((prev) => {
          return { ...prev, ...handSize };
        });
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
      } else if (message.type === "PLAYER_SCRYED") {
        setDecks((prevDecks) => ({
          ...prevDecks,
          [message.deck.id]: message.deck,
        }));
      } else if (message.type === "PLAYER_SURVEILED") {
        setDecks((prevDecks) => ({
          ...prevDecks,
          [message.deck.id]: message.deck,
        }));
        setCards((prevCards) => [...prevCards, ...message.toGraveyard]);
      } else if (message.type === "COUNTER_ADDED") {
        setCounters((prev) => ({
          ...prev,
          [message.counter.id]: message.counter,
        }));
      } else if (message.type === "COUNTER_MOVED") {
        setCounters((prev) => {
          return {
            ...prev,
            [message.id]: {
              ...prev[message.id],
              x: message.x,
              y: message.y,
            },
          };
        });
      } else if (message.type === "COUNTER_UPDATED") {
        setCounters((prev) => ({
          ...prev,
          [message.id]: {
            ...prev[message.id],
            count: message.count,
          },
        }));
      } else if (message.type === "COUNTER_DELETED") {
        setCounters((prev) => {
          const copy = { ...prev };
          console.log("prev: ", prev);
          delete copy[message.id];
          return copy;
        });
      } else if (message.type === "DICE_ROLLER_ADDED") {
        setDiceRollers((prev) => ({
          ...prev,
          [message.diceRoller.id]: message.diceRoller,
        }));
      } else if (message.type === "DICE_ROLLER_MOVED") {
        setDiceRollers((prev) => {
          const updated = {
            ...prev,
            [message.id]: {
              ...prev[message.id],
              x: message.x,
              y: message.y,
            },
          };
          return updated;
        });
      } else if (message.type === "DICE_ROLLED") {
      } else if (message.type === "DICE_ROLLER_DELETED") {
        setDiceRollers((prev) => {
          const copy = { ...prev };
          delete copy[message.id];
          return copy;
        });
      } else if (message.type === "UNTAPPED_ALL") {
        setCards((prev) =>
          prev.map((card) =>
            card.owner === message.player ? { ...card, tapped: false } : card
          )
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
