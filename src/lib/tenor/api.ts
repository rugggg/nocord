const API_KEY = import.meta.env.VITE_TENOR_API_KEY as string;
const BASE_URL = "https://tenor.googleapis.com/v2";

export interface GifResult {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
}

function parseGifs(items: TenorItem[]): GifResult[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    url: item.media_formats?.gif?.url ?? item.media_formats?.tinygif?.url ?? "",
    previewUrl: item.media_formats?.tinygif?.url ?? item.media_formats?.gif?.url ?? "",
  }));
}

interface TenorItem {
  id: string;
  title: string;
  media_formats: {
    gif?: { url: string };
    tinygif?: { url: string };
    mediumgif?: { url: string };
  };
}

interface TenorResponse {
  results: TenorItem[];
  next?: string;
}

export async function searchGifs(query: string, limit = 20): Promise<GifResult[]> {
  if (!API_KEY) return [];
  const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&key=${API_KEY}&limit=${limit}&media_filter=tinygif,gif`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data: TenorResponse = await res.json();
  return parseGifs(data.results ?? []);
}

export async function getFeaturedGifs(limit = 20): Promise<GifResult[]> {
  if (!API_KEY) return [];
  const url = `${BASE_URL}/featured?key=${API_KEY}&limit=${limit}&media_filter=tinygif,gif`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data: TenorResponse = await res.json();
  return parseGifs(data.results ?? []);
}
