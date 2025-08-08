import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { driverApi } from '../services/apiService';
import { 
  getDriverShiftLabel, 
  getDriverShiftColor, 
  getDriverShiftIcon,
  getDriverStatusLabel,
  getDriverStatusColor,
  getDriverStatusIcon,
  formatDriverExperience,
  formatDriverRating,
  getDriverRatingColor,
  formatTimeAgo,
  DRIVER_SEARCH_FILTERS,
  DRIVER_SORT_OPTIONS
} from '../constants/driverTypes';
import '../styles/DriverList.css';

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('firstName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  
  const navigate = useNavigate();

  // Tüm sürücüleri yükle
  const loadDrivers = async (page = 0) => {
    setLoading(true);
    setError('');
    try {
      let response;
      
      if (searchTerm.trim()) {
        // Arama yapılıyorsa
        response = await driverApi.searchDrivers(searchTerm, page, pageSize);
      } else {
        // Filter'a göre endpoint seç
        switch (currentFilter) {
          case 'ACTIVE':
            response = await driverApi.getActiveDrivers(page, pageSize);
            break;
          case 'INACTIVE':
            response = await driverApi.getAllDrivers(page, pageSize);
            // Frontend'de inactive filtreleme yapacağız
            break;
          case 'DAYTIME':
            response = await driverApi.getDriversByShift('DAYTIME', page, pageSize);
            break;
          case 'NIGHT':
            response = await driverApi.getDriversByShift('NIGHT', page, pageSize);
            break;
          case 'WITH_PENALTIES':
            response = await driverApi.getDriversWithPenalties(page, pageSize);
            break;
          default:
            response = await driverApi.getAllDrivers(page, pageSize);
        }
      }

      if (response.success && response.data) {
        let driversData = response.data.content || [];
        
        // Inactive filter için frontend filtreleme
        if (currentFilter === 'INACTIVE' && !searchTerm.trim()) {
          driversData = driversData.filter(driver => !driver.active);
        }
        
        setDrivers(driversData);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
        setCurrentPage(page);
      } else {
        setError('Sürücüler yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Drivers loading error:', error);
      setError('Sürücüler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde sürücüleri getir
  useEffect(() => {
    loadDrivers();
  }, [currentFilter]);

  // Arama
  const handleSearch = () => {
    setCurrentPage(0);
    loadDrivers(0);
  };

  // Aramayı temizle
  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(0);
    loadDrivers(0);
  };

  // Filter değiştir
  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
    setCurrentPage(0);
  };

  // Sayfa değiştir
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadDrivers(newPage);
    }
  };

  // Sürücü seç/seçimi kaldır
  const toggleDriverSelection = (driverId) => {
    setSelectedDrivers(prev => 
      prev.includes(driverId) 
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  // Tümünü seç/seçimi kaldır
  const toggleAllSelection = () => {
    if (selectedDrivers.length === drivers.length) {
      setSelectedDrivers([]);
    } else {
      setSelectedDrivers(drivers.map(driver => driver.id));
    }
  };

  // Aktif durumu değiştir
  const toggleActiveStatus = async (driverId) => {
    try {
      const driver = drivers.find(d => d.id === driverId);
      const response = await driverApi.changeDriverStatus(driverId, !driver.active);
      if (response.success) {
        loadDrivers(currentPage);
      } else {
        setError('Durum değiştirme işlemi başarısız');
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      setError('Durum değiştirme işlemi başarısız');
    }
  };

  // Sürücü sil
  const deleteDriver = async (driverId) => {
    if (window.confirm('Bu sürücüyü silmek istediğinizden emin misiniz?')) {
      try {
        const response = await driverApi.deleteDriver(driverId);
        if (response.success) {
          loadDrivers(currentPage);
        } else {
          setError('Silme işlemi başarısız');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setError('Silme işlemi başarısız');
      }
    }
  };

  // Sürücü satırı render
  const renderDriverRow = (driver) => (
    <tr key={driver.id} className="driver-row">
      <td>
        <input
          type="checkbox"
          checked={selectedDrivers.includes(driver.id)}
          onChange={() => toggleDriverSelection(driver.id)}
          className="driver-checkbox"
        />
      </td>
      
      <td>
        <div className="driver-name-container">
          <span className="driver-name">{driver.firstName} {driver.lastName}</span>
          <span className="driver-id">#{driver.id}</span>
        </div>
      </td>
      
      <td>
        <div className="driver-contact">
          <span className="email">{driver.email}</span>
          <span className="national-id">{driver.nationalId}</span>
        </div>
      </td>
      
      <td>
        <div className="driver-status-container">
          <span className="status-icon">{getDriverStatusIcon(driver.active)}</span>
          <span 
            className="status-badge"
            style={{ backgroundColor: getDriverStatusColor(driver.active) }}
          >
            {getDriverStatusLabel(driver.active)}
          </span>
        </div>
      </td>
      
      <td>
        <div className="shift-container">
          <span className="shift-icon">{getDriverShiftIcon(driver.shift)}</span>
          <span 
            className="shift-badge"
            style={{ backgroundColor: getDriverShiftColor(driver.shift) }}
          >
            {getDriverShiftLabel(driver.shift)}
          </span>
        </div>
      </td>
      
      <td>
        <div className="license-info">
          <span className="license-class">{driver.licenseClass}</span>
          <span className="license-number">{driver.licenseNumber}</span>
        </div>
      </td>
      
      <td>
        <div className="experience-container">
          {formatDriverExperience(driver.employmentDate)}
        </div>
      </td>
      
      <td>
        <div className="rating-container">
          <span 
            className="rating-badge"
            style={{ backgroundColor: getDriverRatingColor(driver.averageRating) }}
          >
            {formatDriverRating(driver.averageRating)}
          </span>
        </div>
      </td>
      
      <td>
        <div className="driver-actions">
          <Link 
            to={`/driver/${driver.id}`} 
            className="btn btn-view"
            title="Detayları Görüntüle"
          >
            👁️
          </Link>
          
          <button
            onClick={() => toggleActiveStatus(driver.id)}
            className={`btn ${driver.active ? 'btn-deactivate' : 'btn-activate'}`}
            title={driver.active ? 'Pasifleştir' : 'Aktifleştir'}
          >
            {driver.active ? '⏸️' : '▶️'}
          </button>
          
          <Link 
            to={`/driver/${driver.id}/edit`} 
            className="btn btn-edit"
            title="Düzenle"
          >
            ✏️
          </Link>
          
          <Link 
            to={`/driver/${driver.id}/documents`} 
            className="btn btn-documents"
            title="Belgeler"
          >
            📄
          </Link>
          
          <Link 
            to={`/driver/${driver.id}/penalties`} 
            className="btn btn-penalties"
            title="Cezalar"
          >
            ⚖️
          </Link>
          
          <button
            onClick={() => deleteDriver(driver.id)}
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
    <div className="driver-list-container">
      {/* Header */}
      <div className="driver-list-header">
        <div className="header-left">
          <h1>Sürücü Yönetimi</h1>
          <p className="header-description">
            Tüm sürücüleri listeleyin, durumlarını yönetin ve işlemler yapın
          </p>
        </div>
        <div className="header-actions">
          <Link to="/driver/create" className="btn btn-primary">
            ➕ Yeni Sürücü Ekle
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
              placeholder="Ad, soyad veya TC kimlik no ile ara..."
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
          {Object.entries(DRIVER_SEARCH_FILTERS).map(([key, label]) => (
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
      <div className="driver-list-content">
        {/* Results Info */}
        <div className="results-info">
          <span className="results-count">
            Toplam {totalElements} sürücü bulundu
          </span>
          <button 
            onClick={() => loadDrivers(currentPage)}
            className="refresh-btn"
          >
            🔄 Yenile
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Sürücüler yükleniyor...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="no-drivers">
            <div className="no-drivers-icon">👨‍💼</div>
            <h3>Sürücü bulunamadı</h3>
            <p>Henüz hiç sürücü kaydedilmemiş veya arama kriterlerinize uygun sonuç yok.</p>
            <Link to="/driver/create" className="btn btn-primary">
              İlk Sürücüyü Ekleyin
            </Link>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="drivers-table-wrapper">
              <table className="drivers-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedDrivers.length === drivers.length && drivers.length > 0}
                        onChange={toggleAllSelection}
                        className="select-all-checkbox"
                      />
                    </th>
                    <th>Ad Soyad</th>
                    <th>İletişim</th>
                    <th>Durum</th>
                    <th>Vardiya</th>
                    <th>Ehliyet</th>
                    <th>Deneyim</th>
                    <th>Puan</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map(renderDriverRow)}
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

export default DriverList;
