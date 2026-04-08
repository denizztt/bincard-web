import apiClient from './apiClient';

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
  (response) => {
    console.log('✅ API RESPONSE OK:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase()
    });
    return response;
  },
  async (error) => {
    console.error('❌ API RESPONSE ERROR:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      responseData: error.response?.data
    });
    
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
      const response = await apiClient.post('/auth/login', {
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
      const response = await apiClient.post('/auth/phone-verify', {
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
      const response = await apiClient.post(`/auth/resend-verify-code?telephone=${telephone}`);
      
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
      const response = await apiClient.post(`/auth/refresh`, {
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

// authService exports `authService` only; apiClient is provided by src/services/apiClient.js
