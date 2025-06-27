import { useEffect, useRef } from "react";

export function useCardImagePreloader(decks) {
  const seenUrlsRef = useRef(new Set());
  const queueRef = useRef([]);
  const timeoutRef = useRef(null);

  const enqueueNewImages = () => {
    const currentUrls = new Set();

    decks.forEach((deck) => {
      deck.cards?.forEach((card) => {
        const url = card.imageUrl;
        currentUrls.add(url);

        if (!seenUrlsRef.current.has(url)) {
          queueRef.current.push(url);
          seenUrlsRef.current.add(url);
        }
      });
    });
  };

  const loadNextImage = () => {
    if (queueRef.current.length === 0) return;

    const url = queueRef.current.shift();
    const img = new Image();
    const start = performance.now();

    img.onload = () => {
      const duration = performance.now() - start;
      const fromCache = duration < 50;
      const delay = fromCache ? 20 : 125;
      timeoutRef.current = setTimeout(loadNextImage, delay);
    };

    img.onerror = () => {
      timeoutRef.current = setTimeout(loadNextImage, 250);
    };

    img.src = url;
  };

  useEffect(() => {
    enqueueNewImages();

    // Only start loading if not already active
    if (!timeoutRef.current && queueRef.current.length > 0) {
      loadNextImage();
    }

    return () => clearTimeout(timeoutRef.current);
  }, [decks]);
}
