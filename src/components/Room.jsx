import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Hand from "./Hand";
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
import { sendMessage } from "../ws";
import { remapPositions } from "../utils/playerOrientation";
import { useCardImagePreloader } from "../hooks/useCardImagePreloader";
import CardToDeckMenu from "./CardToDeckMenu";
import CardContextMenu from "./CardContextMenu";
import DeckContextMenu from "./DeckContextMenu";
import DraggingCardImage from "./DraggingCardImage";
import HoveredCardPreview from "./HoveredCardPreview";
import PassTurnButton from "./PassTurnButton";
import { useCardFlipHotkey } from "../hooks/useCardFlipHotkey";
import { updateCardTokens } from "../utils/cardUtils";
import { updateDeckTokens } from "../utils/deckUtils";
import BoardContextMenu from "./BoardContextMenu";

function Room() {
  const [username] = useState(() => localStorage.getItem("username"));
  const navigate = useNavigate();
  const stageRef = useRef();
  const [lifeTotals, setLifeTotals] = useState({});
  const rightClickHandledRef = useRef(false);
  const [deckMenuVisible, setDeckMenuVisible] = useState(false);
  const [cardMenuVisible, setCardMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchDeckId, setSearchDeckId] = useState(null);
  const [menuDeckId, setMenuDeckId] = useState(null);
  const [boardMenuVisible, setBoardMenuVisible] = useState(false);
  const [boardMenuPosition, setBoardMenuPosition] = useState({ x: 0, y: 0 });
  const [cardMenuCard, setCardMenuCard] = useState(null);
  const [counters, setCounters] = useState([]);
  const [hoveredCounterId, setHoveredCounterId] = useState(null);
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
  const [turn, setTurn] = useState("");
  const [handSizes, setHandSizes] = useState({});
  const [cardBackImage] = useImage("/defaultCardBack.jpg");
  const [positions, setPositions] = useState({});
  const { remappedPositions, isRotated } = useMemo(() => {
    return remapPositions(username, positions);
  }, [username, positions]);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const mousePos = useStageMousePos(stageRef);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [cardDraggedToDeckMenuVisible, setCardDraggedToDeckMenuVisible] =
    useState(false);
  const [cardDraggedToDeck, setCardDraggedToDeck] = useState(null);
  const [cardDraggedToDeckMenuDeckId, setCardDraggedToDeckMenuDeckId] =
    useState(null);
  const [cardDraggedToDeckMenuPosition, setCardDraggedToDeckMenuPosition] =
    useState({ x: 0, y: 0 });
  const { hoveredCard, setHoveredCard, ignoreNextChange } = useHoveredCard(
    mousePos,
    cards,
    draggingCard,
    hoveredHandCard,
    isRotated
  );
  const { handleWheel, handleDragEnd } = useStageEvents(
    setStageScale,
    setStagePosition
  );
  const windowSize = useWindowSize();
  useCardImagePreloader(
    positions,
    decks,
    Object.values(cards),
    (uid, tokens) => {
      setCards((prev) => updateCardTokens(prev, uid, tokens));
      setDecks((prev) => updateDeckTokens(prev, uid, tokens));
    }
  );
  function cardDraggedToDeckMenu(card, deckId, position) {
    if (dragSource === "deckSearch") {
      return;
    }
    setCardDraggedToDeck(card);
    setCardDraggedToDeckMenuDeckId(deckId);
    setCardDraggedToDeckMenuPosition(position);
    setCardDraggedToDeckMenuVisible(true);
  }
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
    decks,
    setDecks,
    searchDeckId,
    isRotated,
    cardDraggedToDeckMenu,
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
    setLifeTotals,
    setTurn,
    setCounters,
  });
  const handleDeckRightClick = (clientX, clientY, deckId) => {
    rightClickHandledRef.current = true;
    setDeckMenuVisible(true);
    setContextMenuPosition({ x: clientX - 2, y: clientY - 1 });
    setMenuDeckId(deckId);
  };
  const handleCardRightCLick = (clientX, clientY, card) => {
    rightClickHandledRef.current = true;
    setCardMenuVisible(true);
    setContextMenuPosition({ x: clientX - 2, y: clientY - 1 });
    setCardMenuCard(card);
  };
  const handleStageRightClick = (e) => {
    if (rightClickHandledRef.current) {
      rightClickHandledRef.current = false;
      return;
    }
    e.evt.preventDefault();
    setBoardMenuPosition({ x: e.evt.clientX - 2, y: e.evt.clientY - 1 });
    setBoardMenuVisible(true);
    setCardMenuVisible(false);
    setDeckMenuVisible(false);
  };
  useCardFlipHotkey({
    hoveredCard,
    draggingCard,
    setDraggingCard,
    setHoveredCard,
    setCards,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "d" && hoveredCounterId != null) {
        console.log("Deleting counter:", hoveredCounterId);
        setCounters((prev) => {
          const newCounters = { ...prev };
          delete newCounters[hoveredCounterId];
          return newCounters;
        });
        sendMessage({ type: "DELETE_COUNTER", id: hoveredCounterId });
        setHoveredCounterId(null);
      }
    };
    const container = stageRef.current?.getStage()?.container();
    if (container) {
      container.style.cursor = hoveredCounterId != null ? "pointer" : "default";
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hoveredCounterId]);

  useEffect(() => {
    if (!(draggingCard && dragSource === "deckSearch")) return;
    function handleMouseMove(e) {
      setPointerPos({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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
            lifeTotals={lifeTotals}
            setLifeTotals={setLifeTotals}
            remappedPositions={remappedPositions}
            isRotated={isRotated}
            turn={turn}
            defaultCardBackImage={cardBackImage}
            onStageRightClick={handleStageRightClick}
            counters={counters}
            setCounters={setCounters}
            hoveredCounterId={hoveredCounterId}
            setHoveredCounterId={setHoveredCounterId}
          />
          <Hand
            hand={hand}
            setHoveredCard={setHoveredCard}
            setHoveredHandCard={setHoveredHandCard}
            getCardMouseDownHandler={getCardMouseDownHandler}
          />
          {turn === username && (
            <PassTurnButton
              onClick={() => {
                setTurn("");
                sendMessage({ type: "PASS_TURN" });
              }}
            />
          )}
        </div>
        {searchModalVisible && (
          <DeckSearchModal
            deckId={searchDeckId}
            decks={decks}
            onClose={() => setSearchModalVisible(false)}
            setHoveredCard={setHoveredCard}
            getCardMouseDownHandler={getCardMouseDownHandler}
            draggingCard={draggingCard}
          />
        )}
        <DraggingCardImage
          draggingCard={draggingCard}
          dragSource={dragSource}
          hasMoved={hasMoved}
          pointerPos={pointerPos}
        />
        <HoveredCardPreview hoveredCard={hoveredCard} />
        <DeckContextMenu
          visible={deckMenuVisible}
          position={contextMenuPosition}
          deckId={menuDeckId}
          onClose={() => setDeckMenuVisible(false)}
          onSearch={(deckId) => {
            console.log("Search clicked for deck", deckId);
            setSearchDeckId(deckId);
            setSearchModalVisible(true);
          }}
        />
        <CardContextMenu
          visible={cardMenuVisible}
          card={cardMenuCard}
          position={contextMenuPosition}
          canvasRef={canvasRef}
          stageScale={stageScale}
          stagePosition={stagePosition}
          isRotated={isRotated}
          setCards={setCards}
          setHoveredCard={setHoveredCard}
          onClose={() => setCardMenuVisible(false)}
        />
        <CardToDeckMenu
          visible={cardDraggedToDeckMenuVisible}
          card={cardDraggedToDeck}
          deckId={cardDraggedToDeckMenuDeckId}
          position={cardDraggedToDeckMenuPosition}
          dragSource={dragSource}
          setCards={setCards}
          setHand={setHand}
          setDecks={setDecks}
          onClose={() => setCardDraggedToDeckMenuVisible(false)}
        />
        <BoardContextMenu
          visible={boardMenuVisible}
          position={boardMenuPosition}
          onClose={() => setBoardMenuVisible(false)}
          onAddCounter={() => {
            const newId = Date.now().toString();
            const newCounter = {
              id: newId,
              x: mousePos.x - 20,
              y: mousePos.y - 20,
              count: 1,
              owner: username,
            };
            setCounters((prev) => ({
              ...prev,
              [newCounter.id]: newCounter,
            }));
            sendMessage({ type: "ADD_COUNTER", counters: [newCounter] });
            setHoveredCounterId(newId);
            setBoardMenuVisible(false);
          }}
        />
      </div>
    </div>
  );
}

export default Room;
