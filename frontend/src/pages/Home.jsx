import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import '../styles/Home.css';

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef(null);

    // Handle search input
    const handleSearchInput = async (value) => {
        setSearchQuery(value);

        if (value.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setLoading(true);
        try {
            const response = await productsAPI.search(value);
            setSuggestions(response.data.data || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    // Select product from suggestions
    const selectProduct = (product) => {
        setSearchQuery(product.name);
        setShowSuggestions(false);
        navigate(`/product/${product._id}`);
    };

    // Quick search
    const quickSearch = (productName) => {
        setSearchQuery(productName);
        handleSearchInput(productName);
    };

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="home-container">
            {/* Header */}
            <div className="home-header">
                <h1>🔍 Hệ thống Tra cứu TCVN/QCVN</h1>
                <p>Tự động tạo Tiêu chuẩn, Kiểm nghiệm & Hồ sơ Công bố Sản phẩm</p>
            </div>

            {/* Search Box */}
            <div className="search-section">
                <h3>Tra cứu sản phẩm của bạn</h3>

                <div className="search-input-wrapper" ref={searchRef}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Nhập tên sản phẩm (VD: Cà phê, Nước tinh khiết...)"
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                    />

                    {/* Autocomplete Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="autocomplete-suggestions">
                            {suggestions.map((product) => (
                                <div
                                    key={product._id}
                                    className="suggestion-item"
                                    onClick={() => selectProduct(product)}
                                >
                                    <div>
                                        <span className="suggestion-code">{product.code}</span>
                                        <span className="suggestion-name">{product.name}</span>
                                    </div>
                                    <div className="suggestion-path">{product.category}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <p className="quick-categories-label">📌 Danh mục phổ biến:</p>
                <div className="quick-categories">
                    <div className="quick-cat-item" onClick={() => quickSearch('Cà phê')}>☕ Cà phê</div>
                    <div className="quick-cat-item" onClick={() => quickSearch('Nước tinh khiết')}>💧 Nước uống</div>
                    <div className="quick-cat-item" onClick={() => quickSearch('Bánh quy')}>🍪 Bánh kẹo</div>
                    <div className="quick-cat-item" onClick={() => quickSearch('Nước mắm')}>🥫 Gia vị</div>
                    <div className="quick-cat-item" onClick={() => quickSearch('Sữa tươi')}>🥛 Sữa</div>
                    <div className="quick-cat-item" onClick={() => quickSearch('Gạo')}>🌾 Ngũ cốc</div>
                </div>
            </div>

            {/* 3 Steps */}
            <div className="steps-section">
                <div className="step-card">
                    <div className="step-number">1</div>
                    <h4>Tra cứu Tiêu chuẩn</h4>
                    <p>Hệ thống tự động tra cứu TCVN/QCVN phù hợp</p>
                    <ul>
                        <li>TCVN Chất lượng</li>
                        <li>QCVN An toàn TP</li>
                        <li>Thông tư pháp lý</li>
                    </ul>
                </div>

                <div className="step-card">
                    <div className="step-number">2</div>
                    <h4>Tạo Chỉ tiêu Tự động</h4>
                    <p>AI tổng hợp và tạo bảng chỉ tiêu đầy đủ</p>
                    <ul>
                        <li>Chỉ tiêu Chất lượng</li>
                        <li>Chỉ tiêu An toàn</li>
                        <li>Yêu cầu Bao bì - Nhãn</li>
                    </ul>
                </div>

                <div className="step-card">
                    <div className="step-number">3</div>
                    <h4>Xuất Hồ sơ Hoàn chỉnh</h4>
                    <p>Tạo bộ tài liệu công bố sản phẩm</p>
                    <ul>
                        <li>Tiêu chuẩn cơ sở (TCCS)</li>
                        <li>Phiếu kiểm nghiệm</li>
                        <li>Hồ sơ công bố đầy đủ</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Home;
