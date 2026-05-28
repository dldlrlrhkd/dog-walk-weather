import { useEffect, useRef, useState } from 'react';

interface BannerAdProps {
  adGroupId: string;
}

let initialized = false;

export function BannerAd({ adGroupId }: BannerAdProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string>('init');

  useEffect(() => {
    let destroy: (() => void) | undefined;

    (async () => {
      try {
        const { TossAds } = await import('@apps-in-toss/web-framework');
        if (!TossAds.attachBanner.isSupported()) {
          setStatus('not-supported');
          return;
        }
        if (!initialized) {
          TossAds.initialize({
            callbacks: {
              onInitialized: () => console.log('[ad] TossAds initialized'),
              onInitializationFailed: (err) => {
                console.error('[ad] init failed:', err);
                setStatus('init-failed');
              },
            },
          });
          initialized = true;
        }
        if (!ref.current) {
          setStatus('no-ref');
          return;
        }
        setStatus('attaching');
        const result = TossAds.attachBanner(adGroupId, ref.current, {
          theme: 'auto',
          variant: 'card',
          callbacks: {
            onAdRendered: () => {
              console.log('[ad] banner rendered:', adGroupId);
              setStatus('rendered');
            },
            onAdFailedToRender: (e) => {
              console.warn('[ad] banner failed:', e);
              setStatus(`failed: ${JSON.stringify(e?.error).slice(0, 60)}`);
            },
            onNoFill: () => {
              console.log('[ad] no fill');
              setStatus('no-fill');
            },
          },
        });
        destroy = result.destroy;
      } catch (err) {
        console.warn('[ad] TossAds unavailable:', err);
        setStatus(`error: ${String(err).slice(0, 60)}`);
      }
    })();

    return () => { destroy?.(); };
  }, [adGroupId]);

  return (
    <div className="banner-ad-slot">
      <div ref={ref} />
      {status !== 'rendered' && (
        <div style={{ fontSize: 10, color: '#999', padding: '4px 8px', textAlign: 'center' }}>
          광고 상태: {status}
        </div>
      )}
    </div>
  );
}
