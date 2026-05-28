import { useEffect, useRef } from 'react';

interface BannerAdProps {
  adGroupId: string;
}

let initialized = false;

export function BannerAd({ adGroupId }: BannerAdProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let destroy: (() => void) | undefined;

    (async () => {
      try {
        const { TossAds } = await import('@apps-in-toss/web-framework');
        if (!TossAds.attachBanner.isSupported()) {
          console.log('[ad] TossAds not supported (likely browser)');
          return;
        }
        if (!initialized) {
          TossAds.initialize({
            callbacks: {
              onInitialized: () => console.log('[ad] TossAds initialized'),
              onInitializationFailed: (err) => console.error('[ad] init failed:', err),
            },
          });
          initialized = true;
        }
        if (!ref.current) return;
        const result = TossAds.attachBanner(adGroupId, ref.current, {
          theme: 'auto',
          variant: 'card',
          callbacks: {
            onAdRendered: () => console.log('[ad] banner rendered:', adGroupId),
            onAdFailedToRender: (e) => console.warn('[ad] banner failed:', e),
            onNoFill: () => console.log('[ad] banner no-fill'),
          },
        });
        destroy = result.destroy;
      } catch (err) {
        console.warn('[ad] TossAds unavailable:', err);
      }
    })();

    return () => { destroy?.(); };
  }, [adGroupId]);

  return <div ref={ref} className="banner-ad-slot" />;
}
