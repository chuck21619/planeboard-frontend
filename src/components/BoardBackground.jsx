import { Rect } from "react-konva";

export default function BoardBackground({ size = 5000 }) {
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
      {/* Top-right */}
      <Rect
        x={0}
        y={-size}
        width={size}
        height={size}
        fill="#151554"
        opacity={0.1}
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
      {/* Bottom-right */}
      <Rect
        x={0}
        y={0}
        width={size}
        height={size}
        fill="#545415"
        opacity={0.1}
      />
    </>
  );
}
