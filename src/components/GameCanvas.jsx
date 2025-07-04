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
}) {
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
    >
      <Layer>
        <BoardBackground
            positions={positions}
          lifeTotals={lifeTotals}
          setLifeTotals={setLifeTotals}
        />
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
        {draggingCard && dragSource !== "deckSearch" && (
          <Card
            card={{ ...draggingCard, x: dragPos.x, y: dragPos.y }}
            isGhost
          />
        )}
        {cards.map((card) => {
          const ownerPosition = positions[card.owner];
          const rotation = getCardRotation(viewerPosition, ownerPosition);

          return (
            <Card
              key={card.id}
              card={card}
              rotation={rotation}
              onTapCard={tapCard}
              onMouseDown={getCardMouseDownHandler(card, "board")}
              onRightClick={(e) =>
                onCardRightClick(e.evt.clientX, e.evt.clientY, card)
              }
            />
          );
        })}

        {Object.values(decks).map((deck) => (
          <Deck
            key={deck.id}
            deck={deck}
            decks={decks}
            setDecks={setDecks}
            setHand={setHand}
            onRightClick={(e) =>
              onDeckRightClick(e.evt.clientX, e.evt.clientY, deck.id)
            }
          />
        ))}
      </Layer>
    </Stage>
  );
}
