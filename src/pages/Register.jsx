import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, User, Mail, Phone, Lock, Save } from 'lucide-react';
import { adminApi } from '../services/apiService';
import { formatPhoneNumber, cleanPhoneNumber, validatePhoneNumber } from '../utils/phoneUtils';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    telephone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telephone') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'password' || name === 'confirmPassword') {
      // Limit password to 6 characters
      const limited = value.substring(0, 6);
      setFormData(prev => ({ ...prev, [name]: limited }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ad zorunludur';
    }
    
    if (!formData.surname.trim()) {
      newErrors.surname = 'Soyad zorunludur';
    }
    
    const cleanedPhone = cleanPhoneNumber(formData.telephone);
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Telefon numarası zorunludur';
    } else if (!validatePhoneNumber(formData.telephone)) {
      newErrors.telephone = '10 haneli telefon numarası giriniz';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Şifre zorunludur';
    } else if (formData.password.length !== 6) {
      newErrors.password = 'Şifre 6 karakter olmalıdır';
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Şifre tekrarı zorunludur';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const cleanedPhone = cleanPhoneNumber(formData.telephone);
      
      const adminData = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        telephone: cleanedPhone,
        email: formData.email.trim(),
        password: formData.password,
        roles: [] // Admin kayıt için roller boş olabilir, super admin onaylayacak
      };
      
      const response = await adminApi.signUp(adminData);
      
      // Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
      const isSuccess = response?.success !== undefined ? response.success : (response?.isSuccess !== undefined ? response.isSuccess : false);
      if (response && isSuccess) {
        setSuccess('Kayıt başarıyla oluşturuldu! Onay için bekleyiniz.');
        // Formu temizle
        setFormData({
          name: '',
          surname: '',
          telephone: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        throw new Error(response?.message || 'Kayıt işlemi başarısız');
      }
    } catch (err) {
      console.error('Kayıt hatası:', err);
      setError(err.response?.data?.message || err.message || 'Kayıt işlemi başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <button className="back-button" onClick={() => navigate('/login')}>
          <ArrowLeft size={20} />
          Geri
        </button>

        <div className="register-header">
          <div className="register-icon">
            <UserPlus size={48} />
          </div>
          <h1>Admin Kayıt</h1>
          <p>Yeni admin hesabı oluşturun</p>
        </div>

        {error && (
          <div className="error-banner" style={{ margin: '1rem', padding: '1rem', background: '#fee', color: '#c33', borderRadius: '8px' }}>
            <p>⚠️ {error}</p>
          </div>
        )}

        {success && (
          <div className="success-banner" style={{ margin: '1rem', padding: '1rem', background: '#efe', color: '#3c3', borderRadius: '8px' }}>
            <p>✅ {success}</p>
          </div>
        )}

        <div className="register-content">
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>
                  <User size={16} />
                  Ad *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Adınız"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: errors.name ? '2px solid #c33' : '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                />
                {errors.name && <span style={{ color: '#c33', fontSize: '0.875rem' }}>{errors.name}</span>}
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>
                  <User size={16} />
                  Soyad *
                </label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  placeholder="Soyadınız"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: errors.surname ? '2px solid #c33' : '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                />
                {errors.surname && <span style={{ color: '#c33', fontSize: '0.875rem' }}>{errors.surname}</span>}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>
                <Phone size={16} />
                Telefon Numarası *
              </label>
              <input
                type="text"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                placeholder="555 000 00 00"
                maxLength={13}
                required
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: errors.telephone ? '2px solid #c33' : '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              {errors.telephone && <span style={{ color: '#c33', fontSize: '0.875rem' }}>{errors.telephone}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>
                <Mail size={16} />
                E-posta *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="ornek@email.com"
                required
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: errors.email ? '2px solid #c33' : '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              {errors.email && <span style={{ color: '#c33', fontSize: '0.875rem' }}>{errors.email}</span>}
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>
                  <Lock size={16} />
                  Şifre *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="6 karakter"
                  maxLength={6}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: errors.password ? '2px solid #c33' : '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                />
                {errors.password && <span style={{ color: '#c33', fontSize: '0.875rem' }}>{errors.password}</span>}
                <span style={{ fontSize: '0.75rem', color: '#666' }}>Şifre tam 6 karakter olmalıdır</span>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>
                  <Lock size={16} />
                  Şifre Tekrar *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="6 karakter"
                  maxLength={6}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: errors.confirmPassword ? '2px solid #c33' : '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                />
                {errors.confirmPassword && <span style={{ color: '#c33', fontSize: '0.875rem' }}>{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button 
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: loading ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                <Save size={16} />
                {loading ? 'Kayıt Oluşturuluyor...' : 'Kayıt Ol'}
              </button>
            </div>
          </form>

          <div className="register-info" style={{ marginTop: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
              <strong>Not:</strong> Kayıt işlemi sonrası hesabınız super admin tarafından onaylanacaktır. 
              Onaylandıktan sonra giriş yapabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
