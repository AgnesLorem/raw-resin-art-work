// src/pages/PaymentCancelPage.jsx
import { useSearchParams, Link } from 'react-router-dom'

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams()
  const orderCode = searchParams.get('orderCode')

  return (
    <div className="payment-result-page page-enter">
      <div className="container result-container">
        <div className="result-card cancel-card">
          <span className="result-icon cancel-icon">☕</span>
          
          <h2>Thanh toán đã bị hủy</h2>
          
          <p>
            Giao dịch thanh toán trực tuyến cho đơn hàng đã bị hủy bỏ hoặc không thành công. Bạn chưa bị trừ tiền cho đơn hàng này.
          </p>

          {orderCode && (
            <div className="order-details-box">
              <div className="detail-row">
                <span className="detail-label">Mã đơn hàng liên quan</span>
                <span className="detail-val font-mono">{orderCode}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trạng thái giao dịch</span>
                <span className="detail-val status-badge-cancel">Đã hủy</span>
              </div>
            </div>
          )}

          <p className="note-text">
            Bạn có thể thử thanh toán lại trực tuyến hoặc chuyển sang phương thức đặt hàng và trao đổi chi tiết qua Email.
          </p>

          <div className="result-actions">
            <Link to="/san-pham" className="btn-primary">Quay lại Cửa hàng</Link>
            <Link to="/lien-he" className="btn-secondary">Liên hệ R.A.W hỗ trợ</Link>
          </div>
        </div>
      </div>

      <style>{`
        .payment-result-page { padding: 80px 24px; background: var(--cream); min-height: 80vh; display: flex; align-items: center; }
        .result-container { display: flex; justify-content: center; width: 100%; }
        .result-card {
          background: white; border: 1px solid var(--border); border-radius: var(--radius-lg);
          padding: 48px 32px; text-align: center; max-width: 520px; width: 100%; box-shadow: var(--shadow-sm);
          display: flex; flex-direction: column; align-items: center; gap: 20px;
        }
        .result-icon { font-size: 3.5rem; }
        .cancel-icon {
          width: 80px; height: 80px; background: rgba(123,45,62,0.1); color: var(--burgundy);
          border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem;
          margin-bottom: 8px;
        }
        .result-card h2 { font-family: var(--font-serif); color: var(--text-dark); font-size: 1.8rem; }
        .result-card p { color: var(--text-mid); line-height: 1.6; font-size: 0.95rem; }
        
        .order-details-box {
          width: 100%; background: var(--ivory); border: 1.5px dashed var(--border);
          border-radius: var(--radius-sm); padding: 20px; display: flex; flex-direction: column; gap: 12px;
          margin: 8px 0;
        }
        .detail-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; }
        .detail-label { color: var(--text-light); font-weight: 500; }
        .detail-val { color: var(--text-dark); font-weight: 600; }
        .font-mono { font-family: monospace; font-size: 1rem; }
        
        .status-badge-cancel { background: #f8d7da; color: #721c24; padding: 4px 10px; border-radius: 100px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.03em; }
        
        .note-text { font-size: 0.8rem !important; color: var(--text-light) !important; font-style: italic; }
        .result-actions { display: flex; gap: 12px; width: 100%; margin-top: 12px; }
        .result-actions > * { flex: 1; text-align: center; }

        @media (max-width: 480px) {
          .result-card { padding: 32px 20px; }
          .result-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  )
}
