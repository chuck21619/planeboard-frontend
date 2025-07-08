import { Stage, Layer } from "react-konva";
import Card from "./Card";
import Deck from "./Deck";
import OpponentHand from "./OpponentHand";
import BoardBackground from "./BoardBackground";
import { getCardRotation } from "../utils/cardOrientation";

export default function GameCanvas({
  stageRef,
  windowSize,
  stageScale,
  stagePosition,
  handleDragEnd,
  handleWheel,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  cards,
  decks,
  setDecks,
  draggingCard,
  dragPos,
  handSizes,
  positions,
  cardBackImage,
  username,
  setHand,
  setStagePosition,
  tapCard,
  onDeckRightClick,
  onCardRightClick,
  getCardMouseDownHandler,
  dragSource,
  stageDraggable,
  lifeTotals,
  setLifeTotals,
  remappedPositions,
  isRotated,
  turn,
  defaultCardBackImage,
  onStageRightClick,
}) {
  const viewerPosition = positions[username];

  return (
    <Stage
      ref={stageRef}
      width={windowSize.width}
      height={windowSize.height}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stagePosition.x}
      y={stagePosition.y}
      draggable={stageDraggable}
      onDragEnd={(e) => handleDragEnd(e, setStagePosition)}
      onWheel={(e) => handleWheel(e, stagePosition, stageScale)}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onContextMenu={(e) => {
        console.log("TESTSET");
        e.evt.preventDefault();
        if (typeof onStageRightClick === "function") {
          onStageRightClick(e);
        }
      }}
    >
      <Layer>
        <BoardBackground
          positions={positions}
          isRotated={isRotated}
          lifeTotals={lifeTotals}
          setLifeTotals={setLifeTotals}
          turn={turn}
        />
      </Layer>

      <Layer>
        {Object.entries(handSizes).map(([playerName, count]) => {
          if (playerName === username) return null;
          return (
            <OpponentHand
              key={playerName}
              count={count}
              quadrant={remappedPositions[playerName]}
              cardBackImage={cardBackImage}
            />
          );
        })}
      </Layer>

      <Layer>
        {draggingCard && dragSource !== "deckSearch" && (
          <Card
            card={{ ...draggingCard, x: dragPos.x, y: dragPos.y }}
            defaultCardBackImage={defaultCardBackImage}
            rotation={draggingCard.rotation}
            isGhost
          />
        )}
        {cards.map((card) => {
          const ownerPosition = positions[card.owner];
          const rotation = getCardRotation(viewerPosition, ownerPosition);
          const transformedCard = {
            ...card,
            x: isRotated ? -card.x - 64 : card.x,
            y: isRotated ? -card.y - 89 : card.y,
          };

          return (
            <Card
              key={card.id}
              card={transformedCard}
              rotation={rotation}
              onTapCard={tapCard}
              onMouseDown={getCardMouseDownHandler(card, "board", rotation)}
              onRightClick={(e) =>
                onCardRightClick(e.evt.clientX, e.evt.clientY, card)
              }
              defaultCardBackImage={defaultCardBackImage}
            />
          );
        })}

        {Object.values(decks).map((deck) => {
          const transformedDeck = {
            ...deck,
            x: isRotated ? -deck.x - 64 : deck.x,
            y: isRotated ? -deck.y - 89 : deck.y,
          };

          return (
            <Deck
              key={deck.id}
              deck={transformedDeck}
              decks={decks}
              setDecks={setDecks}
              setHand={setHand}
              onRightClick={(e) =>
                onDeckRightClick(e.evt.clientX, e.evt.clientY, deck.id)
              }
            />
          );
        })}
      </Layer>
    </Stage>
  );
}
