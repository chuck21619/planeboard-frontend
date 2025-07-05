import { useEffect, useRef } from "react";
import { loadTokenData } from "../utils/loadTokenData";

export function useCardImagePreloader(
  positions,
  decks,
  boardCards,
  onTokenResolved
) {
  const seenUrlsRef = useRef(new Set());
  const queueRef = useRef([]);
  const timeoutRef = useRef(null);

  const enqueueNewImages = async () => {
    for (const deck of Object.values(decks)) {
      const allCards = [...(deck.cards || []), ...(deck.commanders || [])];
      for (const card of allCards) {
        await enqueueCard(card);
      }
    }
    for (const card of boardCards) {
      await enqueueCard(card);
    }
  };

  const enqueueCard = async (card) => {
    const url = card.imageUrl;
    if (url && !seenUrlsRef.current.has(url)) {
      queueRef.current.push(url);
      seenUrlsRef.current.add(url);
    }
    if (card.hasTokens && card.uid && !card.tokens) {
      const updatedCard = await loadTokenData(card);
      if (updatedCard.tokens && !card.tokens && onTokenResolved) {
        onTokenResolved(updatedCard.uid, updatedCard.tokens);
      }
    }
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
    console.log("useCardImagePreloader - useEffect");
    enqueueNewImages().then(() => {
      console.log("useCardImagePreloader - useEffect - enqueueNewImages");
      if (!timeoutRef.current && queueRef.current.length > 0) {
        loadNextImage();
      }
    });
    return () => clearTimeout(timeoutRef.current);
  }, [positions]);
}
