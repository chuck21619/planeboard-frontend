import React, { useEffect, useState } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";
import { connectToRoom, sendMessage, setOnMessageHandler } from "./ws";
import { useParams } from "react-router-dom";

function App() {
  const { roomId } = useParams();
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [positions, setPositions] = useState({});
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  const size = 5000;

  useEffect(() => {
    connectToRoom();

    setOnMessageHandler((message) => {
      if (message.type === "BOARD_STATE") {
        setCards(message.cards);
        setDecks(message.decks);
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
        setDecks(Object.values(message.decks));
      } else if (message.type === "USER_LEFT") {
        setDecks((prevDecks) =>
          prevDecks.filter((deck) => deck.id !== message.user)
        );
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

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        draggable
        onDragEnd={(e) => {
          setStagePosition({ x: e.target.x(), y: e.target.y() });
        }}
        onWheel={(e) => {
          e.evt.preventDefault();
          const scaleBy = 1.05;
          const oldScale = stageScale;
          const pointer = e.target.getStage().getPointerPosition();
          const mousePointTo = {
            x: (pointer.x - stagePosition.x) / oldScale,
            y: (pointer.y - stagePosition.y) / oldScale,
          };
          const newScale =
            e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
          setStageScale(newScale);
          const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
          };
          setStagePosition(newPos);
        }}
      >
        <Layer>
          {/* Top-left */}
          <Rect
            x={-size}
            y={-size}
            width={size}
            height={size}
            fill="#1e1e6a"
            opacity={0.05}
          />
          {/* Top-right */}
          <Rect
            x={0}
            y={-size}
            width={size}
            height={size}
            fill="#1e6a1e"
            opacity={0.05}
          />
          {/* Bottom-left */}
          <Rect
            x={-size}
            y={0}
            width={size}
            height={size}
            fill="#6a1e1e"
            opacity={0.05}
          />
          {/* Bottom-right */}
          <Rect
            x={0}
            y={0}
            width={size}
            height={size}
            fill="#6a6a1e"
            opacity={0.05}
          />
        </Layer>
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
