import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ProviderContext } from '../context/ProviderContext';

const Dashboard = () => {
    const { url, token, providerData, setProviderData } = useContext(ProviderContext);
    const [stats, setStats] = useState({ totalEarnings: 0, completedJobs: 0 });

    const fetchStats = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${url}/api/provider/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats", error);
        }
    };

    const toggleOnline = async () => {
        try {
            const response = await axios.post(`${url}/api/provider/toggle-online`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // The response.data might be the whole provider object or just the status
            // My previous implementation returned providerService.toggleOnline which returns Provider
            setProviderData(response.data);
        } catch (error) {
            alert("Failed to toggle status");
        }
    };

    useEffect(() => {
        fetchStats();
    }, [token]);

    return (
        <div style={{ animation: 'fadeIn 0.5s' }}>
            <div style={header}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ color: '#1a237e' }}>Partner Dashboard</h1>
                    <p style={{ color: '#666' }}>Track your daily earnings and professional growth.</p>
                </div>
                <div style={statusToggleCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={providerData?.isOnline ? onlinePulse : offlinePulse}></div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>Current Status</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: providerData?.isOnline ? '#4CAF50' : '#f44336' }}>
                                {providerData?.isOnline ? 'Online & Visible' : 'Offline'}
                            </div>
                        </div>
                    </div>
                    <button onClick={toggleOnline} style={providerData?.isOnline ? offlineBtn : onlineBtn}>
                        Go {providerData?.isOnline ? 'Offline' : 'Online'}
                    </button>
                </div>
            </div>

            <div style={statsGrid}>
                <div style={statCard}>
                    <div style={statIcon}>💰</div>
                    <div>
                        <p style={statLabel}>Total Earnings</p>
                        <h2 style={statValue}>₹{stats.totalEarnings?.toLocaleString()}</h2>
                    </div>
                </div>
                <div style={statCard}>
                    <div style={statIcon}>✅</div>
                    <div>
                        <p style={statLabel}>Jobs Completed</p>
                        <h2 style={statValue}>{stats.completedJobs}</h2>
                    </div>
                </div>
                <div style={statCard}>
                    <div style={statIcon}>⭐</div>
                    <div>
                        <p style={statLabel}>Average Rating</p>
                        <h2 style={statValue}>{providerData?.rating?.toFixed(1) || "0.0"}</h2>
                    </div>
                </div>
            </div>

            <div style={promoBanner}>
                <div style={bannerText}>
                    <h2>Ready for more?</h2>
                    <p>Providers who maintain a 4.5+ rating receive 30% more job requests. Stay online to get matched with customers near you.</p>
                    <button style={bannerBtn} onClick={() => window.location.href = '/'}>Browse Job Requests</button>
                </div>
                <div style={bannerImg}></div>
            </div>
        </div>
    );
};

const header = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    gap: '20px'
};

const statusToggleCard = {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    padding: '20px 25px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    border: '1px solid #eee'
};

const statsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
};

const statCard = {
    padding: '30px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
    borderBottom: '4px solid transparent',
    transition: 'all 0.3s'
};

const statIcon = {
    fontSize: '40px',
    width: '70px',
    height: '70px',
    backgroundColor: '#f8fafc',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const statLabel = {
    fontSize: '14px',
    color: '#666',
    fontWeight: '600',
};

const statValue = {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1a237e',
    margin: 0
};

const onlinePulse = {
    width: '12px',
    height: '12px',
    backgroundColor: '#4CAF50',
    borderRadius: '50%',
    boxShadow: '0 0 0 rgba(76, 175, 80, 0.4)',
    animation: 'pulse-green 2s infinite'
};

const offlinePulse = {
    width: '12px',
    height: '12px',
    backgroundColor: '#f44336',
    borderRadius: '50%'
};

const onlineBtn = {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold'
};

const offlineBtn = {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold'
};

const promoBanner = {
    display: 'flex',
    backgroundColor: '#1a237e',
    borderRadius: '20px',
    overflow: 'hidden',
    color: 'white',
    minHeight: '250px'
};

const bannerText = {
    flex: 1.5,
    padding: '50px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '15px'
};

const bannerBtn = {
    alignSelf: 'flex-start',
    padding: '12px 25px',
    backgroundColor: '#f97316',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    marginTop: '10px'
};

const bannerImg = {
    flex: 1,
    background: 'url("https://media.istockphoto.com/id/1147066751/photo/repairman-fixing-air-conditioner-unit.jpg?s=612x612&w=0&k=20&c=6_n-u5h_4tF2Q6X2Fj0Q0Zp6Yv6F0f1fG7j1G7j1G7j=") center/cover no-repeat',
};

export default Dashboard;
