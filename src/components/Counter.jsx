import React from "react";
import { Group, Rect, Text } from "react-konva";

export default function Counter({ x, y, count, onChange, onMove }) {
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e) => {
        setIsDragging(false);
        onMove && onMove({ x: e.target.x(), y: e.target.y() });
      }}
      onClick={(e) => {
        if (e.evt.button === 0) {
          console.log("on click");
          e.evt.preventDefault();
          onChange && onChange(count + 1);
        }
      }}
      onContextMenu={(e) => {
        e.evt.preventDefault();
        e.evt.stopPropagation();  // 💥 this blocks stage menu
        e.cancelBubble = true;
        onChange && onChange(count - 1);
      }}
      onMouseEnter={(e) => {
        const container = e.target.getStage().container();
        container.style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage().container();
        container.style.cursor = "default";
      }}
    >
      <Rect
        width={40}
        height={40}
        fill="#333"
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
