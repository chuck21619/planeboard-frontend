export function remapPositions(viewer, positions) {
  const viewerPos = positions[viewer];
  if (!viewerPos) {
    console.warn("Viewer position not found:", viewer);
    return positions; // fallback to original
  }

  const shouldRotate = !viewerPos.includes("bottom");

  const quadrantOrder = ["topLeft", "topRight", "bottomRight", "bottomLeft"];
  const rotatedOrder = shouldRotate
    ? [...quadrantOrder.slice(2), ...quadrantOrder.slice(0, 2)]
    : quadrantOrder;

  const posToPlayer = Object.fromEntries(
    Object.entries(positions).map(([player, pos]) => [pos, player])
  );

  const remapped = {};
  rotatedOrder.forEach((newPos, i) => {
    const originalPos = quadrantOrder[i];
    const player = posToPlayer[originalPos];
    if (player) {
      remapped[player] = newPos;
    }
  });

  return { remappedPositions: remapped, isRotated: shouldRotate };
}
