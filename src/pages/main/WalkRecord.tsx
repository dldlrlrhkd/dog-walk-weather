import { useState, useEffect } from 'react';
import { Icon } from '../../components/Icon';
import { WalkCalendar } from './WalkCalendar';
import { AdOverlay } from './AdOverlay';
import { fetchStamps, saveStamps } from '../../utils/api';

interface WalkRecordProps {
  dogName: string;
  userKey: string;
  onBack: () => void;
}

const ymOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
const REWARD_AD_ID = 'ait.v2.live.c51a7e8d82a147dc';

export function WalkRecord({ dogName, userKey, onBack }: WalkRecordProps) {
  const today = new Date();
  const yearMonth = ymOf(today);
  const prevDate = today.getMonth() === 0
    ? new Date(today.getFullYear() - 1, 11, 1)
    : new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevYearMonth = ymOf(prevDate);

  const [stamps, setStamps] = useState<number[]>([]);
  const [prevCount, setPrevCount] = useState<number>(0);
  const [adState, setAdState] = useState({ open: false, remaining: 5 });
  const completedToday = stamps.includes(today.getDate());

  useEffect(() => {
    fetchStamps(userKey, yearMonth).then(setStamps);
    fetchStamps(userKey, prevYearMonth).then(arr => setPrevCount(arr.length));
  }, [userKey, yearMonth, prevYearMonth]);

  useEffect(() => {
    if (!adState.open || adState.remaining <= 0) return;
    const id = setTimeout(() => setAdState(s => ({ ...s, remaining: s.remaining - 1 })), 1000);
    return () => clearTimeout(id);
  }, [adState.open, adState.remaining]);

  const stampToday = () => {
    if (stamps.includes(today.getDate())) return;
    const next = [...stamps, today.getDate()].sort((a, b) => a - b);
    setStamps(next);
    saveStamps(userKey, yearMonth, next);
  };

  const handleComplete = async () => {
    if (completedToday) return;

    try {
      const { loadFullScreenAd, showFullScreenAd } = await import('@apps-in-toss/web-framework');

      if (!showFullScreenAd.isSupported()) {
        // 토스 앱 환경 아님 → 브라우저 폴백 (가짜 광고 오버레이)
        setAdState({ open: true, remaining: 5 });
        return;
      }

      // 토스 앱: 진짜 리워드 광고 로드 → 시청 완료 시 도장
      const stopLoad = loadFullScreenAd({
        options: { adGroupId: REWARD_AD_ID },
        onEvent: (e) => {
          if (e.type === 'loaded') {
            stopLoad();
            const stopShow = showFullScreenAd({
              options: { adGroupId: REWARD_AD_ID },
              onEvent: (showEvent) => {
                if (showEvent.type === 'userEarnedReward') {
                  stampToday();
                }
                if (showEvent.type === 'dismissed' || showEvent.type === 'failedToShow') {
                  stopShow();
                }
              },
              onError: (err) => {
                console.error('[ad] reward show failed:', err);
                stopShow();
              },
            });
          }
        },
        onError: (err) => {
          console.error('[ad] reward load failed:', err);
          stopLoad();
        },
      });
    } catch (err) {
      console.warn('[ad] SDK unavailable, falling back to mock overlay:', err);
      setAdState({ open: true, remaining: 5 });
    }
  };

  const handleAdClose = () => {
    stampToday();
    setAdState({ open: false, remaining: 5 });
  };

  return (
    <div className="app-shell">
      <div className="topnav">
        <button className="icon-btn" onClick={onBack}><Icon name="back" size={22}/></button>
        <div className="nav-title">
          <Icon name="paw" size={18} color="var(--blue)"/>
          산책 기록
        </div>
        <div style={{ width: 40 }}/>
      </div>

      <div className="scroll">
        <div className="headline-row">
          <div className="headline">
            {dogName}의<br/><span className="accent">산책 기록</span>이에요
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <WalkCalendar
            stamps={stamps}
            today={today}
            onComplete={handleComplete}
            completedToday={completedToday}
          />
        </div>

        <div className="walk-record-info">
          <div className="info-item">
            <span className="info-num">{stamps.length}</span>
            <span className="info-label">이번달 산책</span>
          </div>
          <div className="info-divider"/>
          <div className="info-item">
            <span className="info-num">{prevCount}</span>
            <span className="info-label">지난달 기록</span>
          </div>
          <div className="info-divider"/>
          <div className="info-item">
            <span className="info-num">{completedToday ? '✓' : '-'}</span>
            <span className="info-label">오늘 완료</span>
          </div>
        </div>
      </div>

      {adState.open && <AdOverlay remaining={adState.remaining} onClose={handleAdClose}/>}
    </div>
  );
}
