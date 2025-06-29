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
  const stageRef = useRef();
  const { roomId } = useParams();
  const [hasJoined, setHasJoined] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [minLoadingDone, setMinLoadingDone] = useState(false);
  const [showRoom, setShowRoom] = useState(false);
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [hand, setHand] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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

  useEffect(() => {
    if (draggingCard) {
      setHoveredCard(draggingCard);
      return;
    }

    const hovered = cards.find((card) => {
      return (
        mousePos.x >= card.x &&
        mousePos.x <= card.x + 64 &&
        mousePos.y >= card.y &&
        mousePos.y <= card.y + 89
      );
    });

    setHoveredCard(hovered || null);
  }, [mousePos, cards, draggingCard]);

  useEffect(() => {
    console.log("Hovered card:", hoveredCard?.name || null);
  }, [hoveredCard]);
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
      <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
        <div
          className={`room-container fade-in ${
            hasJoined && minLoadingDone ? "show" : ""
          }`}
          ref={canvasRef}
          style={{ flex: 1, position: "relative" }}
        >
          <Stage
            ref={stageRef}
            width={window.innerWidth}
            height={window.innerHeight}
            scaleX={stageScale}
            scaleY={stageScale}
            x={stagePosition.x}
            y={stagePosition.y}
            draggable
            onDragEnd={(e) => handleDragEnd(e, setStagePosition)}
            onWheel={(e) => handleWheel(e, stagePosition, stageScale)}
            onMouseMove={(e) => {
              const stage = e.target.getStage();
              const pointer = stage.getPointerPosition();
              if (!pointer) return;

              // Transform to stage space
              const scale = stage.scaleX(); // or use stageScale
              const stagePos = stage.position();

              const x = (pointer.x - stagePos.x) / scale;
              const y = (pointer.y - stagePos.y) / scale;

              setMousePos({ x, y });
            }}
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
                  onCardMove={(id, x, y) => {
                    setCards((prev) =>
                      prev.map((c) => (c.id === id ? { ...c, x, y } : c))
                    );
                    // Force a mouse position update to retrigger hover logic
                    const stage = stageRef.current;
                    const pointer = stage?.getPointerPosition();
                    if (pointer) {
                      const scale = stage.scaleX();
                      const stagePos = stage.position();
                      const correctedX = (pointer.x - stagePos.x) / scale;
                      const correctedY = (pointer.y - stagePos.y) / scale;
                      setMousePos({ x: correctedX, y: correctedY });
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
            draggingCard={draggingCard}
            setDraggingCard={setDraggingCard}
            setDragPos={setDragPos}
            setHoveredCard={setHoveredCard}
          />
        </div>
        <div
          style={{
            position: "fixed",
            top: "50%", // vertical center
            right: 0,
            transform: "translateY(-50%)", // center vertically
            width: 300,
            maxHeight: "90vh",
            padding: 12,
            zIndex: 9999,
            display: hoveredCard ? "flex" : "none",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {hoveredCard && (
            <>
              <img
                src={hoveredCard?.imageUrl}
                alt={hoveredCard?.name}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 14,
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Room;
