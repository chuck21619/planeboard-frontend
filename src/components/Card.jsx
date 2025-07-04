import { Rect } from "react-konva";
import { useSharedImage } from "../hooks/useSharedImage";
import { Image as KonvaImage } from "react-konva";

export default function Card({
  card,
  isGhost = false,
  onMouseDown,
  onTapCard,
  onRightClick,
  rotation
}) {
  const image = useSharedImage(card.imageUrl);

  const width = 64;
  const height = 89;
  const rotationWithTap = (card.tapped ? rotation + 90 : rotation) % 360;

  const handleContextMenu = (e) => {
    e.evt.preventDefault();
    onRightClick(e);
  };
  const handleClick = (e) => {
    if (e.evt.button !== 0) return;
    onTapCard(card.id);
  };

  const commonProps = {
    x: card.x + width / 2,
    y: card.y + height / 2,
    width,
    height,
    offsetX: width / 2,
    offsetY: height / 2,
    rotation: rotationWithTap,
    cornerRadius: 4,
    opacity: isGhost ? 0.5 : 1,
    listening: !isGhost,
    onClick: handleClick,
    onMouseDown: onMouseDown,
    onContextMenu: handleContextMenu,
  };

  return image ? (
    <KonvaImage image={image} {...commonProps} />
  ) : (
    <Rect fill="white" stroke="black" strokeWidth={2} {...commonProps} />
  );
}
