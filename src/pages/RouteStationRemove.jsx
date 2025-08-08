import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { routeApi } from '../services/apiService';
import { getDirectionTypeLabel } from '../constants/routeTypes';
import '../styles/RouteStationRemove.css';

const RouteStationRemove = () => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const directionFromUrl = searchParams.get('direction') || 'GIDIS';
  const stationIdFromUrl = searchParams.get('stationId');

  const [route, setRoute] = useState(null);
  const [directionStations, setDirectionStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [selectedDirection, setSelectedDirection] = useState(directionFromUrl);
  const [selectedStationId, setSelectedStationId] = useState(stationIdFromUrl || '');

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

  // Durak silme işlemi
  const handleRemoveStation = async (e) => {
    e.preventDefault();
    
    if (!selectedStationId) {
      setError('Lütfen silinecek durağı seçin');
      return;
    }

    const selectedStation = directionStations.find(
      stationOrder => stationOrder.station.id.toString() === selectedStationId
    );

    if (!selectedStation) {
      setError('Seçilen durak bulunamadı');
      return;
    }

    // Başlangıç ve bitiş durağı kontrolü
    if (selectedStation.order === 0) {
      setError('Başlangıç durağı silinemez');
      return;
    }

    const isLastStation = selectedStation.order === directionStations.length - 1;
    if (isLastStation) {
      setError('Bitiş durağı silinemez');
      return;
    }

    const confirmMessage = `"${selectedStation.station.name}" durağını bu yönden silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await routeApi.removeStationFromDirection(
        parseInt(routeId),
        selectedDirection,
        parseInt(selectedStationId)
      );

      if (response.success) {
        alert('Durak başarıyla silindi');
        navigate(`/routes/${routeId}`);
      } else {
        setError('Durak silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Remove station error:', error);
      setError('Durak silinirken hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadRouteDetails();
      setLoading(false);
    };

    if (routeId) {
      loadData();
    }
  }, [routeId]);

  if (loading && !route) {
    return (
      <div className="route-station-remove-loading">
        <div className="loading-spinner"></div>
        <p>Sayfa yükleniyor...</p>
      </div>
    );
  }

  if (error && !route) {
    return (
      <div className="route-station-remove-error">
        <div className="error-message">
          ⚠️ {error}
        </div>
        <button onClick={() => navigate(`/routes/${routeId}`)} className="btn btn-primary">
          ← Rota Detayına Dön
        </button>
      </div>
    );
  }

  // Silinebilir duraklar (başlangıç ve bitiş hariç)
  const removableStations = directionStations.filter(
    stationOrder => stationOrder.order > 0 && stationOrder.order < directionStations.length - 1
  );

  return (
    <div className="route-station-remove-container">
      {/* Header */}
      <div className="route-station-remove-header">
        <div className="header-left">
          <button 
            onClick={() => navigate(`/routes/${routeId}`)}
            className="btn btn-back"
          >
            ← Geri
          </button>
          <div className="route-info">
            <h1>🗑️ Durak Sil</h1>
            <p className="route-name">
              {route ? `${route.name} (${route.code})` : 'Rota Yükleniyor...'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="route-station-remove-content">
        <form onSubmit={handleRemoveStation} className="remove-station-form">
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
                {directionStations.map((stationOrder, index) => {
                  const isRemovable = stationOrder.order > 0 && stationOrder.order < directionStations.length - 1;
                  const isSelected = stationOrder.station.id.toString() === selectedStationId;
                  
                  return (
                    <div 
                      key={index} 
                      className={`current-station ${!isRemovable ? 'not-removable' : ''} ${isSelected ? 'selected' : ''}`}
                    >
                      <span className="station-order">{stationOrder.order + 1}</span>
                      <span className="station-name">{stationOrder.station.name}</span>
                      <span className="station-location">
                        {stationOrder.station.city}, {stationOrder.station.district}
                      </span>
                      <span className="station-status">
                        {stationOrder.order === 0 && (
                          <span className="status-badge start">Başlangıç</span>
                        )}
                        {stationOrder.order === directionStations.length - 1 && (
                          <span className="status-badge end">Bitiş</span>
                        )}
                        {isRemovable && (
                          <span className="status-badge removable">Silinebilir</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-stations">
                <p>Bu yönde durak bulunmuyor</p>
              </div>
            )}
          </div>

          {/* Station Selection for Removal */}
          {removableStations.length > 0 ? (
            <div className="form-section">
              <h3>🗑️ Silinecek Durak Seçimi</h3>
              
              <div className="form-group">
                <label htmlFor="selectedStationId">Silinecek Durak *</label>
                <select
                  id="selectedStationId"
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  required
                >
                  <option value="">Durak seçin...</option>
                  {removableStations.map((stationOrder) => (
                    <option key={stationOrder.station.id} value={stationOrder.station.id}>
                      {stationOrder.order + 1}. {stationOrder.station.name}
                    </option>
                  ))}
                </select>
                <small className="form-help">
                  Sadece ara duraklar silinebilir. Başlangıç ve bitiş durakları silinemez.
                </small>
              </div>

              {/* Removal Preview */}
              {selectedStationId && (
                <div className="removal-preview">
                  <h4>⚠️ Silme Önizlemesi</h4>
                  {(() => {
                    const selectedStation = directionStations.find(
                      s => s.station.id.toString() === selectedStationId
                    );
                    const prevStation = directionStations.find(
                      s => s.order === selectedStation.order - 1
                    );
                    const nextStation = directionStations.find(
                      s => s.order === selectedStation.order + 1
                    );
                    
                    return (
                      <div className="preview-chain">
                        <div className="preview-station existing">
                          <span className="station-name">{prevStation?.station.name}</span>
                          <span className="station-label">Önceki</span>
                        </div>
                        <div className="preview-arrow">→</div>
                        <div className="preview-station removing">
                          <span className="station-name">{selectedStation?.station.name}</span>
                          <span className="station-label">Silinecek</span>
                        </div>
                        <div className="preview-arrow">→</div>
                        <div className="preview-station existing">
                          <span className="station-name">{nextStation?.station.name}</span>
                          <span className="station-label">Sonraki</span>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="preview-result">
                    <p><strong>Sonuç:</strong> Bu durak silinecek ve bağlantılar otomatik olarak yeniden düzenlenecek.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="form-section">
              <div className="no-removable-stations">
                <div className="no-stations-icon">🚫</div>
                <h3>Silinebilir Durak Yok</h3>
                <p>
                  Bu yönde silinebilir ara durak bulunmuyor. 
                  Başlangıç ve bitiş durakları silinemez.
                </p>
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
              disabled={loading || !selectedStationId || removableStations.length === 0}
              className="btn btn-danger"
            >
              {loading ? '⏳ Siliniyor...' : '🗑️ Durağı Sil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteStationRemove;
