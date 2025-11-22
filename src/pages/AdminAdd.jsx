import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save,
  User,
  Mail,
  Phone,
  Lock,
  Shield
} from 'lucide-react';
import { superAdminApi } from '../services/apiService';
import '../styles/AdminAdd.css';

const AdminAdd = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    telephone: '',
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
    
    if (!formData.name || !formData.surname || !formData.email || 
        !formData.telephone || !formData.password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (!formData.roles || formData.roles.length === 0) {
      setError('Lütfen en az bir rol seçin');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Backend Role enum isimleriyle birebir göndermek için roles'i normalize et
      const payload = {
        ...formData,
        telephone: String(formData.telephone || '').trim(),
        roles: (formData.roles || []).map(r => String(r).toUpperCase())
      };

      const response = await superAdminApi.createAdmin(payload);
      
      if (response && response.success) {
        alert('Admin başarıyla oluşturuldu');
        navigate('/admin/list');
      } else {
        throw new Error(response?.message || 'Admin oluşturma başarısız');
      }
    } catch (err) {
      console.error('Admin oluşturma hatası:', err);
      setError(err.response?.data?.message || err.message || 'Admin oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-container">
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
            <h1 className="page-title">➕ Yeni Admin Ekle</h1>
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

            <div className="form-row">
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
                  <Phone size={16} />
                  Telefon
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="5551234567"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <Lock size={16} />
                Şifre
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Güçlü bir şifre girin"
                required
                minLength={8}
              />
              <span className="form-hint">Şifre en az 8 karakter olmalıdır</span>
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
              {loading ? 'Kaydediliyor...' : 'Admin Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAdd;

