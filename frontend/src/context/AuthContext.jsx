import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await authAPI.getMe();
                setUser(response.data.user);
            } catch (error) {
                console.error('Failed to load user:', error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            return { success: true, message: response.data.message };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Đăng nhập thất bại'
            };
        }
    };

    const register = async (data) => {
        try {
            const response = await authAPI.register(data);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            return { success: true, message: response.data.message };
        } catch (error) {
            console.error('Register error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Đăng ký thất bại'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
