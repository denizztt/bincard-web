import React, { useState, useEffect } from 'react';
import { stationApi } from '../services/apiService';
import GoogleMapWrapper from '../components/GoogleMapWrapper';
import { DEFAULT_MAP_CENTER } from '../config/googleMaps';
import '../styles/StationMap.css';

const StationMap = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState(11);

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

  // İstasyon tıklama olayı
  const handleStationClick = (station) => {
    setSelectedStation(station);
    console.log('Seçilen istasyon:', station);
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

  return (
    <div className="station-map-container">
      {/* Header */}
      <div className="station-map-header">
        <div className="header-left">
          <h1>İstasyon Haritası</h1>
          <p className="header-description">
            Tüm istasyonların harita üzerinde konumlarını görüntüleyin
          </p>
        </div>
        <div className="header-actions">
          <button 
            onClick={loadStations}
            className="btn btn-refresh"
            disabled={loading}
          >
            🔄 Yenile
          </button>
          <button 
            onClick={() => {
              setMapCenter(DEFAULT_MAP_CENTER);
              setMapZoom(11);
              setSelectedStation(null);
            }}
            className="btn btn-center"
          >
            🎯 Merkeze Dön
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Main Content */}
      <div className="station-map-content">
        {/* Sidebar */}
        <div className="station-sidebar">
          <div className="sidebar-header">
            <h3>İstasyonlar ({stations.length})</h3>
            {loading && <span className="loading-text">Yükleniyor...</span>}
          </div>
          
          <div className="station-list">
            {stations.map(station => (
              <div 
                key={station.id} 
                className={`station-item ${selectedStation?.id === station.id ? 'selected' : ''}`}
                onClick={() => focusOnStation(station)}
              >
                <div className="station-info">
                  <h4 className="station-name">{station.name}</h4>
                  <p className="station-address">{station.address}</p>
                  <div className="station-coords">
                    <span>📍 {station.latitude?.toFixed(6)}, {station.longitude?.toFixed(6)}</span>
                  </div>
                </div>
                <div className="station-actions">
                  <button 
                    className="btn-focus"
                    onClick={(e) => {
                      e.stopPropagation();
                      focusOnStation(station);
                    }}
                  >
                    👁️
                  </button>
                </div>
              </div>
            ))}
            
            {!loading && stations.length === 0 && (
              <div className="no-stations">
                <div className="no-stations-icon">�</div>
                <p>Henüz koordinatları tanımlanmış istasyon bulunmuyor</p>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="map-section">
          <GoogleMapWrapper
            stations={stations}
            buses={[]} // İsteğe bağlı: otobüsleri de gösterebiliriz
            onStationClick={handleStationClick}
            center={mapCenter}
            zoom={mapZoom}
            height="600px"
          />
          
          {/* Map Info */}
          {selectedStation && (
            <div className="map-info-panel">
              <div className="info-header">
                <h4>🚏 {selectedStation.name}</h4>
                <button 
                  onClick={() => setSelectedStation(null)}
                  className="btn-close"
                >
                  ✖️
                </button>
              </div>
              <div className="info-content">
                <p><strong>Adres:</strong> {selectedStation.address}</p>
                <p><strong>Koordinatlar:</strong> {selectedStation.latitude?.toFixed(6)}, {selectedStation.longitude?.toFixed(6)}</p>
                {selectedStation.description && (
                  <p><strong>Açıklama:</strong> {selectedStation.description}</p>
                )}
                <div className="info-actions">
                  <button className="btn btn-primary">
                    📋 Detayları Görüntüle
                  </button>
                  <button className="btn btn-secondary">
                    ✏️ Düzenle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="map-statistics">
        <div className="stat-item">
          <span className="stat-number">{stations.length}</span>
          <span className="stat-label">Toplam İstasyon</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stations.filter(s => s.latitude && s.longitude).length}</span>
          <span className="stat-label">Haritada Gösterilen</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stations.filter(s => !s.latitude || !s.longitude).length}</span>
          <span className="stat-label">Koordinatsız</span>
        </div>
      </div>
    </div>
  );
};

export default StationMap;
