import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  MapPin,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { stationApi } from '../services/apiService';
import { STATION_TYPES } from '../constants/stationTypes';
import '../styles/StationForm.css';

const StationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    latitude: '',
    longitude: '',
    type: 'OTOBUS',
    city: '',
    district: '',
    street: '',
    postalCode: '',
    active: true
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Load station data in edit mode
  useEffect(() => {
    if (isEditMode) {
      loadStationData();
    }
  }, [id]);

  const loadStationData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await stationApi.getStationById(parseInt(id));
      
      if (response && (response.isSuccess || response.success)) {
        const station = response.data;
        
        setFormData({
          id: station.id,
          name: station.name || '',
          latitude: station.latitude?.toString() || '',
          longitude: station.longitude?.toString() || '',
          type: station.type || 'OTOBUS',
          city: station.city || '',
          district: station.district || '',
          street: station.street || '',
          postalCode: station.postalCode || '',
          active: station.active !== undefined ? station.active : true
        });
      } else {
        throw new Error(response?.message || 'Durak bilgileri yüklenemedi');
      }
    } catch (error) {
      console.error('Durak yükleme hatası:', error);
      setError('Durak bilgileri yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Required fields
    if (!formData.name.trim()) {
      errors.name = 'Durak adı gereklidir';
    }

    if (!formData.latitude) {
      errors.latitude = 'Enlem gereklidir';
    } else {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = 'Geçerli bir enlem değeri giriniz (-90 ile 90 arası)';
      }
    }

    if (!formData.longitude) {
      errors.longitude = 'Boylam gereklidir';
    } else {
      const lng = parseFloat(formData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = 'Geçerli bir boylam değeri giriniz (-180 ile 180 arası)';
      }
    }

    if (!formData.city.trim()) {
      errors.city = 'Şehir gereklidir';
    }

    if (!formData.district.trim()) {
      errors.district = 'İlçe gereklidir';
    }

    if (!formData.street.trim()) {
      errors.street = 'Sokak gereklidir';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Lütfen tüm gerekli alanları doğru şekilde doldurunuz');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Prepare data for API
      const submitData = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      let response;
      
      if (isEditMode) {
        // Update existing station
        response = await stationApi.updateStation(submitData);
      } else {
        // Create new station
        response = await stationApi.createStation(submitData);
      }

      if (response && (response.isSuccess || response.success)) {
        setSuccess(isEditMode ? 'Durak başarıyla güncellendi!' : 'Durak başarıyla oluşturuldu!');
        
        // Redirect to station list after 2 seconds
        setTimeout(() => {
          navigate('/station-list');
        }, 2000);
      } else {
        throw new Error(response?.message || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      setError('İşlem sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setSaving(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Tarayıcınız konum servisini desteklemiyor');
      return;
    }

    setLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        setLoading(false);
      },
      (error) => {
        setError('Konum alınamadı: ' + error.message);
        setLoading(false);
      }
    );
  };

  if (loading && isEditMode) {
    return (
      <div className="station-form-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Durak bilgileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="station-form-container">
      {/* Header */}
      <div className="station-form-header">
        <button 
          className="btn-back"
          onClick={() => navigate('/station-list')}
        >
          <ArrowLeft size={20} />
          Durak Listesi
        </button>
        
        <h1>{isEditMode ? 'Durak Düzenle' : 'Yeni Durak Ekle'}</h1>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="message success-message">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {error && (
        <div className="message error-message">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="station-form">
        <div className="form-sections">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Temel Bilgiler</h3>
            
            <div className="form-group">
              <label htmlFor="name">Durak Adı *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={validationErrors.name ? 'error' : ''}
                placeholder="Örn: Taksim Meydanı"
                required
              />
              {validationErrors.name && (
                <span className="error-text">{validationErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="type">Durak Türü *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                {STATION_TYPES.filter(type => type.value !== 'ALL').map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {isEditMode && (
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  Aktif
                </label>
              </div>
            )}
          </div>

          {/* Location Information */}
          <div className="form-section">
            <h3>Konum Bilgileri</h3>
            
            <div className="location-controls">
              <button 
                type="button"
                className="btn-location"
                onClick={getCurrentLocation}
                disabled={loading}
              >
                <MapPin size={16} />
                {loading ? 'Konum alınıyor...' : 'Mevcut Konumu Al'}
              </button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Enlem (Latitude) *</label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className={validationErrors.latitude ? 'error' : ''}
                  placeholder="Örn: 41.0086"
                  step="any"
                  required
                />
                {validationErrors.latitude && (
                  <span className="error-text">{validationErrors.latitude}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Boylam (Longitude) *</label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className={validationErrors.longitude ? 'error' : ''}
                  placeholder="Örn: 28.9784"
                  step="any"
                  required
                />
                {validationErrors.longitude && (
                  <span className="error-text">{validationErrors.longitude}</span>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="form-section">
            <h3>Adres Bilgileri</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Şehir *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={validationErrors.city ? 'error' : ''}
                  placeholder="Örn: İstanbul"
                  required
                />
                {validationErrors.city && (
                  <span className="error-text">{validationErrors.city}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="district">İlçe *</label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className={validationErrors.district ? 'error' : ''}
                  placeholder="Örn: Beyoğlu"
                  required
                />
                {validationErrors.district && (
                  <span className="error-text">{validationErrors.district}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="street">Sokak/Cadde *</label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                className={validationErrors.street ? 'error' : ''}
                placeholder="Örn: Taksim Meydanı"
                required
              />
              {validationErrors.street && (
                <span className="error-text">{validationErrors.street}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="postalCode">Posta Kodu</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder="Örn: 34435"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/station-list')}
            disabled={saving}
          >
            <X size={16} />
            İptal
          </button>
          
          <button 
            type="submit"
            className="btn-save"
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw size={16} className="spinning" />
                {isEditMode ? 'Güncelleniyor...' : 'Kaydediliyor...'}
              </>
            ) : (
              <>
                <Save size={16} />
                {isEditMode ? 'Güncelle' : 'Kaydet'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StationForm;
