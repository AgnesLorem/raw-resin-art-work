import { Link } from 'react-router-dom'
import { siteConfig } from '../data/siteContent.js'

export default function ContactSection() {
  return (
    <section className="contact-section section-gap">
      <div className="container">
        <div className="contact-inner">
          <div className="contact-content">
            <span className="section-label">Liên hệ</span>
            <h2 className="section-title">Sẵn sàng tạo ra một điều gì đó đặc biệt?</h2>
            <p className="section-desc">
              Hãy liên hệ để tư vấn ý tưởng, đặt hàng theo yêu cầu, hoặc chỉ đơn giản là hỏi thêm về R.A.W.
              Chúng mình luôn sẵn lòng lắng nghe!
            </p>
            <div className="contact-options">
              <a
                href={`mailto:${siteConfig.email}`}
                className="contact-card"
                id="contact-email-link"
              >
                <div className="contact-card-icon">✉</div>
                <div>
                  <div className="contact-card-label">Email</div>
                  <div className="contact-card-value">{siteConfig.email}</div>
                </div>
              </a>
              <a href={siteConfig.social.facebook} className="contact-card" id="contact-fb-link">
                <div className="contact-card-icon">💬</div>
                <div>
                  <div className="contact-card-label">Facebook</div>
                  <div className="contact-card-value">Nhắn tin trực tiếp</div>
                </div>
              </a>
            </div>
            <div className="contact-ctas">
              <Link to="/lien-he" className="btn-primary" id="contact-page-link">
                Đến trang liên hệ
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>

          <div className="contact-visual" aria-hidden="true">
            <div className="contact-bubble contact-bubble--1">🌸 Cá nhân hóa</div>
            <div className="contact-bubble contact-bubble--2">🤲 Handmade</div>
            <div className="contact-bubble contact-bubble--3">🎁 Quà tặng</div>
            <div className="contact-blob" />
          </div>
        </div>
      </div>

      <style>{`
        .contact-section { background: white; }
        .contact-inner {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .contact-content { display: flex; flex-direction: column; gap: 20px; }
        .contact-options { display: flex; flex-direction: column; gap: 12px; }
        .contact-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: var(--cream);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: var(--transition);
        }
        .contact-card:hover { border-color: var(--burgundy); background: rgba(123,45,62,0.04); transform: translateX(4px); }
        .contact-card-icon { font-size: 1.4rem; width: 40px; text-align: center; }
        .contact-card-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-light); font-weight: 600; }
        .contact-card-value { font-size: 0.95rem; color: var(--text-dark); font-weight: 500; margin-top: 2px; }
        .contact-ctas { margin-top: 8px; }
        .contact-visual {
          position: relative;
          height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .contact-blob {
          width: 280px; height: 280px;
          background: radial-gradient(circle at 40% 35%, rgba(123,45,62,0.12), rgba(122,158,126,0.08));
          border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%;
          animation: morphBlob 6s ease-in-out infinite;
        }
        @keyframes morphBlob {
          0%, 100% { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; }
          33% { border-radius: 40% 60% 30% 70% / 60% 40% 60% 40%; }
          66% { border-radius: 70% 30% 50% 50% / 30% 70% 50% 50%; }
        }
        .contact-bubble {
          position: absolute;
          background: white;
          border: 1.5px solid var(--border);
          border-radius: 100px;
          padding: 10px 18px;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-dark);
          box-shadow: var(--shadow-sm);
          white-space: nowrap;
        }
        .contact-bubble--1 { top: 40px; left: 10px; animation: float 4s ease-in-out infinite; }
        .contact-bubble--2 { top: 50%; right: 10px; transform: translateY(-50%); animation: float 4s ease-in-out infinite; animation-delay: -1.5s; }
        .contact-bubble--3 { bottom: 40px; left: 20px; animation: float 4s ease-in-out infinite; animation-delay: -3s; }
        @media (max-width: 900px) {
          .contact-inner { grid-template-columns: 1fr; gap: 40px; }
          .contact-visual { display: none; }
        }
      `}</style>
    </section>
  )
}
