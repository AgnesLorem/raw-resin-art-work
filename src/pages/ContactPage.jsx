import { useState } from 'react'
import { siteConfig } from '../data/siteContent.js'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', product: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // Build mailto — Phase 2 will replace with real API
    const subject = encodeURIComponent(`Liên hệ từ ${form.name} - R.A.W Website`)
    const body = encodeURIComponent(
      `Tên: ${form.name}\nEmail: ${form.email}\nSĐT: ${form.phone}\nSản phẩm quan tâm: ${form.product}\n\nNội dung:\n${form.message}`
    )
    window.open(`mailto:${siteConfig.email}?subject=${subject}&body=${body}`)
    setSubmitted(true)
  }

  return (
    <div className="page-enter contact-page">
      <div className="contact-page-hero">
        <div className="container">
          <span className="section-label">Liên hệ</span>
          <h1 className="section-title">Kết nối với R.A.W</h1>
          <p className="section-desc">
            Có câu hỏi? Muốn đặt hàng theo yêu cầu? Chúng mình luôn sẵn lòng lắng nghe và tư vấn cho bạn.
          </p>
        </div>
      </div>

      <div className="container contact-page-body">
        <div className="contact-page-grid">
          {/* Info column */}
          <div className="contact-info-col">
            <h2 className="contact-info-title">Thông tin liên hệ</h2>

            <div className="info-card" id="info-email">
              <div className="info-icon-wrap">✉</div>
              <div>
                <div className="info-label">Email</div>
                <a href={`mailto:${siteConfig.email}`} className="info-value">{siteConfig.email}</a>
              </div>
            </div>

            <div className="info-card" id="info-social">
              <div className="info-icon-wrap">💬</div>
              <div>
                <div className="info-label">Mạng xã hội</div>
                <div className="info-value">Facebook · Instagram · TikTok</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="social-pill">Facebook</a>
                  <a href={siteConfig.social.instagram} className="social-pill">Instagram</a>
                </div>
              </div>
            </div>

            <div className="info-card" id="info-hours">
              <div className="info-icon-wrap">⏰</div>
              <div>
                <div className="info-label">Thời gian phản hồi</div>
                <div className="info-value">Thường trong 24–48 giờ</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: 4 }}>
                  (Trừ cuối tuần và ngày lễ)
                </div>
              </div>
            </div>

            <div className="info-note">
              <span>💡</span>
              <p>
                Bạn có thể ghi rõ tên sản phẩm muốn đặt, số lượng, và các tùy chỉnh (màu sắc, tên cá nhân hóa...) để chúng mình tư vấn nhanh hơn nhé!
              </p>
            </div>
          </div>

          {/* Form column */}
          <div className="contact-form-col">
            {submitted ? (
              <div className="form-success">
                <div className="form-success-icon">🎉</div>
                <h3>Đã mở ứng dụng email!</h3>
                <p>Hãy gửi email để chúng mình nhận được yêu cầu của bạn nhé. Chúng mình sẽ phản hồi trong 24–48 giờ.</p>
                <button className="btn-secondary" onClick={() => setSubmitted(false)} id="form-reset-btn">
                  Gửi thêm câu hỏi
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <h2 className="form-title">Gửi tin nhắn</h2>
                <p className="form-subtitle">Điền thông tin và chúng mình sẽ liên hệ lại sớm nhất có thể.</p>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Tên của bạn *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="form-input"
                      placeholder="Nguyễn Văn A"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Số điện thoại</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="form-input"
                      placeholder="0912 345 678"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="ban@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="product" className="form-label">Sản phẩm quan tâm</label>
                  <select id="product" name="product" className="form-input" value={form.product} onChange={handleChange}>
                    <option value="">-- Chọn sản phẩm --</option>
                    <option value="Lót Ly Resin">Lót Ly Resin</option>
                    <option value="Móc Khóa Resin">Móc Khóa Resin</option>
                    <option value="Bookmark Resin">Bookmark Resin</option>
                    <option value="Khác">Khác / Tùy chỉnh riêng</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">Nội dung tin nhắn *</label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-input form-textarea"
                    placeholder="Mô tả yêu cầu, màu sắc, số lượng, dịp tặng quà... Càng chi tiết, chúng mình tư vấn được càng tốt!"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary form-submit-btn" id="contact-submit-btn">
                  Gửi yêu cầu ✉
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .contact-page-hero {
          background: linear-gradient(135deg, var(--ivory) 0%, white 100%);
          padding: 56px 0 48px;
          border-bottom: 1px solid var(--border);
        }
        .contact-page-body { padding: 56px 0 80px; }
        .contact-page-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 56px;
          align-items: start;
        }
        .contact-info-col { display: flex; flex-direction: column; gap: 16px; }
        .contact-info-title {
          font-size: 1.3rem; font-weight: 600; color: var(--text-dark);
          margin-bottom: 8px; font-family: var(--font-sans);
        }
        .info-card {
          display: flex; gap: 16px; align-items: flex-start;
          padding: 16px 18px; background: var(--ivory);
          border-radius: var(--radius-md); border: 1px solid var(--border);
        }
        .info-icon-wrap {
          font-size: 1.3rem; width: 40px; height: 40px; border-radius: 50%;
          background: white; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: var(--shadow-sm);
        }
        .info-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-light); font-weight: 600; }
        .info-value { font-size: 0.95rem; color: var(--text-dark); font-weight: 500; margin-top: 3px; }
        .info-value a { color: var(--burgundy); }
        .social-pill {
          display: inline-block; padding: 4px 12px; background: white;
          border: 1px solid var(--border); border-radius: 100px; font-size: 0.78rem;
          font-weight: 500; color: var(--text-mid); transition: var(--transition);
        }
        .social-pill:hover { border-color: var(--burgundy); color: var(--burgundy); }
        .info-note {
          display: flex; gap: 12px; align-items: flex-start;
          padding: 16px; background: rgba(122,158,126,0.08);
          border: 1px solid rgba(122,158,126,0.2); border-radius: var(--radius-sm);
          font-size: 0.86rem; color: var(--sage-dark); line-height: 1.55;
        }
        .info-note span { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
        .contact-form-col { background: white; border-radius: var(--radius-lg); padding: 36px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); }
        .form-title { font-size: 1.4rem; font-weight: 600; color: var(--text-dark); font-family: var(--font-sans); margin-bottom: 6px; }
        .form-subtitle { font-size: 0.88rem; color: var(--text-mid); margin-bottom: 28px; }
        .contact-form { display: flex; flex-direction: column; gap: 18px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 0.85rem; font-weight: 500; color: var(--text-dark); }
        .form-input {
          padding: 11px 16px; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
          font-size: 0.9rem; font-family: var(--font-sans); color: var(--text-dark);
          background: var(--cream); transition: var(--transition); outline: none;
        }
        .form-input:focus { border-color: var(--sage); background: white; box-shadow: 0 0 0 3px rgba(122,158,126,0.12); }
        .form-textarea { resize: vertical; min-height: 120px; }
        .form-submit-btn { width: 100%; justify-content: center; font-size: 1rem; padding: 15px 32px; }
        .form-success {
          text-align: center; padding: 48px 24px;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        .form-success-icon { font-size: 3rem; }
        .form-success h3 { font-size: 1.4rem; color: var(--text-dark); font-family: var(--font-sans); }
        .form-success p { color: var(--text-mid); line-height: 1.6; max-width: 320px; }
        @media (max-width: 900px) {
          .contact-page-grid { grid-template-columns: 1fr; gap: 36px; }
          .form-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 500px) {
          .contact-form-col { padding: 24px; }
        }
      `}</style>
    </div>
  )
}
