import { Link } from 'react-router-dom'
import { formatVnd } from '../services/priceService.js'
import ProductImagePlaceholder from './ProductImagePlaceholder.jsx'

export default function ProductCard({ product }) {
  return (
    <article className="product-card card" id={`product-card-${product.id}`}>
      <Link to={`/san-pham/${product.slug}`} className="product-card-img-link" tabIndex={-1} aria-hidden="true">
        <div className="product-card-img">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.name} loading="lazy" />
          ) : (
            <ProductImagePlaceholder name={product.name} category={product.category} />
          )}
        </div>
      </Link>

      <div className="product-card-body">
        <span className="chip">{product.category}</span>
        <Link to={`/san-pham/${product.slug}`}>
          <h3 className="product-card-name">{product.name}</h3>
        </Link>
        <p className="product-card-desc">{product.shortDescription}</p>
        <div className="product-card-footer">
          <span className="price">{formatVnd(product.priceVnd)}</span>
          <Link to={`/san-pham/${product.slug}`} className="btn-secondary btn-sm" id={`view-detail-${product.id}`}>
            Xem chi tiết
          </Link>
        </div>
      </div>

      <style>{`
        .product-card {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-md);
        }
        .product-card-img-link { display: block; }
        .product-card-img {
          aspect-ratio: 4/3;
          overflow: hidden;
          background: var(--ivory);
          border-radius: var(--radius-md) var(--radius-md) 0 0;
        }
        .product-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .product-card:hover .product-card-img img { transform: scale(1.05); }
        .product-card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .product-card-name {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-dark);
          margin-top: 4px;
          transition: color 0.2s;
        }
        .product-card-name:hover { color: var(--burgundy); }
        .product-card-desc {
          font-size: 0.88rem;
          color: var(--text-mid);
          line-height: 1.55;
          flex: 1;
        }
        .product-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }
        .btn-sm {
          padding: 8px 18px !important;
          font-size: 0.82rem !important;
        }
      `}</style>
    </article>
  )
}
