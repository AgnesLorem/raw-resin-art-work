import { Link } from 'react-router-dom'
import { heroContent } from '../data/siteContent.js'

export default function Hero() {
  return (
    <section className="hero">
      {/* Decorative blobs */}
      <div className="hero-blob hero-blob--1" aria-hidden="true" />
      <div className="hero-blob hero-blob--2" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-content">
          <span className="section-label">Handmade · Cá nhân hóa</span>
          <h1 className="hero-title">
            {heroContent.headline}
          </h1>
          <p className="hero-sub">{heroContent.subHeadline}</p>
          <p className="hero-desc">{heroContent.description}</p>
          <div className="hero-ctas">
            <Link to={heroContent.ctaLink} className="btn-primary">
              {heroContent.ctaText}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/lien-he" className="btn-secondary">
              Đặt theo yêu cầu
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">100%</span>
              <span className="hero-stat-label">Handmade</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">∞</span>
              <span className="hero-stat-label">Tùy chỉnh</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">3+</span>
              <span className="hero-stat-label">Dòng sản phẩm</span>
            </div>
          </div>
        </div>

        {/* Hero visual */}
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card hero-card--main">
            <ResinIllustration />
            <div className="hero-card-label">Lót ly Resin</div>
          </div>
          <div className="hero-card hero-card--sm hero-card--top">
            <ResinIllustrationSm color="#a34558" />
            <div className="hero-card-label-sm">Móc khóa</div>
          </div>
          <div className="hero-card hero-card--sm hero-card--bottom">
            <ResinIllustrationSm color="#7a9e7e" />
            <div className="hero-card-label-sm">Bookmark Resin</div>
          </div>
        </div>
      </div>

      <style>{`
        .hero {
          position: relative;
          overflow: hidden;
          min-height: calc(100vh - 68px);
          display: flex;
          align-items: center;
          padding: 60px 0;
        }
        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.18;
          pointer-events: none;
        }
        .hero-blob--1 {
          width: 600px;
          height: 600px;
          background: var(--burgundy);
          top: -200px;
          right: -100px;
        }
        .hero-blob--2 {
          width: 400px;
          height: 400px;
          background: var(--sage);
          bottom: -100px;
          left: -80px;
        }
        .hero-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .hero-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .hero-title {
          font-size: clamp(2.8rem, 6vw, 4.5rem);
          font-weight: 700;
          line-height: 1.1;
          background: linear-gradient(135deg, var(--burgundy-dark) 0%, var(--burgundy-light) 60%, var(--warm-brown) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 1.2rem;
          color: var(--sage-dark);
        }
        .hero-desc {
          color: var(--text-mid);
          font-size: 1.05rem;
          line-height: 1.7;
          max-width: 480px;
        }
        .hero-ctas {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 8px;
        }
        .hero-stats {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 16px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .hero-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .hero-stat-num {
          font-family: var(--font-serif);
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--burgundy);
          line-height: 1;
        }
        .hero-stat-label {
          font-size: 0.75rem;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .hero-stat-divider {
          width: 1px;
          height: 32px;
          background: var(--border);
        }
        /* Hero visual */
        .hero-visual {
          position: relative;
          height: 460px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-card {
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: absolute;
        }
        .hero-card--main {
          width: 260px;
          height: 260px;
          animation: float 4s ease-in-out infinite;
        }
        .hero-card--sm {
          width: 140px;
          height: 140px;
          border-radius: var(--radius-md);
        }
        .hero-card--top {
          top: 30px;
          right: 10px;
          animation: float 4s ease-in-out infinite;
          animation-delay: -1s;
        }
        .hero-card--bottom {
          bottom: 40px;
          right: 0;
          animation: float 4s ease-in-out infinite;
          animation-delay: -2.5s;
        }
        .hero-card-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-mid);
          padding: 8px 0 12px;
          letter-spacing: 0.02em;
        }
        .hero-card-label-sm {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-mid);
          padding: 4px 0 8px;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @media (max-width: 900px) {
          .hero-inner { grid-template-columns: 1fr; gap: 40px; }
          .hero-visual { height: 300px; }
          .hero-card--main { width: 200px; height: 200px; }
          .hero-card--sm { width: 110px; height: 110px; }
        }
        @media (max-width: 480px) {
          .hero { min-height: auto; padding: 48px 0 40px; }
          .hero-title { font-size: 2.4rem; }
          .hero-visual { display: none; }
        }
      `}</style>
    </section>
  )
}

function ResinIllustration() {
  return (
    <svg viewBox="0 0 200 160" width="200" height="160" xmlns="http://www.w3.org/2000/svg">
      {/* Coaster base */}
      <ellipse cx="100" cy="100" rx="70" ry="12" fill="rgba(123,45,62,0.08)" />
      <circle cx="100" cy="80" r="68" fill="url(#grad1)" />
      <circle cx="100" cy="80" r="62" fill="rgba(255,255,255,0.6)" />
      {/* Resin swirls */}
      <path d="M60 60 Q80 40 100 60 Q120 80 140 60" stroke="#a34558" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M55 80 Q80 60 100 80 Q120 100 145 80" stroke="#7a9e7e" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.45"/>
      <path d="M70 95 Q90 75 110 95 Q130 115 150 95" stroke="#c8a882" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4"/>
      {/* Flower petals */}
      {[0,60,120,180,240,300].map((angle, i) => (
        <ellipse
          key={i}
          cx={100 + 24 * Math.cos((angle * Math.PI) / 180)}
          cy={80 + 24 * Math.sin((angle * Math.PI) / 180)}
          rx="7" ry="4"
          fill="#f4c5c5"
          opacity="0.7"
          transform={`rotate(${angle}, ${100 + 24 * Math.cos((angle * Math.PI) / 180)}, ${80 + 24 * Math.sin((angle * Math.PI) / 180)})`}
        />
      ))}
      <circle cx="100" cy="80" r="8" fill="#c8a882" opacity="0.8" />
      {/* Sparkles */}
      <circle cx="75" cy="58" r="2.5" fill="#d4a853" opacity="0.8" />
      <circle cx="130" cy="65" r="1.8" fill="#7a9e7e" opacity="0.8" />
      <circle cx="118" cy="100" r="2" fill="#a34558" opacity="0.7" />
      <defs>
        <radialGradient id="grad1" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#fef5f0" />
          <stop offset="100%" stopColor="#f0e4d8" />
        </radialGradient>
      </defs>
    </svg>
  )
}

function ResinIllustrationSm({ color }) {
  return (
    <svg viewBox="0 0 100 100" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill={color} opacity="0.12" />
      <circle cx="50" cy="50" r="36" fill={color} opacity="0.18" />
      <circle cx="50" cy="50" r="24" fill={color} opacity="0.35" />
      <circle cx="50" cy="50" r="10" fill={color} opacity="0.7" />
      <circle cx="35" cy="35" r="3" fill="white" opacity="0.8" />
      <circle cx="62" cy="38" r="2" fill="white" opacity="0.6" />
    </svg>
  )
}
