import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Info
} from 'lucide-react';
import { driverApi } from '../services/apiService';
import '../styles/DriverAdd.css';

const DriverAdd = () => {
  const navigate = useNavigate();
  
  // Form data
  const [formData, setFormData] = useState({
    cardUid: '',
    firstName: '',
    lastName: '',
    email: '',
    nationalId: '',
    dateOfBirth: '',
    licenseClass: 'B',
    licenseNumber: '',
    licenseExpiryDate: '',
    licenseIssueDate: '',
    address: '',
    shift: 'DAYTIME'
  });

  // UI states
  const [loading, setLoading] = useState(false);
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

    // Required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad zorunludur';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad zorunludur';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta zorunludur';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'TC Kimlik No zorunludur';
    } else if (!/^\d{11}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'TC Kimlik No 11 haneli olmalıdır';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Doğum tarihi zorunludur';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'Şoför en az 18 yaşında olmalıdır';
      }
      if (age > 65) {
        newErrors.dateOfBirth = 'Şoför en fazla 65 yaşında olabilir';
      }
    }
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
      const response = await driverApi.createDriver(formData);

      // Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
      const isSuccess = response?.success !== undefined ? response.success : (response?.isSuccess !== undefined ? response.isSuccess : false);
      
      if (response && isSuccess) {
        setSuccess('Şoför başarıyla eklendi!');
        setTimeout(() => {
          navigate('/driver');
        }, 2000);
      } else {
        setError(response?.message || 'Şoför eklenirken hata oluştu');
      }
    } catch (err) {
      console.error('Error creating driver:', err);
      setError('Şoför eklenirken hata oluştu');
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
            <h1><User size={24} /> Yeni Şoför Ekle</h1>
            <p>Sisteme yeni şoför kaydı oluşturun</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-sections">
            {/* Personal Information */}
            <div className="form-section">
              <div className="section-header">
                <User size={20} />
                <h3>Kişisel Bilgiler</h3>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Ad *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Örn: Ahmet veya Mehmet"
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                  />
                  <small className="form-hint">Şoförün adını girin. Örnek: Ahmet, Mehmet, Ayşe</small>
                  {errors.firstName && (
                    <span className="error-text">{errors.firstName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Soyad *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Örn: Yılmaz veya Demir"
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                  />
                  <small className="form-hint">Şoförün soyadını girin. Örnek: Yılmaz, Demir, Kaya</small>
                  {errors.lastName && (
                    <span className="error-text">{errors.lastName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>E-posta *</label>
                  <div className="input-with-icon">
                    <Mail size={16} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Örn: driver@example.com veya mehmet.yilmaz@citycard.gov.tr"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                    />
                  </div>
                  <small className="form-hint">Geçerli bir e-posta adresi girin. Örnek: driver@example.com, mehmet.yilmaz@citycard.gov.tr</small>
                  {errors.email && (
                    <span className="error-text">{errors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>TC Kimlik No *</label>
                  <div className="input-with-icon">
                    <CreditCard size={16} />
                    <input
                      type="text"
                      value={formData.nationalId}
                      onChange={(e) => handleInputChange('nationalId', e.target.value.replace(/\D/g, '').substring(0, 11))}
                      placeholder="Örn: 12345678901"
                      className={`form-input ${errors.nationalId ? 'error' : ''}`}
                    />
                  </div>
                  <small className="form-hint">11 haneli TC Kimlik numarasını girin (sadece rakam). Örnek: 12345678901, 98765432109</small>
                  {errors.nationalId && (
                    <span className="error-text">{errors.nationalId}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Kart UID</label>
                  <div className="input-with-icon">
                    <CreditCard size={16} />
                    <input
                      type="text"
                      value={formData.cardUid}
                      onChange={(e) => handleInputChange('cardUid', e.target.value)}
                      placeholder="Örn: CARD-1234567890 (opsiyonel)"
                      className="form-input"
                    />
                  </div>
                  <small className="form-hint">Kart UID'si genellikle 8-16 karakter arası alfanumerik bir değerdir. Örnek: CARD-1111, 12345678ABCD (opsiyonel)</small>
                </div>

                <div className="form-group">
                  <label>Doğum Tarihi *</label>
                  <div className="input-with-icon">
                    <Calendar size={16} />
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                    />
                  </div>
                  {formData.dateOfBirth && (
                    <span className="age-info">
                      Yaş: {calculateAge(formData.dateOfBirth)}
                    </span>
                  )}
                  {errors.dateOfBirth && (
                    <span className="error-text">{errors.dateOfBirth}</span>
                  )}
                </div>

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
              </div>
            </div>

            {/* License Information */}
            <div className="form-section">
              <div className="section-header">
                <FileText size={20} />
                <h3>Ehliyet Bilgileri</h3>
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
                    placeholder="Örn: 123456789 veya ABC123456"
                    className={`form-input ${errors.licenseNumber ? 'error' : ''}`}
                  />
                  <small className="form-hint">Ehliyet numarasını girin. Örnek: 123456789, ABC123456, 987654321</small>
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
                    placeholder="Örn: Atatürk Mahallesi, İstiklal Caddesi No:123, Beyoğlu/İstanbul"
                    className={`form-textarea ${errors.address ? 'error' : ''}`}
                    rows={3}
                  />
                </div>
                <small className="form-hint">Tam adres bilgisini girin. Örnek: Atatürk Mahallesi, İstiklal Caddesi No:123, Beyoğlu/İstanbul</small>
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
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Şoförü Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverAdd;