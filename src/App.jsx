import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import HomePage from './pages/HomePage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import GalleryPage from './pages/GalleryPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import PaymentSuccessPage from './pages/PaymentSuccessPage.jsx'
import PaymentCancelPage from './pages/PaymentCancelPage.jsx'
import { getCart } from './services/cartService.js'

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState(getCart())

  const refreshCart = () => setCartItems(getCart())

  useEffect(() => {
    const handler = () => refreshCart()
    window.addEventListener('cart-updated', handler)
    return () => window.removeEventListener('cart-updated', handler)
  }, [])

  return (
    <BrowserRouter>
      <Header cartCount={cartItems.length} onCartOpen={() => setCartOpen(true)} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/san-pham" element={<ProductsPage />} />
          <Route path="/san-pham/:slug" element={<ProductDetailPage onCartUpdate={refreshCart} />} />
          <Route path="/thu-vien" element={<GalleryPage />} />
          <Route path="/lien-he" element={<ContactPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/thanh-toan-thanh-cong" element={<PaymentSuccessPage />} />
          <Route path="/thanh-toan-bi-huy" element={<PaymentCancelPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onCartUpdate={refreshCart}
      />
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem' }}>🌿</div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--burgundy)' }}>Trang không tồn tại</h1>
      <p style={{ color: 'var(--text-mid)' }}>Có vẻ như bạn đã lạc đường. Hãy quay về trang chủ nhé.</p>
      <a href="/" className="btn-primary">Về trang chủ</a>
    </div>
  )
}
