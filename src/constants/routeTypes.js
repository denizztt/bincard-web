// Route Constants and Enums

// Direction Types
export const DIRECTION_TYPES = {
  GIDIS: 'GIDIS',
  DONUS: 'DONUS'
};

// Route Types
export const ROUTE_TYPES = {
  CITY_BUS: 'CITY_BUS',
  METRO: 'METRO',
  METROBUS: 'METROBUS',
  TRAM: 'TRAM',
  FERRY: 'FERRY',
  MINIBUS: 'MINIBUS',
  EXPRESS: 'EXPRESS'
};

// Route Type Display Names
export const ROUTE_TYPE_LABELS = {
  CITY_BUS: 'Şehir İçi Otobüs',
  METRO: 'Metro',
  METROBUS: 'Metrobüs',
  TRAM: 'Tramvay',
  FERRY: 'Vapur',
  MINIBUS: 'Minibüs',
  EXPRESS: 'Ekspres'
};

// Direction Type Display Names
export const DIRECTION_TYPE_LABELS = {
  GIDIS: 'Gidiş',
  DONUS: 'Dönüş'
};

// Time Slots for Route Schedules
export const TIME_SLOTS = [
  'T_05_00', 'T_05_15', 'T_05_30', 'T_05_45',
  'T_06_00', 'T_06_15', 'T_06_30', 'T_06_45',
  'T_07_00', 'T_07_15', 'T_07_30', 'T_07_45',
  'T_08_00', 'T_08_15', 'T_08_30', 'T_08_45',
  'T_09_00', 'T_09_15', 'T_09_30', 'T_09_45',
  'T_10_00', 'T_10_15', 'T_10_30', 'T_10_45',
  'T_11_00', 'T_11_15', 'T_11_30', 'T_11_45',
  'T_12_00', 'T_12_15', 'T_12_30', 'T_12_45',
  'T_13_00', 'T_13_15', 'T_13_30', 'T_13_45',
  'T_14_00', 'T_14_15', 'T_14_30', 'T_14_45',
  'T_15_00', 'T_15_15', 'T_15_30', 'T_15_45',
  'T_16_00', 'T_16_15', 'T_16_30', 'T_16_45',
  'T_17_00', 'T_17_15', 'T_17_30', 'T_17_45',
  'T_18_00', 'T_18_15', 'T_18_30', 'T_18_45',
  'T_19_00', 'T_19_15', 'T_19_30', 'T_19_45',
  'T_20_00', 'T_20_15', 'T_20_30', 'T_20_45',
  'T_21_00', 'T_21_15', 'T_21_30', 'T_21_45',
  'T_22_00', 'T_22_15', 'T_22_30', 'T_22_45',
  'T_23_00', 'T_23_15', 'T_23_30', 'T_23_45',
  'T_00_00'
];

// Time Slot to Human Readable Format
export const formatTimeSlot = (timeSlot) => {
  return timeSlot.substring(2).replace('_', ':');
};

// Route Status
export const ROUTE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Route Colors (predefined options)
export const ROUTE_COLORS = [
  '#FF5722', // Deep Orange
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#673AB7', // Deep Purple
  '#3F51B5', // Indigo
  '#2196F3', // Blue
  '#03A9F4', // Light Blue
  '#00BCD4', // Cyan
  '#009688', // Teal
  '#4CAF50', // Green
  '#8BC34A', // Light Green
  '#CDDC39', // Lime
  '#FFEB3B', // Yellow
  '#FFC107', // Amber
  '#FF9800', // Orange
  '#795548', // Brown
  '#607D8B', // Blue Grey
];

// Helper Functions
export const getRouteTypeLabel = (routeType) => {
  return ROUTE_TYPE_LABELS[routeType] || routeType;
};

export const getDirectionTypeLabel = (directionType) => {
  return DIRECTION_TYPE_LABELS[directionType] || directionType;
};

export const getRouteTypeIcon = (routeType) => {
  switch (routeType) {
    case 'CITY_BUS':
      return '🚌';
    case 'METRO':
      return '🚇';
    case 'METROBUS':
      return '🚐';
    case 'TRAM':
      return '🚋';
    case 'FERRY':
      return '⛴️';
    case 'MINIBUS':
      return '🚐';
    case 'EXPRESS':
      return '🚌';
    default:
      return '🚌';
  }
};

export const getDirectionIcon = (directionType) => {
  switch (directionType) {
    case 'GIDIS':
      return '→';
    case 'DONUS':
      return '←';
    default:
      return '↔';
  }
};
