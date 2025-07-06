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

function Room() {
  const [username] = useState(() => localStorage.getItem("username"));
  const navigate = useNavigate();
  const stageRef = useRef();
  const [lifeTotals, setLifeTotals] = useState({});
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
  const [turn, setTurn] = useState("");
  const [handSizes, setHandSizes] = useState({});
  const [cardBackImage] = useImage("/defaultCardBack.jpg");
  const [positions, setPositions] = useState({});
  const { remappedPositions, isRotated } = useMemo(() => {
    return remapPositions(username, positions);
  }, [username, positions]);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [mousePos, stageMouseMove] = useStageMousePos();
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
      setCards((prev) =>
        prev.map((card) => (card.uid === uid ? { ...card, tokens } : card))
      );
      setDecks((prev) => {
        const updatedDecks = { ...prev };
        for (const [deckId, deck] of Object.entries(updatedDecks)) {
          const updatedCards = (deck.cards || []).map((card) =>
            card.uid === uid ? { ...card, tokens } : card
          );
          const updatedCommanders = (deck.commanders || []).map((card) =>
            card.uid === uid ? { ...card, tokens } : card
          );
          updatedDecks[deckId] = {
            ...deck,
            cards: updatedCards,
            commanders: updatedCommanders,
          };
        }
        return updatedDecks;
      });
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
    cards,
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
  });
  const handleDeckRightClick = (clientX, clientY, deckId) => {
    setDeckMenuVisible(true);
    setContextMenuPosition({ x: clientX - 2, y: clientY - 1 });
    setMenuDeckId(deckId);
  };
  const handleCardRightCLick = (clientX, clientY, card) => {
    setCardMenuVisible(true);
    setContextMenuPosition({ x: clientX - 2, y: clientY - 1 });
    setCardMenuCard(card);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "f" || event.key === "F") {
        if (!hoveredCard) return;
        const cardId = hoveredCard.id;
        setCards((prevCards) => {
          let newFlipState = false;
          const updated = prevCards.map((card) => {
            if (card.id === cardId) {
              newFlipState = !card.flipped;
              return { ...card, flipped: newFlipState };
            }
            return card;
          });
          sendMessage({
            type: "FLIP_CARD",
            id: cardId,
            flipped: newFlipState,
          });

          return updated;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hoveredCard, setCards]);

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
            lifeTotals={lifeTotals}
            setLifeTotals={setLifeTotals}
            remappedPositions={remappedPositions}
            isRotated={isRotated}
            turn={turn}
          />
          <Hand
            hand={hand}
            setHoveredCard={setHoveredCard}
            setHoveredHandCard={setHoveredHandCard}
            getCardMouseDownHandler={getCardMouseDownHandler}
          />
          {turn === username && (
            <div
              onClick={() => {
                setTurn(""); //disables button
                sendMessage({ type: "PASS_TURN" });
              }}
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                backgroundColor: "#333",
                color: "white",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                userSelect: "none",
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              Pass Turn
            </div>
          )}
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
        {cardMenuVisible && cardMenuCard && (
          <div
            style={{
              position: "absolute",
              top: contextMenuPosition.y,
              left: contextMenuPosition.x,
              backgroundColor: "black",
              border: "1px solid #ccc",
              padding: "6px",
              zIndex: 9999,
              minWidth: "120px",
            }}
            onMouseLeave={() => setCardMenuVisible(false)}
          >
            {/* Placeholder item */}
            <div
              style={{ cursor: "pointer", padding: "4px 8px" }}
              onClick={() => {
                console.log("Test clicked");
                setCardMenuVisible(false);
              }}
            >
              🧪 Test
            </div>

            {/* Token entries, if available */}
            {cardMenuCard.tokens?.length > 0 &&
              cardMenuCard.tokens.map((token) => (
                <div
                  key={token.id}
                  style={{
                    cursor: "pointer",
                    padding: "4px 8px",
                    whiteSpace: "nowrap",
                  }}
                  onClick={(e) => {
                    console.log("Spawn token clicked:", token);
                    setCardMenuVisible(false);
                    const rect = canvasRef.current?.getBoundingClientRect();
                    const canvasX = e.clientX - rect.left;
                    const canvasY = e.clientY - rect.top;
                    const worldX =
                      canvasX / stageScale - stagePosition.x / stageScale;
                    const worldY =
                      canvasY / stageScale - stagePosition.y / stageScale;
                    var x = worldX - 64 / 2;
                    var y = worldY - 89 / 2;
                    if (isRotated) {
                      x = -x - 64;
                      y = -y - 89;
                    }
                    const uniqueID = `${token.id}-${Math.random()
                      .toString(36)
                      .substring(2, 6)}`;
                    const newToken = {
                      id: uniqueID,
                      name: token.name,
                      imageUrl: token.imageUrl,
                      x: x,
                      y: y,
                      owner: localStorage.getItem("username"),
                      tapped: false,
                    };
                    setCards((prev) => [...prev, newToken]);
                    setHoveredCard(newToken);
                    sendMessage({
                      type: "SPAWN_TOKEN",
                      card: newToken,
                    });
                  }}
                >
                  ➕ {token.name}
                </div>
              ))}
          </div>
        )}
        {cardDraggedToDeckMenuVisible && cardDraggedToDeck && (
          <div
            style={{
              position: "absolute",
              top: cardDraggedToDeckMenuPosition.y - 1,
              left: cardDraggedToDeckMenuPosition.x - 2,
              backgroundColor: "black",
              border: "1px solid #ccc",
              padding: "6px",
              zIndex: 9999,
              minWidth: "160px",
            }}
            onMouseLeave={() => setCardDraggedToDeckMenuVisible(false)}
          >
            <div
              style={{ cursor: "pointer", padding: "4px 8px" }}
              onClick={() => {
                console.log("Return to top of deck:", cardDraggedToDeck);
                setDecks((prev) => {
                  const newDecks = { ...prev };
                  const targetDeck = [
                    ...(newDecks[cardDraggedToDeckMenuDeckId]?.cards || []),
                  ];
                  newDecks[cardDraggedToDeckMenuDeckId].cards = [
                    cardDraggedToDeck,
                    ...targetDeck,
                  ];
                  return newDecks;
                });
                console.log(hand);
                setHand((prev) =>
                  prev.filter((c) => c.id !== cardDraggedToDeck.id)
                );
                if (dragSource === "board") {
                  setCards((prev) =>
                    prev.filter((c) => c.id !== cardDraggedToDeck.id)
                  );
                }
                sendMessage({
                  type: "CARD_TO_TOP_OF_DECK",
                  username: cardDraggedToDeckMenuDeckId,
                  source: dragSource,
                  card: {
                    id: cardDraggedToDeck.id,
                    name: cardDraggedToDeck.name,
                    imageUrl: cardDraggedToDeck.imageUrl,
                    imageUrlBack: cardDraggedToDeck.imageUrlBack,
                    uid: cardDraggedToDeck.uid,
                    hasTokens: cardDraggedToDeck.hasTokens,
                    x: 0,
                    y: 0,
                    tapped: false,
                  },
                });
                setCardDraggedToDeckMenuVisible(false);
              }}
            >
              ⬆️ Top of Deck
            </div>
            <div
              style={{ cursor: "pointer", padding: "4px 8px" }}
              onClick={() => {
                setHand((prev) =>
                  prev.filter((c) => c.id !== cardDraggedToDeck.id)
                );
                if (dragSource === "board") {
                  setCards((prev) =>
                    prev.filter((c) => c.id !== cardDraggedToDeck.id)
                  );
                }
                sendMessage({
                  type: "CARD_TO_SHUFFLE_IN_DECK",
                  username: cardDraggedToDeckMenuDeckId,
                  source: dragSource,
                  card: {
                    id: cardDraggedToDeck.id,
                    name: cardDraggedToDeck.name,
                    imageUrl: cardDraggedToDeck.imageUrl,
                    imageUrlBack: cardDraggedToDeck.imageUrlBack,
                    uid: cardDraggedToDeck.uid,
                    hasTokens: cardDraggedToDeck.hasTokens,
                    x: 0,
                    y: 0,
                    tapped: false,
                  },
                });
                setCardDraggedToDeckMenuVisible(false);
              }}
            >
              🔀 Shuffle Into Deck
            </div>
            <div
              style={{ cursor: "pointer", padding: "4px 8px" }}
              onClick={() => {
                setDecks((prev) => {
                  const newDecks = { ...prev };
                  const targetDeck = [
                    ...(newDecks[cardDraggedToDeckMenuDeckId]?.cards || []),
                  ];
                  newDecks[cardDraggedToDeckMenuDeckId].cards = [
                    ...targetDeck,
                    cardDraggedToDeck,
                  ];
                  return newDecks;
                });
                setHand((prev) =>
                  prev.filter((c) => c.id !== cardDraggedToDeck.id)
                );
                if (dragSource === "board") {
                  setCards((prev) =>
                    prev.filter((c) => c.id !== cardDraggedToDeck.id)
                  );
                }
                sendMessage({
                  type: "CARD_TO_BOTTOM_OF_DECK",
                  username: cardDraggedToDeckMenuDeckId,
                  source: dragSource,
                  card: {
                    id: cardDraggedToDeck.id,
                    name: cardDraggedToDeck.name,
                    imageUrl: cardDraggedToDeck.imageUrl,
                    imageUrlBack: cardDraggedToDeck.imageUrlBack,
                    uid: cardDraggedToDeck.uid,
                    hasTokens: cardDraggedToDeck.hasTokens,
                    x: 0,
                    y: 0,
                    tapped: false,
                  },
                });
                setCardDraggedToDeckMenuVisible(false);
              }}
            >
              ⬇️ Bottom of Deck
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Room;
