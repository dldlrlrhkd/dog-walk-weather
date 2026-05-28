import { getAnonymousKey } from '@apps-in-toss/web-framework';

const LOCAL_FALLBACK_STORAGE_KEY = 'localUserKey';

export async function resolveUserKey(): Promise<{ key: string; source: 'toss' | 'local' }> {
  try {
    const result = await getAnonymousKey();
    if (result && result !== 'ERROR' && result.type === 'HASH') {
      return { key: `toss-${result.hash}`, source: 'toss' };
    }
  } catch {
    // 토스 앱 밖(브라우저)에선 정상적으로 실패 → 로컬 폴백
  }
  let local = localStorage.getItem(LOCAL_FALLBACK_STORAGE_KEY);
  if (!local) {
    local = `local-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
    localStorage.setItem(LOCAL_FALLBACK_STORAGE_KEY, local);
  }
  return { key: local, source: 'local' };
}
