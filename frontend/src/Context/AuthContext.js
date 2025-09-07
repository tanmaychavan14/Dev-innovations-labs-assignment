import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const AuthContext = createContext();

// Initial state
const initialState = {
  token: localStorage.getItem('token'),
  user: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };
    case 'AUTH_SUCCESS':
      // Store token in localStorage
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      };
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        user: null,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      return {
        ...state,
        token: null,
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Use useEffect with empty dependency array and check token inside
  // useEffect(() => {
  //   const verifyToken = async () => {
  //     const token = localStorage.getItem('token');
      
  //     if (token) {
  //       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  //       try {
  //         const res = await api.get('/auth');
  //         dispatch({
  //           type: 'AUTH_SUCCESS',
  //           payload: { token, user: res.data.user },
  //         });
  //       } catch (error) {
  //         console.error('Token verification failed:', error);
  //         dispatch({ type: 'AUTH_ERROR', payload: 'Token verification failed' });
  //       }
  //     } else {
  //       dispatch({ type: 'SET_LOADING', payload: false });
  //     }
  //   };

  //   verifyToken();
  // }, []); // Empty dependency array - runs only once on mount

  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/auth/login', { email, password });
      
      // Set Authorization header immediately
      if (response.data.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);
const register = async (name, email, password, role) => {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    const response = await api.post('/auth/register', { name, email, password, role });
    dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
    return { success: true };
  } catch (error) {
    const message = error.response?.data?.message || 'Registration failed';
    dispatch({ type: 'AUTH_ERROR', payload: message });
    return { success: false, error: message };
  }
};


  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};