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

    // For demo purposes, we'll create a simple map without Google Maps API
    // In production, you would use a real Google Maps API key
    console.log('Google Maps API not available, using demo map');
    setMapLoaded(true);
    setError(''); // Clear any previous errors
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
      // For demo purposes, create a visual map representation
      mapRef.current.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 12px; overflow: hidden;">
          <div style="position: absolute; top: 20px; left: 20px; right: 20px; background: rgba(255,255,255,0.9); padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 10px 0; color: #1976d2;">🗺️ İstanbul Durak Haritası (Demo)</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">Google Maps API entegrasyonu için API anahtarı gereklidir. Bu demo sürümüdür.</p>
          </div>
          <div id="stations-demo" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;"></div>
        </div>
      `;
      
      // Create demo station markers
      createDemoStationMarkers();
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

  const createDemoStationMarkers = () => {
    const demoContainer = document.getElementById('stations-demo');
    if (!demoContainer) return;

    // Clear existing markers
    demoContainer.innerHTML = '';

    filteredStations.forEach((station, index) => {
      const marker = document.createElement('div');
      marker.style.cssText = `
        position: absolute;
        width: 40px;
        height: 40px;
        background: ${getStationColor(station.type, station.status)};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        z-index: 10;
        left: ${20 + (index % 5) * 120}px;
        top: ${120 + Math.floor(index / 5) * 100}px;
      `;
      
      marker.innerHTML = getStationEmoji(station.type);
      marker.title = station.name;
      
      marker.addEventListener('click', () => {
        showDemoStationInfo(station, marker);
      });
      
      marker.addEventListener('mouseenter', () => {
        marker.style.transform = 'scale(1.2)';
        marker.style.zIndex = '20';
      });
      
      marker.addEventListener('mouseleave', () => {
        marker.style.transform = 'scale(1)';
        marker.style.zIndex = '10';
      });

      demoContainer.appendChild(marker);
    });
  };

  const updateMapMarkers = () => {
    if (mapLoaded) {
      createDemoStationMarkers();
    }
  };

  const getStationColor = (type, status) => {
    let color = '#3498db'; // Default blue

    // Set color based on type
    switch (type) {
      case 'METRO':
        color = '#e74c3c';
        break;
      case 'TRAMVAY':
        color = '#f39c12';
        break;
      case 'OTOBUS':
        color = '#3498db';
        break;
      case 'METROBUS':
        color = '#9b59b6';
        break;
      case 'VAPUR':
        color = '#1abc9c';
        break;
      case 'TREN':
        color = '#34495e';
        break;
      default:
        color = '#3498db';
    }

    // Adjust color for inactive stations
    if (status === 'INACTIVE') {
      color = '#95a5a6';
    }

    return color;
  };

  const getStationEmoji = (type) => {
    switch (type) {
      case 'METRO':
        return '🚇';
      case 'TRAMVAY':
        return '🚊';
      case 'OTOBUS':
        return '🚌';
      case 'METROBUS':
        return '🚌';
      case 'VAPUR':
        return '⛴️';
      case 'TREN':
        return '🚆';
      default:
        return '🚌';
    }
  };

  const showDemoStationInfo = (station, markerElement) => {
    // Remove any existing info windows
    const existingInfoWindow = document.querySelector('.demo-info-window');
    if (existingInfoWindow) {
      existingInfoWindow.remove();
    }

    const infoWindow = document.createElement('div');
    infoWindow.className = 'demo-info-window';
    infoWindow.style.cssText = `
      position: absolute;
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      border: 1px solid #ddd;
      max-width: 300px;
      z-index: 1000;
      font-family: 'Inter', sans-serif;
      animation: slideIn 0.3s ease-out;
    `;

    const markerRect = markerElement.getBoundingClientRect();
    const containerRect = mapRef.current.getBoundingClientRect();
    
    infoWindow.style.left = (markerRect.left - containerRect.left + 50) + 'px';
    infoWindow.style.top = (markerRect.top - containerRect.top - 10) + 'px';

    infoWindow.innerHTML = `
      <div style="position: relative;">
        <button onclick="this.parentElement.parentElement.remove()" 
                style="position: absolute; top: -10px; right: -10px; background: #ff4757; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 12px;">✕</button>
        <h3 style="margin: 0 0 12px 0; color: #2c3e50; font-size: 18px; display: flex; align-items: center; gap: 8px;">
          ${getStationEmoji(station.type)} ${station.name}
        </h3>
        <div style="margin-bottom: 8px; color: #666;">
          <strong>Tip:</strong> ${getStationTypeDisplayName(station.type)}
        </div>
        <div style="margin-bottom: 8px; color: #666;">
          <strong>Durum:</strong> 
          <span style="color: ${station.status === 'ACTIVE' ? '#27ae60' : '#e74c3c'}; font-weight: 600;">
            ${getStationStatusDisplayName(station.status)}
          </span>
        </div>
        <div style="margin-bottom: 8px; color: #666;">
          <strong>Konum:</strong> ${station.address.district}, ${station.address.city}
        </div>
        <div style="margin-bottom: 12px; color: #666;">
          <strong>Adres:</strong> ${station.address.street}
        </div>
        ${station.description ? `
          <div style="margin-bottom: 12px; padding: 10px; background: #f8f9fa; border-radius: 6px; color: #666; font-style: italic;">
            ${station.description}
          </div>
        ` : ''}
        <div style="display: flex; gap: 8px; margin-top: 15px;">
          <button onclick="window.open('https://www.google.com/maps?q=${station.location.latitude},${station.location.longitude}', '_blank')" 
                  style="flex: 1; background: #3498db; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            🗺️ Haritada Aç
          </button>
          <button onclick="alert('Düzenleme özelliği geliştirme aşamasında!')" 
                  style="flex: 1; background: #f39c12; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            ✏️ Düzenle
          </button>
        </div>
      </div>
    `;

    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(-10px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    `;
    document.head.appendChild(style);

    mapRef.current.appendChild(infoWindow);
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