import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { 
  ApiResponse, 
  PagedResponse, 
  TokenResponse,
  LoginResponse
} from '../types/index';
import type { News } from '../types';

// Base API configuration
const BASE_URL = 'http://localhost:8080/v1/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token refresh function
const refreshAccessToken = async (refreshToken: string): Promise<TokenResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

// Request interceptor to add auth token with automatic validation
apiClient.interceptors.request.use(
  async (config) => {
    console.log('🚀 API REQUEST:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      params: config.params
    });
    
    // Skip token validation for auth endpoints
    const isAuthEndpoint = config.url?.includes('/auth/');
    
    if (!isAuthEndpoint) {
      try {
        // Import token manager functions
        const { getAccessToken, isTokenExpired, isTokenExpiring } = await import('../utils/tokenManager.js');
        
        // Check if token is expired or expiring
        if (isTokenExpired()) {
          console.log('❌ Token expired, redirecting to login...');
          // Clear expired tokens
          const { clearTokens } = await import('../utils/tokenManager.js');
          clearTokens();
          
          // Redirect to login
          window.location.href = '/login';
          return Promise.reject(new Error('Token expired'));
        }
        
        // Get current token
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Token added to request');
          
          // Log warning if token is expiring soon
          if (isTokenExpiring(60)) {
            console.warn('⚠️ Token expiring soon (< 1 minute)');
          }
        } else {
          console.log('⚠️ No token found');
        }
      } catch (error) {
        console.error('❌ Token validation error:', error);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ REQUEST INTERCEPTOR ERROR:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced token management
apiClient.interceptors.response.use(
  async (response) => {
    console.log('✅ API RESPONSE SUCCESS:', {
      status: response.status,
      statusText: response.statusText,
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
      data: error.response?.data,
      message: error.message
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized request, clearing tokens and redirecting...');
      
        try {
          const { clearTokens } = await import('../utils/tokenManager.js');
          clearTokens();
        window.location.href = '/login';
      } catch (importError) {
        console.error('Failed to import token manager:', importError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Generic API service class
class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = apiClient;
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

const apiService = new ApiService();

// Auth API endpoints
export const authApi = {
  login: async (credentials: { telephone: string; password: string }): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/superadmin-login', credentials);
    return response.data;
  },

  verifyPhone: async (telephone: string, verificationCode: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/phone-verify', {
      code: verificationCode,
      deviceInfo: 'Web Browser',
      platform: 'Web',
      appVersion: '1.0.0',
      deviceUuid: 'web-' + Date.now(),
      fcmToken: '',
      latitude: null,
      longitude: null
    });
    console.log('🔍 Backend Response:', response.data);
    return response.data;
  },

  resendVerificationCode: async (telephone: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/auth/resend-verification-code', {
      telephone
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    return refreshAccessToken(refreshToken);
  },

  logout: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }
};

// News API endpoints
export const newsApi = {
  // Admin endpoints
  getAllNews: async (platform?: string, page: number = 0, size: number = 10): Promise<PagedResponse<News>> => {
    const params = new URLSearchParams();
    if (platform) params.append('platform', platform);
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await apiClient.get(`/news/?${params.toString()}`);
    return response.data;
  },

  getActiveNewsForAdmin: async (platform?: string, type?: string, page: number = 0, size: number = 10): Promise<PagedResponse<News>> => {
    const params = new URLSearchParams();
    if (platform) params.append('platform', platform);
    if (type) params.append('type', type);
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await apiClient.get(`/news/active-admin?${params.toString()}`);
    return response.data;
  },

  getNewsById: async (id: number): Promise<News> => {
    const response = await apiClient.get(`/news/admin/${id}`);
    return response.data;
  },

  createNews: async (formData: FormData): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/news/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updateNews: async (formData: FormData): Promise<ApiResponse<any>> => {
    const response = await apiClient.put('/news/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  softDeleteNews: async (id: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/news/${id}/soft-delete`);
    return response.data;
  },

  getNewsStatistics: async (page: number = 0, size: number = 10): Promise<PagedResponse<any>> => {
    const response = await apiClient.get(`/news/statistics?page=${page}&size=${size}`);
    return response.data;
  },

  getNewsByCategory: async (category: string, platform?: string, page: number = 0, size: number = 10): Promise<PagedResponse<News>> => {
    const params = new URLSearchParams();
    params.append('category', category);
    if (platform) params.append('platform', platform);
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await apiClient.get(`/news/admin/by-category?${params.toString()}`);
    return response.data;
  },

  getNewsBetweenDates: async (start: string, end: string, platform?: string, page: number = 0, size: number = 10): Promise<PagedResponse<News>> => {
    const params = new URLSearchParams();
    params.append('start', start);
    params.append('end', end);
    if (platform) params.append('platform', platform);
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await apiClient.get(`/news/between-dates?${params.toString()}`);
    return response.data;
  },

  // Legacy methods for backward compatibility
  getNews: async (page: number = 0, size: number = 10): Promise<PagedResponse<News>> => {
    return newsApi.getAllNews(undefined, page, size);
  },

  deleteNews: async (id: number): Promise<void> => {
    await newsApi.softDeleteNews(id);
  }
};

// Dashboard API endpoints
export const dashboardApi = {
  getStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },

  getRecentActivities: async () => {
    const response = await apiClient.get('/dashboard/recent-activities');
    return response.data;
  }
};

// Health API endpoints
export const healthApi = {
  getHealthStatus: async () => {
    const response = await apiClient.get('/health/status');
    return response.data;
  },
  getDatabaseDetails: async () => {
    const response = await apiClient.get('/health/database-details');
    return response.data;
  },
  getSecurityAudit: async () => {
    const response = await apiClient.get('/health/security-audit');
    return response.data;
  }
};

// Reports API endpoints
export const reportsApi = {
  getDailyReport: async (date: string) => {
    const response = await apiClient.get(`/reports/daily?date=${date}`);
    return response.data;
  },

  getWeeklyReport: async (week: string) => {
    const response = await apiClient.get(`/reports/weekly?week=${week}`);
    return response.data;
  },

  getMonthlyReport: async (month: string) => {
    const response = await apiClient.get(`/reports/monthly?month=${month}`);
    return response.data;
  }
};

// Feedback API endpoints
export const feedbackApi = {
  getAllFeedback: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/feedback?page=${page}&size=${size}`);
    return response.data;
  },

  getFeedbackById: async (id: number) => {
    const response = await apiClient.get(`/feedback/${id}`);
    return response.data;
  },

  deleteFeedback: async (id: number) => {
    const response = await apiClient.delete(`/feedback/${id}`);
    return response.data;
  }
};

// Station API endpoints
export const stationApi = {
  getAllStations: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/stations?page=${page}&size=${size}`);
    return response.data;
  },

  getStationById: async (id: number) => {
    const response = await apiClient.get(`/stations/${id}`);
    return response.data;
  },

  createStation: async (stationData: any) => {
    const response = await apiClient.post('/stations', stationData);
    return response.data;
  },

  updateStation: async (id: number, stationData: any) => {
    const response = await apiClient.put(`/stations/${id}`, stationData);
    return response.data;
  },

  deleteStation: async (id: number) => {
    const response = await apiClient.delete(`/stations/${id}`);
    return response.data;
  }
};

// Payment Point API endpoints
export const paymentPointApi = {
  getAllPaymentPoints: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/payment-points?page=${page}&size=${size}`);
    return response.data;
  },

  getPaymentPointById: async (id: number) => {
    const response = await apiClient.get(`/payment-points/${id}`);
    return response.data;
  },

  createPaymentPoint: async (paymentPointData: any) => {
    const response = await apiClient.post('/payment-points', paymentPointData);
    return response.data;
  },

  updatePaymentPoint: async (id: number, paymentPointData: any) => {
    const response = await apiClient.put(`/payment-points/${id}`, paymentPointData);
    return response.data;
  },

  deletePaymentPoint: async (id: number) => {
    const response = await apiClient.delete(`/payment-points/${id}`);
    return response.data;
  }
};

// Bus API endpoints
export const busApi = {
  getAllBuses: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/bus/all?page=${page}&size=${size}`);
    return response.data;
  },

  getBusById: async (id: number) => {
    const response = await apiClient.get(`/bus/${id}`);
    return response.data;
  },

  searchBuses: async (searchParams: any) => {
    const response = await apiClient.get('/bus/search', { params: searchParams });
    return response.data;
  },

  getBusesByStatus: async (status: string, page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/bus/status/${status}?page=${page}&size=${size}`);
    return response.data;
  },

  createBus: async (busData: any) => {
    const response = await apiClient.post('/bus', busData);
    return response.data;
  },

  updateBus: async (id: number, busData: any) => {
    const response = await apiClient.put(`/bus/${id}`, busData);
    return response.data;
  },

  deleteBus: async (id: number) => {
    const response = await apiClient.delete(`/bus/${id}`);
    return response.data;
  },

  toggleActiveStatus: async (id: number) => {
    const response = await apiClient.patch(`/bus/${id}/toggle-active`);
    return response.data;
  },

  bulkActivate: async (busIds: number[]) => {
    const response = await apiClient.patch('/bus/bulk-activate', { busIds });
    return response.data;
  },

  bulkDeactivate: async (busIds: number[]) => {
    const response = await apiClient.patch('/bus/bulk-deactivate', { busIds });
    return response.data;
  }
};

// Driver API endpoints
export const driverApi = {
  getAllDrivers: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/drivers?page=${page}&size=${size}`);
    return response.data;
  },

  getDriverById: async (id: number) => {
    const response = await apiClient.get(`/drivers/${id}`);
    return response.data;
  },

  searchDrivers: async (searchTerm: string, page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/drivers/search?q=${searchTerm}&page=${page}&size=${size}`);
    return response.data;
  },

  createDriver: async (driverData: any) => {
    const response = await apiClient.post('/drivers', driverData);
    return response.data;
  },

  updateDriver: async (id: number, driverData: any) => {
    const response = await apiClient.put(`/drivers/${id}`, driverData);
    return response.data;
  },

  deleteDriver: async (id: number) => {
    const response = await apiClient.delete(`/drivers/${id}`);
    return response.data;
  }
};

// Route API endpoints
export const routeApi = {
  getAllRoutes: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/routes?page=${page}&size=${size}`);
    return response.data;
  },

  getRouteById: async (id: number) => {
    const response = await apiClient.get(`/routes/${id}`);
    return response.data;
  },

  searchRoutes: async (searchTerm: string, page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/routes/search?q=${searchTerm}&page=${page}&size=${size}`);
    return response.data;
  },

  createRoute: async (routeData: any) => {
    const response = await apiClient.post('/routes', routeData);
    return response.data;
  },

  updateRoute: async (id: number, routeData: any) => {
    const response = await apiClient.put(`/routes/${id}`, routeData);
    return response.data;
  },

  deleteRoute: async (id: number) => {
    const response = await apiClient.delete(`/routes/${id}`);
    return response.data;
  }
};

// Wallet API endpoints
export const walletApi = {
  getAllWallets: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/wallets?page=${page}&size=${size}`);
    return response.data;
  },

  getWalletById: async (id: number) => {
    const response = await apiClient.get(`/wallets/${id}`);
    return response.data;
  },

  searchWallets: async (searchTerm: string, page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/wallets/search?q=${searchTerm}&page=${page}&size=${size}`);
    return response.data;
  },

  updateWalletStatus: async (id: number, status: string) => {
    const response = await apiClient.patch(`/wallets/${id}/status`, { status });
    return response.data;
  },

  getWalletTransfers: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/wallet-transfers?page=${page}&size=${size}`);
    return response.data;
  },

  createTransfer: async (transferData: any) => {
    const response = await apiClient.post('/wallet-transfers', transferData);
    return response.data;
  }
};

// Admin API endpoints
export const adminApi = {
  getAdminApprovals: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/admin/approvals?page=${page}&size=${size}`);
    return response.data;
  },

  approveRequest: async (id: number) => {
    const response = await apiClient.patch(`/admin/approvals/${id}/approve`);
    return response.data;
  },

  rejectRequest: async (id: number, reason: string) => {
    const response = await apiClient.patch(`/admin/approvals/${id}/reject`, { reason });
    return response.data;
  },

  getIdentityRequests: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/admin/identity-requests?page=${page}&size=${size}`);
    return response.data;
  }
};

// Analytics API endpoints
export const analyticsApi = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  },

  getUserAnalytics: async (timeRange: string = '7d') => {
    const response = await apiClient.get(`/analytics/users?range=${timeRange}`);
    return response.data;
  },

  getTransactionAnalytics: async (timeRange: string = '7d') => {
    const response = await apiClient.get(`/analytics/transactions?range=${timeRange}`);
    return response.data;
  },

  getRevenueAnalytics: async (timeRange: string = '7d') => {
    const response = await apiClient.get(`/analytics/revenue?range=${timeRange}`);
    return response.data;
  },

  getSystemPerformance: async () => {
    const response = await apiClient.get('/analytics/system-performance');
    return response.data;
  }
};

// Statistics API endpoints
export const statisticsApi = {
  getGeneralStats: async () => {
    const response = await apiClient.get('/statistics/general');
    return response.data;
  },

  getUserStats: async () => {
    const response = await apiClient.get('/statistics/users');
    return response.data;
  },

  getTransactionStats: async () => {
    const response = await apiClient.get('/statistics/transactions');
    return response.data;
  },

  getSystemStats: async () => {
    const response = await apiClient.get('/statistics/system');
    return response.data;
  }
};

// Audit API endpoints
export const auditApi = {
  getAuditLogs: async (page: number = 0, size: number = 10, filters?: any) => {
    const response = await apiClient.get('/audit-logs', {
      params: { page, size, ...filters }
    });
    return response.data;
  },

  getAuditLogById: async (id: number) => {
    const response = await apiClient.get(`/audit-logs/${id}`);
    return response.data;
  },

  exportAuditLogs: async (filters?: any) => {
    const response = await apiClient.get('/audit-logs/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
};

// Contract API endpoints
export const contractApi = {
  // Admin Contract Management
  createContract: async (contractData: any) => {
    const response = await apiClient.post('/admin/contract/contracts', contractData);
    return response.data;
  },

  updateContract: async (contractId: number, contractData: any) => {
    const response = await apiClient.put(`/admin/contract/contracts/${contractId}`, contractData);
    return response.data;
  },

  deactivateContract: async (contractId: number) => {
    const response = await apiClient.patch(`/admin/contract/contracts/${contractId}/deactivate`);
    return response.data;
  },

  activateContract: async (contractId: number) => {
    const response = await apiClient.patch(`/admin/contract/contracts/${contractId}/activate`);
    return response.data;
  },

  getAllContracts: async () => {
    const response = await apiClient.get('/admin/contract/contracts');
    return response.data;
  },

  getActiveContracts: async () => {
    const response = await apiClient.get('/admin/contract/contracts/active');
    return response.data;
  },

  getContractById: async (contractId: number) => {
    const response = await apiClient.get(`/admin/contract/contracts/${contractId}`);
    return response.data;
  },

  getContractsByType: async (contractType: string) => {
    const response = await apiClient.get(`/admin/contract/contracts/type/${contractType}`);
    return response.data;
  },

  getUserAcceptedContracts: async (username: string) => {
    const response = await apiClient.get(`/admin/contract/users/${username}/accepted-contracts`);
    return response.data;
  },

  checkUserMandatoryStatus: async (username: string) => {
    const response = await apiClient.get(`/admin/contract/users/${username}/mandatory-status`);
    return response.data;
  }
};

// Admin Approvals API endpoints
export const adminApprovalsApi = {
  getAdminApprovals: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/admin/approvals?page=${page}&size=${size}`);
    return response.data;
  },

  approveRequest: async (id: number) => {
    const response = await apiClient.patch(`/admin/approvals/${id}/approve`);
    return response.data;
  },

  rejectRequest: async (id: number, reason: string) => {
    const response = await apiClient.patch(`/admin/approvals/${id}/reject`, { reason });
    return response.data;
  }
};

// Wallets API endpoints
export const walletsApi = {
  getAllWallets: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/wallets?page=${page}&size=${size}`);
    return response.data;
  },

  getWalletById: async (id: number) => {
    const response = await apiClient.get(`/wallets/${id}`);
    return response.data;
  },

  searchWallets: async (searchTerm: string, page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/wallets/search?q=${searchTerm}&page=${page}&size=${size}`);
    return response.data;
  },

  updateWalletStatus: async (id: number, status: string) => {
    const response = await apiClient.patch(`/wallets/${id}/status`, { status });
    return response.data;
  }
};

// Audit Logs API endpoints
export const auditLogsApi = {
  getAuditLogs: async (page: number = 0, size: number = 10, filters?: any) => {
    const response = await apiClient.get('/audit-logs', {
      params: { page, size, ...filters }
    });
    return response.data;
  },

  getAuditLogById: async (id: number) => {
    const response = await apiClient.get(`/audit-logs/${id}`);
    return response.data;
  },

  exportAuditLogs: async (filters?: any) => {
    const response = await apiClient.get('/audit-logs/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
};

// Identity Requests API endpoints
export const identityRequestsApi = {
  getIdentityRequests: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/admin/identity-requests?page=${page}&size=${size}`);
    return response.data;
  },

  approveIdentityRequest: async (id: number) => {
    const response = await apiClient.patch(`/admin/identity-requests/${id}/approve`);
    return response.data;
  },

  rejectIdentityRequest: async (id: number, reason: string) => {
    const response = await apiClient.patch(`/admin/identity-requests/${id}/reject`, { reason });
    return response.data;
  }
};

// Wallet Stats API endpoints
export const walletStatsApi = {
  getWalletStats: async () => {
    const response = await apiClient.get('/statistics/wallets');
    return response.data;
  },

  getWalletStatsByPeriod: async (period: string) => {
    const response = await apiClient.get(`/statistics/wallets/period/${period}`);
    return response.data;
  },

  getWalletStatsByStatus: async (status: string) => {
    const response = await apiClient.get(`/statistics/wallets/status/${status}`);
    return response.data;
  }
};

// Wallet Status API endpoints
export const walletStatusApi = {
  updateWalletStatus: async (id: number, status: string) => {
    const response = await apiClient.patch(`/wallets/${id}/status`, { status });
    return response.data;
  },

  getWalletStatusHistory: async (id: number) => {
    const response = await apiClient.get(`/wallets/${id}/status-history`);
    return response.data;
  },

  bulkUpdateWalletStatus: async (walletIds: number[], status: string) => {
    const response = await apiClient.patch('/wallets/bulk-status-update', { walletIds, status });
    return response.data;
  }
};

// Wallet Transfers API endpoints
export const walletTransfersApi = {
  getWalletTransfers: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/wallet-transfers?page=${page}&size=${size}`);
    return response.data;
  },

  getTransferById: async (id: number) => {
    const response = await apiClient.get(`/wallet-transfers/${id}`);
    return response.data;
  },

  createTransfer: async (transferData: any) => {
    const response = await apiClient.post('/wallet-transfers', transferData);
    return response.data;
  },

  updateTransfer: async (id: number, transferData: any) => {
    const response = await apiClient.put(`/wallet-transfers/${id}`, transferData);
    return response.data;
  },

  deleteTransfer: async (id: number) => {
    const response = await apiClient.delete(`/wallet-transfers/${id}`);
    return response.data;
  }
};

export default apiService; 