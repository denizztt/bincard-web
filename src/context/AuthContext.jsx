import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/apiService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Token refresh timer
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        checkAndRefreshToken();
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    console.log('🔍 AUTH STATUS CHECK BAŞLADI');
    try {
      const isAuth = authApi.isAuthenticated();
      console.log('📋 Auth Check Result:', { isAuthenticated: isAuth });
      
      const tokens = authApi.getStoredTokens();
      console.log('🔑 Stored Tokens:', tokens);
      
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        // You could fetch user info here if needed
        setUser({ telephone: 'superadmin' }); // Placeholder
        console.log('✅ USER AUTHENTICATED - Setting superadmin user');
      } else {
        console.log('❌ USER NOT AUTHENTICATED');
      }
    } catch (error) {
      console.error('❌ AUTH CHECK FAILED:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      console.log('🏁 AUTH CHECK COMPLETED - Loading state set to false');
    }
  };

  const checkAndRefreshToken = async () => {
    try {
      if (authApi.shouldRefreshToken()) {
        const tokens = authApi.getStoredTokens();
        if (tokens.refreshToken) {
          await authApi.refreshToken(tokens.refreshToken);
          console.log('Token refreshed successfully');
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const login = async (telephone, password) => {
    console.log('🔐 LOGIN BAŞLADI:', { telephone });
    try {
      const response = await authApi.login({ telephone, password });
      console.log('✅ LOGIN API RESPONSE:', response);
      console.log('📊 Response Details:', {
        success: response.success,
        message: response.message,
        data: response.data,
        fullResponse: response
      });
      return { success: response.success, message: response.message };
    } catch (error) {
      console.error('❌ LOGIN FAILED:', error);
      console.error('🔍 Error Details:', {
        message: error.message,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authApi.signup(userData);
      return { success: response.success, message: response.message };
    } catch (error) {
      console.error('Signup failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Signup failed' 
      };
    }
  };

  const verifyPhone = async (telephone, code) => {
    console.log('📱 SMS VERIFICATION BAŞLADI:', { telephone, code });
    try {
      const response = await authApi.phoneVerify({ telephone, code });
      console.log('✅ SMS VERIFICATION RESPONSE:', response);
      console.log('🔑 Token Details:', {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        tokenExpiry: response.accessToken?.expiresAt,
        fullResponse: response
      });
      
      // Update auth state
      setIsAuthenticated(true);
      setUser({ telephone });
      console.log('🎯 AUTH STATE UPDATED:', { isAuthenticated: true, user: { telephone } });
      
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ SMS VERIFICATION FAILED:', error);
      console.error('🔍 Verification Error Details:', {
        message: error.message,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Verification failed' 
      };
    }
  };

  const resendVerificationCode = async (telephone) => {
    try {
      const response = await authApi.resendVerificationCode(telephone);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Resend verification failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to resend code' 
      };
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    verifyPhone,
    resendVerificationCode,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};