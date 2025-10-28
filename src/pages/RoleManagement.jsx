import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save,
  Shield,
  UserPlus,
  UserMinus,
  Check,
  X
} from 'lucide-react';
import { superAdminApi } from '../services/apiService';
import '../styles/RoleManagement.css';

const RoleManagement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentRoles, setCurrentRoles] = useState([]);
  const [adminInfo, setAdminInfo] = useState(null);
  
  const allRoles = [
    { value: 'ADMIN_ALL', label: 'Tüm Yetkiler' },
    { value: 'ADMIN_STATION', label: 'İstasyon Yöneticisi' },
    { value: 'ADMIN_BUS', label: 'Otobüs Yöneticisi' },
    { value: 'ADMIN_NEWS', label: 'Haber Yöneticisi' },
    { value: 'ADMIN_WALLET', label: 'Cüzdan Yöneticisi' },
    { value: 'ADMIN_REPORT', label: 'Rapor Yöneticisi' }
  ];

  useEffect(() => {
    loadAdminRoles();
  }, [id]);

  const loadAdminRoles = async () => {
    try {
      setLoading(true);
      setError('');
      
      // TODO: Mock data - Backend'den admin bilgisi ve rolleri
      // const response = await superAdminApi.getAdminRoles(parseInt(id));
      // setCurrentRoles(response.data);
      
      // Mock data
      const mockRoles = ['ADMIN_ALL', 'ADMIN_STATION'];
      const mockAdmin = {
        id: parseInt(id),
        name: 'Ahmet',
        surname: 'Yılmaz',
        email: 'ahmet@example.com'
      };
      
      setCurrentRoles(mockRoles);
      setAdminInfo(mockAdmin);
      setLoading(false);
    } catch (err) {
      console.error('Rol bilgileri yüklenirken hata:', err);
      setError('Rol bilgileri yüklenemedi');
      setLoading(false);
    }
  };

  const handleAddRole = async (roleValue) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await superAdminApi.addRole({
        adminId: parseInt(id),
        roles: [roleValue]
      });
      
      if (response && response.success) {
        setCurrentRoles(prev => [...prev, roleValue]);
        alert('Rol başarıyla eklendi');
      } else {
        throw new Error(response?.message || 'Rol ekleme başarısız');
      }
    } catch (err) {
      console.error('Rol ekleme hatası:', err);
      setError(err.response?.data?.message || err.message || 'Rol eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleValue) => {
    if (!window.confirm(`${getRoleLabel(roleValue)} rolünü kaldırmak istediğinize emin misiniz?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await superAdminApi.removeRole({
        adminId: parseInt(id),
        roles: [roleValue]
      });
      
      if (response && response.success) {
        setCurrentRoles(prev => prev.filter(r => r !== roleValue));
        alert('Rol başarıyla kaldırıldı');
      } else {
        throw new Error(response?.message || 'Rol kaldırma başarısız');
      }
    } catch (err) {
      console.error('Rol kaldırma hatası:', err);
      setError(err.response?.data?.message || err.message || 'Rol kaldırılamadı');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (roleValue) => {
    return allRoles.find(r => r.value === roleValue)?.label || roleValue;
  };

  if (loading && !adminInfo) {
    return (
      <div className="role-management-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Rol bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="role-management-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-top">
          <div className="header-left">
            <button 
              onClick={() => navigate('/admin/list')}
              className="btn btn-secondary"
            >
              <ArrowLeft size={20} />
              Geri Dön
            </button>
            <h1 className="page-title">🛡️ Rol Yönetimi</h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Admin Info */}
      {adminInfo && (
        <div className="admin-info-card">
          <div className="admin-avatar">
            <Shield size={24} />
          </div>
          <div className="admin-details">
            <h3>{adminInfo.name} {adminInfo.surname}</h3>
            <p>{adminInfo.email}</p>
          </div>
        </div>
      )}

      {/* Current Roles */}
      <div className="roles-section">
        <h3 className="section-title">Mevcut Roller</h3>
        
        {currentRoles.length > 0 ? (
          <div className="roles-list">
            {currentRoles.map((role, index) => (
              <div key={index} className="role-item">
                <Shield size={16} />
                <span className="role-name">{getRoleLabel(role)}</span>
                <button 
                  className="btn-remove"
                  onClick={() => handleRemoveRole(role)}
                  disabled={loading}
                  title="Rolü Kaldır"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-roles">
            <Shield size={48} />
            <p>Bu admin için henüz rol tanımlanmamış</p>
          </div>
        )}
      </div>

      {/* Available Roles */}
      <div className="roles-section">
        <h3 className="section-title">Mevcut Olan Roller</h3>
        
        <div className="roles-grid">
          {allRoles.map(role => {
            const hasRole = currentRoles.includes(role.value);
            
            return (
              <div 
                key={role.value} 
                className={`role-card ${hasRole ? 'disabled' : ''}`}
              >
                <Shield size={20} />
                <span className="role-label">{role.label}</span>
                {hasRole ? (
                  <Check size={16} className="role-check" />
                ) : (
                  <button 
                    className="btn-add"
                    onClick={() => handleAddRole(role.value)}
                    disabled={loading}
                    title="Rolü Ekle"
                  >
                    <UserPlus size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {currentRoles.length > 0 && (
        <div className="summary-section">
          <div className="summary-info">
            <h4>Rol Özeti</h4>
            <p>Bu admin {currentRoles.length} role sahip</p>
            <div className="roles-summary">
              {currentRoles.map((role, index) => (
                <span key={index} className="role-badge">
                  {getRoleLabel(role)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;

