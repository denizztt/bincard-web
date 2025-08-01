import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, 
  Bus, 
  Navigation, 
  MapPin, 
  RefreshCw, 
  Filter,
  Eye,
  Route,
  Users,
  Gauge,
  Clock,
  Battery,
  Signal,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { busApi } from '../services/apiService';
import '../styles/BusMap.css';

const BusMap = () => {
  const mapRef = useRef(null);
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRoute, setFilterRoute] = useState('');
  const intervalRef = useRef(null);

  // Demo map data - replace with actual map integration
  const mapCenter = { lat: 39.9334, lng: 32.8597 }; // Ankara center
  const mapBounds = {
    north: 40.1000,
    south: 39.7000,
    east: 33.2000,
    west: 32.5000
  };

  // Bus status colors
  const getBusStatusColor = (status) => {
    switch (status) {
      case 'CALISIYOR':
      case 'HAREKET_HALINDE':
        return '#10b981'; // Green
      case 'DURAKTA_BEKLIYOR':
        return '#3b82f6'; // Blue
      case 'MOLA':
        return '#f59e0b'; // Orange
      case 'ARIZALI':
      case 'BAKIMDA':
        return '#ef4444'; // Red
      case 'GARAJDA':
        return '#6b7280'; // Gray
      default:
        return '#8b5cf6'; // Purple
    }
  };

  // Load buses with location data
  const loadBusesWithLocation = async () => {
    setLoading(true);
    try {
      let response;
      
      if (filterStatus) {
        response = await busApi.getBusesByStatus(filterStatus, 0, 100);
      } else {
        response = await busApi.getActiveBuses(0, 100);
      }

      if (response.success && response.data) {
        const busesData = response.data.content || [];
        
        // Filter buses that have location data
        const busesWithLocation = busesData.filter(bus => 
          bus.currentLatitude && bus.currentLongitude
        );

        setBuses(busesWithLocation);
        
        // Generate demo locations for buses without coordinates
        const busesWithDemoLocation = busesData.map(bus => {
          if (!bus.currentLatitude || !bus.currentLongitude) {
            return {
              ...bus,
              currentLatitude: mapCenter.lat + (Math.random() - 0.5) * 0.2,
              currentLongitude: mapCenter.lng + (Math.random() - 0.5) * 0.4,
              lastLocationUpdate: new Date().toISOString(),
              lastKnownSpeed: Math.random() * 60,
              isDemoLocation: true
            };
          }
          return bus;
        });

        setBuses(busesWithDemoLocation);
      } else {
        setError('Otobüs konumları yüklenirken hata oluştu');
      }
    } catch (err) {
      console.error('Error loading bus locations:', err);
      setError('Otobüs konumları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        loadBusesWithLocation();
      }, refreshInterval * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  // Initial load
  useEffect(() => {
    loadBusesWithLocation();
  }, [filterStatus]);

  // Create demo map
  useEffect(() => {
    if (mapRef.current && buses.length > 0) {
      createDemoMap();
    }
  }, [buses]);

  const createDemoMap = () => {
    const mapContainer = mapRef.current;
    if (!mapContainer) return;

    mapContainer.innerHTML = '';

    // Create map container
    const mapDiv = document.createElement('div');
    mapDiv.className = 'demo-map';
    mapDiv.innerHTML = `
      <div class="map-grid">
        ${Array.from({ length: 20 }, (_, i) => 
          `<div class="grid-line ${i % 4 === 0 ? 'major' : ''}"></div>`
        ).join('')}
      </div>
      <div class="map-legend">
        <div class="legend-item">
          <div class="legend-color" style="background: #10b981;"></div>
          <span>Aktif</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #3b82f6;"></div>
          <span>Durakta</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #f59e0b;"></div>
          <span>Mola</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #ef4444;"></div>
          <span>Arızalı</span>
        </div>
      </div>
    `;

    // Add bus markers
    buses.forEach((bus, index) => {
      const marker = document.createElement('div');
      marker.className = `bus-marker ${selectedBus?.id === bus.id ? 'selected' : ''}`;
      marker.style.cssText = `
        position: absolute;
        left: ${20 + (index % 10) * 8}%;
        top: ${20 + Math.floor(index / 10) * 15}%;
        background: ${getBusStatusColor(bus.status)};
        transform: translate(-50%, -50%);
      `;
      
      marker.innerHTML = `
        <div class="bus-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C8.5 3 6 3.9 6 5v10c0 1.1.9 2 2 2h1c0 1.1.9 2 2 2s2-.9 2-2h2c0 1.1.9 2 2 2s2-.9 2-2h1c1.1 0 2-.9 2-2V5c0-1.1-2.5-2-6-2z"/>
          </svg>
        </div>
        <div class="bus-plate">${bus.numberPlate}</div>
      `;

      marker.addEventListener('click', () => {
        setSelectedBus(bus);
      });

      mapDiv.appendChild(marker);
    });

    mapContainer.appendChild(mapDiv);
  };

  // Format date/time
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('tr-TR');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  // Toggle auto refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  return (
    <div className="bus-map-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1><Map size={24} /> Otobüs Haritası</h1>
          <p>Tüm otobüsleri gerçek zamanlı olarak haritada görüntüleyin</p>
        </div>
        <div className="header-actions">
          <div className="refresh-controls">
            <button
              onClick={toggleAutoRefresh}
              className={`refresh-toggle ${autoRefresh ? 'active' : ''}`}
              title={autoRefresh ? 'Otomatik yenilemeyi durdur' : 'Otomatik yenilemeyi başlat'}
            >
              {autoRefresh ? <Pause size={16} /> : <Play size={16} />}
              {autoRefresh ? 'Dur' : 'Başlat'}
            </button>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="refresh-interval"
              disabled={!autoRefresh}
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1dk</option>
              <option value={300}>5dk</option>
            </select>
            <button
              onClick={loadBusesWithLocation}
              className="manual-refresh"
              disabled={loading}
              title="Manuel yenile"
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="map-controls">
        <div className="controls-left">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="">Tüm Durumlar</option>
              <option value="CALISIYOR">Çalışıyor</option>
              <option value="HAREKET_HALINDE">Hareket Halinde</option>
              <option value="DURAKTA_BEKLIYOR">Durakta Bekliyor</option>
              <option value="MOLA">Mola</option>
              <option value="ARIZALI">Arızalı</option>
              <option value="GARAJDA">Garajda</option>
            </select>
          </div>
        </div>
        
        <div className="controls-right">
          <div className="map-stats">
            <div className="stat-item">
              <Bus size={16} />
              <span>{buses.length} Otobüs</span>
            </div>
            <div className="stat-item active">
              <Navigation size={16} />
              <span>{buses.filter(b => b.status === 'HAREKET_HALINDE').length} Hareket</span>
            </div>
            <div className="stat-item stopped">
              <MapPin size={16} />
              <span>{buses.filter(b => b.status === 'DURAKTA_BEKLIYOR').length} Durakta</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      {/* Main Content */}
      <div className="map-content">
        {/* Map Container */}
        <div className="map-section">
          <div className="map-container" ref={mapRef}>
            {loading ? (
              <div className="map-loading">
                <RefreshCw className="spinning" size={48} />
                <p>Harita yükleniyor...</p>
              </div>
            ) : buses.length === 0 ? (
              <div className="map-empty">
                <Bus size={48} />
                <p>Konumu bilinen otobüs bulunamadı</p>
                <button onClick={loadBusesWithLocation} className="retry-btn">
                  <RotateCcw size={16} />
                  Tekrar Dene
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Bus Details Panel */}
        <div className={`details-panel ${selectedBus ? 'open' : ''}`}>
          {selectedBus ? (
            <div className="bus-details">
              <div className="details-header">
                <div className="bus-info">
                  <Bus size={20} />
                  <h3>{selectedBus.numberPlate}</h3>
                  <span className={`status-badge status-${selectedBus.status.toLowerCase()}`}>
                    {selectedBus.statusDisplayName || selectedBus.status}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedBus(null)}
                  className="close-details"
                >
                  ×
                </button>
              </div>

              <div className="details-content">
                {/* Basic Info */}
                <div className="info-section">
                  <h4>Temel Bilgiler</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <Route size={16} />
                      <div>
                        <span className="label">Rota</span>
                        <span className="value">{selectedBus.assignedRouteName || 'Atanmamış'}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <Users size={16} />
                      <div>
                        <span className="label">Kapasite</span>
                        <span className="value">{selectedBus.currentPassengerCount}/{selectedBus.capacity}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                <div className="info-section">
                  <h4>Konum Bilgileri</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <MapPin size={16} />
                      <div>
                        <span className="label">Koordinatlar</span>
                        <span className="value">
                          {selectedBus.currentLatitude?.toFixed(6)}, {selectedBus.currentLongitude?.toFixed(6)}
                          {selectedBus.isDemoLocation && <em> (Demo)</em>}
                        </span>
                      </div>
                    </div>
                    <div className="info-item">
                      <Gauge size={16} />
                      <div>
                        <span className="label">Hız</span>
                        <span className="value">{Math.round(selectedBus.lastKnownSpeed || 0)} km/h</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <Clock size={16} />
                      <div>
                        <span className="label">Son Güncelleme</span>
                        <span className="value">
                          {formatTime(selectedBus.lastLocationUpdate)}
                          <br />
                          <small>{formatDate(selectedBus.lastLocationUpdate)}</small>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Station */}
                {selectedBus.nextStation && (
                  <div className="info-section">
                    <h4>Sonraki Durak</h4>
                    <div className="next-station">
                      <MapPin size={16} />
                      <div>
                        <span className="station-name">{selectedBus.nextStation.name}</span>
                        {selectedBus.estimatedArrivalMinutes && (
                          <span className="arrival-time">
                            ~{selectedBus.estimatedArrivalMinutes} dk
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="details-actions">
                  <button 
                    onClick={() => window.location.href = `/bus/detail/${selectedBus.id}`}
                    className="action-btn primary"
                  >
                    <Eye size={16} />
                    Detayları Gör
                  </button>
                  <button 
                    onClick={() => window.location.href = `/bus/${selectedBus.id}/location-history`}
                    className="action-btn secondary"
                  >
                    <Clock size={16} />
                    Rota Geçmişi
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <Bus size={48} />
              <p>Detayları görmek için haritadan bir otobüs seçin</p>
            </div>
          )}
        </div>
      </div>

      {/* Auto Refresh Indicator */}
      {autoRefresh && (
        <div className="refresh-indicator">
          <div className="refresh-progress"></div>
          <span>Otomatik yenileniyor ({refreshInterval}s)</span>
        </div>
      )}
    </div>
  );
};

export default BusMap;