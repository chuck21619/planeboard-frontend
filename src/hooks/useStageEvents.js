export function useStageEvents(setStageScale, setStagePosition) {
  const handleWheel = (e, stagePosition, stageScale) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const oldScale = stageScale;
    const pointer = e.target.getStage().getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setStageScale(newScale);
    setStagePosition(newPos);
  };

  const handleDragEnd = (e, setStagePosition) => {
    const target = e.target;
    if (target === e.target.getStage()) {
      const newX = target.x();
      const newY = target.y();
      setStagePosition({ x: newX, y: newY });
    }
  };

  return { handleWheel, handleDragEnd };
}
