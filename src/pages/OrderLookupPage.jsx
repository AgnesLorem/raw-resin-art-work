// src/pages/OrderLookupPage.jsx
import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { formatVnd } from '../services/priceService.js'

const ORDER_STEPS = [
  { key: 'new', label: 'Đặt hàng thành công', desc: 'Đơn hàng đã được lưu vào hệ thống R.A.W' },
  { key: 'confirmed', label: 'Xưởng tiếp nhận', desc: 'Xưởng xác nhận yêu cầu & chuẩn bị phôi resin' },
  { key: 'producing', label: 'Đang đổ resin & chế tác', desc: 'Nghệ nhân pha màu, tạo vân & đánh bóng thủ công' },
  { key: 'shipped', label: 'Đang vận chuyển', desc: 'Đã đóng gói cẩn thận & giao cho bưu tá' },
  { key: 'delivered', label: 'Đã giao thành công', desc: 'Tác phẩm đã được trao tận tay bạn' },
]

function getStepIndex(status) {
  switch (status) {
    case 'new': return 0
    case 'confirmed': return 1
    case 'producing': return 2
    case 'shipped': return 3
    case 'delivered': return 4
    default: return 0
  }
}

export default function OrderLookupPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('code') || searchParams.get('query') || ''
  const [queryInput, setQueryInput] = useState(initialQuery)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [searched, setSearched] = useState(false)

  const performLookup = async (q) => {
    if (!q || q.trim().length < 4) {
      setErrorMsg('Vui lòng nhập tối thiểu 4 ký tự (Mã đơn hàng hoặc Số điện thoại).')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSearched(true)

    try {
      const res = await fetch(`/api/orders/lookup?query=${encodeURIComponent(q.trim())}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Không thể tra cứu đơn hàng.')
      }

      setOrders(data.orders || [])
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Lỗi tra cứu đơn hàng.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      performLookup(initialQuery)
    }
  }, [initialQuery])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const trimmed = queryInput.trim()
    if (!trimmed) return
    if (trimmed === initialQuery) {
      performLookup(trimmed)
    } else {
      setSearchParams({ query: trimmed })
    }
  }

  return (
    <div className="order-lookup-page page-enter">
      <div className="container lookup-container">
        <header className="lookup-header">
          <span className="section-label">Hành trình tác phẩm</span>
          <h1 className="lookup-title">Tra cứu tiến độ đơn hàng</h1>
          <p className="lookup-subtitle">
            Nhập Mã đơn hàng hoặc Số điện thoại đặt hàng để theo dõi trực tiếp từng công đoạn chế tác resin thủ công tại xưởng.
          </p>

          <form onSubmit={handleSearchSubmit} className="lookup-form">
            <div className="search-input-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Nhập mã đơn hàng (VD: 1727...) hoặc số điện thoại..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="lookup-input font-mono"
              />
            </div>
            <button type="submit" className="btn-primary lookup-submit-btn" disabled={loading}>
              {loading ? 'Đang tìm...' : 'Tra cứu ngay'}
            </button>
          </form>

          {errorMsg && (
            <p className="lookup-error-msg">{errorMsg}</p>
          )}
        </header>

        {/* Results */}
        {loading ? (
          <div className="lookup-loading-box">
            <div className="spinner"></div>
            <p>Đang tìm dữ liệu đơn hàng...</p>
          </div>
        ) : searched && orders.length === 0 ? (
          <div className="lookup-empty-card">
            <div className="empty-circle">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3>Không tìm thấy đơn hàng phù hợp</h3>
            <p>Vui lòng kiểm tra lại Mã đơn hàng hoặc Số điện thoại bạn đã nhập khi thanh toán.</p>
            <Link to="/lien-he" className="btn-secondary btn-contact-alt">
              Liên hệ nhân viên hỗ trợ
            </Link>
          </div>
        ) : (
          <div className="order-cards-list">
            {orders.map((order) => {
              const currentStepIdx = getStepIndex(order.orderStatus)
              const isCancelled = order.orderStatus === 'cancelled'

              return (
                <article key={order.orderCode} className="order-detail-card">
                  {/* Order Top Meta */}
                  <div className="order-card-header">
                    <div className="order-id-group">
                      <span className="order-code-badge font-mono tabular-num">
                        Đơn #{order.orderCode}
                      </span>
                      <span className="order-date-text">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : ''}
                      </span>
                    </div>

                    <div className="order-badges-group">
                      <span className={`status-tag status-tag--order-${order.orderStatus}`}>
                        {order.orderStatus === 'new' ? 'Mới đặt'
                          : order.orderStatus === 'confirmed' ? 'Đã tiếp nhận'
                          : order.orderStatus === 'producing' ? 'Đang chế tác'
                          : order.orderStatus === 'shipped' ? 'Đang giao'
                          : order.orderStatus === 'delivered' ? 'Đã giao'
                          : 'Đã hủy'}
                      </span>
                      <span className={`status-tag status-tag--payment-${order.paymentStatus}`}>
                        {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                      </span>
                    </div>
                  </div>

                  {/* Customer Masked Info */}
                  <div className="customer-info-strip">
                    <span>Người nhận: <strong>{order.customerName}</strong></span>
                    <span>SĐT: <strong className="font-mono">{order.customerPhoneMasked}</strong></span>
                    <span>Phương thức: <strong>
                      {order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản VietQR'
                        : order.paymentMethod === 'cod' ? 'COD nhận hàng'
                        : 'PayOS'}
                    </strong></span>
                  </div>

                  {/* Timeline 5 Steps */}
                  <div className="timeline-container">
                    <h3 className="timeline-heading">Tiến độ gia công & giao nhận</h3>
                    
                    {isCancelled ? (
                      <div className="cancelled-banner">
                        <span>Đơn hàng này đã bị hủy. Vui lòng liên hệ với xưởng nếu có bất kỳ thắc mắc nào.</span>
                      </div>
                    ) : (
                      <div className="timeline-track">
                        {ORDER_STEPS.map((step, idx) => {
                          const isDone = idx < currentStepIdx
                          const isCurrent = idx === currentStepIdx
                          const isPending = idx > currentStepIdx

                          return (
                            <div
                              key={step.key}
                              className={`timeline-step ${
                                isDone ? 'timeline-step--done' : isCurrent ? 'timeline-step--active' : 'timeline-step--pending'
                              }`}
                            >
                              <div className="step-indicator">
                                <div className="step-circle">
                                  {isDone ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  ) : (
                                    <span className="step-num tabular-num">{idx + 1}</span>
                                  )}
                                </div>
                                {idx < ORDER_STEPS.length - 1 && <div className="step-connector"></div>}
                              </div>

                              <div className="step-content">
                                <h4 className="step-label">{step.label}</h4>
                                <p className="step-desc">{step.desc}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Products & Customization Items */}
                  <div className="order-items-table-wrap">
                    <h3 className="items-heading">Chi tiết tác phẩm resin đặt làm</h3>
                    <div className="items-list">
                      {order.items?.map((item, i) => (
                        <div key={i} className="lookup-item-row">
                          <div className="lookup-item-main">
                            <span className="lookup-item-title">{item.productName}</span>
                            <span className="lookup-item-qty">x{item.quantity}</span>
                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                              <div className="lookup-item-opts">
                                {item.selectedOptions.map((opt, oi) => (
                                  <span key={oi} className="opt-chip">
                                    {typeof opt === 'string' ? opt : opt.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.customizationNote && (
                              <div className="lookup-custom-note-tag">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 20h9"></path>
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                                <span>Khắc tên/yêu cầu: "{item.customizationNote}"</span>
                              </div>
                            )}
                          </div>
                          <span className="lookup-item-price tabular-num">
                            {formatVnd(item.unitPriceVnd * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="lookup-order-totals">
                      <div className="lookup-total-row">
                        <span>Tạm tính</span>
                        <span className="tabular-num">{formatVnd(order.subtotalVnd)}</span>
                      </div>
                      <div className="lookup-total-row">
                        <span>Phí vận chuyển</span>
                        <span className="tabular-num">
                          {order.shippingFeeVnd === 0 ? 'Miễn phí' : formatVnd(order.shippingFeeVnd)}
                        </span>
                      </div>
                      {order.discountVnd > 0 && (
                        <div className="lookup-total-row text-discount">
                          <span>Giảm giá</span>
                          <span className="tabular-num">- {formatVnd(order.discountVnd)}</span>
                        </div>
                      )}
                      <div className="lookup-total-row lookup-total-row--final">
                        <span>Tổng cộng</span>
                        <span className="lookup-final-amount tabular-num">{formatVnd(order.totalVnd)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .tabular-num { font-variant-numeric: tabular-nums; }
        .order-lookup-page { padding: 56px 20px 88px; background: var(--cream); min-height: 85vh; }
        .lookup-container { max-width: 820px; margin: 0 auto; }
        .lookup-header { text-align: center; margin-bottom: 40px; }
        .lookup-title {
          font-family: var(--font-serif); font-size: 2.2rem; color: var(--text-dark);
          margin-top: 6px; margin-bottom: 8px; letter-spacing: -0.015em;
        }
        .lookup-subtitle {
          color: var(--text-mid); font-size: 0.95rem; max-width: 580px; margin: 0 auto 28px; line-height: 1.6;
        }

        .lookup-form {
          display: flex; gap: 10px; max-width: 560px; margin: 0 auto;
        }
        .search-input-wrap {
          flex: 1; position: relative; display: flex; align-items: center;
        }
        .search-icon {
          position: absolute; left: 14px; color: var(--text-light); pointer-events: none;
        }
        .lookup-input {
          width: 100%; padding: 13px 16px 13px 44px; border: 1.5px solid var(--border);
          border-radius: 12px; font-size: 0.95rem; background: white; outline: none;
          transition: border-color 150ms;
        }
        .lookup-input:focus { border-color: var(--burgundy); }
        .lookup-submit-btn {
          padding: 0 24px; border-radius: 12px; font-weight: 600; font-size: 0.95rem; flex-shrink: 0;
        }
        .lookup-submit-btn:active { transform: scale(0.98); }
        .lookup-error-msg {
          color: #a34558; font-size: 0.85rem; margin-top: 10px; font-weight: 500;
        }

        .lookup-loading-box {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 60px 0; gap: 14px; color: var(--text-mid);
        }

        .lookup-empty-card {
          background: white; border: 1px solid var(--border); border-radius: 20px;
          padding: 48px 24px; text-align: center; display: flex; flex-direction: column;
          align-items: center; gap: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }
        .empty-circle {
          width: 64px; height: 64px; border-radius: 50%; background: var(--ivory);
          display: flex; align-items: center; justify-content: center; color: var(--text-light);
        }
        .lookup-empty-card h3 { font-family: var(--font-serif); font-size: 1.35rem; margin: 0; }
        .lookup-empty-card p { color: var(--text-mid); font-size: 0.92rem; max-width: 440px; margin: 0; }
        .btn-contact-alt { border-radius: 100px; font-size: 0.88rem; padding: 10px 22px; margin-top: 6px; }

        /* Order card */
        .order-cards-list { display: flex; flex-direction: column; gap: 28px; }
        .order-detail-card {
          background: white; border: 1px solid var(--border); border-radius: 20px;
          padding: 28px; box-shadow: 0 4px 16px rgba(45,35,32,0.04); display: flex; flex-direction: column; gap: 20px;
        }
        .order-card-header {
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
          border-bottom: 1px solid var(--border); padding-bottom: 14px;
        }
        .order-id-group { display: flex; align-items: center; gap: 10px; }
        .order-code-badge {
          font-weight: 700; font-size: 1.05rem; color: var(--burgundy);
        }
        .order-date-text { font-size: 0.82rem; color: var(--text-light); }

        .order-badges-group { display: flex; gap: 8px; flex-wrap: wrap; }
        .status-tag {
          font-size: 0.76rem; font-weight: 600; padding: 3px 10px; border-radius: 100px;
        }
        .status-tag--order-new { background: #eaf4ed; color: #2d5a43; }
        .status-tag--order-confirmed { background: #e5f0fa; color: #1c5b96; }
        .status-tag--order-producing { background: #fdf5e6; color: #a36518; }
        .status-tag--order-shipped { background: #ede8f7; color: #5b3fa3; }
        .status-tag--order-delivered { background: #e0f2e9; color: #1e7040; }
        .status-tag--order-cancelled { background: #fbeeed; color: #a34558; }

        .status-tag--payment-paid { background: #eaf4ed; color: #2d5a43; }
        .status-tag--payment-pending { background: #fdf5e6; color: #a36518; }
        .status-tag--payment-failed { background: #fbeeed; color: #a34558; }

        .customer-info-strip {
          display: flex; gap: 20px; font-size: 0.85rem; color: var(--text-mid); flex-wrap: wrap;
          background: var(--ivory); padding: 10px 14px; border-radius: 10px;
        }

        /* 5-Step Timeline */
        .timeline-container {
          background: #fdfcfa; border: 1px solid var(--border); border-radius: 14px; padding: 20px;
        }
        .timeline-heading {
          font-family: var(--font-sans); font-size: 0.95rem; font-weight: 700; color: var(--text-dark);
          margin-bottom: 18px;
        }
        .timeline-track { display: flex; flex-direction: column; gap: 0; }
        .timeline-step { display: flex; align-items: flex-start; gap: 14px; position: relative; }
        
        .step-indicator { display: flex; flex-direction: column; align-items: center; }
        .step-circle {
          width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 0.78rem; font-weight: 700; z-index: 2;
          transition-property: background-color, color, box-shadow, transform;
          transition-duration: 200ms;
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        .step-connector {
          width: 2px; height: 36px; background: var(--border); margin: 3px 0;
        }
        .timeline-step:last-child .step-connector { display: none; }

        /* Step state variants */
        .timeline-step--done .step-circle { background: #2d5a43; color: white; }
        .timeline-step--done .step-connector { background: #2d5a43; }
        .timeline-step--active .step-circle {
          background: var(--burgundy); color: white; box-shadow: 0 0 0 4px rgba(123, 45, 62, 0.15);
        }
        .timeline-step--active .step-connector { background: var(--border); }
        .timeline-step--pending .step-circle { background: var(--ivory); color: var(--text-light); border: 1px solid var(--border); }

        .step-content { flex: 1; padding-bottom: 20px; }
        .timeline-step:last-child .step-content { padding-bottom: 0; }
        .step-label { font-size: 0.92rem; font-weight: 600; color: var(--text-dark); margin: 2px 0 2px; }
        .timeline-step--pending .step-label { color: var(--text-light); }
        .step-desc { font-size: 0.78rem; color: var(--text-mid); margin: 0; line-height: 1.4; }

        .cancelled-banner {
          padding: 12px; background: #fff5f5; border: 1px solid #fcc; border-radius: 8px;
          color: #a34558; font-size: 0.86rem;
        }

        /* Items breakdown */
        .order-items-table-wrap {
          border-top: 1px solid var(--border); padding-top: 18px;
        }
        .items-heading {
          font-family: var(--font-sans); font-size: 0.95rem; font-weight: 700; color: var(--text-dark);
          margin-bottom: 12px;
        }
        .items-list { display: flex; flex-direction: column; gap: 10px; }
        .lookup-item-row {
          display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;
          background: var(--ivory); border-radius: 10px; padding: 10px 14px;
        }
        .lookup-item-main { display: flex; flex-direction: column; gap: 3px; flex: 1; }
        .lookup-item-title { font-weight: 600; font-size: 0.9rem; color: var(--text-dark); }
        .lookup-item-qty { font-size: 0.78rem; color: var(--text-light); }
        .lookup-item-opts { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
        .opt-chip {
          font-size: 0.7rem; background: white; padding: 1px 6px; border-radius: 4px;
          border: 1px solid var(--border); color: var(--text-mid);
        }
        .lookup-custom-note-tag {
          display: inline-flex; align-items: center; gap: 4px; font-size: 0.76rem;
          color: var(--burgundy); font-style: italic; margin-top: 3px;
        }
        .lookup-item-price { font-weight: 600; font-size: 0.92rem; color: var(--text-dark); }

        .lookup-order-totals {
          margin-top: 14px; border-top: 1px dashed var(--border); padding-top: 10px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .lookup-total-row { display: flex; justify-content: space-between; font-size: 0.86rem; color: var(--text-mid); }
        .text-discount { color: #2d5a43; }
        .lookup-total-row--final {
          border-top: 1px solid var(--border); padding-top: 8px; margin-top: 4px;
          font-size: 1.05rem; font-weight: 700; color: var(--text-dark); align-items: center;
        }
        .lookup-final-amount { font-family: var(--font-serif); font-size: 1.3rem; color: var(--burgundy); }

        .spinner {
          width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--burgundy);
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 600px) {
          .lookup-form { flex-direction: column; }
          .customer-info-strip { flex-direction: column; gap: 6px; }
          .order-card-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  )
}
