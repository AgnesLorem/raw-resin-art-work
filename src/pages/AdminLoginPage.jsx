// src/pages/AdminLoginPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [secretKey, setSecretKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showKey, setShowKey] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!secretKey.trim()) {
      setErrorMsg('Vui lòng nhập Khóa quản trị.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: secretKey.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Khóa quản trị không chính xác.')
      }

      sessionStorage.setItem('raw_admin_token', data.token)
      navigate('/admin')
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Không thể kết nối đến máy chủ quản trị.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page page-enter">
      <div className="login-card">
        <div className="login-header">
          <div className="admin-badge-circle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <span className="login-sub">Cổng Điều Hành Xưởng</span>
          <h1 className="login-title">R.A.W Admin Portal</h1>
          <p className="login-desc">Quản lý tiến độ đổ resin, xác nhận thanh toán và đơn hàng.</p>
        </div>

        {errorMsg && (
          <div className="login-err-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="admin-key">Master Admin Key *</label>
            <div className="key-input-container">
              <input
                type={showKey ? 'text' : 'password'}
                id="admin-key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Nhập khóa bảo mật quản trị..."
                className="font-mono key-input"
                required
              />
              <button
                type="button"
                className="toggle-show-btn"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? 'Ẩn khóa' : 'Hiện khóa'}
              >
                {showKey ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Đang xác thực...' : 'Đăng nhập Quản trị ➜'}
          </button>
        </form>
      </div>

      <style>{`
        .admin-login-page {
          min-height: 85vh; display: flex; align-items: center; justify-content: center;
          padding: 40px 20px; background: var(--cream);
        }
        .login-card {
          background: white; border: 1px solid var(--border); border-radius: 20px;
          padding: 40px 32px; width: 100%; max-width: 440px; box-shadow: 0 4px 24px rgba(45,35,32,0.06);
          display: flex; flex-direction: column; gap: 20px;
        }
        .login-header {
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .admin-badge-circle {
          width: 56px; height: 56px; border-radius: 50%; background: #eaf4ed; color: #2d5a43;
          display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
        }
        .login-sub {
          font-size: 0.74rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #2d5a43;
        }
        .login-title {
          font-family: var(--font-serif); font-size: 1.7rem; color: var(--text-dark); margin: 0;
        }
        .login-desc {
          color: var(--text-mid); font-size: 0.88rem; margin: 0; line-height: 1.45;
        }

        .login-err-banner {
          background: #fff5f5; border: 1px solid #fcc; border-radius: 10px; padding: 10px 14px;
          display: flex; align-items: center; gap: 8px; color: #a34558; font-size: 0.84rem; font-weight: 500;
        }

        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-dark); }

        .key-input-container { position: relative; display: flex; align-items: center; }
        .key-input {
          width: 100%; padding: 12px 44px 12px 14px; border: 1.5px solid var(--border);
          border-radius: 10px; font-size: 0.95rem; background: var(--ivory); outline: none;
          transition: border-color 150ms;
        }
        .key-input:focus { border-color: var(--burgundy); background: white; }
        .toggle-show-btn {
          position: absolute; right: 12px; background: none; border: none; color: var(--text-light);
          cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px;
        }
        .toggle-show-btn:hover { color: var(--text-dark); }

        .login-btn {
          width: 100%; padding: 13px; font-size: 0.96rem; font-weight: 600;
          border-radius: 10px; justify-content: center; margin-top: 4px;
        }
        .login-btn:active { transform: scale(0.98); }
      `}</style>
    </div>
  )
}
