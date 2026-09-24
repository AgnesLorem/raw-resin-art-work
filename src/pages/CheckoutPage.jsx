// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart, clearCart, getAppliedVoucher, applyVoucher, removeVoucher } from '../services/cartService.js'
import {
  formatVnd,
  calculateCartTotal,
  calculateShippingFee,
  calculateDiscount,
  VOUCHERS,
} from '../services/priceService.js'
import { siteConfig } from '../data/siteContent.js'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [shippingRegion, setShippingRegion] = useState('can_tho')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [orderNote, setOrderNote] = useState('')
  const [voucherInput, setVoucherInput] = useState('')
  const [voucherMsg, setVoucherMsg] = useState({ text: '', isError: false })
  const [appliedCode, setAppliedCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    setCartItems(getCart())
    setAppliedCode(getAppliedVoucher())
  }, [])

  const subtotal = calculateCartTotal(cartItems)
  const shippingFee = calculateShippingFee(subtotal, shippingRegion)
  const discount = calculateDiscount(subtotal, appliedCode, shippingFee)
  const total = Math.max(0, subtotal + shippingFee - discount)
  const appliedVoucher = appliedCode ? VOUCHERS[appliedCode] : null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCustomer((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplyVoucher = (e) => {
    e.preventDefault()
    if (!voucherInput.trim()) return
    const result = applyVoucher(voucherInput.trim())
    if (result.success) {
      setAppliedCode(getAppliedVoucher())
      setVoucherMsg({ text: result.message, isError: false })
      setVoucherInput('')
    } else {
      setVoucherMsg({ text: result.message, isError: true })
    }
  }

  const handleRemoveVoucher = () => {
    removeVoucher()
    setAppliedCode('')
    setVoucherMsg({ text: '', isError: false })
  }

  // Fallback: Send email via mailto
  const handleEmailCheckout = () => {
    const itemsText = cartItems
      .map(
        (item) =>
          `- ${item.product.name} (SL: ${item.quantity}): ${formatVnd(
            item.product.priceVnd * item.quantity
          )}${
            item.selectedOptions?.length > 0
              ? `\n  Tùy chọn: ${item.selectedOptions.join(', ')}`
              : ''
          }${
            item.customizationNote
              ? `\n  Ghi chú riêng: ${item.customizationNote}`
              : ''
          }`
      )
      .join('\n')

    const emailBody = `Họ tên: ${customer.name}
Số điện thoại: ${customer.phone}
Email: ${customer.email || 'Không cung cấp'}
Địa chỉ: ${customer.address || 'Không cung cấp'}
Khu vực giao hàng: ${shippingRegion === 'can_tho' ? 'Nội ô Cần Thơ' : 'Toàn quốc'}
Phương thức thanh toán: ${paymentMethod}
Mã ưu đãi: ${appliedCode || 'Không có'}

Ghi chú chung: ${orderNote || 'Không có'}

ĐƠN HÀNG CHI TIẾT:
${itemsText}

Tạm tính: ${formatVnd(subtotal)}
Phí giao hàng: ${shippingFee === 0 ? 'Miễn phí' : formatVnd(shippingFee)}
Giảm giá: ${discount > 0 ? '-' + formatVnd(discount) : '0đ'}
Tổng cộng: ${formatVnd(total)}`

    const mailtoUrl = `mailto:${siteConfig.email}?subject=Đơn hàng R.A.W mới từ ${
      customer.name
    }&body=${encodeURIComponent(emailBody)}`

    window.location.href = mailtoUrl
  }

  const handleSubmitCheckout = async (e) => {
    e.preventDefault()
    if (!customer.name.trim() || !customer.phone.trim()) {
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
        const selectedOptions = (item.selectedOptions || []).map((optName) => {
          const dbOpt = (item.product.options || []).find((o) => o.name === optName)
          return {
            name: optName,
            priceDeltaVnd: dbOpt ? dbOpt.priceDeltaVnd : 0,
          }
        })

        // Combine item-specific note and overall note if present
        let note = item.customizationNote || ''
        if (orderNote && !note) {
          note = orderNote
        }

        return {
          slug: item.product.slug,
          name: item.product.name,
          quantity: item.quantity,
          unitPriceVnd: item.product.priceVnd,
          selectedOptions: selectedOptions,
          customizationNote: note,
        }
      })

      // Get or create unique orderCode for this checkout attempt
      let orderCode = sessionStorage.getItem('pendingOrderCode')
      if (!orderCode) {
        orderCode = Date.now().toString()
        sessionStorage.setItem('pendingOrderCode', orderCode)
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
          paymentMethod: paymentMethod,
          shippingRegion: shippingRegion,
          voucherCode: appliedCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể xử lý đơn hàng lúc này.')
      }

      // Success: clear cart and redirect
      clearCart()
      sessionStorage.removeItem('pendingOrderCode')
      window.dispatchEvent(new Event('cart-updated'))

      if (data.checkoutUrl.startsWith('http')) {
        try {
          const parsed = new URL(data.checkoutUrl)
          if (parsed.origin === window.location.origin) {
            navigate(parsed.pathname + parsed.search)
          } else {
            window.location.href = data.checkoutUrl
          }
        } catch {
          window.location.href = data.checkoutUrl
        }
      } else {
        // Internal route (e.g. VietQR, COD confirmation page)
        navigate(data.checkoutUrl)
      }
    } catch (err) {
      console.error(err)
      sessionStorage.removeItem('pendingOrderCode')
      setErrorMsg(
        err.message || 'Chức năng thanh toán đang chờ cấu hình. Bạn vẫn có thể đặt hàng nhanh qua email.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container checkout-empty-page page-enter">
        <div className="empty-card">
          <div className="empty-art">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Hãy quay lại trang sản phẩm và chọn cho mình tác phẩm resin thủ công ưng ý nhé.</p>
          <Link to="/san-pham" className="btn-primary">
            Khám phá tác phẩm
          </Link>
        </div>
        <style>{`
          .checkout-empty-page { padding: 90px 24px; display: flex; justify-content: center; }
          .empty-card {
            background: white; border: 1px solid var(--border); border-radius: 20px;
            padding: 48px 36px; text-align: center; max-width: 480px; box-shadow: var(--shadow-sm);
            display: flex; flex-direction: column; align-items: center; gap: 16px;
          }
          .empty-art {
            width: 72px; height: 72px; border-radius: 50%; background: var(--ivory);
            display: flex; align-items: center; justify-content: center; color: var(--warm-brown);
          }
          .empty-card h2 { font-family: var(--font-serif); color: var(--text-dark); margin: 0; font-size: 1.6rem; }
          .empty-card p { color: var(--text-mid); line-height: 1.5; font-size: 0.95rem; margin-bottom: 8px; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="checkout-page page-enter">
      <div className="container checkout-container">
        <div className="checkout-main">
          <header className="checkout-header-block">
            <span className="section-label">Thanh toán an toàn</span>
            <h1 className="checkout-title">Thông tin giao hàng & Thanh toán</h1>
            <p className="checkout-subtitle">Điền địa chỉ nhận hàng và lựa chọn hình thức thanh toán thuận tiện nhất cho bạn.</p>
          </header>

          {errorMsg && (
            <div className="error-alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="error-alert-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
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

          <form onSubmit={handleSubmitCheckout} className="checkout-form">
            {/* Step 1: Customer Contact */}
            <div className="checkout-section-block">
              <h2 className="section-subheading">1. Người nhận tác phẩm</h2>
              
              <div className="form-group">
                <label htmlFor="customer-name">Họ và tên người nhận *</label>
                <input
                  type="text"
                  id="customer-name"
                  name="name"
                  required
                  value={customer.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Nguyễn Văn An"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="customer-phone">Số điện thoại liên hệ *</label>
                  <input
                    type="tel"
                    id="customer-phone"
                    name="phone"
                    required
                    value={customer.phone}
                    onChange={handleInputChange}
                    placeholder="09xx xxx xxx"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer-email">Email nhận hóa đơn (tùy chọn)</label>
                  <input
                    type="email"
                    id="customer-email"
                    name="email"
                    value={customer.email}
                    onChange={handleInputChange}
                    placeholder="ban@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="customer-address">Địa chỉ giao hàng (Số nhà, tên đường, phường/xã)</label>
                <input
                  type="text"
                  id="customer-address"
                  name="address"
                  value={customer.address}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 123 Đường 30 Tháng 4, P. Hưng Lợi, Q. Ninh Kiều"
                />
              </div>
            </div>

            {/* Step 2: Shipping Region */}
            <div className="checkout-section-block">
              <h2 className="section-subheading">2. Khu vực giao hàng & Phí ship</h2>
              <div className="radio-options-grid">
                <label className={`radio-card ${shippingRegion === 'can_tho' ? 'radio-card--selected' : ''}`}>
                  <input
                    type="radio"
                    name="shippingRegion"
                    value="can_tho"
                    checked={shippingRegion === 'can_tho'}
                    onChange={() => setShippingRegion('can_tho')}
                  />
                  <div className="radio-card-content">
                    <div className="radio-card-top">
                      <span className="radio-card-title">Nội ô Cần Thơ</span>
                      <span className="radio-card-badge tabular-num">
                        {subtotal >= 250000 ? '0đ (Freeship)' : '15.000đ'}
                      </span>
                    </div>
                    <span className="radio-card-desc">Giao nhanh trong 24h - 48h tại TP. Cần Thơ</span>
                  </div>
                </label>

                <label className={`radio-card ${shippingRegion === 'nationwide' ? 'radio-card--selected' : ''}`}>
                  <input
                    type="radio"
                    name="shippingRegion"
                    value="nationwide"
                    checked={shippingRegion === 'nationwide'}
                    onChange={() => setShippingRegion('nationwide')}
                  />
                  <div className="radio-card-content">
                    <div className="radio-card-top">
                      <span className="radio-card-title">Toàn quốc</span>
                      <span className="radio-card-badge tabular-num">
                        {subtotal >= 250000 ? '0đ (Freeship)' : '30.000đ'}
                      </span>
                    </div>
                    <span className="radio-card-desc">Chuyển phát tiêu chuẩn đến các tỉnh thành khác (2-4 ngày)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="checkout-section-block">
              <h2 className="section-subheading">3. Phương thức thanh toán</h2>
              <div className="payment-options-list">
                {/* Option: Bank Transfer / VietQR */}
                <label className={`payment-card ${paymentMethod === 'bank_transfer' ? 'payment-card--selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                  />
                  <div className="payment-card-body">
                    <div className="payment-card-header">
                      <div className="payment-icon-box">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                      </div>
                      <div className="payment-card-info">
                        <span className="payment-method-name">Chuyển khoản VietQR (Napas247)</span>
                        <span className="payment-method-tag">Khuyên dùng • Tức thì</span>
                      </div>
                    </div>
                    <p className="payment-card-desc">
                      Quét mã QR tự động điền số tiền và nội dung đơn qua ứng dụng ngân hàng bất kỳ.
                    </p>
                  </div>
                </label>

                {/* Option: COD */}
                <label className={`payment-card ${paymentMethod === 'cod' ? 'payment-card--selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className="payment-card-body">
                    <div className="payment-card-header">
                      <div className="payment-icon-box">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="1" y="3" width="15" height="13"></rect>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                          <circle cx="5.5" cy="18.5" r="2.5"></circle>
                          <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                      </div>
                      <div className="payment-card-info">
                        <span className="payment-method-name">Thanh toán khi nhận hàng (COD)</span>
                        <span className="payment-method-tag payment-method-tag--neutral">Tiền mặt</span>
                      </div>
                    </div>
                    <p className="payment-card-desc">
                      Nhận hàng, kiểm tra sản phẩm resin thủ công và thanh toán trực tiếp cho nhân viên giao hàng.
                    </p>
                  </div>
                </label>

                {/* Option: PayOS */}
                <label className={`payment-card ${paymentMethod === 'payos' ? 'payment-card--selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="payos"
                    checked={paymentMethod === 'payos'}
                    onChange={() => setPaymentMethod('payos')}
                  />
                  <div className="payment-card-body">
                    <div className="payment-card-header">
                      <div className="payment-icon-box">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                          <line x1="2" y1="10" x2="22" y2="10"></line>
                        </svg>
                      </div>
                      <div className="payment-card-info">
                        <span className="payment-method-name">Cổng thanh toán trực tuyến PayOS</span>
                        <span className="payment-method-tag payment-method-tag--neutral">Thẻ ATM / Quốc tế</span>
                      </div>
                    </div>
                    <p className="payment-card-desc">
                      Hỗ trợ thẻ ATM nội địa, thẻ quốc tế Visa/Mastercard và quét mã QR qua cổng PayOS.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 4: Overall Customization Note */}
            <div className="checkout-section-block">
              <h2 className="section-subheading">4. Ghi chú chung cho đơn hàng (tùy chọn)</h2>
              <div className="form-group">
                <textarea
                  id="order-note"
                  rows="2"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Ví dụ: Đóng gói quà tặng sinh nhật, dán thiệp chúc mừng, giao sau 18h..."
                ></textarea>
              </div>
            </div>

            <div className="checkout-actions">
              <button
                type="submit"
                className="btn-primary btn-submit"
                disabled={loading}
                id="checkout-submit-btn"
              >
                {loading ? (
                  <span>Đang xử lý đơn hàng...</span>
                ) : paymentMethod === 'bank_transfer' ? (
                  <span>Xác nhận & Nhận mã VietQR ➜</span>
                ) : paymentMethod === 'cod' ? (
                  <span>Xác nhận đặt hàng COD ➜</span>
                ) : (
                  <span>Chuyển đến cổng PayOS ➜</span>
                )}
              </button>

              <button type="button" className="btn-secondary btn-email-alt" onClick={handleEmailCheckout}>
                Hoặc Đặt nhanh qua Email (mailto)
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
                    <div className="summary-item-header">
                      <span className="summary-item-name">{item.product.name}</span>
                      <span className="summary-item-qty">x{item.quantity}</span>
                    </div>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <span className="summary-item-options">
                        Tùy chọn: {item.selectedOptions.join(', ')}
                      </span>
                    )}
                    {item.customizationNote && (
                      <span className="summary-item-note">
                        Khắc tên/yêu cầu: "{item.customizationNote}"
                      </span>
                    )}
                  </div>
                  <span className="summary-item-price tabular-num">
                    {formatVnd(item.product.priceVnd * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Voucher input inside summary */}
            <div className="summary-voucher-wrap">
              {appliedVoucher ? (
                <div className="checkout-voucher-badge">
                  <div>
                    <span className="cv-code">{appliedVoucher.code}</span>
                    <span className="cv-label">{appliedVoucher.label}</span>
                  </div>
                  <button type="button" onClick={handleRemoveVoucher} className="cv-remove">✕</button>
                </div>
              ) : (
                <form onSubmit={handleApplyVoucher} className="checkout-voucher-form">
                  <input
                    type="text"
                    placeholder="Mã ưu đãi (RAWWELCOME...)"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                  />
                  <button type="submit">Dùng</button>
                </form>
              )}
              {voucherMsg.text && (
                <p className={`voucher-msg ${voucherMsg.isError ? 'voucher-msg--err' : 'voucher-msg--ok'}`}>
                  {voucherMsg.text}
                </p>
              )}
            </div>

            <hr className="summary-divider" />

            <div className="summary-totals">
              <div className="summary-row">
                <span>Tạm tính</span>
                <span className="tabular-num">{formatVnd(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển ({shippingRegion === 'can_tho' ? 'Cần Thơ' : 'Toàn quốc'})</span>
                <span className="tabular-num">
                  {shippingFee === 0 ? 'Miễn phí' : formatVnd(shippingFee)}
                </span>
              </div>
              {discount > 0 && (
                <div className="summary-row summary-row--discount">
                  <span>Giảm giá ({appliedCode})</span>
                  <span className="tabular-num">- {formatVnd(discount)}</span>
                </div>
              )}
              <hr className="summary-divider" />
              <div className="summary-row summary-row--grand">
                <span>Tổng thanh toán</span>
                <span className="summary-price tabular-num">{formatVnd(total)}</span>
              </div>
            </div>

            <div className="checkout-guarantee">
              <div className="guarantee-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Sản phẩm đúc resin epoxy cao cấp thủ công</span>
              </div>
              <div className="guarantee-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>Xưởng R.A.W trực tiếp tại Cần Thơ</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .tabular-num { font-variant-numeric: tabular-nums; }
        .checkout-page { padding: 48px 0 80px; background: var(--cream); min-height: 90vh; }
        .checkout-container { display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 40px; align-items: start; }
        .checkout-main {
          background: white; padding: 36px 32px; border-radius: 20px;
          border: 1px solid var(--border); box-shadow: 0 2px 12px rgba(45,35,32,0.04);
        }
        .checkout-header-block { margin-bottom: 28px; }
        .checkout-title {
          font-family: var(--font-serif); font-size: 1.85rem; color: var(--text-dark);
          margin-top: 6px; margin-bottom: 6px; letter-spacing: -0.015em;
        }
        .checkout-subtitle { color: var(--text-mid); font-size: 0.92rem; }

        .checkout-section-block {
          border-top: 1px solid var(--border); padding-top: 24px; margin-top: 24px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .section-subheading {
          font-family: var(--font-sans); font-size: 1.05rem; font-weight: 700;
          color: var(--text-dark); margin: 0;
        }

        .checkout-form { display: flex; flex-direction: column; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label {
          font-size: 0.8rem; font-weight: 600; color: var(--text-dark);
          letter-spacing: 0.02em;
        }
        .form-group input, .form-group textarea {
          padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 10px;
          font-family: inherit; font-size: 0.92rem; background: var(--ivory);
          transition-property: border-color, background-color;
          transition-duration: 150ms;
        }
        .form-group input:focus, .form-group textarea:focus {
          border-color: var(--burgundy); outline: none; background: white;
        }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        /* Radio Options (Shipping Region) */
        .radio-options-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        .radio-card {
          border: 1.5px solid var(--border); border-radius: 12px; padding: 14px;
          background: var(--ivory); cursor: pointer; display: flex; align-items: flex-start; gap: 10px;
          transition-property: border-color, background-color, transform;
          transition-duration: 150ms;
        }
        .radio-card input { margin-top: 4px; accent-color: var(--burgundy); }
        .radio-card--selected {
          border-color: var(--burgundy); background: #fdfaf9;
        }
        .radio-card-content { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .radio-card-top { display: flex; justify-content: space-between; align-items: center; }
        .radio-card-title { font-weight: 600; font-size: 0.92rem; color: var(--text-dark); }
        .radio-card-badge {
          font-size: 0.78rem; font-weight: 700; color: #2d5a43; background: #eef6f0;
          padding: 2px 8px; border-radius: 6px;
        }
        .radio-card-desc { font-size: 0.78rem; color: var(--text-mid); line-height: 1.4; }

        /* Payment Options */
        .payment-options-list { display: flex; flex-direction: column; gap: 10px; }
        .payment-card {
          border: 1.5px solid var(--border); border-radius: 12px; padding: 14px 16px;
          background: white; cursor: pointer; display: flex; align-items: flex-start; gap: 12px;
          transition-property: border-color, background-color, box-shadow;
          transition-duration: 150ms;
        }
        .payment-card input { margin-top: 5px; accent-color: var(--burgundy); }
        .payment-card--selected {
          border-color: var(--burgundy); background: #fdfaf9;
          box-shadow: 0 2px 8px rgba(123, 45, 62, 0.08);
        }
        .payment-card-body { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .payment-card-header { display: flex; align-items: center; gap: 10px; }
        .payment-icon-box {
          width: 32px; height: 32px; border-radius: 8px; background: var(--ivory);
          display: flex; align-items: center; justify-content: center; color: var(--burgundy);
          flex-shrink: 0;
        }
        .payment-card-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .payment-method-name { font-weight: 600; font-size: 0.94rem; color: var(--text-dark); }
        .payment-method-tag {
          font-size: 0.72rem; font-weight: 600; color: #2d5a43; background: #eef6f0;
          padding: 1px 7px; border-radius: 6px;
        }
        .payment-method-tag--neutral { color: var(--text-mid); background: var(--ivory); }
        .payment-card-desc { font-size: 0.8rem; color: var(--text-mid); margin-left: 42px; line-height: 1.4; }

        .checkout-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 28px; }
        .btn-submit {
          width: 100%; padding: 14px; font-size: 1rem; border-radius: 10px;
          justify-content: center; font-weight: 600;
        }
        .btn-submit:active { transform: scale(0.98); }
        .btn-email-alt {
          width: 100%; padding: 11px; font-size: 0.88rem; text-align: center;
          display: flex; justify-content: center; border-style: dashed; border-radius: 10px;
        }

        /* Sidebar */
        .checkout-sidebar { position: sticky; top: 90px; }
        .summary-card {
          background: white; border: 1px solid var(--border); border-radius: 20px;
          padding: 24px; box-shadow: 0 2px 12px rgba(45,35,32,0.04);
        }
        .summary-title {
          font-family: var(--font-serif); font-size: 1.25rem; color: var(--text-dark);
          margin-bottom: 18px; border-bottom: 1px solid var(--border); padding-bottom: 10px;
        }
        .summary-list { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; }
        .summary-item { display: flex; justify-content: space-between; gap: 12px; font-size: 0.9rem; }
        .summary-item-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .summary-item-header { display: flex; align-items: baseline; gap: 6px; }
        .summary-item-name { font-weight: 600; color: var(--text-dark); font-size: 0.88rem; }
        .summary-item-qty { font-size: 0.78rem; color: var(--text-light); }
        .summary-item-options { font-size: 0.75rem; color: #2d5a43; }
        .summary-item-note { font-size: 0.74rem; color: var(--warm-brown); font-style: italic; }
        .summary-item-price { font-weight: 600; color: var(--text-dark); }

        .summary-voucher-wrap { margin-bottom: 14px; }
        .checkout-voucher-form { display: flex; gap: 6px; }
        .checkout-voucher-form input {
          flex: 1; padding: 8px 10px; font-size: 0.8rem; border: 1px solid var(--border);
          border-radius: 8px; background: var(--ivory); outline: none; font-family: inherit;
        }
        .checkout-voucher-form button {
          padding: 0 12px; background: var(--text-dark); color: white; border-radius: 8px;
          font-size: 0.78rem; font-weight: 600; cursor: pointer;
        }
        .checkout-voucher-badge {
          display: flex; justify-content: space-between; align-items: center;
          background: #f7faf8; border: 1px solid #c9decb; border-radius: 8px; padding: 6px 10px;
        }
        .cv-code { font-weight: 700; font-size: 0.78rem; color: #2d5a43; margin-right: 6px; }
        .cv-label { font-size: 0.72rem; color: #527055; }
        .cv-remove { background: none; border: none; color: #7a9e7e; cursor: pointer; font-size: 0.8rem; }

        .summary-divider { border: 0; border-top: 1px solid var(--border); margin: 12px 0; }
        .summary-totals { display: flex; flex-direction: column; gap: 8px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-mid); }
        .summary-row--discount { color: #2d5a43; font-weight: 500; }
        .summary-row--grand {
          font-size: 1.05rem; font-weight: 700; color: var(--text-dark); align-items: center;
          margin-top: 4px;
        }
        .summary-price { font-family: var(--font-serif); font-size: 1.35rem; color: var(--burgundy); }

        .checkout-guarantee {
          margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--border);
          display: flex; flex-direction: column; gap: 8px;
        }
        .guarantee-item {
          display: flex; align-items: center; gap: 8px; font-size: 0.76rem; color: var(--text-light);
        }
        .guarantee-item svg { color: #2d5a43; flex-shrink: 0; }

        /* Error alert decoration */
        .error-alert {
          background: #fff8f8; border: 1px solid #fcc; padding: 14px; border-radius: 10px;
          margin-bottom: 20px; display: flex; gap: 10px; align-items: flex-start;
        }
        .error-alert-icon { color: #c33; flex-shrink: 0; margin-top: 2px; }
        .error-alert-content { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .error-alert-text { color: #922; font-size: 0.88rem; line-height: 1.4; font-weight: 500; margin: 0; }
        .btn-fallback-email {
          background: var(--burgundy); color: white; border: none; padding: 6px 12px;
          border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; align-self: flex-start;
        }

        @media (max-width: 900px) {
          .checkout-container { grid-template-columns: 1fr; gap: 28px; }
          .checkout-sidebar { position: static; }
        }
        @media (max-width: 540px) {
          .checkout-main { padding: 20px 16px; }
          .form-grid { grid-template-columns: 1fr; gap: 14px; }
          .radio-options-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
