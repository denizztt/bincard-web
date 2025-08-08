import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { routeApi, stationApi } from '../services/apiService';
import { getRouteTypeLabel, getRouteTypeIcon, formatTimeSlot } from '../constants/routeTypes';
import '../styles/RouteStationSearch.css';

const RouteStationSearch = () => {
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [routesWithBuses, setRoutesWithBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  // İstasyonları yükle
  const loadStations = async () => {
    try {
      const response = await stationApi.getAllStations();
      if (response.success) {
        const stationData = response.data.content || response.data;
        setStations(stationData);
      }
    } catch (error) {
      console.error('Stations loading error:', error);
    }
  };

  // Durağa göre rota arama
  const handleStationSearch = async (e) => {
    e.preventDefault();
    
    if (!selectedStationId) {
      setError('Lütfen bir durak seçin');
      return;
    }

    setLoading(true);
    setError('');
    setSearchPerformed(true);

    try {
      // Seçilen durak bilgisini bul
      const station = stations.find(s => s.id.toString() === selectedStationId);
      setSelectedStation(station);

      // Durağa göre rotaları ve sonraki otobüs bilgilerini getir
      const response = await routeApi.searchRoutesByStation(parseInt(selectedStationId));
      
      if (response.success) {
        setRoutesWithBuses(response.data);
      } else {
        setError('Bu duraktan geçen rota bulunamadı');
        setRoutesWithBuses([]);
      }
    } catch (error) {
      console.error('Station routes search error:', error);
      setError('Rota arama sırasında hata oluştu: ' + (error.response?.data?.message || error.message));
      setRoutesWithBuses([]);
    } finally {
      setLoading(false);
    }
  };

  // Durak değiştiğinde arama sonuçlarını temizle
  const handleStationChange = (e) => {
    setSelectedStationId(e.target.value);
    setSearchPerformed(false);
    setRoutesWithBuses([]);
    setError('');
  };

  // Sayfa yüklendiğinde istasyonları getir
  useEffect(() => {
    loadStations();
  }, []);

  // Sonraki otobüs rengi
  const getBusArrivalColor = (minutes) => {
    if (minutes <= 5) return 'urgent';
    if (minutes <= 15) return 'soon';
    return 'later';
  };

  // Sonraki otobüs metni
  const getBusArrivalText = (minutes) => {
    if (minutes === 0) return 'Durakta';
    if (minutes === 1) return '1 dakika';
    return `${minutes} dakika`;
  };

  return (
    <div className="route-station-search-container">
      {/* Header */}
      <div className="route-station-search-header">
        <div className="header-content">
          <h1>🔍 Durağa Göre Rota Arama</h1>
          <p className="header-description">
            Bir durak seçerek o duraktan geçen rotaları ve sonraki otobüs bilgilerini görüntüleyin
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div className="search-form-section">
        <form onSubmit={handleStationSearch} className="station-search-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stationSelect">Durak Seçimi *</label>
              <select
                id="stationSelect"
                value={selectedStationId}
                onChange={handleStationChange}
                className="station-select"
                required
              >
                <option value="">Durak seçin...</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.name} - {station.city}, {station.district}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                disabled={loading || !selectedStationId}
                className="btn btn-search"
              >
                {loading ? '⏳ Aranıyor...' : '🔍 Rotaları Ara'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="search-results-section">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Selected Station Info */}
        {selectedStation && searchPerformed && (
          <div className="selected-station-info">
            <div className="station-card">
              <div className="station-icon">🚏</div>
              <div className="station-details">
                <h3>{selectedStation.name}</h3>
                <p className="station-location">
                  📍 {selectedStation.city}, {selectedStation.district}
                </p>
                {selectedStation.description && (
                  <p className="station-description">{selectedStation.description}</p>
                )}
              </div>
              <div className="station-stats">
                <div className="stat-item">
                  <span className="stat-value">{routesWithBuses.length}</span>
                  <span className="stat-label">Rota</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {routesWithBuses.reduce((total, route) => total + (route.totalActiveBuses || 0), 0)}
                  </span>
                  <span className="stat-label">Aktif Otobüs</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Routes Results */}
        {searchPerformed && !loading && (
          <>
            {routesWithBuses.length > 0 ? (
              <div className="routes-results">
                <div className="results-header">
                  <h3>🚌 Bu Duraktan Geçen Rotalar</h3>
                  <span className="results-count">{routesWithBuses.length} rota bulundu</span>
                </div>

                <div className="routes-list">
                  {routesWithBuses.map((route) => (
                    <div key={route.id} className="route-result-card">
                      {/* Route Header */}
                      <div className="route-header">
                        <div className="route-info">
                          <span className="route-icon">
                            {getRouteTypeIcon(route.routeType)}
                          </span>
                          <div className="route-details">
                            <h4 className="route-name">{route.name}</h4>
                            <span className="route-code">{route.code}</span>
                          </div>
                          <span className="route-type-badge">
                            {getRouteTypeLabel(route.routeType)}
                          </span>
                        </div>
                        <div className="route-actions">
                          <Link 
                            to={`/routes/${route.id}`}
                            className="btn btn-details"
                          >
                            👁️ Detay
                          </Link>
                        </div>
                      </div>

                      {/* Route Path */}
                      <div className="route-path">
                        <span className="path-start">{route.startStationName}</span>
                        <span className="path-separator">→</span>
                        <span className="path-end">{route.endStationName}</span>
                      </div>

                      {/* Schedule Info */}
                      {route.routeSchedule && (
                        <div className="route-schedule-info">
                          <div className="schedule-item">
                            <span className="schedule-label">Hafta İçi:</span>
                            <div className="schedule-times">
                              {route.routeSchedule.weekdayHours?.slice(0, 3).map(slot => (
                                <span key={slot} className="time-slot">
                                  {formatTimeSlot(slot)}
                                </span>
                              ))}
                              {route.routeSchedule.weekdayHours?.length > 3 && (
                                <span className="more-times">
                                  +{route.routeSchedule.weekdayHours.length - 3} daha
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Next Buses */}
                      <div className="next-buses-section">
                        <h5>🚌 Sonraki Otobüsler</h5>
                        {route.nextBuses && route.nextBuses.length > 0 ? (
                          <div className="next-buses-list">
                            {route.nextBuses.map((bus, index) => (
                              <div key={index} className="next-bus-item">
                                <div className="bus-info">
                                  <span className="bus-plate">{bus.plate}</span>
                                  <span className="bus-direction">
                                    {bus.direction === 'GIDIS' ? '→' : '←'} {bus.directionName}
                                  </span>
                                </div>
                                <div className="bus-details">
                                  <span 
                                    className={`arrival-time ${getBusArrivalColor(bus.arrivalInMinutes)}`}
                                  >
                                    {getBusArrivalText(bus.arrivalInMinutes)}
                                  </span>
                                  <span className="bus-location">
                                    📍 {bus.currentLocation}
                                  </span>
                                  <span className={`occupancy-rate occupancy-${Math.floor(bus.occupancyRate / 25)}`}>
                                    👥 %{bus.occupancyRate}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="no-buses">
                            <span className="no-buses-icon">🚫</span>
                            <p>Şu anda aktif otobüs bulunmuyor</p>
                          </div>
                        )}
                      </div>

                      {/* Route Stats */}
                      <div className="route-stats">
                        <div className="stat-item">
                          <span className="stat-icon">🚌</span>
                          <span className="stat-value">{route.totalActiveBuses || 0}</span>
                          <span className="stat-label">Aktif Otobüs</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-icon">⏱️</span>
                          <span className="stat-value">
                            {route.nextBuses && route.nextBuses.length > 0
                              ? `${Math.min(...route.nextBuses.map(b => b.arrivalInMinutes))} dk`
                              : 'Bilinmiyor'
                            }
                          </span>
                          <span className="stat-label">En Yakın</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-routes-found">
                <div className="no-routes-icon">🚌</div>
                <h3>Rota Bulunamadı</h3>
                <p>
                  {selectedStation 
                    ? `"${selectedStation.name}" durağından geçen aktif rota bulunamadı.`
                    : 'Seçilen duraktan geçen rota bulunamadı.'
                  }
                </p>
                <div className="suggestions">
                  <h4>Öneriler:</h4>
                  <ul>
                    <li>Farklı bir durak seçmeyi deneyin</li>
                    <li>Yakın durakları kontrol edin</li>
                    <li>Rota durumlarının aktif olduğundan emin olun</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RouteStationSearch;
