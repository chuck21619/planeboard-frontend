import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Hand from "./Hand";
import { useCardImagePreloader } from "../hooks/useCardImagePreloader";
import useImage from "use-image";
import { useCardDrag } from "../hooks/useCardDrag";
import { useCardTap } from "../hooks/useCardTap";
import { useRoomHandlers } from "../hooks/useRoomHandlers";
import { useStageEvents } from "../hooks/useStageEvents";
import { useWindowSize } from "../hooks/useWindowSize";
import { useHoveredCard } from "../hooks/useHoveredCard";
import { useLoadingFade } from "../hooks/useLoadingFade";
import { useStageMousePos } from "../hooks/useStageMousePos";
import GameCanvas from "./GameCanvas";
import DeckSearchModal from "./DeckSearchModal";

const username = localStorage.getItem("username");

function Room() {
  const navigate = useNavigate();
  const stageRef = useRef();
  const [deckMenuVisible, setDeckMenuVisible] = useState(false);
  const [cardMenuVisible, setCardMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchDeckId, setSearchDeckId] = useState(null);
  const [menuDeckId, setMenuDeckId] = useState(null);
  const [cardMenuCard, setCardMenuCard] = useState(null);
  const { roomId } = useParams();
  const [hasJoined, setHasJoined] = useState(false);
  const { showSpinner, minLoadingDone } = useLoadingFade(hasJoined);
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState({});
  const [hand, setHand] = useState([]);
  const [draggingCard, setDraggingCard] = useState(null);
  const [dragSource, setDragSource] = useState(null);
  const [hoveredHandCard, setHoveredHandCard] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const [handSizes, setHandSizes] = useState({});
  const [cardBackImage] = useImage("/defaultCardBack.jpg");
  const [positions, setPositions] = useState({});
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [mousePos, stageMouseMove] = useStageMousePos();
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const { hoveredCard, setHoveredCard, ignoreNextChange } = useHoveredCard(
    mousePos,
    cards,
    draggingCard,
    hoveredHandCard
  );
  const { handleWheel, handleDragEnd } = useStageEvents(
    setStageScale,
    setStagePosition
  );
  const windowSize = useWindowSize();
  useCardImagePreloader(decks, Object.values(cards));
  const {
    onMouseDown: dragMouseDown,
    onMouseMove: dragMouseMove,
    onMouseUp: dragMouseUp,
    getCardMouseDownHandler,
    hasMoved,
    stageDraggable,
  } = useCardDrag({
    canvasRef,
    stageScale,
    stagePosition,
    draggingCard,
    dragSource,
    setDragSource,
    setDraggingCard,
    setDragPos,
    setCards,
    setHand,
    username,
    ignoreNextChange,
    setDecks,
    searchDeckId,
  });
  const { tapCard } = useCardTap(setCards, hasMoved);
  useRoomHandlers({
    roomId,
    setCards,
    setDecks,
    setHandSizes,
    setPositions,
    setHasJoined,
    setStagePosition,
    username,
    navigate,
    searchDeckId,
  });
  const handleDeckRightClick = (clientX, clientY, deckId) => {
    setDeckMenuVisible(true);
    setContextMenuPosition({ x: clientX, y: clientY });
    setMenuDeckId(deckId);
  };
  const handleCardRightCLick = (clientX, clientY, card) => {
    setCardMenuVisible(true);
    setContextMenuPosition({ x: clientX, y: clientY });
    setCardMenuCard(card);
  };
  useEffect(() => {
    function handleMouseMove(e) {
      setPointerPos({ x: e.clientX, y: e.clientY });
    }

    if (draggingCard && dragSource === "deckSearch") {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [draggingCard, dragSource]);
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
          <GameCanvas
            stageRef={stageRef}
            windowSize={windowSize}
            stageScale={stageScale}
            stagePosition={stagePosition}
            handleDragEnd={handleDragEnd}
            handleWheel={handleWheel}
            onMouseDown={dragMouseDown}
            onMouseUp={dragMouseUp}
            onMouseMove={(e) => {
              dragMouseMove(e);
              stageMouseMove(e);
            }}
            cards={cards}
            decks={decks}
            setDecks={setDecks}
            draggingCard={draggingCard}
            dragPos={dragPos}
            handSizes={handSizes}
            positions={positions}
            setCards={setCards}
            setHand={setHand}
            stageDraggable={stageDraggable}
            ignoreNextChange={ignoreNextChange}
            cardBackImage={cardBackImage}
            username={username}
            setStagePosition={setStagePosition}
            tapCard={tapCard}
            onDeckRightClick={handleDeckRightClick}
            onCardRightClick={handleCardRightCLick}
            dragSource={dragSource}
            getCardMouseDownHandler={getCardMouseDownHandler}
          />
          <Hand
            hand={hand}
            setHoveredCard={setHoveredCard}
            setHoveredHandCard={setHoveredHandCard}
            getCardMouseDownHandler={getCardMouseDownHandler}
          />
        </div>
        {searchModalVisible && (
          <DeckSearchModal
            deckId={searchDeckId}
            decks={decks}
            onClose={() => setSearchModalVisible(false)}
            setHoveredCard={setHoveredCard}
            getCardMouseDownHandler={getCardMouseDownHandler}
          />
        )}
        {draggingCard && dragSource === "deckSearch" && hasMoved && (
          <img
            src={draggingCard.imageUrl}
            alt={draggingCard.name}
            style={{
              position: "fixed",
              pointerEvents: "none",
              top: pointerPos.y - 45,
              left: pointerPos.x - 32,
              width: 64,
              borderRadius: 8,
              zIndex: 11000,
              opacity: 0.8,
              userSelect: "none",
            }}
          />
        )}
        <div className={`hover-preview ${hoveredCard ? "" : "hidden"}`}>
          {hoveredCard && (
            <>
              <img src={hoveredCard?.imageUrl} alt={hoveredCard?.name} />
            </>
          )}
        </div>
        {deckMenuVisible && (
          <div
            style={{
              position: "absolute",
              top: contextMenuPosition.y,
              left: contextMenuPosition.x,
              backgroundColor: "black",
              border: "1px solid #ccc",
              padding: "6px",
              zIndex: 9999,
            }}
            onMouseLeave={() => setDeckMenuVisible(false)}
          >
            <div
              style={{ cursor: "pointer" }}
              onClick={() => {
                console.log("Search clicked for deck", menuDeckId);
                setDeckMenuVisible(false);
                setSearchDeckId(menuDeckId);
                setSearchModalVisible(true);
              }}
            >
              🔍 Search
            </div>
          </div>
        )}
        {cardMenuVisible && (
          <div
            style={{
              position: "absolute",
              top: contextMenuPosition.y,
              left: contextMenuPosition.x,
              backgroundColor: "black",
              border: "1px solid #ccc",
              padding: "6px",
              zIndex: 9999,
            }}
            onMouseLeave={() => setCardMenuVisible(false)}
          >
            <div
              style={{ cursor: "pointer" }}
              onClick={() => {
                console.log("tokens clicked on ", cardMenuCard);
                setCardMenuVisible(false);
              }}
            >
              ➕ Tokens
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Room;
