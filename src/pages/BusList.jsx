import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  Users, 
  Gauge,
  Clock,
  Power,
  PowerOff,
  Route,
  User,
  Navigation,
  RefreshCw
} from 'lucide-react';
import { busApi } from '../services/apiService';
import '../styles/BusList.css';

const BusList = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [routeFilter, setRouteFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [selectedBuses, setSelectedBuses] = useState([]);
  const [bulkOperation, setBulkOperation] = useState('');

  // Bus status options
  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'CALISIYOR', label: 'Çalışıyor' },
    { value: 'ARIZALI', label: 'Arızalı' },
    { value: 'BAKIMDA', label: 'Bakımda' },
    { value: 'SERVIS_DISI', label: 'Servis Dışı' },
    { value: 'DURAKTA_BEKLIYOR', label: 'Durakta Bekliyor' },
    { value: 'HAREKET_HALINDE', label: 'Hareket Halinde' },
    { value: 'GARAJDA', label: 'Garajda' },
    { value: 'TEMIZLIK', label: 'Temizlik' },
    { value: 'YAKIT_ALIMI', label: 'Yakıt Alımı' },
    { value: 'MOLA', label: 'Mola' }
  ];

  // Load buses
  const loadBuses = async () => {
    setLoading(true);
    try {
      let response;
      
      if (searchTerm.trim()) {
        // Search by plate number
        response = await busApi.searchBuses({
          numberPlate: searchTerm,
          status: statusFilter,
          page: currentPage,
          size: pageSize
        });
      } else if (statusFilter) {
        // Filter by status
        response = await busApi.getBusesByStatus(statusFilter, currentPage, pageSize);
      } else {
        // Get all buses
        response = await busApi.getAllBuses(currentPage, pageSize);
      }

      if (response.success && response.data) {
        setBuses(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } else {
        setError('Otobüsler yüklenirken hata oluştu');
      }
    } catch (err) {
      console.error('Error loading buses:', err);
      setError('Otobüsler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuses();
  }, [currentPage, statusFilter]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(0);
    loadBuses();
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Toggle bus selection
  const toggleBusSelection = (busId) => {
    setSelectedBuses(prev => 
      prev.includes(busId) 
        ? prev.filter(id => id !== busId)
        : [...prev, busId]
    );
  };

  // Select all buses
  const handleSelectAll = () => {
    if (selectedBuses.length === buses.length) {
      setSelectedBuses([]);
    } else {
      setSelectedBuses(buses.map(bus => bus.id));
    }
  };

  // Handle bulk operations
  const handleBulkOperation = async () => {
    if (!bulkOperation || selectedBuses.length === 0) return;

    try {
      setLoading(true);
      
      if (bulkOperation === 'activate') {
        await busApi.bulkActivate(selectedBuses);
      } else if (bulkOperation === 'deactivate') {
        await busApi.bulkDeactivate(selectedBuses);
      }

      // Reload data
      await loadBuses();
      setSelectedBuses([]);
      setBulkOperation('');
    } catch (err) {
      console.error('Bulk operation error:', err);
      setError('Toplu işlem sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Toggle single bus active status
  const toggleBusStatus = async (busId) => {
    try {
      await busApi.toggleActiveStatus(busId);
      loadBuses(); // Reload data
    } catch (err) {
      console.error('Error toggling bus status:', err);
      setError('Otobüs durumu değiştirilirken hata oluştu');
    }
  };

  // Delete bus
  const deleteBus = async (busId) => {
    if (!window.confirm('Bu otobüsü silmek istediğinizden emin misiniz?')) return;

    try {
      await busApi.deleteBus(busId);
      loadBuses(); // Reload data
    } catch (err) {
      console.error('Error deleting bus:', err);
      setError('Otobüs silinirken hata oluştu');
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'CALISIYOR':
      case 'HAREKET_HALINDE':
        return 'status-badge status-success';
      case 'DURAKTA_BEKLIYOR':
        return 'status-badge status-info';
      case 'MOLA':
      case 'TEMIZLIK':
      case 'YAKIT_ALIMI':
        return 'status-badge status-warning';
      case 'ARIZALI':
      case 'BAKIMDA':
      case 'SERVIS_DISI':
        return 'status-badge status-danger';
      case 'GARAJDA':
        return 'status-badge status-secondary';
      default:
        return 'status-badge status-secondary';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  // Calculate occupancy color
  const getOccupancyColor = (rate) => {
    if (rate >= 90) return '#ef4444'; // Red
    if (rate >= 70) return '#f59e0b'; // Yellow
    if (rate >= 50) return '#10b981'; // Green
    return '#6b7280'; // Gray
  };

  return (
    <div className="bus-list-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1><Bus size={24} /> Otobüs Yönetimi</h1>
          <p>Sistemdeki tüm otobüsleri görüntüleyin ve yönetin</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/bus/add'}
          >
            <Plus size={18} />
            Yeni Otobüs
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
              Plaka Ara
            </label>
            <div className="search-input-group">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="34 ABC 123"
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

          {/* Status Filter */}
          <div className="filter-card">
            <label className="filter-label">
              <Gauge size={16} />
              Durum
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="modern-select"
            >
              {statusOptions.map(option => (
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
              onClick={loadBuses}
              className="btn btn-secondary"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              Yenile
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Operations */}
      {selectedBuses.length > 0 && (
        <div className="bulk-operations">
          <div className="bulk-info">
            <span>{selectedBuses.length} otobüs seçildi</span>
          </div>
          <div className="bulk-actions">
            <select
              value={bulkOperation}
              onChange={(e) => setBulkOperation(e.target.value)}
              className="bulk-select"
            >
              <option value="">Toplu İşlem Seçin</option>
              <option value="activate">Aktifleştir</option>
              <option value="deactivate">Pasifleştir</option>
            </select>
            <button
              onClick={handleBulkOperation}
              disabled={!bulkOperation || loading}
              className="btn btn-primary"
            >
              Uygula
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div className="stats-summary">
        <div className="stat-item">
          <Bus size={20} />
          <div>
            <span className="stat-number">{totalElements}</span>
            <span className="stat-label">Toplam Otobüs</span>
          </div>
        </div>
        <div className="stat-item">
          <Power size={20} />
          <div>
            <span className="stat-number">{buses.filter(b => b.isActive).length}</span>
            <span className="stat-label">Aktif</span>
          </div>
        </div>
        <div className="stat-item">
          <PowerOff size={20} />
          <div>
            <span className="stat-number">{buses.filter(b => !b.isActive).length}</span>
            <span className="stat-label">Pasif</span>
          </div>
        </div>
      </div>

      {/* Buses Table */}
      <div className="buses-table-container">
        <table className="buses-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedBuses.length === buses.length && buses.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Plaka</th>
              <th>Durum</th>
              <th>Aktif</th>
              <th>Şoför</th>
              <th>Rota</th>
              <th>Kapasite</th>
              <th>Doluluk</th>
              <th>Ücret</th>
              <th>Son Güncelleme</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" className="loading-cell">
                  <RefreshCw className="spinning" size={20} />
                  Yükleniyor...
                </td>
              </tr>
            ) : buses.length === 0 ? (
              <tr>
                <td colSpan="11" className="empty-cell">
                  <Bus size={48} />
                  <p>Henüz otobüs bulunamadı</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.location.href = '/bus/add'}
                  >
                    İlk Otobüsü Ekle
                  </button>
                </td>
              </tr>
            ) : (
              buses.map((bus) => (
                <tr key={bus.id} className={selectedBuses.includes(bus.id) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedBuses.includes(bus.id)}
                      onChange={() => toggleBusSelection(bus.id)}
                    />
                  </td>
                  <td>
                    <div className="bus-plate">
                      <Bus size={16} />
                      <strong>{bus.numberPlate}</strong>
                    </div>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(bus.status)}>
                      {bus.statusDisplayName || bus.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleBusStatus(bus.id)}
                      className={`status-toggle ${bus.isActive ? 'active' : 'inactive'}`}
                      title={bus.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                    >
                      {bus.isActive ? <Power size={16} /> : <PowerOff size={16} />}
                    </button>
                  </td>
                  <td>
                    <div className="driver-info">
                      <User size={14} />
                      {bus.driverName || 'Atanmamış'}
                    </div>
                  </td>
                  <td>
                    <div className="route-info">
                      <Route size={14} />
                      {bus.assignedRouteName || 'Atanmamış'}
                    </div>
                  </td>
                  <td>
                    <div className="capacity-info">
                      <Users size={14} />
                      {bus.currentPassengerCount}/{bus.capacity}
                    </div>
                  </td>
                  <td>
                    <div className="occupancy-bar">
                      <div 
                        className="occupancy-fill"
                        style={{
                          width: `${bus.occupancyRate || 0}%`,
                          backgroundColor: getOccupancyColor(bus.occupancyRate || 0)
                        }}
                      ></div>
                      <span className="occupancy-text">
                        {Math.round(bus.occupancyRate || 0)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="fare-amount">{bus.baseFare} ₺</span>
                  </td>
                  <td>
                    <div className="update-time">
                      <Clock size={14} />
                      {formatDate(bus.updatedAt)}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => window.location.href = `/bus/detail/${bus.id}`}
                        className="btn-action btn-view"
                        title="Detayları Görüntüle"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => window.location.href = `/bus/edit/${bus.id}`}
                        className="btn-action btn-edit"
                        title="Düzenle"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => window.location.href = `/bus/location/${bus.id}`}
                        className="btn-action btn-location"
                        title="Haritada Göster"
                      >
                        <MapPin size={16} />
                      </button>
                      <button
                        onClick={() => deleteBus(bus.id)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="pagination-btn"
          >
            Önceki
          </button>
          
          <div className="pagination-info">
            Sayfa {currentPage + 1} / {totalPages} 
            <span className="total-info">({totalElements} toplam otobüs)</span>
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="pagination-btn"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
};

export default BusList;