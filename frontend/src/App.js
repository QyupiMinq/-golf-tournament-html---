import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import News from '@/pages/News';
import Teams from '@/pages/Teams';
import Players from '@/pages/Players';
import Matches from '@/pages/Matches';
import Leaderboard from '@/pages/Leaderboard';
import Transfers from '@/pages/Transfers';
import Settings from '@/pages/Settings';
import UserManagement from '@/pages/UserManagement';
import GuestDashboard from '@/pages/GuestDashboard';
import GuestPlayers from '@/pages/GuestPlayers';
import TestUpload from '@/pages/TestUpload';
import Layout from '@/components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add axios interceptor to always include token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', response.data.access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      setUser(response.data.user);
      toast.success('Login berhasil!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login gagal');
      return false;
    }
  };

  const register = async (email, password, name, role) => {
    try {
      const response = await axios.post(`${API}/auth/register`, { email, password, name, role });
      // Don't auto-login after registration, show pending approval message
      toast.success('Registration successful! Your account is pending approval. Please wait for admin to approve your account before you can login.', {
        duration: 8000
      });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registrasi gagal');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logout berhasil');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="text-2xl font-semibold text-emerald-700">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      <BrowserRouter>
        <Routes>
          {/* Guest Routes - No auth required */}
          <Route path="/guest" element={<GuestDashboard />} />
          <Route path="/guest/players" element={<GuestPlayers />} />
          
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route
            path="/*"
            element={
              user ? (
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/teams" element={<Teams />} />
                    <Route path="/players" element={<Players />} />
                    <Route path="/matches" element={<Matches />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/transfers" element={<Transfers />} />
                    <Route path="/user-management" element={<UserManagement />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthContext.Provider>
  );
}

export default App;
export { API };