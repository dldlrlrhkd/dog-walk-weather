interface WelcomeProps {
  onStart: () => void;
}

export function Welcome({ onStart }: WelcomeProps) {
  return (
    <div className="welcome fade-enter">
      <div className="welcome-content">
        <div className="hero-art">
          <img src="/강아지로고 복사.png" alt="강아지 로고" style={{ width: 200, height: 200, objectFit: 'contain', borderRadius: 32 }}/>
        </div>
        <div>
          <h1>오늘 산책,<br/><span className="accent">우리 아이</span>한테 괜찮을까?</h1>
          <p>날씨를 견종/나이/체중으로 풀어서<br/>안전하게 산책할 수 있는 시간을 알려드려요</p>
        </div>
      </div>
      <div className="footer-cta">
        <button className="cta" onClick={onStart}>강아지 등록하고 시작하기</button>
      </div>
    </div>
  );
}
