import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { historyAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
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
                <h1>Dashboard</h1>
                <p>Xin chào, <strong>{user?.name}</strong>!</p>
            </div>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-icon">🔍</div>
                    <div className="stat-info">
                        <h3>{history.length}</h3>
                        <p>Sản phẩm đã tra cứu</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">👤</div>
                    <div className="stat-info">
                        <h3>{user?.company || 'Chưa cập nhật'}</h3>
                        <p>Công ty</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📧</div>
                    <div className="stat-info">
                        <h3>{user?.email}</h3>
                        <p>Email</p>
                    </div>
                </div>
            </div>

            <div className="history-section">
                <div className="history-header">
                    <h2>Lịch sử tra cứu</h2>
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
                        <p>Chưa có lịch sử tra cứu</p>
                        <button onClick={() => navigate('/')} className="btn-search">
                            Bắt đầu tra cứu
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
                                        Xem chi tiết
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
    );
};

export default Dashboard;
