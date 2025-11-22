import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Search,
  Filter,
  User
} from 'lucide-react';
import { superAdminApi } from '../services/apiService';
import '../styles/AdminList.css';

const AdminList = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  
  // Filtreleme state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadAdmins();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, admins]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError('');
      try {
        const response = await superAdminApi.getAllAdmins(0, 50);
        if (response && response.success && Array.isArray(response.data)) {
          const items = response.data.map((a) => ({
            id: a.id,
            name: a.profileInfo?.name,
            surname: a.profileInfo?.surname,
            email: a.profileInfo?.email,
            phone: a.userNumber,
            status: a.status,
            roles: Array.isArray(a.roles) ? a.roles : []
          }));
          setAdmins(items);
        } else {
          throw new Error(response?.message || 'Admin listesi alınamadı');
        }
      } catch (innerErr) {
        console.warn('Admin listesi endpointi yok veya hata verdi:', innerErr);
        setAdmins([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Admin listesi yüklenirken hata:', err);
      setError(err.response?.data?.message || err.message || 'Admin listesi yüklenemedi');
      setAdmins([]);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...admins];
    
    // Arama filtresi
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(admin => 
        admin.name?.toLowerCase().includes(search) ||
        admin.surname?.toLowerCase().includes(search) ||
        admin.email?.toLowerCase().includes(search) ||
        admin.phone?.includes(search)
      );
    }
    
    // Durum filtresi
    if (statusFilter) {
      filtered = filtered.filter(admin => admin.status === statusFilter);
    }
    
    setFilteredAdmins(filtered);
  };

  const handleToggleStatus = async (admin) => {
    if (!window.confirm(`${admin.name} ${admin.surname} adlı admin'in durumunu değiştirmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const response = await superAdminApi.toggleAdminStatus(admin.id);
      
      if (response && response.success) {
        setAdmins(prevAdmins => 
          prevAdmins.map(ad => 
            ad.id === admin.id 
              ? { ...ad, status: ad.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
              : ad
          )
        );
        alert('Durum başarıyla güncellendi');
      } else {
        throw new Error(response?.message || 'Durum değiştirme işlemi başarısız');
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
      alert(`Durum değiştirme işlemi başarısız: ${error.message}`);
    }
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`${admin.name} ${admin.surname} adlı admin'i silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const response = await superAdminApi.deleteAdmin(admin.id);
      
      if (response && response.success) {
        setAdmins(prevAdmins => prevAdmins.filter(ad => ad.id !== admin.id));
        alert('Admin başarıyla silindi');
      } else {
        throw new Error(response?.message || 'Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert(`Silme işlemi başarısız: ${error.message}`);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'ACTIVE') {
      return (
        <span className="status-badge active">
          <UserCheck size={16} />
          Aktif
        </span>
      );
    } else {
      return (
        <span className="status-badge inactive">
          <UserX size={16} />
          Pasif
        </span>
      );
    }
  };

  if (loading && admins.length === 0) {
    return (
      <div className="admin-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Admin listesi yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-list-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-top">
          <div className="header-left">
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              <ArrowLeft size={20} />
              Dashboard
            </button>
            <h1 className="page-title">👥 Admin Yönetimi</h1>
          </div>
          <div className="header-right">
            <button 
              onClick={() => navigate('/admin/add')}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Yeni Admin Ekle
            </button>
            <button 
              onClick={loadAdmins}
              className="btn btn-secondary"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              Yenile
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
          <button onClick={loadAdmins} className="retry-btn">
            <RefreshCw size={16} />
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="İsim, email veya telefon ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="">Tüm Durumlar</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Pasif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="admins-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>İsim</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Roller</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.id}</td>
                    <td>
                      <div className="user-info">
                        <User size={16} className="user-icon" />
                        {admin.name} {admin.surname}
                      </div>
                    </td>
                    <td>{admin.email}</td>
                    <td>{admin.phone}</td>
                    <td>
                      <div className="roles-badge">
                        {admin.roles?.map((role, index) => (
                          <span key={index} className="role-badge">{role}</span>
                        )) || 'Yok'}
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(admin.status)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon" 
                          onClick={() => navigate(`/admin/edit/${admin.id}`)}
                          title="Düzenle"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleToggleStatus(admin)}
                          title="Durum Değiştir"
                        >
                          {admin.status === 'ACTIVE' ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button 
                          className="btn-icon delete" 
                          onClick={() => handleDelete(admin)}
                          title="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="no-data-message">
                      <User size={48} className="no-data-icon" />
                      <p>Gösterilecek admin bulunmuyor</p>
                      {searchTerm || statusFilter ? (
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('');
                          }}
                          className="btn btn-outline"
                        >
                          Filtreleri Temizle
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {filteredAdmins.length > 0 && (
        <div className="summary-section">
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Toplam:</span>
              <span className="summary-value">{filteredAdmins.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Aktif:</span>
              <span className="summary-value active">
                {filteredAdmins.filter(a => a.status === 'ACTIVE').length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Pasif:</span>
              <span className="summary-value inactive">
                {filteredAdmins.filter(a => a.status === 'INACTIVE').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminList;

