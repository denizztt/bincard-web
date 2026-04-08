import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save,
  MapPin,
  Smartphone,
  RefreshCw,
  Navigation
} from 'lucide-react';
import { adminApi } from '../services/apiService';
import '../styles/AdminSettings.css';

const AdminSettings = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('device'); // 'device', 'location'
  
  const [locationData, setLocationData] = useState({
    latitude: null,
    longitude: null,
    recordedAt: null
  });

  const [deviceForm, setDeviceForm] = useState({
    fcmToken: '',
    ipAddress: '',
    lastKnownLatitude: null,
    lastKnownLongitude: null,
    lastLoginDevice: '',
    lastLoginPlatform: '',
    lastLoginAppVersion: '',
    profilePicture: ''
  });

  const [locationForm, setLocationForm] = useState({
    latitude: '',
    longitude: '',
    speed: '',
    accuracy: ''
  });

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      setLoading(true);
      setError('');
      // Backend direkt LocationDTO döner, DataResponseMessage wrapper'ı yok
      const locationData = await adminApi.getLocation();
      
      if (locationData && (locationData.latitude !== undefined || locationData.longitude !== undefined)) {
        setLocationData({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          recordedAt: locationData.recordedAt
        });
        
        setLocationForm({
          latitude: locationData.latitude?.toString() || '',
          longitude: locationData.longitude?.toString() || '',
          speed: '',
          accuracy: ''
        });
      }
    } catch (err) {
      // Location might not exist, that's okay
      console.log('Konum bilgisi yok:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationForm({
            ...locationForm,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            accuracy: position.coords.accuracy?.toString() || ''
          });
          setLoading(false);
        },
        (error) => {
          console.error('Konum alınamadı:', error);
          setError('Konum bilgisi alınamadı. Lütfen manuel olarak girin.');
          setLoading(false);
        }
      );
    } else {
      setError('Tarayıcınız konum servisini desteklemiyor');
    }
  };

  const handleDeviceChange = (e) => {
    const { name, value } = e.target;
    setDeviceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateDevice = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const deviceData = {
        ...deviceForm,
        lastKnownLatitude: deviceForm.lastKnownLatitude ? parseFloat(deviceForm.lastKnownLatitude) : undefined,
        lastKnownLongitude: deviceForm.lastKnownLongitude ? parseFloat(deviceForm.lastKnownLongitude) : undefined
      };
      
      // Remove empty fields
      Object.keys(deviceData).forEach(key => {
        if (deviceData[key] === '' || deviceData[key] === null || deviceData[key] === undefined) {
          delete deviceData[key];
        }
      });
      
      const response = await adminApi.updateDeviceInfo(deviceData);
      
      // Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
      const isSuccess = response?.success !== undefined ? response.success : (response?.isSuccess !== undefined ? response.isSuccess : false);
      if (response && isSuccess) {
        setSuccess('Cihaz bilgileri başarıyla güncellendi');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response?.message || 'Cihaz bilgisi güncelleme başarısız');
      }
    } catch (err) {
      console.error('Cihaz güncelleme hatası:', err);
      setError(err.response?.data?.message || err.message || 'Cihaz bilgisi güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    
    if (!locationForm.latitude || !locationForm.longitude) {
      setError('Lütfen enlem ve boylam bilgilerini girin');
      return;
    }

    const lat = parseFloat(locationForm.latitude);
    const lng = parseFloat(locationForm.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Geçerli sayısal değerler girin');
      return;
    }

    if (lat < -90 || lat > 90) {
      setError('Enlem -90 ile 90 arasında olmalıdır');
      return;
    }

    if (lng < -180 || lng > 180) {
      setError('Boylam -180 ile 180 arasında olmalıdır');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const locationData = {
        latitude: lat,
        longitude: lng,
        speed: locationForm.speed ? parseFloat(locationForm.speed) : undefined,
        accuracy: locationForm.accuracy ? parseFloat(locationForm.accuracy) : undefined
      };
      
      const response = await adminApi.updateLocation(locationData);
      
      // Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
      const isSuccess = response?.success !== undefined ? response.success : (response?.isSuccess !== undefined ? response.isSuccess : false);
      if (response && isSuccess) {
        setSuccess('Konum bilgisi başarıyla güncellendi');
        await loadLocation();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response?.message || 'Konum güncelleme başarısız');
      }
    } catch (err) {
      console.error('Konum güncelleme hatası:', err);
      setError(err.response?.data?.message || err.message || 'Konum güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !locationData.latitude) {
    return (
      <div className="admin-settings-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Ayarlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings-container">
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
            <h1 className="page-title">⚙️ Ayarlar</h1>
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
      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'device' ? 'active' : ''}`}
          onClick={() => setActiveTab('device')}
        >
          <Smartphone size={16} />
          Cihaz Bilgileri
        </button>
        <button
          className={`tab-button ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab('location')}
        >
          <MapPin size={16} />
          Konum Yönetimi
        </button>
      </div>

      {/* Device Tab */}
      {activeTab === 'device' && (
        <div className="settings-content">
          <div className="device-form-section">
            <h3 className="section-title">
              <Smartphone size={16} />
              Cihaz Bilgileri Güncelle
            </h3>
            <form onSubmit={handleUpdateDevice}>
              <div className="form-group">
                <label>
                  <Smartphone size={16} />
                  FCM Token
                </label>
                <input
                  type="text"
                  name="fcmToken"
                  value={deviceForm.fcmToken}
                  onChange={handleDeviceChange}
                  placeholder="FCM token girin"
                />
              </div>

              <div className="form-group">
                <label>
                  <Smartphone size={16} />
                  IP Adresi
                </label>
                <input
                  type="text"
                  name="ipAddress"
                  value={deviceForm.ipAddress}
                  onChange={handleDeviceChange}
                  placeholder="IP adresi girin"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <MapPin size={16} />
                    Enlem
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="lastKnownLatitude"
                    value={deviceForm.lastKnownLatitude || ''}
                    onChange={handleDeviceChange}
                    placeholder="Enlem"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <MapPin size={16} />
                    Boylam
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="lastKnownLongitude"
                    value={deviceForm.lastKnownLongitude || ''}
                    onChange={handleDeviceChange}
                    placeholder="Boylam"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Smartphone size={16} />
                  Cihaz
                </label>
                <input
                  type="text"
                  name="lastLoginDevice"
                  value={deviceForm.lastLoginDevice}
                  onChange={handleDeviceChange}
                  placeholder="Örn: Xiaomi Redmi Note 11"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Smartphone size={16} />
                    Platform
                  </label>
                  <input
                    type="text"
                    name="lastLoginPlatform"
                    value={deviceForm.lastLoginPlatform}
                    onChange={handleDeviceChange}
                    placeholder="Örn: Android 14"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Smartphone size={16} />
                    Uygulama Versiyonu
                  </label>
                  <input
                    type="text"
                    name="lastLoginAppVersion"
                    value={deviceForm.lastLoginAppVersion}
                    onChange={handleDeviceChange}
                    placeholder="Örn: 1.2.4"
                  />
                </div>
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

      {/* Location Tab */}
      {activeTab === 'location' && (
        <div className="settings-content">
          {/* Current Location Display */}
          {locationData.latitude && (
            <div className="location-info-section">
              <h3 className="section-title">Mevcut Konum</h3>
              <div className="location-info">
                <div className="location-item">
                  <label>Enlem:</label>
                  <span>{locationData.latitude}</span>
                </div>
                <div className="location-item">
                  <label>Boylam:</label>
                  <span>{locationData.longitude}</span>
                </div>
                {locationData.recordedAt && (
                  <div className="location-item">
                    <label>Kayıt Zamanı:</label>
                    <span>{new Date(locationData.recordedAt).toLocaleString('tr-TR')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location Update Form */}
          <div className="location-form-section">
            <h3 className="section-title">
              <MapPin size={16} />
              Konum Güncelle
            </h3>
            <form onSubmit={handleUpdateLocation}>
              <div className="form-actions-inline">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  <Navigation size={16} />
                  Otomatik Konum Al
                </button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <MapPin size={16} />
                    Enlem *
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={locationForm.latitude}
                    onChange={handleLocationChange}
                    placeholder="Enlem (-90 ile 90 arası)"
                    required
                    min="-90"
                    max="90"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <MapPin size={16} />
                    Boylam *
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={locationForm.longitude}
                    onChange={handleLocationChange}
                    placeholder="Boylam (-180 ile 180 arası)"
                    required
                    min="-180"
                    max="180"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Navigation size={16} />
                    Hız (m/s)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="speed"
                    value={locationForm.speed}
                    onChange={handleLocationChange}
                    placeholder="Hız (opsiyonel)"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Navigation size={16} />
                    Doğruluk (metre)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="accuracy"
                    value={locationForm.accuracy}
                    onChange={handleLocationChange}
                    placeholder="Doğruluk (opsiyonel)"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <Save size={16} />
                  {loading ? 'Güncelleniyor...' : 'Konumu Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;

