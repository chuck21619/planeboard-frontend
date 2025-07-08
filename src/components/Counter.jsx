import React from "react";
import { Group, Rect, Text } from "react-konva";

export default function Counter({
  x,
  y,
  count,
  onChange,
  onHoverChange,
  hovered,
  onMove,
}) {
  const [isHovered, setIsHovered] = React.useState(false);
  React.useEffect(() => {
    setIsHovered(hovered);
  }, [hovered]);
  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragEnd={(e) => {
        onMove?.({ x: e.target.x(), y: e.target.y() });
      }}
      onMouseEnter={(e) => {
        setIsHovered(true);
        onHoverChange?.(true);
        const container = e.target.getStage().container();
        container.style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        onHoverChange?.(false);
        const container = e.target.getStage().container();
        container.style.cursor = "default";
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
        e.evt.stopPropagation(); // 💥 this blocks stage menu
        e.cancelBubble = true;
        onChange && onChange(count - 1);
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
