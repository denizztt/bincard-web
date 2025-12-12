import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  RefreshCw, 
  X, 
  Eye, 
  Edit, 
  FileText,
  Filter,
  ChevronRight,
  AlertCircle,
  Loader2,
  Map as MapIcon
} from 'lucide-react';
import { stationApi } from '../services/apiService';
import GoogleMapWrapper from '../components/GoogleMapWrapper';
import { DEFAULT_MAP_CENTER } from '../config/googleMaps';
import { getStationTypeLabel, getStationTypeIcon } from '../constants/stationTypes';
import '../styles/StationMap.css';

const StationMap = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState(11);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showSidebar, setShowSidebar] = useState(true);

  // İstasyonları yükle
  const loadStations = async () => {
    setLoading(true);
    setError('');
    try {
      // Tüm istasyonları getir (sayfalama olmadan)
      const response = await stationApi.getAllStations(0, 1000);
      if (response.success && response.data) {
        const stationsData = response.data.content || [];
        // Koordinatları olan istasyonları filtrele
        const validStations = stationsData.filter(station => 
          station.latitude && station.longitude
        );
        setStations(validStations);
        
        // Eğer istasyon varsa, harita merkezini ayarla
        if (validStations.length > 0) {
          const firstStation = validStations[0];
          setMapCenter({
            lat: firstStation.latitude,
            lng: firstStation.longitude
          });
        }
      } else {
        setError('İstasyonlar yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Stations loading error:', error);
      setError('İstasyonlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  // Filtrelenmiş istasyonlar
  const filteredStations = useMemo(() => {
    return stations.filter(station => {
      const matchesSearch = station.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           station.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           station.district?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || station.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [stations, searchQuery, filterType]);

  // İstasyon türleri için seçenekler
  const stationTypes = useMemo(() => {
    const types = new Set(stations.map(s => s.type).filter(Boolean));
    return Array.from(types);
  }, [stations]);

  // İstasyon tıklama olayı
  const handleStationClick = (station) => {
    setSelectedStation(station);
    focusOnStation(station);
  };

  // Harita merkezini istasyona odakla
  const focusOnStation = (station) => {
    setMapCenter({
      lat: station.latitude,
      lng: station.longitude
    });
    setMapZoom(15);
    setSelectedStation(station);
  };

  // İstatistikler
  const stats = useMemo(() => {
    const total = stations.length;
    const withCoords = stations.filter(s => s.latitude && s.longitude).length;
    const withoutCoords = total - withCoords;
    const active = stations.filter(s => s.active !== false).length;
    const inactive = total - active;
    
    return { total, withCoords, withoutCoords, active, inactive };
  }, [stations]);

  return (
    <div className="station-map-page">
      {/* Top Header */}
      <div className="map-page-header">
        <div className="header-content">
          <div className="header-title-section">
            <div className="title-icon">
              <MapIcon size={28} />
            </div>
            <div>
              <h1>Durak Haritası</h1>
              <p className="header-subtitle">
                Tüm durakların konumlarını harita üzerinde görüntüleyin ve yönetin
              </p>
            </div>
          </div>
          
          <div className="header-actions-group">
            <button 
              onClick={loadStations}
              className="btn-icon-text"
              disabled={loading}
              title="Yenile"
            >
              <RefreshCw size={18} className={loading ? 'spinning' : ''} />
              <span>Yenile</span>
            </button>
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="btn-icon-text sidebar-toggle"
              title={showSidebar ? 'Sidebar\'ı Gizle' : 'Sidebar\'ı Göster'}
            >
              <Filter size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="map-page-content">
        {/* Sidebar */}
        {showSidebar && (
          <div className="map-sidebar">
            <div className="sidebar-header-modern">
              <h3>
                <MapPin size={20} />
                Duraklar
                <span className="badge">{filteredStations.length}</span>
              </h3>
            </div>

            {/* Search and Filter */}
            <div className="sidebar-controls">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Durak ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="clear-search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {stationTypes.length > 0 && (
                <div className="filter-group">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Tüm Durak Türleri</option>
                    {stationTypes.map(type => (
                      <option key={type} value={type}>
                        {getStationTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Station List */}
            <div className="station-list-modern">
              {loading ? (
                <div className="loading-state">
                  <Loader2 size={32} className="spinning" />
                  <p>Duraklar yükleniyor...</p>
                </div>
              ) : filteredStations.length === 0 ? (
                <div className="empty-state">
                  <MapPin size={48} />
                  <h4>Durak bulunamadı</h4>
                  <p>
                    {searchQuery || filterType !== 'all' 
                      ? 'Arama kriterlerinize uygun durak bulunamadı'
                      : 'Henüz koordinatları tanımlanmış durak bulunmuyor'}
                  </p>
                </div>
              ) : (
                filteredStations.map(station => (
                  <div 
                    key={station.id} 
                    className={`station-card ${selectedStation?.id === station.id ? 'active' : ''}`}
                    onClick={() => handleStationClick(station)}
                  >
                    <div className="station-card-header">
                      <div className="station-icon-badge">
                        {getStationTypeIcon(station.type)}
                      </div>
                      <div className="station-title-group">
                        <h4 className="station-card-name">{station.name}</h4>
                        <span className="station-type-badge">
                          {getStationTypeLabel(station.type)}
                        </span>
                      </div>
                      {station.active !== false ? (
                        <span className="status-badge active">Aktif</span>
                      ) : (
                        <span className="status-badge inactive">Pasif</span>
                      )}
                    </div>
                    
                    <div className="station-card-body">
                      {(station.city || station.district) && (
                        <div className="station-location">
                          <MapPin size={14} />
                          <span>
                            {[station.city, station.district, station.street]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                      
                      {station.latitude && station.longitude && (
                        <div className="station-coordinates">
                          <span className="coord-label">Koordinatlar:</span>
                          <span className="coord-value">
                            {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="station-card-footer">
                      <button 
                        className="btn-card-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStationClick(station);
                        }}
                      >
                        <Eye size={16} />
                        <span>Görüntüle</span>
                      </button>
                      <button 
                        className="btn-card-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/station/${station.id}`);
                        }}
                      >
                        <FileText size={16} />
                        <span>Detay</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Map Section */}
        <div className="map-container-modern">
          {loading && stations.length === 0 ? (
            <div className="map-loading-overlay">
              <Loader2 size={48} className="spinning" />
              <p>Harita yükleniyor...</p>
            </div>
          ) : (
            <>
              <GoogleMapWrapper
                stations={filteredStations}
                buses={[]}
                onStationClick={handleStationClick}
                center={mapCenter}
                zoom={mapZoom}
                height="100%"
              />
              
              {/* Selected Station Info Panel */}
              {selectedStation && (
                <div className="station-info-panel-modern">
                  <div className="info-panel-header">
                    <div className="info-panel-title">
                      <div className="info-icon">
                        {getStationTypeIcon(selectedStation.type)}
                      </div>
                      <div>
                        <h3>{selectedStation.name}</h3>
                        <span className="info-type-badge">
                          {getStationTypeLabel(selectedStation.type)}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedStation(null)}
                      className="btn-close-modern"
                      title="Kapat"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="info-panel-content">
                    {(selectedStation.city || selectedStation.district) && (
                      <div className="info-row">
                        <MapPin size={16} />
                        <div>
                          <label>Konum</label>
                          <p>
                            {[selectedStation.city, selectedStation.district, selectedStation.street]
                              .filter(Boolean)
                              .join(', ') || 'Belirtilmemiş'}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedStation.latitude && selectedStation.longitude && (
                      <div className="info-row">
                        <MapIcon size={16} />
                        <div>
                          <label>Koordinatlar</label>
                          <p className="coordinates-text">
                            {selectedStation.latitude.toFixed(6)}, {selectedStation.longitude.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="info-row">
                      <div>
                        <label>Durum</label>
                        <p>
                          {selectedStation.active !== false ? (
                            <span className="status-indicator active">Aktif</span>
                          ) : (
                            <span className="status-indicator inactive">Pasif</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="info-panel-actions">
                    <button 
                      className="btn-info-primary"
                      onClick={() => navigate(`/station/${selectedStation.id}`)}
                    >
                      <FileText size={18} />
                      <span>Detayları Görüntüle</span>
                    </button>
                    <button 
                      className="btn-info-secondary"
                      onClick={() => navigate(`/station-form/${selectedStation.id}`)}
                    >
                      <Edit size={18} />
                      <span>Düzenle</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="map-statistics-bar">
        <div className="stat-card">
          <div className="stat-icon total">
            <MapPin size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Toplam Durak</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active">
            <MapPin size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">Aktif</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon inactive">
            <MapPin size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.inactive}</span>
            <span className="stat-label">Pasif</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon mapped">
            <MapIcon size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.withCoords}</span>
            <span className="stat-label">Haritada</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationMap;
