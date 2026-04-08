import apiClient from './apiClient';
import type { AxiosRequestConfig } from 'axios';
import type { 
  ApiResponse, 
  PagedResponse, 
  TokenResponse,
  LoginResponse
} from '../types/index';
import type { News } from '../types';

// Token refresh function
const refreshAccessToken = async (refreshToken: string): Promise<TokenResponse> => {
  try {
    const response = await apiClient.post(`/auth/refresh`, {
      refreshToken: refreshToken,
      deviceInfo: 'Web Browser',
      platform: 'Web',
      appVersion: '1.0.0',
      deviceUuid: 'web-' + Date.now(),
      fcmToken: '',
      latitude: null,
      longitude: null
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

// Request interceptor moved to `src/services/apiClient.js` to centralize auth handling

// Response interceptor with enhanced token management
apiClient.interceptors.response.use(
  async (response) => {
    // Backend'den 200 OK ile dönse bile response body'de hata olabilir
    const responseData = response.data;
    
    // Eğer response bir ApiResponse formatındaysa ve success: false ise
    if (responseData && typeof responseData === 'object' && 'success' in responseData) {
      if (responseData.success === false) {
        // Backend'den gelen hata mesajını logla
        console.error('❌ BACKEND BUSINESS ERROR:', {
          status: response.status,
          url: response.config.url,
          message: responseData.message,
          data: responseData
        });
        
        // Hata mesajını içeren bir error oluştur
        const error = new Error(responseData.message || 'Backend hatası');
        (error as any).response = {
          ...response,
          data: responseData,
          status: response.status
        };
        (error as any).isBusinessError = true;
        return Promise.reject(error);
      }
    }
    
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
    const response = await apiClient.post('/auth/login', credentials);
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
    const response = await apiClient.post(`/auth/resend-verify-code?telephone=${telephone}`);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    return refreshAccessToken(refreshToken);
  },

  logout: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/auth/logout');
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

  getActiveNewsForAdmin: async (platform?: string, type?: string, page: number = 0, size: number = 10): Promise<PagedResponse<News> | ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (platform) params.append('platform', platform);
    if (type) params.append('type', type);
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await apiClient.get(`/news/active-admin?${params.toString()}`);
    const data = response.data;
    
    // Backend'den hata mesajı gelirse ApiResponse formatında olabilir
    if (data && typeof data === 'object' && 'success' in data && !data.success) {
      return data as ApiResponse<any>;
    }
    
    // Normal PagedResponse
    return data as PagedResponse<News>;
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
// Dashboard API endpoints (using mock data since backend endpoints don't exist)
export const dashboardApi = {
  getRecentActivities: async () => {
    // This endpoint may not exist either, will be handled with try-catch in components
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
  getAllFeedbacks: async (params: {
    type?: string;
    source?: string;
    start?: string;
    end?: string;
    page?: number;
    size?: number;
    sort?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add parameters if they exist
    if (params.type) queryParams.append('type', params.type);
    if (params.source) queryParams.append('source', params.source);
    if (params.start) queryParams.append('start', params.start);
    if (params.end) queryParams.append('end', params.end);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    
    const response = await apiClient.get(`/feedback/admin/all?${queryParams.toString()}`);
    return response.data;
  },

  getFeedbackById: async (id: number) => {
    const response = await apiClient.get(`/feedback/admin/${id}`);
    return response.data;
  },

  deleteFeedback: async (id: number) => {
    const response = await apiClient.delete(`/feedback/admin/${id}`);
    return response.data;
  },

  // Mark feedback as read/unread
  markAsRead: async (id: number) => {
    const response = await apiClient.patch(`/feedback/admin/${id}/read`);
    return response.data;
  },

  markAsUnread: async (id: number) => {
    const response = await apiClient.patch(`/feedback/admin/${id}/unread`);
    return response.data;
  }
};

// Station API endpoints
export const stationApi = {
  getAllStations: async (
    latitude?: number | null, 
    longitude?: number | null, 
    type?: string | null, 
    page: number = 0, 
    size: number = 10
  ) => {
    const queryParams = new URLSearchParams();
    
    if (latitude !== null && latitude !== undefined) {
      queryParams.append('latitude', latitude.toString());
    }
    if (longitude !== null && longitude !== undefined) {
      queryParams.append('longitude', longitude.toString());
    }
    if (type !== null && type !== undefined && type !== 'ALL') {
      queryParams.append('type', type);
    }
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    
  const response = await apiClient.get(`/station?${queryParams.toString()}`);
    return response.data;
  },

  searchStationsByName: async (name: string, page: number = 0, size: number = 10) => {
    const queryParams = new URLSearchParams();
    queryParams.append('name', name);
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    
  const response = await apiClient.get(`/station/search?${queryParams.toString()}`);
    return response.data;
  },

  getStationById: async (id: number, directionType?: string) => {
    const queryParams = new URLSearchParams();
    if (directionType) {
      queryParams.append('directionType', directionType);
    }
    
    const url = queryParams.toString() 
      ? `/station/${id}?${queryParams.toString()}`
      : `/station/${id}`;
    
    const response = await apiClient.get(url);
    return response.data;
  },

  createStation: async (stationData: any) => {
  const response = await apiClient.post('/station', stationData);
    return response.data;
  },

  updateStation: async (stationData: any) => {
  const response = await apiClient.put('/station', stationData);
    return response.data;
  },

  deleteStation: async (id: number) => {
  const response = await apiClient.delete(`/station/${id}`);
    return response.data;
  },

  changeStationStatus: async (id: number, active: boolean) => {
  const response = await apiClient.patch(`/station/${id}/status?active=${active}`);
    return response.data;
  },

  getStationRoutes: async (stationId: number) => {
  const response = await apiClient.get(`/station/routes?stationId=${stationId}`);
    return response.data;
  },

  searchKeywords: async (query: string) => {
  const response = await apiClient.get(`/station/keywords?query=${query}`);
    return response.data;
  },

  searchNearbyStations: async (searchRequest: any, page: number = 0, size: number = 10) => {
  const response = await apiClient.post(`/station/search/nearby?page=${page}&size=${size}`, searchRequest);
    return response.data;
  },

  getNearbyStations: async (latitude: number, longitude: number, page: number = 0, size: number = 10) => {
    const queryParams = new URLSearchParams();
    queryParams.append('latitude', latitude.toString());
    queryParams.append('longitude', longitude.toString());
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    
  const response = await apiClient.get(`/station/nearby?${queryParams.toString()}`);
    return response.data;
  },

  // Favoriler için
  addFavoriteStation: async (stationId: number) => {
  const response = await apiClient.post(`/station/add-favorite?stationId=${stationId}`);
    return response.data;
  },

  removeFavoriteStation: async (stationId: number) => {
  const response = await apiClient.delete(`/station/remove-favorite?stationId=${stationId}`);
    return response.data;
  },

  getFavoriteStations: async () => {
  const response = await apiClient.get('/station/favorite');
    return response.data;
  }
};

// Payment Point API endpoints
export const paymentPointApi = {
  getAllPaymentPoints: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/payment-point?page=${page}&size=${size}`);
    return response.data;
  },

  getPaymentPointById: async (id: number) => {
    const response = await apiClient.get(`/payment-point/${id}`);
    return response.data;
  },

  createPaymentPoint: async (paymentPointData: any) => {
    const response = await apiClient.post('/payment-point', paymentPointData);
    return response.data;
  },

  updatePaymentPoint: async (id: number, paymentPointData: any) => {
    const response = await apiClient.put(`/payment-point/${id}`, paymentPointData);
    return response.data;
  },

  deletePaymentPoint: async (id: number) => {
    const response = await apiClient.delete(`/payment-point/${id}`);
    return response.data;
  },

  togglePaymentPointStatus: async (id: number, active: boolean) => {
    const response = await apiClient.patch(`/payment-point/${id}/status?active=${active}`);
    return response.data;
  }
};

// Bus API endpoints
export const busApi = {
  // === GENEL SORGULAMA ENDPOİNTLERİ ===
  getAllBuses: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/bus/all?page=${page}&size=${size}`);
    return response.data;
  },

  getBusById: async (id: number) => {
    const response = await apiClient.get(`/bus/${id}`);
    return response.data;
  },

  getActiveBuses: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/bus/active?page=${page}&size=${size}`);
    return response.data;
  },

  // === CRUD İŞLEMLERİ ===
  createBus: async (busData: any) => {
    const response = await apiClient.post('/bus/create', busData);
    return response.data;
  },

  updateBus: async (id: number, busData: any) => {
    const response = await apiClient.put(`/bus/update/${id}`, busData);
    return response.data;
  },

  deleteBus: async (id: number) => {
    const response = await apiClient.delete(`/bus/delete/${id}`);
    return response.data;
  },

  toggleActiveStatus: async (id: number) => {
    const response = await apiClient.put(`/bus/${id}/toggle-active`);
    return response.data;
  },

  // === ŞOFÖR YÖNETİMİ ===
  // Not: Bu endpoint DRIVER rolü içindir, süperadmin için değil
  // Backend authenticated user'ı otomatik olarak şoför olarak atar
  assignDriver: async (busId: number) => {
    const response = await apiClient.put(`/bus/${busId}/assign-driver`);
    return response.data;
  },

  // === KONUM YÖNETİMİ ===
  getCurrentLocation: async (busId: number) => {
    const response = await apiClient.get(`/bus/${busId}/location`);
    return response.data;
  },

  updateLocation: async (busId: number, locationData: any) => {
    const response = await apiClient.post(`/bus/${busId}/location`, locationData);
    return response.data;
  },

  getLocationHistory: async (busId: number, date?: string, page: number = 0, size: number = 10) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (date) params.append('date', date);
    const response = await apiClient.get(`/bus/${busId}/location-history?${params}`);
    return response.data;
  },

  // === ROTA YÖNETİMİ ===
  assignRoute: async (busId: number, routeId: number) => {
    const response = await apiClient.put(`/bus/${busId}/route`, { routeId });
    return response.data;
  },

  getRouteStations: async (busId: number) => {
    const response = await apiClient.get(`/bus/${busId}/route/stations`);
    return response.data;
  },

  getEstimatedArrivalTime: async (busId: number, stationId: number) => {
    const response = await apiClient.get(`/bus/${busId}/eta?stationId=${stationId}`);
    return response.data;
  },

  // === YÖN YÖNETİMİ ===
  switchDirection: async (busId: number) => {
    const response = await apiClient.put(`/bus/${busId}/switch-direction`);
    return response.data;
  },

  // === İSTATİSTİKLER ===
  getBusStatistics: async () => {
    const response = await apiClient.get('/bus/statistics');
    return response.data;
  },

  // === ARAMA VE FİLTRELEME ===
  searchBuses: async (searchParams: any) => {
    const response = await apiClient.get('/bus/search', { params: searchParams });
    return response.data;
  },

  getBusesByRoute: async (routeId: number, page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/bus/route/${routeId}?page=${page}&size=${size}`);
    return response.data;
  },

  getBusesByDriver: async (driverId: number, page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/bus/driver/${driverId}?page=${page}&size=${size}`);
    return response.data;
  },

  getBusesByStatus: async (status: string, page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/bus/status/${status}?page=${page}&size=${size}`);
    return response.data;
  },

  // === DURUM YÖNETİMİ ===
  updateBusStatus: async (busId: number, statusData: any) => {
    const response = await apiClient.put(`/bus/${busId}/status`, statusData);
    return response.data;
  },

  // === TOPLU İŞLEMLER ===
  bulkActivate: async (busIds: number[]) => {
    const response = await apiClient.put('/bus/bulk/activate', busIds);
    return response.data;
  },

  bulkDeactivate: async (busIds: number[]) => {
    const response = await apiClient.put('/bus/bulk/deactivate', busIds);
    return response.data;
  }
};

// Driver API endpoints
export const driverApi = {
  // === DRIVER CRUD ===
  getAllDrivers: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/drivers?page=${page}&size=${size}`);
    return response.data;
  },

  getDriverById: async (id: number) => {
    const response = await apiClient.get(`/drivers/${id}`);
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
  },

  // === SEARCH & FILTERING ===
  getActiveDrivers: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/drivers/active?page=${page}&size=${size}`);
    return response.data;
  },

  getDriversByShift: async (shift: string, page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/drivers/by-shift/${shift}?page=${page}&size=${size}`);
    return response.data;
  },

  searchDrivers: async (query: string, page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/drivers/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
    return response.data;
  },

  getDriversWithPenalties: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/drivers/with-penalties?page=${page}&size=${size}`);
    return response.data;
  },

  // === STATUS MANAGEMENT ===
  changeDriverStatus: async (id: number, active: boolean) => {
    const response = await apiClient.put(`/drivers/${id}/status?active=${active}`);
    return response.data;
  },

  // === DOCUMENTS ===
  getDriverDocuments: async (id: number, page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/drivers/${id}/documents?page=${page}&size=${size}`);
    return response.data;
  },

  addDriverDocument: async (id: number, documentData: any) => {
    const response = await apiClient.post(`/drivers/${id}/documents`, documentData);
    return response.data;
  },

  updateDriverDocument: async (docId: number, documentData: any) => {
    const response = await apiClient.put(`/drivers/documents/${docId}`, documentData);
    return response.data;
  },

  deleteDriverDocument: async (docId: number) => {
    const response = await apiClient.delete(`/drivers/documents/${docId}`);
    return response.data;
  },

  // === PENALTIES ===
  getDriverPenalties: async (id: number, page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/drivers/${id}/penalties?page=${page}&size=${size}`);
    return response.data;
  },

  addDriverPenalty: async (id: number, penaltyData: any) => {
    const response = await apiClient.post(`/drivers/${id}/penalties`, penaltyData);
    return response.data;
  },

  updateDriverPenalty: async (penaltyId: number, penaltyData: any) => {
    const response = await apiClient.put(`/drivers/penalties/${penaltyId}`, penaltyData);
    return response.data;
  },

  deleteDriverPenalty: async (penaltyId: number) => {
    const response = await apiClient.delete(`/drivers/penalties/${penaltyId}`);
    return response.data;
  },

  // === PERFORMANCE ===
  getDriverPerformance: async (id: number) => {
    const response = await apiClient.get(`/drivers/${id}/performance`);
    return response.data;
  },

  // === STATISTICS & REPORTS ===
  getDriverStatistics: async () => {
    const response = await apiClient.get('/drivers/statistics');
    return response.data;
  },

  getTopPerformingDrivers: async (limit: number = 10) => {
    const response = await apiClient.get(`/drivers/top-performers?limit=${limit}`);
    return response.data;
  },

  getDriversWithExpiringLicenses: async (days: number = 30) => {
    const response = await apiClient.get(`/drivers/expiring-licenses?days=${days}`);
    return response.data;
  },

  getDriversWithExpiringHealthCertificates: async (days: number = 30) => {
    const response = await apiClient.get(`/drivers/expiring-health-certificates?days=${days}`);
    return response.data;
  },

  getDriversHiredBetween: async (startDate: string, endDate: string, page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/drivers/hired-between?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`);
    return response.data;
  },

  // === EARNINGS ===
  getDriverEarnings: async (
    page: number = 0,
    size: number = 10,
    startDate?: string,
    endDate?: string
  ) => {
    let url = `/drivers/earnings?page=${page}&size=${size}`;
    if (startDate) {
      url += `&startDate=${startDate}`;
    }
    if (endDate) {
      url += `&endDate=${endDate}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  getDriverEarning: async (
    id: number,
    startDate?: string,
    endDate?: string
  ) => {
    let url = `/drivers/${id}/earnings`;
    const params = new URLSearchParams();
    if (startDate) {
      params.append('startDate', startDate);
    }
    if (endDate) {
      params.append('endDate', endDate);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  }
};

// Old Route API endpoints (legacy)
export const oldRouteApi = {
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
    const response = await apiClient.get(`/wallet?page=${page}&size=${size}`);
    return response.data;
  },

  getWalletById: async (id: number) => {
    const response = await apiClient.get(`/wallet/${id}`);
    return response.data;
  },

  searchWallets: async (searchTerm: string, page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/wallet/search?q=${searchTerm}&page=${page}&size=${size}`);
    return response.data;
  },

  updateWalletStatus: async (id: number, status: string) => {
    const response = await apiClient.patch(`/wallet/${id}/status`, { status });
    return response.data;
  },

  getWalletTransfers: async (status?: string, startDate?: string, endDate?: string, page: number = 0, size: number = 10, sortBy?: string, sortOrder?: string) => {
    let url = `/wallet-transfers?page=${page}&size=${size}`;
    
    if (status && status !== 'Tümü') {
      url += `&status=${encodeURIComponent(status)}`;
    }
    if (startDate) {
      url += `&startDate=${encodeURIComponent(startDate)}`;
    }
    if (endDate) {
      url += `&endDate=${encodeURIComponent(endDate)}`;
    }
    if (sortBy) {
      url += `&sortBy=${encodeURIComponent(sortBy)}`;
    }
    if (sortOrder) {
      url += `&sortOrder=${encodeURIComponent(sortOrder)}`;
    }
    
    const response = await apiClient.get(url);
    return response.data;
  },

  createTransfer: async (transferData: any) => {
    const response = await apiClient.post('/wallet-transfers', transferData);
    return response.data;
  }
};

// Admin API endpoints (for admin users themselves)
// Backend: /v1/api/admin/* (baseURL zaten /v1/api içeriyor)
export const adminApi = {
  /**
   * POST /v1/api/admin/sign-up
   * Admin kayıt işlemi
   * Request: CreateAdminRequest { name, surname, telephone, password, email, roles? }
   * Response: ResponseMessage
   */
  signUp: async (adminData: {
    name: string;
    surname: string;
    telephone: string;
    password: string;
    email: string;
    roles?: any[];
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/admin/sign-up', adminData);
    return response.data;
  },

  /**
   * PUT /v1/api/admin/change-password
   * Şifre değiştirme
   * Request: ChangePasswordRequest { currentPassword, newPassword }
   * Response: ResponseMessage
   */
  changePassword: async (passwordData: { 
    currentPassword: string; 
    newPassword: string 
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.put('/admin/change-password', passwordData);
    return response.data;
  },

  /**
   * GET /v1/api/admin/profile
   * Admin profil bilgilerini getir
   * Response: DataResponseMessage<AdminDTO>
   */
  getProfile: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/admin/profile');
    return response.data;
  },

  /**
   * PUT /v1/api/admin/update-profile
   * Profil bilgilerini güncelle
   * Request: UpdateProfileRequest { name, surname, email }
   * Response: ResponseMessage
   */
  updateProfile: async (profileData: { 
    name?: string; 
    surname?: string; 
    email?: string 
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.put('/admin/update-profile', profileData);
    return response.data;
  },

  /**
   * PUT /v1/api/admin/update-device-info
   * Cihaz bilgilerini güncelle
   * Request: UpdateDeviceInfoRequest { fcmToken?, ipAddress?, lastKnownLatitude?, lastKnownLongitude?, 
   *                                    lastLoginDevice?, lastLoginPlatform?, lastLoginAppVersion?, profilePicture? }
   * Response: ResponseMessage
   */
  updateDeviceInfo: async (deviceData: {
    fcmToken?: string;
    ipAddress?: string;
    lastKnownLatitude?: number;
    lastKnownLongitude?: number;
    lastLoginDevice?: string;
    lastLoginPlatform?: string;
    lastLoginAppVersion?: string;
    profilePicture?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.put('/admin/update-device-info', deviceData);
    return response.data;
  },

  /**
   * GET /v1/api/admin/location
   * Admin konum bilgisini getir
   * Response: LocationDTO (direkt, DataResponseMessage değil!)
   * LocationDTO: { latitude, longitude, recordedAt, userId }
   */
  getLocation: async (): Promise<any> => {
    const response = await apiClient.get('/admin/location');
    // Backend direkt LocationDTO döner, DataResponseMessage wrapper'ı yok
    return response.data;
  },

  /**
   * PUT /v1/api/admin/location
   * Konum bilgisini güncelle
   * Request: UpdateLocationRequest { latitude, longitude, speed?, accuracy? }
   * Response: ResponseMessage
   */
  updateLocation: async (locationData: {
    latitude: number;
    longitude: number;
    speed?: number;
    accuracy?: number;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.put('/admin/location', locationData);
    return response.data;
  },

  /**
   * GET /v1/api/admin/login-history
   * Giriş geçmişini getir (sayfalanmış)
   * Query Params: page (default: 0), size (default: 10), sort (default: "id,desc")
   * Response: DataResponseMessage<Page<LoginHistoryDTO>>
   * LoginHistoryDTO: { ipAddress, device, platform, appVersion, loginAt }
   */
  getLoginHistory: async (
    page: number = 0, 
    size: number = 10, 
    sort: string = 'id,desc'
  ): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sort', sort);
    
    const response = await apiClient.get(`/admin/login-history?${params.toString()}`);
    return response.data;
  },

  /**
   * GET /v1/api/admin/audit-logs
   * Denetim kayıtlarını getir (sayfalanmış)
   * Query Params: fromDate?, toDate?, action?
   * Response: DataResponseMessage<Page<AuditLogDTO>>
   * AuditLogDTO: { id, action, description, timestamp, ipAddress, deviceInfo }
   */
  getAuditLogs: async (
    fromDate?: string, 
    toDate?: string, 
    action?: string
  ): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (action) params.append('action', action);
    
    const response = await apiClient.get(`/admin/audit-logs?${params.toString()}`);
    return response.data;
  },

  /**
   * GET /v1/api/admin/roles
   * Admin'in rollerini getir
   * Response: DataResponseMessage<List<String>>
   */
  getMyRoles: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/admin/roles');
    return response.data;
  },

  // Legacy endpoints (for superadmin operations - AdminController'da yok, başka controller'da olabilir)
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
    const response = await apiClient.get(`/wallet/identity-requests?page=${page}&size=${size}`);
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
  },

  // User Contract Operations (ContractController)
  getUserContracts: async () => {
    const response = await apiClient.get('/contract/contracts');
    return response.data;
  },

  getMandatoryContracts: async () => {
    const response = await apiClient.get('/contract/contracts/mandatory');
    return response.data;
  },

  getPendingContracts: async () => {
    const response = await apiClient.get('/contract/contracts/pending');
    return response.data;
  },

  acceptContract: async (contractId: number, acceptData: { accepted: boolean; contractVersion?: string }) => {
    const response = await apiClient.post(`/contract/contracts/${contractId}/accept`, acceptData);
    return response.data;
  },

  rejectContract: async (contractId: number, rejectData: { rejectionReason: string }) => {
    const response = await apiClient.post(`/contract/contracts/${contractId}/reject`, rejectData);
    return response.data;
  },

  getAcceptedContracts: async () => {
    const response = await apiClient.get('/contract/contracts/accepted');
    return response.data;
  },

  checkContractAcceptanceStatus: async (contractId: number) => {
    const response = await apiClient.get(`/contract/contracts/${contractId}/acceptance-status`);
    return response.data;
  },

  checkMandatoryContractsAcceptanceStatus: async () => {
    const response = await apiClient.get('/contract/contracts/mandatory/acceptance-status');
    return response.data;
  },

  // Public Contract Operations (PublicContractController)
  getPublicActiveContracts: async () => {
    const response = await apiClient.get('/public/contracts');
    return response.data;
  },

  getPublicContractById: async (contractId: number) => {
    const response = await apiClient.get(`/public/contracts/${contractId}`);
    return response.data;
  },

  getLatestContractByType: async (contractType: string) => {
    const response = await apiClient.get(`/public/contracts/type/${contractType}`);
    return response.data;
  },

  getMembershipContract: async () => {
    const response = await apiClient.get('/public/contracts/membership');
    return response.data;
  },

  getKvkkIllumination: async () => {
    const response = await apiClient.get('/public/contracts/kvkk-illumination');
    return response.data;
  },

  getDataProcessingConsent: async () => {
    const response = await apiClient.get('/public/contracts/data-processing-consent');
    return response.data;
  },

  getPrivacyPolicy: async () => {
    const response = await apiClient.get('/public/contracts/privacy-policy');
    return response.data;
  },

  getTermsOfUse: async () => {
    const response = await apiClient.get('/public/contracts/terms-of-use');
    return response.data;
  },

  getContractTypes: async () => {
    const response = await apiClient.get('/public/contracts/types');
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
    const response = await apiClient.get(`/wallet/admin/all?page=${page}&size=${size}`);
    return response.data;
  },

  getWalletById: async (id: number) => {
    const response = await apiClient.get(`/wallet/${id}`);
    return response.data;
  },

  searchWallets: async (searchTerm: string, page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/wallet/search?q=${searchTerm}&page=${page}&size=${size}`);
    return response.data;
  },

  updateWalletStatus: async (id: number, status: string) => {
    const response = await apiClient.patch(`/wallet/${id}/status`, { status });
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
    const response = await apiClient.get(`/wallet/identity-requests?page=${page}&size=${size}`);
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
  },

  // Admin wallet statistics - Backend: GET /wallet/admin/stats
  getWalletAdminStats: async () => {
    const response = await apiClient.get('/wallet/admin/stats');
    return response.data;
  }
};

// Wallet Status API endpoints
export const walletStatusApi = {
  updateWalletStatus: async (id: number, status: string) => {
    const response = await apiClient.patch(`/wallet/${id}/status`, { status });
    return response.data;
  },

  getWalletStatusHistory: async (id: number) => {
    const response = await apiClient.get(`/wallet/${id}/status-history`);
    return response.data;
  },

  bulkUpdateWalletStatus: async (walletIds: number[], status: string) => {
    const response = await apiClient.patch('/wallet/bulk-status-update', { walletIds, status });
    return response.data;
  }
};

// Wallet Transfers API endpoints
export const walletTransfersApi = {
  getWalletTransfers: async (status?: string, startDate?: string, endDate?: string, page: number = 0, size: number = 10, sortBy?: string, sortOrder?: string) => {
    let url = `/wallet-transfers?page=${page}&size=${size}`;
    
    if (status && status !== 'Tümü') {
      url += `&status=${encodeURIComponent(status)}`;
    }
    if (startDate) {
      url += `&startDate=${encodeURIComponent(startDate)}`;
    }
    if (endDate) {
      url += `&endDate=${encodeURIComponent(endDate)}`;
    }
    if (sortBy) {
      url += `&sortOrder=${encodeURIComponent(sortBy)}`;
    }
    if (sortOrder) {
      url += `&sortOrder=${encodeURIComponent(sortOrder)}`;
    }
    
    const response = await apiClient.get(url);
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

// Route API endpoints - Complete Route Management System
export const routeApi = {
  // 1. Tüm rotaları getir (GET /all)
  getAllRoutes: async () => {
    const response = await apiClient.get('/route/all');
    return response.data;
  },

  // 2. İsme göre rota arama (GET /search?name=)
  searchRoutesByName: async (name: string) => {
    const response = await apiClient.get(`/route/search?name=${encodeURIComponent(name)}`);
    return response.data;
  },

  // 3. Rota detayları (GET /{id})
  getRouteById: async (id: number) => {
    const response = await apiClient.get(`/route/${id}`);
    return response.data;
  },

  // 4. Rota yönlerini getir (GET /{id}/directions)
  getRouteDirections: async (id: number) => {
    const response = await apiClient.get(`/route/${id}/directions`);
    return response.data;
  },

  // 5. Belirli yöndeki durakları getir (GET /{routeId}/direction/{directionType}/stations)
  getStationsInDirection: async (routeId: number, directionType: 'GIDIS' | 'DONUS') => {
    const response = await apiClient.get(`/route/${routeId}/direction/${directionType}/stations`);
    return response.data;
  },

  // 6. İki yönlü rota oluştur (POST /create-bidirectional)
  createBidirectionalRoute: async (routeData: any) => {
    const response = await apiClient.post('/route/create-bidirectional', routeData);
    return response.data;
  },

  // 7. Rota sil (DELETE /{id})
  deleteRoute: async (id: number) => {
    const response = await apiClient.delete(`/route/${id}`);
    return response.data;
  },

  // 8. Yöne durak ekle (POST /{routeId}/direction/{directionType}/add-station)
  addStationToDirection: async (
    routeId: number, 
    directionType: 'GIDIS' | 'DONUS', 
    afterStationId: number, 
    newStationId: number
  ) => {
    const response = await apiClient.post(
      `/route/${routeId}/direction/${directionType}/add-station?afterStationId=${afterStationId}&newStationId=${newStationId}`
    );
    return response.data;
  },

  // 9. Yönden durak çıkar (DELETE /{routeId}/direction/{directionType}/remove-station)
  removeStationFromDirection: async (
    routeId: number, 
    directionType: 'GIDIS' | 'DONUS', 
    stationId: number
  ) => {
    const response = await apiClient.delete(
      `/route/${routeId}/direction/${directionType}/remove-station?stationId=${stationId}`
    );
    return response.data;
  },

  // 10. Durağa göre rota arama (GET /search-by-station?stationId=)
  searchRoutesByStation: async (stationId: number) => {
    const response = await apiClient.get(`/route/search-by-station?stationId=${stationId}`);
    return response.data;
  },

  // 11. Favorilere ekleme (POST /favorite)
  addFavorite: async (routeId: number) => {
    const response = await apiClient.post(`/route/favorite?routeId=${routeId}`);
    return response.data;
  },

  // 12. Favorilerden çıkarma (DELETE /favorite)
  removeFavorite: async (routeId: number) => {
    const response = await apiClient.delete(`/route/favorite?routeId=${routeId}`);
    return response.data;
  },

  // 13. Kullanıcının favori rotaları (GET /favorites)
  getFavoriteRoutes: async () => {
    const response = await apiClient.get('/route/favorites');
    return response.data;
  },

  // 14. Rota önerisi (POST /suggest)
  suggestRoute: async (suggestionData: { userLat: number; userLng: number; destinationAddress: string }) => {
    const response = await apiClient.post('/route/suggest', suggestionData);
    return response.data;
  },

  // 15. Rota duraklarını getir (GET /{id}/stations)
  getRouteStations: async (routeId: number) => {
    const response = await apiClient.get(`/route/${routeId}/stations`);
    return response.data;
  },

  // 16. Rotaya durak ekle (POST /{id}/add-station)
  addStationToRoute: async (routeId: number, stationId: number) => {
    const response = await apiClient.post(`/route/${routeId}/add-station`, { stationId });
    return response.data;
  },

  // 17. Rotadan durak kaldır (DELETE /{id}/remove-station)
  removeStationFromRoute: async (routeId: number, stationId: number) => {
    const response = await apiClient.delete(`/route/${routeId}/remove-station?stationId=${stationId}`);
    return response.data;
  },

  // 18. Durak sırasını güncelle (PUT /{id}/update-station-order)
  updateStationOrder: async (routeId: number, stationId: number, newOrder: number) => {
    const response = await apiClient.put(`/route/${routeId}/update-station-order`, { stationId, newOrder });
    return response.data;
  }
};

// Bus Card API endpoints
export const busCardApi = {
  // Kart bloklama (POST /v1/api/buscard/card-blocked)
  blockCard: async (uid: string) => {
    console.log('🔒 BusCard blockCard API çağrısı başlatılıyor:', { uid });
    try {
      const response = await apiClient.post('/buscard/card-blocked', { uid });
      console.log('✅ BusCard blockCard başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ BusCard blockCard hatası:', error);
      throw error;
    }
  },

  // Kart blokunu kaldırma (DELETE /v1/api/buscard/card-blocked)
  unblockCard: async (uid: string) => {
    console.log('🔓 BusCard unblockCard API çağrısı başlatılıyor:', { uid });
    try {
      const response = await apiClient.delete('/buscard/card-blocked', { data: { uid } });
      console.log('✅ BusCard unblockCard başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ BusCard unblockCard hatası:', error);
      throw error;
    }
  },

  // Bloke kartları listeleme (GET /v1/api/buscard/card-blocked)
  getBlockedCards: async () => {
    console.log('📋 Bloke kartları listeleniyor...');
    try {
      const response = await apiClient.get('/buscard/card-blocked');
      console.log('✅ Bloke kartları başarıyla alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Bloke kartları alma hatası:', error);
      throw error;
    }
  },

  // Kart fiyatlandırma oluşturma (POST /v1/api/buscard/card-pricing)
  createCardPricing: async (pricingData: { cardType: string; price: string | number }) => {
    const response = await apiClient.post('/buscard/card-pricing', pricingData);
    return response.data;
  },

  // Kart fiyatlandırma güncelleme (PUT /v1/api/buscard/card-pricing)
  updateCardPricing: async (pricingData: { cardType: string; price: string | number }) => {
    console.log('💰 Kart fiyatı güncelleniyor:', pricingData);
    console.log('📤 Gönderilen request body:', JSON.stringify(pricingData, null, 2));
    console.log('📤 CardType değeri:', pricingData.cardType, 'Type:', typeof pricingData.cardType);
    console.log('📤 Price değeri:', pricingData.price, 'Type:', typeof pricingData.price);
    console.log('📤 Full URL:', `${import.meta.env.VITE_API_URL || 'https://bingolkart.com.tr/v1/api'}/buscard/card-pricing`);
    
    try {
      const response = await apiClient.put('/buscard/card-pricing', pricingData);
      console.log('✅ Kart fiyatı başarıyla güncellendi:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Kart fiyatı güncelleme hatası:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },

  // Tüm kart fiyatlandırmalarını getirme (GET /v1/api/buscard/card-pricing)
  getAllCardPricing: async () => {
    const response = await apiClient.get('/buscard/card-pricing');
    return response.data;
  },

  // Kart okuma (POST /v1/api/buscard/read)
  readCard: async (uid: string) => {
    console.log('🔍 BusCard readCard API çağrısı başlatılıyor:', { uid });
    try {
      // Token'ı kontrol et
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('❌ Token bulunamadı');
        const error = new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        (error as any).response = { status: 401 };
        throw error;
      }
      
      const response = await apiClient.post('/buscard/read', { 
        uid: uid
      });
      console.log('✅ BusCard readCard başarılı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ BusCard readCard hatası:', error);
      
      // Hata detaylarını logla
      if (error.response) {
        console.error('❌ Response error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      throw error;
    }
  },

  // Kart kayıt (POST /v1/api/buscard/register)
  registerCard: async (cardData: {
    uid: string;
    fullName: string;
    status?: string;
    kartTipi: string;
    bakiye: number;
  }) => {
    console.log('📝 Kart kayıt isteği:', cardData);
    try {
      const response = await apiClient.post('/buscard/register', cardData);
      console.log('✅ Kart kayıt başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Kart kayıt hatası:', error);
      throw error;
    }
  },

  // Tüm kartları listeleme (GET /v1/api/buscard/all)
  getAllCards: async (page: number = 0, size: number = 20) => {
    console.log('📋 Tüm kartlar listeleniyor...', { page, size });
    try {
      const response = await apiClient.get(`/buscard/all?page=${page}&size=${size}`);
      console.log('✅ Kartlar başarıyla alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Kartlar alma hatası:', error);
      throw error;
    }
  },

  // Bakiye yükleme (POST /v1/api/buscard/top-up)
  topUpBalance: async (uid: string, amount: number) => {
    console.log('💰 Bakiye yükleme isteği:', { uid, amount });
    try {
      const response = await apiClient.post('/buscard/top-up', { uid, amount });
      console.log('✅ Bakiye yükleme başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Bakiye yükleme hatası:', error);
      throw error;
    }
  },

  // Kart vize (POST /v1/api/buscard/card-visa)
  cardVisa: async (uid: string) => {
    console.log('✈️ Kart vizeleme isteği:', { uid });
    try {
      const response = await apiClient.post('/buscard/card-visa', { uid });
      console.log('✅ Kart vizeleme başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Kart vizeleme hatası:', error);
      throw error;
    }
  },

  // Biniş işlemi (POST /v1/api/buscard/get-on)
  getOn: async (uid: string, validatorId: string) => {
    console.log('🚌 Biniş işlemi:', { uid, validatorId });
    try {
      const response = await apiClient.post('/buscard/get-on', { uid, validatorId });
      console.log('✅ Biniş işlemi başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Biniş işlemi hatası:', error);
      throw error;
    }
  },

  // QR kod oluşturma (POST /v1/api/buscard/generate-qr)
  generateQrCode: async () => {
    const response = await apiClient.post('/buscard/generate-qr', {}, {
      responseType: 'blob'
    });
    return response.data;
  },

  // QR kod tarama (POST /v1/api/buscard/scan-qr)
  scanQrCode: async (qrToken: string) => {
    console.log('📱 QR kod tarama isteği');
    try {
      const response = await apiClient.post('/buscard/scan-qr', { qrToken });
      console.log('✅ QR kod tarama başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ QR kod tarama hatası:', error);
      throw error;
    }
  },

  // Abonman oluşturma (POST /v1/api/buscard/abonman)
  createSubscription: async (subscriptionData: {
    uid: string;
    type: string;
    loaded?: number;
    startDate?: string;
    endDate?: string;
    remainingUses?: number;
    remainingDays?: number;
  }) => {
    console.log('📅 Abonman oluşturma isteği:', subscriptionData);
    try {
      const response = await apiClient.post('/buscard/abonman', subscriptionData);
      console.log('✅ Abonman oluşturma başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Abonman oluşturma hatası:', error);
      throw error;
    }
  },

  // Kart düzenleme (PUT /v1/api/buscard/edit-card)
  editCard: async (cardData: {
    uid: string;
    fullName?: string;
    status?: string;
    active?: boolean;
    expiryDate?: string;
  }) => {
    console.log('✏️ Kart düzenleme isteği:', cardData);
    try {
      const response = await apiClient.put('/buscard/edit-card', cardData);
      console.log('✅ Kart düzenleme başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Kart düzenleme hatası:', error);
      throw error;
    }
  },

  // Kart silme (DELETE /v1/api/buscard/delete-card)
  deleteCard: async (uid: string) => {
    console.log('🗑️ Kart silme isteği:', { uid });
    try {
      const response = await apiClient.delete('/buscard/delete-card', { data: { uid } });
      console.log('✅ Kart silme başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Kart silme hatası:', error);
      throw error;
    }
  },

  // QR durum kontrolü (GET /v1/api/buscard/qr-status/{token})
  qrStatus: async (token: string) => {
    console.log('🔍 QR durum kontrolü:', { token });
    try {
      const response = await apiClient.get(`/buscard/qr-status/${token}`);
      console.log('✅ QR durum kontrolü başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ QR durum kontrolü hatası:', error);
      throw error;
    }
  },

  // Kredi kartı ile bakiye yükleme (POST /v1/api/buscard/top-up/card)
  topUpCard: async (cardNumber: string, topUpData: {
    amount: number;
    cardNumber: string;
    cardExpiry?: string;
    cardCvc?: string;
    platformType: string;
  }) => {
    console.log('💳 Kredi kartı ile bakiye yükleme:', { cardNumber });
    try {
      // Backend'de cardNumber hem query param hem body'de olabilir
      const response = await apiClient.post(`/buscard/top-up/card?cardNumber=${encodeURIComponent(cardNumber)}`, topUpData);
      console.log('✅ Kredi kartı ile bakiye yükleme başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Kredi kartı ile bakiye yükleme hatası:', error);
      throw error;
    }
  },

  // 3D ödeme callback (POST /v1/api/buscard/payment/3d-callback)
  complete3DPayment: async (paymentId?: string, conversationId?: string) => {
    console.log('💳 3D ödeme callback:', { paymentId, conversationId });
    try {
      const params = new URLSearchParams();
      if (paymentId) params.append('paymentId', paymentId);
      if (conversationId) params.append('conversationId', conversationId);
      
      const response = await apiClient.post(`/buscard/payment/3d-callback?${params.toString()}`);
      console.log('✅ 3D ödeme callback başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ 3D ödeme callback hatası:', error);
      throw error;
    }
  },

  // Cüzdandan karta yükleme (POST /v1/api/buscard/top-up/wallet)
  topUpWallet: async (topUpData: {
    cardNumber: string;
    amount: number;
  }) => {
    console.log('💼 Cüzdandan karta yükleme:', topUpData);
    try {
      const response = await apiClient.post('/buscard/top-up/wallet', topUpData);
      console.log('✅ Cüzdandan karta yükleme başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Cüzdandan karta yükleme hatası:', error);
      throw error;
    }
  },

  // Bakiye sorgulama (GET /v1/api/buscard/balance inquiry)
  balanceInquiry: async (cardNumber: string) => {
    console.log('💰 Bakiye sorgulama:', { cardNumber });
    try {
      // Backend'de endpoint'te boşluk var, URL encode edilmeli
      const response = await apiClient.get(`/buscard/balance%20inquiry?cardNumber=${encodeURIComponent(cardNumber)}`);
      console.log('✅ Bakiye sorgulama başarılı:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Bakiye sorgulama hatası:', error);
      throw error;
    }
  }
};

// SuperAdmin API endpoints
export const superAdminApi = {
  // Admin İstekleri
  getPendingAdminRequests: async (page: number = 0, size: number = 10) => {
    const response = await apiClient.get(`/superadmin/admin-requests/pending?page=${page}&size=${size}`);
    return response.data;
  },

  approveAdminRequest: async (requestId: number) => {
    const response = await apiClient.post(`/superadmin/admin-requests/${requestId}/approve`);
    return response.data;
  },

  rejectAdminRequest: async (adminId: number) => {
    const response = await apiClient.post(`/superadmin/admin-requests/${adminId}/reject`);
    return response.data;
  },

  // Rol Yönetimi
  addRole: async (request: { adminId: number; roles: any[] }) => {
    const response = await apiClient.post('/superadmin/roles/add', request);
    return response.data;
  },

  removeRole: async (request: { adminId: number; roles: any[] }) => {
    const response = await apiClient.delete('/superadmin/roles/remove', { data: request });
    return response.data;
  },

  getAdminRoles: async (adminId: number) => {
    const response = await apiClient.get(`/superadmin/roles/${adminId}`);
    return response.data;
  },

  // Gelir Raporları
  getDailyBusIncome: async (date: string) => {
    const response = await apiClient.get(`/superadmin/bus-income/daily?date=${date}`);
    return response.data;
  },

  getWeeklyBusIncome: async (startDate: string, endDate: string) => {
    const response = await apiClient.get(`/superadmin/bus-income/weekly?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  getMonthlyBusIncome: async (year: number, month: number) => {
    const response = await apiClient.get(`/superadmin/bus-income/monthly?year=${year}&month=${month}`);
    return response.data;
  },

  getIncomeSummary: async () => {
    const response = await apiClient.get('/superadmin/income-summary');
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (fromDate?: string, toDate?: string, action?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (action) params.append('action', action);
    
    const response = await apiClient.get(`/superadmin/audit-logs?${params.toString()}`);
    return response.data;
  },

  // Admin Yönetimi
  getAllAdmins: async (page: number = 0, size: number = 20, status?: string, role?: string, searchTerm?: string) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));
    if (status) params.append('status', status);
    if (role) params.append('role', role);
    if (searchTerm) params.append('searchTerm', searchTerm);
    const response = await apiClient.get(`/superadmin/admins?${params.toString()}`);
    return response.data;
  },

  getAdminById: async (adminId: number) => {
    // Önerilen endpoint; backend yoksa 404 dönebilir
    const response = await apiClient.get(`/superadmin/admins/${adminId}`);
    return response.data;
  },
  createAdmin: async (adminData: any) => {
    const response = await apiClient.post('/superadmin/admins', adminData);
    return response.data;
  },

  updateAdmin: async (adminId: number, adminData: any) => {
    const response = await apiClient.put(`/superadmin/admins/${adminId}`, adminData);
    return response.data;
  },

  deleteAdmin: async (adminId: number) => {
    const response = await apiClient.delete(`/superadmin/admins/${adminId}`);
    return response.data;
  },

  toggleAdminStatus: async (adminId: number) => {
    const response = await apiClient.patch(`/superadmin/admins/${adminId}/toggle-status`);
    return response.data;
  },

  // ===== RAPOR YÖNETİMİ (SADECE SUPERADMIN) =====
  
  // Tüm şikayetleri görüntüleme (sadece SUPERADMIN)
  getAllReports: async (params: {
    category?: string;
    status?: string;
    priority?: string;
    hasUnread?: boolean;
    includeDeleted?: boolean;
    assignedAdminUsername?: string;
    page?: number;
    size?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.hasUnread !== undefined) queryParams.append('hasUnread', String(params.hasUnread));
    if (params.includeDeleted !== undefined) queryParams.append('includeDeleted', String(params.includeDeleted));
    if (params.assignedAdminUsername) queryParams.append('assignedAdminUsername', params.assignedAdminUsername);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    
    const response = await apiClient.get(`/admin/report/all?${queryParams.toString()}`);
    return response.data;
  },

  // Şikayeti başka admin'e atama (sadece SUPERADMIN)
  assignReportToAdmin: async (reportId: number, targetAdminUsername: string, request: any) => {
    const response = await apiClient.post(
      `/admin/report/assign-to-admin?targetAdminUsername=${encodeURIComponent(targetAdminUsername)}`,
      request
    );
    return response.data;
  },

  // Silinmiş şikayetleri görüntüleme (sadece SUPERADMIN)
  getDeletedReports: async (params: {
    category?: string;
    status?: string;
    page?: number;
    size?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.status) queryParams.append('status', params.status);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    
    const response = await apiClient.get(`/admin/report/deleted?${queryParams.toString()}`);
    return response.data;
  },

  // Silinmiş şikayeti geri yükleme (sadece SUPERADMIN)
  restoreReport: async (reportId: number) => {
    const response = await apiClient.patch(`/admin/report/restore/${reportId}`);
    return response.data;
  },

  // Tüm admin performanslarını görüntüleme (sadece SUPERADMIN)
  getAllAdminPerformances: async (page: number = 0, size: number = 20) => {
    const response = await apiClient.get(`/admin/report/admin-performances?page=${page}&size=${size}`);
    return response.data;
  },

  // Admin listesi (şikayet atama için - sadece SUPERADMIN)
  getAdminsListForReports: async () => {
    const response = await apiClient.get('/admin/report/admins');
    return response.data;
  }
};

// AutoTopUp API endpoints
export const autoTopUpApi = {
  // Kullanıcının otomatik yükleme loglarını getir
  getAutoTopUpLogs: async () => {
    const response = await apiClient.get('/auto_top_up/logs');
    return response.data;
  },

  // Belirli bir konfigürasyon için logları getir
  getAutoTopUpLogsByConfig: async (configId: number) => {
    const response = await apiClient.get(`/auto_top_up/${configId}/logs`);
    return response.data;
  },

  // Tüm kullanıcıların loglarını getir (SuperAdmin)
  getAllAutoTopUpLogs: async () => {
    const response = await apiClient.get('/auto_top_up/admin/logs');
    return response.data;
  },

  // Kullanıcının otomatik yükleme konfigürasyonlarını getir
  getAutoTopUpConfigs: async () => {
    const response = await apiClient.get('/auto_top_up');
    return response.data;
  },

  // Tüm konfigürasyonları getir (Admin)
  getAllAutoTopUpConfigs: async () => {
    const response = await apiClient.get('/auto_top_up/admin/configs');
    return response.data;
  }
};

export default apiService; 
