// src/pages/PaymentSuccessPage.jsx
import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { formatVnd } from '../services/priceService.js'

const BANK_INFO = {
  bankId: 'MB',
  bankName: 'Ngân hàng Quân Đội (MB Bank)',
  accountNo: '0901234567',
  accountName: 'RESIN ART WORK',
}

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderCode = searchParams.get('orderCode')
  const queryMethod = searchParams.get('method')
  const [loading, setLoading] = useState(true)
  const [orderInfo, setOrderInfo] = useState(null)
  const [error, setError] = useState(false)
  const [copiedField, setCopiedField] = useState('')
  const [qrError, setQrError] = useState(false)

  useEffect(() => {
    if (!orderCode) {
      setLoading(false)
      return
    }

    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`/api/orders/lookup?query=${orderCode}`)
        if (!res.ok) throw new Error('Order not found')
        const data = await res.json()
        if (data.orders && data.orders.length > 0) {
          setOrderInfo(data.orders[0])
        } else {
          // Fallback to payments/status API
          const statusRes = await fetch(`/api/payments/status?orderCode=${orderCode}`)
          if (statusRes.ok) {
            const statusData = await statusRes.json()
            setOrderInfo(statusData)
          } else {
            setError(true)
          }
        }
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderCode])

  const copyToClipboard = async (text, fieldName) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        setCopiedField(fieldName)
        setTimeout(() => setCopiedField(''), 2000)
        return
      }
    } catch {
      // Fall through to fallback
    }

    // Fallback using textarea for insecure contexts
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(''), 2000)
    } catch {
      setCopiedField('')
    }
  }

  const effectiveMethod = orderInfo?.paymentMethod || queryMethod || 'bank_transfer'
  const isPaid = orderInfo?.paymentStatus === 'paid'
  const totalAmount = orderInfo?.totalVnd || 0
  const transferContent = `RAW ${orderCode}`

  // VietQR Napas247 QuickLink standard
  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`

  return (
    <div className="payment-result-page page-enter">
      <div className="container result-container">
        {loading ? (
          <div className="result-card loading-card">
            <div className="spinner"></div>
            <h2>Đang xác nhận đơn hàng...</h2>
            <p>Vui lòng đợi giây lát để hệ thống kiểm tra thông tin đơn hàng của bạn.</p>
          </div>
        ) : error || !orderCode ? (
          <div className="result-card error-card">
            <div className="status-art-circle status-art-circle--err">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2>Không tìm thấy đơn hàng</h2>
            <p>Mã đơn hàng không hợp lệ hoặc chưa được ghi nhận trên hệ thống.</p>
            <div className="result-actions">
              <Link to="/san-pham" className="btn-primary">Quay lại Cửa hàng</Link>
              <Link to="/lien-he" className="btn-secondary">Liên hệ hỗ trợ</Link>
            </div>
          </div>
        ) : (
          <div className="result-card">
            {/* Header Status */}
            <div className="status-art-circle status-art-circle--ok">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            {isPaid ? (
              <>
                <h1 className="result-title">Thanh toán thành công!</h1>
                <p className="result-desc">
                  Cảm ơn bạn đã lựa chọn R.A.W. Đơn hàng của bạn đã được thanh toán và xưởng chuẩn bị bắt tay vào công đoạn đổ resin và hoàn thiện thủ công.
                </p>
              </>
            ) : effectiveMethod === 'bank_transfer' ? (
              <>
                <h1 className="result-title">Đơn hàng đã được tạo thành công</h1>
                <p className="result-desc">
                  Vui lòng quét mã <strong>VietQR Napas247</strong> bên dưới hoặc chuyển khoản theo thông tin để xưởng tiến hành đúc sản phẩm.
                </p>
              </>
            ) : effectiveMethod === 'cod' ? (
              <>
                <h1 className="result-title">Đặt hàng thành công (COD)</h1>
                <p className="result-desc">
                  Đơn hàng của bạn đã được tiếp nhận. Bạn sẽ thanh toán trực tiếp số tiền <strong>{formatVnd(totalAmount)}</strong> khi shipper giao hàng tận nơi.
                </p>
              </>
            ) : (
              <>
                <h1 className="result-title">Đơn hàng đang chờ xử lý</h1>
                <p className="result-desc">
                  Giao dịch đang được đồng bộ với cổng thanh toán PayOS.
                </p>
              </>
            )}

            {/* Order Brief Info */}
            <div className="order-details-box">
              <div className="detail-row">
                <span className="detail-label">Mã đơn hàng</span>
                <span className="detail-val font-mono tabular-num">{orderCode}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phương thức thanh toán</span>
                <span className="detail-val">
                  {effectiveMethod === 'bank_transfer'
                    ? 'Chuyển khoản VietQR'
                    : effectiveMethod === 'cod'
                    ? 'Thanh toán khi nhận hàng (COD)'
                    : 'Cổng trực tuyến PayOS'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trạng thái thanh toán</span>
                <span className={`status-pill ${isPaid ? 'status-pill--paid' : 'status-pill--pending'}`}>
                  {isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}
                </span>
              </div>
              <div className="detail-row detail-row--total">
                <span className="detail-label">Tổng thanh toán</span>
                <span className="detail-val price-val tabular-num">{formatVnd(totalAmount)}</span>
              </div>
            </div>

            {/* Dynamic VietQR Section */}
            {effectiveMethod === 'bank_transfer' && !isPaid && (
              <div className="vietqr-section">
                <div className="vietqr-card">
                  <div className="vietqr-header">
                    <span className="vietqr-badge">Chuẩn Napas247 • Quét bằng mọi App Ngân hàng</span>
                  </div>

                  <div className="vietqr-image-wrapper">
                    {!qrError ? (
                      <img
                        src={qrUrl}
                        alt={`Mã VietQR thanh toán cho đơn hàng ${orderCode}`}
                        className="vietqr-image"
                        loading="eager"
                        onError={() => setQrError(true)}
                      />
                    ) : (
                      <div className="vietqr-fallback-card">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" color="var(--burgundy)">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <p className="fallback-note">Mã QR tạm thời không tải được. Quý khách vui lòng chuyển khoản theo số tài khoản bên dưới.</p>
                      </div>
                    )}
                  </div>

                  <div className="bank-details-list">
                    <div className="bank-field">
                      <span className="bf-label">Ngân hàng</span>
                      <span className="bf-val">{BANK_INFO.bankName}</span>
                    </div>

                    <div className="bank-field">
                      <span className="bf-label">Số tài khoản</span>
                      <div className="bf-val-wrap">
                        <strong className="bf-val font-mono tabular-num">{BANK_INFO.accountNo}</strong>
                        <button
                          type="button"
                          className="btn-copy"
                          onClick={() => copyToClipboard(BANK_INFO.accountNo, 'stk')}
                        >
                          {copiedField === 'stk' ? '✓ Đã chép' : 'Sao chép'}
                        </button>
                      </div>
                    </div>

                    <div className="bank-field">
                      <span className="bf-label">Chủ tài khoản</span>
                      <span className="bf-val">{BANK_INFO.accountName}</span>
                    </div>

                    <div className="bank-field">
                      <span className="bf-label">Số tiền</span>
                      <div className="bf-val-wrap">
                        <strong className="bf-val text-burgundy font-mono tabular-num">{formatVnd(totalAmount)}</strong>
                        <button
                          type="button"
                          className="btn-copy"
                          onClick={() => copyToClipboard(totalAmount.toString(), 'amount')}
                        >
                          {copiedField === 'amount' ? '✓ Đã chép' : 'Sao chép'}
                        </button>
                      </div>
                    </div>

                    <div className="bank-field">
                      <span className="bf-label">Nội dung chuyển khoản</span>
                      <div className="bf-val-wrap">
                        <strong className="bf-val font-mono highlight-code">{transferContent}</strong>
                        <button
                          type="button"
                          className="btn-copy"
                          onClick={() => copyToClipboard(transferContent, 'content')}
                        >
                          {copiedField === 'content' ? '✓ Đã chép' : 'Sao chép'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="vietqr-note-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="vietqr-note-icon">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <p className="vietqr-note">
                      Sau khi chuyển khoản thành công, xưởng sẽ đối soát và cập nhật tiến độ đơn hàng cho bạn ngay trong ngày.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="result-actions">
              <Link to={`/tra-cuu-don-hang?code=${orderCode}`} className="btn-primary btn-track">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>Theo dõi tiến độ chế tác đơn hàng</span>
              </Link>
              <Link to="/san-pham" className="btn-secondary">
                Tiếp tục xem sản phẩm
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .tabular-num { font-variant-numeric: tabular-nums; }
        .payment-result-page { padding: 56px 20px 80px; background: var(--cream); min-height: 85vh; display: flex; align-items: center; }
        .result-container { display: flex; justify-content: center; width: 100%; max-width: 600px; }
        .result-card {
          background: white; border: 1px solid var(--border); border-radius: 24px;
          padding: 36px 28px; text-align: center; width: 100%; box-shadow: 0 4px 20px rgba(45,35,32,0.06);
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        .status-art-circle {
          width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
        }
        .status-art-circle--ok { background: #eaf4ed; color: #2d5a43; }
        .status-art-circle--err { background: #fbeeed; color: #a34558; }
        
        .result-title {
          font-family: var(--font-serif); color: var(--text-dark); font-size: 1.65rem; margin: 0;
          letter-spacing: -0.015em;
        }
        .result-desc { color: var(--text-mid); line-height: 1.55; font-size: 0.92rem; margin: 0; max-width: 480px; }
        
        .order-details-box {
          width: 100%; background: var(--ivory); border: 1px solid var(--border);
          border-radius: 14px; padding: 16px 20px; display: flex; flex-direction: column; gap: 10px;
          margin-top: 4px;
        }
        .detail-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; }
        .detail-row--total { border-top: 1px dashed var(--border); padding-top: 10px; margin-top: 2px; }
        .detail-label { color: var(--text-light); }
        .detail-val { color: var(--text-dark); font-weight: 600; }
        .price-val { color: var(--burgundy); font-size: 1.15rem; font-weight: 700; font-family: var(--font-serif); }
        .font-mono { font-family: monospace; }
        
        .status-pill {
          padding: 3px 10px; border-radius: 100px; font-size: 0.76rem; font-weight: 600;
        }
        .status-pill--paid { background: #eaf4ed; color: #2d5a43; }
        .status-pill--pending { background: #fdf5e6; color: #a36518; }

        /* VietQR Box */
        .vietqr-section { width: 100%; margin-top: 4px; }
        .vietqr-card {
          background: #fdfcfa; border: 1.5px solid #ded5cc; border-radius: 20px;
          padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 14px;
        }
        .vietqr-badge {
          font-size: 0.75rem; font-weight: 600; color: #2d5a43; background: #eaf4ed;
          padding: 3px 10px; border-radius: 6px;
        }
        .vietqr-image-wrapper {
          width: 220px; height: 220px; background: white; padding: 8px; border-radius: 12px;
          outline: 1px solid rgba(0,0,0,0.08); outline-offset: -1px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center;
        }
        .vietqr-image { width: 100%; height: 100%; object-fit: contain; }
        .vietqr-fallback-card {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; gap: 8px; padding: 12px; color: var(--text-mid);
        }
        .fallback-note { font-size: 0.76rem; color: var(--text-mid); line-height: 1.35; margin: 0; }

        .bank-details-list {
          width: 100%; display: flex; flex-direction: column; gap: 8px; text-align: left;
          background: white; border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px;
        }
        .bank-field { display: flex; justify-content: space-between; align-items: center; font-size: 0.84rem; }
        .bf-label { color: var(--text-light); }
        .bf-val { color: var(--text-dark); font-weight: 500; }
        .bf-val-wrap { display: flex; align-items: center; gap: 8px; }
        .highlight-code { color: var(--burgundy); font-weight: 700; background: #fbeeed; padding: 2px 6px; border-radius: 4px; }
        .text-burgundy { color: var(--burgundy); }
        .btn-copy {
          background: var(--ivory); border: 1px solid var(--border); padding: 4px 10px;
          border-radius: 6px; font-size: 0.74rem; font-weight: 600; color: var(--text-mid);
          cursor: pointer; min-height: 28px; display: inline-flex; align-items: center; justify-content: center;
          transition-property: background-color, color, border-color, transform;
          transition-duration: 150ms;
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-copy:hover { background: var(--burgundy); color: white; border-color: var(--burgundy); }
        .btn-copy:active { transform: scale(0.95); }

        .vietqr-note-box {
          display: flex; align-items: flex-start; gap: 8px; text-align: left;
          background: #f7faf8; border: 1px solid #c9decb; border-radius: 8px; padding: 10px 12px;
          width: 100%;
        }
        .vietqr-note-icon { color: #2d5a43; flex-shrink: 0; margin-top: 2px; }
        .vietqr-note {
          font-size: 0.78rem; color: #2d5a43; margin: 0; line-height: 1.4;
        }

        .result-actions { display: flex; flex-direction: column; gap: 10px; width: 100%; margin-top: 8px; }
        .btn-track {
          justify-content: center; gap: 8px; border-radius: 10px; padding: 12px 20px;
          font-size: 0.95rem; font-weight: 600;
        }
        .btn-track:active { transform: scale(0.98); }

        .spinner {
          width: 44px; height: 44px; border: 3px solid var(--border); border-top-color: var(--burgundy);
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .result-card { padding: 24px 18px; }
          .bank-field { flex-direction: column; align-items: flex-start; gap: 4px; }
          .bf-val-wrap { width: 100%; justify-content: space-between; }
        }
      `}</style>
    </div>
  )
}
