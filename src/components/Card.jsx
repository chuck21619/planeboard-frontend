import { Image as KonvaImage, Rect } from "react-konva";
import { sendMessage } from "../ws";
import { useSharedImage } from "../hooks/useSharedImage";

export default function Card({ card, isGhost = false }) {
  const image = useSharedImage(card.imageUrl);
  return (
    <>
      {image ? (
        <KonvaImage
          image={image}
          x={card.x}
          y={card.y}
          width={64}
          height={89}
          cornerRadius={8}
          opacity={isGhost ? 0.5 : 1}
          draggable={!isGhost}
          listening={!isGhost}
          onDragEnd={
            isGhost
              ? undefined
              : (e) => {
                  sendMessage({
                    type: "MOVE_CARD",
                    id: card.id,
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }
          }
        />
      ) : (
        // Fallback rectangle while loading image
        <Rect
          x={card.x}
          y={card.y}
          width={64}
          height={89}
          fill="white"
          stroke="black"
          strokeWidth={2}
          cornerRadius={5}
          opacity={isGhost ? 0.5 : 1}
          draggable={!isGhost}
          listening={!isGhost}
          onDragEnd={
            isGhost
              ? undefined
              : (e) => {
                  sendMessage({
                    type: "MOVE_CARD",
                    id: card.id,
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }
          }
        />
      )}
    </>
  );
}
