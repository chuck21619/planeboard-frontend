import { Image as KonvaImage, Text } from "react-konva";
import useImage from "use-image";
import { useState } from "react";
import { sendMessage } from "../ws";
import { removeTopCardFromDeck } from "../utils/deckUtils";

export default function Deck({
  deck,
  onRightClick,
  setHand,
  setDecks,
  setHandSizes,
  remappedPositions,
}) {
  const [deckImage] = useImage("/deck.png");
  const [hovered, setHovered] = useState(false);

  const handleContextMenu = (e) => {
    e.evt.preventDefault();
    onRightClick(e);
  };

  const handleClick = (e) => {
    if (e.evt.button !== 0) return;
    const username = localStorage.getItem("username");
    if (deck.id === username) {
      const cardToDraw = deck.cards[0];
      setHand((prev) => [...prev, cardToDraw]);
      setDecks((prevDecks) => removeTopCardFromDeck(prevDecks, username));
      sendMessage({ type: "DRAW_CARD" });
      setHandSizes((prev) => ({
        ...prev,
        [username]: prev[username] + 1,
      }));
    }
  };

  return (
    <>
      {deckImage && (
        <>
          <KonvaImage
            image={deckImage}
            x={deck.x}
            y={deck.y}
            width={70}
            height={94}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          />
          {hovered && (
            <Text
              text={`${deck.cards.length}`}
              x={deck.x + 25}
              y={
                remappedPositions?.[deck.id]?.includes("bottom")
                  ? deck.y + 94 + 5 // below the deck
                  : deck.y - 20 // above the deck
              }
              fontSize={20}
              fill="white"
              align="center"
            />
          )}
        </>
      )}
    </>
  );
}
