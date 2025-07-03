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
  setDecks,
  searchDeckId,
}) {
  const onMouseMove = useCallback((e) => {
    // Intentionally empty — mousemove handled globally on window
  });
  const onMouseUp = useCallback((e) => {
    // Intentionally empty — mouseup handled globally on window
  }, []);
  const [hasMoved, setHasMoved] = useState(false);
  const pendingDragRef = useRef(null);

  function getCardMouseDownHandler(card, source) {
    return (e) => {
      setHasMoved(false);
      pendingDragRef.current = { card, source };
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
          const { card, source } = pendingDragRef.current;
          pendingDragRef.current = null;
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
      if (!hasMoved) {
        pendingDragRef.current = null;
        setHasMoved(false);
        return;
      }
      setHasMoved(false);
      if (!draggingCard) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dropY = e.clientY;
      const handThreshold = window.innerHeight - 80;
      const isDroppingInHand = dropY > handThreshold;
      const x =
        (e.clientX - rect.left - stagePosition.x) / stageScale - cardWidth / 2;
      const y =
        (e.clientY - rect.top - stagePosition.y) / stageScale - cardHeight / 2;
      const card = draggingCard;

      if (dragSource === "board") {
        if (isDroppingInHand) {
          setHand((prev) => [...prev, card]);
          setCards((prev) => prev.filter((c) => c.id !== card.id));
          sendMessage({ type: "RETURN_TO_HAND", id: card.id, username });
        } else {
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
          setCards((prev) => [...prev, { ...card, x, y }]);
          sendMessage({
            type: "CARD_PLAYED_FROM_LIBRARY",
            card: { ...card, x, y },
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
          setCards((prev) => [...prev, { ...card, x, y }]);
          setHand((prev) => prev.filter((c) => c.id !== card.id));
          sendMessage({
            type: "CARD_PLAYED_FROM_HAND",
            card: { ...card, x, y },
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
