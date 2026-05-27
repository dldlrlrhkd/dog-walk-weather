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

  const handleComplete = () => {
    if (completedToday) return;
    setAdState({ open: true, remaining: 5 });
  };

  const handleAdClose = () => {
    if (!completedToday) {
      const next = [...stamps, today.getDate()].sort((a, b) => a - b);
      setStamps(next);
      saveStamps(userKey, yearMonth, next);
    }
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
