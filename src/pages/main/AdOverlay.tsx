import { Icon } from '../../components/Icon';

interface AdOverlayProps {
  remaining: number;
  onClose: () => void;
}

export function AdOverlay({ remaining, onClose }: AdOverlayProps) {
  const canClose = remaining <= 0;
  return (
    <div className="ad-overlay">
      <div className="ad-top">
        <div className="ad-tag">광고</div>
        {canClose ? (
          <button className="ad-close" onClick={onClose} aria-label="닫기">
            <Icon name="close" size={18} color="#fff"/>
          </button>
        ) : (
          <div className="ad-timer">{remaining}초 후 닫기</div>
        )}
      </div>
      <div className="ad-body">
        <div className="ad-card">
          <div className="ad-imgslot">
            <div className="ad-imgslot-label">광고 이미지</div>
          </div>
          <div className="ad-brand">PAWFIT · 반려동물 영양제</div>
          <div className="ad-title">우리 아이 관절 건강,<br/>지금 시작하세요</div>
          <div className="ad-sub">7일 무료 체험 · 후기 12,000+</div>
          <button className="ad-cta">
            자세히 보기
            <Icon name="arrow-right" size={18} color="#fff"/>
          </button>
        </div>
        <div className="ad-foot">광고를 끝까지 보면 산책 기록이 저장됩니다</div>
      </div>
    </div>
  );
}
