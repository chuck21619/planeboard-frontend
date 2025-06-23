import React, { useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { connectToRoom, sendMessage } from "./ws";

function App() {
  useEffect(() => {
    connectToRoom("1234");
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Planeboard</h1>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Rect
            x={100}
            y={100}
            width={100}
            height={140}
            fill="white"
            stroke="black"
            strokeWidth={2}
            cornerRadius={8}
            draggable
            shadowBlur={5}
            onDragEnd={(e) => {
              console.log("🟢 Card dragged:", e.target.x(), e.target.y());
              sendMessage({
                type: "MOVE_CARD",
                x: e.target.x(),
                y: e.target.y(),
              });
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
