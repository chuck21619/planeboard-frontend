import { Rect, Text } from "react-konva";
import { useState, useCallback } from "react";
import { sendMessage } from "../ws";

const watermarkColor = "rgba(255, 255, 255, 0.03)";
const watermarkFontSize = 300;
const watermarkOffset = 100;
const lifeCounterColor = "rgba(255, 255, 255, 0.27)";
const lifeCounterFontSize = 40;
const lifeCounterXOffset = 20;
const lifeCounterYOffset = 20;
const lifeCounterWidth = 70;
const size = 5000;

export default function BoardBackground({
  positions = {},
  lifeTotals = {},
  setLifeTotals,
}) {
  const getUsernameForPosition = (targetPos) =>
    Object.entries(positions).find(([_, pos]) => pos === targetPos)?.[0] || "";

  const changeLife = useCallback(
    (username, delta) => {
      setLifeTotals((prev) => ({
        ...prev,
        [username]: (prev[username] ?? 0) + delta,
      }));
    },
    [getUsernameForPosition]
  );

  const handleClick = (e, username, delta) => {
    e.cancelBubble = true;
    if (e.evt.button === 2) e.evt.preventDefault();
    const prev = lifeTotals[username] ?? 0;
    const newLifeTotal =
      e.evt.button === 2 && delta < 0
        ? prev - 1
        : e.evt.button === 0 && delta > 0
        ? prev + 1
        : prev;
    changeLife(username, newLifeTotal - prev);
    sendMessage({
      type: "LIFE_TOTAL_CHANGE",
      username: username,
      lifeTotal: newLifeTotal,
    });
  };

  const renderCorner = (x, y, align, posKey, fill) => {
    const username = getUsernameForPosition(posKey);
    const hasPlayer = Boolean(username);

    return (
      <>
        <Rect
          x={x}
          y={y}
          width={size}
          height={size}
          fill={fill}
          opacity={0.1}
        />
        <Text
          text={username}
          x={x < 0 ? -size - watermarkOffset : watermarkOffset}
          y={y < 0 ? -watermarkFontSize - watermarkOffset : watermarkOffset}
          width={size}
          align={align}
          fontSize={watermarkFontSize}
          fill={watermarkColor}
          listening={false}
        />
        {hasPlayer && (
          <Text
            text={`${lifeTotals[username] ?? 0}`}
            x={
              x < 0
                ? -lifeCounterWidth - lifeCounterXOffset
                : lifeCounterXOffset
            }
            y={
              y < 0
                ? -lifeCounterFontSize - lifeCounterYOffset
                : lifeCounterYOffset
            }
            width={lifeCounterWidth}
            align={align}
            fontSize={lifeCounterFontSize}
            fontStyle="bold" // ✅ bold font
            fill={lifeCounterColor}
            onMouseDown={(e) =>
              handleClick(e, username, e.evt.button === 2 ? -1 : 1)
            }
            onContextMenu={(e) => e.evt.preventDefault()}
          />
        )}
      </>
    );
  };

  return (
    <>
      {renderCorner(-size, -size, "right", "topLeft", "#155215")}
      {renderCorner(0, -size, "left", "topRight", "#151554")}
      {renderCorner(-size, 0, "right", "bottomLeft", "#541515")}
      {renderCorner(0, 0, "left", "bottomRight", "#545415")}
    </>
  );
}
