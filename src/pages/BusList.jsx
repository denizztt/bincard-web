import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { busApi } from '../services/apiService';
import { 
  getBusStatusLabel, 
  getBusStatusColor, 
  getBusStatusIcon,
  formatOccupancyRate,
  getOccupancyColor,
  formatTimeAgo,
  BUS_SEARCH_FILTERS,
  BUS_SORT_OPTIONS
} from '../constants/busTypes';
import '../styles/BusList.css';

const BusList = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('numberPlate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedBuses, setSelectedBuses] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  
  const navigate = useNavigate();

  // Tüm otobüsleri yükle
  const loadBuses = async (page = 0) => {
    setLoading(true);
    setError('');
    try {
      let response;
      
      if (searchTerm.trim()) {
        // Arama yapılıyorsa
        response = await busApi.searchBuses({
          numberPlate: searchTerm,
          page: page,
          size: pageSize
        });
      } else if (currentFilter === 'ACTIVE') {
        response = await busApi.getActiveBuses(page, pageSize);
      } else if (currentFilter === 'INACTIVE') {
        // Pasif otobüsler için tüm otobüsleri getirip filtrele
        const allResponse = await busApi.getAllBuses(page, pageSize);
        if (allResponse.success && allResponse.data) {
          const filteredContent = (allResponse.data.content || []).filter(bus => !bus.isActive);
          response = {
            ...allResponse,
            data: {
              ...allResponse.data,
              content: filteredContent,
              totalElements: filteredContent.length
            }
          };
        } else {
          response = allResponse;
        }
      } else {
        response = await busApi.getAllBuses(page, pageSize);
      }

      if (response.success && response.data) {
        setBuses(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
        setCurrentPage(page);
      } else {
        setError('Otobüsler yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Buses loading error:', error);
      setError('Otobüsler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde otobüsleri getir
  useEffect(() => {
    loadBuses();
  }, [currentFilter]);

  // Arama
  const handleSearch = () => {
    setCurrentPage(0);
    loadBuses(0);
  };

  // Aramayı temizle
  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(0);
    loadBuses(0);
  };

  // Filter değiştir
  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
    setCurrentPage(0);
  };

  // Sayfa değiştir
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadBuses(newPage);
    }
  };

  // Otobüs seç/seçimi kaldır
  const toggleBusSelection = (busId) => {
    setSelectedBuses(prev => 
      prev.includes(busId) 
        ? prev.filter(id => id !== busId)
        : [...prev, busId]
    );
  };

  // Tümünü seç/seçimi kaldır
  const toggleAllSelection = () => {
    if (selectedBuses.length === buses.length) {
      setSelectedBuses([]);
    } else {
      setSelectedBuses(buses.map(bus => bus.id));
    }
  };

  // Aktif durumu değiştir
  const toggleActiveStatus = async (busId) => {
    try {
      const response = await busApi.toggleActiveStatus(busId);
      if (response.success) {
        loadBuses(currentPage);
      } else {
        setError('Durum değiştirme işlemi başarısız');
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      setError('Durum değiştirme işlemi başarısız');
    }
  };

  // Otobüs sil
  const deleteBus = async (busId) => {
    if (window.confirm('Bu otobüsü silmek istediğinizden emin misiniz?')) {
      try {
        const response = await busApi.deleteBus(busId);
        if (response.success) {
          loadBuses(currentPage);
        } else {
          setError('Silme işlemi başarısız');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setError('Silme işlemi başarısız');
      }
    }
  };

  // Toplu işlemler
  const handleBulkActivate = async () => {
    if (selectedBuses.length === 0) return;
    
    try {
      const response = await busApi.bulkActivate(selectedBuses);
      if (response.success) {
        setSelectedBuses([]);
        loadBuses(currentPage);
      } else {
        setError('Toplu aktifleştirme başarısız');
      }
    } catch (error) {
      console.error('Bulk activate error:', error);
      setError('Toplu aktifleştirme başarısız');
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedBuses.length === 0) return;
    
    if (window.confirm(`${selectedBuses.length} otobüsü pasifleştirmek istediğinizden emin misiniz?`)) {
      try {
        const response = await busApi.bulkDeactivate(selectedBuses);
        if (response.success) {
          setSelectedBuses([]);
          loadBuses(currentPage);
        } else {
          setError('Toplu pasifleştirme başarısız');
        }
      } catch (error) {
        console.error('Bulk deactivate error:', error);
        setError('Toplu pasifleştirme başarısız');
      }
    }
  };

  // Otobüs satırı render
  const renderBusRow = (bus) => (
    <tr key={bus.id} className="bus-row">
      <td>
        <input
          type="checkbox"
          checked={selectedBuses.includes(bus.id)}
          onChange={() => toggleBusSelection(bus.id)}
          className="bus-checkbox"
        />
      </td>
      
      <td>
        <div className="bus-plate-container">
          <span className="bus-plate">{bus.numberPlate}</span>
          <span className="bus-id">#{bus.id}</span>
        </div>
      </td>
      
      <td>
        <div className="bus-status-container">
          <span className="status-icon">{getBusStatusIcon(bus.status)}</span>
          <span 
            className="status-badge"
          >
            {getBusStatusLabel(bus.status)}
          </span>
        </div>
      </td>
      
      <td>
        <div className="driver-info">
          {bus.driverName || 'Atanmamış'}
        </div>
      </td>
      
      <td>
        <div className="route-info">
          {bus.assignedRouteName ? (
            <>
              <span className="route-name">{bus.assignedRouteName}</span>
              {bus.assignedRouteCode && (
                <span className="route-code">({bus.assignedRouteCode})</span>
              )}
            </>
          ) : (
            'Atanmamış'
          )}
        </div>
      </td>
      
      <td>
        <div className="occupancy-container">
          <div className="occupancy-bar">
            <div 
              className="occupancy-fill"
              style={{ 
                width: `${bus.occupancyRate || 0}%`,
                backgroundColor: getOccupancyColor(bus.occupancyRate)
              }}
            />
          </div>
          <span className="occupancy-text">
            {formatOccupancyRate(bus.occupancyRate)} ({bus.currentPassengerCount}/{bus.capacity})
          </span>
        </div>
      </td>
      
      <td>
        <div className="last-update">
          {formatTimeAgo(bus.lastLocationUpdate)}
        </div>
      </td>
      
      <td>
        <div className="bus-actions">
          <Link 
            to={`/bus/${bus.id}`} 
            className="btn btn-view"
            title="Detayları Görüntüle"
          >
            👁️
          </Link>
          
          <button
            onClick={() => toggleActiveStatus(bus.id)}
            className={`btn ${bus.isActive ? 'btn-deactivate' : 'btn-activate'}`}
            title={bus.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          >
            {bus.isActive ? '⏸️' : '▶️'}
          </button>
          
          <Link 
            to={`/bus/${bus.id}/edit`} 
            className="btn btn-edit"
            title="Düzenle"
          >
            ✏️
          </Link>
          
          <button
            onClick={() => deleteBus(bus.id)}
            className="btn btn-delete"
            title="Sil"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bus-list-container">
      {/* Header */}
      <div className="bus-list-header">
        <div className="header-left">
          <h1>Otobüs Yönetimi</h1>
          <p className="header-description">
            Tüm otobüsleri listeleyin, durumlarını yönetin ve işlemler yapın
          </p>
        </div>
        <div className="header-actions">
          <Link to="/bus/create" className="btn btn-primary">
            ➕ Yeni Otobüs Ekle
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Plaka ile ara..."
              className="search-input"
            />
            <button 
              onClick={handleSearch} 
              disabled={loading}
              className="search-btn"
            >
              🔍 Ara
            </button>
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="clear-search-btn"
              >
                ✖️ Temizle
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="filters-container">
          {Object.entries(BUS_SEARCH_FILTERS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className={`filter-btn ${currentFilter === key ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Content */}
      <div className="bus-list-content">
        {/* Bulk Actions */}
        {selectedBuses.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">
              {selectedBuses.length} otobüs seçildi
            </span>
            <div className="bulk-buttons">
              <button 
                onClick={handleBulkActivate}
                className="btn btn-bulk-activate"
              >
                ▶️ Aktifleştir
              </button>
              <button 
                onClick={handleBulkDeactivate}
                className="btn btn-bulk-deactivate"
              >
                ⏸️ Pasifleştir
              </button>
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="results-info">
          <span className="results-count">
            Toplam {totalElements} otobüs bulundu
          </span>
          <button 
            onClick={() => loadBuses(currentPage)}
            className="refresh-btn"
          >
            🔄 Yenile
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Otobüsler yükleniyor...</p>
          </div>
        ) : buses.length === 0 ? (
          <div className="no-buses">
            <div className="no-buses-icon">🚍</div>
            <h3>Otobüs bulunamadı</h3>
            <p>Henüz hiç otobüs kaydedilmemiş veya arama kriterlerinize uygun sonuç yok.</p>
            <Link to="/bus/create" className="btn btn-primary">
              İlk Otobüsü Ekleyin
            </Link>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="buses-table-wrapper">
              <table className="buses-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedBuses.length === buses.length && buses.length > 0}
                        onChange={toggleAllSelection}
                        className="select-all-checkbox"
                      />
                    </th>
                    <th>Plaka</th>
                    <th>Durum</th>
                    <th>Şoför</th>
                    <th>Rota</th>
                    <th>Doluluk</th>
                    <th>Son Güncelleme</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map(renderBusRow)}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination-container">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="pagination-btn"
              >
                ◀️ Önceki
              </button>
              
              <div className="pagination-info">
                Sayfa {currentPage + 1} / {totalPages}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="pagination-btn"
              >
                Sonraki ▶️
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BusList;
