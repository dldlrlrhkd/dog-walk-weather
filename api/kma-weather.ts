export const config = { runtime: 'edge', regions: ['icn1'] };

// 기상청 격자 변환 (Lambert Conformal Conic)
function latLonToGrid(lat: number, lon: number) {
  const RE = 6371.00877, GRID = 5.0;
  const SLAT1 = 30.0, SLAT2 = 60.0;
  const OLON = 126.0, OLAT = 38.0;
  const XO = 43, YO = 136;
  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD, slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD, olat = OLAT * DEGRAD;
  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);
  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = re * sf / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;
  const nx = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  return { nx, ny };
}

// KST 시각 추출 (UTC 기반)
function getKSTParts() {
  const now = new Date();
  const utcMs = now.getTime();
  const kstMs = utcMs + 9 * 3600 * 1000;
  const d = new Date(kstMs);
  // d의 UTC 필드 = KST 실제 시각
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    raw: d,
  };
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const ymd = (y: number, m: number, d: number) => `${y}${pad2(m)}${pad2(d)}`;

// 초단기실황 base: 매시 40분 이후 HH00 사용
function getNcstBase() {
  const p = getKSTParts();
  let y = p.year, m = p.month, d = p.day, h = p.hour;
  if (p.minute < 40) {
    h -= 1;
    if (h < 0) {
      h = 23;
      const prev = new Date(Date.UTC(p.year, p.month - 1, p.day - 1));
      y = prev.getUTCFullYear(); m = prev.getUTCMonth() + 1; d = prev.getUTCDate();
    }
  }
  return { date: ymd(y, m, d), time: `${pad2(h)}00` };
}

// 초단기예보 base: 매시 45분 이후 HH30 사용
function getFcstBase() {
  const p = getKSTParts();
  let y = p.year, m = p.month, d = p.day, h = p.hour;
  if (p.minute < 45) {
    h -= 1;
    if (h < 0) {
      h = 23;
      const prev = new Date(Date.UTC(p.year, p.month - 1, p.day - 1));
      y = prev.getUTCFullYear(); m = prev.getUTCMonth() + 1; d = prev.getUTCDate();
    }
  }
  return { date: ymd(y, m, d), time: `${pad2(h)}30` };
}

// 단기예보 base: 02,05,08,11,14,17,20,23시 (+10분 이후 사용)
function getVilageBase() {
  const SLOTS = [23, 20, 17, 14, 11, 8, 5, 2];
  const p = getKSTParts();
  let y = p.year, m = p.month, d = p.day;
  for (const slot of SLOTS) {
    if (p.hour > slot || (p.hour === slot && p.minute >= 10)) {
      return { date: ymd(y, m, d), time: `${pad2(slot)}00` };
    }
  }
  // 새벽 02:10 이전 → 전날 23:00
  const prev = new Date(Date.UTC(p.year, p.month - 1, p.day - 1));
  return { date: ymd(prev.getUTCFullYear(), prev.getUTCMonth() + 1, prev.getUTCDate()), time: '2300' };
}

interface FcstItem { category: string; fcstDate: string; fcstTime: string; fcstValue: string }
interface NcstItem { category: string; obsrValue: string }

// PTY (강수형태) → condition
function ptyToCondition(pty: string): string {
  const n = parseInt(pty, 10);
  if (n === 1 || n === 4 || n === 5) return 'rain';        // 비, 소나기, 빗방울
  if (n === 2 || n === 6) return 'rain';                    // 비/눈, 빗방울눈날림 → 비 우선
  if (n === 3 || n === 7) return 'snow';                    // 눈, 눈날림
  return 'clear';
}

// SKY (하늘상태) → condition (PTY가 0일 때만)
function skyToCondition(sky: string): string {
  const n = parseInt(sky, 10);
  if (n === 1) return 'clear';
  if (n === 3) return 'cloudy';
  if (n === 4) return 'cloudy';
  return 'clear';
}

// 아이콘 매핑
function iconFor(condition: string): string {
  if (condition === 'rain') return 'rain';
  if (condition === 'snow') return 'snow';
  if (condition === 'cloudy') return 'cloud';
  return 'sun';
}

// Edge 인스턴스 메모리 캐시 (인스턴스가 살아있는 동안 hit)
const memoryCache = new Map<string, { time: number; data: unknown }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchJson(url: string, timeoutMs = 8000) {
  const now = Date.now();
  const cached = memoryCache.get(url);
  if (cached && (now - cached.time) < CACHE_TTL_MS) {
    return cached.data;
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    const text = await r.text();
    try {
      const data = JSON.parse(text);
      memoryCache.set(url, { time: now, data });
      return data;
    } catch {
      return { error: `non-JSON (status ${r.status}): ${text.slice(0, 300)}` };
    }
  } catch (e) {
    return { error: String(e) };
  } finally {
    clearTimeout(t);
  }
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const lat = parseFloat(url.searchParams.get('lat') || '');
  const lon = parseFloat(url.searchParams.get('lon') || '');
  if (isNaN(lat) || isNaN(lon)) return json({ error: 'lat/lon required' }, 400);

  const key = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env?.KMA_API_KEY;
  if (!key) return json({ error: 'KMA_API_KEY not configured' }, 500);

  const { nx, ny } = latLonToGrid(lat, lon);
  const base = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';
  const ncstBase = getNcstBase();
  const fcstBase = getFcstBase();
  const vilageBase = getVilageBase();

  const ncstUrl = `${base}/getUltraSrtNcst?serviceKey=${key}&dataType=JSON&numOfRows=10&pageNo=1&base_date=${ncstBase.date}&base_time=${ncstBase.time}&nx=${nx}&ny=${ny}`;
  const fcstUrl = `${base}/getUltraSrtFcst?serviceKey=${key}&dataType=JSON&numOfRows=60&pageNo=1&base_date=${fcstBase.date}&base_time=${fcstBase.time}&nx=${nx}&ny=${ny}`;
  const vilageUrl = `${base}/getVilageFcst?serviceKey=${key}&dataType=JSON&numOfRows=300&pageNo=1&base_date=${vilageBase.date}&base_time=${vilageBase.time}&nx=${nx}&ny=${ny}`;

  const [ncstRes, fcstRes, vilageRes] = await Promise.all([
    fetchJson(ncstUrl),
    fetchJson(fcstUrl),
    fetchJson(vilageUrl),
  ]);

  // 파싱
  const ncstItems: NcstItem[] = ncstRes?.response?.body?.items?.item ?? [];
  const fcstItems: FcstItem[] = fcstRes?.response?.body?.items?.item ?? [];
  const vilageItems: FcstItem[] = vilageRes?.response?.body?.items?.item ?? [];

  // 현재값 (초단기실황)
  const ncstMap: Record<string, string> = {};
  for (const it of ncstItems) ncstMap[it.category] = it.obsrValue;
  const currentTemp = parseFloat(ncstMap.T1H ?? '0');
  const currentPty = ncstMap.PTY ?? '0';
  const currentCondition = ptyToCondition(currentPty);

  // 시간별 예보: fcst(초단기, 6h) + vilage(단기, 3d) 합치기
  // key = `${fcstDate}${fcstTime}`, value = { T1H, SKY, PTY, POP }
  type Slot = { date: string; time: string; T1H?: number; SKY?: string; PTY?: string; POP?: number };
  const slots = new Map<string, Slot>();
  const ensure = (date: string, time: string): Slot => {
    const k = `${date}${time}`;
    if (!slots.has(k)) slots.set(k, { date, time });
    return slots.get(k)!;
  };

  for (const it of fcstItems) {
    const s = ensure(it.fcstDate, it.fcstTime);
    if (it.category === 'T1H') s.T1H = parseFloat(it.fcstValue);
    if (it.category === 'SKY') s.SKY = it.fcstValue;
    if (it.category === 'PTY') s.PTY = it.fcstValue;
  }
  for (const it of vilageItems) {
    const s = ensure(it.fcstDate, it.fcstTime);
    if (it.category === 'TMP' && s.T1H === undefined) s.T1H = parseFloat(it.fcstValue);
    if (it.category === 'SKY' && s.SKY === undefined) s.SKY = it.fcstValue;
    if (it.category === 'PTY' && s.PTY === undefined) s.PTY = it.fcstValue;
    if (it.category === 'POP') s.POP = parseFloat(it.fcstValue);
  }

  // 현재 KST부터 8시간만 추리기
  const kst = getKSTParts();
  const nowKey = `${ymd(kst.year, kst.month, kst.day)}${pad2(kst.hour)}00`;
  const sortedKeys = Array.from(slots.keys()).filter(k => k >= nowKey).sort();
  const hourly = sortedKeys.slice(0, 8).map(k => {
    const s = slots.get(k)!;
    const pty = s.PTY ?? '0';
    const condition = parseInt(pty, 10) > 0 ? ptyToCondition(pty) : skyToCondition(s.SKY ?? '1');
    return {
      h: parseInt(s.time.slice(0, 2), 10),
      t: Math.round(s.T1H ?? currentTemp),
      c: iconFor(condition),
      r: Math.round(s.POP ?? 0),
    };
  });

  // 데이터 있을 때만 캐싱 (rate-limit 오류 응답은 캐싱 X)
  const hasRealData = hourly.length > 0 || ncstItems.length > 0;

  return json({
    grid: { nx, ny },
    current: {
      temp: Math.round(currentTemp),
      condition: currentCondition,
      icon: iconFor(currentCondition),
    },
    hourly,
  }, 200, hasRealData);
}

function json(data: unknown, status = 200, cacheable = false): Response {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (cacheable && status === 200) {
    // Vercel CDN 5분 캐시 + 60초 stale-while-revalidate
    headers['Cache-Control'] = 'public, s-maxage=300, stale-while-revalidate=60';
  } else {
    headers['Cache-Control'] = 'no-store';
  }
  return new Response(JSON.stringify(data), { status, headers });
}
