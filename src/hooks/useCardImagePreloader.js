import { useEffect, useRef } from "react";

export function useCardImagePreloader(decks, boardCards = []) {
  const seenUrlsRef = useRef(new Set());
  const queueRef = useRef([]);
  const timeoutRef = useRef(null);

  const enqueueNewImages = async () => {
    const currentUrls = new Set();

    // All deck cards and commanders
    for (const deck of Object.values(decks)) {
      const allCards = [...(deck.cards || []), ...(deck.commanders || [])];
      for (const card of allCards) {
        await enqueueCard(card);
      }
    }

    // Also include any standalone board cards
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
      try {
        const res = await fetch(`https://api.scryfall.com/cards/${card.uid}`);
        const data = await res.json();
        const tokenParts =
          data.all_parts?.filter((p) => p.component === "token") || [];

        const resolvedTokens = [];

        for (const part of tokenParts) {
          await new Promise((r) => setTimeout(r, 100));
          const tokenRes = await fetch(part.uri);
          const tokenData = await tokenRes.json();
          const tokenUrl = tokenData.image_uris?.normal;
          if (tokenUrl) {
            resolvedTokens.push({
              id: tokenData.id,
              name: tokenData.name,
              imageUrl: tokenUrl,
            });

            if (!seenUrlsRef.current.has(tokenUrl)) {
              queueRef.current.push(tokenUrl);
              seenUrlsRef.current.add(tokenUrl);
            }
          }
        }

        card.tokens = resolvedTokens;
      } catch (err) {
        console.warn(`Failed to load token images for ${card.name}:`, err);
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
    enqueueNewImages().then(() => {
      if (!timeoutRef.current && queueRef.current.length > 0) {
        loadNextImage();
      }
    });

    return () => clearTimeout(timeoutRef.current);
  }, [decks]);
}
