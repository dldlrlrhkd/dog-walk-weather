import { useRef, useEffect } from 'react';

interface StepBreedProps {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  name: string;
}

export function StepBreed({ value, onChange, onNext, name }: StepBreedProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 200); }, []);
  return (
    <div className="onb fade-enter">
      <div className="progress">
        <span className="seg on"/><span className="seg on"/><span className="seg"/><span className="seg"/><span className="seg"/>
      </div>
      <div className="q"><span className="accent">{name}</span>의<br/>견종이 뭐예요?</div>
      <input
        ref={inputRef}
        className="input-big"
        placeholder="예) 말티즈, 골든리트리버"
        value={value}
        maxLength={20}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onNext(); }}
      />
      <div className="footer">
        <button className="cta" onClick={onNext}>
          {value.trim() ? '다음' : '모르겠어요 (건너뛰기)'}
        </button>
      </div>
    </div>
  );
}
