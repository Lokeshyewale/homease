import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaStar } from 'react-icons/fa';

const Providers = ({ url }) => {
    // Component to manage providers
    const [providers, setProviders] = useState([]);

    const fetchProviders = async () => {
        try {
            const response = await axios.get(`${url}/api/admin/providers`);
            if (response.data.success) {
                setProviders(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching providers");
        }
    };

    const toggleApproval = async (id) => {
        try {
            const response = await axios.post(`${url}/api/admin/provider/approve`, { id });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchProviders();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    return (
        <div className="providers-page flex-col">
            <h3>Service Provider Management</h3>
            <div className="provider-list-header">
                <p>Name</p>
                <p>Category</p>
                <p>Email</p>
                <p>Experience</p>
                <p>Rating</p>
                <p>Status</p>
                <p>Action</p>
            </div>
            {providers.map((item, index) => {
                return (
                    <div key={index} className="provider-list-item">
                        <p>{item.name}</p>
                        <p className="category-badge">{item.category}</p>
                        <p>{item.email}</p>
                        <p>{item.experienceYears} Years</p>
                        <p className="rating-flex"><FaStar color="#FFD700" /> {item.rating}</p>
                        <p className={item.isApproved ? "status-approved" : "status-pending"}>
                            {item.isApproved ? "Verified" : "Pending"}
                        </p>
                        <button
                            onClick={() => toggleApproval(item.id)}
                            className={`action-btn ${item.isApproved ? "revoke-btn" : "approve-btn"}`}
                        >
                            {item.isApproved ? "Revoke" : "Approve"}
                        </button>
                    </div>
                )
            })}

            <style jsx>{`
                .providers-page {
                    padding: 20px;
                    width: 70%;
                    margin-left: 25px;
                }
                .provider-list-header {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1.5fr 0.8fr 0.8fr 0.8fr 1fr;
                    align-items: center;
                    font-size: 15px;
                    padding: 12px 10px;
                    background-color: #f9f9f9;
                    border: 1px solid #cacaca;
                    font-weight: 600;
                    margin-bottom: 5px;
                }
                .provider-list-item {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1.5fr 0.8fr 0.8fr 0.8fr 1fr;
                    align-items: center;
                    font-size: 14px;
                    padding: 15px 10px;
                    border: 1px solid #cacaca;
                    border-top: none;
                }
                .category-badge {
                    background: #eee;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    width: fit-content;
                }
                .rating-flex {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-weight: bold;
                }
                .status-approved {
                    color: green;
                    font-weight: bold;
                }
                .status-pending {
                    color: orange;
                    font-weight: bold;
                }
                .action-btn {
                    padding: 5px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                }
                .approve-btn {
                    background-color: #d1fae5;
                    color: #065f46;
                }
                .revoke-btn {
                    background-color: #fee2e2;
                    color: #991b1b;
                }
            `}</style>
        </div>
    );
};

export default Providers;
