import { Icon } from '../../components/Icon';

interface WalkCalendarProps {
  stamps: number[];
  today: Date;
  viewYear: number;
  viewMonth: number; // 0~11
  completedToday: boolean;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function WalkCalendar({
  stamps, today, viewYear, viewMonth, completedToday, canPrev, canNext, onPrev, onNext,
}: WalkCalendarProps) {
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName = `${viewYear}년 ${viewMonth + 1}월`;
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isViewingCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const todayD = today.getDate();

  return (
    <div className="cal-card">
      <div className="cal-head">
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={onPrev} disabled={!canPrev} aria-label="이전 달">
            <Icon name="back" size={14}/>
          </button>
          <div className="cal-title">{monthName}</div>
          <button className="cal-nav-btn flip" onClick={onNext} disabled={!canNext} aria-label="다음 달">
            <Icon name="back" size={14}/>
          </button>
        </div>
        {isViewingCurrentMonth && completedToday && (
          <div className="walk-done-badge">
            <Icon name="check" size={14} color="#2C5BFF"/>
            <span>오늘 산책 완료</span>
          </div>
        )}
      </div>
      <div className="cal-grid cal-dow">
        {['일','월','화','수','목','금','토'].map((d, i) => (
          <div key={i} className={`dow${i===0?' sun':''}${i===6?' sat':''}`}>{d}</div>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="cal-cell empty"/>;
          const isToday = isViewingCurrentMonth && d === todayD;
          const stamped = stamps.includes(d);
          return (
            <div key={i} className={`cal-cell${isToday ? ' today' : ''}`}>
              <span className="cd">{d}</span>
              {stamped && (
                <span className="stamp">
                  <Icon name="paw" size={18} color="#fff"/>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
