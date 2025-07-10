import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { sendMessage } from "../ws";
import { removeTopCardFromDeck } from "../utils/deckUtils";

export default function Deck({
  deck,
  onRightClick,
  setHand,
  setDecks,
  setHandSizes,
}) {
  const [deckImage] = useImage("/deck.png");

  const handleContextMenu = (e) => {
    e.evt.preventDefault();
    onRightClick(e);
  };

  const handleClick = (e) => {
    if (e.evt.button !== 0) return; // 0 = left button
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
        <KonvaImage
          image={deckImage}
          x={deck.x}
          y={deck.y}
          width={70}
          height={94}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        />
      )}
    </>
  );
}
