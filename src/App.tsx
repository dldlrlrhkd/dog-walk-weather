import { useState, useEffect } from 'react';
import { Welcome } from './pages/onboarding/Welcome';
import { StepName } from './pages/onboarding/StepName';
import { StepAge } from './pages/onboarding/StepAge';
import { StepSize } from './pages/onboarding/StepSize';
import { StepPhoto } from './pages/onboarding/StepPhoto';
import { MainScreen } from './pages/main/MainScreen';
import { WalkRecord } from './pages/main/WalkRecord';
import { EditDog } from './pages/main/EditDog';
import { MOCK_WEATHER, fetchWeather } from './utils/weather';
import type { Weather } from './utils/weather';
import { resolveUserKey } from './utils/userKey';
import { fetchDogs, saveDogs as apiSaveDogs } from './utils/api';
import './App.css';

export interface DogProfile {
  name: string;
  age: number;
  weight: number;
  photo: string;
}

type Step = 'welcome' | 'name' | 'age' | 'size' | 'photo' | 'main' | 'walk-record' | 'edit-dog';

const LEGACY_DOGS_KEY = 'dogProfiles';
const dogsKeyFor = (userKey: string) => `dogProfiles-${userKey}`;

export default function App() {
  const [userKey, setUserKey] = useState<string | null>(null);
  const [dogs, setDogs] = useState<DogProfile[]>([]);
  const [activeDogIdx, setActiveDogIdx] = useState(0);
  const [step, setStep] = useState<Step>('welcome');
  const [bootLoaded, setBootLoaded] = useState(false);

  // 온보딩 임시 상태 (새로 등록 중인 강아지)
  const [name, setName] = useState('');
  const [age, setAge] = useState(3);
  const [weight, setWeight] = useState(7);
  const [photo, setPhoto] = useState('');

  const [weather, setWeather] = useState<Weather>({ ...MOCK_WEATHER, hour: new Date().getHours() });

  useEffect(() => {
    resolveUserKey().then(async ({ key }) => {
      setUserKey(key);
      // legacy localStorage 마이그레이션 한 번 (이전 키 → 스코프된 키)
      try {
        const scopedKey = dogsKeyFor(key);
        if (!localStorage.getItem(scopedKey)) {
          const legacy = localStorage.getItem(LEGACY_DOGS_KEY);
          if (legacy) localStorage.setItem(scopedKey, legacy);
        }
      } catch {}
      const loaded = await fetchDogs(key);
      setDogs(loaded);
      setStep(loaded.length > 0 ? 'main' : 'welcome');
      setBootLoaded(true);
    });
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    if (apiKey) {
      fetchWeather(apiKey).then(setWeather).catch((err) => {
        console.error('[weather] fetch failed:', err);
      });
    } else {
      console.warn('[weather] VITE_WEATHER_API_KEY is not set, using mock data');
    }
  }, []);

  const hasExistingDog = dogs.length > 0;

  const handleFinishOnboarding = (finalPhoto?: string) => {
    if (!userKey) return;
    const newDog: DogProfile = { name: name.trim() || '보리', age, weight, photo: finalPhoto ?? photo };
    const newDogs = [...dogs, newDog];
    setDogs(newDogs);
    setActiveDogIdx(newDogs.length - 1);
    apiSaveDogs(userKey, newDogs);
    setStep('main');
  };

  const handleAddDog = () => {
    setName(''); setAge(3); setWeight(7); setPhoto('');
    setStep('name');
  };

  const handleExitApp = async () => {
    try {
      const { closeView } = await import('@apps-in-toss/web-framework');
      await closeView();
    } catch {
      // 토스 앱 밖(브라우저)에선 무시
      console.log('[exit] closeView unavailable (likely browser); ignoring');
    }
  };

  const handleDeleteDog = (idx: number) => {
    if (!userKey) return;
    const newDogs = dogs.filter((_, i) => i !== idx);
    setDogs(newDogs);
    apiSaveDogs(userKey, newDogs);
    if (newDogs.length === 0) {
      setActiveDogIdx(0);
      setStep('welcome');
    } else if (idx === activeDogIdx) {
      setActiveDogIdx(0);
    } else if (idx < activeDogIdx) {
      setActiveDogIdx(activeDogIdx - 1);
    }
  };

  const [editIdx, setEditIdx] = useState<number | null>(null);
  const handleEditDog = (idx: number) => {
    setEditIdx(idx);
    setStep('edit-dog');
  };
  const handleSaveEdit = (updated: DogProfile) => {
    if (!userKey || editIdx === null) return;
    const newDogs = dogs.map((d, i) => (i === editIdx ? updated : d));
    setDogs(newDogs);
    apiSaveDogs(userKey, newDogs);
    setEditIdx(null);
    setStep('main');
  };

  if (!bootLoaded) {
    return <div style={{ height: '100dvh' }}/>;
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {userKey && (
        <div style={{
          position: 'fixed', top: 4, right: 4, zIndex: 9999,
          fontSize: 10, padding: '2px 6px', borderRadius: 4,
          fontFamily: 'monospace',
          background: userKey.startsWith('toss-') ? 'rgba(0,128,0,0.7)' : 'rgba(0,0,0,0.6)',
          color: 'white', maxWidth: 220, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {userKey.startsWith('toss-') ? 'TOSS' : 'LOCAL'} · {userKey.slice(0, 24)}
        </div>
      )}
      {step === 'welcome'     && <Welcome onStart={() => setStep('name')}/>}
      {step === 'name'        && <StepName value={name} onChange={setName} onBack={() => hasExistingDog ? setStep('main') : setStep('welcome')} onNext={() => setStep('age')}/>}
      {step === 'age'         && <StepAge value={age} onChange={setAge} onBack={() => setStep('name')} onNext={() => setStep('size')} name={name || '우리 아이'}/>}
      {step === 'size'        && <StepSize weight={weight} onChange={setWeight} onBack={() => setStep('age')} onDone={() => setStep('photo')} name={name || '우리 아이'}/>}
      {step === 'photo'       && <StepPhoto photo={photo} onChange={setPhoto} onBack={() => setStep('size')} onDone={handleFinishOnboarding} name={name || '우리 아이'}/>}
      {step === 'main'        && (
        <MainScreen
          dogs={dogs}
          activeDogIdx={activeDogIdx}
          onSwitchDog={setActiveDogIdx}
          onAddDog={dogs.length < 2 ? handleAddDog : undefined}
          weather={weather}
          onExitApp={handleExitApp}
          onDeleteDog={handleDeleteDog}
          onEditDog={handleEditDog}
          onGoToWalkRecord={() => setStep('walk-record')}
        />
      )}
      {step === 'walk-record' && userKey && <WalkRecord dogName={dogs[activeDogIdx]?.name || '보리'} userKey={userKey} onBack={() => setStep('main')}/>}
      {step === 'edit-dog' && editIdx !== null && dogs[editIdx] && (
        <EditDog
          dog={dogs[editIdx]}
          onCancel={() => { setEditIdx(null); setStep('main'); }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
