export function getCardRotation(viewerPosition, ownerPosition) {
  const bottomPositions = ["bottomLeft", "bottomRight"];
  const topPositions = ["topLeft", "topRight"];

  const viewerIsBottom = bottomPositions.includes(viewerPosition);
  const ownerIsBottom = bottomPositions.includes(ownerPosition);

  return viewerIsBottom === ownerIsBottom ? 0 : 180;
}
