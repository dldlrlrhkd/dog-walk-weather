import { getAnonymousKey } from '@apps-in-toss/web-framework';

const LOCAL_FALLBACK_STORAGE_KEY = 'localUserKey';

export async function resolveUserKey(): Promise<{ key: string; source: 'toss' | 'local' }> {
  try {
    const result = await getAnonymousKey();
    if (result && result !== 'ERROR' && result.type === 'HASH') {
      console.log('[userKey] toss anonymous hash resolved:', result.hash);
      return { key: `toss-${result.hash}`, source: 'toss' };
    }
    console.warn('[userKey] toss getAnonymousKey returned:', result);
  } catch (err) {
    console.warn('[userKey] getAnonymousKey threw (likely running outside Toss app):', err);
  }
  let local = localStorage.getItem(LOCAL_FALLBACK_STORAGE_KEY);
  if (!local) {
    local = `local-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
    localStorage.setItem(LOCAL_FALLBACK_STORAGE_KEY, local);
  }
  console.log('[userKey] using local fallback key:', local);
  return { key: local, source: 'local' };
}
