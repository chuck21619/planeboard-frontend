import React, { useState, useEffect, useRef } from "react";
import { Group, Rect, Text } from "react-konva";

export default function DiceRollKonva({ x, y, numDice, numSides }) {
  const rowHeight = 40;
  const cycles = 3;
  const [pos, setPos] = useState({ x: x, y: y });
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

    // Final offsets: one full cycle + offset for final rolled number
    const finalOffsets = newResults.map((val) => {
      // One full cycle height plus offset for final number
      const offset =
        rowHeight * numSides * (cycles - 1) + (val - 1) * rowHeight;
      // Clamp so it doesn't scroll past max height
      return Math.min(offset, totalHeight - rowHeight);
    });

    console.log("Rolling results:", newResults);
    console.log("Final offsets:", finalOffsets);

    const startTime = performance.now();
    const duration = 4000; // slower animation, 4 seconds

    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 5); // quintic ease out

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

  return (
    <Group
      x={pos.x}
      y={pos.y}
      draggable
      onDragEnd={(e) => {
        setPos({ x: e.target.x(), y: e.target.y() });
      }}
    >
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
        x={numDice * 50 + 10}
        y={rowHeight / 4}
        onClick={() => {
          if (!rolling) startRolling();
        }}
        // Konva doesn't support style prop for cursor; can add pointer events manually if needed
      >
        <Rect
          width={80}
          height={rowHeight * 0.6}
          fill={rolling ? "gray" : "darkgreen"}
          cornerRadius={6}
          shadowColor="black"
          shadowBlur={4}
        />
        <Text
          text={rolling ? "Rolling..." : "Roll"}
          fontSize={20}
          fill="white"
          width={80}
          height={rowHeight * 0.6}
          align="center"
          verticalAlign="middle"
          pointerEvents="none"
        />
      </Group>
    </Group>
  );
}
