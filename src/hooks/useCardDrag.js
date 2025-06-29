import { useEffect } from "react";
import { sendMessage } from "../ws";

const cardWidth = 64;
const cardHeight = 89;

export function useCardDrag({
  canvasRef,
  stageScale,
  stagePosition,
  draggingCard,
  setDraggingCard,
  setDragPos,
  setCards,
  setHand,
  username,
}) {
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!draggingCard) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x =
        (e.clientX - rect.left - stagePosition.x) / stageScale - cardWidth / 2;
      const y =
        (e.clientY - rect.top - stagePosition.y) / stageScale - cardHeight / 2;

      setDragPos({ x, y });
    };

    const onMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const onMouseUp = (e) => {
      if (!draggingCard) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const dropY = e.clientY;

      const handThreshold = window.innerHeight - 100; // 150px from bottom = hand area
      const isDroppingInHand = dropY > handThreshold;

      // ✅ Cancel if dropped in hand
      if (isDroppingInHand) {
        setDraggingCard(null);
        return;
      }

      // ✅ Otherwise, play the card onto the board
      const x =
        (e.clientX - rect.left - stagePosition.x) / stageScale - cardWidth / 2;
      const y =
        (e.clientY - rect.top - stagePosition.y) / stageScale - cardHeight / 2;

      const card = draggingCard;
      setCards((prev) => [...prev, { ...card, x, y }]);
      setHand((prev) => prev.filter((c) => c.id !== card.id));
      sendMessage({
        type: "CARD_PLAYED",
        card: { ...card, x, y },
        username: username,
      });

      setDraggingCard(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [draggingCard, stagePosition, stageScale]);
}
