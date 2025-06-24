import React, { useEffect, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { connectToRoom, sendMessage, setOnMessageHandler } from "./ws";
import { useParams } from "react-router-dom";

function App() {
  const { roomId } = useParams();
  const [cards, setCards] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    connectToRoom(roomId || "1234");

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
      } else if (message.type === "USER_JOINED") {
        setUsers(message.users);
      } else if (message.type === "USER_LEFT") {
        setUsers(message.users);
      }
    });
  }, [roomId]);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Planeboard - Room {roomId}</h1>
      <h3>Players in room:</h3>
      <ul>
        {users.map((u) => (
          <li key={u}>{u}</li>
        ))}
      </ul>
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
