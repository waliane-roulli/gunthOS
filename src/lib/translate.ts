/**
 * Minimal translation wrapper around MyMemory (free tier, no API key).
 * Returns null on any failure so callers can fall back gracefully.
 */
export async function translateToFrench(text: string): Promise<string | null> {
  if (!text || text.length < 3) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|fr`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      responseStatus: number;
      responseData: { translatedText: string; match: number };
    };
    if (data.responseStatus !== 200) return null;
    // MyMemory returns a match score — only use the translation if it's not a 0% match
    // (which would just echo back the input unchanged)
    const translated = data.responseData.translatedText;
    if (!translated || translated === text) return null;
    return translated;
  } catch {
    return null;
  }
}
