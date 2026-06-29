import { useState } from 'react'
import { formatVnd, calculateProductTotal } from '../services/priceService.js'

export default function ProductCustomizer({ product, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const toggleOption = (optionName) => {
    setSelectedOptions((prev) =>
      prev.includes(optionName) ? prev.filter((n) => n !== optionName) : [...prev, optionName]
    )
  }

  const total = calculateProductTotal(product, selectedOptions, quantity)

  const handleAdd = () => {
    onAddToCart(product, selectedOptions, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="customizer">
      {product.customizable && product.options.length > 0 && (
        <div className="customizer-options">
          <h3 className="customizer-heading">Tùy chọn cá nhân hóa</h3>
          {product.options.map((opt) => (
            <label
              key={opt.name}
              className={`option-row${selectedOptions.includes(opt.name) ? ' option-row--selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={selectedOptions.includes(opt.name)}
                onChange={() => toggleOption(opt.name)}
                className="option-checkbox"
                id={`opt-${opt.name.replace(/\s+/g, '-')}`}
              />
              <div className="option-info">
                <span className="option-name">{opt.name}</span>
                <span className="option-price">+{formatVnd(opt.priceDeltaVnd)}</span>
              </div>
            </label>
          ))}
        </div>
      )}

      <div className="customizer-qty">
        <span className="customizer-label">Số lượng</span>
        <div className="qty-control">
          <button
            className="qty-btn"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Giảm số lượng"
            id="qty-decrease"
          >−</button>
          <span className="qty-val" id="qty-display">{quantity}</span>
          <button
            className="qty-btn"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Tăng số lượng"
            id="qty-increase"
          >+</button>
        </div>
      </div>

      <div className="customizer-total">
        <span className="customizer-label">Tổng cộng</span>
        <span className="customizer-total-price">{formatVnd(total)}</span>
      </div>

      <div className="customizer-actions">
        <button
          className={`btn-primary btn-add${added ? ' btn-add--done' : ''}`}
          onClick={handleAdd}
          id="add-to-cart-btn"
        >
          {added ? '✓ Đã thêm!' : 'Thêm vào giỏ'}
        </button>
        <a
          href={`mailto:tainh.ce190387@gmail.com?subject=Đặt hàng: ${product.name}&body=Mình muốn đặt: ${product.name}%0ASố lượng: ${quantity}%0ATùy chọn: ${selectedOptions.join(', ') || 'Không có'}`}
          className="btn-sage"
          id="order-custom-btn"
        >
          Đặt theo yêu cầu
        </a>
      </div>

      <style>{`
        .customizer {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .customizer-heading {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 12px;
          font-family: var(--font-sans);
        }
        .customizer-options {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .option-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition);
          margin-bottom: 8px;
          background: white;
        }
        .option-row:hover { border-color: var(--sage); background: #f6fbf6; }
        .option-row--selected { border-color: var(--sage); background: #f0f8f0; }
        .option-checkbox { accent-color: var(--sage); width: 16px; height: 16px; cursor: pointer; }
        .option-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex: 1;
          gap: 8px;
        }
        .option-name { font-size: 0.9rem; color: var(--text-dark); }
        .option-price { font-size: 0.85rem; font-weight: 600; color: var(--sage-dark); white-space: nowrap; }
        .customizer-qty, .customizer-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .customizer-label { font-size: 0.9rem; font-weight: 500; color: var(--text-mid); }
        .qty-control {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1.5px solid var(--border);
          border-radius: 100px;
          overflow: hidden;
          background: white;
        }
        .qty-btn {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: var(--text-mid);
          transition: var(--transition);
          background: transparent;
          border: none;
        }
        .qty-btn:hover { background: var(--ivory); color: var(--burgundy); }
        .qty-val {
          min-width: 36px;
          text-align: center;
          font-weight: 600;
          font-size: 1rem;
          color: var(--text-dark);
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
          height: 38px;
          line-height: 38px;
          padding: 0 4px;
        }
        .customizer-total-price {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--burgundy);
        }
        .customizer-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .btn-add { flex: 1; justify-content: center; min-width: 140px; }
        .btn-add--done { background: var(--sage) !important; }
      `}</style>
    </div>
  )
}
