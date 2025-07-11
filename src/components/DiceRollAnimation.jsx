import { useEffect, useState } from "react";

export default function DiceRollAnimation({ numDice, numSides, results }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        backgroundColor: "rgba(0,0,0,0.85)",
        padding: "16px",
        borderRadius: "8px",
        color: "white",
        fontSize: "32px",
        fontFamily: "monospace",
      }}
    >
      {Array.from({ length: numDice }).map((_, i) => (
        <DieColumn
          key={i}
          numSides={numSides}
          finalValue={results[i]}
          delayOffset={i * 100}
        />
      ))}
    </div>
  );
}

function DieColumn({ numSides, finalValue, delayOffset }) {
  const [offset, setOffset] = useState(0);
  const [spinning, setSpinning] = useState(true);

  useEffect(() => {
    const rowHeight = 40; // height per number
    const cycles = 2 + Math.floor(Math.random() * 2); // how many times it loops
    const totalDistance = rowHeight * numSides * cycles;

    const finalIndex = finalValue - 1;
    const finalOffset = totalDistance + rowHeight * finalIndex;

    let start = null;

    const duration = 1200 + delayOffset; // total animation duration

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setOffset(finalOffset * easeOut);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setSpinning(false);
      }
    };

    requestAnimationFrame(step);
  }, [numSides, finalValue, delayOffset]);

  const numbers = Array.from({ length: numSides }, (_, i) => i + 1);

  return (
    <div
      style={{
        width: 40,
        height: 40,
        overflow: "hidden",
        background: "#111",
        border: "1px solid #444",
        textAlign: "center",
        fontSize: 28,
        lineHeight: "40px",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          transform: `translateY(-${offset}px)`,
          transition: spinning ? "none" : "transform 0.3s ease-out",
        }}
      >
        {Array.from({ length: 10 }).flatMap(() =>
          numbers.map((n) => (
            <div key={Math.random()} style={{ height: 40 }}>
              {n}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
