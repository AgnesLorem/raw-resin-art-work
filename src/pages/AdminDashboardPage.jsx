// src/pages/AdminDashboardPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatVnd } from '../services/priceService.js'

const ORDER_STATUS_LABELS = {
  new: 'Đơn mới',
  confirmed: 'Đã tiếp nhận',
  producing: 'Đang đổ resin',
  shipped: 'Đang giao hàng',
  delivered: 'Đã giao thành công',
  cancelled: 'Đã hủy',
}

const PAYMENT_STATUS_LABELS = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [stats, setStats] = useState({ totalOrders: 0, newOrders: 0, producingOrders: 0, totalRevenueVnd: 0 })
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [search, setSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingCode, setUpdatingCode] = useState(null)

  // Verify auth session on load
  useEffect(() => {
    const savedToken = sessionStorage.getItem('raw_admin_token')
    if (!savedToken) {
      navigate('/admin/login')
      return
    }
    setToken(savedToken)
  }, [navigate])

  const fetchDashboardData = async (currentToken) => {
    const activeToken = currentToken || token
    if (!activeToken) return

    setLoading(true)
    setErrorMsg('')

    try {
      // 1. Fetch stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      if (statsRes.status === 401) {
        sessionStorage.removeItem('raw_admin_token')
        navigate('/admin/login')
        return
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // 2. Fetch orders with filters
      const params = new URLSearchParams()
      if (orderStatusFilter !== 'all') params.set('orderStatus', orderStatusFilter)
      if (paymentStatusFilter !== 'all') params.set('paymentStatus', paymentStatusFilter)
      if (search.trim()) params.set('search', search.trim())

      const ordersRes = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      })
      if (ordersRes.status === 401) {
        sessionStorage.removeItem('raw_admin_token')
        navigate('/admin/login')
        return
      }
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData.orders || [])
      } else {
        const errData = await ordersRes.json().catch(() => ({}))
        throw new Error(errData.message || 'Không thể tải danh sách đơn hàng.')
      }
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchDashboardData(token)
    }
  }, [token, orderStatusFilter, paymentStatusFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchDashboardData()
  }

  const handleUpdateStatus = async (orderCode, newOrderStatus, newPaymentStatus) => {
    setUpdatingCode(orderCode)
    try {
      const body = { orderCode }
      if (newOrderStatus) body.orderStatus = newOrderStatus
      if (newPaymentStatus) body.paymentStatus = newPaymentStatus

      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (res.status === 401) {
        sessionStorage.removeItem('raw_admin_token')
        navigate('/admin/login')
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Cập nhật thất bại.')
      }

      // Update local state immediately
      setOrders((prev) =>
        prev.map((o) => {
          if (o.order_code === orderCode) {
            return {
              ...o,
              order_status: newOrderStatus || o.order_status,
              payment_status: newPaymentStatus || o.payment_status,
            }
          }
          return o
        })
      )

      if (selectedOrder && selectedOrder.order_code === orderCode) {
        setSelectedOrder((prev) => ({
          ...prev,
          order_status: newOrderStatus || prev.order_status,
          payment_status: newPaymentStatus || prev.payment_status,
        }))
      }
    } catch (err) {
      alert(err.message || 'Có lỗi xảy ra khi cập nhật.')
    } finally {
      setUpdatingCode(null)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('raw_admin_token')
    navigate('/admin/login')
  }

  return (
    <div className="admin-dashboard-page page-enter">
      <div className="container dashboard-container">
        {/* Admin Top Navigation */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <div className="admin-logo-mark">R.A.W</div>
            <div className="topbar-headings">
              <h1 className="topbar-title">Xưởng Quản Trị & Đơn Hàng</h1>
              <span className="topbar-sub">Hệ Thống Kiểm Soát Chế Tác Resin</span>
            </div>
          </div>

          <div className="topbar-right">
            <span className="admin-online-badge">
              <span className="online-dot"></span>
              Đã xác thực
            </span>
            <button type="button" className="btn-logout" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* 4 KPI Summary Cards */}
        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-box kpi-icon-box--all">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Tổng đơn hàng</span>
              <strong className="kpi-value tabular-num">{stats.totalOrders}</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box kpi-icon-box--new">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Đơn mới tiếp nhận</span>
              <strong className="kpi-value kpi-value--highlight tabular-num">{stats.newOrders}</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box kpi-icon-box--producing">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Đang đổ resin / chế tác</span>
              <strong className="kpi-value tabular-num">{stats.producingOrders}</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-box kpi-icon-box--rev">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Doanh thu thực nhận</span>
              <strong className="kpi-value kpi-value--rev tabular-num">{formatVnd(stats.totalRevenueVnd)}</strong>
            </div>
          </div>
        </section>

        {/* Toolbar: Search & Filters */}
        <section className="dashboard-toolbar">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="Tìm mã đơn, tên khách, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="toolbar-search-input"
            />
            <button type="submit" className="btn-search">Lọc</button>
          </form>

          <div className="filter-group">
            <label className="filter-item">
              <span>Đơn hàng:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="new">Mới đặt (new)</option>
                <option value="confirmed">Đã tiếp nhận (confirmed)</option>
                <option value="producing">Đang đổ resin (producing)</option>
                <option value="shipped">Đang giao hàng (shipped)</option>
                <option value="delivered">Đã giao thành công (delivered)</option>
                <option value="cancelled">Đã hủy (cancelled)</option>
              </select>
            </label>

            <label className="filter-item">
              <span>Thanh toán:</span>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả thanh toán</option>
                <option value="pending">Chờ thanh toán (pending)</option>
                <option value="paid">Đã thanh toán (paid)</option>
                <option value="failed">Thất bại (failed)</option>
              </select>
            </label>

            <button
              type="button"
              className="btn-refresh"
              onClick={() => fetchDashboardData()}
              title="Tải lại danh sách"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </button>
          </div>
        </section>

        {errorMsg && (
          <div className="dashboard-err-alert">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Orders Table */}
        <section className="orders-table-wrapper">
          {loading ? (
            <div className="table-loading">
              <div className="spinner"></div>
              <p>Đang tải dữ liệu đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="table-empty">
              <p>Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Thời gian</th>
                    <th>Khách hàng & SĐT</th>
                    <th>Tác phẩm & Ghi chú cá nhân</th>
                    <th>Tổng tiền</th>
                    <th>Hình thức</th>
                    <th>Trạng thái đơn</th>
                    <th>Thanh toán</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const isUpdating = updatingCode === o.order_code
                    return (
                      <tr key={o.order_code} className={isUpdating ? 'row-updating' : ''}>
                        <td className="font-mono tabular-num">
                          <button
                            type="button"
                            className="btn-link-order"
                            onClick={() => setSelectedOrder(o)}
                          >
                            #{o.order_code}
                          </button>
                        </td>
                        <td className="order-time-col tabular-num">
                          {o.created_at ? new Date(o.created_at).toLocaleString('vi-VN', {
                            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                          }) : '—'}
                        </td>
                        <td>
                          <div className="cust-cell">
                            <strong>{o.customer_name}</strong>
                            <span className="font-mono">{o.customer_phone}</span>
                          </div>
                        </td>
                        <td>
                          <div className="items-cell">
                            {(o.items || []).map((it, idx) => (
                              <div key={idx} className="item-row-compact">
                                <span>{it.product_name} (x{it.quantity})</span>
                                {it.customization_note && (
                                  <span className="custom-note-pill" title={it.customization_note}>
                                    Khắc: "{it.customization_note}"
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="amount-cell tabular-num">
                          {formatVnd(o.total_vnd)}
                        </td>
                        <td>
                          <span className="method-tag">
                            {o.payment_method === 'bank_transfer' ? 'VietQR'
                              : o.payment_method === 'cod' ? 'COD'
                              : 'PayOS'}
                          </span>
                        </td>
                        <td>
                          <select
                            value={o.order_status}
                            onChange={(e) => handleUpdateStatus(o.order_code, e.target.value, null)}
                            className={`select-status select-status--${o.order_status}`}
                          >
                            <option value="new">Mới đặt</option>
                            <option value="confirmed">Đã tiếp nhận</option>
                            <option value="producing">Đang đổ resin</option>
                            <option value="shipped">Đang giao</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={o.payment_status}
                            onChange={(e) => handleUpdateStatus(o.order_code, null, e.target.value)}
                            className={`select-payment select-payment--${o.payment_status}`}
                          >
                            <option value="pending">Chờ thanh toán</option>
                            <option value="paid">Đã thanh toán</option>
                            <option value="failed">Thất bại</option>
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-view-detail"
                            onClick={() => setSelectedOrder(o)}
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title font-serif">Chi tiết Đơn hàng #{selectedOrder.order_code}</h2>
                  <span className="modal-time tabular-num">
                    Tạo lúc: {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {/* Customer Information Block */}
                <div className="modal-block">
                  <h3 className="block-title">Thông tin giao nhận</h3>
                  <div className="detail-grid">
                    <div><span className="dg-label">Khách hàng:</span> <strong>{selectedOrder.customer_name}</strong></div>
                    <div><span className="dg-label">Số điện thoại:</span> <strong className="font-mono">{selectedOrder.customer_phone}</strong></div>
                    <div><span className="dg-label">Email:</span> <span>{selectedOrder.customer_email || '—'}</span></div>
                    <div><span className="dg-label">Khu vực:</span> <span>{selectedOrder.shipping_region === 'can_tho' ? 'Nội ô Cần Thơ' : 'Toàn quốc'}</span></div>
                    <div className="dg-full"><span className="dg-label">Địa chỉ:</span> <span>{selectedOrder.customer_address || '—'}</span></div>
                  </div>
                </div>

                {/* Items & Customization Notes Block */}
                <div className="modal-block">
                  <h3 className="block-title">Danh sách tác phẩm & Yêu cầu chế tác</h3>
                  <div className="modal-items-list">
                    {(selectedOrder.items || []).map((it, idx) => (
                      <div key={idx} className="modal-item-card">
                        <div className="modal-item-header">
                          <strong className="modal-item-name">{it.product_name}</strong>
                          <span className="modal-item-qty">Số lượng: {it.quantity}</span>
                          <span className="modal-item-price tabular-num">{formatVnd(it.unit_price_vnd * it.quantity)}</span>
                        </div>

                        {it.selectedOptions && it.selectedOptions.length > 0 && (
                          <div className="modal-item-options">
                            Tùy chọn: {it.selectedOptions.map((opt, i) => (
                              <span key={i} className="opt-chip-modal">
                                {typeof opt === 'string' ? opt : opt.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {it.customization_note ? (
                          <div className="modal-custom-box">
                            <span className="mcb-label">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mcb-icon">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                              </svg>
                              Yêu cầu cá nhân hóa / Khắc chữ:
                            </span>
                            <p className="mcb-text">{it.customization_note}</p>
                          </div>
                        ) : (
                          <span className="mcb-none">Không có ghi chú riêng</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals Block */}
                <div className="modal-totals-box">
                  <div className="mt-row"><span>Tạm tính:</span> <span className="tabular-num">{formatVnd(selectedOrder.subtotal_vnd)}</span></div>
                  <div className="mt-row"><span>Phí giao hàng:</span> <span className="tabular-num">{formatVnd(selectedOrder.shipping_fee_vnd || 0)}</span></div>
                  {selectedOrder.discount_vnd > 0 && (
                    <div className="mt-row text-discount"><span>Giảm giá voucher:</span> <span className="tabular-num">- {formatVnd(selectedOrder.discount_vnd)}</span></div>
                  )}
                  <div className="mt-row mt-grand"><span>Tổng thanh toán:</span> <span className="mt-grand-val tabular-num">{formatVnd(selectedOrder.total_vnd)}</span></div>
                </div>

                {/* Quick Status Control Bar */}
                <div className="modal-actions-bar">
                  <span className="mab-title">Cập nhật nhanh tiến độ:</span>
                  <div className="mab-buttons">
                    <button
                      type="button"
                      className="btn-step-action btn-step--producing"
                      onClick={() => handleUpdateStatus(selectedOrder.order_code, 'producing', null)}
                    >
                      Bắt đầu đổ resin (Producing)
                    </button>
                    <button
                      type="button"
                      className="btn-step-action btn-step--shipped"
                      onClick={() => handleUpdateStatus(selectedOrder.order_code, 'shipped', null)}
                    >
                      Bàn giao vận chuyển (Shipped)
                    </button>
                    <button
                      type="button"
                      className="btn-step-action btn-step--delivered"
                      onClick={() => handleUpdateStatus(selectedOrder.order_code, 'delivered', null)}
                    >
                      Đã giao thành công (Delivered)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .tabular-num { font-variant-numeric: tabular-nums; }
        .font-mono { font-family: monospace; }
        .admin-dashboard-page {
          background: #f7f4ee; min-height: 90vh; padding: 32px 20px 80px;
        }
        .dashboard-container { max-width: 1240px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }

        /* Topbar */
        .dashboard-topbar {
          background: white; border: 1px solid var(--border); border-radius: 16px;
          padding: 18px 24px; display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 2px 10px rgba(45,35,32,0.03); flex-wrap: wrap; gap: 14px;
        }
        .topbar-left { display: flex; align-items: center; gap: 14px; }
        .admin-logo-mark {
          font-family: var(--font-serif); font-size: 1.25rem; font-weight: 700;
          color: white; background: var(--burgundy); padding: 6px 12px; border-radius: 8px;
        }
        .topbar-headings { display: flex; flex-direction: column; gap: 2px; }
        .topbar-title { font-family: var(--font-serif); font-size: 1.35rem; color: var(--text-dark); margin: 0; }
        .topbar-sub { font-size: 0.76rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.08em; }

        .topbar-right { display: flex; align-items: center; gap: 14px; }
        .admin-online-badge {
          display: flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 600;
          color: #2d5a43; background: #eaf4ed; padding: 4px 10px; border-radius: 100px;
        }
        .online-dot { width: 7px; height: 7px; border-radius: 50%; background: #2d5a43; }
        .btn-logout {
          display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px;
          font-size: 0.82rem; font-weight: 600; color: #a34558; border: 1px solid #f2c7ce;
          background: #fff8f8; cursor: pointer; transition: background-color 150ms;
        }
        .btn-logout:hover { background: #fae6e9; }

        /* KPI Grid */
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .kpi-card {
          background: white; border: 1px solid var(--border); border-radius: 14px;
          padding: 18px 20px; display: flex; align-items: center; gap: 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.02);
        }
        .kpi-icon-box {
          width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
        }
        .kpi-icon-box--all { background: #eaf4ed; color: #2d5a43; }
        .kpi-icon-box--new { background: #fdf5e6; color: #a36518; }
        .kpi-icon-box--producing { background: #ede8f7; color: #5b3fa3; }
        .kpi-icon-box--rev { background: #fbeeed; color: var(--burgundy); }

        .kpi-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .kpi-label { font-size: 0.76rem; color: var(--text-light); }
        .kpi-value { font-size: 1.35rem; color: var(--text-dark); font-weight: 700; line-height: 1.2; }
        .kpi-value--highlight { color: #a36518; }
        .kpi-value--rev { font-size: 1.25rem; color: var(--burgundy); font-family: var(--font-serif); }

        /* Toolbar */
        .dashboard-toolbar {
          background: white; border: 1px solid var(--border); border-radius: 14px;
          padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;
          gap: 16px; flex-wrap: wrap;
        }
        .search-form { display: flex; gap: 8px; flex: 1; max-width: 420px; }
        .toolbar-search-input {
          flex: 1; padding: 8px 12px; border: 1.5px solid var(--border); border-radius: 8px;
          font-size: 0.85rem; outline: none; background: var(--ivory); font-family: inherit;
        }
        .toolbar-search-input:focus { border-color: var(--burgundy); background: white; }
        .btn-search {
          padding: 0 16px; background: var(--text-dark); color: white; border-radius: 8px;
          font-size: 0.82rem; font-weight: 600; cursor: pointer;
        }
        .filter-group { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .filter-item {
          display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: var(--text-mid);
        }
        .filter-select {
          padding: 7px 10px; border: 1px solid var(--border); border-radius: 8px;
          font-size: 0.82rem; background: white; outline: none;
        }
        .btn-refresh {
          padding: 8px; border-radius: 8px; border: 1px solid var(--border); background: var(--ivory);
          color: var(--text-mid); cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .btn-refresh:hover { background: var(--border); }

        .dashboard-err-alert {
          background: #fff5f5; border: 1px solid #fcc; border-radius: 10px; padding: 12px 16px;
          color: #a34558; font-size: 0.88rem;
        }

        /* Table */
        .orders-table-wrapper {
          background: white; border: 1px solid var(--border); border-radius: 16px;
          overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }
        .table-scroll { overflow-x: auto; }
        .orders-table {
          width: 100%; border-collapse: collapse; text-align: left; font-size: 0.86rem;
        }
        .orders-table th {
          background: #faf7f2; padding: 12px 16px; font-weight: 600; color: var(--text-mid);
          border-bottom: 1px solid var(--border); white-space: nowrap; font-size: 0.78rem;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .orders-table td {
          padding: 14px 16px; border-bottom: 1px solid #f0e9e1; vertical-align: middle;
        }
        .orders-table tbody tr:hover { background: #fdfcf9; }
        .row-updating { opacity: 0.5; pointer-events: none; }

        .btn-link-order {
          color: var(--burgundy); font-weight: 700; background: none; border: none; cursor: pointer;
          font-size: 0.88rem; padding: 0; text-decoration: underline; text-underline-offset: 2px;
        }
        .order-time-col { font-size: 0.78rem; color: var(--text-light); white-space: nowrap; }
        .cust-cell { display: flex; flex-direction: column; gap: 2px; }
        .cust-cell strong { color: var(--text-dark); font-size: 0.88rem; }
        .cust-cell span { font-size: 0.78rem; color: var(--text-light); }

        .items-cell { display: flex; flex-direction: column; gap: 4px; max-width: 240px; }
        .item-row-compact { font-size: 0.8rem; color: var(--text-dark); display: flex; flex-direction: column; }
        .custom-note-pill {
          font-size: 0.72rem; color: #855726; background: #fef7ee; padding: 1px 6px;
          border-radius: 4px; border: 1px solid #f2dfc7; font-style: italic; width: fit-content;
        }

        .amount-cell { font-weight: 700; color: var(--text-dark); font-size: 0.92rem; white-space: nowrap; }
        .method-tag {
          font-size: 0.74rem; font-weight: 600; padding: 2px 7px; border-radius: 6px;
          background: var(--ivory); color: var(--text-mid); border: 1px solid var(--border);
        }

        /* Status Dropdowns */
        .select-status, .select-payment {
          padding: 4px 8px; border-radius: 6px; font-size: 0.76rem; font-weight: 600;
          outline: none; border: 1px solid transparent; cursor: pointer;
        }
        .select-status--new { background: #eaf4ed; color: #2d5a43; border-color: #c9decb; }
        .select-status--confirmed { background: #e5f0fa; color: #1c5b96; border-color: #bad6f2; }
        .select-status--producing { background: #fdf5e6; color: #a36518; border-color: #f7e1b5; }
        .select-status--shipped { background: #ede8f7; color: #5b3fa3; border-color: #d6caed; }
        .select-status--delivered { background: #e0f2e9; color: #1e7040; border-color: #b3dfc6; }
        .select-status--cancelled { background: #fbeeed; color: #a34558; border-color: #f2c7ce; }

        .select-payment--paid { background: #eaf4ed; color: #2d5a43; border-color: #c9decb; }
        .select-payment--pending { background: #fdf5e6; color: #a36518; border-color: #f7e1b5; }
        .select-payment--failed { background: #fbeeed; color: #a34558; border-color: #f2c7ce; }

        .btn-view-detail {
          padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border);
          background: white; font-size: 0.76rem; font-weight: 600; color: var(--text-mid);
          cursor: pointer; transition: background-color 150ms;
        }
        .btn-view-detail:hover { background: var(--ivory); color: var(--text-dark); }

        .table-loading, .table-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 48px 20px; color: var(--text-mid); gap: 12px;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(22, 17, 15, 0.55); z-index: 300;
          display: flex; align-items: center; justify-content: center; padding: 20px;
          backdrop-filter: blur(4px);
        }
        .modal-card {
          background: white; border-radius: 20px; max-width: 680px; width: 100%; max-height: 90vh;
          overflow-y: auto; padding: 28px; box-shadow: 0 12px 40px rgba(0,0,0,0.18);
          display: flex; flex-direction: column; gap: 20px;
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          border-bottom: 1px solid var(--border); padding-bottom: 14px;
        }
        .modal-title { font-size: 1.45rem; color: var(--text-dark); margin: 0; }
        .modal-time { font-size: 0.78rem; color: var(--text-light); }
        .modal-close-btn {
          background: var(--ivory); border: none; width: 32px; height: 32px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem;
        }

        .modal-body { display: flex; flex-direction: column; gap: 18px; }
        .modal-block {
          background: #fcfbfa; border: 1px solid var(--border); border-radius: 12px; padding: 16px;
        }
        .block-title {
          font-family: var(--font-sans); font-size: 0.88rem; font-weight: 700; color: var(--text-dark);
          margin-bottom: 10px;
        }
        .detail-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 0.84rem;
        }
        .dg-label { color: var(--text-light); margin-right: 4px; }
        .dg-full { grid-column: span 2; }

        .modal-items-list { display: flex; flex-direction: column; gap: 10px; }
        .modal-item-card {
          background: white; border: 1px solid var(--border); border-radius: 10px; padding: 12px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .modal-item-header { display: flex; justify-content: space-between; font-size: 0.88rem; }
        .modal-item-name { color: var(--text-dark); }
        .modal-item-qty { color: var(--text-light); font-size: 0.8rem; }
        .modal-item-price { font-weight: 600; color: var(--text-dark); }
        .modal-item-options { font-size: 0.75rem; color: var(--text-mid); }
        .opt-chip-modal {
          background: var(--ivory); padding: 1px 6px; border-radius: 4px; margin-left: 4px;
        }
        .modal-custom-box {
          background: #fdf8f4; border: 1px solid #eed9cb; border-radius: 8px; padding: 8px 10px;
          margin-top: 4px;
        }
        .mcb-label { font-size: 0.75rem; font-weight: 700; color: #a35518; }
        .mcb-text { font-size: 0.84rem; color: #5a3010; margin: 2px 0 0; font-style: italic; }
        .mcb-none { font-size: 0.74rem; color: var(--text-light); font-style: italic; }

        .modal-totals-box {
          background: var(--ivory); border-radius: 10px; padding: 12px 16px;
          display: flex; flex-direction: column; gap: 6px; font-size: 0.84rem;
        }
        .mt-row { display: flex; justify-content: space-between; color: var(--text-mid); }
        .text-discount { color: #2d5a43; }
        .mt-grand {
          border-top: 1px solid var(--border); padding-top: 8px; margin-top: 4px;
          font-weight: 700; font-size: 0.98rem; color: var(--text-dark);
        }
        .mt-grand-val { font-family: var(--font-serif); font-size: 1.25rem; color: var(--burgundy); }

        .modal-actions-bar {
          display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--border);
          padding-top: 14px;
        }
        .mab-title { font-size: 0.8rem; font-weight: 600; color: var(--text-dark); }
        .mab-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
        .btn-step-action {
          padding: 8px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;
          cursor: pointer; border: 1px solid transparent;
          transition-property: background-color, border-color, color, transform;
          transition-duration: 150ms;
          transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-step-action:active { transform: scale(0.97); }
        .btn-step--producing { background: #fdf5e6; color: #a36518; border-color: #f7e1b5; }
        .btn-step--producing:hover { background: #faeccd; }
        .btn-step--shipped { background: #ede8f7; color: #5b3fa3; border-color: #d6caed; }
        .btn-step--shipped:hover { background: #e0d5f2; }
        .btn-step--delivered { background: #eaf4ed; color: #2d5a43; border-color: #c9decb; }
        .btn-step--delivered:hover { background: #d7edd8; }

        @media (max-width: 900px) {
          .kpi-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .kpi-grid { grid-template-columns: 1fr; }
          .dashboard-toolbar { flex-direction: column; align-items: stretch; }
          .search-form { max-width: 100%; }
          .filter-group { justify-content: space-between; }
        }
      `}</style>
    </div>
  )
}
