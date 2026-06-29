import { Link } from 'react-router-dom'
import { galleryItems } from '../data/siteContent.js'

const GALLERY_COLORS = [
  { bg: 'linear-gradient(135deg, #f9e8e0, #f0ccc0)', accent: '#a34558' },
  { bg: 'linear-gradient(135deg, #e8f4e8, #c8e0c8)', accent: '#527055' },
  { bg: 'linear-gradient(135deg, #f0eef8, #d8d0f0)', accent: '#6b5fa0' },
  { bg: 'linear-gradient(135deg, #fef5e0, #f0dfc0)', accent: '#b88a30' },
  { bg: 'linear-gradient(135deg, #fce4ec, #f8bbd0)', accent: '#c2185b' },
  { bg: 'linear-gradient(135deg, #e0f7fa, #b2ebf2)', accent: '#0097a7' },
]

function GalleryPlaceholder({ item, index }) {
  const config = GALLERY_COLORS[index % GALLERY_COLORS.length]
  return (
    <div
      className="gallery-item"
      style={{ background: config.bg }}
      role="img"
      aria-label={item.label}
    >
      <GalleryIcon accent={config.accent} />
      <span className="gallery-item-label">{item.label}</span>
    </div>
  )
}

export default function GallerySection({ limit = 6 }) {
  const displayed = galleryItems.slice(0, limit)
  return (
    <section className="gallery-section section-gap" style={{ background: 'var(--ivory)' }}>
      <div className="container">
        <div className="gallery-header">
          <div>
            <span className="section-label">Thư viện</span>
            <h2 className="section-title">Những tác phẩm nhỏ</h2>
            <p className="section-desc">Mỗi chiếc là một lần đổ resin, một lần thổi hồn vào vật liệu.</p>
          </div>
          <Link to="/thu-vien" className="btn-secondary" id="gallery-see-more">Xem tất cả</Link>
        </div>

        <div className="gallery-grid">
          {displayed.map((item, i) => (
            <GalleryPlaceholder key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        .gallery-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 200px;
          gap: 16px;
        }
        .gallery-grid > *:nth-child(1) { grid-row: span 2; }
        .gallery-grid > *:nth-child(4) { grid-row: span 2; }
        .gallery-item {
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: var(--transition);
          overflow: hidden;
          position: relative;
        }
        .gallery-item::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0);
          transition: background 0.3s;
          border-radius: inherit;
        }
        .gallery-item:hover::after { background: rgba(0,0,0,0.04); }
        .gallery-item:hover { transform: scale(1.02); box-shadow: var(--shadow-md); }
        .gallery-item-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-mid);
          letter-spacing: 0.03em;
          z-index: 1;
        }
        @media (max-width: 768px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 160px; }
          .gallery-grid > *:nth-child(1),
          .gallery-grid > *:nth-child(4) { grid-row: span 1; }
        }
        @media (max-width: 480px) {
          .gallery-grid { grid-template-columns: 1fr; grid-auto-rows: 150px; }
        }
      `}</style>
    </section>
  )
}

function GalleryIcon({ accent }) {
  return (
    <svg viewBox="0 0 80 80" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="32" fill={accent} opacity="0.1" />
      <circle cx="40" cy="40" r="22" fill={accent} opacity="0.15" />
      <circle cx="40" cy="40" r="12" fill={accent} opacity="0.35" />
      <circle cx="40" cy="40" r="5" fill={accent} opacity="0.7" />
      <circle cx="30" cy="28" r="3" fill={accent} opacity="0.5" />
      <circle cx="52" cy="32" r="2" fill={accent} opacity="0.4" />
      <circle cx="26" cy="48" r="2.5" fill={accent} opacity="0.35" />
    </svg>
  )
}
