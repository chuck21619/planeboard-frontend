import { Rect } from "react-konva";
import { useSharedImage } from "../hooks/useSharedImage";
import { Image as KonvaImage } from "react-konva";

export default function Card({
  card,
  isGhost = false,
  onMouseDown,
  onTapCard,
  onRightClick,
  rotation,
  defaultCardBackImage,
  spectator,
  isSelected = false,
}) {
  const frontImage = useSharedImage(card.imageUrl);
  const backImage = useSharedImage(card.imageUrlBack);
  const width = 64;
  const height = 89;
  const rotationWithTap = card.tapped ? rotation + 90 : rotation;

  const handleContextMenu = (e) => {
    if (spectator) return;
    e.evt.preventDefault();
    onRightClick(e);
  };

  const handleClick = (e) => {
    if (spectator) return;
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

  let displayedImage;
  if (card.flipIndex === 0) {
    displayedImage = frontImage;
  } else if (card.flipIndex === 1) {
    if (card.numFaces === 2) {
      displayedImage = defaultCardBackImage;
    } else {
      displayedImage = backImage;
    }
  } else {
    displayedImage = defaultCardBackImage;
  }

  if (displayedImage) {
    return (
      <>
        {isSelected && (
          <Rect
            x={card.x + width / 2}
            y={card.y + height / 2}
            width={width}
            height={height}
            offsetX={width / 2}
            offsetY={height / 2}
            rotation={rotationWithTap}
            stroke="yellow"
            strokeWidth={3}
            cornerRadius={4}
            listening={false}
          />
        )}
        <KonvaImage image={displayedImage} {...commonProps} />
      </>
    );
  } else {
    return <Rect fill="grey" stroke="black" strokeWidth={2} {...commonProps} />;
  }
}
