import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Components/context/storeContext';
import './MyOrders.css';
import { motion } from 'framer-motion';
import {
  FaSearch, FaCheck, FaPrint, FaEye, FaTruck, FaTools,
  FaCheckCircle, FaUserTie, FaStar, FaRegStar, FaShoppingBag
} from 'react-icons/fa';
import { BsClockHistory, BsCheck2Circle, BsXCircle } from 'react-icons/bs';
import { MdCancel, MdBuild } from 'react-icons/md';
import { Container, Row, Col, Button, Spinner, Form, Modal, Badge } from 'react-bootstrap';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_FLOW = [
  { id: 'service_requested', label: 'Requested',   icon: <BsClockHistory />, color: '#3498db', bg: '#ebf5fb' },
  { id: 'provider_assigned', label: 'Pro Assigned',icon: <FaUserTie />,      color: '#f39c12', bg: '#fef9e7' },
  { id: 'out_for_service',   label: 'On The Way',  icon: <FaTruck />,        color: '#e67e22', bg: '#fef5e7' },
  { id: 'service_started',   label: 'In Progress', icon: <MdBuild />,        color: '#16a085', bg: '#e8f8f5' },
  { id: 'service_completed', label: 'Completed',   icon: <FaCheckCircle />,  color: '#27ae60', bg: '#eafaf1' },
];

const getStatusCfg = (id) =>
  STATUS_FLOW.find(s => s.id === id) || { label: id, color: '#666', bg: '#f4f4f4', icon: null };

const formatDate = (ds, withTime = false) => {
  if (!ds) return 'N/A';
  const d = new Date(ds);
  const opts = { year: 'numeric', month: 'short', day: 'numeric' };
  if (withTime) { opts.hour = '2-digit'; opts.minute = '2-digit'; }
  return d.toLocaleDateString('en-IN', opts);
};

// Parse the JSON tracking history string stored in backend
const parseHistory = (raw) => {
  if (!raw || raw === '[]') return [];
  try { return JSON.parse(raw); }
  catch { return []; }
};

// ── Service Tracker component ─────────────────────────────────────────────────
const ServiceTracker = ({ status }) => {
  if (!status) return null;
  if (status === 'cancelled') return (
    <div className="tracker-cancelled">
      <MdCancel /> <span>Order Cancelled</span>
    </div>
  );
  const currentIdx = STATUS_FLOW.findIndex(s => s.id === status);
  return (
    <div className="service-tracker">
      {STATUS_FLOW.map((s, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={s.id}>
            <div className={`tracker-step ${done ? 'step-done' : ''} ${active ? 'step-active' : ''}`}>
              <div className="step-icon" style={done ? { backgroundColor: s.color, color: '#fff' } : {}}>
                {s.icon}
              </div>
              <div className="step-label" style={done ? { color: s.color } : {}}>{s.label}</div>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className="tracker-line"
                style={done && i < currentIdx ? { backgroundColor: s.color } : {}} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Star Rating component ─────────────────────────────────────────────────────
const StarRating = ({ value, onChange }) => (
  <div className="star-rating">
    {[1,2,3,4,5].map(star => (
      <span key={star} onClick={() => onChange(star)} className="star-btn">
        {star <= value ? <FaStar color="#f59e0b" size={28} /> : <FaRegStar color="#d1d5db" size={28} />}
      </span>
    ))}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const MyOrders = () => {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userEmail, setUserEmail]       = useState('');
  const [emailInput, setEmailInput]     = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab]       = useState('all');
  // Rating state
  const [ratingValue, setRatingValue]   = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const { token } = useContext(StoreContext);
  const navigate  = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('userEmail');
    if (stored) { setUserEmail(stored); fetchOrders(stored); }
    else setLoading(false);
  }, [token]);

  const fetchOrders = async (email) => {
    try {
      setLoading(true); setError(null);
      const res = await axios.get(`${API_BASE_URL}/orders/user/${email}`);
      setOrders(res.data);
    } catch { setError('Failed to load orders. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setLoadingEmail(true);
    localStorage.setItem('userEmail', emailInput);
    setUserEmail(emailInput);
    fetchOrders(emailInput).finally(() => setLoadingEmail(false));
  };

  const openDetails = async (order) => {
    setShowModal(true);
    setDetailLoading(true);
    setRatingValue(0);
    setRatingComment('');
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/${order.id || order._id}`);
      setSelectedOrder(res.data || order);
    } catch { setSelectedOrder(order); }
    finally { setDetailLoading(false); }
  };

  const submitRating = async () => {
    if (!ratingValue) { alert('Please select a star rating.'); return; }
    setSubmittingRating(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/orders/${selectedOrder.id}/rate`,
        { email: userEmail, rating: ratingValue, comment: ratingComment }
      );
      alert('Thank you for your rating!');
      setSelectedOrder(res.data.order);
      fetchOrders(userEmail);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to submit rating.');
    } finally { setSubmittingRating(false); }
  };

  const getFiltered = () => {
    if (!Array.isArray(orders)) return [];
    const active = ['service_requested','provider_assigned','out_for_service','service_started'];
    if (activeTab === 'active')    return orders.filter(o => active.includes(o.trackingStatus));
    if (activeTab === 'completed') return orders.filter(o => o.trackingStatus === 'service_completed');
    if (activeTab === 'cancelled') return orders.filter(o => o.trackingStatus === 'cancelled');
    return orders;
  };

  const printReceipt = () => {
    if (!selectedOrder) return;
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt #${selectedOrder.orderId}</title>
      <style>body{font-family:Arial,sans-serif;padding:24px;color:#333}
      .logo{font-size:22px;font-weight:bold;color:#6c63ff;margin-bottom:8px}
      .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f5f5f5}
      .total{font-weight:bold}</style></head><body>
      <div class="logo">Homease</div>
      <h2>Order #${selectedOrder.orderId} <small style="font-size:14px;color:#888">
        ${formatDate(selectedOrder.createdAt, true)}</small></h2>
      <h3>Customer</h3>
      <div class="row"><span>Name</span><span>${selectedOrder.firstName||''} ${selectedOrder.lastName||''}</span></div>
      <div class="row"><span>Email</span><span>${selectedOrder.email||''}</span></div>
      <div class="row"><span>Phone</span><span>${selectedOrder.phone||''}</span></div>
      <h3>Service</h3>
      <div class="row"><span>Status</span><span>${(selectedOrder.trackingStatus||'').replace(/_/g,' ').toUpperCase()}</span></div>
      <div class="row"><span>Service Date</span><span>${selectedOrder.serviceDate||'N/A'}</span></div>
      <h3>Payment</h3>
      <div class="row"><span>Method</span><span>Razorpay</span></div>
      <div class="row"><span>Payment ID</span><span>${selectedOrder.paymentId||'N/A'}</span></div>
      <div class="row total"><span>Total</span><span>₹${selectedOrder.amount||0}</span></div>
      <p style="margin-top:30px;color:#888;font-size:12px">Thank you for choosing Homease!</p>
      <script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  };

  // ── Loading ──
  if (loading) return (
    <Container className="py-5">
      <div className="loading-spinner">
        <Spinner animation="border" style={{ color: '#6c63ff' }} />
        <p className="mt-3 text-muted">Loading your orders…</p>
      </div>
    </Container>
  );

  return (
    <div>
      <Container className="my-5">

        {/* Email form */}
        {!userEmail && (
          <motion.div className="email-form-card" initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }}>
            <h3 className="mb-2">Track Your Service Bookings</h3>
            <p className="text-muted mb-4">Enter your email to view all your orders.</p>
            <Form onSubmit={handleEmailSubmit}>
              <Form.Group className="mb-3">
                <Form.Control type="email" placeholder="Enter booking email"
                  value={emailInput} onChange={e => setEmailInput(e.target.value)} required />
              </Form.Group>
              <Button type="submit" className="submit-btn" disabled={loadingEmail}>
                {loadingEmail
                  ? <><Spinner as="span" animation="border" size="sm" className="me-2"/>Searching…</>
                  : <><FaSearch className="me-2"/>Find My Orders</>}
              </Button>
            </Form>
          </motion.div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Orders */}
        {userEmail && orders?.length > 0 && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h3 className="mb-0">My Service Bookings</h3>
              <div className="tab-pills">
                {['all','active','completed','cancelled'].map(tab => (
                  <button key={tab}
                    className={`tab-pill ${activeTab===tab?'tab-pill-active':''}`}
                    onClick={() => setActiveTab(tab)}>
                    {tab.charAt(0).toUpperCase()+tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {getFiltered().map(order => (
              <motion.div key={order.id||order.orderId}
                className="order-card" whileHover={{ y:-4 }}>
                <div className="order-card-header">
                  <div>
                    <div className="order-card-id">Order #{order.orderId}</div>
                    <div className="order-card-date">Booked on {formatDate(order.createdAt)}</div>
                    {order.serviceDate && (
                      <div className="order-card-service-date">📅 Service: {formatDate(order.serviceDate)}</div>
                    )}
                  </div>
                  <span className="status-badge"
                    style={{ backgroundColor: getStatusCfg(order.trackingStatus).bg,
                      color: getStatusCfg(order.trackingStatus).color }}>
                    {getStatusCfg(order.trackingStatus).label}
                  </span>
                </div>

                <div className="order-card-body">
                  <ServiceTracker status={order.trackingStatus} />

                  {/* START OTP — shown when waiting for / found provider */}
                  {['provider_assigned','out_for_service'].includes(order.trackingStatus)
                    && order.otpServiceStart && (
                    <div className="otp-banner otp-start">
                      <div>
                        <strong>🔐 Start OTP</strong>
                        <p>Share this with your provider when they arrive to begin the service.</p>
                      </div>
                      <span className="otp-code">{order.otpServiceStart}</span>
                    </div>
                  )}

                  {/* END OTP — shown once service has started */}
                  {order.trackingStatus === 'service_started' && order.otpServiceEnd && (
                    <div className="otp-banner otp-end">
                      <div>
                        <strong>✅ End OTP</strong>
                        <p>Share this with your provider <strong>only after</strong> the work is fully complete.</p>
                      </div>
                      <span className="otp-code">{order.otpServiceEnd}</span>
                    </div>
                  )}

                  <div className="order-card-footer">
                    <div className="order-card-amount">₹{order.amount || 0}</div>
                    <button className="view-details-btn" onClick={() => openDetails(order)}>
                      <FaEye className="me-2"/>View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {userEmail && (!orders || orders.length === 0) && !loading && <NoOrders />}

        {/* Detail Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" className="order-details-modal">
          <Modal.Header closeButton>
            <Modal.Title>
              <div className="order-card-id">Order #{selectedOrder?.orderId}</div>
              <div className="order-card-date">{formatDate(selectedOrder?.createdAt, true)}</div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {detailLoading ? (
              <div className="text-center p-5"><Spinner animation="border"/><p className="mt-3">Loading…</p></div>
            ) : selectedOrder && (
              <>
                {/* Tracker */}
                <div className="modal-section">
                  <h5 className="modal-sec-title">📍 Service Status</h5>
                  <ServiceTracker status={selectedOrder.trackingStatus} />

                  {/* Start OTP in modal */}
                  {['provider_assigned','out_for_service'].includes(selectedOrder.trackingStatus)
                    && selectedOrder.otpServiceStart && (
                    <div className="otp-banner otp-start mt-3">
                      <div>
                        <strong>🔐 Start OTP</strong>
                        <p>Share with provider on arrival to begin service.</p>
                      </div>
                      <span className="otp-code">{selectedOrder.otpServiceStart}</span>
                    </div>
                  )}

                  {/* End OTP in modal */}
                  {selectedOrder.trackingStatus === 'service_started'
                    && selectedOrder.otpServiceEnd && (
                    <div className="otp-banner otp-end mt-3">
                      <div>
                        <strong>✅ End OTP</strong>
                        <p>Share with provider only after all work is done.</p>
                      </div>
                      <span className="otp-code">{selectedOrder.otpServiceEnd}</span>
                    </div>
                  )}
                </div>

                {/* Provider info */}
                {selectedOrder.provider && (
                  <div className="modal-section provider-modal-section">
                    <h5 className="modal-sec-title"><FaUserTie className="me-2"/>Your Provider</h5>
                    <div className="info-grid">
                      <InfoRow label="Name"     value={selectedOrder.provider.name} />
                      <InfoRow label="Category" value={selectedOrder.provider.category} />
                      {selectedOrder.provider.phone && (
                        <InfoRow label="Phone" value={
                          <a href={`tel:${selectedOrder.provider.phone}`}>
                            {selectedOrder.provider.phone}
                          </a>
                        } />
                      )}
                      {selectedOrder.provider.rating > 0 && (
                        <InfoRow label="Rating" value={`⭐ ${selectedOrder.provider.rating}`} />
                      )}
                    </div>
                  </div>
                )}

                {/* Customer info */}
                <div className="modal-section">
                  <h5 className="modal-sec-title">👤 Customer Information</h5>
                  <div className="info-grid">
                    <InfoRow label="Name"    value={`${selectedOrder.firstName||''} ${selectedOrder.lastName||''}`} />
                    <InfoRow label="Email"   value={selectedOrder.email} />
                    <InfoRow label="Phone"   value={selectedOrder.phone} />
                    <InfoRow label="Address" value={[selectedOrder.street, selectedOrder.city,
                      selectedOrder.state, selectedOrder.pincode].filter(Boolean).join(', ')} />
                    {selectedOrder.serviceDate && (
                      <InfoRow label="Service Date" value={formatDate(selectedOrder.serviceDate)} />
                    )}
                  </div>
                </div>

                {/* Tracking history */}
                {parseHistory(selectedOrder.trackingHistory).length > 0 && (
                  <div className="modal-section">
                    <h5 className="modal-sec-title">📋 Service History</h5>
                    <div className="tracking-history">
                      {parseHistory(selectedOrder.trackingHistory).map((h, i) => {
                        const cfg = getStatusCfg(h.status);
                        return (
                          <div key={i} className="history-item">
                            <div className="history-dot" style={{ backgroundColor: cfg.color }} />
                            <div className="history-content">
                              <div className="history-status">{cfg.label || h.status}</div>
                              <div className="history-date">{h.timestamp}</div>
                              {h.notes && <div className="history-note">{h.notes}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Payment */}
                <div className="modal-section">
                  <h5 className="modal-sec-title">💳 Payment</h5>
                  <div className="info-grid">
                    <InfoRow label="Method" value="Razorpay" />
                    {selectedOrder.paymentId && (
                      <InfoRow label="Payment ID" value={selectedOrder.paymentId} mono />
                    )}
                    <InfoRow label="Status" value={<Badge bg="success">PAID</Badge>} />
                    <InfoRow label="Total"  value={`₹${selectedOrder.amount || 0}`} />
                  </div>
                </div>

                {/* ── Rating section (only after completed, not yet rated) ── */}
                {selectedOrder.trackingStatus === 'service_completed'
                  && !selectedOrder.ratingSubmitted && (
                  <div className="modal-section rating-section">
                    <h5 className="modal-sec-title">⭐ Rate Your Provider</h5>
                    <p className="rating-subtitle">
                      How was the service by <strong>{selectedOrder.provider?.name || 'your provider'}</strong>?
                    </p>
                    <StarRating value={ratingValue} onChange={setRatingValue} />
                    <textarea
                      className="rating-comment"
                      placeholder="Leave a comment (optional)…"
                      value={ratingComment}
                      onChange={e => setRatingComment(e.target.value)}
                      rows={3}
                    />
                    <Button className="submit-rating-btn" onClick={submitRating}
                      disabled={submittingRating || ratingValue === 0}>
                      {submittingRating ? 'Submitting…' : '⭐ Submit Rating'}
                    </Button>
                  </div>
                )}

                {/* Already rated */}
                {selectedOrder.ratingSubmitted && (
                  <div className="modal-section already-rated">
                    <FaStar color="#f59e0b" /> You rated this service{' '}
                    <strong>{selectedOrder.providerRating} / 5</strong>
                    {selectedOrder.ratingComment && (
                      <p className="mt-1 mb-0 text-muted">"{selectedOrder.ratingComment}"</p>
                    )}
                  </div>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
            {!detailLoading && (
              <Button variant="primary" onClick={printReceipt}>
                <FaPrint className="me-2"/>Print Receipt
              </Button>
            )}
          </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
};

const InfoRow = ({ label, value, mono }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className={`info-value${mono?' mono':''}`}>{value || 'N/A'}</span>
  </div>
);

const NoOrders = () => {
  const navigate = useNavigate();
  return (
    <motion.div className="no-orders" initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }}>
      <div className="no-orders-icon-wrap">
        <div className="icon-circle"><FaTools /></div>
      </div>
      <h3>No Bookings Yet</h3>
      <p>You haven't booked any services. Browse our services and place your first booking!</p>
      <Button className="shop-now-btn" onClick={() => navigate('/')}>
        Browse Services <FaShoppingBag className="ms-2"/>
      </Button>
    </motion.div>
  );
};

export default MyOrders;