import { useState } from 'react';
import { Icon } from '../../components/Icon';
import type { DogProfile } from '../../App';

interface EditDogProps {
  dog: DogProfile;
  onCancel: () => void;
  onSave: (updated: DogProfile) => void;
}

export function EditDog({ dog, onCancel, onSave }: EditDogProps) {
  const [name, setName] = useState(dog.name);
  const [age, setAge] = useState(dog.age);
  const [weight, setWeight] = useState(dog.weight);

  const cat = weight < 10 ? '소형견' : weight < 25 ? '중형견' : '대형견';
  const ageLabel = age === 0 ? '아직 어린 강아지예요 (퍼피)'
    : age < 7 ? '활동기 성견이에요'
    : age < 11 ? '노령기에 접어들었어요'
    : '시니어에 접어들었어요';

  const handleSave = () => {
    const trimmed = name.trim() || dog.name;
    onSave({ ...dog, name: trimmed, age, weight });
  };

  return (
    <div className="app-shell">
      <div className="topnav">
        <button className="icon-btn" onClick={onCancel}><Icon name="back" size={22}/></button>
        <div className="nav-title">정보 변경</div>
        <div style={{ width: 40 }}/>
      </div>

      <div className="scroll">
        {/* 이름 */}
        <div className="edit-section">
          <div className="edit-label">이름</div>
          <input
            className="input-big"
            value={name}
            maxLength={10}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* 나이 */}
        <div className="edit-section">
          <div className="edit-label">나이</div>
          <div className="stepper">
            <button className="sbtn" onClick={() => setAge(Math.max(0, age - 1))} disabled={age <= 0}>
              <Icon name="minus" size={22}/>
            </button>
            <div className="sval">{age}<span className="sunit">살</span></div>
            <button className="sbtn" onClick={() => setAge(Math.min(25, age + 1))}>
              <Icon name="plus" size={22}/>
            </button>
          </div>
          <div className="edit-hint">{ageLabel}</div>
        </div>

        {/* 체중 / 종류 */}
        <div className="edit-section">
          <div className="edit-label">몸무게</div>
          <div className="size-slider-wrap">
            <div className="size-slider-val">{weight}<span className="sunit">kg</span></div>
            <div className="size-slider-cat">{cat}</div>
            <input
              type="range" min={1} max={50} step={1}
              value={weight}
              onChange={(e) => setWeight(parseInt(e.target.value))}
              className="size-slider"
            />
            <div className="slider-ticks">
              <span>1kg</span><span>10kg</span><span>25kg</span><span>50kg+</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-cta">
        <div className="footer-row" style={{ display: 'flex', gap: 10 }}>
          <button className="cta-back" onClick={onCancel}>취소</button>
          <button className="cta" onClick={handleSave} disabled={!name.trim()} style={{ opacity: name.trim() ? 1 : 0.4 }}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
