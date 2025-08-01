import React from "react";
import { Group, Rect, Text } from "react-konva";
import { sendMessage } from "../ws";

export default function Counter({
  id,
  x,
  y,
  count,
  hovered,
  isRotated,
  setCounters,
  hoveredCounterId,
  setHoveredCounterId,
  spectator,
}) {
  const [isHovered, setIsHovered] = React.useState(false);
  const handleChange = (newCount) => {
    setCounters((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        count: newCount,
      },
    }));
    sendMessage({
      type: "UPDATE_COUNTER",
      id,
      count: newCount,
    });
  };

  React.useEffect(() => {
    setIsHovered(hovered);
  }, [hovered]);
  return (
    <Group
      name="Counter"
      x={x}
      y={y}
      draggable={!spectator}
      onDragEnd={(e) => {
        const rotatedX = isRotated ? -e.target.x() - 40 : e.target.x();
        const rotatedY = isRotated ? -e.target.y() - 40 : e.target.y();
        sendMessage({
          type: "MOVE_COUNTER",
          id,
          x: rotatedX,
          y: rotatedY,
        });
      }}
      onMouseEnter={(e) => {
        setIsHovered(true);
        setHoveredCounterId(id);
        const container = e.target.getStage().container();
        container.style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        if (hoveredCounterId === id) setHoveredCounterId(null);
        const container = e.target.getStage().container();
        container.style.cursor = "default";
      }}
      onClick={(e) => {
        if (spectator) return;
        if (e.evt.button === 0) {
          e.evt.preventDefault();
          handleChange(count + 1);
        }
      }}
      onContextMenu={(e) => {
        if (spectator) return;
        e.evt.preventDefault();
        e.evt.stopPropagation(); // 💥 this blocks stage menu
        e.cancelBubble = true;
        handleChange(count - 1);
      }}
    >
      <Rect
        width={40}
        height={40}
        fill={isHovered ? "#555" : "#333"}
        cornerRadius={10}
        shadowBlur={4}
      />
      <Text
        text={count.toString()}
        fontSize={24}
        fill="white"
        width={40}
        height={40}
        align="center"
        verticalAlign="middle"
      />
    </Group>
  );
}
