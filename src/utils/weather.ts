export interface Weather {
  temp: number;
  feelsLike: number;
  condition: string;
  rainPct: number;
  uv: number;
  pm: number;
  hour: number;
  location?: string;
  hourly?: HourlyData[];
}

export interface Dog {
  name: string;
  age: number;
  weight: number;
}

export interface SafetyResult {
  score: number;
  status: 'safe' | 'warn' | 'danger';
  statusLabel: string;
  headline: string;
  reasons: { type: string; msg: string }[];
}

export interface HourlyData {
  h: number;
  t: number;
  c: string;
  r: number;
}

export function computeWalkSafety(weather: Weather, dog: Dog): SafetyResult {
  const { feelsLike, condition, uv, pm } = weather;
  const { weight, age } = dog;
  const isSmall = weight < 10;
  const isLarge = weight >= 25;
  const isSenior = age >= 7;
  const isPuppy = age <= 1;

  let score = 100;
  const reasons: { type: string; msg: string }[] = [];

  const idealLow = isSmall ? 10 : isLarge ? 4 : 7;
  const idealHigh = isSmall ? 22 : isLarge ? 18 : 20;

  if (feelsLike > idealHigh) {
    const excess = feelsLike - idealHigh;
    score -= Math.min(60, excess * 4.3);
    const msg = excess > 14 ? '아스팔트가 너무 뜨거워서 화상 위험이 있어요'
      : excess > 8 ? '더위로 체온 조절이 힘들 수 있어요'
      : '조금 더우니 짧게 다녀오세요';
    reasons.push({ type: 'hot', msg });
  }
  let coldDed = 0;
  if (feelsLike < idealLow) {
    const shortfall = idealLow - feelsLike;
    coldDed = Math.min(55, shortfall * 4.6);
    score -= coldDed;
    const msg = shortfall > 12 ? '저체온증 위험이 있는 추위예요'
      : shortfall > 6 ? '체구가 작아 추위에 민감해요'
      : '쌀쌀하니 옷을 입혀주세요';
    reasons.push({ type: 'cold', msg });
  }

  if (condition === 'rain') { score -= 22; reasons.push({ type: 'rain', msg: '비가 오니 발 보호와 짧은 외출을 추천해요' }); }
  if (condition === 'snow') { score -= 18; reasons.push({ type: 'snow', msg: '눈길에 제설제가 있을 수 있어요' }); }

  if (pm > 75)      { score -= 25; reasons.push({ type: 'dust', msg: '미세먼지가 나빠 호흡기에 영향이 있어요' }); }
  else if (pm > 35) { score -= 10; reasons.push({ type: 'dust', msg: '미세먼지가 보통보다 조금 높아요' }); }

  if (uv >= 8) { score -= 12; reasons.push({ type: 'uv', msg: '자외선이 매우 강해요' }); }

  if (isSenior) score -= 6;
  if (isSenior && coldDed > 0) score -= 8;
  if (isPuppy)  score -= 4;

  score = Math.max(5, Math.min(100, Math.round(score)));

  let status: 'safe' | 'warn' | 'danger';
  let statusLabel: string;
  if (score >= 75)      { status = 'safe';   statusLabel = '산책하기 좋아요'; }
  else if (score >= 45) { status = 'warn';   statusLabel = '짧게라면 가능해요'; }
  else                  { status = 'danger'; statusLabel = '오늘은 쉬는 게 좋아요'; }

  const headline = reasons.length === 0 ? '체구·나이에 딱 맞는 날씨예요' : reasons[0].msg;

  return { score, status, statusLabel, headline, reasons };
}

export function buildDailySummary(weather: Weather, hourly: HourlyData[]): string {
  const periodOf = (h: number) => {
    if (h >= 6 && h < 11) return '아침';
    if (h >= 11 && h < 17) return '낮';
    if (h >= 17 && h < 21) return '저녁';
    return '밤';
  };

  const rainPeriods = new Set<string>();
  const snowPeriods = new Set<string>();
  let hotDayCount = 0;
  let coldCount = 0;

  for (const slot of hourly) {
    const p = periodOf(slot.h);
    if (slot.c === 'rain') rainPeriods.add(p);
    if (slot.c === 'snow') snowPeriods.add(p);
    if (slot.t >= 30 && p === '낮') hotDayCount++;
    if (slot.t <= 0) coldCount++;
  }

  const order = ['아침', '낮', '저녁', '밤'];
  const joinPeriods = (set: Set<string>) => order.filter(p => set.has(p)).join('과 ');

  if (snowPeriods.size >= 2) return '오늘은 하루종일 눈 소식이 있어요';
  if (snowPeriods.size > 0) return `오늘은 ${joinPeriods(snowPeriods)}에 눈 소식이 있어요`;
  if (rainPeriods.size >= 2) return '오늘은 하루종일 비 소식이 있어요';
  if (rainPeriods.size > 0) return `오늘은 ${joinPeriods(rainPeriods)}에 비 소식이 있어요`;
  if (weather.pm > 75) return '오늘은 미세먼지가 많아 마스크 산책을 추천해요';
  if (hotDayCount >= 2) return '오늘 낮에는 해가 너무 쨍쨍해요';
  if (coldCount >= 3) return '오늘은 하루종일 쌀쌀해요';
  return '오늘은 하루종일 산책하기 좋아요';
}

export function buildHourly(weather: Weather, startHour: number): HourlyData[] {
  const out: HourlyData[] = [];
  const base = weather.temp;
  const cond = weather.condition;
  for (let i = 0; i < 8; i++) {
    const h = (startHour + i) % 24;
    const curve = Math.sin(((h - 4) / 24) * Math.PI * 2) * 3;
    const t = Math.round(base + curve);
    let c: string, r: number;
    if (cond === 'rain') {
      c = i < 2 ? 'cloud' : 'rain'; r = i < 2 ? 30 : 70;
    } else if (cond === 'snow') {
      c = 'snow'; r = 60;
    } else if (cond === 'cloudy') {
      c = 'cloud'; r = 10;
    } else if (cond === 'hot' || cond === 'cold') {
      c = 'sun'; r = 0;
    } else {
      c = i > 5 ? 'cloud' : 'sun'; r = i > 5 ? 20 : 0;
    }
    out.push({ h, t, c, r });
  }
  return out;
}

export const MOCK_WEATHER: Weather = {
  temp: 23,
  feelsLike: 23,
  condition: 'clear',
  rainPct: 10,
  uv: 5,
  pm: 28,
  hour: new Date().getHours(),
};

function iconFromMain(main: string): string {
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(main)) return 'rain';
  if (main === 'Snow') return 'snow';
  if (main === 'Clouds') return 'cloud';
  return 'sun';
}

function iconFromWmoCode(code: number): string {
  if (code >= 71 && code <= 77) return 'snow';
  if (code === 85 || code === 86) return 'snow';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return 'rain';
  if (code === 2 || code === 3 || code === 45 || code === 48 || (code >= 51 && code <= 57)) return 'cloud';
  return 'sun';
}

export async function fetchWeather(apiKey: string): Promise<Weather> {
  const pos = await new Promise<GeolocationPosition>((res, rej) =>
    navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
  );
  const { latitude: lat, longitude: lon } = pos.coords;

  const [weatherRes, airRes, meteoResult] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
    fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`),
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=uv_index&hourly=temperature_2m,precipitation_probability,weather_code&timezone=auto&forecast_hours=8`)
      .then(r => r.json())
      .catch((err) => {
        console.warn('[weather] open-meteo fetch failed, falling back:', err);
        return null;
      }),
  ]);
  const w = await weatherRes.json();
  const air = await airRes.json();

  const temp = Math.round(w.main.temp);
  const feelsLike = Math.round(w.main.feels_like ?? w.main.temp);
  const main = w.weather?.[0]?.main ?? '';
  let condition: string;
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(main)) condition = 'rain';
  else if (main === 'Snow') condition = 'snow';
  else if (main === 'Clouds') condition = 'cloudy';
  else if (temp >= 30) condition = 'hot';
  else if (temp <= 0) condition = 'cold';
  else condition = 'clear';

  const rainPct = w.clouds?.all ?? 0;
  const pm = Math.round(air.list?.[0]?.components?.pm2_5 ?? 0);

  const hour = new Date().getHours();
  let uv: number;
  const meteoUv = meteoResult?.current?.uv_index;
  if (typeof meteoUv === 'number') {
    uv = Math.round(meteoUv);
  } else {
    uv = 0;
    if (condition !== 'rain' && condition !== 'snow') {
      if (hour >= 10 && hour <= 14) uv = 6;
      else if ((hour >= 8 && hour < 10) || (hour > 14 && hour <= 16)) uv = 4;
      else if (hour >= 6 && hour < 8) uv = 1;
    }
  }

  const location = w.name ?? '';

  const hourly: HourlyData[] = [{
    h: hour,
    t: temp,
    c: iconFromMain(main),
    r: condition === 'rain' || condition === 'snow' ? 80 : 0,
  }];
  const meteoHourly = meteoResult?.hourly;
  if (meteoHourly?.time?.length) {
    for (let i = 1; i < meteoHourly.time.length && hourly.length < 8; i++) {
      const t = meteoHourly.time[i] as string;
      const h = parseInt(t.split('T')[1].split(':')[0], 10);
      hourly.push({
        h,
        t: Math.round(meteoHourly.temperature_2m?.[i] ?? 0),
        c: iconFromWmoCode(meteoHourly.weather_code?.[i] ?? 0),
        r: meteoHourly.precipitation_probability?.[i] ?? 0,
      });
    }
  }

  return { temp, feelsLike, condition, rainPct, uv, pm, hour, location, hourly };
}
