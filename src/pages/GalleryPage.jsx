import { useState } from 'react'
import { galleryItems } from '../data/siteContent.js'

const CATEGORY_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'lot-ly', label: 'Lót Ly' },
  { id: 'moc-khoa', label: 'Móc Khóa' },
  { id: 'thuoc', label: 'Thước' },
]

const GALLERY_COLORS = [
  { bg: 'linear-gradient(135deg, #f9e8e0, #f0ccc0)', accent: '#a34558' },
  { bg: 'linear-gradient(135deg, #e8f4e8, #c8e0c8)', accent: '#527055' },
  { bg: 'linear-gradient(135deg, #f0eef8, #d8d0f0)', accent: '#6b5fa0' },
  { bg: 'linear-gradient(135deg, #fef5e0, #f0dfc0)', accent: '#b88a30' },
  { bg: 'linear-gradient(135deg, #fce4ec, #f8bbd0)', accent: '#c2185b' },
  { bg: 'linear-gradient(135deg, #e0f7fa, #b2ebf2)', accent: '#0097a7' },
  { bg: 'linear-gradient(135deg, #fff8e1, #ffe082)', accent: '#f57f17' },
  { bg: 'linear-gradient(135deg, #fce4ec, #ea80fc)', accent: '#ab47bc' },
]

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = activeFilter === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeFilter)

  return (
    <div className="page-enter gallery-page">
      <div className="gallery-page-hero">
        <div className="container">
          <span className="section-label">Thư viện ảnh</span>
          <h1 className="section-title">Những tác phẩm của R.A.W</h1>
          <p className="section-desc">
            Mỗi sản phẩm là một câu chuyện nhỏ. Khám phá bộ sưu tập resin handmade của chúng mình.
          </p>
        </div>
      </div>

      <div className="container gallery-page-body">
        <div className="filter-bar" role="group" aria-label="Lọc theo loại sản phẩm">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.id}
              className={`filter-tab${activeFilter === f.id ? ' filter-tab--active' : ''}`}
              onClick={() => setActiveFilter(f.id)}
              id={`gallery-filter-${f.id}`}
              aria-pressed={activeFilter === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="gallery-page-grid">
          {filtered.map((item, i) => {
            const config = GALLERY_COLORS[i % GALLERY_COLORS.length]

            if (item.image) {
              return (
                <div key={item.id} className="gallery-page-item gallery-page-item--real" role="img" aria-label={item.label}>
                  <img src={item.image} alt={item.label} className="gallery-page-img" loading="lazy" />
                  <div className="gallery-page-overlay">
                    <span className="gallery-page-label">{item.label}</span>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={item.id}
                className="gallery-page-item"
                style={{ background: config.bg }}
                role="img"
                aria-label={item.label}
              >
                <GalleryItemContent accent={config.accent} label={item.label} />
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-light)' }}>
            Không có ảnh nào trong mục này.
          </div>
        )}
      </div>

      <style>{`
        .gallery-page-hero {
          background: linear-gradient(135deg, var(--ivory) 0%, white 100%);
          padding: 56px 0 48px;
          border-bottom: 1px solid var(--border);
        }
        .gallery-page-body { padding: 40px 0 80px; }
        .filter-bar {
          display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px;
        }
        .filter-tab {
          padding: 9px 20px; border-radius: 100px; font-size: 0.88rem; font-weight: 500;
          color: var(--text-mid); background: var(--ivory); border: 1.5px solid var(--border);
          transition: var(--transition); cursor: pointer;
        }
        .filter-tab:hover { border-color: var(--burgundy); color: var(--burgundy); }
        .filter-tab--active { background: var(--burgundy); color: white; border-color: var(--burgundy); }
        .gallery-page-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .gallery-page-item {
          border-radius: var(--radius-md);
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: var(--transition);
        }
        .gallery-page-item:hover { transform: scale(1.03); box-shadow: var(--shadow-md); }
        .gallery-page-item--real { position: relative; overflow: hidden; }
        .gallery-page-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.4s ease;
        }
        .gallery-page-item--real:hover .gallery-page-img { transform: scale(1.06); }
        .gallery-page-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(45,35,32,0.6) 0%, transparent 50%);
          display: flex; align-items: flex-end; padding: 16px;
          border-radius: inherit; opacity: 0; transition: opacity 0.3s;
        }
        .gallery-page-item--real:hover .gallery-page-overlay { opacity: 1; }
        .gallery-page-label { font-size: 0.85rem; font-weight: 600; color: white; letter-spacing: 0.03em; }
        @media (max-width: 768px) { .gallery-page-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .gallery-page-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}

function GalleryItemContent({ accent, label }) {
  return (
    <>
      <svg viewBox="0 0 100 100" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="42" fill={accent} opacity="0.1" />
        <circle cx="50" cy="50" r="28" fill={accent} opacity="0.18" />
        <circle cx="50" cy="50" r="16" fill={accent} opacity="0.35" />
        <circle cx="50" cy="50" r="7" fill={accent} opacity="0.7" />
        <circle cx="36" cy="34" r="3.5" fill="white" opacity="0.7" />
        <circle cx="64" cy="38" r="2.5" fill="white" opacity="0.55" />
        <circle cx="30" cy="58" r="2" fill="white" opacity="0.5" />
      </svg>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-mid)', letterSpacing: '0.03em' }}>
        {label}
      </span>
    </>
  )
}
