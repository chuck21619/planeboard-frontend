import { useState } from "react";

export default function DiceRollerPanel({ onSpawn, onClose }) {
  const [numDice, setNumDice] = useState(2);
  const [numSides, setNumSides] = useState(6);

  const increment = (setter, value, max = 99) => {
    if (value < max) setter(value + 1);
  };

  const decrement = (setter, value, min = 1) => {
    if (value > min) setter(value - 1);
  };

  return (
    <div
      style={{
        backgroundColor: "black",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "6px",
        color: "white",
        minWidth: 160,
        userSelect: "none",
      }}
    >
      <div style={{ marginBottom: "8px" }}>
        🎲 <strong>Dice Roller</strong>
      </div>

      {/* Number of Dice */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 0",
        }}
      >
        <span>Dice</span>
        <div>
          <button
            style={{ margin: "0 6px", padding: "6px 14px", fontSize: "12px" }}
            onClick={() => decrement(setNumDice, numDice)}
          >
            &lt;
          </button>
          <span>{numDice}</span>
          <button
            style={{ margin: "0 6px", padding: "6px 14px", fontSize: "12px" }}
            onClick={() => increment(setNumDice, numDice, 12)}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Number of Sides */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 0",
        }}
      >
        <span>Sides</span>
        <div>
          <button
            style={{ margin: "0 6px", padding: "6px 14px", fontSize: "12px" }}
            onClick={() => decrement(setNumSides, numSides, 2)}
          >
            &lt;
          </button>
          <span>{numSides}</span>
          <button
            style={{ margin: "0 6px", padding: "6px 14px", fontSize: "12px" }}
            onClick={() => increment(setNumSides, numSides, 100)}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => {
            onSpawn(numDice, numSides);
            onClose();
          }}
        >
          Spawn
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
