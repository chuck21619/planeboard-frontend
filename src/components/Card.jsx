import { Rect } from "react-konva";
import { useSharedImage } from "../hooks/useSharedImage";
import { Image as KonvaImage } from "react-konva";
import { sendMessage } from "../ws";

export default function Card({
  card,
  isGhost = false,
  onDragStart,
  onReturnToHand,
  onCardMove, // <- new prop
}) {
  const image = useSharedImage(card.imageUrl);

  const handleDragEnd = (e) => {
    const stage = e.target.getStage();
    const pointerPosition = stage?.getPointerPosition();
    if (!pointerPosition) return;

    const clientY =
      stage.container().getBoundingClientRect().top + pointerPosition.y;

    const droppedInHand = clientY > window.innerHeight - 80;

    const x = e.target.x();
    const y = e.target.y();

    if (droppedInHand && onReturnToHand) {
      onReturnToHand(card.id);
    } else {
      // Optimistically update local card position
      if (onCardMove) {
        onCardMove(card.id, x, y);
      }

      sendMessage({
        type: "MOVE_CARD",
        id: card.id,
        x,
        y,
      });
    }
  };

  const commonProps = {
    x: card.x,
    y: card.y,
    width: 64,
    height: 89,
    cornerRadius: 4,
    opacity: isGhost ? 0.5 : 1,
    draggable: !isGhost,
    listening: !isGhost,
    onDragStart: () => {
      if (!isGhost && onDragStart) onDragStart(card);
    },
    onDragEnd: isGhost ? undefined : handleDragEnd,
  };

  return image ? (
    <KonvaImage image={image} {...commonProps} />
  ) : (
    <Rect fill="white" stroke="black" strokeWidth={2} {...commonProps} />
  );
}
