import axios from 'axios';
import { getAccessToken } from '../utils/tokenManager';

const BASE_URL = 'https://bingolkart.com.tr/v1/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Prefer encrypted token, fall back to plain storage for compatibility
      let token = getAccessToken();
      if (!token) {
        token = localStorage.getItem('accessToken') || localStorage.getItem('encrypted_access_token');
      }

      console.log('🔍 REQUEST INTERCEPTOR (apiClient.js):', {
        url: config.url,
        method: config.method?.toUpperCase(),
        tokenExists: !!token,
        tokenPreview: typeof token === 'string' && token.length ? token.substring(0, 20) + '...' : 'NO TOKEN'
      });

      if (token) {
        config.headers = config.headers || {};
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Authorization header SET');
        } else {
          console.log('ℹ️ Authorization header already present');
        }
      } else {
        console.warn('⚠️ NO TOKEN FOUND - Authorization header NOT set');
      }
    } catch (err) {
      console.error('❌ Error in request interceptor token retrieval:', err);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token refresh for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
            const refreshRes = await refreshAccessToken(refreshToken);
            if (refreshRes.success && refreshRes.data) {
              const d = refreshRes.data;
              const newAccessToken = d?.accessToken?.token || d?.accessToken || d?.token || (d?.data && (d.data.accessToken || d.data.token));
              if (newAccessToken) {
                // store plain token for compatibility and set expiry if provided
                try {
                  localStorage.setItem('accessToken', newAccessToken);
                  if (d?.accessToken?.expiresAt) {
                    localStorage.setItem('token_expiry_time', new Date(d.accessToken.expiresAt).getTime().toString());
                  } else if (d?.data?.accessToken?.expiresAt) {
                    localStorage.setItem('token_expiry_time', new Date(d.data.accessToken.expiresAt).getTime().toString());
                  }
                } catch (e) {
                  console.warn('Could not persist refreshed token to localStorage', e);
                }

                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
              }
            }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    
    // Enhanced error logging
    if (error.response) {
      console.error('❌ API RESPONSE ERROR:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('❌ API REQUEST ERROR:', {
        message: 'No response received',
        url: error.config?.url,
        method: error.config?.method?.toUpperCase()
      });
    } else {
      console.error('❌ API ERROR:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase()
      });
    }
    
    return Promise.reject(error);
  }
);

// Refresh token function
const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await apiClient.post(`/auth/refresh`, {
      refreshToken
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Refresh token request failed:', error);
    return {
      success: false,
      error: error.response?.data || error.message || 'Token refresh failed'
    };
  }
};

// Generic API request methods
export const apiService = {
  // GET request
  async get(url, params = {}) {
    try {
      const response = await apiClient.get(url, { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed'
      };
    }
  },

  // POST request
  async post(url, data = {}) {
    try {
      const response = await apiClient.post(url, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed'
      };
    }
  },

  // PUT request
  async put(url, data = {}) {
    try {
      const response = await apiClient.put(url, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed'
      };
    }
  },

  // DELETE request
  async delete(url) {
    try {
      const response = await apiClient.delete(url);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed'
      };
    }
  },

  // Upload file
  async upload(url, file, additionalData = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add additional data to form
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });

      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Upload failed'
      };
    }
  }
};

export default apiClient; 
