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
import DeckCardViewer from "./DeckCardViewer";
import { sendMessage } from "../ws";
import { remapPositions } from "../utils/playerOrientation";
import { useCardImagePreloader } from "../hooks/useCardImagePreloader";
import CardToDeckMenu from "./CardToDeckMenu";
import CardContextMenu from "./CardContextMenu";
import DeckContextMenu from "./DeckContextMenu";
import DraggingCardImage from "./DraggingCardImage";
import HoveredCardPreview from "./HoveredCardPreview";
import PassTurnButton from "./PassTurnButton";
import UntapAllButton from "./UntapAllButton";
import { useCardFlipHotkey } from "../hooks/useCardFlipHotkey";
import { updateCardTokens } from "../utils/cardUtils";
import { updateDeckTokens } from "../utils/deckUtils";
import BoardContextMenu from "./BoardContextMenu";
import ScryModal from "./ScryModal";
import SurveilModal from "./SurveilModal";
import DiceRollerPanel from "./DiceRollerPanel";

function Room() {
  const [username] = useState(() => localStorage.getItem("username"));
  const [spectator, setSpectator] = useState(null);
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
  const [deckCardViewerVisible, setDeckCardViewerVisible] = useState(false);
  const [contextMenuDeckId, setContextMenuDeckId] = useState(null);
  const [scryData, setScryData] = useState(null); // { deckId, count }
  const [surveilData, setSurveilData] = useState(null); // { deckId, count }
  const [peekCardsData, setPeekCardsData] = useState({
    cards: [],
    position: "",
  });
  const [boardMenuVisible, setBoardMenuVisible] = useState(false);
  const [boardMenuPosition, setBoardMenuPosition] = useState({ x: 0, y: 0 });
  const [cardMenuCard, setCardMenuCard] = useState(null);
  const [counters, setCounters] = useState({});
  const [hoveredCounterId, setHoveredCounterId] = useState(null);
  const [hoveredDiceRollerId, setHoveredDiceRollerId] = useState(null);
  const { roomId } = useParams();
  const [hasJoined, setHasJoined] = useState(false);
  const { showSpinner, minLoadingDone } = useLoadingFade(hasJoined);
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState({});
  const [hand, setHand] = useState([]);
  const [draggingCard, setDraggingCard] = useState(null);
  const [dragSource, setDragSource] = useState(null);
  const [hoveredHandCard, setHoveredHandCard] = useState(null);
  const [hoveredDeckCardViewerCard, setHoveredDeckCardViewerCard] =
    useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const [turn, setTurn] = useState("");
  const [handSizes, setHandSizes] = useState({});
  const [cardBackImage] = useImage("/defaultCardBack.jpg");
  const [diceRollerVisible, setDiceRollerVisible] = useState(false);
  const [diceRollers, setDiceRollers] = useState({});
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
    hoveredDeckCardViewerCard,
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
    if (dragSource === "deckCardViewer") {
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
    setHandSizes,
    username,
    ignoreNextChange,
    decks,
    setDecks,
    contextMenuDeckId,
    isRotated,
    cardDraggedToDeckMenu,
    setPeekCardsData,
    spectator,
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
    setDiceRollers,
    setSpectator,
  });
  const handleDeckRightClick = (clientX, clientY, deckId) => {
    if (spectator) return;
    rightClickHandledRef.current = true;
    setDeckMenuVisible(true);
    setContextMenuPosition({ x: clientX - 2, y: clientY - 113 });
    setContextMenuDeckId(deckId);
  };
  const handleCardRightCLick = (clientX, clientY, card) => {
    if (spectator) return;
    rightClickHandledRef.current = true;
    setCardMenuVisible(true);
    setContextMenuPosition({ x: clientX - 2, y: clientY - 1 });
    setCardMenuCard(card);
  };
  const handleStageRightClick = (e) => {
    if (spectator) return;
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
    spectator,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (spectator) return;
      if (e.key === "d" && hoveredCounterId != null) {
        setCounters((prev) => {
          const newCounters = { ...prev };
          delete newCounters[hoveredCounterId];
          return newCounters;
        });
        sendMessage({ type: "DELETE_COUNTER", id: hoveredCounterId });
        setHoveredCounterId(null);
      } else if (e.key === "d" && hoveredDiceRollerId != null) {
        setDiceRollers((prev) => {
          const newDiceRollers = { ...prev };
          delete newDiceRollers[hoveredDiceRollerId];
          return newDiceRollers;
        });
        sendMessage({ type: "DELETE_DICE_ROLLER", id: hoveredDiceRollerId });
        setHoveredDiceRollerId(null);
      }
    };
    const container = stageRef.current?.getStage()?.container();
    if (container) {
      container.style.cursor =
        hoveredCounterId != null || hoveredDiceRollerId != null
          ? "pointer"
          : "default";
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hoveredCounterId, hoveredDiceRollerId]);

  useEffect(() => {
    if (!(draggingCard && dragSource === "deckCardViewer")) return;
    function handleMouseMove(e) {
      setPointerPos({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [draggingCard, dragSource]);

  useEffect(() => {
    //clear ui if scrying/surveiling/searching deck of leaving player
    if (contextMenuDeckId && !decks[contextMenuDeckId]) {
      setSurveilData(null);
      setScryData(null);
      setContextMenuDeckId(null);
      setDeckCardViewerVisible(false);
      setPeekCardsData({ cards: [], position: "" });
    }
  }, [decks, contextMenuDeckId]);

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
            setHandSizes={setHandSizes}
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
            diceRollers={diceRollers}
            hoveredDiceRollerId={hoveredDiceRollerId}
            setHoveredDiceRollerId={setHoveredDiceRollerId}
            spectator={spectator}
          />
          <Hand
            hand={hand}
            setHoveredCard={setHoveredCard}
            setHoveredHandCard={setHoveredHandCard}
            getCardMouseDownHandler={getCardMouseDownHandler}
          />
          {turn === username && (
            <>
              <PassTurnButton
                onClick={() => {
                  setTurn("");
                  sendMessage({ type: "PASS_TURN" });
                }}
              />
              <UntapAllButton
                onClick={() => {
                  sendMessage({ type: "UNTAP_ALL" });
                  setCards((prev) =>
                    prev.map((card) =>
                      card.owner === username
                        ? { ...card, tapped: false }
                        : card
                    )
                  );
                }}
              />
            </>
          )}
        </div>
        {deckCardViewerVisible && contextMenuDeckId && (
          <DeckCardViewer
            deckId={contextMenuDeckId}
            decks={decks}
            onClose={() => setDeckCardViewerVisible(false)}
            setHoveredDeckCardViewerCard={setHoveredDeckCardViewerCard}
            getCardMouseDownHandler={getCardMouseDownHandler}
            draggingCard={draggingCard}
          />
        )}
        {peekCardsData.cards.length > 0 && contextMenuDeckId && (
          <DeckCardViewer
            deckId={contextMenuDeckId}
            decks={decks}
            onClose={() => setPeekCardsData({ cards: [], position: "" })}
            setHoveredDeckCardViewerCard={setHoveredDeckCardViewerCard}
            getCardMouseDownHandler={getCardMouseDownHandler}
            draggingCard={draggingCard}
            peekCardsData={peekCardsData}
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
          deckId={contextMenuDeckId}
          decks={decks}
          onClose={() => setDeckMenuVisible(false)}
          onSearch={(deckId) => {
            console.log("Search clicked for deck", deckId);
            setDeckCardViewerVisible(true);
          }}
          setScryData={setScryData}
          setSurveilData={setSurveilData}
          setPeekCardsData={setPeekCardsData}
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
            const rotatedX = isRotated ? -mousePos.x - 20 : mousePos.x - 20;
            const rotatedY = isRotated ? -mousePos.y - 20 : mousePos.y - 20;
            const newCounter = {
              id: newId,
              x: rotatedX,
              y: rotatedY,
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
          onRollDice={() => {
            setDiceRollerVisible(true);
          }}
        />
        {scryData && contextMenuDeckId && decks[contextMenuDeckId] && (
          <ScryModal
            deck={decks[scryData.deckId]}
            count={scryData.count}
            onClose={() => setScryData(null)}
            setDecks={setDecks}
            setHoveredDeckCardViewerCard={setHoveredDeckCardViewerCard}
          />
        )}
        {surveilData && contextMenuDeckId && decks[contextMenuDeckId] && (
          <SurveilModal
            deck={decks[surveilData.deckId]}
            count={surveilData.count}
            onClose={() => setSurveilData(null)}
            setDecks={setDecks}
            setHoveredDeckCardViewerCard={setHoveredDeckCardViewerCard}
            setCards={setCards}
            isRotated={isRotated}
          />
        )}
        {diceRollerVisible && (
          <DiceRollerPanel
            isRotated={isRotated}
            onSpawn={(numDice, numSides) => {
              const newDiceRoller = {
                id: Date.now().toString(),
                x: 0,
                y: 0,
                numDice,
                numSides,
              };
              setDiceRollers((prev) => ({
                ...prev,
                [newDiceRoller.id]: newDiceRoller,
              }));
              sendMessage({
                type: "ADD_DICE_ROLLER",
                diceRollers: [newDiceRoller],
              });
            }}
            onClose={() => {
              setDiceRollerVisible(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Room;
