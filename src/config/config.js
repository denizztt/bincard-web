// Application Configuration
export const config = {
  // Google Maps API Configuration
  googleMaps: {
    apiKey: 'AIzaSyBRYfrvFsxgARSM_iE7JA1EHu1nSpaWAxc',
    libraries: ['geometry', 'places'],
    defaultCenter: {
      lat: 41.0082, // İstanbul koordinatları
      lng: 28.9784
    },
    defaultZoom: 11
  },

  // API Configuration
  api: {
    baseUrl: 'http://localhost:8080/v1/api',
    timeout: 30000
  },

  // Application Settings
  app: {
    name: 'Super Admin Web',
    version: '1.0.0',
    platform: 'WEB'
  }
};

export default config; 