import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: if a token exists, fetch fresh user data from the server
  // so profile photo, addresses etc. are always up-to-date after reload
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then(res => {
        const freshUser = res.data.data.user;
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      })
      .catch(() => {
        // Token invalid/expired — clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token } = response.data.data;

    localStorage.setItem('token', token);

    // Fetch full user profile (includes avatar, addresses, etc.)
    const meRes = await api.get('/auth/me');
    const fullUser = meRes.data.data.user;
    localStorage.setItem('user', JSON.stringify(fullUser));
    setUser(fullUser);

    return fullUser;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  };

  const verifyOTP = async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    const { token } = response.data.data;

    localStorage.setItem('token', token);

    const meRes = await api.get('/auth/me');
    const fullUser = meRes.data.data.user;
    localStorage.setItem('user', JSON.stringify(fullUser));
    setUser(fullUser);

    return fullUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Use functional update to avoid stale closure — always merges into latest state
  const updateUser = useCallback((userData) => {
    setUser(prev => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Refetch from server and update context — call this after any profile save
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      const freshUser = res.data.data.user;
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
      return freshUser;
    } catch {
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, verifyOTP, logout, updateUser, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
