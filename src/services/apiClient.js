import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

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
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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
          const response = await refreshAccessToken(refreshToken);
          if (response.success) {
            const newAccessToken = response.data.accessToken.token;
            localStorage.setItem('accessToken', newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
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
    const response = await axios.post(`${BASE_URL}/v1/api/auth/refresh`, {
      refreshToken
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Token refresh failed'
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