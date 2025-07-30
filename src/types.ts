// News Model (from NewsPage.java)
export interface News {
  id: number;
  title: string;
  content: string;
  image?: string | null;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  active: boolean;
  platform: string; // WEB, MOBILE, DESKTOP, TABLET, KIOSK, ALL
  priority: string; // COK_DUSUK, DUSUK, NORMAL, ORTA_YUKSEK, YUKSEK, COK_YUKSEK, KRITIK
  type: string; // DUYURU, KAMPANYA, BAKIM, BILGILENDIRME, GUNCELLEME, UYARI, ETKINLIK
  viewCount: number;
  likeCount: number;
  allowFeedback: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// News DTO for API requests
export interface NewsCreateDTO {
  title: string;
  content: string;
  image?: File | null;
  startDate: string;
  endDate: string;
  platform: string;
  priority: string;
  type: string;
  allowFeedback: boolean;
}

export interface NewsUpdateDTO extends NewsCreateDTO {
  id: number;
  active: boolean;
}

// News Platform enum
export enum NewsPlatform {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  DESKTOP = 'DESKTOP',
  TABLET = 'TABLET',
  KIOSK = 'KIOSK',
  ALL = 'ALL'
}

// News Priority enum
export enum NewsPriority {
  COK_DUSUK = 'COK_DUSUK',
  DUSUK = 'DUSUK',
  NORMAL = 'NORMAL',
  ORTA_YUKSEK = 'ORTA_YUKSEK',
  YUKSEK = 'YUKSEK',
  COK_YUKSEK = 'COK_YUKSEK',
  KRITIK = 'KRITIK'
}

// News Type enum
export enum NewsType {
  DUYURU = 'DUYURU',
  KAMPANYA = 'KAMPANYA',
  BAKIM = 'BAKIM',
  BILGILENDIRME = 'BILGILENDIRME',
  GUNCELLEME = 'GUNCELLEME',
  UYARI = 'UYARI',
  ETKINLIK = 'ETKINLIK'
}

// News utility functions
export const createNewsDTO = (data: Partial<NewsCreateDTO>): NewsCreateDTO => ({
  title: data.title || '',
  content: data.content || '',
  image: data.image || null,
  startDate: data.startDate || new Date().toISOString(),
  endDate: data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  platform: data.platform || NewsPlatform.WEB,
  priority: data.priority || NewsPriority.NORMAL,
  type: data.type || NewsType.DUYURU,
  allowFeedback: data.allowFeedback ?? true
});

export const createNewsUpdateDTO = (data: Partial<NewsUpdateDTO>): NewsUpdateDTO => ({
  ...createNewsDTO(data),
  id: data.id || 0,
  active: data.active ?? true
});

// Feedback Model (from FeedbackPage.java)
export interface Feedback {
  id: number;
  type: string; // COMPLAINT, SUGGESTION, COMPLIMENT, BUG_REPORT, FEATURE_REQUEST, OTHER
  subject: string;
  message: string;
  shortMessage: string; // Truncated message for display (150 chars)
  userInfo: string; // Combined user info (name + email)
  userEmail?: string; // User email (separate field)
  userName?: string; // User name (separate field)
  source: string; // MOBILE_APP, WEB_APP, EMAIL, PHONE, OTHER
  submittedAt: string; // ISO date string
}

// Feedback Type enum
export enum FeedbackType {
  COMPLAINT = 'COMPLAINT',
  SUGGESTION = 'SUGGESTION',
  COMPLIMENT = 'COMPLIMENT',
  BUG_REPORT = 'BUG_REPORT',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  OTHER = 'OTHER'
}

// Feedback Source enum
export enum FeedbackSource {
  MOBILE_APP = 'MOBILE_APP',
  WEB_APP = 'WEB_APP',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  OTHER = 'OTHER'
}

// Feedback display name mappings
export const FeedbackTypeDisplayNames: Record<FeedbackType, string> = {
  [FeedbackType.COMPLAINT]: 'Şikayet',
  [FeedbackType.SUGGESTION]: 'Öneri',
  [FeedbackType.COMPLIMENT]: 'Takdir',
  [FeedbackType.BUG_REPORT]: 'Hata Bildirimi',
  [FeedbackType.FEATURE_REQUEST]: 'Özellik Talebi',
  [FeedbackType.OTHER]: 'Diğer'
};

export const FeedbackSourceDisplayNames: Record<FeedbackSource, string> = {
  [FeedbackSource.MOBILE_APP]: 'Mobil Uygulama',
  [FeedbackSource.WEB_APP]: 'Web Uygulaması',
  [FeedbackSource.EMAIL]: 'E-posta',
  [FeedbackSource.PHONE]: 'Telefon',
  [FeedbackSource.OTHER]: 'Diğer'
};

// Feedback color mappings for UI
export const FeedbackTypeColors: Record<FeedbackType, string> = {
  [FeedbackType.COMPLAINT]: '#e74c3c',
  [FeedbackType.SUGGESTION]: '#3498db',
  [FeedbackType.COMPLIMENT]: '#27ae60',
  [FeedbackType.BUG_REPORT]: '#f39c12',
  [FeedbackType.FEATURE_REQUEST]: '#9b59b6',
  [FeedbackType.OTHER]: '#7f8c8d'
};

// Feedback DTOs for API requests
export interface FeedbackCreateDTO {
  type: FeedbackType;
  subject: string;
  message: string;
  userEmail?: string;
  userName?: string;
  source: FeedbackSource;
}

export interface FeedbackFilterParams {
  type?: string; // "Tümü" or FeedbackType
  source?: string; // "Tümü" or FeedbackSource
  startDate?: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format
  sort?: string; // "submittedAt,desc" etc
  page?: number;
  size?: number;
}

// Feedback utility functions
export const getFeedbackTypeDisplayName = (type: string): string => {
  return FeedbackTypeDisplayNames[type as FeedbackType] || type;
};

export const getFeedbackSourceDisplayName = (source: string): string => {
  return FeedbackSourceDisplayNames[source as FeedbackSource] || source;
};

export const getFeedbackTypeColor = (type: string): string => {
  return FeedbackTypeColors[type as FeedbackType] || '#7f8c8d';
};

export const createShortMessage = (message: string, maxLength: number = 150): string => {
  return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
};

export const createUserInfo = (userName?: string, userEmail?: string): string => {
  if (!userName && !userEmail) return 'N/A';
  if (!userName) return userEmail || 'N/A';
  if (!userEmail) return userName;
  return `${userName} (${userEmail})`;
};

// Station Model (from StationsListPage.java)
export interface Station {
  id: string;
  name: string;
  type: string; // METRO, TRAMVAY, OTOBUS, METROBUS, TREN, VAPUR, TELEFERIK, DOLMUS, MINIBUS, HAVARAY, FERIBOT, HIZLI_TREN, BISIKLET, SCOOTER, PARK_YERI, AKILLI_DURAK, TERMINAL, ULAŞIM_AKTARMA, DIGER
  city: string;
  district: string;
  street: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  status: string; // ACTIVE, INACTIVE
  createdAt: string; // Formatted date string
}

// Station Type enum
export enum StationType {
  METRO = 'METRO',
  TRAMVAY = 'TRAMVAY',
  OTOBUS = 'OTOBUS',
  METROBUS = 'METROBUS',
  TREN = 'TREN',
  VAPUR = 'VAPUR',
  TELEFERIK = 'TELEFERIK',
  DOLMUS = 'DOLMUS',
  MINIBUS = 'MINIBUS',
  HAVARAY = 'HAVARAY',
  FERIBOT = 'FERIBOT',
  HIZLI_TREN = 'HIZLI_TREN',
  BISIKLET = 'BISIKLET',
  SCOOTER = 'SCOOTER',
  PARK_YERI = 'PARK_YERI',
  AKILLI_DURAK = 'AKILLI_DURAK',
  TERMINAL = 'TERMINAL',
  ULAŞIM_AKTARMA = 'ULAŞIM_AKTARMA',
  DIGER = 'DIGER'
}

// Station Status enum
export enum StationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// Station DTOs for API requests
export interface StationCreateDTO {
  name: string;
  type: StationType;
  city: string;
  district: string;
  street: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

export interface StationUpdateDTO extends StationCreateDTO {
  id: string;
  status: StationStatus;
}

export interface StationSearchParams {
  name?: string;
  type?: string; // "Tümü" or StationType
  city?: string;
  page?: number;
  size?: number;
}

// Bus Model (from BusesPage.java)
export interface Bus {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  status: string; // Aktif, Bakımda, Arızalı
}

// Bus Status enum
export enum BusStatus {
  AKTIF = 'Aktif',
  BAKIMDA = 'Bakımda',
  ARIZALI = 'Arızalı'
}

// Bus DTOs for API requests
export interface BusCreateDTO {
  plateNumber: string;
  model: string;
  capacity: number;
  status: BusStatus;
}

export interface BusUpdateDTO extends BusCreateDTO {
  id: string;
}

export interface BusSearchParams {
  plateNumber?: string;
  model?: string;
  status?: string; // "Tümü" or BusStatus
  page?: number;
  size?: number;
}

// Station utility functions
export const getStationTypeDisplayName = (type: string): string => {
  switch (type) {
    case StationType.METRO: return 'Metro';
    case StationType.TRAMVAY: return 'Tramvay';
    case StationType.OTOBUS: return 'Otobüs';
    case StationType.METROBUS: return 'Metrobüs';
    case StationType.TREN: return 'Tren';
    case StationType.VAPUR: return 'Vapur';
    case StationType.TELEFERIK: return 'Teleferik';
    case StationType.DOLMUS: return 'Dolmuş';
    case StationType.MINIBUS: return 'Minibüs';
    case StationType.HAVARAY: return 'Havaray';
    case StationType.FERIBOT: return 'Feribot';
    case StationType.HIZLI_TREN: return 'Hızlı Tren';
    case StationType.BISIKLET: return 'Bisiklet';
    case StationType.SCOOTER: return 'Scooter';
    case StationType.PARK_YERI: return 'Park Yeri';
    case StationType.AKILLI_DURAK: return 'Akıllı Durak';
    case StationType.TERMINAL: return 'Terminal';
    case StationType.ULAŞIM_AKTARMA: return 'Ulaşım Aktarma';
    case StationType.DIGER: return 'Diğer';
    default: return type;
  }
};

export const getStationStatusDisplayName = (status: string): string => {
  switch (status) {
    case StationStatus.ACTIVE: return 'Aktif';
    case StationStatus.INACTIVE: return 'Pasif';
    default: return status;
  }
};

export const getStationStatusColor = (status: string): string => {
  switch (status) {
    case StationStatus.ACTIVE: return '#27ae60';
    case StationStatus.INACTIVE: return '#e74c3c';
    default: return '#7f8c8d';
  }
};

export const formatCoordinates = (latitude: number, longitude: number): string => {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

// Bus utility functions
export const getBusStatusDisplayName = (status: string): string => {
  return status; // Already in Turkish
};

export const getBusStatusColor = (status: string): string => {
  switch (status) {
    case BusStatus.AKTIF: return '#27ae60';
    case BusStatus.BAKIMDA: return '#f39c12';
    case BusStatus.ARIZALI: return '#e74c3c';
    default: return '#7f8c8d';
  }
};

export const createStationDTO = (data: Partial<StationCreateDTO>): StationCreateDTO => ({
  name: data.name || '',
  type: data.type || StationType.OTOBUS,
  city: data.city || '',
  district: data.district || '',
  street: data.street || '',
  postalCode: data.postalCode || '',
  latitude: data.latitude || 0,
  longitude: data.longitude || 0
});

export const createBusDTO = (data: Partial<BusCreateDTO>): BusCreateDTO => ({
  plateNumber: data.plateNumber || '',
  model: data.model || '',
  capacity: data.capacity || 0,
  status: data.status || BusStatus.AKTIF
});

// Admin Request Types - AdminApprovalsPage.java'dan
export interface AdminRequest {
  id: string;
  adminId: string;
  name: string;
  email: string;
  phone: string;
  requestDate: string;
  status: AdminRequestStatus;
}

export enum AdminRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export const getAdminRequestStatusDisplayName = (status: AdminRequestStatus): string => {
  switch (status) {
    case AdminRequestStatus.PENDING: return 'Beklemede';
    case AdminRequestStatus.APPROVED: return 'Onaylandı';
    case AdminRequestStatus.REJECTED: return 'Reddedildi';
    default: return status;
  }
};

// Identity Verification Request Types - IdentityRequestsPage.java'dan
export interface UserIdentityInfo {
  id: number;
  frontCardPhoto?: string;
  backCardPhoto?: string;
  nationalId?: string;
  serialNumber?: string;
  birthDate?: string;
  gender?: string;
  motherName?: string;
  fatherName?: string;
  approvedByPhone?: string;
  approved: boolean;
  approvedAt?: string;
  userPhone?: string;
}

export interface IdentityVerificationRequest {
  id: number;
  identityInfo?: UserIdentityInfo;
  requestedByPhone: string;
  requestedAt: string;
  status: RequestStatus;
  adminNote?: string;
  reviewedByPhone?: string;
  reviewedAt?: string;
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export const getRequestStatusDisplayName = (status: RequestStatus): string => {
  switch (status) {
    case RequestStatus.PENDING: return 'Beklemede';
    case RequestStatus.APPROVED: return 'Onaylandı';
    case RequestStatus.REJECTED: return 'Reddedildi';
    default: return status;
  }
};

// API Response Types
export interface AdminRequestsResponse {
  success: boolean;
  message: string;
  data: AdminRequest[];
}

export interface IdentityRequestsResponse {
  success: boolean;
  message: string;
  data: {
    content: IdentityVerificationRequest[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

// Statistics Types
export interface IdentityRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
} 

// Audit Logs Types - AuditLogsPage.java'dan
export interface AuditLog {
  id: string;
  action: string;
  displayAction: string;
  description: string;
  timestamp: string;
  ipAddress: string;
  deviceInfo: string;
}

export enum ActionType {
  // Giriş / Güvenlik
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  RESET_PASSWORD = 'RESET_PASSWORD',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  
  // Kullanıcı Hesabı
  SIGN_UP = 'SIGN_UP',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  DELETE_USER = 'DELETE_USER',
  DEACTIVATE_ACCOUNT = 'DEACTIVATE_ACCOUNT',
  ACTIVATE_ACCOUNT = 'ACTIVATE_ACCOUNT',
  
  // Yetkilendirme / Admin
  APPROVE_ADMIN = 'APPROVE_ADMIN',
  BLOCK_USER = 'BLOCK_USER',
  UNBLOCK_USER = 'UNBLOCK_USER',
  PROMOTE_TO_ADMIN = 'PROMOTE_TO_ADMIN',
  DEMOTE_TO_USER = 'DEMOTE_TO_USER',
  
  // Kart İşlemleri
  ADD_BUS_CARD = 'ADD_BUS_CARD',
  DELETE_BUS_CARD = 'DELETE_BUS_CARD',
  BUS_CARD_TOP_UP = 'BUS_CARD_TOP_UP',
  BUS_CARD_TRANSFER = 'BUS_CARD_TRANSFER',
  
  // Cüzdan ve Ödeme
  CREATE_WALLET = 'CREATE_WALLET',
  DELETE_WALLET = 'DELETE_WALLET',
  WALLET_TOP_UP = 'WALLET_TOP_UP',
  WALLET_TRANSFER = 'WALLET_TRANSFER',
  
  // Rapor ve Analiz
  EXPORT_USER_DATA = 'EXPORT_USER_DATA',
  EXPORT_WALLET_HISTORY = 'EXPORT_WALLET_HISTORY',
  EXPORT_LOGIN_HISTORY = 'EXPORT_LOGIN_HISTORY',
  
  // Sistem / Genel
  SYSTEM_MAINTENANCE_START = 'SYSTEM_MAINTENANCE_START',
  SYSTEM_MAINTENANCE_END = 'SYSTEM_MAINTENANCE_END'
}

export const getActionTypeDisplayName = (actionType: ActionType): string => {
  const actionMap: Record<ActionType, string> = {
    // Giriş / Güvenlik
    [ActionType.LOGIN]: '🔐 Giriş',
    [ActionType.LOGOUT]: '🔓 Çıkış',
    [ActionType.RESET_PASSWORD]: '🔄 Şifre Sıfırlama',
    [ActionType.CHANGE_PASSWORD]: '🔑 Şifre Değişikliği',
    
    // Kullanıcı Hesabı
    [ActionType.SIGN_UP]: '👤 Kayıt Olma',
    [ActionType.UPDATE_PROFILE]: '✏️ Profil Güncelleme',
    [ActionType.DELETE_USER]: '🗑️ Kullanıcı Silme',
    [ActionType.DEACTIVATE_ACCOUNT]: '❌ Hesap Deaktivasyonu',
    [ActionType.ACTIVATE_ACCOUNT]: '✅ Hesap Aktivasyonu',
    
    // Yetkilendirme / Admin
    [ActionType.APPROVE_ADMIN]: '👨‍💼 Admin Onayı',
    [ActionType.BLOCK_USER]: '🚫 Kullanıcı Engelleme',
    [ActionType.UNBLOCK_USER]: '🔓 Kullanıcı Engel Kaldırma',
    [ActionType.PROMOTE_TO_ADMIN]: '⬆️ Admin Yetki Verme',
    [ActionType.DEMOTE_TO_USER]: '⬇️ Admin Yetki Alma',
    
    // Kart İşlemleri
    [ActionType.ADD_BUS_CARD]: '🚌 Kart Ekleme',
    [ActionType.DELETE_BUS_CARD]: '🗑️ Kart Silme',
    [ActionType.BUS_CARD_TOP_UP]: '💰 Kart Yükleme',
    [ActionType.BUS_CARD_TRANSFER]: '↔️ Kart Transfer',
    
    // Cüzdan ve Ödeme
    [ActionType.CREATE_WALLET]: '👛 Cüzdan Oluşturma',
    [ActionType.DELETE_WALLET]: '🗑️ Cüzdan Silme',
    [ActionType.WALLET_TOP_UP]: '💰 Cüzdan Yükleme',
    [ActionType.WALLET_TRANSFER]: '↔️ Cüzdan Transfer',
    
    // Rapor ve Analiz
    [ActionType.EXPORT_USER_DATA]: '📊 Kullanıcı Verisi Dışa Aktarma',
    [ActionType.EXPORT_WALLET_HISTORY]: '📈 Cüzdan Geçmişi Dışa Aktarma',
    [ActionType.EXPORT_LOGIN_HISTORY]: '📋 Giriş Geçmişi Dışa Aktarma',
    
    // Sistem / Genel
    [ActionType.SYSTEM_MAINTENANCE_START]: '⚙️ Sistem Bakımı Başlatma',
    [ActionType.SYSTEM_MAINTENANCE_END]: '✅ Sistem Bakımı Bitirme'
  };
  
  return actionMap[actionType] || actionType;
};

// Statistics Types - StatisticsPage.java'dan
export interface WalletStats {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalWallets: number;
  activeWallets: number;
  lockedWallets: number;
  totalBalance: number;
  serverTime: string;
}

// Wallet Info Types - AllWalletsPage.java'dan
export interface WalletInfo {
  walletId: number;
  userId: number;
  wiban: string;
  currency: string;
  balance: number;
  status: string;
  lastUpdated: string;
  totalTransactionCount: number;
}

// Transfer Info Types - WalletTransfersPage.java'dan
export interface TransferInfo {
  id: number;
  senderWiban: string;
  receiverWiban: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: string;
  description: string;
}

// API Response Types for new pages
export interface AuditLogsResponse {
  success: boolean;
  message: string;
  data: AuditLog[];
}

export interface WalletStatsResponse {
  success: boolean;
  message: string;
  data: WalletStats;
}

export interface WalletsResponse {
  success: boolean;
  message: string;
  data: {
    content: WalletInfo[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface TransfersResponse {
  success: boolean;
  message: string;
  data: {
    content: TransferInfo[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface WalletStatusUpdateRequest {
  phoneNumber: string;
  isActive: boolean;
}

export interface WalletStatusUpdateResponse {
  success: boolean;
  message: string;
} 