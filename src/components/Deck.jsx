import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { sendMessage } from "../ws";

export default function Deck({ deck }) {
  const [deckImage] = useImage("/deck.png");

  const handleClick = () => {
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
        />
      )}
    </>
  );
}
