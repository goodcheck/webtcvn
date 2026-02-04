import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <span className="logo-icon">🔍</span>
                    <span className="logo-text">TCVN/QCVN</span>
                </Link>

                <nav className="nav">
                    <Link to="/" className="nav-link">Trang chủ</Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            <div className="user-menu">
                                <span className="user-name">👤 {user?.name}</span>
                                <button onClick={handleLogout} className="btn-logout">
                                    Đăng xuất
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Đăng nhập</Link>
                            <Link to="/register" className="btn-register">Đăng ký</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
