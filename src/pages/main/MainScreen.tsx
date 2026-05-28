import { useRef, useState } from 'react';
import { Icon } from '../../components/Icon';
import { BannerAd } from '../../components/BannerAd';

const BANNER_AD_ID = 'ait.v2.live.8e970fc8ca33487b';
import { computeWalkSafety, buildHourly, buildDailySummary } from '../../utils/weather';
import type { Weather } from '../../utils/weather';
import type { DogProfile } from '../../App';

interface MainScreenProps {
  dogs: DogProfile[];
  activeDogIdx: number;
  onSwitchDog: (idx: number) => void;
  onAddDog?: () => void;
  weather: Weather;
  onExitApp: () => void;
  onDeleteDog: (idx: number) => void;
  onEditDog: (idx: number) => void;
  onGoToWalkRecord: () => void;
}

export function MainScreen({ dogs, activeDogIdx, onSwitchDog, onAddDog, weather, onExitApp, onDeleteDog, onEditDog, onGoToWalkRecord }: MainScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDeleteClick = () => {
    setMenuOpen(false);
    if (!window.confirm(`${dog.name}를 정말 삭제할까요?\n등록 정보가 사라집니다.`)) return;
    onDeleteDog(activeDogIdx);
  };

  const dog = dogs[activeDogIdx] ?? { name: '보리', age: 3, weight: 7, photo: '' };
  const otherDog = dogs.length === 2 ? dogs[activeDogIdx === 0 ? 1 : 0] : null;

  const safety = computeWalkSafety(weather, dog);
  const hourly = weather.hourly ?? buildHourly(weather, weather.hour);
  const dailySummary = buildDailySummary(weather, hourly);

  const tempIdealLow = dog.weight < 10 ? 10 : 7;
  const tempIdealHigh = dog.weight < 10 ? 20 : 20;
  const tempStatus = weather.feelsLike < tempIdealLow - 6 || weather.feelsLike > tempIdealHigh + 6 ? 'danger'
    : weather.feelsLike < tempIdealLow - 2 || weather.feelsLike > tempIdealHigh + 3 ? 'warn' : 'safe';
  const tempStatusLabel = tempStatus === 'safe' ? '쾌적' : tempStatus === 'warn' ? '주의' : '위험';

  const roadTemp = weather.condition === 'rain' || weather.condition === 'snow' || weather.condition === 'cloudy'
    ? weather.temp + 2 : Math.round(weather.temp * 1.6 + 4);
  const roadStatus = roadTemp >= 50 ? 'danger' : roadTemp >= 38 ? 'warn' : roadTemp < -3 ? 'warn' : 'safe';
  const roadStatusLabel = roadStatus === 'safe' ? '안전' : roadStatus === 'warn' ? '주의' : '화상 위험';

  const pmStatus = weather.pm > 75 ? 'danger' : weather.pm > 35 ? 'warn' : 'safe';
  const pmLabel = pmStatus === 'safe' ? '좋음' : pmStatus === 'warn' ? '보통' : '나쁨';
  const uvStatus = weather.uv >= 8 ? 'danger' : weather.uv >= 6 ? 'warn' : 'safe';
  const uvLabel = uvStatus === 'safe' ? '낮음' : uvStatus === 'warn' ? '높음' : '매우높음';

  const sizeTag = dog.weight < 10 ? '소형견' : dog.weight < 25 ? '중형견' : '대형견';
  const hourlyIconColor = (c: string) =>
    c === 'rain' ? '#6B7280' : c === 'snow' ? '#93C5FD' : c === 'cloud' ? '#94A3B8' : '#F59E0B';

  const hourlyRef = useRef<HTMLDivElement>(null);
  const scrollHourly = (dir: -1 | 1) => {
    const el = hourlyRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      <div className="topnav">
        <button className="icon-btn" onClick={onExitApp}><Icon name="back" size={22}/></button>
        <div className="nav-title">
          <Icon name="paw" size={18} color="var(--blue)"/>
          산책 지수
        </div>
        <div className="right-grp">
          <div className="divider"/>
          <button className="icon-btn"><Icon name="close" size={18}/></button>
        </div>
      </div>

      <div className="scroll">
        {/* 프로필 헤더 */}
        <div className="profile-header">
          <div className="profile-main">
            <div className="profile-avatar">
              {dog.photo
                ? <img src={dog.photo} alt={dog.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                : <Icon name="paw" size={28} color="var(--blue)"/>}
            </div>
            <div className="profile-info">
              <div className="profile-name">{dog.name}</div>
              <div className="profile-detail">{dog.age}살<span className="sep">·</span>{sizeTag}</div>
            </div>
          </div>

          <div className="profile-actions">
            {/* ⋯ 더보기 메뉴 */}
            <div style={{ position: 'relative' }}>
              <button className="icon-btn-small" onClick={() => setMenuOpen(o => !o)} aria-label="더보기">
                <Icon name="dots" size={20} color="var(--text-3)"/>
              </button>
              {menuOpen && (
                <>
                  <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />
                  <div className="dog-menu">
                    <button onClick={() => { setMenuOpen(false); onEditDog(activeDogIdx); }} className="dog-menu-item">
                      정보 변경
                    </button>
                    <button onClick={handleDeleteClick} className="dog-menu-delete">
                      {dog.name} 삭제
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* 두 번째 강아지 스위치 or 추가 버튼 */}
            {otherDog ? (
              <button
                className="dog-switch-btn"
                onClick={() => onSwitchDog(activeDogIdx === 0 ? 1 : 0)}
                title={`${otherDog.name}로 전환`}
              >
                <div className="dog-switch-avatar">
                  {otherDog.photo
                    ? <img src={otherDog.photo} alt={otherDog.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    : <Icon name="paw" size={16} color="var(--text-3)"/>}
                </div>
                <span className="dog-switch-name">{otherDog.name}</span>
              </button>
            ) : onAddDog ? (
              <button className="add-dog-btn" onClick={onAddDog} aria-label="강아지 추가" title="강아지 추가">
                <Icon name="plus" size={20} color="var(--blue)"/>
              </button>
            ) : null}
          </div>
        </div>

        {/* 1. 산책 지수 */}
        <div className="section-title">
          산책 지수
          {weather.location && (
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Icon name="pin" size={13} color="var(--text-3)"/>
              {weather.location}
            </span>
          )}
        </div>
        <div className="idx-card">
          <div className="top">
            <div>
              <div className="label">100점 만점</div>
              <div className="score-row">
                <span className={`score ${safety.status}`}>{safety.score}</span>
                <span className="unit">점</span>
              </div>
            </div>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: safety.status === 'safe' ? 'var(--green-soft)' : safety.status === 'warn' ? 'var(--orange-soft)' : 'var(--red-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon
                name={weather.condition === 'rain' ? 'rain' : weather.condition === 'snow' ? 'snow' : weather.condition === 'cloudy' ? 'cloud' : 'sun'}
                size={28}
                color={weather.condition === 'rain' ? '#6B7280' : weather.condition === 'snow' ? '#93C5FD' : weather.condition === 'cloudy' ? '#94A3B8' : '#F59E0B'}
              />
            </div>
          </div>
          <div className={`verdict-tag-big ${safety.status}`}>{safety.statusLabel}</div>
          <div className="verdict-headline">{safety.headline}</div>
          {safety.status === 'danger' && (
            <div className="verdict-hint">⏰ 몇 시간 뒤에는 날씨가 좋아져요</div>
          )}
        </div>

        {/* 2. 시간별 예보 */}
        <div className="section-title">시간별 예보</div>
        <div className="daily-summary">{dailySummary}</div>
        <div className="hourly-wrap">
          <button className="hourly-nav-btn left" onClick={() => scrollHourly(-1)} aria-label="이전 시간">
            <Icon name="back" size={14}/>
          </button>
          <div className="hourly" ref={hourlyRef}>
            {hourly.map((h, i) => (
              <div key={i} className={`hour${i === 0 ? ' now' : ''}`}>
                <div className="t">{i === 0 ? '지금' : `${h.h}시`}</div>
                <div className="ic">
                  <Icon name={h.c} size={22} color={i === 0 ? 'white' : hourlyIconColor(h.c)}/>
                </div>
                <div className="tmp">{h.t}°</div>
                <div className="rain">{h.r > 0 ? `${h.r}%` : ''}</div>
              </div>
            ))}
          </div>
          <button className="hourly-nav-btn right flip" onClick={() => scrollHourly(1)} aria-label="다음 시간">
            <Icon name="back" size={14}/>
          </button>
        </div>

        {/* 배너 광고 */}
        <BannerAd adGroupId={BANNER_AD_ID} />

        {/* 3. 자세히 보기 */}
        <div className="section-title">자세히 보기</div>
        <div className="detail-grid">
          <div className="metric">
            <div className="mt"><Icon name="thermometer" size={14} color="var(--text-3)"/>체감온도</div>
            <div className="mv">{weather.feelsLike}<span className="unit">°C</span></div>
            <div className={`ms ${tempStatus}`}>{tempStatusLabel}</div>
          </div>
          <div className="metric">
            <div className="mt"><Icon name="road" size={14} color="var(--text-3)"/>노면 온도</div>
            <div className="mv">{roadTemp}<span className="unit">°C</span></div>
            <div className={`ms ${roadStatus}`}>{roadStatusLabel}</div>
          </div>
          <div className="metric">
            <div className="mt"><Icon name="dust" size={14} color="var(--text-3)"/>미세먼지</div>
            <div className="mv">{weather.pm}<span className="unit">㎍/㎥</span></div>
            <div className={`ms ${pmStatus}`}>{pmLabel}</div>
          </div>
          <div className="metric">
            <div className="mt"><Icon name="uv" size={14} color="var(--text-3)"/>자외선</div>
            <div className="mv">{weather.uv}<span className="unit">UV</span></div>
            <div className={`ms ${uvStatus}`}>{uvLabel}</div>
          </div>
        </div>

      </div>

      <div className="footer-cta">
        <button className="cta" onClick={onGoToWalkRecord}>
          <Icon name="paw" size={20} color="#fff"/>
          <span style={{ marginLeft: 8 }}>산책 기록하고 포인트 받기</span>
        </button>
      </div>
    </div>
  );
}
