import { useState, useEffect } from "react";

export function useLoadingFade(hasJoined) {
  const [showSpinner, setShowSpinner] = useState(false);
  const [minLoadingDone, setMinLoadingDone] = useState(false);
  const [showRoom, setShowRoom] = useState(false);

  useEffect(() => {
    const spinnerTimer = setTimeout(() => setShowSpinner(true), 10);
    const minLoadTimer = setTimeout(() => setMinLoadingDone(true), 500);
    let showRoomTimer;
    if (hasJoined) {
      showRoomTimer = setTimeout(() => setShowRoom(true), 10);
    }
    return () => {
      clearTimeout(spinnerTimer);
      clearTimeout(minLoadTimer);
      clearTimeout(showRoomTimer);
    };
  }, [hasJoined]);

  return { showSpinner, minLoadingDone };
}
