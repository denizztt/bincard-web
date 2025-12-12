import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { routeApi } from '../services/apiService';
import { 
  getRouteTypeLabel, 
  getRouteTypeIcon, 
  getDirectionTypeLabel, 
  formatTimeSlot 
} from '../constants/routeTypes';
import '../styles/RouteDetail.css';

const RouteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [directions, setDirections] = useState([]);
  const [activeDirection, setActiveDirection] = useState('GIDIS');
  const [directionStations, setDirectionStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rota detaylarını yükle
  const loadRouteDetails = async () => {
    try {
      const response = await routeApi.getRouteById(id);
      if (response.success) {
        setRoute(response.data);
      } else {
        setError('Rota detayları yüklenemedi');
      }
    } catch (error) {
      console.error('Route details loading error:', error);
      setError('Rota detayları yüklenirken hata oluştu');
    }
  };

  // Rota yönlerini yükle
  const loadRouteDirections = async () => {
    try {
      const response = await routeApi.getRouteDirections(id);
      if (response.success) {
        setDirections(response.data);
      }
    } catch (error) {
      console.error('Route directions loading error:', error);
    }
  };

  // Belirli yöndeki durakları yükle
  const loadDirectionStations = async (directionType) => {
    try {
      const response = await routeApi.getStationsInDirection(id, directionType);
      if (response.success) {
        setDirectionStations(response.data);
      }
    } catch (error) {
      console.error('Direction stations loading error:', error);
    }
  };

  // Yön değiştirme
  const handleDirectionChange = (directionType) => {
    setActiveDirection(directionType);
    loadDirectionStations(directionType);
  };

  // Favorilere ekleme
  const handleAddFavorite = async () => {
    try {
      const response = await routeApi.addFavorite(route.id);
      if (response.success) {
        alert('Rota favorilere eklendi');
      } else {
        alert('Favorilere eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Add favorite error:', error);
      alert('Favorilere eklenirken hata oluştu');
    }
  };

  // Rota silme
  const handleDeleteRoute = async () => {
    if (!window.confirm('Bu rotayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await routeApi.deleteRoute(route.id);
      if (response.success) {
        alert('Rota başarıyla silindi');
        navigate('/route');
      } else {
        alert('Rota silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Delete route error:', error);
      alert('Rota silinirken hata oluştu');
    }
  };

  // Sayfa yüklendiğinde
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadRouteDetails(),
        loadRouteDirections()
      ]);
      setLoading(false);
    };

    if (id) {
      loadData();
    }
  }, [id]);

  // İlk yön yüklendiğinde durakları getir
  useEffect(() => {
    if (directions.length > 0) {
      const firstDirection = directions[0];
      setActiveDirection(firstDirection.type);
      loadDirectionStations(firstDirection.type);
    }
  }, [directions]);

  if (loading) {
    return (
      <div className="route-detail-loading">
        <div className="loading-spinner"></div>
        <p>Rota detayları yükleniyor...</p>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="route-detail-error">
        <div className="error-message">
          ⚠️ {error || 'Rota bulunamadı'}
        </div>
        <button onClick={() => navigate('/route')} className="btn btn-primary">
          ← Rota Listesine Dön
        </button>
      </div>
    );
  }

  return (
    <div className="route-detail-container">
      {/* Header */}
      <div className="route-detail-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/route')}
            className="btn btn-back"
          >
            ← Geri
          </button>
          <div className="route-title">
            <span className="route-icon">{getRouteTypeIcon(route.routeType)}</span>
            <div className="route-info">
              <h1>{route.name}</h1>
              <span className="route-code">Kod: {route.code}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button 
            onClick={handleAddFavorite}
            className="btn btn-favorite"
          >
            ⭐ Favorilere Ekle
          </button>
          <Link 
            to={`/route/${route.id}/stations`}
            className="btn btn-edit"
          >
            🛠️ Durakları Yönet
          </Link>
          <button 
            onClick={handleDeleteRoute}
            className="btn btn-delete"
          >
            🗑️ Sil
          </button>
        </div>
      </div>

      {/* Route Info Cards */}
      <div className="route-info-cards">
        <div className="info-card">
          <div className="info-label">Tip</div>
          <div className="info-value">
            {getRouteTypeLabel(route.routeType)}
          </div>
        </div>
        <div className="info-card">
          <div className="info-label">Güzergah</div>
          <div className="info-value path">
            <span>{route.startStation?.name}</span>
            <span className="separator">→</span>
            <span>{route.endStation?.name}</span>
          </div>
        </div>
        <div className="info-card">
          <div className="info-label">Tahmini Süre</div>
          <div className="info-value">
            {route.estimatedDurationMinutes ? `${route.estimatedDurationMinutes} dakika` : 'Belirtilmemiş'}
          </div>
        </div>
        <div className="info-card">
          <div className="info-label">Toplam Mesafe</div>
          <div className="info-value">
            {route.totalDistanceKm ? `${route.totalDistanceKm.toFixed(1)} km` : 'Belirtilmemiş'}
          </div>
        </div>
      </div>

      {/* Description */}
      {route.description && (
        <div className="route-description">
          <h3>📋 Açıklama</h3>
          <p>{route.description}</p>
        </div>
      )}

      {/* Schedule */}
      {route.schedule && (
        <div className="route-schedule">
          <h3>⏰ Çalışma Saatleri</h3>
          <div className="schedule-grid">
            <div className="schedule-item">
              <h4>Hafta İçi</h4>
              <div className="time-slots">
                {route.schedule.weekdayHours?.length > 0 ? (
                  route.schedule.weekdayHours.map(slot => (
                    <span key={slot} className="time-slot">
                      {formatTimeSlot(slot)}
                    </span>
                  ))
                ) : (
                  <span className="no-schedule">Belirtilmemiş</span>
                )}
              </div>
            </div>
            <div className="schedule-item">
              <h4>Hafta Sonu</h4>
              <div className="time-slots">
                {route.schedule.weekendHours?.length > 0 ? (
                  route.schedule.weekendHours.map(slot => (
                    <span key={slot} className="time-slot">
                      {formatTimeSlot(slot)}
                    </span>
                  ))
                ) : (
                  <span className="no-schedule">Belirtilmemiş</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Directions and Stations */}
      <div className="route-directions-section">
        <h3>🛣️ Rota Yönleri ve Durakları</h3>
        
        {/* Direction Tabs */}
        {directions.length > 0 && (
          <div className="direction-tabs">
            {directions.map(direction => (
              <button
                key={direction.type}
                className={`direction-tab ${activeDirection === direction.type ? 'active' : ''}`}
                onClick={() => handleDirectionChange(direction.type)}
              >
                <span className="direction-icon">
                  {direction.type === 'GIDIS' ? '→' : '←'}
                </span>
                <span className="direction-label">
                  {getDirectionTypeLabel(direction.type)}
                </span>
                <span className="direction-name">
                  {direction.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Direction Details */}
        {directions.length > 0 && (
          <div className="direction-details">
            {(() => {
              const currentDirection = directions.find(d => d.type === activeDirection);
              return currentDirection ? (
                <div className="direction-info">
                  <div className="direction-stats">
                    <div className="stat-item">
                      <span className="stat-label">Durak Sayısı</span>
                      <span className="stat-value">{currentDirection.totalStationCount}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Tahmini Süre</span>
                      <span className="stat-value">
                        {currentDirection.estimatedDurationMinutes ? 
                          `${currentDirection.estimatedDurationMinutes} dk` : 
                          'Belirtilmemiş'}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Toplam Mesafe</span>
                      <span className="stat-value">
                        {currentDirection.totalDistanceKm ? 
                          `${currentDirection.totalDistanceKm.toFixed(1)} km` : 
                          'Belirtilmemiş'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Stations List */}
        <div className="stations-section">
          <div className="stations-header">
            <h4>🚏 Durak Listesi ({getDirectionTypeLabel(activeDirection)})</h4>
            <Link 
              to={`/route/${route.id}/stations/add?direction=${activeDirection}`}
              className="btn btn-add-station"
            >
              ➕ Durak Ekle
            </Link>
          </div>

          {directionStations.length > 0 ? (
            <div className="stations-list">
              {directionStations.map((stationOrder, index) => (
                <div key={index} className="station-item">
                  <div className="station-order">
                    <span className="order-number">{stationOrder.order + 1}</span>
                  </div>
                  <div className="station-info">
                    <div className="station-name">{stationOrder.station.name}</div>
                    <div className="station-details">
                      <span className="station-location">
                        📍 {stationOrder.station.city}, {stationOrder.station.district}
                      </span>
                      {stationOrder.estimatedTimeFromPrevious && stationOrder.order > 0 && (
                        <span className="travel-time">
                          ⏱️ {stationOrder.estimatedTimeFromPrevious} dk
                        </span>
                      )}
                      {stationOrder.distanceFromPrevious && stationOrder.order > 0 && (
                        <span className="travel-distance">
                          📏 {stationOrder.distanceFromPrevious.toFixed(1)} km
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="station-actions">
                    <span 
                      className={`status-badge ${stationOrder.isActive ? 'active' : 'inactive'}`}
                    >
                      {stationOrder.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                    {stationOrder.order > 0 && (
              <Link 
                to={`/route/${route.id}/stations/remove?direction=${activeDirection}&stationId=${stationOrder.station.id}`}
                className="btn btn-remove-station"
              >
                🗑️ Çıkar
              </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-stations">
              <div className="no-stations-icon">🚏</div>
              <p>Bu yönde henüz durak bulunmuyor</p>
              <Link 
                to={`/route/${route.id}/stations/add?direction=${activeDirection}`}
                className="btn btn-primary"
              >
                ➕ İlk Durağı Ekle
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteDetail;
