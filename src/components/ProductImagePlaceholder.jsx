/**
 * CSS SVG-based placeholder for products without real photos.
 * Each category gets a distinct color and icon.
 */

const CATEGORY_CONFIG = {
  'Đồ dùng bàn': { bg: 'radial-gradient(circle at 40% 35%, #fef0e8, #f5d9c8)', accent: '#a34558', icon: 'coaster' },
  'Phụ kiện': { bg: 'radial-gradient(circle at 40% 35%, #eef5ee, #c8dfc9)', accent: '#527055', icon: 'keychain' },
  'Văn phòng phẩm': { bg: 'radial-gradient(circle at 40% 35%, #f0eef8, #d8d0f0)', accent: '#6b5fa0', icon: 'bookmark' },
}

export default function ProductImagePlaceholder({ name, category }) {
  const config = CATEGORY_CONFIG[category] ?? { bg: 'radial-gradient(circle at 40% 35%, #faf6f0, #ece4d8)', accent: '#7b2d3e', icon: 'coaster' }

  return (
    <div
      className="ph-wrapper"
      style={{ background: config.bg }}
      role="img"
      aria-label={`Ảnh minh họa ${name}`}
    >
      <div className="ph-icon">
        {config.icon === 'coaster' && <CoasterSVG accent={config.accent} />}
        {config.icon === 'keychain' && <KeychainSVG accent={config.accent} />}
        {config.icon === 'bookmark' && <BookmarkSVG accent={config.accent} />}
      </div>
      <span className="ph-label">{name}</span>

      <style>{`
        .ph-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 200px;
        }
        .ph-icon { display: flex; align-items: center; justify-content: center; }
        .ph-label {
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--text-light);
          font-style: italic;
          letter-spacing: 0.03em;
        }
      `}</style>
    </div>
  )
}

function CoasterSVG({ accent }) {
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="52" fill="white" opacity="0.7" />
      <circle cx="60" cy="60" r="50" fill="none" stroke={accent} strokeWidth="2" opacity="0.3" />
      <path d="M30 50 Q45 30 60 50 Q75 70 90 50" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M28 65 Q45 45 60 65 Q75 85 92 65" stroke="#7a9e7e" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4"/>
      {[0,60,120,180,240,300].map((a, i) => (
        <ellipse key={i} cx={60 + 18 * Math.cos(a * Math.PI / 180)} cy={60 + 18 * Math.sin(a * Math.PI / 180)}
          rx="6" ry="3.5" fill="#f4c5c5" opacity="0.75"
          transform={`rotate(${a}, ${60 + 18 * Math.cos(a*Math.PI/180)}, ${60 + 18 * Math.sin(a*Math.PI/180)})`} />
      ))}
      <circle cx="60" cy="60" r="7" fill="#c8a882" opacity="0.8" />
      <circle cx="42" cy="42" r="2" fill="#d4a853" opacity="0.8" />
      <circle cx="78" cy="44" r="1.5" fill={accent} opacity="0.6" />
    </svg>
  )
}

function KeychainSVG({ accent }) {
  return (
    <svg viewBox="0 0 120 120" width="110" height="110" xmlns="http://www.w3.org/2000/svg">
      {/* Ring */}
      <circle cx="60" cy="28" r="14" fill="none" stroke="#c8a882" strokeWidth="4" />
      {/* Heart */}
      <path d="M60 98 C60 98 30 78 30 58 a16 16 0 0 1 30-8 16 16 0 0 1 30 8 C90 78 60 98 60 98Z" fill={accent} opacity="0.85" />
      <path d="M52 55 Q60 48 68 55" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      <circle cx="48" cy="65" r="2" fill="white" opacity="0.5" />
      {/* Chain link */}
      <line x1="60" y1="44" x2="60" y2="62" stroke="#c8a882" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function BookmarkSVG({ accent }) {
  return (
    <svg viewBox="0 0 120 120" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      {/* Tassel/string at the top */}
      <path d="M60 20 Q55 10 50 15 Q45 20 60 25" fill="none" stroke="#c8a882" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="22" x2="60" y2="35" stroke="#c8a882" strokeWidth="2.5" />
      {/* Bookmark body */}
      <rect x="42" y="32" width="36" height="72" rx="4" fill="white" opacity="0.75" />
      <rect x="42" y="32" width="36" height="72" rx="4" fill="none" stroke={accent} strokeWidth="2" opacity="0.3" />
      {/* Flowers inside */}
      <circle cx="54" cy="52" r="4.5" fill="#f4c5c5" opacity="0.8" />
      <circle cx="66" cy="68" r="3.5" fill="#7a9e7e" opacity="0.7" />
      <circle cx="56" cy="84" r="5" fill="#d4a853" opacity="0.8" />
      <circle cx="62" cy="50" r="1.5" fill={accent} opacity="0.6" />
    </svg>
  )
}
