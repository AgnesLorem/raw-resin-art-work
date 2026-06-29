import { useParams, Link } from 'react-router-dom'
import { getProductBySlug } from '../data/products.js'
import { formatVnd } from '../services/priceService.js'
import { addToCart } from '../services/cartService.js'
import ProductCustomizer from '../components/ProductCustomizer.jsx'
import ProductImagePlaceholder from '../components/ProductImagePlaceholder.jsx'

export default function ProductDetailPage({ onCartUpdate }) {
  const { slug } = useParams()
  const product = getProductBySlug(slug)

  if (!product) {
    return (
      <div className="page-enter not-found-page">
        <div className="nf-content">
          <div className="nf-icon">🌿</div>
          <h1>Sản phẩm không tồn tại</h1>
          <p>Có thể sản phẩm đã bị xóa hoặc đường dẫn không chính xác.</p>
          <Link to="/san-pham" className="btn-primary" id="nf-back-btn">Xem tất cả sản phẩm</Link>
        </div>
        <style>{`
          .not-found-page { display: flex; align-items: center; justify-content: center; min-height: 60vh; }
          .nf-content { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
          .nf-icon { font-size: 3.5rem; }
          .nf-content h1 { font-size: 1.8rem; color: var(--text-dark); }
          .nf-content p { color: var(--text-mid); }
        `}</style>
      </div>
    )
  }

  const handleAddToCart = (prod, selectedOptions, quantity) => {
    addToCart(prod, selectedOptions, quantity)
    onCartUpdate?.()
  }

  return (
    <div className="page-enter">
      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
        <div className="container breadcrumb-inner">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/san-pham">Sản phẩm</Link>
          <span>/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>
      </div>

      <div className="container detail-layout">
        {/* Image panel */}
        <div className="detail-images">
          <div className="detail-main-img">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0]} alt={product.name} />
            ) : (
              <ProductImagePlaceholder name={product.name} category={product.category} />
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="detail-thumb-row">
              {product.images.slice(1).map((img, i) => (
                <img key={i} src={img} alt={`${product.name} ${i + 2}`} className="detail-thumb" />
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="detail-info">
          <div className="detail-meta">
            <span className="chip">{product.category}</span>
            {product.customizable && <span className="chip chip--sage">Có thể cá nhân hóa</span>}
          </div>

          <h1 className="detail-title">{product.name}</h1>
          <div className="detail-price">{formatVnd(product.priceVnd)} <span className="detail-price-note">/ sản phẩm</span></div>

          <p className="detail-desc">{product.description}</p>

          <div className="detail-specs">
            <div className="spec-row">
              <span className="spec-label">Chất liệu</span>
              <span className="spec-value">{product.materials.join(', ')}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Kích thước</span>
              <span className="spec-value">{product.dimensions}</span>
            </div>
          </div>

          <hr className="divider" />

          <ProductCustomizer product={product} onAddToCart={handleAddToCart} />

          <div className="detail-tags">
            {product.tags.map((tag) => (
              <span key={tag} className="chip">#{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .breadcrumb-bar { background: var(--ivory); border-bottom: 1px solid var(--border); padding: 12px 0; }
        .breadcrumb-inner {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-light);
        }
        .breadcrumb-inner a { color: var(--text-mid); transition: var(--transition); }
        .breadcrumb-inner a:hover { color: var(--burgundy); }
        .breadcrumb-current { color: var(--text-dark); font-weight: 500; }
        .detail-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: start;
          padding-top: 48px;
          padding-bottom: 80px;
        }
        .detail-main-img {
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--ivory);
          min-height: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .detail-main-img img { width: 100%; height: 100%; object-fit: cover; }
        .detail-thumb-row { display: flex; gap: 10px; margin-top: 12px; }
        .detail-thumb {
          width: 80px; height: 80px; object-fit: cover;
          border-radius: var(--radius-sm); border: 2px solid var(--border);
          cursor: pointer; transition: var(--transition);
        }
        .detail-thumb:hover { border-color: var(--burgundy); }
        .detail-info { display: flex; flex-direction: column; gap: 18px; }
        .detail-meta { display: flex; gap: 8px; flex-wrap: wrap; }
        .chip--sage { background: rgba(122,158,126,0.12); color: var(--sage-dark); border-color: var(--sage-light); }
        .detail-title { font-size: 2rem; font-weight: 700; color: var(--text-dark); }
        .detail-price { font-family: var(--font-serif); font-size: 1.8rem; font-weight: 700; color: var(--burgundy); }
        .detail-price-note { font-size: 1rem; color: var(--text-light); font-weight: 400; font-family: var(--font-sans); }
        .detail-desc { color: var(--text-mid); line-height: 1.7; font-size: 0.95rem; }
        .detail-specs {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--ivory);
          padding: 16px;
          border-radius: var(--radius-sm);
        }
        .spec-row { display: flex; gap: 12px; align-items: flex-start; }
        .spec-label { font-size: 0.8rem; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.05em; min-width: 80px; padding-top: 2px; }
        .spec-value { font-size: 0.9rem; color: var(--text-dark); flex: 1; line-height: 1.5; }
        .detail-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        @media (max-width: 900px) {
          .detail-layout { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>
    </div>
  )
}
