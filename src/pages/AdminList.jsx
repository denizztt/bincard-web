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
  User,
  Shield
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
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    loadAdmins();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, roleFilter, admins]);

  // Debounce için searchTerm değişikliğini izle
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length === 0 || searchTerm.length >= 3) {
        loadAdmins();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
  
  // Status ve role filtreleri değiştiğinde sadece frontend filtreleme yapılacak
  // Backend'e gönderilmeyecek çünkü enum bekliyor

  // Filtreler değiştiğinde sadece frontend filtreleme yapılacak, backend'e gönderilmeyecek
  // Çünkü backend status ve role parametrelerini enum olarak bekliyor
  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError('');
      try {
        // Status ve role filtrelerini backend'e göndermiyoruz çünkü backend enum bekliyor
        // Bu filtreler sadece frontend'de uygulanacak
        // Sadece searchTerm backend'e gönderiliyor
        const response = await superAdminApi.getAllAdmins(0, 50, undefined, undefined, searchTerm || undefined);
        if (response && response.success) {
          // Backend'den gelen data bir liste olabilir veya PageDTO içinde olabilir
          let items = [];
          if (Array.isArray(response.data)) {
            items = response.data;
          } else if (response.data?.content && Array.isArray(response.data.content)) {
            items = response.data.content;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            items = response.data.data;
          }
          
          const formattedItems = items.map((a) => ({
            id: a.id,
            name: a.profileInfo?.name || a.name,
            surname: a.profileInfo?.surname || a.surname,
            email: a.profileInfo?.email || a.email,
            phone: a.userNumber || a.phone,
            status: a.status,
            roles: Array.isArray(a.roles) ? a.roles : (a.role ? [a.role] : [])
          }));
          setAdmins(formattedItems);
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
    
    // Arama filtresi (sadece frontend'de, backend'de zaten filtrelenmiş olabilir)
    if (searchTerm && !searchTerm.includes('backend')) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(admin => 
        admin.name?.toLowerCase().includes(search) ||
        admin.surname?.toLowerCase().includes(search) ||
        admin.email?.toLowerCase().includes(search) ||
        admin.phone?.includes(search)
      );
    }
    
    // Durum filtresi (sadece frontend'de, backend'de zaten filtrelenmiş olabilir)
    if (statusFilter) {
      filtered = filtered.filter(admin => admin.status === statusFilter);
    }
    
    // Rol filtresi
    if (roleFilter) {
      filtered = filtered.filter(admin => 
        admin.roles && admin.roles.some(role => role === roleFilter)
      );
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
          
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="role-filter"
            >
              <option value="">Tüm Roller</option>
              <option value="SUPERADMIN">Super Admin</option>
              <option value="ADMIN_ALL">Tüm Yetkiler</option>
              <option value="STATION_ADMIN">İstasyon Yöneticisi</option>
              <option value="BUS_ADMIN">Otobüs Yöneticisi</option>
              <option value="DRIVER_ADMIN">Sürücü Yöneticisi</option>
              <option value="ROUTE_ADMIN">Rota Yöneticisi</option>
              <option value="NEWS_ADMIN">Haber Yöneticisi</option>
              <option value="WALLET_ADMIN">Cüzdan Yöneticisi</option>
              <option value="BUS_CARD_ADMIN">Kart Yöneticisi</option>
              <option value="REPORT_ADMIN">Rapor Yöneticisi</option>
              <option value="PAYMENT_POINT_ADMIN">Ödeme Noktası Yöneticisi</option>
              <option value="CONTRACT_ADMIN">Sözleşme Yöneticisi</option>
              <option value="NOTIFICATION_ADMIN">Bildirim Yöneticisi</option>
              <option value="HEALTH_ADMIN">Sistem Sağlık</option>
              <option value="GEO_ALERT_ADMIN">Coğrafi Uyarı</option>
              <option value="AUTO_TOP_UP_ADMIN">Otomatik Yükleme</option>
              <option value="FEED_BACK_ADMIN">Geri Bildirim</option>
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
                          onClick={() => navigate(`/admin/roles/${admin.id}`)}
                          title="Rol Yönetimi"
                        >
                          <Shield size={16} />
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

