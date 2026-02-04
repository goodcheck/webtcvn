import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me')
};

// Products API
export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    search: (query) => api.get('/products/search', { params: { q: query } }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`)
};

// History API
export const historyAPI = {
    getAll: (params) => api.get('/history', { params }),
    save: (data) => api.post('/history', data),
    delete: (id) => api.delete(`/history/${id}`),
    clear: () => api.delete('/history')
};

// Export API
export const exportAPI = {
    tccs: (productId, format) => api.post('/export/tccs', { productId, format }),
    testing: (productId, format) => api.post('/export/testing', { productId, format }),
    declaration: (productId, format) => api.post('/export/declaration', { productId, format }),
    label: (productId, format) => api.post('/export/label', { productId, format }),
    all: (productId) => api.post('/export/all', { productId })
};

export default api;
