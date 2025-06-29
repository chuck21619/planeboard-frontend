import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Stage, Layer } from "react-konva";
import { useParams } from "react-router-dom";
import Card from "../Card";
import Deck from "../Deck";
import Hand from "../Hand";
import OpponentHand from "../OpponentHand";
import BoardBackground from "../BoardBackground";
import { useCardImagePreloader } from "../../hooks/useCardImagePreloader";
import useImage from "use-image";
import { useCardDrag } from "../../hooks/useCardDrag";
import { useRoomHandlers } from "./useRoomHandlers";
import { useStageEvents } from "./useStageEvents";
import { sendMessage } from "../../ws";

const username = localStorage.getItem("username");

function Room() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [hasJoined, setHasJoined] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [minLoadingDone, setMinLoadingDone] = useState(false);
  const [showRoom, setShowRoom] = useState(false);
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [hand, setHand] = useState([]);
  const [draggingCard, setDraggingCard] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const [handSizes, setHandSizes] = useState({});
  const [cardBackImage] = useImage("/defaultCardBack.jpg");
  const [positions, setPositions] = useState({});
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const { handleWheel, handleDragEnd } = useStageEvents(
    setStageScale,
    setStagePosition
  );
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useCardImagePreloader(decks);
  useEffect(() => {
    const handleResize = () => {
      console.log("Window resized:", window.innerWidth, window.innerHeight);
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const spinnerTimer = setTimeout(() => setShowSpinner(true), 10);
    const minLoadTimer = setTimeout(() => setMinLoadingDone(true), 500);
    let showRoomTimer;
    if (hasJoined) {
      showRoomTimer = setTimeout(() => setShowRoom(true), 10);
    }
    return () => {
      clearTimeout(spinnerTimer);
      clearTimeout(minLoadTimer);
      clearTimeout(showRoomTimer);
    };
  }, [hasJoined]);

  useCardDrag({
    canvasRef,
    stageScale,
    stagePosition,
    draggingCard,
    setDraggingCard,
    setDragPos,
    setCards,
    setHand,
    username,
  });

  useRoomHandlers({
    roomId,
    setCards,
    setDecks,
    setHand,
    setHandSizes,
    setPositions,
    setHasJoined,
    setStagePosition,
    username,
    navigate,
  });

  return (
    <div>
      <div
        className={`loading-container fade-in ${
          (!hasJoined || !minLoadingDone) && showSpinner ? "show" : ""
        }`}
      >
        <div className="spinner"></div>
      </div>
      <div
        className={`room-container fade-in ${
          hasJoined && minLoadingDone ? "show" : ""
        }`}
        ref={canvasRef}
      >
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          draggable
          onDragEnd={(e) => handleDragEnd(e, setStagePosition)}
          onWheel={(e) => handleWheel(e, stagePosition, stageScale)}
        >
          <Layer>
            <BoardBackground positions={positions} />
          </Layer>
          <Layer>
            {Object.entries(handSizes).map(([playerName, count]) => {
              if (playerName === username) return null;
              return (
                <OpponentHand
                  key={playerName}
                  count={count}
                  quadrant={positions[playerName]}
                  cardBackImage={cardBackImage}
                />
              );
            })}
          </Layer>
          <Layer>
            {draggingCard && (
              <Card
                card={{ ...draggingCard, x: dragPos.x, y: dragPos.y }}
                isGhost
              />
            )}
            {cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                onReturnToHand={(cardId) => {
                  // Move card from board to hand
                  setCards((prev) => prev.filter((c) => c.id !== cardId));
                  const cardToReturn = cards.find((c) => c.id === cardId);
                  if (cardToReturn) {
                    setHand((prev) => [...prev, cardToReturn]);
                    sendMessage({
                      type: "CARD_RETURNED",
                      id: cardId,
                      username: username,
                    });
                  }
                }}
              />
            ))}
            {decks.map((deck) => (
              <Deck
                key={deck.id}
                deck={deck}
                decks={decks}
                setDecks={setDecks}
              />
            ))}
          </Layer>
        </Stage>
        <Hand
          hand={hand}
          setDraggingCard={setDraggingCard}
          setDragPos={setDragPos}
        />
      </div>
    </div>
  );
}

export default Room;
