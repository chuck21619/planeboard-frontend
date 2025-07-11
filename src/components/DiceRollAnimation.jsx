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
  const [value, setValue] = useState(() => Math.ceil(Math.random() * numSides));

  useEffect(() => {
    let count = 0;
    const totalSpins = 20 + Math.floor(Math.random() * 10); // full cycles before slowing
    const spin = () => {
      if (count < totalSpins) {
        setValue(Math.ceil(Math.random() * numSides));
        count++;
        const delay = 30 + count * 5 + delayOffset * 0.1; // slowing effect
        setTimeout(spin, delay);
      } else {
        setValue(finalValue);
      }
    };
    spin();
  }, [numSides, finalValue, delayOffset]);

  return <div style={{ width: 40, textAlign: "center" }}>{value}</div>;
}
