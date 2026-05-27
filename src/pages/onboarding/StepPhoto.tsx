import { useRef, useState } from 'react';
import { Icon } from '../../components/Icon';

interface StepPhotoProps {
  photo: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onDone: (finalPhoto?: string) => void;
  name: string;
}

const VIEWPORT = 200;

export function StepPhoto({ photo, onChange, onBack, onDone, name }: StepPhotoProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const minSide = Math.min(imgSize.w, imgSize.h) || 1;
  const baseScale = VIEWPORT / minSide;
  const displayedW = imgSize.w * baseScale * zoom;
  const displayedH = imgSize.h * baseScale * zoom;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setImgSize({ w: img.width, h: img.height });
        setOffset({ x: 0, y: 0 });
        setZoom(1);
        setRawImage(result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const commitCrop = (): Promise<string | null> => new Promise((resolve) => {
    if (!rawImage) return resolve(null);
    const img = new Image();
    img.onload = () => {
      const size = 300;
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const sx = ((displayedW - VIEWPORT) / 2 - offset.x) / (baseScale * zoom);
      const sy = ((displayedH - VIEWPORT) / 2 - offset.y) / (baseScale * zoom);
      const sSize = VIEWPORT / (baseScale * zoom);
      ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, size, size);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = rawImage;
  });

  const handleDone = async () => {
    if (rawImage) {
      const cropped = await commitCrop();
      if (cropped) {
        onChange(cropped);
        onDone(cropped);
        return;
      }
    }
    onDone();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  };
  const handlePointerUp = () => { dragStart.current = null; };

  return (
    <div className="onb fade-enter">
      <div className="progress">
        <span className="seg on"/><span className="seg on"/><span className="seg on"/><span className="seg on"/>
      </div>
      <div className="q"><span className="accent">{name}</span>의<br/>사진을 등록해주세요</div>
      <div className="q-sub">{rawImage ? '드래그로 위치를 조정하고 슬라이더로 확대/축소하세요' : '프로필에 표시돼요. 나중에 바꿀 수 있어요'}</div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
        {rawImage ? (
          <div
            className="photo-editor-viewport"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <img
              src={rawImage}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                width: displayedW,
                height: displayedH,
                left: (VIEWPORT - displayedW) / 2 + offset.x,
                top: (VIEWPORT - displayedH) / 2 + offset.y,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          </div>
        ) : (
          <button className="photo-picker" onClick={() => fileRef.current?.click()}>
            {photo
              ? <img src={photo} alt="강아지 사진" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              : (
                <div className="photo-picker-empty">
                  <Icon name="plus" size={32} color="var(--blue)"/>
                  <span>사진 선택</span>
                </div>
              )}
          </button>
        )}
      </div>

      {rawImage && (
        <div className="photo-editor-controls">
          <input
            type="range" min={1} max={3} step={0.01}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
          />
          <button className="photo-editor-reselect" onClick={() => { setRawImage(null); if (fileRef.current) fileRef.current.value = ''; fileRef.current?.click(); }}>
            다시 선택
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile}/>

      <div className="footer footer-row">
        <button className="cta-back" onClick={onBack}>뒤로</button>
        <button className="cta" onClick={handleDone}>{rawImage || photo ? '완료' : '건너뛰기'}</button>
      </div>
    </div>
  );
}
