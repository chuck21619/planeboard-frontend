import { Rect, Text } from "react-konva";

const watermarkColor = "rgba(255, 255, 255, 0.03)";
const watermarkFontSize = 300;
const watermarkOffset = 100;
const size = 5000;

export default function BoardBackground({}) {
  const positions = {
    Alice: "topLeft",
    Bob: "topRight",
    Charlie: "bottomLeft",
    Dana: "bottomRight",
  };

  const getUsernameForPosition = (targetPos) =>
    Object.entries(positions).find(([_, pos]) => pos === targetPos)?.[0] || "";

  return (
    <>
      {/* Top-left */}
      <Rect
        x={-size}
        y={-size}
        width={size}
        height={size}
        fill="#155215"
        opacity={0.1}
      />
      <Text
        text={getUsernameForPosition("topLeft")}
        x={-size - watermarkOffset}
        y={-watermarkFontSize - watermarkOffset}
        width={size}
        height={size}
        align="right"
        fontSize={watermarkFontSize}
        fill={watermarkColor}
        listening={false}
      />

      {/* Top-right */}
      <Rect
        x={0}
        y={-size}
        width={size}
        height={size}
        fill="#151554"
        opacity={0.1}
      />
      <Text
        text={getUsernameForPosition("topRight")}
        x={watermarkOffset}
        y={-watermarkFontSize - watermarkOffset}
        width={size}
        height={size}
        align="left"
        fontSize={watermarkFontSize}
        fill={watermarkColor}
        listening={false}
      />

      {/* Bottom-left */}
      <Rect
        x={-size}
        y={0}
        width={size}
        height={size}
        fill="#541515"
        opacity={0.1}
      />
      <Text
        text={getUsernameForPosition("bottomLeft")}
        x={-size - watermarkOffset}
        y={watermarkOffset}
        width={size}
        height={size}
        align="right"
        fontSize={watermarkFontSize}
        fill={watermarkColor}
        listening={false}
      />

      {/* Bottom-right */}
      <Rect
        x={0}
        y={0}
        width={size}
        height={size}
        fill="#545415"
        opacity={0.1}
      />
      <Text
        text={getUsernameForPosition("bottomRight")}
        x={watermarkOffset}
        y={watermarkOffset}
        width={size}
        height={size}
        align="left"
        fontSize={watermarkFontSize}
        fill={watermarkColor}
        listening={false}
      />
    </>
  );
}
