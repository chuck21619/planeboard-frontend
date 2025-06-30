import { useState } from "react";

export function useStageMousePos(stageRef, stageScale, stagePosition) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  function onMouseMove(e) {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scale = stage.scaleX();
    const stagePos = stage.position();

    const x = (pointer.x - stagePos.x) / scale;
    const y = (pointer.y - stagePos.y) / scale;

    setMousePos({ x, y });
  }

  return [mousePos, onMouseMove];
}
