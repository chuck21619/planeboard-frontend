import React from "react";

export default function DeckContextMenu({
  visible,
  position,
  deckId,
  onClose,
  onSearch,
}) {
  if (!visible || !deckId) return null;

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
      }}
      onMouseLeave={onClose}
    >
      <div
        style={{ cursor: "pointer" }}
        onClick={() => {
          onSearch(deckId);
          onClose();
        }}
      >
        🔍 Search
      </div>
    </div>
  );
}
