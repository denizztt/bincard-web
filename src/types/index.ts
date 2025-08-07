// ========================
// API Response Types
// ========================

export interface ApiResponse<T> {
  message: string;
  data: T;
  success: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  pageable: Pageable;
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  sort: Sort;
  empty: boolean;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

// ========================
// Authentication Types
// ========================

export interface TokenDTO {
  token: string;
  issuedAt: string; // ISO date string
  expiresAt: string; // ISO date string
  lastUsedAt: string; // ISO date string
  ipAddress: string;
  deviceInfo: string;
  tokenType: TokenType;
}

export interface TokenResponse {
  accessToken: TokenDTO;
  refreshToken: TokenDTO;
}

// TODO: Add TokenType enum when provided
export enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH'
}

// ========================
// Location & Address Types
// ========================

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  district: string;
  city: string;
  postalCode: string;
}

// ========================
// Payment Types
// ========================

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  MOBILE_APP = 'MOBILE_APP',
  QR_CODE = 'QR_CODE'
}

export const PaymentMethodDisplayNames: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Nakit',
  [PaymentMethod.CREDIT_CARD]: 'Kredi Kartı',
  [PaymentMethod.DEBIT_CARD]: 'Banka Kartı',
  [PaymentMethod.MOBILE_APP]: 'Mobil Uygulama',
  [PaymentMethod.QR_CODE]: 'QR Kod'
};

export interface PaymentPhoto {
  id: number;
  imageUrl: string;
}

export interface PaymentPoint {
  id: number;
  name: string;
  location: Location;
  address: Address;
  contactNumber: string;
  workingHours: string;
  paymentMethods: PaymentMethod[];
  description: string;
  active: boolean;
  photos: PaymentPhoto[];
  createdAt: string; // ISO date string
  lastUpdated: string; // ISO date string
  distance?: number; // Optional distance
}

// ========================
// Utility Types
// ========================

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  active?: boolean;
  city?: string;
  paymentMethod?: PaymentMethod;
}

// ========================
// Authentication Types (Extended)
// ========================

export interface LoginResponse {
  success: boolean;
  message: string;
}

// ========================
// Payment Point Management
// ========================

export interface LocationDTO {
  latitude: number;
  longitude: number;
}

export interface AddressDTO {
  street: string;
  district: string;
  city: string;
  postalCode: string;
}

export interface PaymentPointUpdateDTO {
  name: string;
  location: LocationDTO;
  address: AddressDTO;
  contactNumber: string;
  workingHours: string;
  paymentMethods: string[]; // Payment method names as strings
  description: string;
  active: boolean;
}

// ========================
// UI/Menu Types
// ========================

export interface MenuItem {
  title: string;
  color: string;
  subItems: MenuItem[];
  targetPage?: string;
  icon?: string; // FontAwesome icon name as string
  hasSubItems: boolean;
  isSubItem: boolean;
}

// ========================
// Feedback Types
// ========================

export interface Feedback {
  id: number;
  type: FeedbackType;
  subject: string;
  content: string;
  status: FeedbackStatus;
  source: FeedbackSource;
  userPhone: string;
  adminResponse?: string;
  priority: FeedbackPriority;
  isPublic: boolean;
  createdAt: string; // ISO date string
  lastUpdatedAt: string; // ISO date string
  resolvedAt?: string; // ISO date string
}

export enum FeedbackType {
  SUGGESTION = 'SUGGESTION',
  COMPLAINT = 'COMPLAINT',
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
  OTHER = 'OTHER'
}

export enum FeedbackStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED'
}

export enum FeedbackSource {
  MOBILE_APP = 'MOBILE_APP',
  WEB_PORTAL = 'WEB_PORTAL',
  CALL_CENTER = 'CALL_CENTER',
  EMAIL = 'EMAIL',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  OTHER = 'OTHER'
}

export enum FeedbackPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export const FeedbackTypeDisplayNames: Record<FeedbackType, string> = {
  [FeedbackType.SUGGESTION]: 'Öneri',
  [FeedbackType.COMPLAINT]: 'Şikayet',
  [FeedbackType.TECHNICAL_ISSUE]: 'Teknik Sorun',
  [FeedbackType.OTHER]: 'Diğer'
};

export const FeedbackStatusDisplayNames: Record<FeedbackStatus, string> = {
  [FeedbackStatus.PENDING]: 'Beklemede',
  [FeedbackStatus.IN_PROGRESS]: 'İşlemde',
  [FeedbackStatus.RESOLVED]: 'Çözüldü',
  [FeedbackStatus.CLOSED]: 'Kapatıldı',
  [FeedbackStatus.REJECTED]: 'Reddedildi'
};

export const FeedbackSourceDisplayNames: Record<FeedbackSource, string> = {
  [FeedbackSource.MOBILE_APP]: 'Mobil Uygulama',
  [FeedbackSource.WEB_PORTAL]: 'Web Portalı',
  [FeedbackSource.CALL_CENTER]: 'Çağrı Merkezi',
  [FeedbackSource.EMAIL]: 'E-posta',
  [FeedbackSource.SOCIAL_MEDIA]: 'Sosyal Medya',
  [FeedbackSource.OTHER]: 'Diğer'
};

export const FeedbackPriorityDisplayNames: Record<FeedbackPriority, string> = {
  [FeedbackPriority.LOW]: 'Düşük',
  [FeedbackPriority.NORMAL]: 'Normal',
  [FeedbackPriority.HIGH]: 'Yüksek',
  [FeedbackPriority.URGENT]: 'Acil'
};

export interface FeedbackUpdateDTO {
  status?: FeedbackStatus;
  adminResponse?: string;
  priority?: FeedbackPriority;
  isPublic?: boolean;
}

export interface FeedbackFilters {
  type?: FeedbackType;
  status?: FeedbackStatus;
  source?: FeedbackSource;
  priority?: FeedbackPriority;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// ========================
// Helper Functions for Types
// ========================

export const createMenuItem = (
  title: string, 
  color: string, 
  targetPage?: string, 
  icon?: string
): MenuItem => ({
  title,
  color,
  subItems: [],
  targetPage,
  icon,
  hasSubItems: false,
  isSubItem: !!targetPage
});

export const createPaymentPointUpdateDTO = (paymentPoint: PaymentPoint): PaymentPointUpdateDTO => ({
  name: paymentPoint.name,
  location: {
    latitude: paymentPoint.location.latitude,
    longitude: paymentPoint.location.longitude
  },
  address: {
    street: paymentPoint.address.street,
    district: paymentPoint.address.district,
    city: paymentPoint.address.city,
    postalCode: paymentPoint.address.postalCode
  },
  contactNumber: paymentPoint.contactNumber,
  workingHours: paymentPoint.workingHours,
  paymentMethods: paymentPoint.paymentMethods.map(method => method.toString()),
  description: paymentPoint.description,
  active: paymentPoint.active
}); 