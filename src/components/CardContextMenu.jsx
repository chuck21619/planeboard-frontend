import React from "react";
import { sendMessage } from "../ws";

export default function CardContextMenu({
  visible,
  card,
  position,
  canvasRef,
  stageScale,
  stagePosition,
  isRotated,
  setCards,
  setHoveredCard,
  onClose,
}) {
  if (!visible || !card) return null;

  const spawnToken = (token, clientX, clientY) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;
    const worldX = canvasX / stageScale - stagePosition.x / stageScale;
    const worldY = canvasY / stageScale - stagePosition.y / stageScale;
    let x = worldX - 64 / 2;
    let y = worldY - 89 / 2;

    if (isRotated) {
      x = -x - 64;
      y = -y - 89;
    }

    const uniqueID = `${token.id}-${Math.random()
      .toString(36)
      .substring(2, 6)}`;
    const newToken = {
      id: uniqueID,
      name: token.name,
      imageUrl: token.imageUrl,
      x,
      y,
      owner: localStorage.getItem("username"),
      tapped: false,
      flipIndex: 0,
      token: true,
    };

    setCards((prev) => [...prev, newToken]);
    setHoveredCard(newToken);
    sendMessage({ type: "SPAWN_TOKEN", card: newToken });
    onClose();
  };

  return (
    <div
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        backgroundColor: "black",
        border: "1px solid #ccc",
        padding: "6px",
        zIndex: 9999,
        minWidth: "120px",
      }}
      onMouseLeave={onClose}
    >
      <div
        style={{ cursor: "pointer", padding: "4px 8px" }}
        onClick={() => {
          console.log("Test clicked");
          onClose();
        }}
      >
        🧪 Test
      </div>

      {card.tokens?.length > 0 &&
        card.tokens.map((token) => (
          <div
            key={token.id}
            style={{
              cursor: "pointer",
              padding: "4px 8px",
              whiteSpace: "nowrap",
            }}
            onClick={(e) => spawnToken(token, e.clientX, e.clientY)}
          >
            ➕ {token.name}
          </div>
        ))}
    </div>
  );
}
