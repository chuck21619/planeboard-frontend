import { Rect, Text } from "react-konva";
import { sendMessage } from "../ws";

export default function Deck({ deck, setDecks, decks }) {
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
        draggable
        onDragEnd={(e) => {
          const newDecks = decks.map((d) =>
            d.id === deck.id ? { ...d, x: e.target.x(), y: e.target.y() } : d
          );
          setDecks(newDecks);
          sendMessage({
            type: "MOVE_DECK",
            id: deck.id,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
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
