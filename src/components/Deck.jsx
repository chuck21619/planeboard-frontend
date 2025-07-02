import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { sendMessage } from "../ws";

export default function Deck({ deck, onRightClick }) {
  const [deckImage] = useImage("/deck.png");

  const handleContextMenu = (e) => {
    e.evt.preventDefault(); // ⛔ prevent browser menu just on this deck
    onRightClick(e); // forward to parent
  };

  const handleClick = (e) => {
    if (e.evt.button !== 0) return; // 0 = left button
    const username = localStorage.getItem("username");
    if (deck.id === username) {
      sendMessage({ type: "DRAW_CARD" });
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
