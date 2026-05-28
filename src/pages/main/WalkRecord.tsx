import { useState, useEffect } from 'react';
import { WalkCalendar } from './WalkCalendar';
import { fetchStamps } from '../../utils/api';

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
  const completedToday = stamps.includes(today.getDate());

  useEffect(() => {
    fetchStamps(userKey, yearMonth).then(setStamps);
    fetchStamps(userKey, prevYearMonth).then(arr => setPrevCount(arr.length));
  }, [userKey, yearMonth, prevYearMonth]);

  return (
    <div className="app-shell">
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

      <div className="footer-cta">
        <button className="cta" onClick={onBack}>돌아가기</button>
      </div>
    </div>
  );
}
