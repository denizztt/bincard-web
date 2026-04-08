// Bus Status Types ve Helper Functions
export const BUS_STATUSES = {
  CALISIYOR: 'Çalışıyor',
  ARIZALI: 'Arızalı', 
  BAKIMDA: 'Bakımda',
  SERVIS_DISI: 'Servis Dışı',
  DURAKTA_BEKLIYOR: 'Durakta Bekliyor',
  HAREKET_HALINDE: 'Hareket Halinde',
  GARAJDA: 'Garajda',
  TEMIZLIK: 'Temizlik',
  YAKIT_ALIMI: 'Yakıt Alımı',
  MOLA: 'Mola'
};

// Status colors for UI - Sade gri tonları
export const BUS_STATUS_COLORS = {
  CALISIYOR: '#6b7280',
  ARIZALI: '#6b7280',
  BAKIMDA: '#6b7280',
  SERVIS_DISI: '#6b7280',
  DURAKTA_BEKLIYOR: '#6b7280',
  HAREKET_HALINDE: '#6b7280',
  GARAJDA: '#6b7280',
  TEMIZLIK: '#6b7280',
  YAKIT_ALIMI: '#6b7280',
  MOLA: '#6b7280'
};

// Status icons
export const BUS_STATUS_ICONS = {
  CALISIYOR: '🚍',
  ARIZALI: '⚠️',
  BAKIMDA: '🔧',
  SERVIS_DISI: '🚫',
  DURAKTA_BEKLIYOR: '🚏',
  HAREKET_HALINDE: '🚌',
  GARAJDA: '🏠',
  TEMIZLIK: '🧽',
  YAKIT_ALIMI: '⛽',
  MOLA: '⏸️'
};

// Helper functions
export const getBusStatusLabel = (status) => {
  return BUS_STATUSES[status] || status;
};

export const getBusStatusColor = (status) => {
  return BUS_STATUS_COLORS[status] || '#6b7280';
};

export const getBusStatusIcon = (status) => {
  return BUS_STATUS_ICONS[status] || '🚍';
};

// Check if bus can take passengers
export const canTakePassengers = (status) => {
  return ['CALISIYOR', 'DURAKTA_BEKLIYOR', 'HAREKET_HALINDE'].includes(status);
};

// Check if bus is operational
export const isOperational = (status) => {
  return !['SERVIS_DISI', 'ARIZALI', 'BAKIMDA', 'GARAJDA'].includes(status);
};

// Format occupancy rate
export const formatOccupancyRate = (rate) => {
  if (rate === null || rate === undefined) return '0%';
  return `${Math.round(rate)}%`;
};

// Get occupancy level
export const getOccupancyLevel = (rate) => {
  if (rate === null || rate === undefined) return 'empty';
  if (rate < 30) return 'low';
  if (rate < 70) return 'medium';
  if (rate < 90) return 'high';
  return 'full';
};

// Occupancy colors - Sade gri tonları
export const OCCUPANCY_COLORS = {
  empty: '#9ca3af',
  low: '#9ca3af',
  medium: '#6b7280',
  high: '#4b5563',
  full: '#374151'
};

export const getOccupancyColor = (rate) => {
  const level = getOccupancyLevel(rate);
  return OCCUPANCY_COLORS[level];
};

// Format distance
export const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return 'Bilinmiyor';
  if (distance < 1000) return `${Math.round(distance)}m`;
  return `${(distance / 1000).toFixed(1)}km`;
};

// Format speed
export const formatSpeed = (speed) => {
  if (speed === null || speed === undefined) return 'Bilinmiyor';
  return `${Math.round(speed)} km/h`;
};

// Format time
export const formatTimeAgo = (dateTime) => {
  if (!dateTime) return 'Bilinmiyor';
  
  const now = new Date();
  const time = new Date(dateTime);
  const diffInSeconds = Math.floor((now - time) / 1000);
  
  if (diffInSeconds < 60) return 'Az önce';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
  return `${Math.floor(diffInSeconds / 86400)} gün önce`;
};

// Search filters
export const BUS_SEARCH_FILTERS = {
  ALL: 'Tümü',
  ACTIVE: 'Aktif',
  INACTIVE: 'Pasif',
  WITH_DRIVER: 'Şoförlü',
  WITHOUT_DRIVER: 'Şoförsüz',
  WITH_ROUTE: 'Rotalı',
  WITHOUT_ROUTE: 'Rotasız'
};

// Sort options
export const BUS_SORT_OPTIONS = [
  { value: 'numberPlate', label: 'Plaka' },
  { value: 'status', label: 'Durum' },
  { value: 'occupancyRate', label: 'Doluluk Oranı' },
  { value: 'lastLocationUpdate', label: 'Son Güncelleme' },
  { value: 'createdAt', label: 'Oluşturulma Tarihi' }
];

// Default form values
export const DEFAULT_BUS_FORM = {
  numberPlate: '',
  routeId: null,
  driverId: null,
  baseFare: 0,
  capacity: 50,
  notes: ''
};

// Validation rules
export const BUS_VALIDATION = {
  numberPlate: {
    required: true,
    minLength: 2,
    maxLength: 20,
    pattern: /^[A-Z0-9\s]+$/
  },
  baseFare: {
    required: true,
    min: 0,
    max: 1000
  },
  capacity: {
    required: true,
    min: 10,
    max: 200
  }
};

// Table columns configuration
export const BUS_TABLE_COLUMNS = [
  { key: 'numberPlate', label: 'Plaka', sortable: true },
  { key: 'status', label: 'Durum', sortable: true },
  { key: 'driver', label: 'Şoför', sortable: false },
  { key: 'route', label: 'Rota', sortable: false },
  { key: 'occupancy', label: 'Doluluk', sortable: true },
  { key: 'lastUpdate', label: 'Son Güncelleme', sortable: true },
  { key: 'actions', label: 'İşlemler', sortable: false }
];
