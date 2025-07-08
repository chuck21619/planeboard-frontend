import React, { useEffect } from "react";

export default function BoardContextMenu({ visible, position, onClose, onAddCounter }) {
  if (!visible) return null;

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
        color: "white",
      }}
      onMouseLeave={onClose}
    >
      <div
        style={{ cursor: "pointer", marginBottom: "4px" }}
        onClick={() => {
          onAddCounter("+1/+1");
          onClose();
        }}
      >
        ➕ +1/+1 Counter
      </div>
      <div
        style={{ cursor: "pointer" }}
        onClick={() => {
          onAddCounter("Loyalty");
          onClose();
        }}
      >
        🌀 Loyalty Counter
      </div>
    </div>
  );
}
