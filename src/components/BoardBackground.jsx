import React, { useCallback } from "react";
import { Rect, Text } from "react-konva";
import { sendMessage } from "../ws";

const watermarkColorActive = "rgba(255, 255, 255, 0.38)";
const watermarkColorInActive = "rgba(255, 255, 255, 0.03)";
const watermarkFontSize = 300;
const watermarkOffset = 100;
const lifeCounterColor = "rgba(255, 255, 255, 0.27)";
const lifeCounterFontSize = 40;
const lifeCounterXOffset = 20;
const lifeCounterYOffset = 20;
const lifeCounterWidth = 70;
const size = 5000;

export default function BoardBackground({
  positions,
  lifeTotals,
  setLifeTotals,
  isRotated,
  turn,
  spectator,
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
    [setLifeTotals]
  );

  const handleClick = (e, username, delta) => {
    if (spectator) return;
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

  const baseCorners = [
    { key: "topLeft", x: -size, y: -size, align: "right", fill: "#155215" },
    { key: "topRight", x: 0, y: -size, align: "left", fill: "#151554" },
    { key: "bottomLeft", x: -size, y: 0, align: "right", fill: "#541515" },
    { key: "bottomRight", x: 0, y: 0, align: "left", fill: "#545415" },
  ];

  const rotatedCorners = isRotated
    ? baseCorners.map(({ key, x, y, align, fill }) => ({
        key,
        x: -x - size,
        y: -y - size,
        align: align === "left" ? "right" : "left",
        fill,
      }))
    : baseCorners;

  const renderCorner = (x, y, align, posKey, fill) => {
    const username = getUsernameForPosition(posKey);
    const hasPlayer = Boolean(username);
    const waterMarkColor =
      turn == username ? watermarkColorActive : watermarkColorInActive;

    return (
      <React.Fragment key={posKey}>
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
          fill={waterMarkColor}
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
            fontStyle="bold"
            fill={lifeCounterColor}
            onMouseDown={(e) =>
              handleClick(e, username, e.evt.button === 2 ? -1 : 1)
            }
            onContextMenu={(e) => {
              e.cancelBubble = true;
              e.evt.preventDefault();
            }}
          />
        )}
      </React.Fragment>
    );
  };

  return (
    <>
      {rotatedCorners.map(({ key, x, y, align, fill }) =>
        renderCorner(x, y, align, key, fill)
      )}
    </>
  );
}
