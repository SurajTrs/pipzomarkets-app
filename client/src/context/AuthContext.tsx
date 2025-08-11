import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User, AuthContextType, RegisterData } from './types';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const config = {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          };

          const res = await axios.get(`${API_URL}/user`, config);
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          const errorMsg = axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : 'Authentication failed. Please login again.';
          setError(errorMsg);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await axios.post(`${API_URL}/register`, userData);
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) && err.response?.data?.message
        ? err.response.data.message
        : 'Registration failed';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await axios.post(`${API_URL}/login`, { email, password });
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      const errorMsg = axios.isAxiosError(err) && err.response?.data?.message
        ? err.response.data.message
        : 'Login failed';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export the context for use in the hook file
export { AuthContext };