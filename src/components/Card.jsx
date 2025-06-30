import { Rect } from "react-konva";
import { useSharedImage } from "../hooks/useSharedImage";
import { Image as KonvaImage } from "react-konva";
import { sendMessage } from "../ws";

export default function Card({
  card,
  isGhost = false,
  onDragStart,
  onReturnToHand,
  onCardMove,
  onTapCard,
}) {
  const image = useSharedImage(card.imageUrl);

  const width = 64;
  const height = 89;
  const rotation = card.tapped ? 90 : 0;

  const handleDragEnd = (e) => {
    const stage = e.target.getStage();
    const pointerPosition = stage?.getPointerPosition();
    if (!pointerPosition) return;
    const clientY =
      stage.container().getBoundingClientRect().top + pointerPosition.y;
    const droppedInHand = clientY > window.innerHeight - 80;

    // Convert rotated drag position back to top-left reference point
    const x = e.target.x();
    const y = e.target.y();

    const newX = x - width / 2;
    const newY = y - height / 2;

    if (droppedInHand && onReturnToHand) {
      onReturnToHand(card.id);
    } else {
      if (onCardMove) {
        onCardMove(card.id, newX, newY);
      }

      sendMessage({
        type: "MOVE_CARD",
        id: card.id,
        x: newX,
        y: newY,
      });
    }
  };

  const handleClick = () => {
    onTapCard(card.id);
  };

  const commonProps = {
    x: card.x + width / 2,
    y: card.y + height / 2,
    width,
    height,
    offsetX: width / 2,
    offsetY: height / 2,
    rotation,
    cornerRadius: 4,
    opacity: isGhost ? 0.5 : 1,
    draggable: !isGhost,
    listening: !isGhost,
    onClick: handleClick,
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
