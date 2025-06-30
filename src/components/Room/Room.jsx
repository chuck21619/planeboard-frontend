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
import { useWindowSize } from "../../hooks/useWindowSize";
import { useHoveredCard } from "../../hooks/useHoveredCard";
import { useLoadingFade } from "../../hooks/useLoadingFade";

const username = localStorage.getItem("username");

function Room() {
  const navigate = useNavigate();
  const stageRef = useRef();
  const { roomId } = useParams();
  const [hasJoined, setHasJoined] = useState(false);
  const { showSpinner, minLoadingDone } = useLoadingFade(hasJoined);
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [hand, setHand] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [draggingCard, setDraggingCard] = useState(null);
  const [hoveredHandCard, setHoveredHandCard] = useState(null);
  const { hoveredCard, setHoveredCard } = useHoveredCard(
    mousePos,
    cards,
    draggingCard,
    hoveredHandCard
  );
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
  const windowSize = useWindowSize();

  useCardImagePreloader(decks);
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
      <div className="fullscreen-flex">
        <div
          className={`room-container fade-in ${
            hasJoined && minLoadingDone ? "show" : ""
          }`}
          ref={canvasRef}
        >
          <Stage
            ref={stageRef}
            width={windowSize.width}
            height={windowSize.height}
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
            setHoveredHandCard={setHoveredHandCard}
          />
        </div>
        <div className={`hover-preview ${hoveredCard ? "" : "hidden"}`}>
          {hoveredCard && (
            <>
              <img src={hoveredCard?.imageUrl} alt={hoveredCard?.name} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Room;
