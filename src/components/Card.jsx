import { Rect } from "react-konva";
import { useSharedImage } from "../hooks/useSharedImage";
import { Image as KonvaImage } from "react-konva";

export default function Card({
  card,
  isGhost = false,
  onMouseDown,
  onTapCard,
}) {
  const image = useSharedImage(card.imageUrl);

  const width = 64;
  const height = 89;
  const rotation = card.tapped ? 90 : 0;

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
    listening: !isGhost,
    onClick: handleClick,
    onMouseDown: onMouseDown,
  };

  return image ? (
    <KonvaImage image={image} {...commonProps} />
  ) : (
    <Rect fill="white" stroke="black" strokeWidth={2} {...commonProps} />
  );
}
