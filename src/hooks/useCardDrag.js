import { useCallback } from "react";
import { sendMessage } from "../ws";

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
}) {
  function getCardMouseDownHandler(card, source) {
    return (e) => {
      const clientX = "clientX" in e ? e.clientX : e.evt.clientX;
      const clientY = "clientY" in e ? e.clientY : e.evt.clientY;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x =
        (clientX - rect.left - stagePosition.x) / stageScale - cardWidth / 2;
      const y =
        (clientY - rect.top - stagePosition.y) / stageScale - cardHeight / 2;
      setDraggingCard(card);
      setDragSource(source);
      setDragPos({ x, y });
      if ("evt" in e) {
        e.evt.preventDefault();
        e.evt.stopPropagation();
      } else {
        e.preventDefault();
        e.stopPropagation();
      }
    };
  }

  const onMouseMove = useCallback(
    (e) => {
      if (!draggingCard) return;
      e.evt.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x =
        (e.evt.clientX - rect.left - stagePosition.x) / stageScale -
        cardWidth / 2;
      const y =
        (e.evt.clientY - rect.top - stagePosition.y) / stageScale -
        cardHeight / 2;
      setDragPos({ x, y });
    },
    [draggingCard, canvasRef, stagePosition, stageScale, setDragPos]
  );

  const onMouseDown = useCallback((e) => {
    e.evt.preventDefault();
    e.evt.stopPropagation();
  }, []);

  const onMouseUp = useCallback(
    (e) => {
      if (!draggingCard) return;

      const elementUnderCursor = document.elementFromPoint(
        e.evt.clientX,
        e.evt.clientY
      );
      if (elementUnderCursor?.closest(".deck-search-modal")) {
        setDraggingCard(null);
        setDragSource(null);
        return;
      }

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dropY = e.evt.clientY;
      const handThreshold = window.innerHeight - 80;
      const isDroppingInHand = dropY > handThreshold;
      const x =
        (e.evt.clientX - rect.left - stagePosition.x) / stageScale -
        cardWidth / 2;
      const y =
        (e.evt.clientY - rect.top - stagePosition.y) / stageScale -
        cardHeight / 2;
      const card = draggingCard;

      if (dragSource === "board") {
        if (isDroppingInHand) {
          setHand((prev) => [...prev, card]);
          setCards((prev) => prev.filter((c) => c.id !== card.id));
          sendMessage({
            type: "RETURN_TO_HAND",
            id: card.id,
            username,
          });
        } else {
          setCards((prev) =>
            prev.map((c) => (c.id === card.id ? { ...c, x, y } : c))
          );
          sendMessage({
            type: "MOVE_CARD",
            id: card.id,
            x,
            y,
          });
        }
      } else if (dragSource === "deckSearch") {
        if (isDroppingInHand) {
          //handle this
        } else {
          setCards((prev) => [...prev, { ...card, x, y }]);
          sendMessage({
            type: "CARD_PLAYED_FROM_LIBRARY",
            card: { ...card, x, y },
            username,
          });
        }
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
    },
    [
      draggingCard,
      dragSource,
      canvasRef,
      stagePosition,
      stageScale,
      setCards,
      setHand,
      username,
      ignoreNextChange,
    ]
  );

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    getCardMouseDownHandler,
  };
}
