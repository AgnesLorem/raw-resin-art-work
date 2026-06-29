import { Link } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import ProcessSection from '../components/ProcessSection.jsx'
import GallerySection from '../components/GallerySection.jsx'
import ContactSection from '../components/ContactSection.jsx'
import { getFeaturedProducts } from '../data/products.js'
import { aboutContent, whyUsPoints } from '../data/siteContent.js'

const featured = getFeaturedProducts()

export default function HomePage() {
  return (
    <div className="page-enter">
      <Hero />

      {/* About section */}
      <section className="about-section section-gap" style={{ background: 'white' }}>
        <div className="container about-inner">
          <div className="about-text">
            <span className="section-label">{aboutContent.label}</span>
            <h2 className="section-title">{aboutContent.title}</h2>
            <p className="section-desc">{aboutContent.description}</p>
            <Link to="/lien-he" className="btn-sage" style={{ marginTop: 8, alignSelf: 'flex-start' }} id="about-cta">
              Liên hệ với chúng mình
            </Link>
          </div>
          <div className="about-highlights">
            {aboutContent.highlights.map((h) => (
              <div key={h.title} className="highlight-card">
                <span className="highlight-icon">{h.icon}</span>
                <div>
                  <h3 className="highlight-title">{h.title}</h3>
                  <p className="highlight-desc">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="featured-section section-gap">
        <div className="container">
          <div className="featured-header">
            <div>
              <span className="section-label">Sản phẩm</span>
              <h2 className="section-title">Bộ sưu tập nổi bật</h2>
            </div>
            <Link to="/san-pham" className="btn-secondary" id="featured-see-all">Xem tất cả</Link>
          </div>
          <ProductGrid products={featured} />
        </div>
      </section>

      <ProcessSection />

      {/* Why us */}
      <section className="why-section section-gap" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="section-label">Điểm khác biệt</span>
            <h2 className="section-title" style={{ margin: '0 auto' }}>Tại sao chọn R.A.W?</h2>
          </div>
          <div className="why-grid">
            {whyUsPoints.map((p) => (
              <div key={p.title} className="why-card">
                <div className="why-icon">{p.icon}</div>
                <h3 className="why-title">{p.title}</h3>
                <p className="why-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GallerySection limit={6} />
      <ContactSection />

      <style>{`
        .about-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
        }
        .about-text { display: flex; flex-direction: column; gap: 16px; }
        .about-highlights { display: flex; flex-direction: column; gap: 16px; }
        .highlight-card {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          padding: 18px;
          background: var(--cream);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          transition: var(--transition);
        }
        .highlight-card:hover { box-shadow: var(--shadow-sm); transform: translateX(4px); }
        .highlight-icon { font-size: 1.2rem; flex-shrink: 0; margin-top: 2px; }
        .highlight-title { font-size: 1rem; font-weight: 600; color: var(--text-dark); margin-bottom: 4px; font-family: var(--font-sans); }
        .highlight-desc { font-size: 0.88rem; color: var(--text-mid); line-height: 1.55; }
        .featured-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 36px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .why-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .why-card {
          text-align: center;
          padding: 32px 20px;
          background: var(--cream);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: var(--transition);
        }
        .why-card:hover { box-shadow: var(--shadow-md); transform: translateY(-4px); }
        .why-icon { font-size: 2.2rem; }
        .why-title { font-size: 1rem; font-weight: 600; color: var(--text-dark); font-family: var(--font-sans); }
        .why-desc { font-size: 0.88rem; color: var(--text-mid); line-height: 1.55; }
        @media (max-width: 900px) {
          .about-inner { grid-template-columns: 1fr; gap: 40px; }
          .why-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
          .why-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
