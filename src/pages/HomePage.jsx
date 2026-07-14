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

      {/* Team / Department Section */}
      <section className="team-section section-gap" style={{ background: 'var(--ivory)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="section-label">Đội ngũ sáng lập</span>
            <h2 className="section-title" style={{ margin: '0 auto' }}>Sơ đồ tổ chức R.A.W</h2>
            <p className="section-desc" style={{ margin: '12px auto 0' }}>Cơ cấu phòng ban và nhiệm vụ của các thành viên sáng lập Resin Art Workshop</p>
          </div>

          {/* Org Chart Container */}
          <div className="org-chart">
            {/* CEO Row */}
            <div className="org-row org-row--ceo">
              <div className="org-card org-card--ceo">
                <div className="org-badge">CEO</div>
                <h3 className="org-name">Trần Hiếu Nghĩa</h3>
                <p className="org-sub">Lên kế hoạch / Quản lý dự án</p>
              </div>
            </div>

            {/* Connecting lines wrapper */}
            <div className="org-connector-wrap">
              <div className="org-line-vertical" />
              <div className="org-line-horizontal" />
            </div>

            {/* Departments Row */}
            <div className="org-grid">
              <div className="org-card">
                <div className="org-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                <div className="org-badge-role">COO</div>
                <h3 className="org-name">Lê Quang Minh</h3>
                <p className="org-sub">Kỹ thuật, sản xuất</p>
              </div>

              <div className="org-card">
                <div className="org-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                    <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                </div>
                <div className="org-badge-role">CFO</div>
                <h3 className="org-name">Dương Thị Bích Thuận</h3>
                <p className="org-sub">Tài chính, nghiên cứu thị trường</p>
              </div>

              <div className="org-card">
                <div className="org-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                    <path d="M12 2v2M12 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM10.5 9L5 22M13.5 9L19 22M9 16h6" />
                  </svg>
                </div>
                <div className="org-badge-role">CDO</div>
                <h3 className="org-name">Trần Tuấn Lộc</h3>
                <p className="org-sub">Thiết kế</p>
              </div>

              <div className="org-card">
                <div className="org-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <div className="org-badge-role">CMO</div>
                <h3 className="org-name">Phan Hiền Thương</h3>
                <p className="org-sub">Marketing</p>
              </div>

              <div className="org-card">
                <div className="org-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div className="org-badge-role">CTO</div>
                <h3 className="org-name">Nguyễn Hữu Tài</h3>
                <p className="org-sub">Công nghệ</p>
              </div>
            </div>
          </div>

          {/* Detailed tasks */}
          <div className="team-tasks-box">
            <h3 className="tasks-title">* Chi tiết các nhiệm vụ của các vị trí:</h3>
            <ul className="tasks-list">
              <li><strong>CEO:</strong> Lập kế hoạch, phân chia công việc và theo dõi tiến độ nhóm.</li>
              <li><strong>COO:</strong> Phụ trách kỹ thuật, kiểm tra chất lượng, sản xuất và hỗ trợ xử lý lỗi.</li>
              <li><strong>CFO:</strong> Quản lý ngân sách, chi phí và theo dõi thu chi cũng như nghiên cứu thị trường.</li>
              <li><strong>CDO:</strong> Thiết kế hình ảnh, giao diện và tài liệu trực quan.</li>
              <li><strong>CMO:</strong> Quảng bá sản phẩm, nghiên cứu khách hàng và truyền thông.</li>
              <li><strong>CTO:</strong> Phụ trách công nghệ, hệ thống và nền tảng kỹ thuật số.</li>
            </ul>
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
        
        /* Org Chart Styling */
        .org-chart {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 48px;
          position: relative;
        }
        .org-row {
          display: flex;
          justify-content: center;
          width: 100%;
          margin-bottom: 20px;
        }
        .org-card {
          background: white;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 24px 16px;
          text-align: center;
          width: 190px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          position: relative;
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .org-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(15,59,108,0.12);
          border-color: #0f3b6c;
        }
        .org-card--ceo {
          width: 240px;
          border: 2px solid #0f3b6c;
          padding-top: 32px;
        }
        .org-badge {
          position: absolute;
          top: -14px;
          background: #0f3b6c;
          color: white;
          padding: 4px 18px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .org-badge-role {
          color: #0f3b6c;
          font-size: 0.85rem;
          font-weight: 700;
          margin-top: 8px;
          letter-spacing: 0.03em;
        }
        .org-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-dark);
          margin: 8px 0 4px;
          font-family: var(--font-sans);
        }
        .org-card--ceo .org-name {
          font-size: 1.25rem;
        }
        .org-sub {
          font-size: 0.76rem;
          color: var(--text-mid);
          line-height: 1.4;
        }
        .org-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(15,59,108,0.06);
          color: #0f3b6c;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }
        .org-connector-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          height: 40px;
          position: relative;
        }
        .org-line-vertical {
          width: 2px;
          height: 100%;
          background: #b2c2d4;
        }
        .org-line-horizontal {
          position: absolute;
          bottom: 0;
          left: 10%;
          right: 10%;
          height: 2px;
          background: #b2c2d4;
        }
        .org-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
          width: 100%;
          padding-top: 20px;
        }
        .team-tasks-box {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 32px;
          max-width: 800px;
          margin: 40px auto 0;
          box-shadow: var(--shadow-sm);
        }
        .tasks-title {
          font-size: 1.15rem;
          color: #0f3b6c;
          font-weight: 700;
          margin-bottom: 20px;
          border-bottom: 2px solid rgba(15,59,108,0.1);
          padding-bottom: 8px;
          font-family: var(--font-serif);
        }
        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .tasks-list li {
          font-size: 0.92rem;
          color: var(--text-mid);
          line-height: 1.6;
          position: relative;
          padding-left: 20px;
          text-align: left;
        }
        .tasks-list li::before {
          content: "•";
          color: #0f3b6c;
          font-weight: bold;
          font-size: 1.2rem;
          position: absolute;
          left: 0;
          top: -2px;
        }
        .tasks-list strong {
          color: #0f3b6c;
          font-weight: 600;
          margin-right: 4px;
        }
        
        @media (max-width: 1100px) {
          .org-grid {
            grid-template-columns: repeat(3, 1fr);
            justify-items: center;
          }
          .org-line-horizontal {
            display: none;
          }
        }
        @media (max-width: 900px) {
          .about-inner { grid-template-columns: 1fr; gap: 40px; }
          .why-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .org-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 500px) {
          .why-grid { grid-template-columns: 1fr; }
          .org-grid {
            grid-template-columns: 1fr;
          }
          .org-card {
            width: 100%;
            max-width: 280px;
          }
        }
      `}</style>
    </div>
  )
}
