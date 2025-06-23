import React, { useEffect, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { connectToRoom, sendMessage, setOnMessageHandler } from "./ws";

function App() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    connectToRoom("1234");

    setOnMessageHandler((message) => {
      if (message.type === "BOARD_STATE") {
        setCards(message.cards);
      } else if (message.type === "MOVE_CARD") {
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === message.id
              ? { ...card, x: message.x, y: message.y }
              : card
          )
        );
      }
    });
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Planeboard</h1>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {cards.map((card) => (
            <Rect
              key={card.id}
              x={card.x}
              y={card.y}
              width={100}
              height={140}
              fill="white"
              stroke="black"
              strokeWidth={2}
              cornerRadius={8}
              draggable
              shadowBlur={5}
              onDragEnd={(e) => {
                sendMessage({
                  type: "MOVE_CARD",
                  id: card.id,
                  x: e.target.x(),
                  y: e.target.y(),
                });
              }}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
