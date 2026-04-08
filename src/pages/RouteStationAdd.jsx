import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { routeApi, stationApi } from '../services/apiService';
import { getDirectionTypeLabel } from '../constants/routeTypes';
import '../styles/RouteStationAdd.css';

const RouteStationAdd = () => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const directionFromUrl = searchParams.get('direction') || 'GIDIS';

  const [route, setRoute] = useState(null);
  const [stations, setStations] = useState([]);
  const [directionStations, setDirectionStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [selectedDirection, setSelectedDirection] = useState(directionFromUrl);
  const [afterStationId, setAfterStationId] = useState('');
  const [newStationId, setNewStationId] = useState('');

  // Rota bilgilerini yükle
  const loadRouteDetails = async () => {
    try {
      const response = await routeApi.getRouteById(routeId);
      if (response.success) {
        setRoute(response.data);
      } else {
        setError('Rota bilgileri yüklenemedi');
      }
    } catch (error) {
      console.error('Route details loading error:', error);
      setError('Rota bilgileri yüklenirken hata oluştu');
    }
  };

  // Tüm istasyonları yükle
  const loadStations = async () => {
    try {
      const response = await stationApi.getAllStations();
      if (response.success) {
        setStations(response.data.content || response.data);
      }
    } catch (error) {
      console.error('Stations loading error:', error);
    }
  };

  // Yöndeki mevcut durakları yükle
  const loadDirectionStations = async (direction) => {
    try {
      const response = await routeApi.getStationsInDirection(routeId, direction);
      if (response.success) {
        setDirectionStations(response.data);
      }
    } catch (error) {
      console.error('Direction stations loading error:', error);
    }
  };

  // Yön değiştiğinde durakları yeniden yükle
  useEffect(() => {
    if (selectedDirection) {
      loadDirectionStations(selectedDirection);
    }
  }, [selectedDirection, routeId]);

  // Durak ekleme işlemi
  const handleAddStation = async (e) => {
    e.preventDefault();
    
    if (!afterStationId || !newStationId) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (afterStationId === newStationId) {
      setError('Başlangıç ve hedef durak aynı olamaz');
      return;
    }

    // Durağın zaten mevcut olup olmadığını kontrol et
    const stationExists = directionStations.some(
      stationOrder => stationOrder.station.id.toString() === newStationId
    );
    
    if (stationExists) {
      setError('Bu durak zaten bu yönde mevcut');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await routeApi.addStationToDirection(
        parseInt(routeId),
        selectedDirection,
        parseInt(afterStationId),
        parseInt(newStationId)
      );

      if (response.success) {
        alert('Durak başarıyla eklendi');
        navigate(`/routes/${routeId}`);
      } else {
        setError('Durak eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Add station error:', error);
      setError('Durak eklenirken hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadRouteDetails(),
        loadStations()
      ]);
      setLoading(false);
    };

    if (routeId) {
      loadData();
    }
  }, [routeId]);

  if (loading && !route) {
    return (
      <div className="route-station-add-loading">
        <div className="loading-spinner"></div>
        <p>Sayfa yükleniyor...</p>
      </div>
    );
  }

  if (error && !route) {
    return (
      <div className="route-station-add-error">
        <div className="error-message">
          ⚠️ {error}
        </div>
        <button onClick={() => navigate(`/routes/${routeId}`)} className="btn btn-primary">
          ← Rota Detayına Dön
        </button>
      </div>
    );
  }

  // Mevcut durağa göre filtrelenmiş istasyonlar
  const availableStations = stations.filter(station => 
    !directionStations.some(stationOrder => stationOrder.station.id === station.id)
  );

  return (
    <div className="route-station-add-container">
      {/* Header */}
      <div className="route-station-add-header">
        <div className="header-left">
          <button 
            onClick={() => navigate(`/routes/${routeId}`)}
            className="btn btn-back"
          >
            ← Geri
          </button>
          <div className="route-info">
            <h1>🚏 Durak Ekle</h1>
            <p className="route-name">
              {route ? `${route.name} (${route.code})` : 'Rota Yükleniyor...'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="route-station-add-content">
        <form onSubmit={handleAddStation} className="add-station-form">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* Direction Selection */}
          <div className="form-section">
            <h3>🛣️ Yön Seçimi</h3>
            <div className="direction-selector">
              <label className="direction-option">
                <input
                  type="radio"
                  name="direction"
                  value="GIDIS"
                  checked={selectedDirection === 'GIDIS'}
                  onChange={(e) => setSelectedDirection(e.target.value)}
                />
                <span className="direction-label">
                  → {getDirectionTypeLabel('GIDIS')}
                </span>
              </label>
              <label className="direction-option">
                <input
                  type="radio"
                  name="direction"
                  value="DONUS"
                  checked={selectedDirection === 'DONUS'}
                  onChange={(e) => setSelectedDirection(e.target.value)}
                />
                <span className="direction-label">
                  ← {getDirectionTypeLabel('DONUS')}
                </span>
              </label>
            </div>
          </div>

          {/* Current Stations */}
          <div className="form-section">
            <h3>📍 Mevcut Duraklar ({getDirectionTypeLabel(selectedDirection)})</h3>
            {directionStations.length > 0 ? (
              <div className="current-stations">
                {directionStations.map((stationOrder, index) => (
                  <div key={index} className="current-station">
                    <span className="station-order">{stationOrder.order + 1}</span>
                    <span className="station-name">{stationOrder.station.name}</span>
                    <span className="station-location">
                      {stationOrder.station.city}, {stationOrder.station.district}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-stations">
                <p>Bu yönde henüz durak bulunmuyor</p>
              </div>
            )}
          </div>

          {/* Station Selection */}
          <div className="form-section">
            <h3>➕ Durak Ekleme</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="afterStationId">Bu Durağın Ardından Ekle *</label>
                <select
                  id="afterStationId"
                  value={afterStationId}
                  onChange={(e) => setAfterStationId(e.target.value)}
                  required
                  disabled={directionStations.length === 0}
                >
                  <option value="">
                    {directionStations.length === 0 ? 'Mevcut durak yok' : 'Durak seçin...'}
                  </option>
                  {directionStations.map((stationOrder) => (
                    <option key={stationOrder.station.id} value={stationOrder.station.id}>
                      {stationOrder.order + 1}. {stationOrder.station.name}
                    </option>
                  ))}
                </select>
                {directionStations.length === 0 && (
                  <small className="form-help">
                    Bu yönde henüz durak olmadığı için durak ekleyemezsiniz
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newStationId">Eklenecek Durak *</label>
                <select
                  id="newStationId"
                  value={newStationId}
                  onChange={(e) => setNewStationId(e.target.value)}
                  required
                >
                  <option value="">Durak seçin...</option>
                  {availableStations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.name} - {station.city}, {station.district}
                    </option>
                  ))}
                </select>
                <small className="form-help">
                  Sadece bu yönde bulunmayan duraklar gösterilir
                </small>
              </div>
            </div>
          </div>

          {/* Add Preview */}
          {afterStationId && newStationId && (
            <div className="form-section">
              <h3>👁️ Ekleme Önizlemesi</h3>
              <div className="add-preview">
                {(() => {
                  const afterStation = directionStations.find(
                    s => s.station.id.toString() === afterStationId
                  );
                  const newStation = stations.find(
                    s => s.id.toString() === newStationId
                  );
                  
                  return (
                    <div className="preview-chain">
                      <div className="preview-station existing">
                        <span className="station-name">{afterStation?.station.name}</span>
                        <span className="station-label">Mevcut</span>
                      </div>
                      <div className="preview-arrow">→</div>
                      <div className="preview-station new">
                        <span className="station-name">{newStation?.name}</span>
                        <span className="station-label">Yeni</span>
                      </div>
                      <div className="preview-arrow">→</div>
                      <div className="preview-station existing">
                        <span className="station-name">Sonraki Durak</span>
                        <span className="station-label">Mevcut</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/routes/${routeId}`)}
              className="btn btn-secondary"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !afterStationId || !newStationId || directionStations.length === 0}
              className="btn btn-primary"
            >
              {loading ? '⏳ Ekleniyor...' : '✅ Durağı Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteStationAdd;
