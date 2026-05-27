import type { DogProfile } from '../App';

// localStorage cache keys
const dogsCacheKey = (userKey: string) => `dogProfiles-${userKey}`;
const stampsCacheKey = (userKey: string, yearMonth: string) => `walkStamps-${userKey}-${yearMonth}`;

function readDogsCache(userKey: string): DogProfile[] {
  try {
    const raw = localStorage.getItem(dogsCacheKey(userKey));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function writeDogsCache(userKey: string, dogs: DogProfile[]) {
  try { localStorage.setItem(dogsCacheKey(userKey), JSON.stringify(dogs)); } catch {}
}

function readStampsCache(userKey: string, yearMonth: string): number[] {
  try {
    const raw = localStorage.getItem(stampsCacheKey(userKey, yearMonth));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function writeStampsCache(userKey: string, yearMonth: string, days: number[]) {
  try { localStorage.setItem(stampsCacheKey(userKey, yearMonth), JSON.stringify(days)); } catch {}
}

export async function fetchDogs(userKey: string): Promise<DogProfile[]> {
  try {
    const res = await fetch(`/api/dogs?userKey=${encodeURIComponent(userKey)}`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json() as { dogs: DogProfile[] };
    const dogs = Array.isArray(data.dogs) ? data.dogs : [];
    writeDogsCache(userKey, dogs);
    // 첫 동기화: 서버 비어있고 로컬에 데이터 있으면 푸시
    if (dogs.length === 0) {
      const local = readDogsCache(userKey);
      if (local.length > 0) {
        console.log('[api] migrating local dogs to server');
        await saveDogs(userKey, local);
        return local;
      }
    }
    return dogs;
  } catch (err) {
    console.warn('[api] fetchDogs failed, using localStorage:', err);
    return readDogsCache(userKey);
  }
}

export async function saveDogs(userKey: string, dogs: DogProfile[]): Promise<void> {
  writeDogsCache(userKey, dogs);
  try {
    const res = await fetch('/api/dogs', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userKey, dogs }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
  } catch (err) {
    console.warn('[api] saveDogs failed, kept in localStorage only:', err);
  }
}

export async function fetchStamps(userKey: string, yearMonth: string): Promise<number[]> {
  try {
    const res = await fetch(`/api/stamps?userKey=${encodeURIComponent(userKey)}&yearMonth=${encodeURIComponent(yearMonth)}`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json() as { days: number[] };
    const days = Array.isArray(data.days) ? data.days : [];
    writeStampsCache(userKey, yearMonth, days);
    if (days.length === 0) {
      const local = readStampsCache(userKey, yearMonth);
      if (local.length > 0) {
        console.log('[api] migrating local stamps to server:', yearMonth);
        await saveStamps(userKey, yearMonth, local);
        return local;
      }
    }
    return days;
  } catch (err) {
    console.warn('[api] fetchStamps failed, using localStorage:', err);
    return readStampsCache(userKey, yearMonth);
  }
}

export async function saveStamps(userKey: string, yearMonth: string, days: number[]): Promise<void> {
  writeStampsCache(userKey, yearMonth, days);
  try {
    const res = await fetch('/api/stamps', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userKey, yearMonth, days }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
  } catch (err) {
    console.warn('[api] saveStamps failed, kept in localStorage only:', err);
  }
}
