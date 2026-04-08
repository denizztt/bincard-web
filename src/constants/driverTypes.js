// Driver Types and Constants

// Driver Shift Enum
export const DRIVER_SHIFTS = {
  DAYTIME: 'DAYTIME',
  NIGHT: 'NIGHT'
};

// Driver Status Colors
export const DRIVER_STATUS_COLORS = {
  ACTIVE: '#22c55e',    // green-500
  INACTIVE: '#ef4444',  // red-500
  SUSPENDED: '#f59e0b', // amber-500
  ON_LEAVE: '#8b5cf6'   // violet-500
};

// Driver Status Icons
export const DRIVER_STATUS_ICONS = {
  ACTIVE: '✅',
  INACTIVE: '❌', 
  SUSPENDED: '⚠️',
  ON_LEAVE: '🏖️'
};

// Helper Functions
export const getDriverShiftLabel = (shift) => {
  const labels = {
    DAYTIME: 'Gündüz',
    NIGHT: 'Gece'
  };
  return labels[shift] || 'Bilinmiyor';
};

export const getDriverShiftColor = (shift) => {
  const colors = {
    DAYTIME: '#f59e0b', // amber-500
    NIGHT: '#6366f1'    // indigo-500
  };
  return colors[shift] || '#6b7280';
};

export const getDriverShiftIcon = (shift) => {
  const icons = {
    DAYTIME: '☀️',
    NIGHT: '🌙'
  };
  return icons[shift] || '⏰';
};

export const getDriverStatusLabel = (isActive) => {
  return isActive ? 'Aktif' : 'Pasif';
};

export const getDriverStatusColor = (isActive) => {
  return isActive ? DRIVER_STATUS_COLORS.ACTIVE : DRIVER_STATUS_COLORS.INACTIVE;
};

export const getDriverStatusIcon = (isActive) => {
  return isActive ? DRIVER_STATUS_ICONS.ACTIVE : DRIVER_STATUS_ICONS.INACTIVE;
};

export const formatDriverExperience = (employmentDate) => {
  if (!employmentDate) return 'Bilinmiyor';
  
  const start = new Date(employmentDate);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} gün`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ay`;
  } else {
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return months > 0 ? `${years} yıl ${months} ay` : `${years} yıl`;
  }
};

export const formatDriverRating = (rating) => {
  if (!rating || rating === 0) return 'Değerlendirilmemiş';
  return `${rating.toFixed(1)} ⭐`;
};

export const getDriverRatingColor = (rating) => {
  if (!rating || rating === 0) return '#6b7280'; // gray-500
  if (rating >= 4.5) return '#22c55e'; // green-500
  if (rating >= 3.5) return '#f59e0b'; // amber-500
  if (rating >= 2.5) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
};

export const formatDriverStats = (stats) => {
  return {
    totalHours: stats.totalDrivingHours ? `${stats.totalDrivingHours.toLocaleString()} saat` : '0 saat',
    totalDistance: stats.totalDistanceDriven ? `${stats.totalDistanceDriven.toLocaleString()} km` : '0 km',
    totalPassengers: stats.totalPassengersTransported ? stats.totalPassengersTransported.toLocaleString() : '0',
    totalEarnings: stats.totalEarnings ? `₺${stats.totalEarnings.toLocaleString()}` : '₺0'
  };
};

export const isDocumentExpiringSoon = (expiryDate, days = 30) => {
  if (!expiryDate) return false;
  
  const expiry = new Date(expiryDate);
  const warning = new Date();
  warning.setDate(warning.getDate() + days);
  
  return expiry <= warning;
};

export const getDocumentStatusColor = (expiryDate) => {
  if (!expiryDate) return '#6b7280'; // gray-500
  
  const expiry = new Date(expiryDate);
  const now = new Date();
  const warning = new Date();
  warning.setDate(warning.getDate() + 30);
  
  if (expiry < now) return '#ef4444'; // red-500 - expired
  if (expiry <= warning) return '#f59e0b'; // amber-500 - expiring soon
  return '#22c55e'; // green-500 - valid
};

export const getDocumentStatusLabel = (expiryDate) => {
  if (!expiryDate) return 'Tarih Yok';
  
  const expiry = new Date(expiryDate);
  const now = new Date();
  const warning = new Date();
  warning.setDate(warning.getDate() + 30);
  
  if (expiry < now) return 'Süresi Dolmuş';
  if (expiry <= warning) return 'Yakında Dolacak';
  return 'Geçerli';
};

export const formatTimeAgo = (date) => {
  if (!date) return 'Bilinmiyor';
  
  const now = new Date();
  const past = new Date(date);
  const diffTime = Math.abs(now - past);
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} dk önce`;
  } else if (diffHours < 24) {
    return `${diffHours} saat önce`;
  } else if (diffDays < 30) {
    return `${diffDays} gün önce`;
  } else {
    return past.toLocaleDateString('tr-TR');
  }
};

// Search Filters
export const DRIVER_SEARCH_FILTERS = {
  ALL: 'Tüm Sürücüler',
  ACTIVE: 'Aktif Sürücüler',
  INACTIVE: 'Pasif Sürücüler',
  DAYTIME: 'Gündüz Vardiya',
  NIGHT: 'Gece Vardiya',
  WITH_PENALTIES: 'Cezalı Sürücüler',
  EXPIRING_LICENSES: 'Lisansı Dolacaklar',
  EXPIRING_HEALTH: 'Sağlık Raporu Dolacaklar'
};

// Sort Options
export const DRIVER_SORT_OPTIONS = {
  firstName: 'Ad',
  lastName: 'Soyad',
  employmentDate: 'İşe Başlama',
  averageRating: 'Puan',
  totalDrivingHours: 'Toplam Saat',
  totalDistanceDriven: 'Toplam Mesafe'
};

// Document Types
export const DRIVER_DOCUMENT_TYPES = {
  DRIVING_LICENSE: 'Ehliyet',
  HEALTH_CERTIFICATE: 'Sağlık Raporu',
  IDENTITY_CARD: 'Kimlik Kartı',
  PSIKOTEKNIK: 'Psikoteknik Raporu',
  SRC_CERTIFICATE: 'SRC Belgesi',
  CRIMINAL_RECORD: 'Adli Sicil',
  CONTRACT: 'İş Sözleşmesi',
  OTHER: 'Diğer'
};

// License Classes
export const DRIVER_LICENSE_CLASSES = {
  D: 'D Sınıfı',
  D1: 'D1 Sınıfı',
  DE: 'DE Sınıfı',
  D1E: 'D1E Sınıfı'
};

// Performance Categories
export const DRIVER_PERFORMANCE_CATEGORIES = {
  EXCELLENT: { min: 4.5, max: 5.0, label: 'Mükemmel', color: '#22c55e' },
  GOOD: { min: 3.5, max: 4.49, label: 'İyi', color: '#f59e0b' },
  AVERAGE: { min: 2.5, max: 3.49, label: 'Orta', color: '#f97316' },
  POOR: { min: 0.0, max: 2.49, label: 'Zayıf', color: '#ef4444' },
  UNRATED: { min: null, max: null, label: 'Değerlendirilmemiş', color: '#6b7280' }
};

export const getPerformanceCategory = (rating) => {
  if (!rating || rating === 0) return DRIVER_PERFORMANCE_CATEGORIES.UNRATED;
  
  for (const [key, category] of Object.entries(DRIVER_PERFORMANCE_CATEGORIES)) {
    if (category.min !== null && category.max !== null) {
      if (rating >= category.min && rating <= category.max) {
        return category;
      }
    }
  }
  
  return DRIVER_PERFORMANCE_CATEGORIES.UNRATED;
};

// Validation Rules
export const DRIVER_VALIDATION_RULES = {
  nationalId: {
    required: true,
    length: 11,
    pattern: /^[0-9]{11}$/,
    message: 'TC Kimlik No 11 haneli olmalıdır'
  },
  licenseNumber: {
    required: true,
    minLength: 6,
    maxLength: 20,
    message: 'Ehliyet numarası 6-20 karakter arası olmalıdır'
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Geçerli bir email adresi giriniz'
  },
  phone: {
    required: false,
    pattern: /^[0-9]{10,11}$/,
    message: 'Telefon numarası 10-11 haneli olmalıdır'
  }
};

// Table Configuration
export const DRIVER_TABLE_CONFIG = {
  pageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
  defaultSort: 'firstName',
  defaultOrder: 'asc'
};
