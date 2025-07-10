import { useState, useEffect } from "react";

export function useStageMousePos(stageRef) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(e) {
      const stage = stageRef?.current?.getStage?.();
      if (!stage) return;

      const scale = stage.scaleX();
      const stagePos = stage.position();
      const boundingRect = stage.container().getBoundingClientRect();

      const x = (e.clientX - boundingRect.left - stagePos.x) / scale;
      const y = (e.clientY - boundingRect.top - stagePos.y) / scale;

      setMousePos((prev) => {
        // avoid infinite updates if position hasn't changed
        if (prev.x === x && prev.y === y) return prev;
        return { x, y };
      });
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []); // only on mount

  return mousePos;
}
