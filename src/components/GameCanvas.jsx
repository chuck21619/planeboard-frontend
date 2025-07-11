import { Stage, Layer } from "react-konva";
import Card from "./Card";
import Deck from "./Deck";
import OpponentHand from "./OpponentHand";
import BoardBackground from "./BoardBackground";
import { getCardRotation } from "../utils/cardOrientation";
import Counter from "./Counter";
import { sendMessage } from "../ws";
import DiceRollKonva from "./DiceRollKonva";

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
  setHandSizes,
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
  counters,
  setCounters,
  hoveredCounterId,
  setHoveredCounterId,
  diceRollers,
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
          //if (playerName === username) return null;
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
        {draggingCard && dragSource !== "deckCardViewer" && (
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
              setHandSizes={setHandSizes}
              remappedPositions={remappedPositions}
            />
          );
        })}
      </Layer>
      <Layer>
        {Object.values(counters).map(({ id, x, y, count }) => (
          <Counter
            key={id}
            id={id}
            x={isRotated ? -x - 40 : x}
            y={isRotated ? -y - 40 : y}
            count={count}
            isRotated={isRotated}
            setCounters={setCounters}
            hovered={hoveredCounterId === id}
            setHoveredCounterId={setHoveredCounterId}
          />
        ))}
      </Layer>
      <Layer>
        {Object.values(diceRollers).map(({ id, x, y, numDice, numSides }) => (
          <DiceRollKonva
            key={id}
            id={id}
            isRotated={isRotated}
            x={isRotated ? -x-(numDice * 50 + 85) : x}
            y={isRotated ? -y-40 : y}
            numDice={numDice}
            numSides={numSides}
          />
        ))}
      </Layer>
    </Stage>
  );
}
