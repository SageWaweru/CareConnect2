import { createContext, useState, useEffect } from 'react';
import api from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const API_BASE_URL = "https://careconnect2.onrender.com";
    // const API_BASE_URL = "http://localhost:8000";

  const login = async (formData) => {
    try {
      const response = await api.post(`${API_BASE_URL}/api/login/`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);

      const userDetailsResponse = await api.get(`${API_BASE_URL}/api/users/me/`, {
        headers: { Authorization: `Bearer ${response.data.access}` },
      });

      const userData = {
        username: userDetailsResponse.data.username,
        role: userDetailsResponse.data.role,
        userId: userDetailsResponse.data.id,
      };

      setUser(userData);
      localStorage.setItem('userId', userData.userId);
      alert('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    setUser(null);
    alert('You have been logged out');
  };

  // --- Load user on app start ---
  const loadUserFromToken = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      const userDetailsResponse = await api.get(`${API_BASE_URL}/api/users/me/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUser({
        username: userDetailsResponse.data.username,
        role: userDetailsResponse.data.role,
        userId: userDetailsResponse.data.id,
      });
    } catch (err) {
      console.error('Failed to load user from token:', err);
      logout();
    }
  };

  // --- Refresh user periodically ---
  useEffect(() => {
    loadUserFromToken();

    // Optional: refresh user info every 5 mins (in case token refresh changes state)
    const interval = setInterval(loadUserFromToken, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
