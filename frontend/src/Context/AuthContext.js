
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import axios from 'axios';

// Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

const AuthContext = createContext();

// Initial state
const initialState = {
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'AUTH_SUCCESS':
      if (action.payload.token) localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      return { ...state, token: null, user: null, isAuthenticated: false, isLoading: false, error: action.payload };
    case 'LOGOUT':
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      return { ...state, token: null, user: null, isAuthenticated: false, error: null, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  // Logout
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);

  // Clear error
  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
