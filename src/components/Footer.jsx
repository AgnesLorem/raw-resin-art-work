import { Link } from 'react-router-dom'
import { siteConfig } from '../data/siteContent.js'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">R.A.W</span>
          <p className="footer-tagline">Resin Art Work — Handmade từ tâm huyết</p>
          <p className="footer-desc">
            Sản phẩm resin thủ công cá nhân hóa. Mỗi sản phẩm là một tác phẩm nhỏ, được tạo ra bằng tay và bằng tình yêu.
          </p>
        </div>

        <div className="footer-links">
          <h4>Khám phá</h4>
          <Link to="/san-pham">Sản phẩm</Link>
          <Link to="/thu-vien">Thư viện ảnh</Link>
          <Link to="/lien-he">Liên hệ & Đặt hàng</Link>
        </div>

        <div className="footer-contact">
          <h4>Liên hệ</h4>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          <div className="footer-social">
            <a href={siteConfig.social.facebook} aria-label="Facebook" className="social-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href={siteConfig.social.instagram} aria-label="Instagram" className="social-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href={siteConfig.social.tiktok} aria-label="TikTok" className="social-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.24 8.24 0 0 0 4.82 1.54V7.05a4.85 4.85 0 0 1-1.05-.36z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} R.A.W - Resin Art Work. Handmade with 🤍</p>
      </div>

      <style>{`
        .site-footer {
          background: var(--text-dark);
          color: rgba(255,255,255,0.7);
          margin-top: 0;
        }
        .footer-inner {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr;
          gap: 48px;
          padding-top: 56px;
          padding-bottom: 48px;
        }
        .footer-logo {
          font-family: var(--font-serif);
          font-size: 2rem;
          font-weight: 700;
          color: white;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: 8px;
        }
        .footer-tagline {
          color: var(--sage-light);
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }
        .footer-desc {
          font-size: 0.9rem;
          line-height: 1.7;
          max-width: 320px;
        }
        .footer-links, .footer-contact {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-links h4, .footer-contact h4 {
          font-family: var(--font-serif);
          color: white;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .footer-links a, .footer-contact a {
          color: rgba(255,255,255,0.6);
          font-size: 0.9rem;
          transition: var(--transition);
        }
        .footer-links a:hover, .footer-contact a:hover { color: var(--sage-light); }
        .footer-social {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        .social-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }
        .social-icon:hover { background: var(--sage); color: white; transform: translateY(-2px); }
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 18px 24px;
          text-align: center;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.35);
        }
        @media (max-width: 900px) {
          .footer-inner { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 500px) {
          .footer-inner { grid-template-columns: 1fr; gap: 28px; }
        }
      `}</style>
    </footer>
  )
}
