import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit,
  MapPin,
  RefreshCw,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Bus,
  Clock,
  Users,
  Route,
  Trash2
} from 'lucide-react';
import { stationApi } from '../services/apiService';
import { getStationTypeLabel, getStationTypeIcon } from '../constants/stationTypes';
import '../styles/StationDetail.css';

const StationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // State management
  const [station, setStation] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  // Load station data
  useEffect(() => {
    if (id) {
      loadStationData();
      loadStationRoutes();
    }
  }, [id]);

  const loadStationData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await stationApi.getStationById(parseInt(id));
      
      if (response && (response.isSuccess || response.success)) {
        setStation(response.data);
      } else {
        throw new Error(response?.message || 'Durak bilgileri yüklenemedi');
      }
    } catch (error) {
      console.error('Durak yükleme hatası:', error);
      setError('Durak bilgileri yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const loadStationRoutes = async () => {
    try {
      setRoutesLoading(true);
      
      const response = await stationApi.getStationRoutes(parseInt(id));
      
      if (response && (response.isSuccess || response.success)) {
        setRoutes(response.data || []);
      } else {
        console.log('Routes not found or error:', response?.message);
        setRoutes([]);
      }
    } catch (error) {
      console.error('Routes yükleme hatası:', error);
      setRoutes([]);
    } finally {
      setRoutesLoading(false);
    }
  };

  // Toggle station status
  const toggleStationStatus = async () => {
    if (!station) return;

    try {
      setActionLoading(prev => ({...prev, status: true}));
      
      const response = await stationApi.changeStationStatus(station.id, !station.active);
      
      if (response && (response.isSuccess || response.success)) {
        setStation(prev => ({
          ...prev,
          active: !prev.active
        }));
      } else {
        throw new Error(response?.message || 'Durum değiştirilemedi');
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
      setError('Durum değiştirilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setActionLoading(prev => ({...prev, status: false}));
    }
  };

  // Delete station
  const deleteStation = async () => {
    if (!station) return;
    
    if (!window.confirm('Bu durağı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setActionLoading(prev => ({...prev, delete: true}));
      
      const response = await stationApi.deleteStation(station.id);
      
      if (response && (response.isSuccess || response.success)) {
        // Redirect to station list
        navigate('/station-list');
      } else {
        throw new Error(response?.message || 'Durak silinemedi');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      setError('Durak silinirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setActionLoading(prev => ({...prev, delete: false}));
    }
  };


  if (loading) {
    return (
      <div className="station-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Durak bilgileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error && !station) {
    return (
      <div className="station-detail-container">
        <div className="error-container">
          <AlertCircle size={48} />
          <h3>Bir hata oluştu</h3>
          <p>{error}</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/station-list')}
          >
            Durak Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="station-detail-container">
        <div className="error-container">
          <AlertCircle size={48} />
          <h3>Durak bulunamadı</h3>
          <p>Aradığınız durak mevcut değil veya silinmiş olabilir.</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/station-list')}
          >
            Durak Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="station-detail-container">
      {/* Header */}
      <div className="station-detail-header">
        <div className="header-left">
          <button 
            className="btn-back"
            onClick={() => navigate('/station-list')}
          >
            <ArrowLeft size={20} />
            Durak Listesi
          </button>
          
          <h1>Durak Detayları</h1>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-edit"
            onClick={() => navigate(`/station-form/${station.id}`)}
          >
            <Edit size={16} />
            Düzenle
          </button>
          
          <button 
            className="btn-delete"
            onClick={deleteStation}
            disabled={actionLoading.delete}
          >
            {actionLoading.delete ? (
              <RefreshCw size={16} className="spinning" />
            ) : (
              <Trash2 size={16} />
            )}
            Sil
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="station-detail-content">
        {/* Station Info Card */}
        <div className="station-info-card">
          <div className="station-header">
            <div className="station-title">
              <span className="station-icon">
                {getStationTypeIcon(station.type)}
              </span>
              <div>
                <h2>{station.name}</h2>
                <span className="station-type">
                  {getStationTypeLabel(station.type)}
                </span>
              </div>
            </div>
            
            <div className="station-status">
              <button
                className={`status-toggle ${station.active ? 'active' : 'inactive'}`}
                onClick={toggleStationStatus}
                disabled={actionLoading.status}
              >
                {actionLoading.status ? (
                  <RefreshCw size={16} className="spinning" />
                ) : station.active ? (
                  <ToggleRight size={16} />
                ) : (
                  <ToggleLeft size={16} />
                )}
                {station.active ? 'Aktif' : 'Pasif'}
              </button>
            </div>
          </div>

          <div className="station-details">
            <div className="detail-section">
              <h4>
                <MapPin size={16} />
                Konum Bilgileri
              </h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Enlem:</label>
                  <span>{station.latitude?.toFixed(6)}</span>
                </div>
                <div className="detail-item">
                  <label>Boylam:</label>
                  <span>{station.longitude?.toFixed(6)}</span>
                </div>
                <div className="detail-item">
                  <label>Şehir:</label>
                  <span>{station.city}</span>
                </div>
                <div className="detail-item">
                  <label>İlçe:</label>
                  <span>{station.district}</span>
                </div>
                <div className="detail-item">
                  <label>Sokak:</label>
                  <span>{station.street}</span>
                </div>
                {station.postalCode && (
                  <div className="detail-item">
                    <label>Posta Kodu:</label>
                    <span>{station.postalCode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Routes Section */}
        <div className="station-routes-card">
          <div className="routes-header">
            <h3>
              <Route size={20} />
              Bu Duraktan Geçen Güzergahlar
            </h3>
            <button 
              className="btn-refresh"
              onClick={loadStationRoutes}
              disabled={routesLoading}
            >
              <RefreshCw size={16} className={routesLoading ? 'spinning' : ''} />
            </button>
          </div>

          {routesLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span>Güzergahlar yükleniyor...</span>
            </div>
          ) : routes.length === 0 ? (
            <div className="no-routes">
              <Bus size={48} />
              <h4>Güzergah Bulunamadı</h4>
              <p>Bu duraktan geçen herhangi bir güzergah bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="routes-list">
              {routes.map((route, index) => (
                <div key={route.id || index} className="route-card">
                  <div className="route-header">
                    <div className="route-info">
                      <h4>{route.name || route.code}</h4>
                      <span className="route-type">{route.routeType}</span>
                    </div>
                  </div>
                  
                  <div className="route-details">
                    <div className="route-path">
                      <span className="start-station">{route.startStationName}</span>
                      <div className="route-arrow">→</div>
                      <span className="end-station">{route.endStationName}</span>
                    </div>
                  </div>

                  {/* Next Buses Info */}
                  {route.nextBuses && route.nextBuses.length > 0 && (
                    <div className="next-buses">
                      <h5>
                        <Clock size={14} />
                        Yaklaşan Araçlar
                      </h5>
                      <div className="buses-list">
                        {route.nextBuses.map((bus, busIndex) => (
                          <div key={busIndex} className="bus-info">
                            <div className="bus-details">
                              <span className="bus-plate">{bus.plate}</span>
                              <span className="bus-direction">{bus.directionName}</span>
                            </div>
                            <div className="bus-eta">
                              <span className="eta-time">{bus.arrivalInMinutes} dk</span>
                              {bus.occupancyRate && (
                                <span className="occupancy">
                                  <Users size={12} />
                                  %{bus.occupancyRate}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Section (Placeholder) */}
        <div className="station-map-card">
          <h3>
            <MapPin size={20} />
            Harita Konumu
          </h3>
          <div className="map-placeholder">
            <MapPin size={48} />
            <p>Harita özelliği yakında eklenecektir.</p>
            <div className="coordinates">
              Koordinatlar: {station.latitude?.toFixed(6)}, {station.longitude?.toFixed(6)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationDetail;