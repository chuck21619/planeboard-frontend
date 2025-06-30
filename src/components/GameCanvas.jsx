import { Stage, Layer } from "react-konva";
import Card from "./Card";
import Deck from "./Deck";
import OpponentHand from "./OpponentHand";
import BoardBackground from "./BoardBackground";
import { sendMessage } from "../ws";

export default function GameCanvas({
  stageRef,
  windowSize,
  stageScale,
  stagePosition,
  handleDragEnd,
  handleWheel,
  onMouseMove,
  cards,
  decks,
  draggingCard,
  dragPos,
  handSizes,
  positions,
  setCards,
  setHand,
  ignoreNextChange,
  cardBackImage,
  username,
  setDecks,
  setStagePosition,
  tapCard
}) {

  return (
    <>
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
        onMouseMove={onMouseMove}
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
              onTapCard={tapCard}
              onReturnToHand={(cardId) => {
                setCards((prev) => prev.filter((c) => c.id !== cardId));
                const cardToReturn = cards.find((c) => c.id === cardId);
                if (cardToReturn) {
                  setHand((prev) => [...prev, cardToReturn]);
                  sendMessage({
                    type: "CARD_RETURNED",
                    id: cardId,
                    username,
                  });
                }
              }}
              onCardMove={(id, x, y) => {
                setCards((prev) =>
                  prev.map((c) => (c.id === id ? { ...c, x, y } : c))
                );

                ignoreNextChange.current = true;
              }}
            />
          ))}
          {decks.map((deck) => (
            <Deck key={deck.id} deck={deck} decks={decks} setDecks={setDecks} />
          ))}
        </Layer>
      </Stage>
    </>
  );
}
