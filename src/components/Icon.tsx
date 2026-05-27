interface IconProps {
  name: string;
  size?: number;
  color?: string;
  stroke?: number;
}

export function Icon({ name, size = 20, color = 'currentColor', stroke = 2 }: IconProps) {
  const s: React.CSSProperties = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 };
  const common = { fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'back':
      return <svg viewBox="0 0 24 24" style={s}><path d="M15 6l-6 6 6 6" {...common}/></svg>;
    case 'close':
      return <svg viewBox="0 0 24 24" style={s}><path d="M6 6l12 12M18 6L6 18" {...common}/></svg>;
    case 'dots':
      return <svg viewBox="0 0 24 24" style={s}>
        <circle cx="6" cy="12" r="1.6" fill={color}/><circle cx="12" cy="12" r="1.6" fill={color}/><circle cx="18" cy="12" r="1.6" fill={color}/>
      </svg>;
    case 'pin':
      return <svg viewBox="0 0 24 24" style={s}>
        <path d="M12 21c-3.5-4-7-7.5-7-11a7 7 0 0114 0c0 3.5-3.5 7-7 11z" {...common}/>
        <circle cx="12" cy="10" r="2.5" {...common}/>
      </svg>;
    case 'arrow-right':
      return <svg viewBox="0 0 24 24" style={s}><path d="M9 6l6 6-6 6" {...common}/></svg>;
    case 'check':
      return <svg viewBox="0 0 24 24" style={s}><path d="M5 12l4.5 4.5L19 7" {...common}/></svg>;
    case 'alert':
      return <svg viewBox="0 0 24 24" style={s}>
        <path d="M12 4l9.5 16.5h-19L12 4z" {...common}/>
        <path d="M12 11v4" {...common}/>
        <circle cx="12" cy="17.5" r="0.6" fill={color}/>
      </svg>;
    case 'clock':
      return <svg viewBox="0 0 24 24" style={s}>
        <circle cx="12" cy="12" r="9" {...common}/><path d="M12 7v5l3.5 2" {...common}/>
      </svg>;
    case 'paw':
      return <svg viewBox="0 0 24 24" style={s} fill={color}>
        <ellipse cx="7" cy="10" rx="2" ry="2.6"/>
        <ellipse cx="12" cy="7.5" rx="2" ry="2.8"/>
        <ellipse cx="17" cy="10" rx="2" ry="2.6"/>
        <ellipse cx="5" cy="15" rx="1.6" ry="2.2"/>
        <path d="M12 12c-3.2 0-5.5 2.2-5.5 4.6 0 1.8 1.3 2.8 3 2.8 1.1 0 1.6-.5 2.5-.5s1.4.5 2.5.5c1.7 0 3-1 3-2.8 0-2.4-2.3-4.6-5.5-4.6z"/>
      </svg>;
    case 'sun':
      return <svg viewBox="0 0 24 24" style={s}>
        <circle cx="12" cy="12" r="4" fill={color}/>
        <g stroke={color} strokeWidth="2" strokeLinecap="round">
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4"/>
        </g>
      </svg>;
    case 'cloud':
      return <svg viewBox="0 0 24 24" style={s}>
        <path d="M7 18a4 4 0 010-8 5 5 0 019.6-1.5A4 4 0 1117 18H7z" fill={color}/>
      </svg>;
    case 'rain':
      return <svg viewBox="0 0 24 24" style={s}>
        <path d="M7 14a4 4 0 010-8 5 5 0 019.6-1.5A4 4 0 1117 14H7z" fill={color}/>
        <g stroke={color} strokeWidth="2" strokeLinecap="round">
          <path d="M9 18l-1 2M13 18l-1 2M17 18l-1 2"/>
        </g>
      </svg>;
    case 'snow':
      return <svg viewBox="0 0 24 24" style={s}>
        <g stroke={color} strokeWidth="2" strokeLinecap="round">
          <path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13"/>
        </g>
      </svg>;
    case 'thermometer':
      return <svg viewBox="0 0 24 24" style={s}>
        <path d="M14 4a2 2 0 10-4 0v10.5a4 4 0 104 0V4z" {...common}/><circle cx="12" cy="17" r="1.5" fill={color}/>
      </svg>;
    case 'uv':
      return <svg viewBox="0 0 24 24" style={s}>
        <circle cx="12" cy="13" r="3.5" {...common}/>
        <g stroke={color} strokeWidth="2" strokeLinecap="round">
          <path d="M12 4v3M5 13H2M22 13h-3M6.5 7.5L4.5 5.5M17.5 7.5l2-2"/>
        </g>
      </svg>;
    case 'dust':
      return <svg viewBox="0 0 24 24" style={s}>
        <g stroke={color} strokeWidth="2" strokeLinecap="round">
          <path d="M3 8h14M3 12h18M3 16h12"/>
        </g>
      </svg>;
    case 'road':
      return <svg viewBox="0 0 24 24" style={s}>
        <path d="M6 21l3-18h6l3 18" {...common}/><path d="M12 6v3M12 12v3M12 18v1" {...common}/>
      </svg>;
    case 'minus':
      return <svg viewBox="0 0 24 24" style={s}><path d="M5 12h14" {...common}/></svg>;
    case 'plus':
      return <svg viewBox="0 0 24 24" style={s}><path d="M12 5v14M5 12h14" {...common}/></svg>;
    default:
      return null;
  }
}
