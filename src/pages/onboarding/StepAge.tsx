import { Icon } from '../../components/Icon';

interface StepAgeProps {
  value: number;
  onChange: (v: number) => void;
  onBack: () => void;
  onNext: () => void;
  name: string;
}

export function StepAge({ value, onChange, onBack, onNext, name }: StepAgeProps) {
  const inc = () => onChange(Math.min(25, value + 1));
  const dec = () => onChange(Math.max(0, value - 1));
  return (
    <div className="onb fade-enter">
      <div className="progress">
        <span className="seg on"/><span className="seg on"/><span className="seg"/><span className="seg"/>
      </div>
      <div className="q"><span className="accent">{name}</span>는<br/>몇 살인가요?</div>
      <div className="age-legend">
        <div className="age-leg-row"><span className="age-leg-range">0–1세</span><span className="age-leg-name">퍼피</span></div>
        <div className="age-leg-row"><span className="age-leg-range">2–6세</span><span className="age-leg-name">성견</span></div>
        <div className="age-leg-row"><span className="age-leg-range">7세 이상</span><span className="age-leg-name">노년기</span></div>
      </div>
      <div className="stepper">
        <button className="sbtn" onClick={dec} disabled={value <= 0}>
          <Icon name="minus" size={22}/>
        </button>
        <div className="sval">{value}<span className="sunit">살</span></div>
        <button className="sbtn" onClick={inc}>
          <Icon name="plus" size={22}/>
        </button>
      </div>
      <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '-0.2px' }}>
        {value === 0 ? '아직 어린 강아지예요 (퍼피)'
          : value < 7 ? '활동기 성견이에요'
          : value < 11 ? '노령기에 접어들었어요'
          : '시니어에 접어들었어요'}
      </div>
      <div className="footer footer-row">
        <button className="cta-back" onClick={onBack}>뒤로</button>
        <button className="cta" onClick={onNext}>다음</button>
      </div>
    </div>
  );
}
