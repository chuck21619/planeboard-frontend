import { Rect, Text } from "react-konva";
import { sendMessage } from "../ws";

export default function Deck({ deck, setDecks, decks }) {
  const handleClick = () => {
    const username = localStorage.getItem("username");
    if (deck.id === username) {
      sendMessage({ type: "DRAW_CARD" });
    }
  };

  return (
    <>
      <Rect
        x={deck.x}
        y={deck.y}
        width={60}
        height={90}
        fill="darkgreen"
        cornerRadius={8}
        shadowBlur={5}
        onClick={handleClick}
      />
      <Text
        text={`${deck.id}'s Deck`}
        x={deck.x}
        y={deck.y - 20}
        fontSize={14}
        fill="white"
        align="center"
        width={60}
      />
    </>
  );
}
