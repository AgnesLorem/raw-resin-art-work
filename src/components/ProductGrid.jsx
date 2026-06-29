import ProductCard from './ProductCard.jsx'

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="product-grid-empty">
        <span>🌿</span>
        <p>Không có sản phẩm nào trong mục này.</p>
      </div>
    )
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      <style>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 28px;
        }
        .product-grid-empty {
          text-align: center;
          padding: 60px 24px;
          color: var(--text-light);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          font-size: 1rem;
        }
        .product-grid-empty span { font-size: 2.5rem; }
      `}</style>
    </div>
  )
}
