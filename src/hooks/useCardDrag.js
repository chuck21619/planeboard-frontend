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
      e.evt.preventDefault(); // Prevent Konva panning
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
      if (isDroppingInHand) {
        setDraggingCard(null);
        setDragSource(null);
        return;
      }

      const x =
        (e.evt.clientX - rect.left - stagePosition.x) / stageScale -
        cardWidth / 2;
      const y =
        (e.evt.clientY - rect.top - stagePosition.y) / stageScale -
        cardHeight / 2;

      const card = draggingCard;
      if (dragSource === "board") {
        setCards((prev) =>
          prev.map((c) => (c.id === draggingCard.id ? { ...c, x, y } : c))
        );
      } else {
        setCards((prev) => [...prev, { ...draggingCard, x, y }]);
        setHand((prev) => prev.filter((c) => c.id !== draggingCard.id));
      }

      sendMessage({
        type: "CARD_PLAYED",
        card: { ...card, x, y },
        username,
      });
      setDraggingCard(null);
      setDragSource(null);
      ignoreNextChange.current = true;
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
