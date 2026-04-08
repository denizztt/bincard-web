import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authApi } from '../services/apiService';
import { 
  storeTokens, 
  getAccessToken, 
  getRefreshToken, 
  clearTokens,
  isTokenExpiring,
  isTokenExpired,
  isUserInactive,
  hasValidSession,
  updateLastActivity,
  parseTokenExpiry,
  getDeviceInfo,
  getClientIP,
  getLocation
} from '../utils/tokenManager';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Refs for intervals and timeouts
  const tokenCheckInterval = useRef(null);
  const activityCheckInterval = useRef(null);
  const refreshTokenTimeout = useRef(null);
  const activityListeners = useRef([]);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
    setupActivityListeners();
    startTokenMonitoring();
    setupBeforeUnloadHandler();
    
    return () => {
      cleanup();
    };
  }, []);

  /**
   * Initialize authentication state from stored tokens
   */
  const initializeAuth = async () => {
    try {
      setLoading(true);
      console.log('🔐 Initializing authentication...');
      
      if (hasValidSession()) {
        const accessToken = getAccessToken();
        const userData = localStorage.getItem('userData');
        
        if (accessToken && userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            setUser(parsedUserData);
            setIsAuthenticated(true);
            updateLastActivity();
            
            console.log('✅ Valid session found, user authenticated');
            
            // Check if token needs immediate refresh
            if (isTokenExpiring(60)) { // 1 minute buffer
              console.log('🔄 Token expiring soon, refreshing...');
              await refreshTokenSilently();
            }
          } catch (error) {
            console.error('❌ Error parsing user data:', error);
            await performLogout();
          }
        } else {
          console.log('❌ Missing tokens or user data');
          await performLogout();
        }
      } else {
        console.log('❌ No valid session found');
        await performLogout();
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      await performLogout();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Start monitoring token expiry and user activity
   */
  const startTokenMonitoring = () => {
    // Check token expiry every 10 seconds
    tokenCheckInterval.current = setInterval(async () => {
      if (isAuthenticated) {
        // Check for inactivity (15 minutes)
        if (isUserInactive()) {
          console.log('⏰ User inactive for 15 minutes, logging out...');
          await performLogout();
          return;
        }

        // Check if token is expiring (30 seconds)
        if (isTokenExpiring(30)) {
          console.log('⚠️ Token expiring in 30 seconds, refreshing...');
          await refreshTokenSilently();
        }
      }
    }, 10000); // Check every 10 seconds

    // Check user activity every minute
    activityCheckInterval.current = setInterval(() => {
      if (isAuthenticated && isUserInactive()) {
        console.log('😴 User has been inactive, logging out...');
        performLogout();
      }
    }, 60000); // Check every minute
  };

  /**
   * Setup activity listeners to track user interactions
   */
  const setupActivityListeners = () => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      if (isAuthenticated) {
        updateLastActivity();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
      activityListeners.current.push({ event, handler: activityHandler });
    });
  };

  /**
   * Setup beforeunload handler for logout on page close
   */
  const setupBeforeUnloadHandler = () => {
    const handleBeforeUnload = async (event) => {
      if (isAuthenticated) {
        console.log('🚪 Page closing, performing logout...');
        
        // Try to logout (may not complete due to browser limitations)
        try {
          // Use sendBeacon for more reliable request on page unload
          if (navigator.sendBeacon) {
            const logoutData = JSON.stringify({});
            navigator.sendBeacon('/auth/logout', logoutData);
          } else {
            await authApi.logout();
          }
        } catch (error) {
          console.warn('⚠️ Could not complete logout on page unload:', error);
        }
        
        // Clear local tokens immediately
        clearTokens();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Also handle visibility change (tab close/switch)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isAuthenticated) {
        // Update last activity when tab becomes hidden
        updateLastActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  };

  /**
   * Refresh token silently without user interaction
   */
  const refreshTokenSilently = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Starting silent token refresh...');

      // Get device and location info
      const deviceInfo = getDeviceInfo();
      let ipAddress = '127.0.0.1';
      let location = { latitude: null, longitude: null };

      try {
        ipAddress = await getClientIP();
        location = await getLocation();
      } catch (error) {
        console.warn('⚠️ Could not get IP or location:', error);
      }

      const refreshData = {
        refreshToken,
        ipAddress,
        deviceInfo: deviceInfo.deviceInfo,
        deviceUuid: deviceInfo.deviceUuid,
        fcmToken: '', // Can be implemented for push notifications
        appVersion: deviceInfo.appVersion,
        platform: deviceInfo.platform,
        latitude: location.latitude,
        longitude: location.longitude
      };

      const response = await authApi.refreshToken(refreshData);

      if (response && response.token) {
        // Calculate expiry time from token
        const expiryTime = parseTokenExpiry(response.token) || new Date(Date.now() + 30 * 60 * 1000);
        
        // Store new tokens (encrypted)
        const stored = storeTokens(response.token, refreshToken, expiryTime);
        
        // ALSO store plain tokens for apiClient.js compatibility
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('token_expiry_time', expiryTime.getTime().toString());
        
        if (stored) {
          updateLastActivity();
          console.log('✅ Token refreshed successfully - expiry:', expiryTime.toISOString());
          return true;
        } else {
          throw new Error('Failed to store refreshed tokens');
        }
      } else {
        throw new Error('Invalid token response');
      }
    } catch (error) {
      console.error('❌ Silent token refresh failed:', error);
      await performLogout();
      return false;
    }
  };

  /**
   * Login function with enhanced token storage
   */
  const login = async (accessToken, refreshToken, userData) => {
    try {
      console.log('🔐 Starting login process...');
      console.log('📝 Storing tokens...');
      
      // Parse token expiry
      const expiryTime = parseTokenExpiry(accessToken) || new Date(Date.now() + 30 * 60 * 1000);
      
      // Store encrypted tokens (tokenManager)
      const stored = storeTokens(accessToken, refreshToken, expiryTime);
      
      // ALSO store plain tokens for apiClient.js & authService.js compatibility
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('token_expiry_time', expiryTime.getTime().toString());
      console.log('✅ Tokens stored (both encrypted & plain)');
      console.log('📅 Token expiry time:', expiryTime.toISOString(), '← KAYDEDILDI');
      
      if (stored) {
        // Store user data
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        updateLastActivity();
        
        console.log('✅ Login successful - Ready for API requests');
        return true;
      } else {
        throw new Error('Failed to store tokens securely');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  };

  /**
   * Logout function with API call
   */
  const logout = async () => {
    console.log('🚪 Starting logout process...');
    return await performLogout();
  };

  /**
   * Perform logout with API call and cleanup
   */
  const performLogout = async () => {
    try {
      // Call logout API if authenticated
      if (isAuthenticated) {
        try {
          await authApi.logout();
          console.log('✅ Logout API call successful');
        } catch (apiError) {
          console.warn('⚠️ Logout API call failed:', apiError);
          // Continue with local logout even if API fails
        }
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Clear all tokens (encrypted) and user data
      clearTokens();
      
      // ALSO clear plain tokens for apiClient.js compatibility
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout completed');
    }
  };

  /**
   * Get current valid access token (refresh if needed)
   */
  const getValidAccessToken = async () => {
    try {
      // Check if token is expired
      if (isTokenExpired()) {
        console.log('🔄 Token expired, refreshing...');
        const refreshSuccess = await refreshTokenSilently();
        if (!refreshSuccess) {
          return null;
        }
      }
      
      // Check if token is expiring soon
      if (isTokenExpiring(30)) {
        console.log('⚠️ Token expiring soon, refreshing...');
        await refreshTokenSilently();
      }
      
      updateLastActivity();
      return getAccessToken();
    } catch (error) {
      console.error('❌ Error getting valid access token:', error);
      return null;
    }
  };

  /**
   * Check if user session is still valid
   */
  const checkSession = () => {
    if (!isAuthenticated) return false;
    
    if (isUserInactive()) {
      console.log('⏰ Session expired due to inactivity');
      performLogout();
      return false;
    }
    
    return true;
  };

  /**
   * SMS Phone verification
   */
  const verifyPhone = async (telephone, code) => {
    console.log('📱 SMS VERIFICATION BAŞLADI:', { telephone, code });
    try {
      const response = await authApi.verifyPhone(telephone, code);
      console.log('✅ SMS VERIFICATION RESPONSE:', response);
      console.log('🔍 Full Response Structure:', {
        keys: Object.keys(response),
        hasAccessToken: 'accessToken' in response,
        hasRefreshToken: 'refreshToken' in response,
        hasToken: 'token' in response,
        hasData: 'data' in response,
        responseType: typeof response,
        isArray: Array.isArray(response)
      });
      console.log('🔑 Token Details:', {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        token: response.token,
        data: response.data,
        tokenExpiry: response.accessToken?.expiresAt,
        fullResponse: response
      });
      
      // Check different possible response formats
      let accessToken = null;
      let refreshToken = null;
      
      if (response.accessToken && response.refreshToken) {
        // Format 1: Direct token properties
        accessToken = response.accessToken;
        refreshToken = response.refreshToken;
      } else if (response.token) {
        // Format 2: Single token property
        accessToken = response.token;
        refreshToken = response.token; // Use same token as refresh token temporarily
      } else if (response.data && response.data.accessToken) {
        // Format 3: Nested in data property
        accessToken = response.data.accessToken;
        refreshToken = response.data.refreshToken;
      } else if (response.success && response.data) {
        // Format 4: Success with data
        accessToken = response.data.accessToken || response.data.token;
        refreshToken = response.data.refreshToken || response.data.token;
      }
      
              if (accessToken && refreshToken) {
          // Extract token strings from response objects
          const accessTokenString = typeof accessToken === 'string' ? accessToken : (accessToken.token || accessToken);
          const refreshTokenString = typeof refreshToken === 'string' ? refreshToken : (refreshToken.token || refreshToken);
          
          // Calculate expiry time from token string or use response expiresAt
          let expiryTime;
          if (response.accessToken?.expiresAt) {
            // Use backend-provided expiry time
            expiryTime = new Date(response.accessToken.expiresAt);
          } else if (response.data?.accessToken?.expiresAt) {
            // Use nested data expiry time
            expiryTime = new Date(response.data.accessToken.expiresAt);
          } else {
            // Fallback: parse from JWT token
            expiryTime = parseTokenExpiry(accessTokenString) || new Date(Date.now() + 30 * 60 * 1000);
          }
          
          console.log('🔧 Token extraction:', {
            accessTokenString: accessTokenString?.substring(0, 50) + '...',
            refreshTokenString: refreshTokenString?.substring(0, 50) + '...',
            expiryTime: expiryTime
          });
          
          // Store tokens using enhanced method
          const stored = storeTokens(accessTokenString, refreshTokenString, expiryTime);
        
        if (stored) {
          // Store user data
          const userData = { telephone };
          localStorage.setItem('userData', JSON.stringify(userData));
          
          setUser(userData);
          setIsAuthenticated(true);
          updateLastActivity();
          
          console.log('🎯 AUTH STATE UPDATED:', { isAuthenticated: true, user: userData });
          return { success: true, data: response };
        } else {
          throw new Error('Failed to store tokens securely');
        }
      } else {
        throw new Error('Invalid token response');
      }
         } catch (error) {
       console.error('❌ SMS VERIFICATION FAILED:', error);
       console.error('🔍 Verification Error Details:', {
         message: error.message,
         response: error.response,
         responseData: error.response?.data,
         status: error.response?.status,
         fullError: error
       });
       
       // Handle specific backend errors
       let errorMessage = 'Doğrulama sırasında bir hata oluştu';
       
       if (error.response?.data?.message) {
         // Backend'den gelen hata mesajını kullan
         errorMessage = error.response.data.message;
       } else if (error.response?.status === 400) {
         errorMessage = 'Geçersiz doğrulama kodu';
       } else if (error.response?.status === 404) {
         errorMessage = 'Telefon numarası bulunamadı';
       } else if (error.response?.status === 429) {
         errorMessage = 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.';
       } else if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
         errorMessage = 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
       }
       
       return { 
         success: false, 
         error: errorMessage
       };
     }
  };

  /**
   * Resend SMS verification code
   */
  const resendVerificationCode = async (telephone) => {
    console.log('📱 RESEND VERIFICATION CODE:', { telephone });
    try {
      const response = await authApi.resendVerificationCode(telephone);
      console.log('✅ RESEND RESPONSE:', response);
      return { success: true, message: response.message || 'Verification code sent successfully' };
    } catch (error) {
      console.error('❌ RESEND VERIFICATION FAILED:', error);
      console.error('🔍 Resend Error Details:', {
        message: error.message,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to resend code' 
      };
    }
  };

  /**
   * Cleanup intervals and listeners
   */
  const cleanup = () => {
    console.log('🧹 Cleaning up auth context...');
    
    if (tokenCheckInterval.current) {
      clearInterval(tokenCheckInterval.current);
    }
    if (activityCheckInterval.current) {
      clearInterval(activityCheckInterval.current);
    }
    if (refreshTokenTimeout.current) {
      clearTimeout(refreshTokenTimeout.current);
    }
    
    // Remove activity listeners
    activityListeners.current.forEach(({ event, handler }) => {
      document.removeEventListener(event, handler, true);
    });
    activityListeners.current = [];
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated,
    getValidAccessToken,
    refreshTokenSilently,
    checkSession,
    verifyPhone,
    resendVerificationCode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
