// src/pages/PaymentSuccessPage.jsx
import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { formatVnd } from '../services/priceService.js'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderCode = searchParams.get('orderCode')
  const [loading, setLoading] = useState(true)
  const [orderInfo, setOrderInfo] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!orderCode) {
      setLoading(false)
      return
    }

    // Poll the status API to verify database state
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/payments/status?orderCode=${orderCode}`)
        if (!res.ok) throw new Error('Order not found')
        const data = await res.json()
        setOrderInfo(data)
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [orderCode])

  return (
    <div className="payment-result-page page-enter">
      <div className="container result-container">
        {loading ? (
          <div className="result-card loading-card">
            <div className="spinner"></div>
            <h2>Đang xác nhận thanh toán...</h2>
            <p>Vui lòng đợi giây lát để hệ thống kiểm tra trạng thái giao dịch.</p>
          </div>
        ) : error || !orderCode ? (
          <div className="result-card error-card">
            <span className="result-icon">⚠️</span>
            <h2>Không thể xác nhận đơn hàng</h2>
            <p>Có lỗi xảy ra hoặc mã đơn hàng không tồn tại trên hệ thống.</p>
            <div className="result-actions">
              <Link to="/san-pham" className="btn-primary">Quay lại Cửa hàng</Link>
              <Link to="/lien-he" className="btn-secondary">Liên hệ hỗ trợ</Link>
            </div>
          </div>
        ) : (
          <div className="result-card success-card">
            <span className="result-icon success-icon">🌿</span>
            
            {orderInfo?.paymentStatus === 'paid' ? (
              <>
                <h2>Thanh toán thành công!</h2>
                <p>Cảm ơn bạn đã lựa chọn tác phẩm từ R.A.W. Đơn hàng của bạn đã được ghi nhận và bắt đầu chuẩn bị đổ khuôn chế tác.</p>
              </>
            ) : (
              <>
                <h2>Đơn hàng đã được tạo</h2>
                <p>Thanh toán đang chờ xác nhận từ ngân hàng hoặc đang ở trạng thái xử lý.</p>
              </>
            )}

            <div className="order-details-box">
              <div className="detail-row">
                <span className="detail-label">Mã đơn hàng</span>
                <span className="detail-val font-mono">{orderCode}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trạng thái</span>
                <span className={`detail-val status-badge status-badge--${orderInfo?.paymentStatus}`}>
                  {orderInfo?.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tổng thanh toán</span>
                <span className="detail-val price-val">{formatVnd(orderInfo?.totalVnd || 0)}</span>
              </div>
            </div>

            <p className="note-text">
              * Chúng mình sẽ liên hệ với bạn qua Số điện thoại / Email đã cung cấp để cập nhật tiến độ chế tác sản phẩm.
            </p>

            <div className="result-actions">
              <Link to="/san-pham" className="btn-primary">Tiếp tục mua sắm</Link>
              <Link to="/" className="btn-secondary">Về Trang chủ</Link>
            </div>
          </div>
        )}
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
        .success-icon {
          width: 80px; height: 80px; background: rgba(122,158,126,0.15); color: var(--sage-dark);
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
        .price-val { color: var(--burgundy); font-size: 1.1rem; }
        .font-mono { font-family: monospace; font-size: 1rem; }
        
        .status-badge { padding: 4px 10px; border-radius: 100px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.03em; }
        .status-badge--paid { background: rgba(122,158,126,0.15); color: var(--sage-dark); }
        .status-badge--pending { background: #fff3cd; color: #856404; }
        
        .note-text { font-size: 0.8rem !important; color: var(--text-light) !important; font-style: italic; }
        .result-actions { display: flex; gap: 12px; width: 100%; margin-top: 12px; }
        .result-actions > * { flex: 1; text-align: center; }

        /* Spinner for loading */
        .spinner {
          width: 48px; height: 48px; border: 4px solid var(--border); border-top-color: var(--burgundy);
          border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .result-card { padding: 32px 20px; }
          .result-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  )
}
