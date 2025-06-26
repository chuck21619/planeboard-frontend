import React, { useEffect, useState } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";
import { connectToRoom, sendMessage, setOnMessageHandler } from "./ws";
import { useParams } from "react-router-dom";

function App() {
  const { roomId } = useParams();
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [users, setUsers] = useState([]);
  const [positions, setPositions] = useState({});

  useEffect(() => {
    connectToRoom();

    setOnMessageHandler((message) => {
      if (message.type === "BOARD_STATE") {
        setCards(message.cards);
        setDecks(message.decks);
        setUsers(message.users);
        setPositions(message.positions);
      } else if (message.type === "MOVE_CARD") {
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === message.id
              ? { ...card, x: message.x, y: message.y }
              : card
          )
        );
      } else if (message.type === "MOVE_DECK") {
        setDecks((prevDecks) =>
          prevDecks.map((deck) =>
            deck.id === message.id
              ? { ...deck, x: message.x, y: message.y }
              : deck
          )
        );
      } else if (message.type === "USER_JOINED") {
        setUsers(message.users);
        setDecks(Object.values(message.decks));
      } else if (message.type === "USER_LEFT") {
        setDecks((prevDecks) =>
          prevDecks.filter((deck) => deck.id !== message.user)
        );
        setUsers((prevUsers) => prevUsers.filter((u) => u !== message.user));
      }
    });
  }, [roomId]);

  return (
    <div className="room-container">
      <div className="player-bar player-bar-top">
        <div className="player-half">
          {Object.entries(positions).find(([_, pos]) => pos === "topLeft")?.[0]}
        </div>
        <div className="player-half">
          {
            Object.entries(positions).find(
              ([_, pos]) => pos === "topRight"
            )?.[0]
          }
        </div>
      </div>

      <div className="player-bar player-bar-bottom">
        <div className="player-half">
          {
            Object.entries(positions).find(
              ([_, pos]) => pos === "bottomLeft"
            )?.[0]
          }
        </div>
        <div className="player-half">
          {
            Object.entries(positions).find(
              ([_, pos]) => pos === "bottomRight"
            )?.[0]
          }
        </div>
      </div>

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
          {decks.map((deck) => (
            <React.Fragment key={deck.id}>
              <Rect
                x={deck.x}
                y={deck.y}
                width={60}
                height={90}
                fill="darkgreen"
                cornerRadius={8}
                shadowBlur={5}
                draggable
                onDragEnd={(e) => {
                  const newDecks = decks.map((d) =>
                    d.id === deck.id
                      ? { ...d, x: e.target.x(), y: e.target.y() }
                      : d
                  );
                  setDecks(newDecks);
                  sendMessage({
                    type: "MOVE_DECK",
                    id: deck.id,
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }}
              />
              <Text
                text={`${deck.id}'s Deck`}
                x={deck.x}
                y={deck.y - 20}
                fontSize={14}
                fill="white"
                align="center"
                width={60}
              />
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
