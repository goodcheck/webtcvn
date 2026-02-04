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
    const [modifiedData, setModifiedData] = useState({});

    useEffect(() => {
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

        loadProduct();
    }, [id, isAuthenticated]);

    const handleDataChange = (path, value) => {
        setModifiedData({
            ...modifiedData,
            [path]: value
        });
    };

    const handleExport = async (type, format = 'docx') => {
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để xuất file');
            return;
        }

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
        }
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (!product) {
        return <div className="error">Không tìm thấy sản phẩm</div>;
    }

    return (
        <div className="main-wrapper">
            {/* MAIN CONTENT */}
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
                    <div className="edit-hint">
                        💡 <strong>Mẹo:</strong> Bạn có thể chỉnh sửa các giá trị trực tiếp để phù hợp với sản phẩm của mình
                    </div>

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
                                        <td><input type="text" className="editable-input" defaultValue={product.sensoryIndicators?.color} onChange={(e) => handleDataChange('sensory.color', e.target.value)} /></td>
                                    </tr>
                                    <tr>
                                        <td>Mùi</td>
                                        <td><input type="text" className="editable-input" defaultValue={product.sensoryIndicators?.smell} onChange={(e) => handleDataChange('sensory.smell', e.target.value)} /></td>
                                    </tr>
                                    <tr>
                                        <td>Vị</td>
                                        <td><input type="text" className="editable-input" defaultValue={product.sensoryIndicators?.taste} onChange={(e) => handleDataChange('sensory.taste', e.target.value)} /></td>
                                    </tr>
                                    <tr>
                                        <td>Trạng thái</td>
                                        <td><input type="text" className="editable-input" defaultValue={product.sensoryIndicators?.texture} onChange={(e) => handleDataChange('sensory.texture', e.target.value)} /></td>
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
                                    {product.physicalChemical && product.physicalChemical.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.indicator}</td>
                                            <td><input type="text" className="editable-input" defaultValue={item.value} onChange={(e) => handleDataChange(`physical.${index}`, e.target.value)} /></td>
                                            <td>{item.method}</td>
                                        </tr>
                                    ))}
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
                                    {product.microbiological && product.microbiological.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.indicator}</td>
                                            <td><input type="text" className="editable-input" defaultValue={item.limit} onChange={(e) => handleDataChange(`micro.${index}`, e.target.value)} /></td>
                                            <td>{item.method}</td>
                                        </tr>
                                    ))}
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
                                    {product.heavyMetals && product.heavyMetals.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.indicator}</td>
                                            <td><input type="text" className="editable-input" defaultValue={item.limit} onChange={(e) => handleDataChange(`heavy.${index}`, e.target.value)} /></td>
                                            <td>{item.method}</td>
                                        </tr>
                                    ))}
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
                                        <th style={{ width: '50px' }}>STT</th>
                                        <th>Chỉ tiêu</th>
                                        <th>Phương pháp</th>
                                        <th style={{ width: '150px' }}>Chi phí (đ)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {product.testingRequirements && product.testingRequirements.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.indicator}</td>
                                            <td>{item.method}</td>
                                            <td>{item.cost?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    <tr className="total-row" style={{ background: '#e8f5e9', fontWeight: 'bold' }}>
                                        <td colSpan="3" style={{ textAlign: 'right' }}>TỔNG CHI PHÍ ƯỚC TÍNH:</td>
                                        <td>{product.testingRequirements?.reduce((sum, i) => sum + (i.cost || 0), 0).toLocaleString()}</td>
                                    </tr>
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
                                        <td>{product.packagingRequirements?.packageType}</td>
                                    </tr>
                                    <tr>
                                        <th>Tiêu chuẩn</th>
                                        <td>{product.packagingRequirements?.standard}</td>
                                    </tr>
                                    <tr>
                                        <th>Tính năng</th>
                                        <td>{product.packagingRequirements?.features}</td>
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
                                    {product.labelingRequirements && product.labelingRequirements.map((item, index) => (
                                        <tr key={index}>
                                            <td>✓ {item.requirement}</td>
                                            <td>{item.detail}</td>
                                        </tr>
                                    ))}
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
                                    <button className="export-btn" onClick={() => handleExport('tccs')}>⬇️ Tải TCCS</button>
                                </div>

                                <div className="export-card">
                                    <div className="export-card-icon">🔬</div>
                                    <h3>Phiếu Kiểm nghiệm</h3>
                                    <p>Mẫu phiếu gửi đơn vị kiểm nghiệm</p>
                                    <button className="export-btn" onClick={() => handleExport('testing')}>⬇️ Tải Phiếu KN</button>
                                </div>

                                <div className="export-card">
                                    <div className="export-card-icon">📋</div>
                                    <h3>Hồ sơ Công bố</h3>
                                    <p>Bộ hồ sơ hoàn chỉnh để nộp cơ quan ATTP</p>
                                    <button className="export-btn" onClick={() => handleExport('declaration')}>⬇️ Tải Hồ sơ CB</button>
                                </div>

                                <div className="export-card">
                                    <div className="export-card-icon">🏷️</div>
                                    <h3>Mẫu Nhãn</h3>
                                    <p>Thiết kế nhãn phù hợp quy chuẩn</p>
                                    <button className="export-btn" onClick={() => handleExport('label')}>⬇️ Tải Mẫu Nhãn</button>
                                </div>
                            </div>

                            <div className="export-all-section">
                                <h3>📦 Tải Trọn bộ Hồ sơ</h3>
                                <p>Tải về tất cả tài liệu cần thiết trong một file ZIP</p>
                                <button className="export-all-btn" onClick={() => handleExport('all')}>⬇️ TẢI TẤT CẢ (ZIP)</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SIDEBAR */}
            <div className="sidebar">
                <div className="sidebar-card">
                    <h3>📋 THỦ TỤC PHÁP LÝ</h3>
                    <div className="timeline-item">
                        <strong>Công bố sản phẩm</strong>
                        <p>Thông tư 24/2019/TT-BYT</p>
                    </div>
                    <div className="timeline-item">
                        <strong>Giấy phép ATTP</strong>
                        <p>NĐ 15/2018/NĐ-CP</p>
                    </div>
                    <div className="timeline-item">
                        <strong>Quy chuẩn ghi nhãn</strong>
                        <p>TT 43/2017/TT-BYT</p>
                    </div>
                </div>

                <div className="sidebar-card">
                    <h3>🏛️ CƠ QUAN QUẢN LÝ</h3>
                    <div className="agency-box">
                        <h5>Cục An toàn Thực phẩm - BYT</h5>
                        <p>138A Giảng Võ, Ba Đình, Hà Nội</p>
                        <p className="contact">📞 024.6273.4614</p>
                    </div>
                    <div className="agency-box">
                        <h5>Chi cục ATTP TP. Hà Nội</h5>
                        <p>28 Trần Thánh Tông, Hai Bà Trưng</p>
                    </div>
                </div>

                <div className="sidebar-card">
                    <h3>🔬 ĐƠN VỊ KIỂM NGHIỆM</h3>
                    <div className="agency-box">
                        <h5>QUATEST 3</h5>
                        <p>17 Lý Thường Kiệt, Q.10, TP.HCM</p>
                    </div>
                    <div className="agency-box">
                        <h5>NIFC</h5>
                        <p>3 Quang Trung, Hà Đông, Hà Nội</p>
                    </div>
                </div>

                <div className="sidebar-card">
                    <h3>🌏 THỊ TRƯỜNG QUỐC TẾ</h3>
                    <div className="market-item">🇺🇸 <strong>Hoa Kỳ (FDA)</strong></div>
                    <div className="market-item">🇪🇺 <strong>EU (Châu Âu)</strong></div>
                    <div className="market-item">🇯🇵 <strong>Nhật Bản (MHLW)</strong></div>
                    <div className="market-item">🇰🇷 <strong>Hàn Quốc (MFDS)</strong></div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
