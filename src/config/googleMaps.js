// Google Maps Configuration

// Google Maps API Key - Production'da environment variable'dan alınmalı
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

// Google Maps Konfigürasyon
export const GOOGLE_MAPS_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places', 'geometry', 'drawing'],
  language: 'tr',
  region: 'TR'
};

// Varsayılan harita merkezi (İstanbul)
export const DEFAULT_MAP_CENTER = {
  lat: 41.0082,
  lng: 28.9784
};

// Varsayılan harita ayarları
export const DEFAULT_MAP_OPTIONS = {
  zoom: 11,
  center: DEFAULT_MAP_CENTER,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
  gestureHandling: 'cooperative',
  styles: [
    // Custom map styling - isteğe bağlı
  ]
};

// Marker renkleri
export const MARKER_COLORS = {
  STATION: '#22c55e',     // green
  BUS_ACTIVE: '#3b82f6',  // blue  
  BUS_INACTIVE: '#6b7280', // gray
  BUS_MAINTENANCE: '#f59e0b', // amber
  ROUTE: '#8b5cf6'        // purple
};

// Harita stilleri
export const MAP_STYLES = {
  NORMAL: [],
  DARK: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
  ],
  LIGHT: [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] }
  ]
};

// Utility functions
export const createMarkerIcon = (color, type = 'circle') => {
  return {
    path: type === 'circle' ? google.maps.SymbolPath.CIRCLE : google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: type === 'circle' ? 8 : 6
  };
};

export const formatCoordinates = (lat, lng) => {
  return {
    lat: parseFloat(lat),
    lng: parseFloat(lng)
  };
};

export const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
