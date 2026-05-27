interface StepSizeProps {
  weight: number;
  onChange: (v: number) => void;
  onBack: () => void;
  onDone: () => void;
  name: string;
}

export function StepSize({ weight, onChange, onBack, onDone, name }: StepSizeProps) {
  const cat = weight < 10 ? '소형견' : weight < 25 ? '중형견' : '대형견';
  return (
    <div className="onb fade-enter">
      <div className="progress">
        <span className="seg on"/><span className="seg on"/><span className="seg on"/><span className="seg"/>
      </div>
      <div className="q"><span className="accent">{name}</span>의<br/>몸무게는 얼마예요?</div>
      <div className="q-sub">체구에 따라 더위/추위 민감도가 달라요</div>
      <div className="size-slider-wrap">
        <div className="size-slider-val">{weight}<span className="sunit">kg</span></div>
        <div className="size-slider-cat">{cat}</div>
        <input
          type="range" min="1" max="50" step="1"
          value={weight}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="size-slider"
        />
        <div className="slider-ticks">
          <span>1kg</span><span>10kg</span><span>25kg</span><span>50kg+</span>
        </div>
      </div>
      <div className="footer footer-row">
        <button className="cta-back" onClick={onBack}>뒤로</button>
        <button className="cta" onClick={onDone}>다음</button>
      </div>
    </div>
  );
}
