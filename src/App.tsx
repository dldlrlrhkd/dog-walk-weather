import { useState, useEffect } from 'react';
import { Welcome } from './pages/onboarding/Welcome';
import { StepName } from './pages/onboarding/StepName';
import { StepAge } from './pages/onboarding/StepAge';
import { StepSize } from './pages/onboarding/StepSize';
import { StepPhoto } from './pages/onboarding/StepPhoto';
import { MainScreen } from './pages/main/MainScreen';
import { WalkRecord } from './pages/main/WalkRecord';
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

type Step = 'welcome' | 'name' | 'age' | 'size' | 'photo' | 'main' | 'walk-record';

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

  const handleReset = () => {
    if (userKey) {
      localStorage.removeItem(dogsKeyFor(userKey));
      apiSaveDogs(userKey, []);
    }
    localStorage.removeItem(LEGACY_DOGS_KEY);
    setDogs([]); setActiveDogIdx(0);
    setName(''); setAge(3); setWeight(7); setPhoto('');
    setStep('welcome');
  };

  if (!bootLoaded) {
    return <div style={{ height: '100dvh' }}/>;
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
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
          onReset={handleReset}
          onGoToWalkRecord={() => setStep('walk-record')}
        />
      )}
      {step === 'walk-record' && userKey && <WalkRecord dogName={dogs[activeDogIdx]?.name || '보리'} userKey={userKey} onBack={() => setStep('main')}/>}
    </div>
  );
}
