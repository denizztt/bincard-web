import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await authService.refreshToken(refreshToken);
          if (response.success) {
            localStorage.setItem('accessToken', response.data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
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
    
    return Promise.reject(error);
  }
);

export const authService = {
  async login(telephone, password) {
    try {
      const response = await apiClient.post('/v1/api/auth/login', {
        telephone,
        password
      });
      
      // Check the API's success field from the response
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Login failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  },

  async verifyPhone(code, telephone) {
    try {
      const response = await apiClient.post('/v1/api/auth/phone-verify', {
        code
      });
      
      // Check if the response contains tokens (successful verification)
      if (response.data && (response.data.accessToken || response.data.success)) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Phone verification failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Phone verification failed'
      };
    }
  },

  async resendVerificationCode(telephone) {
    try {
      const response = await apiClient.post(`/v1/api/auth/resend-verify-code?telephone=${telephone}`);
      
      // Check the API's success field from the response
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Failed to resend verification code'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to resend verification code'
      };
    }
  },

  async refreshToken(refreshToken) {
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
  }
};

export default apiClient;