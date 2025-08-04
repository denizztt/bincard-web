import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  User, 
  Save, 
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  Mail,
  MapPin,
  Info,
  RefreshCw
} from 'lucide-react';
import { driverApi } from '../services/apiService';
import '../styles/DriverAdd.css'; // Same styles as DriverAdd

const DriverEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Form data
  const [formData, setFormData] = useState({
    address: '',
    licenseExpiryDate: '',
    licenseIssueDate: '',
    licenseClass: 'B',
    licenseNumber: '',
    shift: 'DAYTIME',
    active: true
  });

  // Original driver data for display
  const [driverInfo, setDriverInfo] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  // Shift options
  const shiftOptions = [
    { value: 'DAYTIME', label: 'Gündüz Vardiyası' },
    { value: 'NIGHT', label: 'Gece Vardiyası' }
  ];

  // License class options
  const licenseClassOptions = [
    { value: 'B', label: 'B Sınıfı (Otomobil)' },
    { value: 'C', label: 'C Sınıfı (Kamyon)' },
    { value: 'D', label: 'D Sınıfı (Otobüs)' },
    { value: 'E', label: 'E Sınıfı (Römork)' }
  ];

  // Load driver data
  useEffect(() => {
    if (id) {
      loadDriverData();
    }
  }, [id]);

  const loadDriverData = async () => {
    setLoadingData(true);
    try {
      const response = await driverApi.getDriverById(parseInt(id));
      
      if (response && response.success && response.data) {
        const driver = response.data;
        setDriverInfo(driver);
        
        // Set editable form data
        setFormData({
          address: driver.address || '',
          licenseExpiryDate: driver.licenseExpiryDate || '',
          licenseIssueDate: driver.licenseIssueDate || '',
          licenseClass: driver.licenseClass || 'B',
          licenseNumber: driver.licenseNumber || '',
          shift: driver.shift || 'DAYTIME',
          active: driver.active !== undefined ? driver.active : true
        });
      } else {
        setError('Şoför bilgileri yüklenemedi');
      }
    } catch (err) {
      console.error('Error loading driver:', err);
      setError('Şoför bilgileri yüklenirken hata oluştu');
    } finally {
      setLoadingData(false);
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    setError('');
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'Ehliyet numarası zorunludur';
    }
    if (!formData.licenseIssueDate) {
      newErrors.licenseIssueDate = 'Ehliyet alış tarihi zorunludur';
    }
    if (!formData.licenseExpiryDate) {
      newErrors.licenseExpiryDate = 'Ehliyet bitiş tarihi zorunludur';
    } else {
      const expiryDate = new Date(formData.licenseExpiryDate);
      const today = new Date();
      if (expiryDate <= today) {
        newErrors.licenseExpiryDate = 'Ehliyet bitiş tarihi gelecekte olmalıdır';
      }
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Adres zorunludur';
    }

    // Date validations
    if (formData.licenseIssueDate && formData.licenseExpiryDate) {
      const issueDate = new Date(formData.licenseIssueDate);
      const expiryDate = new Date(formData.licenseExpiryDate);
      if (issueDate >= expiryDate) {
        newErrors.licenseExpiryDate = 'Bitiş tarihi alış tarihinden sonra olmalıdır';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Lütfen tüm zorunlu alanları doğru şekilde doldurunuz');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await driverApi.updateDriver(parseInt(id), formData);

      if (response && response.success) {
        setSuccess('Şoför bilgileri başarıyla güncellendi!');
        setTimeout(() => {
          navigate('/driver');
        }, 2000);
      } else {
        setError(response.message || 'Şoför güncellenirken hata oluştu');
      }
    } catch (err) {
      console.error('Error updating driver:', err);
      setError('Şoför güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Calculate age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loadingData) {
    return (
      <div className="driver-add-container">
        <div className="loading-container">
          <RefreshCw className="spinning" size={48} />
          <p>Şoför bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!driverInfo) {
    return (
      <div className="driver-add-container">
        <div className="error-container">
          <p>Şoför bulunamadı</p>
          <button onClick={() => navigate('/driver')} className="btn btn-primary">
            Şoför Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="driver-add-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button
            onClick={() => navigate('/driver')}
            className="btn btn-secondary"
          >
            <ArrowLeft size={18} />
            Geri
          </button>
          <div>
            <h1><User size={24} /> Şoför Düzenle</h1>
            <p>{driverInfo.firstName} {driverInfo.lastName} - TC: {driverInfo.nationalId}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-sections">
            {/* Non-editable Information */}
            <div className="form-section">
              <div className="section-header">
                <User size={20} />
                <h3>Kişisel Bilgiler (Değiştirilemez)</h3>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Ad</label>
                  <input
                    type="text"
                    value={driverInfo.firstName}
                    disabled
                    className="form-input disabled"
                  />
                </div>

                <div className="form-group">
                  <label>Soyad</label>
                  <input
                    type="text"
                    value={driverInfo.lastName}
                    disabled
                    className="form-input disabled"
                  />
                </div>

                <div className="form-group">
                  <label>E-posta</label>
                  <input
                    type="email"
                    value={driverInfo.email}
                    disabled
                    className="form-input disabled"
                  />
                </div>

                <div className="form-group">
                  <label>TC Kimlik No</label>
                  <input
                    type="text"
                    value={driverInfo.nationalId}
                    disabled
                    className="form-input disabled"
                  />
                </div>

                <div className="form-group">
                  <label>Doğum Tarihi</label>
                  <input
                    type="text"
                    value={driverInfo.dateOfBirth ? new Date(driverInfo.dateOfBirth).toLocaleDateString('tr-TR') : '-'}
                    disabled
                    className="form-input disabled"
                  />
                  {driverInfo.dateOfBirth && (
                    <span className="age-info">
                      Yaş: {calculateAge(driverInfo.dateOfBirth)}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>İşe Başlama</label>
                  <input
                    type="text"
                    value={driverInfo.employmentDate ? new Date(driverInfo.employmentDate).toLocaleDateString('tr-TR') : '-'}
                    disabled
                    className="form-input disabled"
                  />
                </div>
              </div>
            </div>

            {/* Editable License Information */}
            <div className="form-section">
              <div className="section-header">
                <FileText size={20} />
                <h3>Ehliyet Bilgileri (Düzenlenebilir)</h3>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Ehliyet Sınıfı *</label>
                  <select
                    value={formData.licenseClass}
                    onChange={(e) => handleInputChange('licenseClass', e.target.value)}
                    className="form-select"
                  >
                    {licenseClassOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Ehliyet Numarası *</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    placeholder="Ehliyet numarası"
                    className={`form-input ${errors.licenseNumber ? 'error' : ''}`}
                  />
                  {errors.licenseNumber && (
                    <span className="error-text">{errors.licenseNumber}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Ehliyet Alış Tarihi *</label>
                  <div className="input-with-icon">
                    <Calendar size={16} />
                    <input
                      type="date"
                      value={formData.licenseIssueDate}
                      onChange={(e) => handleInputChange('licenseIssueDate', e.target.value)}
                      className={`form-input ${errors.licenseIssueDate ? 'error' : ''}`}
                    />
                  </div>
                  {errors.licenseIssueDate && (
                    <span className="error-text">{errors.licenseIssueDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Ehliyet Bitiş Tarihi *</label>
                  <div className="input-with-icon">
                    <Calendar size={16} />
                    <input
                      type="date"
                      value={formData.licenseExpiryDate}
                      onChange={(e) => handleInputChange('licenseExpiryDate', e.target.value)}
                      className={`form-input ${errors.licenseExpiryDate ? 'error' : ''}`}
                    />
                  </div>
                  {errors.licenseExpiryDate && (
                    <span className="error-text">{errors.licenseExpiryDate}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Editable Work Information */}
            <div className="form-section">
              <div className="section-header">
                <Clock size={20} />
                <h3>Çalışma Bilgileri</h3>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Vardiya *</label>
                  <div className="input-with-icon">
                    <Clock size={16} />
                    <select
                      value={formData.shift}
                      onChange={(e) => handleInputChange('shift', e.target.value)}
                      className="form-select"
                    >
                      {shiftOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Durum</label>
                  <select
                    value={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.value === 'true')}
                    className="form-select"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Pasif</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="form-section">
              <div className="section-header">
                <MapPin size={20} />
                <h3>İletişim Bilgileri</h3>
              </div>
              
              <div className="form-group">
                <label>Adres *</label>
                <div className="input-with-icon">
                  <MapPin size={16} />
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Tam adres bilgisi..."
                    className={`form-textarea ${errors.address ? 'error' : ''}`}
                    rows={3}
                  />
                </div>
                {errors.address && (
                  <span className="error-text">{errors.address}</span>
                )}
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="error-message">
              <Info size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <Info size={16} />
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/driver')}
              className="btn btn-secondary"
            >
              İptal
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverEdit;