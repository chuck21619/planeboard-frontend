import React, { useState } from "react";

export default function DeckContextMenu({
  visible,
  position,
  deckId,
  onClose,
  onSearch,
  setScryData,
  setSurveilData,
}) {
  const [scryCount, setScryCount] = useState(1);
  const [surveilCount, setSurveilCount] = useState(1);

  if (!visible || !deckId) return null;

  const increment = (setter, count) => {
    if (count < 99) setter(count + 1);
  };

  const decrement = (setter, count) => {
    if (count > 1) setter(count - 1);
  };

  // Helper so clicks on arrows don't trigger onClick for whole row
  const stopPropagation = (e) => e.stopPropagation();

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
        minWidth: 120,
        userSelect: "none",
      }}
      onMouseLeave={onClose}
    >
      <div
        style={{ cursor: "pointer", padding: "4px 0" }}
        onClick={() => {
          onSearch(deckId);
          onClose();
        }}
      >
        🔍 Search
      </div>

      {/* Scry Menu Item */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 0",
          cursor: "pointer",
        }}
        onClick={() => {
          console.log("scry:", scryCount);
          setScryData({deckId, count: scryCount});
          onClose();
        }}
      >
        <span>Scry</span>
        <div>
          <button
            style={{
              marginLeft: 6,
              marginRight: 6,
              padding: "6px 14px",
              fontSize: "12px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              decrement(setScryCount, scryCount);
            }}
          >
            &lt;
          </button>
          <span>{scryCount}</span>
          <button
            style={{
              marginLeft: 6,
              marginRight: 2,
              padding: "6px 14px",
              fontSize: "12px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              increment(setScryCount, scryCount);
            }}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Surveil Menu Item */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 0",
          cursor: "pointer",
        }}
        onClick={() => {
          console.log("surveil:", surveilCount);
          setSurveilData({deckId, count: surveilCount});
          onClose();
        }}
      >
        <span>Surveil</span>
        <div>
          <button
            style={{
              marginLeft: 6,
              marginRight: 6,
              padding: "6px 14px",
              fontSize: "12px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              decrement(setSurveilCount, surveilCount);
            }}
          >
            &lt;
          </button>
          <span>{surveilCount}</span>
          <button
            style={{
              marginLeft: 6,
              marginRight: 2,
              padding: "6px 14px",
              fontSize: "12px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              increment(setSurveilCount, surveilCount);
            }}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
