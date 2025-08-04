import React, { useState, useEffect } from 'react';
import { 
  Route, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin,
  Clock,
  Map,
  RefreshCw,
  Bus,
  Navigation,
  ArrowLeftRight,
  Calendar
} from 'lucide-react';
import { routeApi } from '../services/apiService';
import '../styles/RouteList.css';

const RouteList = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [filteredRoutes, setFilteredRoutes] = useState([]);

  // Route type options
  const routeTypeOptions = [
    { value: '', label: 'Tüm Türler' },
    { value: 'CITY_BUS', label: 'Şehir İçi Otobüs' },
    { value: 'METRO', label: 'Metro' },
    { value: 'METROBUS', label: 'Metrobüs' },
    { value: 'TRAM', label: 'Tramvay' },
    { value: 'FERRY', label: 'Vapur' },
    { value: 'MINIBUS', label: 'Minibüs' },
    { value: 'EXPRESS', label: 'Ekspres' }
  ];

  // Load routes
  const loadRoutes = async () => {
    setLoading(true);
    try {
      const response = await routeApi.getAllRoutes();
      
      console.log('Route API Response:', response);

      if (response && response.success && response.data) {
        setRoutes(response.data);
        setError('');
      } else {
        console.log('Response structure issue:', response);
        setError('Rotalar yüklenirken hata oluştu');
      }
    } catch (err) {
      console.error('Error loading routes:', err);
      setError('Rotalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = routes;

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(route => 
        route.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.startStationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.endStationName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(route => route.routeType === typeFilter);
    }

    setFilteredRoutes(filtered);
  }, [routes, searchTerm, typeFilter]);

  // Handle search
  const handleSearch = () => {
    // Search is already handled by useEffect
  };

  // Delete route
  const deleteRoute = async (routeId) => {
    if (!window.confirm('Bu rotayı silmek istediğinizden emin misiniz?')) return;

    try {
      await routeApi.deleteRoute(routeId);
      loadRoutes(); // Reload data
    } catch (err) {
      console.error('Error deleting route:', err);
      setError('Rota silinirken hata oluştu');
    }
  };

  // Get route type display name
  const getRouteTypeDisplay = (type) => {
    const option = routeTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  // Get route type badge class
  const getRouteTypeBadgeClass = (type) => {
    switch (type) {
      case 'CITY_BUS':
        return 'route-type-bus';
      case 'METRO':
        return 'route-type-metro';
      case 'METROBUS':
        return 'route-type-metrobus';
      case 'TRAM':
        return 'route-type-tram';
      case 'FERRY':
        return 'route-type-ferry';
      case 'MINIBUS':
        return 'route-type-minibus';
      case 'EXPRESS':
        return 'route-type-express';
      default:
        return 'route-type-default';
    }
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}s ${mins}dk`;
    }
    return `${mins}dk`;
  };

  // Format distance
  const formatDistance = (km) => {
    if (!km) return '-';
    return `${km.toFixed(1)} km`;
  };

  // Get schedule summary
  const getScheduleSummary = (schedule) => {
    if (!schedule) return 'Tarife yok';
    
    const weekdayCount = schedule.weekdayHours?.length || 0;
    const weekendCount = schedule.weekendHours?.length || 0;
    
    return `Hafta içi: ${weekdayCount} sefer, Hafta sonu: ${weekendCount} sefer`;
  };

  return (
    <div className="route-list-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1><Route size={24} /> Rota Yönetimi</h1>
          <p>Sistemdeki tüm rotaları görüntüleyin ve yönetin</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/route/add'}
          >
            <Plus size={18} />
            Yeni Rota
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filters-header">
          <Filter size={20} />
          <span>Filtreler ve Arama</span>
        </div>
        
        <div className="filters-grid">
          {/* Search */}
          <div className="filter-card">
            <label className="filter-label">
              <Search size={16} />
              Rota Ara
            </label>
            <div className="search-input-group">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rota adı, kodu veya durak ara"
                className="modern-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleSearch}
                className="search-btn"
                disabled={loading}
              >
                <Search size={16} />
              </button>
            </div>
          </div>

          {/* Type Filter */}
          <div className="filter-card">
            <label className="filter-label">
              <Bus size={16} />
              Rota Türü
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="modern-select"
            >
              {routeTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <div className="filter-card">
            <label className="filter-label">
              <RefreshCw size={16} />
              Yenile
            </label>
            <button 
              onClick={loadRoutes}
              className="btn btn-secondary"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              Yenile
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div className="stats-summary">
        <div className="stat-item">
          <Route size={20} />
          <div>
            <span className="stat-number">{routes.length}</span>
            <span className="stat-label">Toplam Rota</span>
          </div>
        </div>
        <div className="stat-item">
          <Bus size={20} />
          <div>
            <span className="stat-number">{routes.filter(r => r.routeType === 'CITY_BUS').length}</span>
            <span className="stat-label">Şehir Otobüsü</span>
          </div>
        </div>
        <div className="stat-item">
          <Navigation size={20} />
          <div>
            <span className="stat-number">{routes.filter(r => r.hasOutgoingDirection && r.hasReturnDirection).length}</span>
            <span className="stat-label">İki Yönlü</span>
          </div>
        </div>
        <div className="stat-item">
          <Map size={20} />
          <div>
            <span className="stat-number">{filteredRoutes.length}</span>
            <span className="stat-label">Filtrelenmiş</span>
          </div>
        </div>
      </div>

      {/* Routes Table */}
      <div className="routes-table-container">
        <table className="routes-table">
          <thead>
            <tr>
              <th>Rota</th>
              <th>Tür</th>
              <th>Güzergah</th>
              <th>Süre & Mesafe</th>
              <th>Yönler</th>
              <th>Tarife</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="loading-cell">
                  <RefreshCw className="spinning" size={20} />
                  Yükleniyor...
                </td>
              </tr>
            ) : filteredRoutes.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-cell">
                  <Route size={48} />
                  <p>
                    {routes.length === 0 
                      ? 'Henüz rota bulunamadı' 
                      : 'Arama kriterlerinize uygun rota bulunamadı'
                    }
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.location.href = '/route/add'}
                  >
                    İlk Rotayı Ekle
                  </button>
                </td>
              </tr>
            ) : (
              filteredRoutes.map((route) => (
                <tr key={route.id}>
                  <td>
                    <div className="route-info">
                      <div 
                        className="route-color-indicator" 
                        style={{ backgroundColor: route.color || '#4f46e5' }}
                      ></div>
                      <div className="route-details">
                        <div className="route-name">
                          {route.name}
                        </div>
                        <div className="route-code">
                          <Navigation size={12} />
                          {route.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`route-type-badge ${getRouteTypeBadgeClass(route.routeType)}`}>
                      <Bus size={12} />
                      {getRouteTypeDisplay(route.routeType)}
                    </span>
                  </td>
                  <td>
                    <div className="route-path">
                      <div className="route-stations">
                        <div className="start-station">
                          <MapPin size={12} />
                          {route.startStationName}
                        </div>
                        <ArrowLeftRight size={14} className="path-separator" />
                        <div className="end-station">
                          <MapPin size={12} />
                          {route.endStationName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="route-metrics">
                      <div className="metric-item">
                        <Clock size={12} />
                        <span>{formatDuration(route.estimatedDurationMinutes)}</span>
                      </div>
                      <div className="metric-item">
                        <Map size={12} />
                        <span>{formatDistance(route.totalDistanceKm)}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="route-directions">
                      <div className="direction-indicators">
                        <span 
                          className={`direction-badge ${route.hasOutgoingDirection ? 'active' : 'inactive'}`}
                          title="Gidiş yönü"
                        >
                          Gidiş
                        </span>
                        <span 
                          className={`direction-badge ${route.hasReturnDirection ? 'active' : 'inactive'}`}
                          title="Dönüş yönü"
                        >
                          Dönüş
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="route-schedule">
                      <div className="schedule-summary">
                        <Calendar size={12} />
                        <span>{getScheduleSummary(route.routeSchedule)}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => window.location.href = `/route/detail/${route.id}`}
                        className="btn-action btn-view"
                        title="Detayları Görüntüle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => window.location.href = `/route/map/${route.id}`}
                        className="btn-action btn-map"
                        title="Haritada Göster"
                      >
                        <Map size={16} />
                      </button>
                      <button
                        onClick={() => window.location.href = `/route/edit/${route.id}`}
                        className="btn-action btn-edit"
                        title="Düzenle"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteRoute(route.id)}
                        className="btn-action btn-delete"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RouteList;