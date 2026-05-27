import { Icon } from '../../components/Icon';

interface WalkCalendarProps {
  stamps: number[];
  today: Date;
  onComplete: () => void;
  completedToday: boolean;
}

export function WalkCalendar({ stamps, today, onComplete, completedToday }: WalkCalendarProps) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = `${year}년 ${month + 1}월`;
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const todayD = today.getDate();

  return (
    <div className="cal-card">
      <div className="cal-head">
        <div className="cal-title">{monthName}</div>
        <div className="cal-count">
          <Icon name="paw" size={13} color="var(--blue)"/>
          이번달 산책 {stamps.length}회
        </div>
      </div>
      <div className="cal-grid cal-dow">
        {['일','월','화','수','목','금','토'].map((d, i) => (
          <div key={i} className={`dow${i===0?' sun':''}${i===6?' sat':''}`}>{d}</div>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="cal-cell empty"/>;
          const isToday = d === todayD;
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
      <button className={`cta walk-done${completedToday ? ' done' : ''}`}
        onClick={onComplete} disabled={completedToday}>
        {completedToday
          ? <><Icon name="check" size={20} color="#fff"/>&nbsp;오늘 산책 완료!</>
          : '산책 기록하고 포인트 받기'}
      </button>
    </div>
  );
}
