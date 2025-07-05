// utils/loadTokenData.js
export async function loadTokenData(card) {
  if (!card.hasTokens || !card.uid || card.tokens) return card;

  try {
    const res = await fetch(`https://api.scryfall.com/cards/${card.uid}`);
    const data = await res.json();

    const tokenParts =
      data.all_parts?.filter((p) => p.component === "token") || [];

    const resolvedTokens = [];
    for (const part of tokenParts) {
      await new Promise((r) => setTimeout(r, 100)); // polite delay
      const tokenRes = await fetch(part.uri);
      const tokenData = await tokenRes.json();
      const tokenUrl = tokenData.image_uris?.normal;
      if (tokenUrl) {
        resolvedTokens.push({
          id: tokenData.id,
          name: tokenData.name,
          imageUrl: tokenUrl,
        });
      }
    }

    return { ...card, tokens: resolvedTokens };
  } catch (err) {
    console.warn(`Failed to load token data for ${card.name}:`, err);
    return card;
  }
}
