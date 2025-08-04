// Token Management Utilities with Encryption
import CryptoJS from 'crypto-js';

// Encryption key - in production this should come from environment variables
const ENCRYPTION_KEY = 'your-secret-encryption-key-2024-secure';

// Token storage keys
const ACCESS_TOKEN_KEY = 'encrypted_access_token';
const REFRESH_TOKEN_KEY = 'encrypted_refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry_time';
const LAST_ACTIVITY_KEY = 'last_activity_time';

// Activity timeout (15 minutes in milliseconds)
const ACTIVITY_TIMEOUT = 15 * 60 * 1000;

/**
 * Encrypt data using AES encryption
 * @param {string} data - Data to encrypt
 * @returns {string} - Encrypted data
 */
const encryptData = (data) => {
  try {
    // Validate input data
    if (!data || typeof data !== 'string') {
      console.error('Invalid data for encryption:', { data: typeof data, length: data?.length });
      return null;
    }
    
    // Validate encryption key
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 16) {
      console.error('Invalid encryption key');
      return null;
    }
    
    console.log('🔐 Encrypting data:', { 
      dataType: typeof data, 
      dataLength: data.length,
      preview: data.substring(0, 20) + '...'
    });
    
    const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
    console.log('✅ Encryption successful:', { encryptedLength: encrypted.length });
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    console.error('Encryption error details:', {
      message: error.message,
      stack: error.stack,
      dataType: typeof data,
      dataLength: data?.length
    });
    return null;
  }
};

/**
 * Decrypt data using AES decryption
 * @param {string} encryptedData - Encrypted data to decrypt
 * @returns {string|null} - Decrypted data or null if failed
 */
const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Get device information
 * @returns {object} - Device information
 */
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const language = navigator.language;
  
  return {
    deviceInfo: `${platform} - ${userAgent}`,
    platform: platform,
    language: language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    deviceUuid: getOrCreateDeviceUUID(),
    appVersion: '1.0.0', // You can update this
    userAgent: userAgent
  };
};

/**
 * Get or create device UUID
 * @returns {string} - Device UUID
 */
const getOrCreateDeviceUUID = () => {
  let deviceUUID = localStorage.getItem('device_uuid');
  if (!deviceUUID) {
    deviceUUID = 'web-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('device_uuid', deviceUUID);
  }
  return deviceUUID;
};

/**
 * Get user's IP address (approximation using a service)
 * @returns {Promise<string>} - IP address
 */
const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Could not get IP address:', error);
    return '127.0.0.1';
  }
};

/**
 * Get user's location (if permission granted)
 * @returns {Promise<object>} - Location coordinates
 */
const getLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ latitude: null, longitude: null });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Location error:', error);
        resolve({ latitude: null, longitude: null });
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  });
};

/**
 * Store encrypted tokens
 * @param {string} accessToken - Access token
 * @param {string} refreshToken - Refresh token
 * @param {Date} expiryTime - Token expiry time
 */
const storeTokens = (accessToken, refreshToken, expiryTime) => {
  try {
    // Encrypt and store tokens
    const encryptedAccessToken = encryptData(accessToken);
    const encryptedRefreshToken = encryptData(refreshToken);
    
    if (encryptedAccessToken && encryptedRefreshToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, encryptedAccessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, encryptedRefreshToken);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.getTime().toString());
      updateLastActivity();
      
      console.log('Tokens stored successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error storing tokens:', error);
    return false;
  }
};

/**
 * Get decrypted access token
 * @returns {string|null} - Decrypted access token
 */
const getAccessToken = () => {
  try {
    const encryptedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!encryptedToken) return null;
    
    return decryptData(encryptedToken);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Get decrypted refresh token
 * @returns {string|null} - Decrypted refresh token
 */
const getRefreshToken = () => {
  try {
    const encryptedToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!encryptedToken) return null;
    
    return decryptData(encryptedToken);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Get token expiry time
 * @returns {Date|null} - Token expiry time
 */
const getTokenExpiry = () => {
  try {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return null;
    
    return new Date(parseInt(expiryTime));
  } catch (error) {
    console.error('Error getting token expiry:', error);
    return null;
  }
};

/**
 * Check if token is expired or expires within specified seconds
 * @param {number} bufferSeconds - Buffer time in seconds (default: 30)
 * @returns {boolean} - True if token is expired or expires soon
 */
const isTokenExpiring = (bufferSeconds = 30) => {
  const expiryTime = getTokenExpiry();
  if (!expiryTime) return true;
  
  const now = new Date();
  const bufferTime = bufferSeconds * 1000; // Convert to milliseconds
  
  return (expiryTime.getTime() - now.getTime()) <= bufferTime;
};

/**
 * Check if token is completely expired
 * @returns {boolean} - True if token is expired
 */
const isTokenExpired = () => {
  const expiryTime = getTokenExpiry();
  if (!expiryTime) return true;
  
  return new Date() >= expiryTime;
};

/**
 * Update last activity time
 */
const updateLastActivity = () => {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
};

/**
 * Get last activity time
 * @returns {Date|null} - Last activity time
 */
const getLastActivity = () => {
  try {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return null;
    
    return new Date(parseInt(lastActivity));
  } catch (error) {
    console.error('Error getting last activity:', error);
    return null;
  }
};

/**
 * Check if user has been inactive for too long (15 minutes)
 * @returns {boolean} - True if user is inactive for too long
 */
const isUserInactive = () => {
  const lastActivity = getLastActivity();
  if (!lastActivity) return true;
  
  const now = new Date();
  return (now.getTime() - lastActivity.getTime()) > ACTIVITY_TIMEOUT;
};

/**
 * Clear all stored tokens and session data
 */
const clearTokens = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    
    console.log('Tokens cleared successfully');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

/**
 * Check if user has valid session
 * @returns {boolean} - True if user has valid session
 */
const hasValidSession = () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  
  return !!(accessToken && refreshToken && !isUserInactive());
};

/**
 * Parse JWT token to get expiry time
 * @param {string} token - JWT token
 * @returns {Date|null} - Token expiry time
 */
const parseTokenExpiry = (token) => {
  try {
    if (!token) return null;
    
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // JWT exp is in seconds, convert to milliseconds
    if (payload.exp) {
      return new Date(payload.exp * 1000);
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing token expiry:', error);
    return null;
  }
};

export {
  // Storage functions
  storeTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  
  // Token validation functions
  isTokenExpired,
  isTokenExpiring,
  getTokenExpiry,
  parseTokenExpiry,
  
  // Activity tracking
  updateLastActivity,
  getLastActivity,
  isUserInactive,
  
  // Session management
  hasValidSession,
  
  // Device information
  getDeviceInfo,
  getClientIP,
  getLocation,
  
  // Encryption utilities
  encryptData,
  decryptData
};