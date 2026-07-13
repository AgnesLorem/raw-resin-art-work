// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCart, clearCart } from '../services/cartService.js'
import { formatVnd, calculateCartTotal } from '../services/priceService.js'
import { siteConfig } from '../data/siteContent.js'

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([])
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [customizationNote, setCustomizationNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successInfo, setSuccessInfo] = useState(null)

  useEffect(() => {
    setCartItems(getCart())
  }, [])

  const cartTotal = calculateCartTotal(cartItems)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCustomer((prev) => ({ ...prev, [name]: value }))
  }

  // Fallback: Send email via mailto
  const handleEmailCheckout = () => {
    const itemsText = cartItems
      .map(
        (item) =>
          `- ${item.product.name} (SL: ${item.quantity}): ${formatVnd(
            item.product.priceVnd
          )}${
            item.selectedOptions.length > 0
              ? `\n  Tùy chọn: ${item.selectedOptions.join(', ')}`
              : ''
          }`
      )
      .join('\n')

    const emailBody = `Họ tên: ${customer.name}
Số điện thoại: ${customer.phone}
Email: ${customer.email || 'Không cung cấp'}
Địa chỉ: ${customer.address || 'Không cung cấp'}

Ghi chú thiết kế/cá nhân hóa: ${customizationNote || 'Không có'}

ĐƠN HÀNG CHI TIẾT:
${itemsText}

Tổng cộng: ${formatVnd(cartTotal)}`

    const mailtoUrl = `mailto:${siteConfig.email}?subject=Đơn hàng R.A.W mới từ ${
      customer.name
    }&body=${encodeURIComponent(emailBody)}`

    window.location.href = mailtoUrl
  }

  const handleSubmitPayos = async (e) => {
    e.preventDefault()
    if (!customer.name || !customer.phone) {
      setErrorMsg('Vui lòng cung cấp đầy đủ họ tên và số điện thoại giao hàng.')
      return
    }

    if (cartItems.length === 0) {
      setErrorMsg('Giỏ hàng của bạn đang trống.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      // Map frontend cart items to format requested by API
      const requestItems = cartItems.map((item) => {
        // Collect option structures
        const selectedOptions = item.selectedOptions.map((optName) => {
          const dbOpt = (item.product.options || []).find((o) => o.name === optName);
          return {
            name: optName,
            priceDeltaVnd: dbOpt ? dbOpt.priceDeltaVnd : 0,
          };
        });

        return {
          slug: item.product.slug,
          name: item.product.name,
          quantity: item.quantity,
          unitPriceVnd: item.product.priceVnd,
          selectedOptions: selectedOptions,
          customizationNote: customizationNote, // attach global note or per item
        };
      });

      // Get or create unique orderCode for this checkout attempt to guarantee idempotency
      let orderCode = sessionStorage.getItem('pendingOrderCode');
      if (!orderCode) {
        orderCode = Date.now().toString();
        sessionStorage.setItem('pendingOrderCode', orderCode);
      }

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: customer,
          items: requestItems,
          orderCode: Number(orderCode),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể xử lý thanh toán trực tuyến.')
      }

      // Success: clear cart and redirect to PayOS
      clearCart()
      sessionStorage.removeItem('pendingOrderCode');
      // Dispatch cart updated event to refresh header/drawer
      window.dispatchEvent(new Event('cart-updated'))
      
      // Redirect to PayOS checkout page
      window.location.href = data.checkoutUrl
    } catch (err) {
      console.error(err)
      sessionStorage.removeItem('pendingOrderCode');
      setErrorMsg(
        err.message || 'Chức năng thanh toán trực tuyến đang chờ cấu hình. Bạn vẫn có thể đặt hàng qua email.'
      )
    } finally {
      setLoading(false);
    }
  }

  if (cartItems.length === 0 && !successInfo) {
    return (
      <div className="container checkout-empty-page page-enter">
        <div className="empty-card">
          <span className="empty-icon">🛒</span>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Hãy quay lại trang sản phẩm và chọn cho mình tác phẩm ưng ý nhé.</p>
          <Link to="/san-pham" className="btn-primary">
            Quay lại Cửa hàng
          </Link>
        </div>
        <style>{`
          .checkout-empty-page { padding: 80px 24px; display: flex; justify-content: center; }
          .empty-card {
            background: white; border: 1px solid var(--border); border-radius: var(--radius-lg);
            padding: 48px 32px; text-align: center; max-width: 480px; box-shadow: var(--shadow-sm);
            display: flex; flex-direction: column; align-items: center; gap: 20px;
          }
          .empty-icon { font-size: 3.5rem; }
          .empty-card h2 { font-family: var(--font-serif); color: var(--text-dark); }
          .empty-card p { color: var(--text-mid); line-height: 1.5; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="checkout-page page-enter">
      <div className="container checkout-container">
        <div className="checkout-main">
          <h1 className="checkout-title">Thông tin giao hàng</h1>
          <p className="checkout-subtitle">Điền thông tin nhận hàng và chọn phương thức thanh toán.</p>

          {errorMsg && (
            <div className="error-alert">
              <span className="error-alert-icon">⚠️</span>
              <div className="error-alert-content">
                <p className="error-alert-text">{errorMsg}</p>
                {errorMsg.includes('chờ cấu hình') && (
                  <button type="button" className="btn-fallback-email" onClick={handleEmailCheckout}>
                    Đặt hàng nhanh qua Email (mailto)
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitPayos} className="checkout-form">
            <div className="form-group">
              <label htmlFor="customer-name">Họ và tên *</label>
              <input
                type="text"
                id="customer-name"
                name="name"
                required
                value={customer.name}
                onChange={handleInputChange}
                placeholder="Nhập đầy đủ họ tên"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="customer-phone">Số điện thoại *</label>
                <input
                  type="tel"
                  id="customer-phone"
                  name="phone"
                  required
                  value={customer.phone}
                  onChange={handleInputChange}
                  placeholder="Số điện thoại nhận hàng"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer-email">Email (tùy chọn)</label>
                <input
                  type="email"
                  id="customer-email"
                  name="email"
                  value={customer.email}
                  onChange={handleInputChange}
                  placeholder="Email nhận hóa đơn/thông tin"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="customer-address">Địa chỉ nhận hàng (tùy chọn)</label>
              <input
                type="text"
                id="customer-address"
                name="address"
                value={customer.address}
                onChange={handleInputChange}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="customization-note">Yêu cầu thiết kế / Cá nhân hóa (tùy chọn)</label>
              <textarea
                id="customization-note"
                rows="3"
                value={customizationNote}
                onChange={(e) => setCustomizationNote(e.target.value)}
                placeholder="Ví dụ: Lót ly khắc tên 'Lan', móc khóa dùng tone màu xanh sage..."
              ></textarea>
            </div>

            <div className="checkout-actions">
              <button type="submit" className="btn-primary btn-submit" disabled={loading}>
                {loading ? 'Đang khởi tạo đơn hàng...' : 'Thanh toán trực tuyến qua PayOS'}
              </button>
              
              <button type="button" className="btn-secondary btn-email-alt" onClick={handleEmailCheckout}>
                Đặt qua Email (mailto)
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar: Order Summary */}
        <aside className="checkout-sidebar">
          <div className="summary-card">
            <h2 className="summary-title">Tóm tắt đơn hàng</h2>
            <div className="summary-list">
              {cartItems.map((item) => (
                <div key={item.key} className="summary-item">
                  <div className="summary-item-info">
                    <span className="summary-item-name">{item.product.name}</span>
                    {item.selectedOptions.length > 0 && (
                      <span className="summary-item-options">
                        +{item.selectedOptions.join(', ')}
                      </span>
                    )}
                    <span className="summary-item-qty">Số lượng: {item.quantity}</span>
                  </div>
                  <span className="summary-item-price">
                    {formatVnd(item.product.priceVnd * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <hr className="summary-divider" />

            <div className="summary-totals">
              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{formatVnd(cartTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Phí giao hàng</span>
                <span>Miễn phí</span>
              </div>
              <hr className="summary-divider" />
              <div className="summary-row summary-row--grand">
                <span>Tổng cộng</span>
                <span>{formatVnd(cartTotal)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .checkout-page { padding: 56px 0 80px; background: var(--cream); min-height: 90vh; }
        .checkout-container { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 48px; align-items: start; }
        .checkout-main { background: white; padding: 40px; border-radius: var(--radius-lg); border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
        .checkout-title { font-family: var(--font-serif); font-size: 2rem; color: var(--burgundy); margin-bottom: 8px; }
        .checkout-subtitle { color: var(--text-mid); margin-bottom: 32px; font-size: 0.95rem; }
        
        .checkout-form { display: flex; flex-direction: column; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-dark); text-transform: uppercase; letter-spacing: 0.05em; }
        .form-group input, .form-group textarea {
          padding: 12px 16px; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
          font-family: inherit; font-size: 0.95rem; background: var(--ivory); transition: var(--transition);
        }
        .form-group input:focus, .form-group textarea:focus { border-color: var(--burgundy); outline: none; background: white; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        
        .checkout-actions { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
        .btn-submit { width: 100%; padding: 14px; font-size: 1rem; }
        .btn-email-alt { width: 100%; padding: 12px; font-size: 0.95rem; text-align: center; display: block; border-style: dashed; }
        
        .checkout-sidebar { position: sticky; top: 100px; }
        .summary-card { background: white; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--shadow-sm); }
        .summary-title { font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-dark); margin-bottom: 24px; border-bottom: 1.5px solid var(--burgundy); padding-bottom: 10px; }
        .summary-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .summary-item { display: flex; justify-content: space-between; gap: 16px; font-size: 0.95rem; }
        .summary-item-info { display: flex; flex-direction: column; gap: 4px; }
        .summary-item-name { font-weight: 500; color: var(--text-dark); }
        .summary-item-options { font-size: 0.78rem; color: var(--sage-dark); font-style: italic; }
        .summary-item-qty { font-size: 0.8rem; color: var(--text-light); }
        .summary-item-price { font-weight: 600; color: var(--text-dark); }
        
        .summary-divider { border: 0; border-top: 1px solid var(--border); margin: 16px 0; }
        .summary-totals { display: flex; flex-direction: column; gap: 12px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 0.95rem; color: var(--text-mid); }
        .summary-row--grand { font-size: 1.25rem; font-weight: 700; color: var(--burgundy); font-family: var(--font-serif); }

        /* Error alert decoration */
        .error-alert {
          background: #fff8f8; border: 1px solid #fcc; padding: 16px; border-radius: var(--radius-sm);
          margin-bottom: 24px; display: flex; gap: 12px; align-items: flex-start;
        }
        .error-alert-icon { font-size: 1.2rem; }
        .error-alert-content { display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .error-alert-text { color: #b33; font-size: 0.9rem; line-height: 1.5; font-weight: 500; }
        .btn-fallback-email {
          background: var(--burgundy); color: white; border: none; padding: 8px 16px;
          border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer;
          align-self: flex-start; transition: var(--transition);
        }
        .btn-fallback-email:hover { background: #62202d; }

        @media (max-width: 900px) {
          .checkout-container { grid-template-columns: 1fr; gap: 32px; }
          .checkout-sidebar { position: static; }
        }
        @media (max-width: 480px) {
          .checkout-main { padding: 24px; }
          .form-grid { grid-template-columns: 1fr; gap: 16px; }
        }
      `}</style>
    </div>
  )
}
