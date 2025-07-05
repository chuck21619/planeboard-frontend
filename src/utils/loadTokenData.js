import { requestQueue } from "./RequestQueue";

export async function loadTokenData(card) {
  if (!card.hasTokens || !card.uid || card.tokens) return card;
  try {
    const res = await requestQueue.enqueue(() =>
      fetch(`https://api.scryfall.com/cards/${card.uid}`)
    );
    const data = await res.json();
    const tokenParts =
      data.all_parts?.filter((p) => p.component === "token") || [];
    const resolvedTokens = [];
    for (const part of tokenParts) {
      const tokenRes = await requestQueue.enqueue(() => fetch(part.uri));
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
    return card;
  }
}
