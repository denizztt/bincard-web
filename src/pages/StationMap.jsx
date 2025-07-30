import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { stationApi } from '../services/apiService';
import { StationType, StationStatus, getStationTypeDisplayName, getStationStatusDisplayName } from '../types';
import { config } from '../config/config';
import '../styles/StationMap.css';

const StationMap = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const markerClustererRef = useRef(null);

  // State
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    type: 'Tümü',
    status: 'Tümü',
    search: ''
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byType: {}
  });

  // Load data and initialize map
  useEffect(() => {
    loadStations();
    loadGoogleMaps();
  }, []);

  // Apply filters when filters or stations change
  useEffect(() => {
    applyFilters();
  }, [stations, filters]);

  // Update map markers when filtered stations change
  useEffect(() => {
    if (mapLoaded && filteredStations.length > 0) {
      updateMapMarkers();
    }
  }, [filteredStations, mapLoaded]);

  const loadStations = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration (replace with API call)
      const mockStations = [
        {
          id: 1,
          name: "Taksim Meydanı Durağı",
          type: "METRO",
          status: "ACTIVE",
          location: { latitude: 41.0369, longitude: 28.9851 },
          address: { city: "İstanbul", district: "Beyoğlu", street: "Taksim Meydanı", fullAddress: "Taksim Meydanı, Beyoğlu, İstanbul" },
          description: "Ana metro transfer noktası"
        },
        {
          id: 2,
          name: "Kadıköy İskele Durağı",
          type: "VAPUR",
          status: "ACTIVE",
          location: { latitude: 40.9996, longitude: 29.0277 },
          address: { city: "İstanbul", district: "Kadıköy", street: "İskele Caddesi", fullAddress: "İskele Caddesi, Kadıköy, İstanbul" },
          description: "Vapur iskele durağı"
        },
        {
          id: 3,
          name: "Mecidiyeköy Metrobüs Durağı",
          type: "METROBUS",
          status: "ACTIVE",
          location: { latitude: 41.0631, longitude: 28.9897 },
          address: { city: "İstanbul", district: "Şişli", street: "Büyükdere Caddesi", fullAddress: "Büyükdere Caddesi, Şişli, İstanbul" },
          description: "Metrobüs hattı durağı"
        },
        {
          id: 4,
          name: "Kızılay Metro Durağı",
          type: "METRO",
          status: "INACTIVE",
          location: { latitude: 39.9208, longitude: 32.8541 },
          address: { city: "Ankara", district: "Çankaya", street: "Kızılay Meydanı", fullAddress: "Kızılay Meydanı, Çankaya, Ankara" },
          description: "Merkezi metro durağı - bakımda"
        },
        {
          id: 5,
          name: "Alsancak Terminal",
          type: "OTOBUS",
          status: "ACTIVE",
          location: { latitude: 38.4237, longitude: 27.1428 },
          address: { city: "İzmir", district: "Konak", street: "Alsancak", fullAddress: "Alsancak, Konak, İzmir" },
          description: "Ana otobüs terminali"
        },
        {
          id: 6,
          name: "Eminönü Vapur İskelesi",
          type: "VAPUR",
          status: "ACTIVE",
          location: { latitude: 41.0167, longitude: 28.9706 },
          address: { city: "İstanbul", district: "Fatih", street: "Eminönü", fullAddress: "Eminönü, Fatih, İstanbul" },
          description: "Tarihi vapur iskelesi"
        }
      ];
      
      setStations(mockStations);
      calculateStats(mockStations);
      setError('');
    } catch (err) {
      console.error('Station loading failed:', err);
      setError('Duraklar yüklenirken hata oluştu: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (stationsData) => {
    const stats = {
      total: stationsData.length,
      active: stationsData.filter(s => s.status === 'ACTIVE').length,
      inactive: stationsData.filter(s => s.status === 'INACTIVE').length,
      byType: {}
    };

    // Calculate by type
    Object.values(StationType).forEach(type => {
      stats.byType[type] = stationsData.filter(s => s.type === type).length;
    });

    setStats(stats);
  };

  const loadGoogleMaps = () => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Load Google Maps script with MarkerClusterer
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMaps.apiKey}&libraries=${config.googleMaps.libraries.join(',')}&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Set up global callback
    window.initMap = () => {
      // Load MarkerClusterer after Google Maps is loaded
      loadMarkerClusterer();
    };
    
    script.onerror = () => {
      setError('Google Maps yüklenemedi. İnternet bağlantınızı kontrol edin.');
    };
    
    document.head.appendChild(script);
  };

  const loadMarkerClusterer = () => {
    // Load MarkerClusterer library
    const clusterScript = document.createElement('script');
    clusterScript.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
    clusterScript.onload = () => {
      initializeMap();
    };
    clusterScript.onerror = () => {
      console.warn('MarkerClusterer yüklenemedi, clustering olmadan devam ediliyor');
      initializeMap();
    };
    document.head.appendChild(clusterScript);
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    try {
      // Default center coordinates from config
      const center = config.googleMaps.defaultCenter;
      
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: config.googleMaps.defaultZoom,
        center: center,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Create info window
      infoWindowRef.current = new window.google.maps.InfoWindow();
      
      setMapLoaded(true);
      
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Harita başlatılırken hata oluştu: ' + err.message);
    }
  };

  const applyFilters = () => {
    let filtered = [...stations];
    
    // Type filter
    if (filters.type !== 'Tümü') {
      filtered = filtered.filter(station => station.type === filters.type);
    }
    
    // Status filter
    if (filters.status !== 'Tümü') {
      filtered = filtered.filter(station => station.status === filters.status);
    }
    
    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(station => 
        station.name.toLowerCase().includes(searchTerm) ||
        station.description?.toLowerCase().includes(searchTerm) ||
        station.address.city.toLowerCase().includes(searchTerm) ||
        station.address.district.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredStations(filtered);
  };

  const updateMapMarkers = () => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Clear existing clusterer
    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers();
    }

    // Create new markers
    const newMarkers = filteredStations.map(station => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: station.location.latitude,
          lng: station.location.longitude
        },
        map: mapInstanceRef.current,
        title: station.name,
        icon: getStationIcon(station.type, station.status)
      });

      // Add click event for info window
      marker.addListener('click', () => {
        showStationInfo(station);
      });

      return marker;
    });

    markersRef.current = newMarkers;

    // Add clustering if library is available
    if (window.markerClusterer && newMarkers.length > 0) {
      try {
        markerClustererRef.current = new window.markerClusterer.MarkerClusterer({
          map: mapInstanceRef.current,
          markers: newMarkers,
        });
      } catch (e) {
        console.warn('Clustering failed, continuing without clustering:', e);
      }
    }

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
      mapInstanceRef.current.fitBounds(bounds);
      
      // Set maximum zoom level
      const listener = window.google.maps.event.addListener(mapInstanceRef.current, "idle", () => {
        if (mapInstanceRef.current.getZoom() > 15) {
          mapInstanceRef.current.setZoom(15);
        }
        window.google.maps.event.removeListener(listener);
      });
    }
  };

  const getStationIcon = (type, status) => {
    let color = '#3498db'; // Default blue
    let icon = '🚌'; // Default bus icon

    // Set icon based on type
    switch (type) {
      case 'METRO':
        icon = '🚇';
        color = '#e74c3c';
        break;
      case 'TRAMVAY':
        icon = '🚊';
        color = '#f39c12';
        break;
      case 'OTOBUS':
        icon = '🚌';
        color = '#3498db';
        break;
      case 'METROBUS':
        icon = '🚌';
        color = '#9b59b6';
        break;
      case 'VAPUR':
        icon = '⛴️';
        color = '#1abc9c';
        break;
      case 'TREN':
        icon = '🚆';
        color = '#34495e';
        break;
      default:
        icon = '🚌';
        color = '#3498db';
    }

    // Adjust color for inactive stations
    if (status === 'INACTIVE') {
      color = '#95a5a6';
    }

    // Create custom SVG icon
    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="16" y="20" text-anchor="middle" font-size="12" fill="white">${icon}</text>
      </svg>
    `;

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon),
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 16)
    };
  };

  const showStationInfo = (station) => {
    const infoContent = `
      <div style="font-family: Arial, sans-serif; max-width: 250px;">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 16px;">${station.name}</h3>
        <div style="margin-bottom: 8px;">
          <strong>Tip:</strong> ${getStationTypeDisplayName(station.type)}
        </div>
        <div style="margin-bottom: 8px;">
          <strong>Durum:</strong> 
          <span style="color: ${station.status === 'ACTIVE' ? '#27ae60' : '#e74c3c'};">
            ${getStationStatusDisplayName(station.status)}
          </span>
        </div>
        <div style="margin-bottom: 8px;">
          <strong>Konum:</strong> ${station.address.district}, ${station.address.city}
        </div>
        <div style="margin-bottom: 8px;">
          <strong>Adres:</strong> ${station.address.street}
        </div>
        ${station.description ? `
          <div style="margin-bottom: 10px;">
            <strong>Açıklama:</strong> ${station.description}
          </div>
        ` : ''}
        <div style="margin-bottom: 8px; font-family: monospace; font-size: 12px; color: #7f8c8d;">
          ${station.location.latitude.toFixed(4)}, ${station.location.longitude.toFixed(4)}
        </div>
        <div style="margin-top: 10px;">
          <button onclick="window.open('https://www.google.com/maps?q=${station.location.latitude},${station.location.longitude}', '_blank')" 
                  style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-right: 5px;">
            🗺️ Google Maps
          </button>
          <button onclick="alert('Düzenleme özelliği yakında!')" 
                  style="background: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
            ✏️ Düzenle
          </button>
        </div>
      </div>
    `;

    infoWindowRef.current.setContent(infoContent);
    infoWindowRef.current.setPosition({
      lat: station.location.latitude,
      lng: station.location.longitude
    });
    infoWindowRef.current.open(mapInstanceRef.current);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const centerToIstanbul = () => {
    if (mapInstanceRef.current) {
      const istanbul = { lat: 41.0082, lng: 28.9784 };
      mapInstanceRef.current.setCenter(istanbul);
      mapInstanceRef.current.setZoom(10);
    }
  };

  const centerToAnkara = () => {
    if (mapInstanceRef.current) {
      const ankara = { lat: 39.9334, lng: 32.8597 };
      mapInstanceRef.current.setCenter(ankara);
      mapInstanceRef.current.setZoom(10);
    }
  };

  const centerToIzmir = () => {
    if (mapInstanceRef.current) {
      const izmir = { lat: 38.4192, lng: 27.1287 };
      mapInstanceRef.current.setCenter(izmir);
      mapInstanceRef.current.setZoom(10);
    }
  };

  if (loading) {
    return (
      <div className="station-map-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Durak haritası yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="station-map-container">
      <div className="station-map-header">
        <div className="header-top">
          <h1 className="page-title">🗺️ Durak Haritası</h1>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/station/add')}
              className="btn btn-primary"
            >
              ➕ Yeni Durak
            </button>
            <button 
              onClick={() => navigate('/station/search')}
              className="btn btn-secondary"
            >
              🔍 Arama
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              ← Dashboard
            </button>
          </div>
        </div>
        <p className="page-description">
          Tüm duraklar Google Maps üzerinde interactive olarak görüntülenir
        </p>
      </div>

      {/* Controls Panel */}
      <div className="controls-panel">
        <div className="controls-section">
          <h3>🎯 Harita Kontrolleri</h3>
          <div className="controls-row">
            <div className="control-group">
              <label>Durak Tipi:</label>
              <select 
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="Tümü">Tümü</option>
                {Object.values(StationType).map(type => (
                  <option key={type} value={type}>{getStationTypeDisplayName(type)}</option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>Durum:</label>
              <select 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="Tümü">Tümü</option>
                {Object.values(StationStatus).map(status => (
                  <option key={status} value={status}>{getStationStatusDisplayName(status)}</option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>Arama:</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Durak adı, şehir, ilçe..."
              />
            </div>
          </div>

          <div className="quick-actions">
            <button onClick={centerToIstanbul} className="btn btn-quick">📍 İstanbul</button>
            <button onClick={centerToAnkara} className="btn btn-quick">📍 Ankara</button>
            <button onClick={centerToIzmir} className="btn btn-quick">📍 İzmir</button>
            <span className="results-count">
              Gösterilen: {filteredStations.length} / {stations.length} durak
            </span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="map-section">
        <div 
          ref={mapRef}
          className="map-container"
          style={{ height: '600px', width: '100%' }}
        >
          {!mapLoaded && (
            <div className="map-loading">
              <div className="spinner"></div>
              <p>Google Maps yükleniyor...</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="statistics-section">
        <h3>📊 Durak İstatistikleri</h3>
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">🚌</div>
            <div className="stat-info">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Toplam Durak</div>
            </div>
          </div>

          <div className="stat-card active">
            <div className="stat-icon">🟢</div>
            <div className="stat-info">
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">Aktif Durak</div>
            </div>
          </div>

          <div className="stat-card inactive">
            <div className="stat-icon">🔴</div>
            <div className="stat-info">
              <div className="stat-value">{stats.inactive}</div>
              <div className="stat-label">Pasif Durak</div>
            </div>
          </div>

          {Object.entries(stats.byType).map(([type, count]) => (
            count > 0 && (
              <div key={type} className="stat-card type">
                <div className="stat-icon">
                  {type === 'METRO' ? '🚇' : 
                   type === 'TRAMVAY' ? '🚊' : 
                   type === 'VAPUR' ? '⛴️' : 
                   type === 'TREN' ? '🚆' : '🚌'}
                </div>
                <div className="stat-info">
                  <div className="stat-value">{count}</div>
                  <div className="stat-label">{getStationTypeDisplayName(type)}</div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {error && (
        <div className="error-section">
          <p>❌ {error}</p>
        </div>
      )}
    </div>
  );
};

export default StationMap; 