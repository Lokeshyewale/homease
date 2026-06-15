import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ProviderContext } from '../context/ProviderContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { url, token, providerData } = useContext(ProviderContext);
    const [availableJobs, setAvailableJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAvailableJobs = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await axios.get(`${url}/api/provider/available-jobs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableJobs(response.data);
        } catch (error) {
            console.error("Error fetching jobs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailableJobs();
    }, [token]);

    const acceptJob = async (orderId) => {
        try {
            const response = await axios.post(`${url}/api/provider/accept-order/${orderId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                alert("Job accepted! You can now view it in Active Jobs.");
                navigate('/active-job');
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to accept job");
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s' }}>
            <div style={headerSection}>
                <h1>New Job Requests</h1>
                <p>Welcome back! Here are the available jobs for <strong>{providerData?.category}</strong> in your region.</p>
            </div>

            {loading ? (
                <div style={loaderStyle}>Loading jobs...</div>
            ) : availableJobs.length === 0 ? (
                <div style={emptyState}>
                    <div style={{ fontSize: '50px' }}>📦</div>
                    <h3>No new jobs yet</h3>
                    <p>We'll notify you when a customer requests a {providerData?.category} service.</p>
                </div>
            ) : (
                <div style={gridContainer}>
                    {availableJobs.map((job) => (
                        <div key={job.id} style={cardStyle}>
                            <div style={cardBadge}>{providerData?.category}</div>
                            <div style={{ marginTop: '15px' }}>
                                <h3 style={{ fontSize: '20px', color: '#1a237e' }}>Order #{job.orderId}</h3>
                                <div style={infoRow}>
                                    <span style={iconSpan}>📍</span>
                                    <span>{job.city} - {job.pincode}</span>
                                </div>
                                <div style={infoRow}>
                                    <span style={iconSpan}>📅</span>
                                    <span>Requested for: <strong>{job.serviceDate}</strong></span>
                                </div>
                                <div style={priceTag}>
                                    <span style={{ fontSize: '14px', color: '#666' }}>Earning: </span>
                                    <span style={{ fontSize: '22px', fontWeight: '700', color: '#1a237e' }}>₹{job.amount}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => acceptJob(job.id)}
                                style={buttonStyle}
                            >
                                Accept Job
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const headerSection = {
    marginBottom: '40px',
    borderBottom: '2px solid #eee',
    paddingBottom: '15px'
};

const loaderStyle = {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#666'
};

const emptyState = {
    textAlign: 'center',
    padding: '100px 20px',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    marginTop: '20px'
};

const gridContainer = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px'
};

const cardStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '24px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
};

const cardBadge = {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#eff6ff',
    color: '#1a237e',
    padding: '5px 15px',
    fontSize: '12px',
    fontWeight: 'bold',
    borderBottomLeftRadius: '16px'
};

const infoRow = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '12px 0',
    color: '#4b5563',
    fontSize: '15px'
};

const iconSpan = {
    fontSize: '18px'
};

const priceTag = {
    marginTop: '20px',
    padding: '10px 15px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const buttonStyle = {
    width: '100%',
    padding: '12px',
    marginTop: '20px',
    backgroundColor: '#1a237e',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '15px',
    transition: 'background 0.3s'
};

export default Home;
