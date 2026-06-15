import React, { useState, useContext } from 'react';
import axios from 'axios';
import { ProviderContext } from '../context/ProviderContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { url, setToken, fetchProviderData } = useContext(ProviderContext);
    const navigate = useNavigate();
    const [currentState, setCurrentState] = useState("Login");
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        category: "House Cleaner", // Default
        experienceYears: 0
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };

    const onLogin = async (event) => {
        event.preventDefault();
        let newUrl = url;
        if (currentState === "Login") {
            newUrl += "/api/provider/login";
        } else {
            newUrl += "/api/provider/register";
        }

        try {
            const response = await axios.post(newUrl, data);
            if (response.data.success) {
                setToken(response.data.token);
                localStorage.setItem("providerToken", response.data.token);
                fetchProviderData(response.data.token);
                navigate('/');
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        }
    };

    return (
        <div style={pageContainer}>
            <div style={loginCard}>
                <div style={cardHeader}>
                    <h2 style={{ margin: 0 }}>Homease <span style={{ color: '#f97316' }}>Partner</span></h2>
                    <p style={{ color: '#666', marginTop: '5px' }}>{currentState === "Sign Up" ? "Register to start earning" : "Welcome back, partner!"}</p>
                </div>

                <form onSubmit={onLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {currentState === "Sign Up" && (
                        <>
                            <div style={inputGroup}>
                                <label style={labelStyle}>Full Name</label>
                                <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='e.g. John Doe' required style={inputStyle} />
                            </div>
                            <div style={inputGroup}>
                                <label style={labelStyle}>Phone Number</label>
                                <input name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='e.g. 9876543210' required style={inputStyle} />
                            </div>
                            <div style={inputGroup}>
                                <label style={labelStyle}>Service Category</label>
                                <select name='category' onChange={onChangeHandler} value={data.category} style={inputStyle}>
                                    <option value="House Cleaner">House Cleaner</option>
                                    <option value="Electrician">Electrician</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Shifting">Shifting</option>
                                    <option value="Painting">Painting</option>
                                    <option value="Repairing">Repairing</option>
                                </select>
                            </div>
                            <div style={inputGroup}>
                                <label style={labelStyle}>Experience (Years)</label>
                                <input name='experienceYears' onChange={onChangeHandler} value={data.experienceYears} type="number" placeholder='Years of experience' required style={inputStyle} />
                            </div>
                        </>
                    )}
                    <div style={inputGroup}>
                        <label style={labelStyle}>Email Address</label>
                        <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='partner@homease.com' required style={inputStyle} />
                    </div>
                    <div style={inputGroup}>
                        <label style={labelStyle}>Password</label>
                        <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Minimum 6 characters' required style={inputStyle} />
                    </div>

                    <button type='submit' style={submitBtn}>
                        {currentState === "Sign Up" ? "Join the Network" : "Login to Workspace"}
                    </button>

                    <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '14px' }}>
                        {currentState === "Login"
                            ? <p>Don't have a partner account? <span onClick={() => setCurrentState("Sign Up")} style={linkStyle}>Register here</span></p>
                            : <p>Already a registered partner? <span onClick={() => setCurrentState("Login")} style={linkStyle}>Login here</span></p>
                        }
                    </div>
                </form>
            </div>

            <div style={promoSide}>
                <div style={gradOverlay}></div>
                <div style={promoText}>
                    <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Grow Your Business with Homease</h1>
                    <p style={{ fontSize: '18px', opacity: 0.9 }}>Join thousands of service professionals reaching new customers every day.</p>
                </div>
            </div>
        </div>
    );
};

const pageContainer = {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#fff'
};

const loginCard = {
    flex: '1',
    maxWidth: '550px',
    padding: '60px 80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    animation: 'fadeIn 1s'
};

const cardHeader = {
    marginBottom: '40px'
};

const inputGroup = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
};

const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
};

const inputStyle = {
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1.5px solid #e5e7eb',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s'
};

const submitBtn = {
    padding: '14px',
    marginTop: '10px',
    backgroundColor: '#1a237e',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background 0.3s',
    boxShadow: '0 4px 6px rgba(26, 35, 126, 0.2)'
};

const promoSide = {
    flex: '1.2',
    position: 'relative',
    background: 'url("https://images.unsplash.com/photo-1581578731548-c64695ce6958?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80") center/cover no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textAlign: 'center'
};

const gradOverlay = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(26, 35, 126, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
};

const promoText = {
    position: 'relative',
    zIndex: 1,
    padding: '40px'
};

const linkStyle = {
    color: '#1a237e',
    fontWeight: '700',
    cursor: 'pointer',
    marginLeft: '5px',
    textDecoration: 'underline'
};

export default Login;
