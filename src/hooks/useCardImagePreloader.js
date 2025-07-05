import { useEffect, useRef } from "react";
import { loadTokenData } from "../utils/loadTokenData";
import { requestQueue } from "../utils/RequestQueue";

export function useCardImagePreloader(
  positions,
  decks,
  boardCards,
  onTokenResolved
) {
  const seenUrlsRef = useRef(new Set());
  const preloadImage = (url) => {
    return requestQueue.enqueue(() => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = (err) => reject(err);
        img.src = url;
      });
    });
  };
  const enqueueCard = async (card) => {
    const url = card.imageUrl;
    if (url && !seenUrlsRef.current.has(url)) {
      seenUrlsRef.current.add(url);
      await preloadImage(url);
    }
    if (card.hasTokens && card.uid && !card.tokens) {
      const updatedCard = await loadTokenData(card);
      if (updatedCard.tokens && !card.tokens && onTokenResolved) {
        onTokenResolved(updatedCard.uid, updatedCard.tokens);
      }
    }
  };
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
  useEffect(() => {
    enqueueNewImages();
  }, [positions]);
}
