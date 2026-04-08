import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { routeApi, stationApi } from '../services/apiService';
import { getRouteTypeLabel, getRouteTypeIcon } from '../constants/routeTypes';
import '../styles/RouteStations.css';

const RouteStations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [stations, setStations] = useState([]);
  const [availableStations, setAvailableStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStationId, setSelectedStationId] = useState('');
  const [addingStation, setAddingStation] = useState(false);

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

  // Rota duraklarını yükle
  const loadRouteStations = async () => {
    try {
      const response = await routeApi.getRouteStations(id);
      if (response.success) {
        // StationOrderDTO[]'yi StationDTO[]'ye dönüştür
        const stationsData = response.data.map(item => ({
          ...item.station,
          order: item.order,
          estimatedTimeFromPrevious: item.estimatedTimeFromPrevious,
          distanceFromPrevious: item.distanceFromPrevious,
          isActive: item.isActive
        }));
        setStations(stationsData);
      } else {
        setError('Rota durakları yüklenemedi');
      }
    } catch (error) {
      console.error('Route stations loading error:', error);
      setError('Rota durakları yüklenirken hata oluştu');
    }
  };

  // Mevcut durakları yükle
  const loadAvailableStations = async () => {
    try {
      const response = await stationApi.getAllStations();
      if (response.success) {
        const stationData = response.data.content || response.data;
        setAvailableStations(stationData);
      }
    } catch (error) {
      console.error('Available stations loading error:', error);
    }
  };

  // Durak ekle
  const handleAddStation = async () => {
    if (!selectedStationId) {
      setError('Lütfen bir durak seçin');
      return;
    }

    setAddingStation(true);
    try {
      const response = await routeApi.addStationToRoute(id, selectedStationId);
      if (response.success) {
        setSelectedStationId('');
        loadRouteStations();
        alert('Durak başarıyla eklendi');
      } else {
        setError('Durak eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Add station error:', error);
      setError('Durak eklenirken hata oluştu');
    } finally {
      setAddingStation(false);
    }
  };

  // Durak kaldır
  const handleRemoveStation = async (stationId) => {
    if (!window.confirm('Bu durağı rotadan kaldırmak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await routeApi.removeStationFromRoute(id, stationId);
      if (response.success) {
        loadRouteStations();
        alert('Durak başarıyla kaldırıldı');
      } else {
        setError('Durak kaldırılırken hata oluştu');
      }
    } catch (error) {
      console.error('Remove station error:', error);
      setError('Durak kaldırılırken hata oluştu');
    }
  };

  // Durak sırasını değiştir
  const handleReorderStations = async (stationId, newOrder) => {
    try {
      const response = await routeApi.updateStationOrder(id, stationId, newOrder);
      if (response.success) {
        loadRouteStations();
      }
    } catch (error) {
      console.error('Reorder stations error:', error);
    }
  };

  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadRouteDetails(),
        loadRouteStations(),
        loadAvailableStations()
      ]);
      setLoading(false);
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="route-stations-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Rota durakları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !route) {
    return (
      <div className="route-stations-container">
        <div className="error-container">
          <h2>Hata</h2>
          <p>{error}</p>
          <Link to="/route" className="btn btn-secondary">
            ← Rota Listesine Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="route-stations-container">
      {/* Header */}
      <div className="route-stations-header">
        <div className="header-left">
          <Link to="/route" className="back-link">
            ← Rota Listesine Dön
          </Link>
          <h1>🚏 Rota Durakları</h1>
          {route && (
            <div className="route-info">
              <span className="route-icon">
                {getRouteTypeIcon(route.routeType)}
              </span>
              <div className="route-details">
                <div className="route-name">{route.name}</div>
                <div className="route-code">{route.code}</div>
                <div className="route-type">
                  {getRouteTypeLabel(route.routeType)}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="header-actions">
          <Link to={`/route/${id}`} className="btn btn-secondary">
            👁️ Rota Detayı
          </Link>
        </div>
      </div>

      {/* Add Station Section */}
      <div className="add-station-section">
        <h3>➕ Durak Ekle</h3>
        <div className="add-station-form">
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="station-select"
            disabled={addingStation}
          >
            <option value="">Durak seçin...</option>
            {availableStations
              .filter(station => !stations.find(s => s.id === station.id))
              .map(station => (
                <option key={station.id} value={station.id}>
                  {station.name} ({station.code})
                </option>
              ))
            }
          </select>
          <button
            onClick={handleAddStation}
            disabled={!selectedStationId || addingStation}
            className="btn btn-primary"
          >
            {addingStation ? 'Ekleniyor...' : 'Durak Ekle'}
          </button>
        </div>
      </div>

      {/* Stations List */}
      <div className="stations-section">
        <h3>📋 Mevcut Duraklar ({stations.length})</h3>
        
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {stations.length === 0 ? (
          <div className="no-stations">
            <div className="no-stations-icon">🚏</div>
            <h4>Henüz durak eklenmemiş</h4>
            <p>Bu rotaya durak eklemek için yukarıdaki formu kullanın</p>
          </div>
        ) : (
          <div className="stations-table-wrapper">
            <table className="stations-table">
              <thead>
                <tr>
                  <th>Sıra</th>
                  <th>Durak</th>
                  <th>Kod</th>
                  <th>Tip</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {stations.map((station, index) => (
                  <tr key={station.id} className="station-row">
                    <td className="station-order">
                      <span className="order-number">{index + 1}</span>
                    </td>
                    <td className="station-info">
                      <div className="station-name">{station.name}</div>
                      <div className="station-location">
                        {station.districtName || 'Konum belirtilmemiş'}
                      </div>
                    </td>
                    <td className="station-code">{station.code}</td>
                    <td className="station-type">
                      <span className="type-badge">
                        {station.stationType || 'Standart'}
                      </span>
                    </td>
                    <td className="station-actions">
                      <div className="action-buttons">
                        <button
                          onClick={() => handleReorderStations(station.id, index - 1)}
                          disabled={index === 0}
                          className="btn btn-secondary btn-sm"
                          title="Yukarı Taşı"
                        >
                          ⬆️
                        </button>
                        <button
                          onClick={() => handleReorderStations(station.id, index + 1)}
                          disabled={index === stations.length - 1}
                          className="btn btn-secondary btn-sm"
                          title="Aşağı Taşı"
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() => handleRemoveStation(station.id)}
                          className="btn btn-danger btn-sm"
                          title="Durağı Kaldır"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteStations;
