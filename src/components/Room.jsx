import { useState, useRef } from "react";
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
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchDeckCards, setSearchDeckCards] = useState([]);
  const [menuDeckId, setMenuDeckId] = useState(null);
  const { roomId } = useParams();
  const [hasJoined, setHasJoined] = useState(false);
  const { showSpinner, minLoadingDone } = useLoadingFade(hasJoined);
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [hand, setHand] = useState([]);
  const [draggingCard, setDraggingCard] = useState(null);
  const [hoveredHandCard, setHoveredHandCard] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const [handSizes, setHandSizes] = useState({});
  const [cardBackImage] = useImage("/defaultCardBack.jpg");
  const [positions, setPositions] = useState({});
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [mousePos, onMouseMove] = useStageMousePos();
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
  useCardImagePreloader(decks);
  const { tapCard } = useCardTap(setCards);
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
    ignoreNextChange,
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
  const handleDeckRightClick = (clientX, clientY, deckId) => {
    setMenuVisible(true);
    setMenuPosition({ x: clientX, y: clientY });
    setMenuDeckId(deckId);
  };

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
            onMouseMove={onMouseMove}
            cards={cards}
            decks={decks}
            draggingCard={draggingCard}
            dragPos={dragPos}
            handSizes={handSizes}
            positions={positions}
            setCards={setCards}
            setHand={setHand}
            ignoreNextChange={ignoreNextChange}
            cardBackImage={cardBackImage}
            username={username}
            setDecks={setDecks}
            setStagePosition={setStagePosition}
            tapCard={tapCard}
            onDeckRightClick={handleDeckRightClick}
          />
          <Hand
            hand={hand}
            draggingCard={draggingCard}
            setDraggingCard={setDraggingCard}
            setDragPos={setDragPos}
            setHoveredCard={setHoveredCard}
            setHoveredHandCard={setHoveredHandCard}
          />
        </div>
        {searchModalVisible && (
          <DeckSearchModal
            cards={searchDeckCards}
            onClose={() => setSearchModalVisible(false)}
          />
        )}
        <div className={`hover-preview ${hoveredCard ? "" : "hidden"}`}>
          {hoveredCard && (
            <>
              <img src={hoveredCard?.imageUrl} alt={hoveredCard?.name} />
            </>
          )}
        </div>
        {menuVisible && (
          <div
            style={{
              position: "absolute",
              top: menuPosition.y,
              left: menuPosition.x,
              backgroundColor: "white",
              border: "1px solid #ccc",
              padding: "6px",
              zIndex: 9999,
            }}
            onMouseLeave={() => setMenuVisible(false)}
          >
            <div
              style={{ cursor: "pointer" }}
              onClick={() => {
                console.log("Search clicked for deck", menuDeckId);
                setMenuVisible(false);

                // Find the deck by id and get cards
                const deck = decks.find((d) => d.id === menuDeckId);
                if (deck) {
                  setSearchDeckCards(deck.Cards || deck.cards || []); // Adjust key if needed
                  setSearchModalVisible(true);
                }
              }}
            >
              🔍 Search
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Room;
