import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/san-pham', label: 'Sản phẩm' },
  { to: '/thu-vien', label: 'Thư viện' },
  { to: '/lien-he', label: 'Liên hệ' },
]

export default function Header({ cartCount, onCartOpen }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [location])

  return (
    <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
      <div className="container header-inner">
        {/* Logo */}
        <Link to="/" className="logo" aria-label="R.A.W - Resin Art Work trang chủ">
          <span className="logo-mark">R.A.W</span>
          <span className="logo-sub">Resin Art Work</span>
        </Link>

        {/* Desktop nav */}
        <nav className="nav-desktop" aria-label="Menu chính">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="header-actions">
          <button
            className="cart-btn"
            onClick={onCartOpen}
            aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
            id="header-cart-btn"
          >
            <CartIcon />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {/* Mobile hamburger */}
          <button
            className={`hamburger${menuOpen ? ' hamburger--open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Mở menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="nav-mobile" aria-label="Menu di động">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-mobile-link${isActive ? ' nav-mobile-link--active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}

      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(250, 246, 240, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid transparent;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .site-header--scrolled {
          border-color: var(--border);
          box-shadow: 0 2px 16px rgba(123,45,62,0.08);
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
          gap: 16px;
        }
        .logo {
          display: flex;
          flex-direction: column;
          line-height: 1;
          text-decoration: none;
        }
        .logo-mark {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--burgundy);
          letter-spacing: 0.08em;
        }
        .logo-sub {
          font-size: 0.62rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-light);
          font-weight: 500;
          margin-top: 1px;
        }
        .nav-desktop {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-link {
          padding: 8px 14px;
          border-radius: 100px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-mid);
          transition: var(--transition);
        }
        .nav-link:hover { color: var(--burgundy); background: var(--ivory); }
        .nav-link--active { color: var(--burgundy); background: rgba(123,45,62,0.08); }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cart-btn {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-mid);
          transition: var(--transition);
          background: transparent;
          border: none;
        }
        .cart-btn:hover { background: var(--ivory); color: var(--burgundy); }
        .cart-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 18px;
          height: 18px;
          background: var(--burgundy);
          color: white;
          border-radius: 50%;
          font-size: 0.65rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          width: 36px;
          height: 36px;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: transparent;
          border: none;
        }
        .hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: var(--text-mid);
          border-radius: 2px;
          transition: var(--transition);
          transform-origin: center;
        }
        .hamburger--open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger--open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger--open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .nav-mobile {
          display: flex;
          flex-direction: column;
          padding: 12px 24px 20px;
          gap: 4px;
          border-top: 1px solid var(--border);
          background: var(--cream);
          animation: slideDown 0.2s ease both;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nav-mobile-link {
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-mid);
          transition: var(--transition);
        }
        .nav-mobile-link:hover { background: var(--ivory); color: var(--burgundy); }
        .nav-mobile-link--active { color: var(--burgundy); background: rgba(123,45,62,0.08); }
        @media (max-width: 768px) {
          .nav-desktop { display: none; }
          .hamburger { display: flex; }
        }
      `}</style>
    </header>
  )
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  )
}
