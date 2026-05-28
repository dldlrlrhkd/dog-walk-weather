import { useState, useEffect } from 'react';
import { WalkCalendar } from './WalkCalendar';
import { fetchStamps } from '../../utils/api';

interface WalkRecordProps {
  dogName: string;
  userKey: string;
  onBack: () => void;
}

const ymKey = (y: number, m: number) => `${y}-${m}`;

// 하한: 12개월 전, 상한: 이번 달
const MIN_MONTHS_BACK = 12;

export function WalkRecord({ dogName, userKey, onBack }: WalkRecordProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0~11

  const yearMonth = ymKey(viewYear, viewMonth);
  const todayYearMonth = ymKey(today.getFullYear(), today.getMonth());

  const [stamps, setStamps] = useState<number[]>([]);
  const [todayStamps, setTodayStamps] = useState<number[]>([]);
  const completedToday = todayStamps.includes(today.getDate());

  // 현재 보고 있는 월의 도장 (페이지에 표시될 것)
  useEffect(() => {
    fetchStamps(userKey, yearMonth).then(setStamps);
  }, [userKey, yearMonth]);

  // "오늘 산책 완료" 배지용 — 항상 이번 달 도장도 같이 fetch
  useEffect(() => {
    if (yearMonth === todayYearMonth) {
      setTodayStamps(stamps);
    } else {
      fetchStamps(userKey, todayYearMonth).then(setTodayStamps);
    }
  }, [userKey, yearMonth, todayYearMonth, stamps]);

  // 월 이동 제한 체크
  const minDate = new Date(today.getFullYear(), today.getMonth() - MIN_MONTHS_BACK, 1);
  const currentViewDate = new Date(viewYear, viewMonth, 1);
  const canPrev = currentViewDate > minDate;
  const canNext = !(viewYear === today.getFullYear() && viewMonth === today.getMonth());

  const handlePrev = () => {
    if (!canPrev) return;
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };
  const handleNext = () => {
    if (!canNext) return;
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

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
            viewYear={viewYear}
            viewMonth={viewMonth}
            completedToday={completedToday}
            canPrev={canPrev}
            canNext={canNext}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>

        <div className="walk-record-info">
          <div className="info-item">
            <span className="info-num">{stamps.length}</span>
            <span className="info-label">{viewYear === today.getFullYear() && viewMonth === today.getMonth() ? '이번달 산책' : `${viewMonth + 1}월 산책`}</span>
          </div>
          <div className="info-divider"/>
          <div className="info-item">
            <span className="info-num">{todayStamps.length}</span>
            <span className="info-label">이번달 총</span>
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
