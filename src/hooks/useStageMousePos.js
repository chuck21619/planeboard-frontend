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

      setMousePos({ x, y });
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [stageRef]);

  return mousePos;
}
