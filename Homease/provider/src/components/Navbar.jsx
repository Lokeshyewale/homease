import React, { useContext } from 'react';
import { ProviderContext } from '../context/ProviderContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { providerData, setToken } = useContext(ProviderContext);
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('providerToken');
        setToken('');
        navigate('/login');
    };

    return (
        <div className="navbar" style={navStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 onClick={() => navigate('/')} style={logoStyle}>Homease <span style={{ color: '#f97316' }}>Provider</span></h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                {providerData && (
                    <div style={profileBrief}>
                        <div style={statusDot}></div>
                        <span style={{ fontWeight: '500', fontSize: '15px' }}>{providerData.name} ({providerData.category})</span>
                    </div>
                )}
                <button
                    onClick={logout}
                    style={logoutBtn}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 8%',
    height: '70px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
};

const logoStyle = {
    cursor: 'pointer',
    color: '#1a237e',
    fontSize: '24px',
    fontWeight: '700',
    letterSpacing: '-0.5px'
};

const profileBrief = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '20px',
    border: '1px solid #eee'
};

const statusDot = {
    width: '8px',
    height: '8px',
    backgroundColor: '#4caf50',
    borderRadius: '50%'
};

const logoutBtn = {
    padding: '10px 25px',
    backgroundColor: '#1a237e',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'background 0.3s'
};

export default Navbar;
