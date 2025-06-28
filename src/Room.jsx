import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Stage, Layer } from "react-konva";
import { connectToRoom, disconnect, setOnMessageHandler } from "./ws";
import { useParams } from "react-router-dom";
import Card from "./components/Card";
import Deck from "./components/Deck";
import Hand from "./components/Hand";
import OpponentHand from "./components/OpponentHand";
import BoardBackground from "./components/BoardBackground";
import { useCardImagePreloader } from "./hooks/useCardImagePreloader";
import useImage from "use-image";
import { sendMessage } from "./ws";

const username = localStorage.getItem("username");
const cardWidth = 64;
const cardHeight = 89;

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
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const prevImageUrlsRef = useRef(new Set());

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

  const size = 5000;
  useEffect(() => {
    const timer = setTimeout(() => setShowSpinner(true), 10);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (hasJoined) {
      const timer = setTimeout(() => setShowRoom(true), 10);
      return () => clearTimeout(timer);
    }
  }, [hasJoined]);
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadingDone(true), 500);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const onMouseMove = (e) => {
      if (draggingCard) {
        const stage = canvasRef.current?.getBoundingClientRect();
        if (stage) {
          const x =
            (e.clientX - stage.left - stagePosition.x) / stageScale -
            cardWidth / 2;
          const y =
            (e.clientY - stage.top - stagePosition.y) / stageScale -
            cardHeight / 2;
          setDragPos({ x, y });
        }
      }
    };
    const onMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onMouseUp = (e) => {
      if (draggingCard) {
        const rect = canvasRef.current?.getBoundingClientRect();
        const isInsideCanvas =
          rect &&
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (isInsideCanvas) {
          const x =
            (e.clientX - rect.left - stagePosition.x) / stageScale -
            cardWidth / 2;
          const y =
            (e.clientY - rect.top - stagePosition.y) / stageScale -
            cardHeight / 2;

          const card = draggingCard;
          setCards((prev) => [...prev, { ...card, x, y }]);
          setHand((prev) => prev.filter((c) => c.id !== card.id));
          sendMessage({
            type: "CARD_PLAYED",
            card: { ...card, x, y },
            player: username,
          });
        }
        setDraggingCard(null);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [draggingCard]);

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
        setHandSizes(message.handSizes);
      } else if (message.type === "MOVE_CARD") {
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === message.id
              ? { ...card, x: message.x, y: message.y }
              : card
          )
        );
      } else if (message.type === "USER_JOINED") {
        setDecks(Object.values(message.decks));
        setPositions(message.positions);
        if (message.users.includes(username)) {
          setHasJoined(true);
        }
      } else if (message.type === "CARD_DRAWN") {
        setHand((prev) => [...prev, message.card]);
      } else if (message.type === "PLAYER_DREW_CARD") {
        setHandSizes((prev) => ({
          ...prev,
          [message.player]: message.handSize,
        }));
      } else if (message.type === "CARD_PLAYED") {
        setCards((prev) => [...prev, message.card]);
        setHandSizes((prev) => ({
          ...prev,
          [message.player]: message.handSize,
        }));
      } else if (message.type === "USER_LEFT") {
        setPositions(message.positions);
        setDecks((prevDecks) =>
          prevDecks.filter((deck) => deck.id !== message.user)
        );
        setHandSizes((prevSizes) => {
          const updated = { ...prevSizes };
          delete updated[message.user];
          return updated;
        });
      } else if (message.type === "ERROR") {
        alert(message.reason);
        disconnect();
        navigate("/");
      }
    });
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      disconnect();
    };
  }, [roomId]);

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
        <div className="player-bar player-bar-top">
          <div className="player-half">
            {
              Object.entries(positions).find(
                ([_, pos]) => pos === "topLeft"
              )?.[0]
            }
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
              <Card key={card.id} card={card} />
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
