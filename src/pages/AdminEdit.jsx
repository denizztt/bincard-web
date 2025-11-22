import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save,
  User,
  Mail,
  Lock,
  Shield
} from 'lucide-react';
import { superAdminApi } from '../services/apiService';
import '../styles/AdminEdit.css';

const AdminEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    roles: []
  });

  const roleOptions = [
  { value: 'ADMIN_ALL', label: 'Tüm Yetkiler' },
  { value: 'STATION_ADMIN', label: 'İstasyon Yöneticisi' },
  { value: 'BUS_ADMIN', label: 'Otobüs Yöneticisi' },
  { value: 'NEWS_ADMIN', label: 'Haber Yöneticisi' },
  { value: 'WALLET_ADMIN', label: 'Cüzdan Yöneticisi' },
  { value: 'REPORT_ADMIN', label: 'Rapor Yöneticisi' }
  ];

  useEffect(() => {
    loadAdminData();
  }, [id]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const adminId = parseInt(id);
      if (Number.isNaN(adminId)) {
        throw new Error('Geçersiz admin ID');
      }

      // Admin detayı (backend eklenmemiş olabilir; 404 gelirse kullanıcıya gösteririz)
      try {
        const response = await superAdminApi.getAdminById(adminId);
        if (response && response.success && response.data) {
          const data = response.data;
          setFormData({
            name: data.profileInfo?.name || '',
            surname: data.profileInfo?.surname || '',
            email: data.profileInfo?.email || '',
            password: '',
            roles: Array.isArray(data.roles) ? data.roles : []
          });
        } else {
          throw new Error(response?.message || 'Admin detayı alınamadı');
        }
      } catch (innerErr) {
        // Detay endpoint yoksa kullanıcı forma manuel girebilir
        console.warn('Admin detayı alınamadı:', innerErr);
      }
      setLoading(false);
    } catch (err) {
      console.error('Admin detayları yüklenirken hata:', err);
      setError(err.response?.data?.message || err.message || 'Admin detayları yüklenemedi');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (roleValue) => {
    setFormData(prev => {
      const roles = prev.roles.includes(roleValue)
        ? prev.roles.filter(r => r !== roleValue)
        : [...prev.roles, roleValue];
      
      return {
        ...prev,
        roles
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.surname || !formData.email) {
      setError('Lütfen zorunlu alanları doldurun');
      return;
    }

    if (formData.roles.length === 0) {
      setError('Lütfen en az bir rol seçin');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Şifre boşsa gönderme
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      const response = await superAdminApi.updateAdmin(parseInt(id), updateData);

      const serverMessage = response?.message || '';
      const looksFailed =
        !response?.success ||
        /bulunamad[ıi]/i.test(serverMessage) ||
        /not\s*found/i.test(serverMessage);

      if (looksFailed) {
        throw new Error(serverMessage || 'Admin güncelleme başarısız');
      }

      alert(serverMessage || 'Admin başarıyla güncellendi');
      navigate('/admin/list');
    } catch (err) {
      console.error('Admin güncelleme hatası:', err);
      setError(err.response?.data?.message || err.message || 'Admin güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-edit-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Admin bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-edit-container">
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
            <h1 className="page-title">✏️ Admin Düzenle</h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Form */}
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">Kişisel Bilgiler</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>
                  <User size={16} />
                  Ad
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Admin adı"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <User size={16} />
                  Soyad
                </label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  placeholder="Admin soyadı"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <Mail size={16} />
                E-posta
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={16} />
                Yeni Şifre (İsteğe bağlı)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Şifreyi değiştirmek istemiyorsanız boş bırakın"
                minLength={8}
              />
              <span className="form-hint">Şifreyi değiştirmek için yeni şifre girin</span>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <Shield size={16} />
              Roller
            </h3>
            
            <div className="roles-grid">
              {roleOptions.map(role => (
                <label key={role.value} className="role-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role.value)}
                    onChange={() => handleRoleChange(role.value)}
                  />
                  <span className="checkmark"></span>
                  <span className="role-label">{role.label}</span>
                </label>
              ))}
            </div>
            
            {formData.roles.length > 0 && (
              <div className="selected-roles">
                <p>Seçilen Roller:</p>
                <div className="selected-roles-list">
                  {formData.roles.map(role => (
                    <span key={role} className="selected-role-badge">
                      {roleOptions.find(r => r.value === role)?.label || role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button"
              onClick={() => navigate('/admin/list')}
              className="btn btn-secondary"
            >
              İptal
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEdit;

