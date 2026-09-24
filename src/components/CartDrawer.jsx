import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  updateItemCustomization,
  applyVoucher,
  getAppliedVoucher,
  removeVoucher,
} from '../services/cartService.js'
import {
  formatVnd,
  calculateProductTotal,
  calculateCartTotal,
  calculateDiscount,
  VOUCHERS,
} from '../services/priceService.js'

export default function CartDrawer({ open, onClose, cartItems, onCartUpdate }) {
  const [voucherInput, setVoucherInput] = useState('')
  const [voucherMsg, setVoucherMsg] = useState({ text: '', isError: false })
  const [expandedNotes, setExpandedNotes] = useState({})

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const appliedCode = getAppliedVoucher()
  const appliedVoucher = appliedCode ? VOUCHERS[appliedCode] : null
  const subtotal = calculateCartTotal(cartItems)
  // In cart drawer, shipping has not been added yet; shipping vouchers apply at checkout
  const discount = calculateDiscount(subtotal, appliedCode, 0)
  const finalTotal = Math.max(0, subtotal - discount)
  const freeShipThreshold = 250000
  const freeShipRemaining = Math.max(0, freeShipThreshold - subtotal)

  const handleRemove = (key) => { removeFromCart(key); onCartUpdate() }
  const handleQty = (key, qty) => { updateQuantity(key, qty); onCartUpdate() }
  const handleClear = () => { clearCart(); onCartUpdate() }

  const handleApplyVoucher = (e) => {
    e.preventDefault()
    if (!voucherInput.trim()) return
    const result = applyVoucher(voucherInput.trim())
    if (result.success) {
      setVoucherMsg({ text: result.message, isError: false })
      setVoucherInput('')
      onCartUpdate()
    } else {
      setVoucherMsg({ text: result.message, isError: true })
    }
  }

  const handleRemoveVoucher = () => {
    removeVoucher()
    setVoucherMsg({ text: '', isError: false })
    onCartUpdate()
  }

  const toggleNote = (key) => {
    setExpandedNotes((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleNoteChange = (key, value) => {
    updateItemCustomization(key, value)
    onCartUpdate()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-backdrop${open ? ' cart-backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`cart-drawer${open ? ' cart-drawer--open' : ''}`}
        aria-label="Giỏ hàng"
        role="dialog"
        aria-modal="true"
      >
        <div className="cart-header">
          <div className="cart-title-wrap">
            <h2 className="cart-title">Giỏ hàng R.A.W</h2>
            {cartItems.length > 0 && <span className="cart-count">{cartItems.length} món</span>}
          </div>
          <button className="cart-close" onClick={onClose} aria-label="Đóng giỏ hàng" id="cart-close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-art">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <p className="cart-empty-text">Chưa có tác phẩm resin nào trong giỏ hàng.</p>
            <p className="cart-empty-sub">Mỗi món đồ đều được đúc thủ công riêng theo yêu cầu của bạn.</p>
            <button className="btn-secondary btn-sm-inner" onClick={onClose}>Khám phá bộ sưu tập</button>
          </div>
        ) : (
          <>
            {/* Free shipping threshold progress bar */}
            <div className="freeship-bar">
              <div className="freeship-header">
                {freeShipRemaining > 0 ? (
                  <span>Thêm <strong className="tabular-num">{formatVnd(freeShipRemaining)}</strong> để nhận <strong>Miễn phí vận chuyển</strong></span>
                ) : (
                  <span className="freeship-qualified">Đơn hàng của bạn đã được <strong>Miễn phí vận chuyển toàn quốc</strong></span>
                )}
              </div>
              <div className="freeship-track">
                <div
                  className="freeship-fill"
                  style={{ width: `${Math.min(100, (subtotal / freeShipThreshold) * 100)}%` }}
                />
              </div>
            </div>

            <div className="cart-items">
              {cartItems.map((item) => {
                const itemTotal = calculateProductTotal(item.product, item.selectedOptions, item.quantity)
                const isNoteOpen = expandedNotes[item.key] || Boolean(item.customizationNote)

                return (
                  <div className="cart-item" key={item.key} id={`cart-item-${item.key.slice(0, 12)}`}>
                    <div className="cart-item-main">
                      {/* Product Thumbnail */}
                      <div className="cart-item-thumb">
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="cart-thumb-placeholder"
                          style={{ display: item.product?.image ? 'none' : 'flex' }}
                        >
                          <span>RAW</span>
                        </div>
                      </div>

                      <div className="cart-item-info">
                        <div className="cart-item-title-row">
                          <span className="cart-item-name">{item.product.name}</span>
                          <button
                            className="cart-item-remove"
                            onClick={() => handleRemove(item.key)}
                            aria-label={`Xóa ${item.product.name}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>

                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="cart-item-opts">
                            {item.selectedOptions.map((opt, i) => (
                              <span key={i} className="cart-opt-tag">{opt}</span>
                            ))}
                          </div>
                        )}

                        <div className="cart-item-price-row">
                          <span className="cart-item-price tabular-num">{formatVnd(itemTotal)}</span>
                          <div className="qty-mini">
                            <button
                              onClick={() => handleQty(item.key, item.quantity - 1)}
                              aria-label="Giảm số lượng"
                            >
                              −
                            </button>
                            <span className="tabular-num">{item.quantity}</span>
                            <button
                              onClick={() => handleQty(item.key, item.quantity + 1)}
                              aria-label="Tăng số lượng"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Per-item Resin Customization Note */}
                    <div className="cart-item-custom-section">
                      {!isNoteOpen ? (
                        <button
                          type="button"
                          className="btn-toggle-note"
                          onClick={() => toggleNote(item.key)}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                          Thêm ghi chú khắc tên / charm riêng
                        </button>
                      ) : (
                        <div className="custom-note-input-wrap">
                          <div className="custom-note-header">
                            <span className="custom-note-label">Ghi chú chế tác cho món này:</span>
                            <button
                              type="button"
                              className="btn-hide-note"
                              onClick={() => toggleNote(item.key)}
                            >
                              Thu gọn
                            </button>
                          </div>
                          <input
                            type="text"
                            className="custom-note-input"
                            placeholder="Ví dụ: Khắc tên 'Thư & Nam', tone màu hồng trà..."
                            value={item.customizationNote || ''}
                            maxLength={120}
                            onChange={(e) => handleNoteChange(item.key, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Cart Footer */}
            <div className="cart-footer">
              {/* Voucher section */}
              <div className="voucher-box">
                {appliedVoucher ? (
                  <div className="voucher-applied">
                    <div className="voucher-tag">
                      <span className="voucher-code">{appliedVoucher.code}</span>
                      <span className="voucher-desc">{appliedVoucher.label}</span>
                    </div>
                    <button
                      type="button"
                      className="voucher-remove-btn"
                      onClick={handleRemoveVoucher}
                      aria-label="Gỡ mã giảm giá"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyVoucher} className="voucher-form">
                    <input
                      type="text"
                      className="voucher-input"
                      placeholder="Mã ưu đãi (RAWWELCOME, FREESHIP...)"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                    />
                    <button type="submit" className="voucher-btn">Áp dụng</button>
                  </form>
                )}
                {voucherMsg.text && (
                  <p className={`voucher-msg ${voucherMsg.isError ? 'voucher-msg--err' : 'voucher-msg--ok'}`}>
                    {voucherMsg.text}
                  </p>
                )}
              </div>

              {/* Price summary */}
              <div className="cart-summary-table">
                <div className="summary-line">
                  <span>Tạm tính</span>
                  <span className="tabular-num">{formatVnd(subtotal)}</span>
                </div>
                {appliedVoucher && appliedVoucher.type === 'shipping' && (
                  <div className="summary-line summary-discount">
                    <span>Ưu đãi voucher ({appliedCode})</span>
                    <span className="voucher-ship-note">Miễn phí ship (khi đặt hàng)</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="summary-line summary-discount">
                    <span>Ưu đãi voucher ({appliedCode})</span>
                    <span className="tabular-num">- {formatVnd(discount)}</span>
                  </div>
                )}
                <div className="summary-line summary-grand">
                  <span>Tổng thanh toán</span>
                  <span className="summary-grand-price tabular-num">{formatVnd(finalTotal)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn-primary cart-checkout-btn"
                id="cart-checkout-btn"
                onClick={onClose}
              >
                <span>Tiến hành đặt hàng</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <button className="cart-clear-btn" onClick={handleClear} id="cart-clear-btn">Xóa toàn bộ giỏ hàng</button>
            </div>
          </>
        )}
      </aside>

      <style>{`
        .tabular-num {
          font-variant-numeric: tabular-nums;
        }
        .cart-backdrop {
          position: fixed; inset: 0; background: rgba(22, 17, 15, 0.45); z-index: 200;
          opacity: 0; pointer-events: none;
          transition-property: opacity;
          transition-duration: 250ms;
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        .cart-backdrop--open { opacity: 1; pointer-events: auto; }
        .cart-drawer {
          position: fixed; top: 0; right: 0; height: 100%; width: 100%; max-width: 440px;
          background: var(--cream); z-index: 201; display: flex; flex-direction: column;
          transform: translateX(100%);
          transition-property: transform;
          transition-duration: 320ms;
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: -12px 0 40px rgba(45, 35, 32, 0.12);
        }
        .cart-drawer--open { transform: translateX(0); }
        .cart-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px; border-bottom: 1px solid var(--border);
          background: var(--white);
        }
        .cart-title-wrap {
          display: flex; align-items: baseline; gap: 8px;
        }
        .cart-title {
          font-family: var(--font-serif); font-size: 1.35rem; color: var(--text-dark);
          letter-spacing: -0.015em; margin: 0;
        }
        .cart-count {
          background: rgba(123, 45, 62, 0.08); color: var(--burgundy); border-radius: 100px;
          font-size: 0.75rem; font-weight: 600; padding: 2px 10px; font-family: var(--font-sans);
        }
        .cart-close {
          width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; color: var(--text-mid);
          transition-property: background-color, color, transform;
          transition-duration: 150ms;
          background: var(--ivory); border: none;
        }
        .cart-close:hover { background: var(--border); color: var(--text-dark); }
        .cart-close:active { transform: scale(0.95); }

        /* Freeship bar */
        .freeship-bar {
          background: #f7faf8; border-bottom: 1px solid #dce8df;
          padding: 10px 24px 12px; display: flex; flex-direction: column; gap: 6px;
        }
        .freeship-header {
          font-size: 0.8rem; color: #2d5a43; display: flex; align-items: center; justify-content: space-between;
        }
        .freeship-qualified { color: #205c3b; font-weight: 500; }
        .freeship-track {
          height: 5px; width: 100%; background: #e3ede5; border-radius: 99px; overflow: hidden;
        }
        .freeship-fill {
          height: 100%; background: #2d5a43; border-radius: 99px;
          transition: width 300ms ease-out;
        }

        /* Empty state */
        .cart-empty {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; color: var(--text-light); padding: 40px 28px; gap: 12px;
        }
        .cart-empty-art {
          width: 72px; height: 72px; border-radius: 50%; background: var(--ivory);
          display: flex; align-items: center; justify-content: center; color: var(--warm-brown);
          margin-bottom: 4px;
        }
        .cart-empty-text { font-family: var(--font-serif); font-size: 1.15rem; color: var(--text-dark); margin: 0; }
        .cart-empty-sub { font-size: 0.85rem; color: var(--text-light); max-width: 280px; margin-bottom: 8px; line-height: 1.5; }
        .btn-sm-inner {
          padding: 10px 22px; font-size: 0.88rem; border-radius: 100px;
          color: var(--burgundy); border: 1.5px solid var(--burgundy); background: none;
          cursor: pointer;
          transition-property: background-color, color, transform;
          transition-duration: 150ms;
        }
        .btn-sm-inner:hover { background: var(--burgundy); color: white; }
        .btn-sm-inner:active { transform: scale(0.97); }

        /* Items container */
        .cart-items {
          flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 14px;
        }
        .cart-item {
          background: white; border-radius: 14px; padding: 14px; border: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .cart-item-main {
          display: flex; align-items: flex-start; gap: 12px;
        }
        .cart-item-thumb {
          width: 64px; height: 64px; border-radius: 10px; overflow: hidden;
          background: var(--ivory); flex-shrink: 0; position: relative;
          outline: 1px solid rgba(0, 0, 0, 0.08); outline-offset: -1px;
        }
        .cart-item-thumb img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .cart-thumb-placeholder {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem; font-weight: 700; color: var(--warm-brown); letter-spacing: 0.08em;
          background: #f1eae2;
        }
        .cart-item-info {
          flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;
        }
        .cart-item-title-row {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
        }
        .cart-item-name {
          font-weight: 600; font-size: 0.92rem; color: var(--text-dark); line-height: 1.35;
        }
        .cart-item-remove {
          color: var(--text-light); background: none; border: none; cursor: pointer;
          min-width: 36px; min-height: 36px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center;
          transition-property: color, background-color, transform;
          transition-duration: 150ms;
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cart-item-remove:hover { color: var(--burgundy); background: rgba(123,45,62,0.06); }
        .cart-item-remove:active { transform: scale(0.92); }
        .cart-item-opts {
          display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px;
        }
        .cart-opt-tag {
          font-size: 0.72rem; background: var(--ivory); color: var(--text-mid);
          padding: 2px 7px; border-radius: 6px; border: 1px solid var(--border);
        }
        .cart-item-price-row {
          display: flex; align-items: center; justify-content: space-between; margin-top: 6px;
        }
        .cart-item-price {
          font-weight: 600; color: var(--burgundy); font-size: 0.95rem;
        }
        .qty-mini {
          display: flex; align-items: center; border: 1px solid var(--border); border-radius: 100px;
          overflow: hidden; background: var(--ivory);
        }
        .qty-mini button {
          width: 30px; height: 30px; font-size: 0.95rem; color: var(--text-mid);
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer;
          transition-property: color, background-color;
          transition-duration: 150ms;
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        .qty-mini button:hover { color: var(--burgundy); background: rgba(0,0,0,0.03); }
        .qty-mini span { min-width: 26px; text-align: center; font-size: 0.85rem; font-weight: 600; color: var(--text-dark); }

        /* Customization note section */
        .cart-item-custom-section {
          border-top: 1px dashed var(--border); padding-top: 8px; margin-top: 2px;
        }
        .btn-toggle-note {
          background: none; border: none; font-size: 0.76rem; color: var(--warm-brown);
          display: inline-flex; align-items: center; gap: 5px; cursor: pointer; padding: 4px 0;
          font-weight: 500; min-height: 32px;
          transition-property: color;
          transition-duration: 150ms;
        }
        .btn-toggle-note:hover { color: var(--burgundy); }
        .custom-note-input-wrap {
          display: flex; flex-direction: column; gap: 4px;
        }
        .custom-note-header {
          display: flex; justify-content: space-between; align-items: center;
        }
        .custom-note-label {
          font-size: 0.72rem; color: var(--text-mid); font-weight: 600;
        }
        .btn-hide-note {
          background: none; border: none; font-size: 0.7rem; color: var(--text-light); cursor: pointer; padding: 4px;
        }
        .btn-hide-note:hover { color: var(--text-dark); }
        .custom-note-input {
          width: 100%; font-size: 0.82rem; padding: 7px 10px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--cream); font-family: inherit;
          color: var(--text-dark); outline: none;
          transition-property: border-color, background-color;
          transition-duration: 150ms;
        }
        .custom-note-input:focus { border-color: var(--burgundy); background: white; }

        /* Footer */
        .cart-footer {
          padding: 18px 24px 22px; border-top: 1px solid var(--border); background: white;
          display: flex; flex-direction: column; gap: 14px;
        }
        .voucher-box {
          display: flex; flex-direction: column; gap: 6px;
        }
        .voucher-form {
          display: flex; gap: 8px;
        }
        .voucher-input {
          flex: 1; padding: 9px 12px; font-size: 0.84rem; border: 1px solid var(--border);
          border-radius: 8px; background: var(--ivory); font-family: inherit; outline: none;
          letter-spacing: 0.04em; font-weight: 500;
          transition-property: border-color, background-color;
          transition-duration: 150ms;
        }
        .voucher-input:focus { border-color: var(--burgundy); background: white; }
        .voucher-btn {
          padding: 0 16px; background: var(--text-dark); color: white; font-size: 0.82rem;
          font-weight: 600; border-radius: 8px; border: none; cursor: pointer;
          transition-property: background-color, transform;
          transition-duration: 150ms;
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        .voucher-btn:hover { background: var(--burgundy); }
        .voucher-btn:active { transform: scale(0.97); }
        .voucher-applied {
          display: flex; align-items: center; justify-content: space-between;
          background: #f7faf8; border: 1px solid #c9decb; border-radius: 8px; padding: 8px 12px;
        }
        .voucher-tag { display: flex; flex-direction: column; gap: 2px; }
        .voucher-code { font-weight: 700; font-size: 0.8rem; color: #2d5a43; }
        .voucher-desc { font-size: 0.74rem; color: #527055; }
        .voucher-remove-btn {
          background: none; border: none; color: #7a9e7e; cursor: pointer; min-width: 32px; min-height: 32px;
          display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem;
          transition-property: color;
          transition-duration: 150ms;
        }
        .voucher-remove-btn:hover { color: #5c1f2d; }
        .voucher-msg { font-size: 0.75rem; margin: 0; }
        .voucher-msg--ok { color: #2d5a43; }
        .voucher-msg--err { color: #a34558; }

        /* Summary table */
        .cart-summary-table {
          display: flex; flex-direction: column; gap: 6px; border-top: 1px solid var(--border);
          padding-top: 10px;
        }
        .summary-line {
          display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-mid);
        }
        .summary-discount { color: #2d5a43; font-weight: 500; }
        .voucher-ship-note { font-weight: 600; font-size: 0.82rem; }
        .summary-grand {
          margin-top: 6px; padding-top: 8px; border-top: 1px dashed var(--border);
          font-size: 1.05rem; font-weight: 700; color: var(--text-dark); align-items: center;
        }
        .summary-grand-price {
          font-family: var(--font-serif); font-size: 1.35rem; color: var(--burgundy);
        }

        .cart-checkout-btn {
          width: 100%; display: flex; justify-content: center; align-items: center; gap: 8px;
          text-align: center; border-radius: 10px; padding: 13px; font-weight: 600; font-size: 0.96rem;
          transition-property: background-color, transform, box-shadow;
          transition-duration: 150ms;
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cart-checkout-btn:active { transform: scale(0.98); }
        .cart-clear-btn {
          background: none; border: none; color: var(--text-light); font-size: 0.78rem;
          cursor: pointer; text-align: center; padding: 2px;
          transition: color 150ms;
        }
        .cart-clear-btn:hover { color: var(--burgundy); }
      `}</style>
    </>
  )
}
