import React from "react";
import { Image as KonvaImage, Group } from "react-konva";

export default function OpponentHand({ count, quadrant, cardBackImage }) {
  const cardWidth = 64;
  const cardHeight = 89;
  const spacing = 20;
  const horizontalOffset = 600;
  const verticalOffset = 400;

  const getCardPosition = (index) => {
    const totalWidth = count * cardWidth - (count - 1) * spacing;
    const offsetX = index * (cardWidth - spacing);

    // Default position relative to center
    let x = -totalWidth / 2 + offsetX;
    let y = 0;

    switch (quadrant) {
      case "topLeft":
        x -= horizontalOffset;
        y -= verticalOffset;
        break;
      case "topRight":
        x += horizontalOffset;
        y -= verticalOffset;
        break;
      case "bottomLeft":
        x -= horizontalOffset;
        y += verticalOffset;
        break;
      case "bottomRight":
        x += horizontalOffset;
        y += verticalOffset;
        break;
      default:
        break;
    }

    return { x, y };
  };

  if (!cardBackImage) return null;

  return (
    <Group>
      {[...Array(count)].map((_, i) => {
        const { x, y } = getCardPosition(i);
        return (
          <KonvaImage
            key={i}
            x={x}
            y={y}
            image={cardBackImage}
            width={cardWidth}
            height={cardHeight}
          />
        );
      })}
    </Group>
  );
}
