import React, { useState, useEffect } from 'react';
import { 
  User, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Car,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  UserCheck,
  UserX,
  RefreshCw,
  Award,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { driverApi } from '../services/apiService';
import '../styles/DriverList.css';

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // Shift options
  const shiftOptions = [
    { value: '', label: 'Tüm Vardiyalar' },
    { value: 'DAYTIME', label: 'Gündüz' },
    { value: 'NIGHT', label: 'Gece' }
  ];

  // Active status options
  const activeOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'true', label: 'Aktif' },
    { value: 'false', label: 'Pasif' }
  ];

  // Load drivers
  const loadDrivers = async () => {
    setLoading(true);
    try {
      const response = await driverApi.getAllDrivers(currentPage, pageSize);
      
      console.log('Driver API Response:', response);

      if (response && response.success && response.data) {
        let driverData = response.data.content || [];
        
        // Apply local filters
        if (searchTerm.trim()) {
          driverData = driverData.filter(driver => 
            `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.nationalId?.includes(searchTerm) ||
            driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        if (shiftFilter) {
          driverData = driverData.filter(driver => driver.shift === shiftFilter);
        }

        if (activeFilter !== '') {
          const isActive = activeFilter === 'true';
          driverData = driverData.filter(driver => driver.active === isActive);
        }

        setDrivers(driverData);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } else {
        console.log('Response structure issue:', response);
        setError('Şoförler yüklenirken hata oluştu');
      }
    } catch (err) {
      console.error('Error loading drivers:', err);
      setError('Şoförler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, [currentPage]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(0);
    loadDrivers();
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Delete driver
  const deleteDriver = async (driverId) => {
    if (!window.confirm('Bu şoförü silmek istediğinizden emin misiniz?')) return;

    try {
      await driverApi.deleteDriver(driverId);
      loadDrivers(); // Reload data
    } catch (err) {
      console.error('Error deleting driver:', err);
      setError('Şoför silinirken hata oluştu');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  // Get shift badge class
  const getShiftBadgeClass = (shift) => {
    switch (shift) {
      case 'DAYTIME':
        return 'shift-badge shift-day';
      case 'NIGHT':
        return 'shift-badge shift-night';
      default:
        return 'shift-badge shift-unknown';
    }
  };

  // Get license status
  const getLicenseStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'unknown', text: 'Bilinmiyor', class: 'license-unknown' };
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'expired', text: 'Süresi Dolmuş', class: 'license-expired' };
    } else if (diffDays <= 30) {
      return { status: 'expiring', text: `${diffDays} gün kaldı`, class: 'license-expiring' };
    } else {
      return { status: 'valid', text: 'Geçerli', class: 'license-valid' };
    }
  };

  // Calculate age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '-';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="driver-list-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1><User size={24} /> Şoför Yönetimi</h1>
          <p>Sistemdeki tüm şoförleri görüntüleyin ve yönetin</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/driver/add'}
          >
            <Plus size={18} />
            Yeni Şoför
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
              Şoför Ara
            </label>
            <div className="search-input-group">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ad, soyad, TC kimlik veya ehliyet no"
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

          {/* Shift Filter */}
          <div className="filter-card">
            <label className="filter-label">
              <Clock size={16} />
              Vardiya
            </label>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="modern-select"
            >
              {shiftOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filter */}
          <div className="filter-card">
            <label className="filter-label">
              <UserCheck size={16} />
              Durum
            </label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="modern-select"
            >
              {activeOptions.map(option => (
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
              onClick={loadDrivers}
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
          <User size={20} />
          <div>
            <span className="stat-number">{totalElements}</span>
            <span className="stat-label">Toplam Şoför</span>
          </div>
        </div>
        <div className="stat-item">
          <UserCheck size={20} />
          <div>
            <span className="stat-number">{drivers.filter(d => d.active).length}</span>
            <span className="stat-label">Aktif</span>
          </div>
        </div>
        <div className="stat-item">
          <UserX size={20} />
          <div>
            <span className="stat-number">{drivers.filter(d => !d.active).length}</span>
            <span className="stat-label">Pasif</span>
          </div>
        </div>
        <div className="stat-item">
          <Clock size={20} />
          <div>
            <span className="stat-number">{drivers.filter(d => d.shift === 'DAYTIME').length}</span>
            <span className="stat-label">Gündüz</span>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="drivers-table-container">
        <table className="drivers-table">
          <thead>
            <tr>
              <th>Şoför</th>
              <th>TC Kimlik</th>
              <th>Vardiya</th>
              <th>Ehliyet</th>
              <th>Yaş</th>
              <th>İşe Başlama</th>
              <th>Performans</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="loading-cell">
                  <RefreshCw className="spinning" size={20} />
                  Yükleniyor...
                </td>
              </tr>
            ) : drivers.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-cell">
                  <User size={48} />
                  <p>Henüz şoför bulunamadı</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.location.href = '/driver/add'}
                  >
                    İlk Şoförü Ekle
                  </button>
                </td>
              </tr>
            ) : (
              drivers.map((driver) => {
                const licenseStatus = getLicenseStatus(driver.licenseExpiryDate);
                return (
                  <tr key={driver.id}>
                    <td>
                      <div className="driver-info">
                        <div className="driver-avatar">
                          <User size={20} />
                        </div>
                        <div className="driver-details">
                          <div className="driver-name">
                            {driver.firstName} {driver.lastName}
                          </div>
                          <div className="driver-contact">
                            <Mail size={12} />
                            {driver.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="national-id">
                        <CreditCard size={14} />
                        {driver.nationalId}
                      </div>
                    </td>
                    <td>
                      <span className={getShiftBadgeClass(driver.shift)}>
                        <Clock size={12} />
                        {driver.shift === 'DAYTIME' ? 'Gündüz' : driver.shift === 'NIGHT' ? 'Gece' : 'Belirsiz'}
                      </span>
                    </td>
                    <td>
                      <div className="license-info">
                        <div className="license-number">
                          <FileText size={12} />
                          {driver.licenseNumber}
                        </div>
                        <div className={`license-status ${licenseStatus.class}`}>
                          {licenseStatus.status === 'expired' && <AlertTriangle size={12} />}
                          {licenseStatus.text}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="age-info">
                        <Calendar size={14} />
                        {calculateAge(driver.dateOfBirth)} yaş
                      </div>
                    </td>
                    <td>
                      <div className="employment-date">
                        <Calendar size={14} />
                        {formatDate(driver.employmentDate)}
                      </div>
                    </td>
                    <td>
                      <div className="performance-summary">
                        <div className="performance-item">
                          <Award size={12} />
                          <span>{driver.averageRating ? driver.averageRating.toFixed(1) : 'N/A'}</span>
                        </div>
                        <div className="performance-item">
                          <Clock size={12} />
                          <span>{driver.totalDrivingHours || 0}h</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${driver.active ? 'status-active' : 'status-inactive'}`}>
                        {driver.active ? <UserCheck size={12} /> : <UserX size={12} />}
                        {driver.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => window.location.href = `/driver/detail/${driver.id}`}
                          className="btn-action btn-view"
                          title="Detayları Görüntüle"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => window.location.href = `/driver/edit/${driver.id}`}
                          className="btn-action btn-edit"
                          title="Düzenle"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteDriver(driver.id)}
                          className="btn-action btn-delete"
                          title="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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
            <span className="total-info">({totalElements} toplam şoför)</span>
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

export default DriverList;