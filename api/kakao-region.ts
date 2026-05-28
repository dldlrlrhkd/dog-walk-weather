export const config = { runtime: 'edge', regions: ['icn1'] };

// 메모리 캐시 (좌표를 소수점 3자리로 라운딩해서 캐시 키 생성 — 약 100m 단위)
const memoryCache = new Map<string, { time: number; data: string }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30분

async function fetchKakao(lat: number, lon: number, key: string, timeoutMs = 5000): Promise<string> {
  const url = `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lon}&y=${lat}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
      signal: ctrl.signal,
    });
    if (!r.ok) {
      const text = await r.text();
      return `error: status ${r.status} ${text.slice(0, 100)}`;
    }
    const data = await r.json() as { documents?: Array<{ region_type: string; region_2depth_name: string; region_3depth_name: string }> };
    // 행정동(H) 우선
    const docs = data.documents ?? [];
    const h = docs.find(d => d.region_type === 'H') ?? docs[0];
    if (!h) return '';
    // "송파구 송파동" 형태
    const parts = [h.region_2depth_name, h.region_3depth_name].filter(Boolean);
    return parts.join(' ');
  } catch (e) {
    return `error: ${String(e).slice(0, 100)}`;
  } finally {
    clearTimeout(t);
  }
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const lat = parseFloat(url.searchParams.get('lat') || '');
  const lon = parseFloat(url.searchParams.get('lon') || '');
  if (isNaN(lat) || isNaN(lon)) return json({ error: 'lat/lon required' }, 400);

  const key = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env?.KAKAO_API_KEY;
  if (!key) return json({ error: 'KAKAO_API_KEY not configured' }, 500);

  // 좌표 소수점 3자리로 라운딩 → 캐시 키
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);
  if (cached && (now - cached.time) < CACHE_TTL_MS) {
    return json({ location: cached.data }, 200, true);
  }

  const location = await fetchKakao(lat, lon, key);
  if (!location.startsWith('error:')) {
    memoryCache.set(cacheKey, { time: now, data: location });
    return json({ location }, 200, true);
  }
  return json({ location: '', debug: location }, 200, false);
}

function json(data: unknown, status = 200, cacheable = false): Response {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (cacheable && status === 200) {
    headers['Cache-Control'] = 'public, s-maxage=1800, stale-while-revalidate=60';
  } else {
    headers['Cache-Control'] = 'no-store';
  }
  return new Response(JSON.stringify(data), { status, headers });
}
