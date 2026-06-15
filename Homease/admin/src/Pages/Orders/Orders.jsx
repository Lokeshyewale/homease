import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Orders.css';

const STATUS_FLOW = [
  { id: 'service_requested', label: 'Requested',   color: '#3498db', bg: '#ebf5fb' },
  { id: 'provider_assigned', label: 'Assigned',    color: '#f39c12', bg: '#fef9e7' },
  { id: 'out_for_service',   label: 'On The Way',  color: '#e67e22', bg: '#fef5e7' },
  { id: 'service_started',   label: 'In Progress', color: '#16a085', bg: '#e8f8f5' },
  { id: 'service_completed', label: 'Completed',   color: '#27ae60', bg: '#eafaf1' },
  { id: 'cancelled',         label: 'Cancelled',   color: '#e74c3c', bg: '#fdedec' },
];

const getCfg = (id) =>
  STATUS_FLOW.find(s => s.id === id) || { label: id||'Unknown', color: '#666', bg: '#f4f4f4' };

const fmt = (ds) => {
  if (!ds) return 'N/A';
  return new Date(ds).toLocaleDateString('en-IN',
    { year: 'numeric', month: 'short', day: 'numeric' });
};

const parseHistory = (raw) => {
  try { return JSON.parse(raw || '[]'); } catch { return []; }
};

const Orders = ({ url }) => {
  const [orders, setOrders]           = useState([]);
  const [selected, setSelected]       = useState(null);
  const [filter, setFilter]           = useState('all');
  const [cancelNote, setCancelNote]   = useState('');
  const [cancelling, setCancelling]   = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${url}/api/orders`);
      setOrders(res.data);
    } catch (e) { console.error('Error fetching orders:', e); }
  };

  // Admin's ONLY action: cancel an unstarted order
  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await axios.put(`${url}/api/orders/${orderId}/cancel`,
        { notes: cancelNote || 'Cancelled by admin.' });
      alert('Order cancelled.');
      setCancelNote('');
      fetchOrders();
      setSelected(prev => prev ? { ...prev, trackingStatus: 'cancelled' } : null);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to cancel order.');
    } finally { setCancelling(false); }
  };

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.trackingStatus === filter);

  return (
    <div className="orders">
      {/* Header */}
      <div className="orders-page-header">
        <div>
          <h2>Service Orders</h2>
          <p>View all bookings. Providers manage status. You can cancel unstarted orders.</p>
        </div>
        <div className="admin-role-badge">
          🛡️ <span>Admin — View &amp; Cancel Only</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="orders-filter-tabs">
        <button className={`filter-tab ${filter==='all'?'active':''}`}
          onClick={() => setFilter('all')}>All ({orders.length})</button>
        {STATUS_FLOW.map(s => {
          const count = orders.filter(o => o.trackingStatus === s.id).length;
          if (!count) return null;
          return (
            <button key={s.id}
              className={`filter-tab ${filter===s.id?'tab-active':''}`}
              style={filter===s.id
                ? { backgroundColor: s.color, borderColor: s.color, color: '#fff' }
                : { borderColor: s.color, color: s.color }}
              onClick={() => setFilter(s.id)}>
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="no-orders-msg">No orders found.</div>
      ) : (
        <div className="orders-table-wrap">
          <table>
            <thead><tr>
              <th>Status</th><th>Order #</th><th>Service Date</th>
              <th>Services</th><th>Customer</th><th>Phone</th>
              <th>Provider</th><th>Rating</th><th>Amount</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(order => {
                const cfg = getCfg(order.trackingStatus);
                return (
                  <tr key={order.id}
                    className={order.trackingStatus==='service_requested'?'needs-action-row':''}>
                    <td>
                      <span className="status-pill"
                        style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color+'44' }}>
                        {order.trackingStatus === 'service_requested' && (
                          <span className="pulse-dot"/>
                        )}
                        {cfg.label}
                      </span>
                    </td>
                    <td className="id-cell">#{order.orderId}</td>
                    <td>{order.serviceDate || '—'}</td>
                    <td>{(order.orderItems||[]).map(i=>i.name||i.serviceId).join(', ')||'—'}</td>
                    <td>{`${order.firstName||''} ${order.lastName||''}`}</td>
                    <td>{order.phone||'—'}</td>
                    <td>
                      {order.provider
                        ? <span className="provider-pill">✓ {order.provider.name}</span>
                        : <span className="no-provider">Unassigned</span>}
                    </td>
                    <td>
                      {order.ratingSubmitted
                        ? <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                            ⭐ {order.providerRating}/5
                          </span>
                        : <span style={{ color: '#ccc', fontSize: '12px' }}>Not rated</span>}
                    </td>
                    <td><strong>₹{order.amount||0}</strong></td>
                    <td>
                      <button className="view-btn" onClick={() => { setSelected(order); setCancelNote(''); }}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelected(null)}>&times;</button>

            <div className="modal-top">
              <div>
                <h2>Order #{selected.orderId}</h2>
                <span className="placed-date">Placed: {fmt(selected.createdAt)}</span>
              </div>
              <span className="status-pill large"
                style={{ background: getCfg(selected.trackingStatus).bg,
                  color: getCfg(selected.trackingStatus).color }}>
                {getCfg(selected.trackingStatus).label}
              </span>
            </div>

            {/* Progress bar (read-only) */}
            <div className="progress-section">
              <p className="progress-label">Service Progress</p>
              <div className="progress-track">
                {STATUS_FLOW.filter(s=>s.id!=='cancelled').map((s, i, arr) => {
                  const curIdx = arr.findIndex(x => x.id === selected.trackingStatus);
                  const done = i <= curIdx; const active = i === curIdx;
                  return (
                    <React.Fragment key={s.id}>
                      <div className="p-step">
                        <div className="p-dot"
                          style={done ? { background: s.color,
                            boxShadow: active ? `0 0 0 4px ${s.color}33` : 'none' } : {}} />
                        <span className="p-label" style={done ? { color: s.color } : {}}>
                          {s.label}
                        </span>
                      </div>
                      {i < arr.length-1 && (
                        <div className="p-line"
                          style={done && i < curIdx ? { background: s.color } : {}} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <p className="progress-note">
                ℹ️ All status changes after order placement are managed by the assigned provider.
              </p>
            </div>

            {/* Info grid */}
            <div className="info-grid">
              <div className="info-card">
                <h3>Order Info</h3>
                <p><b>Order Date:</b> {fmt(selected.createdAt)}</p>
                <p><b>Service Date:</b> {selected.serviceDate||'N/A'}</p>
                <p><b>Amount:</b> ₹{selected.amount}</p>
                {selected.paymentId && <p><b>Payment ID:</b> <code>{selected.paymentId}</code></p>}
                {selected.ratingSubmitted && (
                  <p><b>Rating:</b> ⭐ {selected.providerRating}/5
                    {selected.ratingComment && ` — "${selected.ratingComment}"`}
                  </p>
                )}
              </div>
              <div className="info-card">
                <h3>Customer</h3>
                <p><b>Name:</b> {selected.firstName} {selected.lastName}</p>
                <p><b>Email:</b> {selected.email}</p>
                <p><b>Phone:</b> {selected.phone}</p>
                <p><b>Address:</b> {[selected.street,selected.city,
                  selected.state,selected.pincode].filter(Boolean).join(', ')}</p>
              </div>
            </div>

            {/* Services */}
            <div className="detail-section">
              <h3>Services</h3>
              <ul className="svc-list">
                {(selected.orderItems||[]).length > 0
                  ? (selected.orderItems).map((it,i) => <li key={i}>{it.name||it.serviceId}</li>)
                  : <li>No services found</li>}
              </ul>
            </div>

            {/* Provider */}
            {selected.provider && (
              <div className="detail-section provider-detail">
                <h3>👤 Assigned Provider</h3>
                <p><b>Name:</b> {selected.provider.name}</p>
                <p><b>Category:</b> {selected.provider.category}</p>
                {selected.provider.phone && <p><b>Phone:</b> {selected.provider.phone}</p>}
                {selected.provider.rating > 0 && (
                  <p><b>Rating:</b> ⭐ {selected.provider.rating}</p>
                )}
              </div>
            )}

            {/* Tracking history */}
            {parseHistory(selected.trackingHistory).length > 0 && (
              <div className="detail-section">
                <h3>Service History</h3>
                <div className="timeline">
                  {parseHistory(selected.trackingHistory).map((h,i) => {
                    const cfg = getCfg(h.status);
                    return (
                      <div key={i} className="tl-item">
                        <div className="tl-dot" style={{ background: cfg.color }} />
                        <div className="tl-body">
                          <div className="tl-date">{h.timestamp}</div>
                          <div className="tl-status" style={{ color: cfg.color }}>{cfg.label}</div>
                          {h.notes && <div className="tl-notes">{h.notes}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Admin cancel — only if not started/completed */}
            {!['service_started','service_completed','cancelled']
              .includes(selected.trackingStatus) && (
              <div className="cancel-section">
                <h3>⚠️ Cancel Order</h3>
                <p>You can cancel this order since it hasn't started yet.
                   The provider will be notified.</p>
                <textarea
                  placeholder="Reason for cancellation (optional)"
                  value={cancelNote}
                  onChange={e => setCancelNote(e.target.value)}
                  rows={2}
                  className="cancel-note"
                />
                <button
                  className="cancel-btn"
                  disabled={cancelling}
                  onClick={() => cancelOrder(selected.id)}>
                  {cancelling ? 'Cancelling…' : '✕ Cancel This Order'}
                </button>
              </div>
            )}

            {selected.trackingStatus === 'cancelled' && (
              <div className="cancelled-note">✕ This order has been cancelled.</div>
            )}
            {selected.trackingStatus === 'service_completed' && (
              <div className="completed-note">
                ✅ Service completed.
                {selected.ratingSubmitted
                  ? ` Customer rated: ⭐ ${selected.providerRating}/5`
                  : ' Awaiting customer rating.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;