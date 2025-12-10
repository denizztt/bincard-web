import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, 
  Save, 
  ArrowLeft,
  CreditCard,
  Users,
  Route as RouteIcon,
  FileText,
  Info
} from 'lucide-react';
import { busApi, routeApi, driverApi } from '../services/apiService';
import { DEFAULT_BUS_FORM, BUS_VALIDATION } from '../constants/busTypes';
import '../styles/BusAdd.css';

const BusAdd = () => {
  const navigate = useNavigate();
  
  // Form data
  const [formData, setFormData] = useState(DEFAULT_BUS_FORM);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Load routes and drivers
  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      // Load routes
      const routesResponse = await routeApi.getAllRoutes();
      if (routesResponse && routesResponse.success && routesResponse.data) {
        setRoutes(routesResponse.data.content || routesResponse.data || []);
      }

      // Load drivers
      const driversResponse = await driverApi.getAllDrivers(0, 100);
      if (driversResponse && driversResponse.success && driversResponse.data) {
        setDrivers(driversResponse.data.content || driversResponse.data || []);
      }
    } catch (err) {
      console.error('Error loading options:', err);
    } finally {
      setLoadingOptions(false);
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

    // Number plate validation
    if (!formData.numberPlate.trim()) {
      newErrors.numberPlate = 'Plaka numarası zorunludur';
    } else if (formData.numberPlate.length < BUS_VALIDATION.numberPlate.minLength || 
               formData.numberPlate.length > BUS_VALIDATION.numberPlate.maxLength) {
      newErrors.numberPlate = `Plaka numarası ${BUS_VALIDATION.numberPlate.minLength}-${BUS_VALIDATION.numberPlate.maxLength} karakter arasında olmalıdır`;
    } else if (!BUS_VALIDATION.numberPlate.pattern.test(formData.numberPlate)) {
      newErrors.numberPlate = 'Plaka numarası sadece büyük harf, rakam ve boşluk içerebilir';
    }

    // Base fare validation
    if (formData.baseFare === null || formData.baseFare === undefined || formData.baseFare === '') {
      newErrors.baseFare = 'Ücret bilgisi zorunludur';
    } else {
      const fare = parseFloat(formData.baseFare);
      if (isNaN(fare) || fare < BUS_VALIDATION.baseFare.min) {
        newErrors.baseFare = `Ücret en az ${BUS_VALIDATION.baseFare.min} TL olmalıdır`;
      } else if (fare > BUS_VALIDATION.baseFare.max) {
        newErrors.baseFare = `Ücret en fazla ${BUS_VALIDATION.baseFare.max} TL olabilir`;
      }
    }

    // Capacity validation
    if (formData.capacity === null || formData.capacity === undefined || formData.capacity === '') {
      newErrors.capacity = 'Kapasite zorunludur';
    } else {
      const capacity = parseInt(formData.capacity);
      if (isNaN(capacity) || capacity < BUS_VALIDATION.capacity.min) {
        newErrors.capacity = `Kapasite en az ${BUS_VALIDATION.capacity.min} olmalıdır`;
      } else if (capacity > BUS_VALIDATION.capacity.max) {
        newErrors.capacity = `Kapasite en fazla ${BUS_VALIDATION.capacity.max} olabilir`;
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
      const submitData = {
        numberPlate: formData.numberPlate.trim().toUpperCase(),
        routeId: formData.routeId || null,
        driverId: formData.driverId || null,
        baseFare: parseFloat(formData.baseFare),
        capacity: parseInt(formData.capacity),
        notes: formData.notes || null
      };

      console.log('Creating bus with data:', submitData);
      const response = await busApi.createBus(submitData);

      // Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
      const isSuccess = response?.success !== undefined ? response.success : (response?.isSuccess !== undefined ? response.isSuccess : false);
      
      if (response && isSuccess) {
        setSuccess('Otobüs başarıyla eklendi!');
        setTimeout(() => {
          navigate('/bus');
        }, 2000);
      } else {
        setError(response?.message || 'Otobüs eklenirken hata oluştu');
      }
    } catch (err) {
      console.error('Error creating bus:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Otobüs eklenirken hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bus-add-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button
            onClick={() => navigate('/bus')}
            className="btn btn-secondary"
          >
            <ArrowLeft size={18} />
            Geri
          </button>
          <div>
            <h1><Bus size={24} /> Yeni Otobüs Ekle</h1>
            <p>Sisteme yeni otobüs kaydı oluşturun</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-sections">
            {/* Basic Information */}
            <div className="form-section">
              <div className="section-header">
                <Bus size={20} />
                <h3>Temel Bilgiler</h3>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Plaka Numarası *</label>
                  <input
                    type="text"
                    value={formData.numberPlate}
                    onChange={(e) => handleInputChange('numberPlate', e.target.value.toUpperCase())}
                    placeholder="Örn: 34 ABC 123 veya 06 XYZ 456"
                    className={`form-input ${errors.numberPlate ? 'error' : ''}`}
                    maxLength={20}
                  />
                  <small className="form-hint">Plaka numarasını büyük harflerle girin. Örnek: 34 ABC 123, 06 XYZ 456, 35 DEF 789</small>
                  {errors.numberPlate && (
                    <span className="error-text">{errors.numberPlate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Ücret (₺) *</label>
                  <div className="input-with-icon">
                    <CreditCard size={16} />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1000"
                      value={formData.baseFare}
                      onChange={(e) => handleInputChange('baseFare', e.target.value)}
                      placeholder="Örn: 5.50 veya 10.00"
                      className={`form-input ${errors.baseFare ? 'error' : ''}`}
                    />
                  </div>
                  <small className="form-hint">Otobüs ücretini TL cinsinden girin. Ondalıklı değer girebilirsiniz. Örnek: 5.50, 10.00, 15.75</small>
                  {errors.baseFare && (
                    <span className="error-text">{errors.baseFare}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Kapasite *</label>
                  <div className="input-with-icon">
                    <Users size={16} />
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      placeholder="Örn: 50 veya 100"
                      className={`form-input ${errors.capacity ? 'error' : ''}`}
                    />
                  </div>
                  <small className="form-hint">Otobüsün maksimum yolcu kapasitesini girin (10-200 arası). Örnek: 50, 100, 150</small>
                  {errors.capacity && (
                    <span className="error-text">{errors.capacity}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Assignment Information */}
            <div className="form-section">
              <div className="section-header">
                <RouteIcon size={20} />
                <h3>Atama Bilgileri</h3>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Rota</label>
                  <div className="input-with-icon">
                    <RouteIcon size={16} />
                    <select
                      value={formData.routeId || ''}
                      onChange={(e) => handleInputChange('routeId', e.target.value ? parseInt(e.target.value) : null)}
                      className="form-select"
                      disabled={loadingOptions}
                    >
                      <option value="">Rota seçiniz (Opsiyonel)</option>
                      {routes.map(route => (
                        <option key={route.id} value={route.id}>
                          {route.routeName} ({route.routeCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Şoför</label>
                  <div className="input-with-icon">
                    <Users size={16} />
                    <select
                      value={formData.driverId || ''}
                      onChange={(e) => handleInputChange('driverId', e.target.value ? parseInt(e.target.value) : null)}
                      className="form-select"
                      disabled={loadingOptions}
                    >
                      <option value="">Şoför seçiniz (Opsiyonel)</option>
                      {drivers.map(driver => (
                        <option key={driver.id} value={driver.id}>
                          {driver.firstName} {driver.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-section">
              <div className="section-header">
                <FileText size={20} />
                <h3>Ek Bilgiler</h3>
              </div>
              
              <div className="form-group">
                <label>Notlar</label>
                <div className="input-with-icon">
                  <FileText size={16} />
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Otobüs hakkında ek notlar..."
                    className="form-textarea"
                    rows={4}
                  />
                </div>
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
              onClick={() => navigate('/bus')}
              className="btn btn-secondary"
            >
              İptal
            </button>
            
            <button
              type="submit"
              disabled={loading || loadingOptions}
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
                  Otobüsü Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusAdd;

