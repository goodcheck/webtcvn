import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { historyAPI, authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { user, login } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        company: user?.company || '',
        taxCode: user?.taxCode || '',
        address: user?.address || '',
        phone: user?.phone || '',
        representativeRole: user?.representativeRole || 'Giám đốc',
        logo: user?.logo || ''
    });
    const [updating, setUpdating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const response = await historyAPI.getAll();
            setHistory(response.data.data || []);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const response = await authAPI.updateProfile(profileData);
            // Re-login locally to update context with new user data
            // (Assumes context 'login' can handle updating state)
            // If login just sets token, we might need a specifically 'updateUser' function
            // For now, let's assume we can at least show success
            alert('Cập nhật thông tin thành công!');
            // Reload page or update context (in a real app, use a dedicated context method)
            window.location.reload();
        } catch (error) {
            alert('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa mục này?')) return;

        try {
            await historyAPI.delete(id);
            setHistory(history.filter(item => item._id !== id));
        } catch (error) {
            alert('Lỗi khi xóa: ' + error.message);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử?')) return;

        try {
            await historyAPI.clear();
            setHistory([]);
        } catch (error) {
            alert('Lỗi khi xóa: ' + error.message);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Bảng điều khiển</h1>
                <p>Chào mừng trở lại, <strong>{user?.name}</strong>!</p>
            </div>

            <div className="dashboard-grid">
                {/* Profile Section */}
                <div className="profile-section">
                    <div className="section-header">
                        <h2>🏢 Thông tin Doanh nghiệp</h2>
                        <span className="subtitle">Thông tin dùng để xuất hồ sơ tự động</span>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="profile-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Tên doanh nghiệp</label>
                                <input
                                    type="text"
                                    value={profileData.company}
                                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                                    placeholder="Công ty TNHH..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Mã số thuế</label>
                                <input
                                    type="text"
                                    value={profileData.taxCode}
                                    onChange={(e) => setProfileData({ ...profileData, taxCode: e.target.value })}
                                    placeholder="0123456789"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Địa chỉ trụ sở</label>
                                <input
                                    type="text"
                                    value={profileData.address}
                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                    placeholder="Số 1, Đường ABC, Quận..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="text"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    placeholder="09xx xxx xxx"
                                />
                            </div>
                            <div className="form-group">
                                <label>Chức vụ người đại diện</label>
                                <input
                                    type="text"
                                    value={profileData.representativeRole}
                                    onChange={(e) => setProfileData({ ...profileData, representativeRole: e.target.value })}
                                    placeholder="Giám đốc / Chủ sở hữu"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>URL Logo (tùy chọn)</label>
                                <input
                                    type="text"
                                    value={profileData.logo}
                                    onChange={(e) => setProfileData({ ...profileData, logo: e.target.value })}
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-update" disabled={updating}>
                            {updating ? 'Đang lưu...' : '💾 Lưu thông tin'}
                        </button>
                    </form>
                </div>

                {/* History Section */}
                <div className="history-section">
                    <div className="section-header">
                        <h2>🕒 Lịch sử Tra cứu</h2>
                        {history.length > 0 && (
                            <button onClick={handleClearAll} className="btn-clear-all">
                                🗑️ Xóa tất cả
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="loading">Đang tải...</div>
                    ) : history.length === 0 ? (
                        <div className="empty-state">
                            <p>Bạn chưa tra cứu sản phẩm nào.</p>
                            <button onClick={() => navigate('/')} className="btn-search">
                                Bắt đầu ngay
                            </button>
                        </div>
                    ) : (
                        <div className="history-list">
                            {history.map((item) => (
                                <div key={item._id} className="history-item">
                                    <div className="history-info">
                                        <h3>{item.productName}</h3>
                                        <p className="history-date">
                                            {new Date(item.searchedAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="history-actions">
                                        <button
                                            onClick={() => navigate(`/product/${item.product._id || item.product}`)}
                                            className="btn-view"
                                        >
                                            Xem
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="btn-delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
