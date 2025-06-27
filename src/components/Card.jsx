import { Rect } from "react-konva";
import { sendMessage } from "../ws";

export default function Card({ card }) {
  return (
    <Rect
      x={card.x}
      y={card.y}
      width={100}
      height={140}
      fill="white"
      stroke="black"
      strokeWidth={2}
      cornerRadius={8}
      draggable
      shadowBlur={5}
      onDragEnd={(e) => {
        sendMessage({
          type: "MOVE_CARD",
          id: card.id,
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    />
  );
}
