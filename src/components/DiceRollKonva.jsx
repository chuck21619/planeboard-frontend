import React, { useState, useEffect, useRef } from "react";
import { Group, Rect, Text } from "react-konva";
import { sendMessage } from "../ws";

export default function DiceRollKonva({
  id,
  isRotated,
  x,
  y,
  hovered,
  numDice,
  numSides,
  hoveredDiceRollerId,
  setHoveredDiceRollerId,
}) {
  const [isHovered, setIsHovered] = React.useState(false);
  const width = numDice * 50 + 105;
  const rowHeight = 40;
  const cycles = 3;
  const [results, setResults] = useState(
    Array.from({ length: numDice }, () => 1)
  );
  const [offsets, setOffsets] = useState(
    Array.from({ length: numDice }, () => 0)
  );
  const [rolling, setRolling] = useState(false);
  const animationRef = useRef(null);

  // Generate random dice roll results
  const generateResults = () =>
    Array.from({ length: numDice }, () => Math.ceil(Math.random() * numSides));

  const startRolling = () => {
    const newResults = generateResults();
    setResults(newResults);
    setRolling(true);
    const totalHeight = rowHeight * numSides * cycles;
    const finalOffsets = newResults.map((val) => {
      const offset =
        rowHeight * numSides * (cycles - 1) + (val - 1) * rowHeight;
      return Math.min(offset, totalHeight - rowHeight);
    });
    const startTime = performance.now();
    const duration = 4000;
    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 5);
      const newOffsets = finalOffsets.map((target) => target * eased);
      setOffsets(newOffsets);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setOffsets(finalOffsets);
        setRolling(false);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const numbers = Array.from({ length: numSides }, (_, i) => i + 1);
  React.useEffect(() => {
    setIsHovered(hovered);
  }, [hovered]);
  return (
    <Group
      x={x}
      y={y}
      draggable
      onMouseEnter={(e) => {
        setIsHovered(true);
        setHoveredDiceRollerId(id);
        const container = e.target.getStage().container();
        container.style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        if (hoveredDiceRollerId === id) setHoveredDiceRollerId(null);
        const container = e.target.getStage().container();
        container.style.cursor = "default";
      }}
      onDragEnd={(e) => {
        const rotatedX = isRotated ? -e.target.x() - width + 20 : e.target.x();
        const rotatedY = isRotated ? -e.target.y() - 40 : e.target.y();
        sendMessage({
          type: "MOVE_DICE_ROLLER",
          id,
          x: rotatedX,
          y: rotatedY,
        });
      }}
    >
      {/* Background */}
      <Rect
        x={-10}
        y={-10}
        width={width}
        height={rowHeight + 20}
        fill="black"
        opacity={0.6}
        cornerRadius={8}
      />

      {/* Dice columns */}
      {offsets.map((offset, i) => {
        const maxScroll = rowHeight * numSides * cycles - rowHeight;
        const clampedOffset = Math.min(offset, maxScroll);

        return (
          <Group
            key={i}
            x={i * 50}
            clip={{ x: 0, y: 0, width: 40, height: rowHeight }}
          >
            <Group y={-clampedOffset}>
              {Array.from({ length: cycles }).flatMap((_, cycleIndex) =>
                numbers.map((num, numIndex) => (
                  <Text
                    key={`${i}-${cycleIndex}-${numIndex}`}
                    text={num.toString()}
                    fontSize={28}
                    fill="white"
                    fontFamily="monospace"
                    width={40}
                    height={rowHeight}
                    y={cycleIndex * numSides * rowHeight + numIndex * rowHeight}
                    align="center"
                    verticalAlign="middle"
                  />
                ))
              )}
            </Group>
            <Rect width={40} height={rowHeight} stroke="white" />
          </Group>
        );
      })}

      {/* Roll Button */}
      <Group
        x={numDice * 50 + 5}
        y={rowHeight / 7}
        onClick={() => {
          if (!rolling) startRolling();
        }}
      >
        <Rect
          width={80}
          height={rowHeight * 0.75}
          fill={rolling ? "rgba(40, 40, 40, 1)" : "rgba(5, 68, 21, 1)"}
          cornerRadius={6}
          shadowColor="black"
          shadowBlur={4}
        />
        <Text
          text={rolling ? "Rolling..." : "Roll"}
          fontSize={rolling ? 16 : 18}
          fontStyle="bold"
          fill="white"
          width={80}
          height={rowHeight * 0.75}
          align="center"
          verticalAlign="middle"
          pointerEvents="none"
        />
      </Group>
    </Group>
  );
}
