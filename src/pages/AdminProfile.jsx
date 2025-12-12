import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save,
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { adminApi } from '../services/apiService';
import '../styles/AdminProfile.css';

const AdminProfile = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password'
  
  const [profileData, setProfileData] = useState({
    name: '',
    surname: '',
    email: '',
    phoneNumber: '',
    emailVerified: false,
    phoneNumberVerified: false,
    status: '',
    roles: []
  });

<<<<<<< HEAD
  // Roller profileData.roles içinden alınacak, ayrı state'e gerek yok
=======
  const [myRoles, setMyRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
>>>>>>> 9d37eb05744291455eca991958fcde8a077f8437

  const [profileForm, setProfileForm] = useState({
    name: '',
    surname: '',
    email: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
<<<<<<< HEAD
    // getMyRoles endpoint'i Admin tablosunda arama yaptığı için SuperAdmin kullanıcıları için hata veriyor
    // Roller zaten getProfile endpoint'inden geliyor, ayrıca çağırmaya gerek yok
=======
    loadMyRoles();
>>>>>>> 9d37eb05744291455eca991958fcde8a077f8437
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminApi.getProfile();
      
      // Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
      const isSuccess = response?.success !== undefined ? response.success : (response?.isSuccess !== undefined ? response.isSuccess : false);
      if (response && isSuccess && response.data) {
        const data = response.data;
        setProfileData({
          name: data.name || '',
          surname: data.surname || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          emailVerified: data.emailVerified || false,
          phoneNumberVerified: data.phoneNumberVerified || false,
          status: data.status || '',
          roles: data.roles || []
        });
        
        setProfileForm({
          name: data.name || '',
          surname: data.surname || '',
          email: data.email || ''
        });
      } else {
        throw new Error(response?.message || 'Profil bilgileri alınamadı');
      }
    } catch (err) {
      console.error('Profil yükleme hatası:', err);
      setError(err.response?.data?.message || err.message || 'Profil bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  // loadMyRoles fonksiyonu kaldırıldı - Roller getProfile endpoint'inden geliyor
=======
  const loadMyRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await adminApi.getMyRoles();
      
      // Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
      const isSuccess = response?.success !== undefined ? response.success : (response?.isSuccess !== undefined ? response.isSuccess : false);
      if (response && isSuccess && response.data) {
        const roles = Array.isArray(response.data) ? response.data : [];
        setMyRoles(roles);
      }
    } catch (err) {
      // SuperAdmin kullanıcılar için Admin tablosunda kayıt olmayabilir, bu normal bir durum
      // Roller zaten profileData.roles içinde geliyor, bu yüzden sessizce devam et
      setMyRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };
>>>>>>> 9d37eb05744291455eca991958fcde8a077f8437

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!profileForm.name || !profileForm.surname || !profileForm.email) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await adminApi.updateProfile(profileForm);
      
      // Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
      const isSuccess = response?.success !== undefined ? response.success : (response?.isSuccess !== undefined ? response.isSuccess : false);
      if (response && isSuccess) {
        setSuccess('Profil bilgileriniz başarıyla güncellendi');
        await loadProfile();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response?.message || 'Profil güncelleme başarısız');
      }
    } catch (err) {
      console.error('Profil güncelleme hatası:', err);
      setError(err.response?.data?.message || err.message || 'Profil güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (passwordForm.newPassword.length !== 6) {
      setError('Şifre 6 karakter olmalıdır');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await adminApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      // Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
      const isSuccess = response?.success !== undefined ? response.success : (response?.isSuccess !== undefined ? response.isSuccess : false);
      if (response && isSuccess) {
        setSuccess('Şifreniz başarıyla değiştirildi');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response?.message || 'Şifre değiştirme başarısız');
      }
    } catch (err) {
      console.error('Şifre değiştirme hatası:', err);
      setError(err.response?.data?.message || err.message || 'Şifre değiştirilemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.name) {
    return (
      <div className="admin-profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Profil bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile-container">
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
            <h1 className="page-title">👤 Admin Profilim</h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
        </div>
      )}

      {success && (
        <div className="success-banner">
          <p>✅ {success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} />
          Profil Bilgileri
        </button>
        <button
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <Lock size={16} />
          Şifre Değiştir
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="profile-content">
          {/* Profile Info Display */}
          <div className="profile-info-section">
            <h3 className="section-title">Kişisel Bilgiler</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Ad</label>
                <div className="info-value">{profileData.name}</div>
              </div>
              <div className="info-item">
                <label>Soyad</label>
                <div className="info-value">{profileData.surname}</div>
              </div>
              <div className="info-item">
                <label>E-posta</label>
                <div className="info-value">
                  {profileData.email}
                  {profileData.emailVerified ? (
                    <CheckCircle size={16} className="verified-icon" />
                  ) : (
                    <XCircle size={16} className="unverified-icon" />
                  )}
                </div>
              </div>
              <div className="info-item">
                <label>Telefon</label>
                <div className="info-value">
                  {profileData.phoneNumber}
                  {profileData.phoneNumberVerified ? (
                    <CheckCircle size={16} className="verified-icon" />
                  ) : (
                    <XCircle size={16} className="unverified-icon" />
                  )}
                </div>
              </div>
              <div className="info-item">
                <label>Durum</label>
                <div className="info-value">
                  <span className={`status-badge ${profileData.status?.toLowerCase()}`}>
                    {profileData.status}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <label>Roller</label>
                <div className="info-value">
                  <div className="roles-badge">
<<<<<<< HEAD
                    {profileData.roles && profileData.roles.length > 0 ? (
                      Array.isArray(profileData.roles) ? (
                        profileData.roles.map((role, index) => (
                          <span key={index} className="role-badge">
                            {typeof role === 'string' ? role : role.name || role}
                          </span>
                        ))
                      ) : (
                        // Set veya başka bir iterable ise
                        Array.from(profileData.roles).map((role, index) => (
                          <span key={index} className="role-badge">
                            {typeof role === 'string' ? role : role.name || role}
                          </span>
                        ))
                      )
=======
                    {loadingRoles ? (
                      <span>Yükleniyor...</span>
                    ) : myRoles.length > 0 ? (
                      myRoles.map((role, index) => (
                        <span key={index} className="role-badge">{role}</span>
                      ))
                    ) : profileData.roles?.length > 0 ? (
                      profileData.roles.map((role, index) => (
                        <span key={index} className="role-badge">{role}</span>
                      ))
>>>>>>> 9d37eb05744291455eca991958fcde8a077f8437
                    ) : (
                      'Yok'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Update Form */}
          <div className="profile-form-section">
            <h3 className="section-title">
              <Edit size={16} />
              Profil Güncelle
            </h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <User size={16} />
                    Ad
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    placeholder="Adınız"
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
                    value={profileForm.surname}
                    onChange={handleProfileChange}
                    placeholder="Soyadınız"
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
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div className="form-actions">
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
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="profile-content">
          <div className="password-form-section">
            <h3 className="section-title">
              <Lock size={16} />
              Şifre Değiştir
            </h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>
                  <Lock size={16} />
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Mevcut şifrenizi girin"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Lock size={16} />
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Yeni şifrenizi girin (6 karakter)"
                  required
                  minLength={6}
                  maxLength={6}
                />
                <span className="form-hint">Şifre tam 6 karakter olmalıdır</span>
              </div>

              <div className="form-group">
                <label>
                  <Lock size={16} />
                  Yeni Şifre Tekrar
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Yeni şifrenizi tekrar girin"
                  required
                  minLength={6}
                  maxLength={6}
                />
              </div>

              <div className="form-actions">
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <Save size={16} />
                  {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;

