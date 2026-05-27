import { useRef, useEffect } from 'react';

interface StepNameProps {
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepName({ value, onChange, onBack, onNext }: StepNameProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 200); }, []);
  return (
    <div className="onb fade-enter">
      <div className="progress">
        <span className="seg on"/><span className="seg"/><span className="seg"/><span className="seg"/>
      </div>
      <div className="q">우리 아이의<br/><span className="accent">이름</span>은 뭐예요?</div>
      <input
        ref={inputRef}
        className="input-big"
        placeholder="예) 보리"
        value={value}
        maxLength={10}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) onNext(); }}
      />
      <div className="footer footer-row">
        <button className="cta-back" onClick={onBack}>뒤로</button>
        <button className="cta" disabled={!value.trim()}
          style={{ opacity: value.trim() ? 1 : 0.4 }}
          onClick={onNext}>다음</button>
      </div>
    </div>
  );
}
