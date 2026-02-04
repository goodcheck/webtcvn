import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productsAPI, exportAPI, historyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [exportLoading, setExportLoading] = useState(false);

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            const response = await productsAPI.getById(id);
            setProduct(response.data.data);

            // Save to history if authenticated
            if (isAuthenticated) {
                await historyAPI.save({
                    productId: response.data.data._id,
                    productName: response.data.data.name
                });
            }
        } catch (error) {
            console.error('Error loading product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type, format = 'docx') => {
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để xuất file');
            return;
        }

        setExportLoading(true);
        try {
            let response;
            switch (type) {
                case 'tccs':
                    response = await exportAPI.tccs(id, format);
                    break;
                case 'testing':
                    response = await exportAPI.testing(id, format);
                    break;
                case 'declaration':
                    response = await exportAPI.declaration(id, format);
                    break;
                case 'label':
                    response = await exportAPI.label(id, format);
                    break;
                case 'all':
                    response = await exportAPI.all(id);
                    break;
                default:
                    return;
            }

            alert(response.data.message);
        } catch (error) {
            alert('Lỗi khi xuất file: ' + (error.response?.data?.message || error.message));
        } finally {
            setExportLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (!product) {
        return <div className="error">Không tìm thấy sản phẩm</div>;
    }

    return (
        <div className="product-detail-container">
            <div className="result-header">
                <h2>Kết quả tra cứu: {product.name}</h2>
                <span className="status-badge">✓ Đã tìm thấy tiêu chuẩn phù hợp</span>
            </div>

            <div className="progress-bar">100%</div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
                    📊 BẢN TIÊU CHUẨN
                </button>
                <button className={`tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
                    🛡️ Chỉ tiêu An toàn TP
                </button>
                <button className={`tab ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
                    🔬 Yêu cầu Kiểm nghiệm
                </button>
                <button className={`tab ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)}>
                    📦 Bao bì - Nhãn
                </button>
                <button className={`tab ${activeTab === 4 ? 'active' : ''}`} onClick={() => setActiveTab(4)}>
                    📤 XUẤT HỒ SƠ
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content-container">
                {/* Tab 0: Standards */}
                {activeTab === 0 && (
                    <div className="tab-content active">
                        <h4>1. Chỉ tiêu Cảm quan</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Tiêu chí</th>
                                    <th>Yêu cầu</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Màu sắc</td>
                                    <td>{product.sensoryIndicators?.color || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td>Mùi</td>
                                    <td>{product.sensoryIndicators?.smell || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td>Vị</td>
                                    <td>{product.sensoryIndicators?.taste || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td>Trạng thái</td>
                                    <td>{product.sensoryIndicators?.texture || 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>

                        <h4>2. Chỉ tiêu Lý hóa</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Chỉ tiêu</th>
                                    <th>Giá trị</th>
                                    <th>Phương pháp thử</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product.physicalChemical && product.physicalChemical.length > 0 ? (
                                    product.physicalChemical.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.indicator}</td>
                                            <td>{item.value}</td>
                                            <td>{item.method}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3">Chưa có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab 1: Safety */}
                {activeTab === 1 && (
                    <div className="tab-content active">
                        <h4>A. Chỉ tiêu Vi sinh</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Chỉ tiêu</th>
                                    <th>Giới hạn</th>
                                    <th>Phương pháp thử</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product.microbiological && product.microbiological.length > 0 ? (
                                    product.microbiological.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.indicator}</td>
                                            <td>{item.limit}</td>
                                            <td>{item.method}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3">Chưa có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <h4>B. Kim loại nặng</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Chỉ tiêu</th>
                                    <th>Giới hạn</th>
                                    <th>Phương pháp thử</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product.heavyMetals && product.heavyMetals.length > 0 ? (
                                    product.heavyMetals.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.indicator}</td>
                                            <td>{item.limit}</td>
                                            <td>{item.method}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3">Chưa có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab 2: Testing */}
                {activeTab === 2 && (
                    <div className="tab-content active">
                        <h4>📋 PHIẾU YÊU CẦU KIỂM NGHIỆM</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Chỉ tiêu</th>
                                    <th>Phương pháp</th>
                                    <th>Chi phí (đ)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product.testingRequirements && product.testingRequirements.length > 0 ? (
                                    product.testingRequirements.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.stt || index + 1}</td>
                                            <td>{item.indicator}</td>
                                            <td>{item.method}</td>
                                            <td>{item.cost?.toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4">Chưa có dữ liệu</td>
                                    </tr>
                                )}
                                {product.testingRequirements && product.testingRequirements.length > 0 && (
                                    <tr className="total-row">
                                        <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                            TỔNG CHI PHÍ ƯỚC TÍNH:
                                        </td>
                                        <td style={{ fontWeight: 'bold' }}>
                                            {product.testingRequirements.reduce((sum, item) => sum + (item.cost || 0), 0).toLocaleString()}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab 3: Packaging */}
                {activeTab === 3 && (
                    <div className="tab-content active">
                        <h4>Yêu cầu Bao bì</h4>
                        <table>
                            <tbody>
                                <tr>
                                    <th>Loại bao bì</th>
                                    <td>{product.packagingRequirements?.type || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Tiêu chuẩn</th>
                                    <td>{product.packagingRequirements?.standard || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Tính năng</th>
                                    <td>{product.packagingRequirements?.features || 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>

                        <h4>Nội dung Ghi nhãn</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Thông tin bắt buộc</th>
                                    <th>Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product.labelingRequirements && product.labelingRequirements.length > 0 ? (
                                    product.labelingRequirements.map((item, index) => (
                                        <tr key={index}>
                                            <td>✓ {item.requirement}</td>
                                            <td>{item.detail}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2">Chưa có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tab 4: Export */}
                {activeTab === 4 && (
                    <div className="tab-content active">
                        <div className="export-grid">
                            <div className="export-card">
                                <div className="export-card-icon">📄</div>
                                <h3>Tiêu chuẩn Cơ sở (TCCS)</h3>
                                <p>Tài liệu đầy đủ về tiêu chuẩn chất lượng sản phẩm</p>
                                <button
                                    className="export-btn"
                                    onClick={() => handleExport('tccs', 'docx')}
                                    disabled={exportLoading}
                                >
                                    ⬇️ Tải TCCS
                                </button>
                            </div>

                            <div className="export-card">
                                <div className="export-card-icon">🔬</div>
                                <h3>Phiếu Kiểm nghiệm</h3>
                                <p>Mẫu phiếu gửi đơn vị kiểm nghiệm</p>
                                <button
                                    className="export-btn"
                                    onClick={() => handleExport('testing', 'json')}
                                    disabled={exportLoading}
                                >
                                    ⬇️ Tải Phiếu KN
                                </button>
                            </div>

                            <div className="export-card">
                                <div className="export-card-icon">📋</div>
                                <h3>Hồ sơ Công bố</h3>
                                <p>Bộ hồ sơ hoàn chỉnh để nộp cơ quan ATTP</p>
                                <button
                                    className="export-btn"
                                    onClick={() => handleExport('declaration', 'docx')}
                                    disabled={exportLoading}
                                >
                                    ⬇️ Tải Hồ sơ CB
                                </button>
                            </div>

                            <div className="export-card">
                                <div className="export-card-icon">🏷️</div>
                                <h3>Mẫu Nhãn</h3>
                                <p>Thiết kế nhãn phù hợp quy chuẩn</p>
                                <button
                                    className="export-btn"
                                    onClick={() => handleExport('label', 'txt')}
                                    disabled={exportLoading}
                                >
                                    ⬇️ Tải Mẫu Nhãn
                                </button>
                            </div>
                        </div>

                        <div className="export-all-section">
                            <h3>📦 Tải Trọn bộ Hồ sơ</h3>
                            <p>Tải về tất cả tài liệu cần thiết trong một file</p>
                            <button
                                className="export-all-btn"
                                onClick={() => handleExport('all')}
                                disabled={exportLoading}
                            >
                                ⬇️ TẢI TẤT CẢ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
