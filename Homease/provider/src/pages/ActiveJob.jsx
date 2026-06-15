import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ProviderContext } from '../context/ProviderContext';

const STATUS_FLOW = [
  { id: 'service_requested', label: 'Requested',    color: '#3498db', bg: '#ebf5fb' },
  { id: 'provider_assigned', label: 'Accepted',     color: '#f39c12', bg: '#fef9e7' },
  { id: 'out_for_service',   label: 'On The Way',   color: '#e67e22', bg: '#fef5e7' },
  { id: 'service_started',   label: 'In Progress',  color: '#16a085', bg: '#e8f8f5' },
  { id: 'service_completed', label: 'Completed',    color: '#27ae60', bg: '#eafaf1' },
];

const badge = (status) => {
  const s = STATUS_FLOW.find(x => x.id === status);
  return {
    display: 'inline-block', padding: '5px 14px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
    backgroundColor: s?.bg || '#f4f4f4', color: s?.color || '#555',
    border: `1px solid ${s?.color || '#ccc'}33`,
  };
};

const MiniTracker = ({ currentStatus }) => {
  const idx = STATUS_FLOW.findIndex(s => s.id === currentStatus);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '14px 0', flexWrap: 'wrap' }}>
      {STATUS_FLOW.map((s, i) => {
        const done = i <= idx; const active = i === idx;
        return (
          <React.Fragment key={s.id}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                backgroundColor: done ? s.color : '#e9ecef',
                border: active ? `3px solid ${s.color}` : '3px solid transparent',
                boxShadow: active ? `0 0 0 3px ${s.color}33` : 'none',
              }} />
              <span style={{ fontSize: '9px', fontWeight: '600', color: done ? s.color : '#bbb',
                maxWidth: '52px', textAlign: 'center', lineHeight: '1.2', textTransform: 'uppercase' }}>
                {s.label}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div style={{ flex: 1, height: '3px', minWidth: '8px', marginBottom: '18px',
                backgroundColor: done && i < idx ? s.color : '#e9ecef', borderRadius: '4px' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const ActiveJob = () => {
  const { url, token } = useContext(ProviderContext);
  const [myJobs, setMyJobs]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [otpInputs, setOtpInputs] = useState({}); // per-job OTP input state

  const fetchMyJobs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/provider/my-jobs`,
        { headers: { Authorization: `Bearer ${token}` } });
      setMyJobs(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMyJobs(); }, [token]);

  const setOtp = (jobId, val) =>
    setOtpInputs(prev => ({ ...prev, [jobId]: val }));

  // Mark "on the way"
  const markOutForService = async (orderId) => {
    try {
      await axios.post(`${url}/api/provider/out-for-service/${orderId}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      alert('Status updated! Customer has been notified.');
      fetchMyJobs();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update status.');
    }
  };

  // Verify START OTP from customer → service begins
  const verifyStartOtp = async (orderId) => {
    const otp = otpInputs[orderId] || '';
    if (!otp || otp.length !== 4) { alert('Please enter the 4-digit OTP.'); return; }
    try {
      const res = await axios.post(`${url}/api/provider/verify-start-otp`,
        { orderId: String(orderId), otp },
        { headers: { Authorization: `Bearer ${token}` } });
      alert(res.data.message || 'OTP verified! Service started.');
      setOtp(orderId, '');
      fetchMyJobs();
    } catch (e) {
      alert(e.response?.data?.message || 'Invalid OTP.');
    }
  };

  // Verify END OTP from customer → job done
  const verifyEndOtp = async (orderId) => {
    const otp = otpInputs[orderId] || '';
    if (!otp || otp.length !== 4) { alert('Please enter the 4-digit end OTP.'); return; }
    try {
      const res = await axios.post(`${url}/api/provider/verify-end-otp`,
        { orderId: String(orderId), otp },
        { headers: { Authorization: `Bearer ${token}` } });
      alert(res.data.message || 'Job completed!');
      setOtp(orderId, '');
      fetchMyJobs();
    } catch (e) {
      alert(e.response?.data?.message || 'Invalid OTP.');
    }
  };

  const activeJobs = myJobs.filter(j =>
    !['service_completed', 'cancelled'].includes(j.trackingStatus));

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#666' }}>
      Loading your jobs...
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a237e', marginBottom: '6px' }}>My Active Jobs</h1>
        <p style={{ color: '#666' }}>Manage your ongoing bookings. Both OTPs come from the customer.</p>
      </div>

      {activeJobs.length === 0 ? (
        <div style={emptyState}>
          <div style={{ fontSize: '48px' }}>🏙️</div>
          <h3 style={{ marginTop: '14px', color: '#1a237e' }}>No active jobs</h3>
          <p style={{ color: '#888' }}>Accepted jobs appear here. Check Available Jobs to accept new ones.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {activeJobs.map(job => (
            <div key={job.id} style={card}>
              {/* Card top */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={badge(job.trackingStatus)}>
                    {STATUS_FLOW.find(s => s.id === job.trackingStatus)?.label || job.trackingStatus}
                  </span>
                  <h2 style={{ marginTop: '10px', color: '#1a237e', marginBottom: '2px' }}>
                    Order #{job.orderId}
                  </h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#1a237e' }}>₹{job.amount}</div>
                  <div style={{ fontSize: '13px', color: '#888' }}>{job.serviceDate || 'Date TBD'}</div>
                </div>
              </div>

              <MiniTracker currentStatus={job.trackingStatus} />
              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
                {/* Customer details */}
                <div>
                  <p style={secTitle}>Customer Details</p>
                  <InfoLine label="Name"    value={`${job.firstName||''} ${job.lastName||''}`} />
                  <InfoLine label="Phone"   value={
                    <a href={`tel:${job.phone}`} style={{ color: '#1a237e', textDecoration: 'underline' }}>
                      {job.phone}
                    </a>
                  } />
                  <InfoLine label="Address"
                    value={`${job.street||''}, ${job.city||''}, ${job.state||''} - ${job.pincode||''}`} />
                  {job.email && <InfoLine label="Email" value={job.email} />}
                </div>

                {/* Action panel */}
                <div>
                  <p style={secTitle}>Service Control</p>

                  {/* ACCEPTED → mark on the way */}
                  {job.trackingStatus === 'provider_assigned' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={infoBanner('#fef9e7', '#92400e')}>
                        📋 Job accepted! Head to the customer location when ready.
                      </div>
                      <button onClick={() => markOutForService(job.id)} style={outBtn}>
                        🚗 Mark: I'm On My Way
                      </button>
                    </div>
                  )}

                  {/* ON THE WAY → enter START OTP */}
                  {job.trackingStatus === 'out_for_service' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={infoBanner('#fef5e7', '#c2410c')}>
                        🚗 You're on the way. Once you arrive, ask the customer for their
                        <strong> Start OTP</strong> (visible in their My Orders).
                      </div>
                      <OtpBox
                        label="Enter Customer's START OTP"
                        value={otpInputs[job.id] || ''}
                        onChange={v => setOtp(job.id, v)}
                        onSubmit={() => verifyStartOtp(job.id)}
                        btnLabel="Verify & Start Service"
                        btnColor="#1a237e"
                      />
                    </div>
                  )}

                  {/* IN PROGRESS → enter END OTP after work done */}
                  {job.trackingStatus === 'service_started' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={infoBanner('#e8f8f5', '#166534')}>
                        🛠️ Service in progress. Once you finish the work, ask the customer
                        for their <strong>End OTP</strong> (visible in their My Orders after service starts).
                      </div>
                      <OtpBox
                        label="Enter Customer's END OTP to complete"
                        value={otpInputs[job.id] || ''}
                        onChange={v => setOtp(job.id, v)}
                        onSubmit={() => verifyEndOtp(job.id)}
                        btnLabel="✔ Complete Job"
                        btnColor="#15803d"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const OtpBox = ({ label, value, onChange, onSubmit, btnLabel, btnColor }) => (
  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px',
    border: '1px dashed #cbd5e1' }}>
    <p style={{ fontSize: '13px', color: '#555', marginBottom: '10px' }}>{label}:</p>
    <div style={{ display: 'flex', gap: '10px' }}>
      <input
        type="text" placeholder="4-digit OTP" maxLength="4"
        value={value} onChange={e => onChange(e.target.value)}
        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
          fontSize: '20px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '6px' }}
      />
      <button onClick={onSubmit}
        style={{ padding: '12px 20px', backgroundColor: btnColor, color: '#fff',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
          whiteSpace: 'nowrap', fontSize: '13px' }}>
        {btnLabel}
      </button>
    </div>
  </div>
);

const InfoLine = ({ label, value }) => (
  <div style={{ display: 'flex', marginBottom: '8px', fontSize: '14px' }}>
    <span style={{ width: '75px', color: '#6b7280', fontWeight: '500', flexShrink: 0 }}>{label}:</span>
    <span style={{ flex: 1, color: '#111827', fontWeight: '600' }}>{value}</span>
  </div>
);

const infoBanner = (bg, color) => ({
  padding: '12px 14px', borderRadius: '10px',
  backgroundColor: bg, color, fontSize: '13px', lineHeight: '1.5',
});

// ── Styles ────────────────────────────────────────────────────────────────────
const card = {
  padding: '26px', backgroundColor: '#fff', borderRadius: '18px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
};
const secTitle = {
  fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase',
  letterSpacing: '1px', marginBottom: '12px', fontWeight: '700',
};
const outBtn = {
  padding: '12px', backgroundColor: '#f1f5f9', color: '#475569',
  border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
  fontWeight: '600', fontSize: '14px',
};
const emptyState = {
  textAlign: 'center', padding: '80px 20px', backgroundColor: '#fff',
  borderRadius: '18px', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', marginTop: '20px',
};

export default ActiveJob;