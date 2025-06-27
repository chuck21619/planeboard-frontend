import { useEffect, useState } from "react";
import { Stage, Layer } from "react-konva";
import { connectToRoom, disconnect, setOnMessageHandler } from "./ws";
import { useParams } from "react-router-dom";
import Card from "./components/Card";
import Deck from "./components/Deck";
import BoardBackground from "./components/BoardBackground";

function Room() {
  const { roomId } = useParams();
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [positions, setPositions] = useState({});
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const size = 5000;

  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnect();
    };
    const handlePopState = () => {
      disconnect();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    setStagePosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
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
        setPositions(message.positions);
      } else if (message.type === "USER_LEFT") {
        setPositions(message.positions);
        setDecks((prevDecks) =>
          prevDecks.filter((deck) => deck.id !== message.user)
        );
      }
    });
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      disconnect();
    };
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
          const target = e.target;
          if (target === e.target.getStage()) {
            const newX = target.x();
            const newY = target.y();
            console.log("Stage drag ended at", newX, newY);
            setStagePosition({ x: newX, y: newY });
          } else {
            console.log("Ignored dragEnd from", target.className);
          }
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
          <BoardBackground size={size} />
        </Layer>
        <Layer>
          {cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
          {decks.map((deck) => (
            <Deck key={deck.id} deck={deck} decks={decks} setDecks={setDecks} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

export default Room;
