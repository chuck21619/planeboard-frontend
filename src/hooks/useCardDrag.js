import { useCallback, useEffect, useState, useRef } from "react";
import { sendMessage } from "../ws";
import { removeCardFromDeck } from "../utils/deckUtils";

const cardWidth = 64;
const cardHeight = 89;

export function useCardDrag({
  canvasRef,
  stageScale,
  stagePosition,
  draggingCard,
  dragSource,
  setDragSource,
  setDraggingCard,
  setDragPos,
  setCards,
  setHand,
  username,
  ignoreNextChange,
  decks,
  setDecks,
  searchDeckId,
  isRotated,
  cardDraggedToDeckMenu,
}) {
  const onMouseMove = useCallback((e) => {
    // Intentionally empty — mousemove handled globally on window
  });
  const onMouseUp = useCallback((e) => {
    // Intentionally empty — mouseup handled globally on window
  }, []);
  const [hasMoved, setHasMoved] = useState(false);
  const pendingDragRef = useRef(null);

  function getCardMouseDownHandler(card, source, rotation) {
    return (e) => {
      const isLeftClick = ("evt" in e && e.evt.button === 0) || e.button === 0;

      if (!isLeftClick) return;
      setHasMoved(false);
      pendingDragRef.current = { card, source, rotation };
      if ("evt" in e) {
        e.evt.preventDefault();
        e.evt.stopPropagation();
      } else {
        e.preventDefault();
        e.stopPropagation();
      }
    };
  }
  useEffect(() => {
    function handleGlobalMouseMove(e) {
      if (!hasMoved) {
        setHasMoved(true);
        if (pendingDragRef.current) {
          const { card, source, rotation } = pendingDragRef.current;
          pendingDragRef.current = null;
          card.rotation = rotation;
          setHasMoved(true);
          setDraggingCard(card);
          setDragSource(source);
        }
      }
      if (!draggingCard) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x =
        (e.clientX - rect.left - stagePosition.x) / stageScale - cardWidth / 2;
      const y =
        (e.clientY - rect.top - stagePosition.y) / stageScale - cardHeight / 2;
      setDragPos({ x, y });
    }
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [
    canvasRef,
    stagePosition,
    stageScale,
    setDragPos,
    setDraggingCard,
    setDragSource,
    hasMoved,
  ]);

  const onMouseDown = useCallback((e) => {
    e.evt.preventDefault();
    e.evt.stopPropagation();
  }, []);

  useEffect(() => {
    function handleGlobalMouseUp(e) {
      const isLeftClick = ("evt" in e && e.evt.button === 0) || e.button === 0;

      if (!isLeftClick) return;
      pendingDragRef.current = null;
      if (!hasMoved) {
        return;
      }
      setHasMoved(true);
      if (!draggingCard) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const elementUnderCursor = document.elementFromPoint(
        e.clientX,
        e.clientY
      );
      if (elementUnderCursor?.closest(".deck-search-modal")) {
        setDraggingCard(null);
        return;
      }
      const dropY = e.clientY;
      const handThreshold = window.innerHeight - 80;
      const isDroppingInHand = dropY > handThreshold;
      var x =
        (e.clientX - rect.left - stagePosition.x) / stageScale - cardWidth / 2;
      var y =
        (e.clientY - rect.top - stagePosition.y) / stageScale - cardHeight / 2;
      if (isRotated) {
        x = -x - 64;
        y = -y - 89;
      }
      const card = draggingCard;

      const decksArray = Object.values(decks);
      const droppedOnDeck = decksArray.find((deck) => {
        const deckX = deck.x;
        const deckY = deck.y;
        const dropCenterX = x + cardWidth / 2;
        const dropCenterY = y + cardHeight / 2;

        return (
          dropCenterX >= deckX &&
          dropCenterX <= deckX + cardWidth &&
          dropCenterY >= deckY &&
          dropCenterY <= deckY + cardHeight
        );
      });

      if (droppedOnDeck) {
        cardDraggedToDeckMenu(card, droppedOnDeck.id, {
          x: e.clientX,
          y: e.clientY,
        });
        setDraggingCard(null);
        return;
      }

      if (dragSource === "board") {
        if (isDroppingInHand) {
          const untappedCard = { ...card, x, y, tapped: false };
          setHand((prev) => [...prev, untappedCard]);
          setCards((prev) => prev.filter((c) => c.id !== card.id));
          sendMessage({ type: "RETURN_TO_HAND", id: card.id, username });
        } else {
          //dragging within the board
          setCards((prev) =>
            prev.map((c) => (c.id === card.id ? { ...c, x, y } : c))
          );
          sendMessage({ type: "MOVE_CARD", id: card.id, x, y });
        }
      } else if (dragSource === "deckSearch") {
        if (isDroppingInHand) {
          setHand((prev) => [...prev, card]);
          setCards((prev) => prev.filter((c) => c.id !== card.id));
          sendMessage({
            type: "TUTOR_TO_HAND",
            id: card.id,
            username: searchDeckId,
          });
        } else {
          const playedCard = {
            id: card.id,
            name: card.name,
            imageUrl: card.imageUrl,
            imageUrlBack: card.imageUrlBack,
            uid: card.uid,
            hasTokens: card.hasTokens,
            x,
            y,
            tapped: false,
            owner: username,
          };

          setCards((prev) => [...prev, playedCard]);

          sendMessage({
            type: "CARD_PLAYED_FROM_LIBRARY",
            card: playedCard,
            username: searchDeckId,
          });
        }
        setDecks((prevDecks) =>
          removeCardFromDeck(prevDecks, searchDeckId, card.id)
        );
      } else if (dragSource === "hand") {
        if (isDroppingInHand) {
          ignoreNextChange.current = true;
        } else {
          card.owner = username;
          setCards((prev) => [...prev, { ...card, x, y }]);
          setHand((prev) => prev.filter((c) => c.id !== card.id));
          sendMessage({
            type: "CARD_PLAYED_FROM_HAND",
            card: {
              id: card.id,
              name: card.name,
              imageUrl: card.imageUrl,
              uid: card.uid,
              hasTokens: card.hasTokens,
              x,
              y,
              tapped: false,
            },
            username,
          });
        }
      }
      setDraggingCard(null);
      setDragSource(null);
    }

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [
    draggingCard,
    dragSource,
    canvasRef,
    stagePosition,
    stageScale,
    setCards,
    setHand,
    username,
    ignoreNextChange,
  ]);
  const stageDraggable = !draggingCard && !pendingDragRef.current;
  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    getCardMouseDownHandler,
    hasMoved,
    stageDraggable,
  };
}
