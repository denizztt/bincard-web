import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { 
  ApiResponse, 
  PagedResponse, 
  News, 
  TokenResponse,
  LoginResponse
} from '../types';

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

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API REQUEST:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      params: config.params,
      headers: config.headers
    });
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token eklendi:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ Token bulunamadı');
    }
    return config;
  },
  (error) => {
    console.error('❌ REQUEST INTERCEPTOR ERROR:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API RESPONSE SUCCESS:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  async (error) => {
    console.error('❌ API RESPONSE ERROR:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      responseData: error.response?.data,
      message: error.message,
      fullError: error
    });
    
    const original = error.config;
    
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const tokenResponse = await refreshAccessToken(refreshToken);
          
          // Update stored tokens
          localStorage.setItem('accessToken', tokenResponse.accessToken.token);
          localStorage.setItem('refreshToken', tokenResponse.refreshToken.token);
          
          // Retry original request with new token
          original.headers.Authorization = `Bearer ${tokenResponse.accessToken.token}`;
          return apiClient(original);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Generic API service
export const apiService = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },

  async upload<T>(url: string, formData: FormData, method: 'POST' | 'PUT' = 'POST'): Promise<T> {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    const response = method === 'POST' 
      ? await apiClient.post<T>(url, formData, config)
      : await apiClient.put<T>(url, formData, config);
    
    return response.data;
  }
};

// News API endpoints (updated from ApiClientFX.java)
export const newsApi = {
  // Get all news with optional platform filter
  async getAllNews(platform?: string): Promise<PagedResponse<News>> {
    const params = new URLSearchParams();
    if (platform && platform !== 'Tümü') {
      params.append('platform', platform);
    }
    
    const endpoint = params.toString() ? `/news/?${params.toString()}` : '/news/';
    const response = await apiService.get<PagedResponse<News>>(endpoint);
    return response;
  },

  // Get news between specific dates
  async getNewsBetweenDates(
    startDate: string, // YYYY-MM-DD format
    endDate: string,   // YYYY-MM-DD format
    platform?: string,
    page = 0,
    size = 100
  ): Promise<PagedResponse<News>> {
    const params = new URLSearchParams({
      start: startDate,
      end: endDate,
      page: page.toString(),
      size: size.toString()
    });
    
    if (platform && platform !== 'Tümü') {
      params.append('platform', platform);
    }
    
    const response = await apiService.get<PagedResponse<News>>(`/news/between-dates?${params.toString()}`);
    return response;
  },

  // Create news with image upload (multipart/form-data)
  async createNews(data: {
    title: string;
    content: string;
    image?: File | null;
    startDate: string; // ISO date string
    endDate?: string;  // ISO date string
    platform: string;
    priority: string;
    type: string;
    allowFeedback: boolean;
  }): Promise<ApiResponse<News>> {
    const formData = new FormData();
    
    // Required fields
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('startDate', data.startDate);
    formData.append('platform', data.platform);
    formData.append('priority', data.priority);
    formData.append('type', data.type);
    formData.append('allowFeedback', data.allowFeedback.toString());
    
    // Optional fields
    if (data.endDate) {
      formData.append('endDate', data.endDate);
    }
    
    if (data.image) {
      formData.append('image', data.image);
    }
    
    const response = await apiService.upload<ApiResponse<News>>('/news/create', formData);
    return response;
  },

  // Create simple news without image (JSON)
  async createSimpleNews(data: {
    title: string;
    content: string;
    platform: string;
    author?: string;
  }): Promise<ApiResponse<News>> {
    const payload = {
      ...data,
      priority: 'NORMAL',
      type: 'DUYURU',
      allowFeedback: true
    };
    
    const response = await apiService.post<ApiResponse<News>>('/news/create', payload);
    return response;
  },

  // Update news with optional image upload (multipart/form-data)
  async updateNews(data: {
    id: number;
    title?: string;
    content?: string;
    image?: File | null;
    startDate?: string;
    endDate?: string;
    platform?: string;
    priority?: string;
    type?: string;
    allowFeedback?: boolean;
    active?: boolean;
  }): Promise<ApiResponse<News>> {
    const formData = new FormData();
    
    // ID is required
    formData.append('id', data.id.toString());
    
    // Add only non-null/undefined fields
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.content !== undefined) formData.append('content', data.content);
    if (data.startDate !== undefined) formData.append('startDate', data.startDate);
    if (data.endDate !== undefined) formData.append('endDate', data.endDate);
    if (data.platform !== undefined) formData.append('platform', data.platform);
    if (data.priority !== undefined) formData.append('priority', data.priority);
    if (data.type !== undefined) formData.append('type', data.type);
    if (data.allowFeedback !== undefined) formData.append('allowFeedback', data.allowFeedback.toString());
    if (data.active !== undefined) formData.append('active', data.active.toString());
    
    if (data.image) {
      formData.append('image', data.image);
    }
    
    const response = await apiService.upload<ApiResponse<News>>('/news/update', formData, 'PUT');
    return response;
  },

  // Soft delete news (set active = false)
  async softDeleteNews(id: number): Promise<ApiResponse<{ message: string }>> {
    const response = await apiService.put<ApiResponse<{ message: string }>>(`/news/${id}/soft-delete`, {});
    return response;
  },

  // Delete news permanently
  async deleteNews(id: number): Promise<ApiResponse<{ message: string }>> {
    const response = await apiService.delete<ApiResponse<{ message: string }>>(`/news/${id}`);
    return response;
  }
};

// Payment Point API endpoints
export const paymentPointApi = {
  // Get all payment points with pagination
  async getAllPaymentPoints(page = 0, size = 10, sort = 'name'): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort
    });
    const response = await apiService.get<ApiResponse<any>>(`/payment-point?${params.toString()}`);
    return response;
  },

  // Get payment point by ID
  async getPaymentPointById(id: number): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(`/payment-point/${id}`);
    return response;
  },

  // Create payment point
  async createPaymentPoint(data: {
    name: string;
    location: {
      latitude: number;
      longitude: number;
    };
    address: {
      city: string;
      district: string;
      street: string;
      postalCode?: string;
      fullAddress: string;
    };
    contactNumber?: string;
    workingHours?: string;
    paymentMethods: string[];
    description?: string;
    active?: boolean;
  }): Promise<ApiResponse<any>> {
    const response = await apiService.post<ApiResponse<any>>('/payment-point', data);
    return response;
  },

  // Update payment point
  async updatePaymentPoint(id: number, data: {
    name: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    address?: {
      city: string;
      district: string;
      street: string;
      postalCode?: string;
      fullAddress: string;
    };
    contactNumber?: string;
    workingHours?: string;
    paymentMethods: string[];
    description?: string;
    active?: boolean;
  }): Promise<ApiResponse<any>> {
    const response = await apiService.put<ApiResponse<any>>(`/payment-point/${id}`, data);
    return response;
  },

  // Search payment points
  async searchPaymentPoints(query: string, latitude: number, longitude: number, page = 0, size = 10): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      query,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      page: page.toString(),
      size: size.toString()
    });
    const response = await apiService.post<ApiResponse<any>>(`/payment-point/search?${params.toString()}`);
    return response;
  },

  // Toggle payment point status
  async togglePaymentPointStatus(id: number, active: boolean): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      active: active.toString()
    });
    const response = await apiServiceExtended.patch<ApiResponse<any>>(`/payment-point/${id}/status?${params.toString()}`);
    return response;
  },

  // Delete payment point
  async deletePaymentPoint(id: number): Promise<ApiResponse<any>> {
    const response = await apiService.delete<ApiResponse<any>>(`/payment-point/${id}`);
    return response;
  },

  // Add photos to payment point
  async addPaymentPointPhotos(id: number, files: File[]): Promise<ApiResponse<any>> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await apiService.upload<ApiResponse<any>>(`/payment-point/${id}/photos`, formData);
    return response;
  },

  // Delete photo from payment point
  async deletePaymentPointPhoto(id: number, photoId: number): Promise<ApiResponse<any>> {
    const response = await apiService.delete<ApiResponse<any>>(`/payment-point/${id}/photos/${photoId}`);
    return response;
  }
};

// Superadmin API endpoints (from ApiClientFX.java)
export const superadminApi = {
  // Get pending admin requests
  async getPendingAdminRequests(page = 0, size = 20): Promise<PagedResponse<any>> {
    const response = await apiService.get<PagedResponse<any>>(`/superadmin/admin-requests/pending?page=${page}&size=${size}&sort=createdAt&direction=DESC`);
    return response;
  },

  // Approve admin request
  async approveAdminRequest(adminId: number): Promise<ApiResponse<any>> {
    const response = await apiService.post<ApiResponse<any>>(`/superadmin/admin-requests/${adminId}/approve`, {});
    return response;
  },

  // Reject admin request
  async rejectAdminRequest(adminId: number): Promise<ApiResponse<any>> {
    const response = await apiService.post<ApiResponse<any>>(`/superadmin/admin-requests/${adminId}/reject`, {});
    return response;
  },

  // Get income summary
  async getIncomeSummary(): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>('/superadmin/income-summary');
    return response;
  },

  // Get daily bus income
  async getDailyBusIncome(date: string): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(`/superadmin/bus-income/daily?date=${date}`);
    return response;
  },

  // Get weekly bus income
  async getWeeklyBusIncome(startDate: string, endDate: string): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(`/superadmin/bus-income/weekly?startDate=${startDate}&endDate=${endDate}`);
    return response;
  },

  // Get monthly bus income
  async getMonthlyBusIncome(year: number, month: number): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(`/superadmin/bus-income/monthly?year=${year}&month=${month}`);
    return response;
  },

  // Get audit logs
  async getAuditLogs(fromDate?: string, toDate?: string, action?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (action) params.append('action', action);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/superadmin/audit-logs?${queryString}` : '/superadmin/audit-logs';
    
    const response = await apiService.get<ApiResponse<any>>(endpoint);
    return response;
  }
};

// Wallet API endpoints (from ApiClientFX.java)
export const walletApi = {
  // Update wallet status
  async updateWalletStatus(isActive: boolean): Promise<ApiResponse<any>> {
    const response = await apiService.put<ApiResponse<any>>(`/wallet/toggleWalletStatus?isActive=${isActive}`, {});
    return response;
  },

  // Get all wallets
  async getAllWallets(page = 0, size = 20): Promise<PagedResponse<any>> {
    const response = await apiService.get<PagedResponse<any>>(`/wallet/admin/all?page=${page}&size=${size}&sort=id,desc`);
    return response;
  },

  // Download transfer Excel
  async downloadTransferExcel(): Promise<Blob> {
    const response = await apiClient.get('/wallet/admin/export/transactions/excel', {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Feedback API endpoints (from FeedbackApiClient.java)
export const feedbackApi = {
  // Get all feedbacks with filtering and pagination
  async getAllFeedbacks(params: {
    page?: number;
    size?: number;
    sort?: string; // "submittedAt,desc"
    type?: string; // "Tümü" or FeedbackType
    source?: string; // "Tümü" or FeedbackSource  
    start?: string; // YYYY-MM-DD format
    end?: string; // YYYY-MM-DD format
  } = {}): Promise<PagedResponse<any>> {
    const searchParams = new URLSearchParams();
    
    // Default values
    searchParams.append('page', (params.page || 0).toString());
    searchParams.append('size', (params.size || 20).toString());
    searchParams.append('sort', params.sort || 'submittedAt,desc');
    
    // Optional filters
    if (params.type && params.type !== 'Tümü') {
      searchParams.append('type', params.type);
    }
    if (params.source && params.source !== 'Tümü') {
      searchParams.append('source', params.source);
    }
    if (params.start) {
      searchParams.append('start', params.start);
    }
    if (params.end) {
      searchParams.append('end', params.end);
    }
    
    const response = await apiService.get<PagedResponse<any>>(`/feedback/admin/all?${searchParams.toString()}`);
    return response;
  },

  // Get feedback by ID
  async getFeedbackById(id: number): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(`/feedback/admin/${id}`);
    return response;
  }
};

// Station API endpoints
export const stationApi = {
  // Create new station
  async createStation(data: {
    name: string;
    latitude: number;
    longitude: number;
    type: string; // StationType enum
    city: string;
    district: string;
    street: string;
    postalCode?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiService.post<ApiResponse<any>>('/station', data);
    return response;
  },

  // Get station by ID
  async getStationById(id: number): Promise<ApiResponse<any>> {
    const response = await apiService.get<ApiResponse<any>>(`/station/${id}`);
    return response;
  },

  // Update station
  async updateStation(data: {
    id: number;
    name?: string;
    latitude?: number;
    longitude?: number;
    type?: string;
    city?: string;
    district?: string;
    street?: string;
    postalCode?: string;
    active?: boolean;
  }): Promise<ApiResponse<any>> {
    const response = await apiService.put<ApiResponse<any>>('/station', data);
    return response;
  },

  // Change station status
  async changeStationStatus(id: number, active: boolean): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      active: active.toString()
    });
    const response = await apiServiceExtended.patch<ApiResponse<any>>(`/station/${id}/status?${params.toString()}`);
    return response;
  },

  // Delete station
  async deleteStation(id: number): Promise<ApiResponse<any>> {
    const response = await apiService.delete<ApiResponse<any>>(`/station/${id}`);
    return response;
  },

  // Get all stations with location-based filtering
  async getAllStations(
    latitude: number, 
    longitude: number, 
    type?: string, 
    page = 0, 
    size = 10
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      page: page.toString(),
      size: size.toString()
    });
    
    if (type && type !== 'ALL') {
      params.append('type', type);
    }
    
    const response = await apiService.get<ApiResponse<any>>(`/station?${params.toString()}`);
    return response;
  },

  // Search stations by name
  async searchStationsByName(name: string, page = 0, size = 10): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      name: name,
      page: page.toString(),
      size: size.toString()
    });
    
    const response = await apiService.get<ApiResponse<any>>(`/station/search?${params.toString()}`);
    return response;
  },

  // Get matching keywords for search suggestions
  async getMatchingKeywords(query: string): Promise<Set<string>> {
    const params = new URLSearchParams({
      query: query
    });
    
    const response = await apiService.get<Set<string>>(`/station/keywords?${params.toString()}`);
    return response;
  },

  // Search nearby stations (legacy compatibility)
  async searchNearbyStations(location: {
    latitude: number;
    longitude: number;
    type?: string;
  }, page: number = 0, size: number = 20): Promise<ApiResponse<any>> {
    return this.getAllStations(location.latitude, location.longitude, location.type, page, size);
  }
};

// Add PATCH method to apiService
export const apiServiceExtended = {
  ...apiService,
  
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  }
};

// Auth API endpoints (from AuthApiClient.java)
export const authApi = {
  // Superadmin signup
  async signup(data: {
    name: string;
    surname: string;
    telephone: string;
    password: string;
    email: string;
  }): Promise<LoginResponse> {
    // Add device and IP info automatically
    const deviceInfo = navigator.userAgent.substring(0, 50);
    const ipAddress = '127.0.0.1'; // Will be detected by backend
    
    const payload = {
      ...data,
      ipAddress,
      deviceInfo,
      appVersion: '1.0',
      platform: 'WEB'
    };
    
    const response = await apiClient.post('/auth/superadmin-signup', payload);
    return response.data;
  },

  // Superadmin login (returns success message, triggers SMS)
  async login(data: {
    telephone: string;
    password: string;
  }): Promise<LoginResponse> {
    const deviceInfo = navigator.userAgent.substring(0, 50);
    const ipAddress = '127.0.0.1'; // Will be detected by backend
    
    const payload = {
      ...data,
      ipAddress,
      deviceInfo,
      appVersion: '1.0',
      platform: 'WEB'
    };
    
    const response = await apiClient.post('/auth/superadmin-login', payload);
    return response.data;
  },

  // Phone verification (returns tokens)
  async phoneVerify(data: {
    telephone: string;
    code: string;
  }): Promise<TokenResponse> {
    const deviceInfo = navigator.userAgent.substring(0, 50);
    const ipAddress = '127.0.0.1'; // Will be detected by backend
    
    const payload = {
      ...data,
      ipAddress,
      deviceInfo,
      appVersion: '1.0',
      platform: 'WEB'
    };
    
    const response = await apiClient.post('/auth/phone-verify', payload);
    
    // Store tokens in localStorage
    if (response.data.accessToken && response.data.refreshToken) {
      localStorage.setItem('accessToken', response.data.accessToken.token);
      localStorage.setItem('refreshToken', response.data.refreshToken.token);
      localStorage.setItem('accessTokenExpiry', response.data.accessToken.expiresAt);
      localStorage.setItem('refreshTokenExpiry', response.data.refreshToken.expiresAt);
    }
    
    return response.data;
  },

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const payload = { refreshToken };
    const response = await apiClient.post('/auth/refresh', payload);
    
    // Update stored access token
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken.token);
      localStorage.setItem('accessTokenExpiry', response.data.accessToken.expiresAt);
    }
    
    return response.data;
  },

  // Resend verification code
  async resendVerificationCode(telephone: string): Promise<ApiResponse<{ message: string }>> {
    const url = `/auth/resend-verify-code?telephone=${telephone}`;
    const response = await apiClient.post(url, {});
    return response.data;
  },

  // Logout (clear tokens)
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessTokenExpiry');
    localStorage.removeItem('refreshTokenExpiry');
    localStorage.removeItem('verificationPhone');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    const expiry = localStorage.getItem('accessTokenExpiry');
    
    if (!token || !expiry) {
      return false;
    }
    
    // Check if token is expired
    const expiryDate = new Date(expiry);
    const now = new Date();
    
    return now < expiryDate;
  },

  // Get stored tokens
  getStoredTokens(): {
    accessToken: string | null;
    refreshToken: string | null;
    accessTokenExpiry: string | null;
    refreshTokenExpiry: string | null;
  } {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
      accessTokenExpiry: localStorage.getItem('accessTokenExpiry'),
      refreshTokenExpiry: localStorage.getItem('refreshTokenExpiry')
    };
  },

  // Check if access token should be refreshed (2 minutes before expiry)
  shouldRefreshToken(): boolean {
    const expiry = localStorage.getItem('accessTokenExpiry');
    if (!expiry) return false;
    
    const expiryDate = new Date(expiry);
    const refreshThreshold = new Date(expiryDate.getTime() - 2 * 60 * 1000); // 2 minutes before
    const now = new Date();
    
    return now > refreshThreshold;
  }
};

// Dashboard API
export const dashboardApi = {
  // Dashboard istatistikleri - SuperadminDashboardFX'teki loadDashboardData metoduna benzer
  getDashboardStats: async () => {
    const response = await apiService.get('/admin/dashboard/stats');
    return response.data;
  },

  // Dashboard hoşgeldiniz verisi
  getWelcomeData: async () => {
    const response = await apiService.get('/admin/dashboard/welcome');
    return response.data;
  },

  // Son aktiviteler
  getRecentActivities: async (limit = 10) => {
    const response = await apiService.get(`/admin/dashboard/activities?limit=${limit}`);
    return response.data;
  },

  // Sistem durumu
  getSystemStatus: async () => {
    const response = await apiService.get('/admin/dashboard/system-status');
    return response.data;
  }
};

// Reports API - IncomeReportsPage'e benzer
export const reportsApi = {
  // Gelir özeti - ApiClientFX.getIncomeSummary'ye benzer
  getIncomeSummary: async () => {
    const response = await apiService.get('/admin/reports/income/summary');
    return response.data;
  },

  // Günlük gelir raporu
  getDailyIncomeReport: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiService.get(`/admin/reports/income/daily?${params.toString()}`);
    return response.data;
  },

  // Haftalık gelir raporu
  getWeeklyIncomeReport: async (weeks = 12) => {
    const response = await apiService.get(`/admin/reports/income/weekly?weeks=${weeks}`);
    return response.data;
  },

  // Aylık gelir raporu
  getMonthlyIncomeReport: async (months = 12) => {
    const response = await apiService.get(`/admin/reports/income/monthly?months=${months}`);
    return response.data;
  },

  // Gelir trend analizi
  getIncomeTrend: async (period = 'monthly') => {
    const response = await apiService.get(`/admin/reports/income/trend?period=${period}`);
    return response.data;
  },

  // Gelir kategorileri dağılımı
  getIncomeCategories: async () => {
    const response = await apiService.get('/admin/reports/income/categories');
    return response.data;
  },

  // Excel export
  exportIncomeReport: async (type: 'daily' | 'weekly' | 'monthly', startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiService.get(`/admin/reports/income/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Analytics API - gelişmiş analitik
export const analyticsApi = {
  // Genel analitik veriler
  getAnalyticsData: async (period = 'today') => {
    const response = await apiService.get(`/admin/analytics/overview?period=${period}`);
    return response.data;
  },

  // Kullanıcı analitikleri
  getUserAnalytics: async () => {
    const response = await apiService.get('/admin/analytics/users');
    return response.data;
  },

  // Otobüs kullanım analitikleri
  getBusAnalytics: async () => {
    const response = await apiService.get('/admin/analytics/buses');
    return response.data;
  },

  // Durak analitikleri
  getStationAnalytics: async () => {
    const response = await apiService.get('/admin/analytics/stations');
    return response.data;
  },

  // İşlem analitikleri
  getTransactionAnalytics: async (period = 'today') => {
    const response = await apiService.get(`/admin/analytics/transactions?period=${period}`);
    return response.data;
  },

  // Performans metrikleri
  getPerformanceMetrics: async () => {
    const response = await apiService.get('/admin/analytics/performance');
    return response.data;
  }
};

// Admin Approvals API - AdminApprovalsPage.java'daki API çağrılarına benzer
export const adminApprovalsApi = {
  // Bekleyen admin onay isteklerini getir - ApiClientFX.getPendingAdminRequests'e benzer
  getPendingAdminRequests: async (page = 0, size = 50) => {
    const response = await apiService.get(`/admin/approvals/pending?page=${page}&size=${size}`);
    return response.data;
  },

  // Admin isteğini onayla - ApiClientFX.approveAdminRequest'e benzer
  approveAdminRequest: async (adminId: number) => {
    const response = await apiService.post(`/admin/approvals/${adminId}/approve`);
    return response.data;
  },

  // Admin isteğini reddet - ApiClientFX.rejectAdminRequest'e benzer
  rejectAdminRequest: async (adminId: number) => {
    const response = await apiService.post(`/admin/approvals/${adminId}/reject`);
    return response.data;
  },

  // Tüm admin istekleri (onaylanmış, reddedilmiş dahil)
  getAllAdminRequests: async (page = 0, size = 50, status?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (status) params.append('status', status);
    
    const response = await apiService.get(`/admin/approvals?${params.toString()}`);
    return response.data;
  }
};

// Identity Requests API - IdentityRequestsPage.java'daki WalletApiClient çağrılarına benzer
export const identityRequestsApi = {
  // Kimlik doğrulama isteklerini getir - WalletApiClient.getIdentityRequests'e benzer
  getIdentityRequests: async (
    status?: string,
    startDate?: string,
    endDate?: string,
    page = 0,
    size = 100,
    sort = 'requestedAt',
    direction = 'desc'
  ) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sort', sort);
    params.append('direction', direction);
    
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiService.get(`/wallet/identity-requests?${params.toString()}`);
    return response.data;
  },

  // Kimlik isteğini işle (onayla/reddet) - WalletApiClient.processIdentityRequest'e benzer
  processIdentityRequest: async (requestId: number, approve: boolean, note?: string) => {
    const payload = {
      approve,
      note: note || ''
    };
    
    const response = await apiService.post(`/wallet/identity-requests/${requestId}/process`, payload);
    return response.data;
  },

  // Kimlik isteği detayını getir
  getIdentityRequestById: async (requestId: number) => {
    const response = await apiService.get(`/wallet/identity-requests/${requestId}`);
    return response.data;
  },

  // Kimlik istekleri istatistiklerini getir
  getIdentityRequestsStats: async () => {
    const response = await apiService.get('/wallet/identity-requests/stats');
    return response.data;
  },

  // Excel export
  exportIdentityRequests: async (
    status?: string,
    startDate?: string,
    endDate?: string
  ) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiService.get(`/wallet/identity-requests/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Audit Logs API - AuditLogsPage.java'daki ApiClientFX.getAuditLogs'a benzer
export const auditLogsApi = {
  // Denetim kayıtlarını getir
  getAuditLogs: async (fromDate?: string, toDate?: string, action?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (action && action !== 'Tümü') params.append('action', action);
    
    const response = await apiService.get(`/admin/audit-logs?${params.toString()}`);
    return response.data;
  }
};

// Wallet Stats API - StatisticsPage.java'daki WalletApiClient.getWalletAdminStats'a benzer
export const walletStatsApi = {
  // Cüzdan sistem istatistikleri
  getWalletAdminStats: async () => {
    const response = await apiService.get('/wallet/admin/stats');
    return response.data;
  }
};

// All Wallets API - AllWalletsPage.java'daki WalletApiClient.getAllWallets'a benzer
export const walletsApi = {
  // Tüm cüzdanları getir (sayfalama ile)
  getAllWallets: async (page = 0, size = 10) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sort', 'id,desc');
    
    const response = await apiService.get(`/wallet/admin/all?${params.toString()}`);
    return response.data;
  }
};

// Wallet Transfers API - WalletTransfersPage.java'daki WalletApiClient.getWalletTransfers'a benzer
export const walletTransfersApi = {
  // Transfer işlemlerini getir
  getWalletTransfers: async (
    status?: string,
    startDate?: string,
    endDate?: string,
    page = 0,
    size = 100,
    sortBy = 'timestamp',
    sortDir = 'desc'
  ) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);
    
    if (status && status !== 'Tümü') params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiService.get(`/wallet/transfers?${params.toString()}`);
    return response.data;
  },

  // Transfer Excel raporu indir
  exportTransferExcel: async (
    status?: string,
    startDate?: string,
    endDate?: string
  ) => {
    const params = new URLSearchParams();
    if (status && status !== 'Tümü') params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiService.get(`/wallet/transfers/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Wallet Status Update API - WalletStatusUpdatePage.java'daki ApiClientFX.updateWalletStatus'a benzer
export const walletStatusApi = {
  // Cüzdan durumunu güncelle
  updateWalletStatus: async (phoneNumber: string, isActive: boolean) => {
    const payload = {
      phoneNumber,
      isActive
    };
    
    const response = await apiService.post('/wallet/status/update', payload);
    return response.data;
  }
};

export default apiService; 