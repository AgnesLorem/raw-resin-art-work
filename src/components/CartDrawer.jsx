import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { removeFromCart, updateQuantity, clearCart } from '../services/cartService.js'
import { formatVnd, calculateProductTotal, calculateCartTotal } from '../services/priceService.js'

export default function CartDrawer({ open, onClose, cartItems, onCartUpdate }) {
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

  const total = calculateCartTotal(cartItems)

  const handleRemove = (key) => { removeFromCart(key); onCartUpdate() }
  const handleQty = (key, qty) => { updateQuantity(key, qty); onCartUpdate() }
  const handleClear = () => { clearCart(); onCartUpdate() }

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
          <h2 className="cart-title">
            🛍 Giỏ hàng
            {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
          </h2>
          <button className="cart-close" onClick={onClose} aria-label="Đóng giỏ hàng" id="cart-close-btn">✕</button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <span>🌿</span>
            <p>Giỏ hàng của bạn đang trống.</p>
            <button className="btn-secondary btn-sm-inner" onClick={onClose}>Tiếp tục mua sắm</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.key} id={`cart-item-${item.key.slice(0, 12)}`}>
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.product.name}</span>
                    {item.selectedOptions.length > 0 && (
                      <span className="cart-item-opts">{item.selectedOptions.join(', ')}</span>
                    )}
                    <span className="cart-item-price">
                      {formatVnd(calculateProductTotal(item.product, item.selectedOptions, item.quantity))}
                    </span>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-mini">
                      <button onClick={() => handleQty(item.key, item.quantity - 1)} aria-label="Giảm">−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQty(item.key, item.quantity + 1)} aria-label="Tăng">+</button>
                    </div>
                    <button className="cart-item-remove" onClick={() => handleRemove(item.key)} aria-label="Xóa sản phẩm">✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Tổng cộng</span>
                <span className="cart-total-price">{formatVnd(total)}</span>
              </div>
              <Link
                to="/checkout"
                className="btn-primary cart-checkout-btn"
                id="cart-checkout-btn"
                onClick={onClose}
              >
                Tiến hành thanh toán ➜
              </Link>
              <button className="cart-clear-btn" onClick={handleClear} id="cart-clear-btn">Xóa giỏ hàng</button>
            </div>
          </>
        )}
      </aside>

      <style>{`
        .cart-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200;
          opacity: 0; pointer-events: none; transition: opacity 0.3s;
          backdrop-filter: blur(2px);
        }
        .cart-backdrop--open { opacity: 1; pointer-events: auto; }
        .cart-drawer {
          position: fixed; top: 0; right: 0; height: 100%; width: 100%; max-width: 420px;
          background: var(--cream); z-index: 201; display: flex; flex-direction: column;
          transform: translateX(100%); transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: -8px 0 40px rgba(0,0,0,0.15);
        }
        .cart-drawer--open { transform: translateX(0); }
        .cart-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px; border-bottom: 1px solid var(--border);
          background: white;
        }
        .cart-title {
          font-family: var(--font-serif); font-size: 1.3rem; color: var(--text-dark);
          display: flex; align-items: center; gap: 10px;
        }
        .cart-count {
          background: var(--burgundy); color: white; border-radius: 100px;
          font-size: 0.72rem; font-weight: 700; padding: 2px 8px; font-family: var(--font-sans);
        }
        .cart-close {
          width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; color: var(--text-mid); font-size: 1rem;
          transition: var(--transition); background: var(--ivory); border: none;
        }
        .cart-close:hover { background: var(--border); color: var(--text-dark); }
        .cart-empty {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 16px; text-align: center; color: var(--text-light); padding: 40px 24px;
        }
        .cart-empty span { font-size: 3rem; }
        .btn-sm-inner {
          padding: 10px 22px; font-size: 0.88rem; border-radius: 100px;
          color: var(--burgundy); border: 2px solid var(--burgundy); background: none;
          transition: var(--transition); cursor: pointer;
        }
        .btn-sm-inner:hover { background: var(--burgundy); color: white; }
        .cart-items { flex: 1; overflow-y: auto; padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; }
        .cart-item {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
          background: white; border-radius: var(--radius-sm); padding: 14px; border: 1px solid var(--border);
        }
        .cart-item-info { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
        .cart-item-name { font-weight: 600; font-size: 0.95rem; color: var(--text-dark); }
        .cart-item-opts { font-size: 0.78rem; color: var(--text-light); line-height: 1.4; }
        .cart-item-price { font-weight: 600; color: var(--burgundy); font-size: 0.95rem; margin-top: 4px; }
        .cart-item-controls { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
        .qty-mini {
          display: flex; align-items: center; border: 1px solid var(--border); border-radius: 100px;
          overflow: hidden; background: var(--ivory);
        }
        .qty-mini button {
          width: 28px; height: 28px; font-size: 1rem; color: var(--text-mid);
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; transition: var(--transition); cursor: pointer;
        }
        .qty-mini button:hover { color: var(--burgundy); }
        .qty-mini span { min-width: 28px; text-align: center; font-size: 0.9rem; font-weight: 600; color: var(--text-dark); }
        .cart-item-remove {
          font-size: 0.75rem; color: var(--text-light); background: none; border: none;
          transition: var(--transition); cursor: pointer; padding: 2px 4px; border-radius: 4px;
        }
        .cart-item-remove:hover { color: var(--burgundy); background: rgba(123,45,62,0.05); }
        .cart-footer {
          padding: 20px 24px; border-top: 1px solid var(--border); background: white;
          display: flex; flex-direction: column; gap: 12px;
        }
        .cart-total {
          display: flex; justify-content: space-between; align-items: center;
          font-weight: 600; color: var(--text-dark);
        }
        .cart-total-price { font-family: var(--font-serif); font-size: 1.4rem; color: var(--burgundy); }
        .cart-checkout-btn { width: 100%; justify-content: center; text-align: center; }
        .cart-clear-btn {
          background: none; border: none; color: var(--text-light); font-size: 0.82rem;
          cursor: pointer; text-align: center; transition: var(--transition); padding: 4px;
        }
        .cart-clear-btn:hover { color: var(--burgundy); }
      `}</style>
    </>
  )
}

function buildOrderEmail(cartItems, total) {
  const lines = cartItems.map(
    (item) =>
      `- ${item.product.name} x${item.quantity}${item.selectedOptions.length ? ' (' + item.selectedOptions.join(', ') + ')' : ''}`
  )
  return `Xin chào R.A.W,\n\nMình muốn đặt hàng:\n\n${lines.join('\n')}\n\nTổng cộng: ${total.toLocaleString('vi-VN')}đ\n\nThông tin liên hệ:\nTên: \nSố điện thoại: \nĐịa chỉ giao hàng: \n\nCảm ơn bạn!`
}
