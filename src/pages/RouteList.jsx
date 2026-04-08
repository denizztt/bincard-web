import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { routeApi } from '../services/apiService';
import { getRouteTypeLabel, getRouteTypeIcon } from '../constants/routeTypes';
import '../styles/RouteList.css';

const RouteList = () => {
  const [routes, setRoutes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Tüm rotaları yükle
  const loadAllRoutes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await routeApi.getAllRoutes();
      if (response.success) {
        setRoutes(response.data);
      } else {
        setError('Rotalar yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Routes loading error:', error);
      setError('Rotalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Arama yap
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadAllRoutes();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await routeApi.searchRoutesByName(searchTerm);
      if (response.success) {
        setRoutes(response.data);
      } else {
        setError('Arama sonuçları bulunamadı');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Arama sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Rota sil
  const handleDeleteRoute = async (routeId) => {
    if (!window.confirm('Bu rotayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await routeApi.deleteRoute(routeId);
      if (response.success) {
        setRoutes(routes.filter(route => route.id !== routeId));
        alert('Rota başarıyla silindi');
      } else {
        alert('Rota silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Rota silinirken hata oluştu');
    }
  };

  // Enter tuşu ile arama
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Sayfa yüklendiğinde rotaları getir
  useEffect(() => {
    loadAllRoutes();
  }, []);

  return (
    <div className="route-list-container">
      {/* Header */}
      <div className="route-list-header">
        <div className="header-left">
          <h1>🚌 Rota Yönetimi</h1>
          <p className="header-description">Tüm aktif rotaları yönetin, arama yapın ve yeni rota ekleyin</p>
        </div>
        <div className="header-actions">
          <Link to="/route/add" className="btn btn-primary">
            ➕ Yeni Rota Ekle
          </Link>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Rota adı ile arama yapın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="search-input"
            />
            <button 
              onClick={handleSearch}
              className="search-btn"
              disabled={loading}
            >
              🔍 Ara
            </button>
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  loadAllRoutes();
                }}
                className="clear-search-btn"
              >
                ✖️ Temizle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="route-list-content">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Rotalar yükleniyor...</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="results-info">
              <span className="results-count">
                {routes.length} rota bulundu
              </span>
              <button 
                onClick={loadAllRoutes}
                className="refresh-btn"
                disabled={loading}
              >
                🔄 Yenile
              </button>
            </div>

            {/* Routes Table */}
            {routes.length > 0 ? (
              <div className="routes-table-wrapper">
                <table className="routes-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Rota</th>
                      <th>Tip</th>
                      <th>Güzergah</th>
                      <th>Süre</th>
                      <th>Mesafe</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((route) => (
                      <tr key={route.id} className="route-row">
                        <td className="route-id">#{route.id}</td>
                        <td className="route-info">
                          <div className="route-name-container">
                            <div className="route-details">
                              <div className="route-name">{route.name}</div>
                              <div className="route-code">{route.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="route-type">
                          <span className="type-badge">
                            {getRouteTypeLabel(route.routeType)}
                          </span>
                        </td>
                        <td className="route-path">
                          <div className="path-info">
                            <span className="start-station">{route.startStationName}</span>
                            <span className="path-separator">→</span>
                            <span className="end-station">{route.endStationName}</span>
                          </div>
                          <div className="directions-info" style={{ marginTop: '0.5rem' }}>
                            {route.hasOutgoingDirection && (
                              <span className="direction-badge outgoing">GIDIŞ</span>
                            )}
                            {route.hasReturnDirection && (
                              <span className="direction-badge return">DÖNÜŞ</span>
                            )}
                          </div>
                        </td>
                        <td className="route-duration">
                          {route.estimatedDurationMinutes ? 
                            `${route.estimatedDurationMinutes} dk` : 
                            'Belirtilmemiş'}
                        </td>
                        <td className="route-distance">
                          {route.totalDistanceKm ? 
                            `${route.totalDistanceKm.toFixed(1)} km` : 
                            'Belirtilmemiş'}
                        </td>
                        <td className="route-actions">
                          <div className="action-buttons">
                            <Link 
                              to={`/route/${route.id}`}
                              className="btn btn-view"
                            >
                              👁️ Detay
                            </Link>
                            <Link 
                              to={`/route/${route.id}/stations`}
                              className="btn btn-edit"
                            >
                              🚏 Duraklar
                            </Link>
                            <button 
                              onClick={() => handleDeleteRoute(route.id)}
                              className="btn btn-delete"
                            >
                              🗑️ Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-routes">
                <div className="no-routes-icon">🚌</div>
                <h3>Rota bulunamadı</h3>
                <p>
                  {searchTerm 
                    ? `"${searchTerm}" araması için sonuç bulunamadı` 
                    : 'Henüz hiç rota eklenmemiş'}
                </p>
                <Link to="/route/add" className="btn btn-primary">
                  ➕ İlk Rotayı Oluştur
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RouteList;
