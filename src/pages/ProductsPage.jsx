import { useState } from 'react'
import ProductGrid from '../components/ProductGrid.jsx'
import { products, getCategories } from '../data/products.js'

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('Tất cả')
  const categories = getCategories()

  const filtered = activeCategory === 'Tất cả'
    ? products
    : products.filter((p) => p.category === activeCategory)

  return (
    <div className="page-enter products-page">
      <div className="products-hero">
        <div className="container">
          <span className="section-label">Bộ sưu tập</span>
          <h1 className="section-title">Sản phẩm Resin Handmade</h1>
          <p className="section-desc">
            Mỗi sản phẩm được làm thủ công, có thể cá nhân hóa theo yêu cầu của bạn.
          </p>
        </div>
      </div>

      <div className="container products-body">
        {/* Filter tabs */}
        <div className="filter-bar" role="group" aria-label="Lọc theo danh mục">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-tab${activeCategory === cat ? ' filter-tab--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              id={`filter-${cat.replace(/\s+/g, '-')}`}
              aria-pressed={activeCategory === cat}
            >
              {cat}
              {cat !== 'Tất cả' && (
                <span className="filter-count">
                  {products.filter((p) => p.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="products-result-info">
          <span>{filtered.length} sản phẩm</span>
        </div>

        <ProductGrid products={filtered} />
      </div>

      <style>{`
        .products-hero {
          background: linear-gradient(135deg, var(--ivory) 0%, white 100%);
          padding: 56px 0 48px;
          border-bottom: 1px solid var(--border);
        }
        .products-body { padding-top: 40px; padding-bottom: 80px; }
        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }
        .filter-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 20px;
          border-radius: 100px;
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--text-mid);
          background: var(--ivory);
          border: 1.5px solid var(--border);
          transition: var(--transition);
          cursor: pointer;
        }
        .filter-tab:hover { border-color: var(--burgundy); color: var(--burgundy); }
        .filter-tab--active {
          background: var(--burgundy);
          color: white;
          border-color: var(--burgundy);
        }
        .filter-count {
          background: rgba(255,255,255,0.25);
          border-radius: 100px;
          padding: 1px 7px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .filter-tab:not(.filter-tab--active) .filter-count {
          background: var(--border);
          color: var(--text-light);
        }
        .products-result-info {
          font-size: 0.88rem;
          color: var(--text-light);
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  )
}
