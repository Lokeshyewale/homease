import React, { useState, useContext, useEffect } from 'react';
import { ProviderContext } from '../context/ProviderContext';
import axios from 'axios';

const Profile = () => {
    const { url, token, providerData, fetchProviderData } = useContext(ProviderContext);
    const [editData, setEditData] = useState({
        name: "",
        phone: "",
        experienceYears: 0,
        category: ""
    });

    useEffect(() => {
        if (providerData) {
            setEditData({
                name: providerData.name,
                phone: providerData.phone,
                experienceYears: providerData.experienceYears,
                category: providerData.category
            });
        }
    }, [providerData]);

    const onChangeHandler = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const onUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${url}/api/provider/update-profile`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                alert("Profile and experience details updated successfully!");
                fetchProviderData(token);
            }
        } catch (error) {
            alert("Failed to update profile. Please try again.");
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s', maxWidth: '1000px', margin: 'auto' }}>
            <div style={header}>
                <h1>Professional Profile</h1>
                <p>Manage your account settings and business information.</p>
            </div>

            <div style={mainGrid}>
                <div style={formCard}>
                    <h3 style={cardTitle}>Personal Information</h3>
                    <form onSubmit={onUpdate} style={formStyle}>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Full Display Name</label>
                            <input name="name" value={editData.name} onChange={onChangeHandler} style={inputStyle} />
                        </div>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Contact Number</label>
                            <input name="phone" value={editData.phone} onChange={onChangeHandler} style={inputStyle} />
                        </div>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Service Category</label>
                            <select name="category" value={editData.category} onChange={onChangeHandler} style={inputStyle}>
                                <option value="House Cleaner">House Cleaner</option>
                                <option value="Electrician">Electrician</option>
                                <option value="Plumbing">Plumbing</option>
                                <option value="Shifting">Shifting</option>
                                <option value="Painting">Painting</option>
                                <option value="Repairing">Repairing</option>
                            </select>
                        </div>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Years of Experience</label>
                            <input name="experienceYears" type="number" value={editData.experienceYears} onChange={onChangeHandler} style={inputStyle} />
                        </div>
                        <button type="submit" style={saveBtn}>Update Profile Info</button>
                    </form>
                </div>

                <div style={sideCards}>
                    <div style={profileSummaryCard}>
                        <div style={avatarWrap}>
                            <div style={avatar}>{providerData?.name?.charAt(0) || "P"}</div>
                        </div>
                        <h2 style={{ marginTop: '15px' }}>{providerData?.name}</h2>
                        <p style={{ color: '#666', fontSize: '14px' }}>Member since 2024</p>

                        <div style={ratingSection}>
                            <div style={starLabel}>Rating</div>
                            <div style={ratingValue}>{providerData?.rating?.toFixed(1) || "0.0"}</div>
                            <div style={{ color: '#FFD700', fontSize: '20px' }}>
                                {"★".repeat(Math.round(providerData?.rating || 0)) + "☆".repeat(5 - Math.round(providerData?.rating || 0))}
                            </div>
                        </div>
                    </div>

                    <div style={accountStatusCard}>
                        <h4 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', color: '#666' }}>Account Status</h4>
                        <div style={statusTag(providerData?.isApproved)}>
                            {providerData?.isApproved ? "✓ Verified Partner" : "⚠ Pending Approval"}
                        </div>
                        <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                            {providerData?.isApproved ? "Your profile is verified. You are visible to customers." : "Our team is reviewing your credentials. This usually takes 24-48 hours."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const header = {
    marginBottom: '40px'
};

const mainGrid = {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '30px'
};

const formCard = {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    border: '1px solid #f0f0f0'
};

const cardTitle = {
    fontSize: '20px',
    color: '#1a237e',
    marginBottom: '30px',
    fontWeight: '700'
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
};

const inputGroup = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
};

const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563'
};

const inputStyle = {
    padding: '14px',
    borderRadius: '10px',
    border: '1.5px solid #e5e7eb',
    fontSize: '16px',
    transition: 'border-color 0.2s',
    outline: 'none'
};

const saveBtn = {
    padding: '16px',
    backgroundColor: '#1a237e',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    marginTop: '15px',
    boxShadow: '0 4px 10px rgba(26, 35, 126, 0.2)'
};

const sideCards = {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
};

const profileSummaryCard = {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    textAlign: 'center',
    border: '1px solid #f0f0f0'
};

const avatarWrap = {
    display: 'inline-block',
    padding: '5px',
    borderRadius: '50%',
    border: '3px solid #eff6ff'
};

const avatar = {
    width: '100px',
    height: '100px',
    backgroundColor: '#1a237e',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    fontWeight: 'bold'
};

const ratingSection = {
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid #eee'
};

const starLabel = {
    fontSize: '14px',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const ratingValue = {
    fontSize: '42px',
    fontWeight: '800',
    color: '#1a237e',
    margin: '5px 0'
};

const accountStatusCard = {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    border: '1px solid #f0f0f0'
};

const statusTag = (isApproved) => ({
    marginTop: '15px',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'inline-block',
    backgroundColor: isApproved ? '#f0fdf4' : '#fff7ed',
    color: isApproved ? '#15803d' : '#c2410c'
});

export default Profile;
