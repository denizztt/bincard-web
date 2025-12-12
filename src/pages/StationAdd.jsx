import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  MapPin,
  Building,
  Navigation,
  AlertCircle
} from 'lucide-react';
import { config } from '../config/config';
import { stationApi } from '../services/apiService';

const StationAdd = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    latitude: config.googleMaps.defaultCenter.lat,
    longitude: config.googleMaps.defaultCenter.lng,
    type: '',
    city: '',
    district: '',
    street: '',
    postalCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Station type options - Backend StationType enum'ına uygun
  const stationTypeOptions = [
    { value: 'METRO', label: 'Metro Durağı', icon: '🚇' },
    { value: 'TRAMVAY', label: 'Tramvay Durağı', icon: '🚋' },
    { value: 'OTOBUS', label: 'Otobüs Durağı', icon: '🚌' },
    { value: 'METROBUS', label: 'Metrobüs Durağı', icon: '🚍' },
    { value: 'TREN', label: 'Tren İstasyonu', icon: '🚂' },
    { value: 'VAPUR', label: 'Vapur İskelesi', icon: '⛴️' },
    { value: 'TELEFERIK', label: 'Teleferik İstasyonu', icon: '🚠' },
    { value: 'DOLMUS', label: 'Dolmuş Durağı', icon: '🚐' },
    { value: 'MINIBUS', label: 'Minibüs Durağı', icon: '🚌' },
    { value: 'HAVARAY', label: 'Havaray İstasyonu', icon: '🚈' },
    { value: 'FERIBOT', label: 'Feribot Terminali', icon: '⛵' },
    { value: 'HIZLI_TREN', label: 'Yüksek Hızlı Tren', icon: '🚄' },
    { value: 'BISIKLET', label: 'Bisiklet Paylaşım', icon: '🚴' },
    { value: 'SCOOTER', label: 'E-Scooter Noktası', icon: '🛴' },
    { value: 'PARK_YERI', label: 'P+R Noktası', icon: '🅿️' },
    { value: 'AKILLI_DURAK', label: 'Akıllı Durak', icon: '📱' },
    { value: 'TERMINAL', label: 'Otobüs Terminali', icon: '🏢' },
    { value: 'ULAŞIM_AKTARMA', label: 'Aktarma Merkezi', icon: '🔄' },
    { value: 'DIGER', label: 'Diğer', icon: '📍' }
  ];

  // Load Google Maps via JS API Loader on component mount
  useEffect(() => {
    // If already loaded, initialize map without loading again
    if (window.google && window.google.maps && window.google.maps.MapTypeId) {
      setTimeout(() => {
        initializeMap();
      }, 100);
      return;
    }
    
    const loader = new Loader({
      apiKey: config.googleMaps.apiKey,
      version: 'weekly',
      libraries: config.googleMaps.libraries || ['geometry', 'places']
    });
    
    loader.load()
      .then(() => {
        // Google Maps tam yüklendiğinden emin olmak için kısa bir bekleme
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.MapTypeId) {
            initializeMap();
            setMapLoaded(true);
          } else {
            throw new Error('Google Maps API tam yüklenemedi');
          }
        }, 100);
      })
      .catch(err => {
        console.error('Google Maps loader error:', err);
        setError('Google Maps yüklenemedi. Lütfen API anahtarınızın geçerli olduğundan ve billing\'in aktif olduğundan emin olun.');
        setMapLoaded(false);
      });
  }, []);

  // ...existing code for initializeMap, placeMarker, getAddressFromCoordinates...

  const initializeMap = () => {
    if (!mapRef.current) {
      console.warn('Map ref not available');
      return;
    }

    // Google Maps API'nin tam yüklendiğinden emin ol
    if (!window.google || !window.google.maps || !window.google.maps.MapTypeId) {
      console.error('Google Maps API not fully loaded');
      setError('Google Maps API tam yüklenemedi. Lütfen sayfayı yenileyin.');
      return;
    }

    try {
      const center = config.googleMaps.defaultCenter;
      
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: center,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP || 'roadmap',
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Add click event listener
      map.addListener("click", (event) => {
        placeMarker(event.latLng);
        getAddressFromCoordinates(event.latLng.lat(), event.latLng.lng());
      });

      // Place initial marker at default center
      placeMarker(new window.google.maps.LatLng(center.lat, center.lng));
      getAddressFromCoordinates(center.lat, center.lng);
      
      setMapLoaded(true);
      
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Harita başlatılırken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
      setMapLoaded(false);
    }
  };

  const placeMarker = (location) => {
    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Create new marker
    const marker = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      title: 'Durak Konumu',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#dc3545">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32)
      }
    });

    markerRef.current = marker;

    // Update form data with coordinates
    setFormData(prev => ({
      ...prev,
      latitude: location.lat(),
      longitude: location.lng()
    }));
  };

  // Get address components using Google Geocoder callback
  const getAddressFromCoordinates = (lat, lng) => {
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      console.warn('Geocoder not available');
      return;
    }
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const addressComponents = results[0].address_components;
          let city = '', district = '', street = '', postalCode = '';
          addressComponents.forEach(component => {
            if (component.types.includes('administrative_area_level_1')) {
              city = component.long_name;
            } else if (component.types.includes('administrative_area_level_2')) {
              district = component.long_name;
            } else if (component.types.includes('route')) {
              street = component.long_name;
            } else if (component.types.includes('postal_code')) {
              postalCode = component.long_name;
            }
          });
          setFormData(prev => ({
            ...prev,
            city: city || 'İstanbul',
            district: district || '',
            street: street || '',
            postalCode: postalCode || ''
          }));
        } else {
          console.warn('Geocoding failed:', status);
          // Geocoding başarısız olsa bile form doldurulabilir
          if (status === 'REQUEST_DENIED' || status === 'OVER_QUERY_LIMIT') {
            console.warn('Geocoding API hatası. Lütfen Google Cloud Console\'da Geocoding API\'nin aktif olduğundan ve billing\'in açık olduğundan emin olun.');
          }
        }
      });
    } catch (err) {
      console.error('Geocoding error:', err);
      // Hata olsa bile devam et, kullanıcı manuel girebilir
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Durak adı gereklidir';
    }
    
    if (!formData.type) {
      errors.type = 'Durak türü seçilmelidir';
    }
    
    if (!formData.city.trim()) {
      errors.city = 'Şehir gereklidir';
    }
    
    if (!formData.district.trim()) {
      errors.district = 'İlçe gereklidir';
    }
    
    if (!formData.street.trim()) {
      errors.street = 'Sokak/cadde gereklidir';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Lütfen tüm gerekli alanları doldurun');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const submitData = {
        name: formData.name,
        latitude: formData.latitude,
        longitude: formData.longitude,
        type: formData.type,
        city: formData.city,
        district: formData.district,
        street: formData.street,
        postalCode: formData.postalCode || undefined
      };
      
      console.log('Durak verileri:', submitData);
      
      const response = await stationApi.createStation(submitData);
      
      if (response.isSuccess || response.success) {
        alert('Durak başarıyla eklendi!');
        navigate('/station');
      } else {
        throw new Error(response.message || 'Durak eklenemedi');
      }
    } catch (error) {
      console.error('Durak ekleme hatası:', error);
      setError('Durak eklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const getStationTypeLabel = (type) => {
    const option = stationTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  const getStationTypeIcon = (type) => {
    const option = stationTypeOptions.find(opt => opt.value === type);
    return option ? option.icon : '📍';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', background: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => navigate('/station')}
            style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={20} style={{ display: 'block', width: '20px', height: '20px', flexShrink: 0 }} />
            Geri Dön
          </button>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#2c3e50' }}>🚇 Yeni Durak Ekle</h1>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>
          <strong>Hata:</strong> {error}
        </div>
      )}

      {/* Form */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', color: 'white', padding: '30px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '700' }}>Durak Bilgileri</h2>
          <p style={{ margin: 0, fontSize: '16px', opacity: '0.9' }}>Yeni durak eklemek için gerekli bilgileri doldurun.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
          <div style={{ display: 'grid', gap: '25px' }}>
            {/* Durak Adı */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#34495e', marginBottom: '12px' }}>
                <Building size={16} />
                Durak Adı *:
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Örn: Taksim Meydanı veya Kadıköy İskele"
                required
                style={{ 
                  width: '100%', 
                  padding: '15px', 
                  border: validationErrors.name ? '2px solid #e74c3c' : '2px solid #bdc3c7', 
                  borderRadius: '8px', 
                  fontSize: '16px', 
                  transition: 'border-color 0.3s ease' 
                }}
              />
              <small style={{ display: 'block', fontSize: '12px', color: '#6c757d', marginTop: '4px', fontStyle: 'italic' }}>
                Durak adını girin. Örnek: Taksim Meydanı, Kadıköy İskele, Beşiktaş Terminali
              </small>
              {validationErrors.name && (
                <span style={{ color: '#e74c3c', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <AlertCircle size={12} />
                  {validationErrors.name}
                </span>
              )}
            </div>

            {/* Durak Türü */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#34495e', marginBottom: '12px' }}>
                <Navigation size={16} />
                Durak Türü *:
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '15px', 
                  border: validationErrors.type ? '2px solid #e74c3c' : '2px solid #bdc3c7', 
                  borderRadius: '8px', 
                  fontSize: '16px', 
                  background: 'white' 
                }}
              >
                <option value="">Durak türü seçin</option>
                {stationTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.type && (
                <span style={{ color: '#e74c3c', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <AlertCircle size={12} />
                  {validationErrors.type}
                </span>
              )}
            </div>

            {/* Harita ve Konum Seçimi */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#34495e', marginBottom: '12px' }}>
                <MapPin size={16} />
                Konum Seçimi:
              </label>
              <div style={{ border: '2px solid #bdc3c7', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                <div 
                  ref={mapRef}
                  style={{ 
                    width: '100%', 
                    height: '300px',
                    background: '#f5f5f5'
                  }}
                />
                {!mapLoaded && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #dc3545', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }}></div>
                      <p style={{ color: '#6c757d', margin: '0' }}>Harita yükleniyor...</p>
                      {error && error.includes('Google Maps') && (
                        <p style={{ color: '#e74c3c', fontSize: '12px', marginTop: '10px', maxWidth: '300px' }}>
                          Google Maps API hatası. Lütfen API anahtarınızın geçerli olduğundan ve billing'in aktif olduğundan emin olun.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '14px', color: '#6c757d', marginTop: '8px' }}>
                📍 Durak konumunu seçmek için harita üzerine tıklayın
              </p>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px', fontFamily: 'monospace' }}>
                Koordinatlar: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </div>
            </div>

            {/* Adres Bilgileri */}
            <div style={{ border: '1px solid #e1e8ed', borderRadius: '8px', padding: '20px', background: 'white' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600', color: '#34495e' }}>Adres Bilgileri</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
                    Şehir *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Örn: İstanbul veya Ankara"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: validationErrors.city ? '2px solid #e74c3c' : '2px solid #bdc3c7', 
                      borderRadius: '6px', 
                      fontSize: '14px' 
                    }}
                  />
                  <small style={{ display: 'block', fontSize: '11px', color: '#6c757d', marginTop: '4px', fontStyle: 'italic' }}>
                    Şehir adını girin. Örnek: İstanbul, Ankara, İzmir
                  </small>
                  {validationErrors.city && (
                    <span style={{ color: '#e74c3c', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <AlertCircle size={12} />
                      {validationErrors.city}
                    </span>
                  )}
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
                    İlçe *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="Örn: Beyoğlu veya Kadıköy"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: validationErrors.district ? '2px solid #e74c3c' : '2px solid #bdc3c7', 
                      borderRadius: '6px', 
                      fontSize: '14px' 
                    }}
                  />
                  <small style={{ display: 'block', fontSize: '11px', color: '#6c757d', marginTop: '4px', fontStyle: 'italic' }}>
                    İlçe adını girin. Örnek: Beyoğlu, Kadıköy, Beşiktaş
                  </small>
                  {validationErrors.district && (
                    <span style={{ color: '#e74c3c', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <AlertCircle size={12} />
                      {validationErrors.district}
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
                    Sokak/Cadde *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Örn: İstiklal Caddesi veya Bağdat Caddesi"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: validationErrors.street ? '2px solid #e74c3c' : '2px solid #bdc3c7', 
                      borderRadius: '6px', 
                      fontSize: '14px' 
                    }}
                  />
                  <small style={{ display: 'block', fontSize: '11px', color: '#6c757d', marginTop: '4px', fontStyle: 'italic' }}>
                    Sokak veya cadde adını girin. Örnek: İstiklal Caddesi, Bağdat Caddesi, Atatürk Bulvarı
                  </small>
                  {validationErrors.street && (
                    <span style={{ color: '#e74c3c', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <AlertCircle size={12} />
                      {validationErrors.street}
                    </span>
                  )}
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
                    Posta Kodu
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="Örn: 34000 veya 34700"
                    style={{ width: '100%', padding: '12px', border: '2px solid #bdc3c7', borderRadius: '6px', fontSize: '14px' }}
                  />
                  <small style={{ display: 'block', fontSize: '11px', color: '#6c757d', marginTop: '4px', fontStyle: 'italic' }}>
                    5 haneli posta kodu (opsiyonel). Örnek: 34000, 34700, 06100
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ 
                background: loading ? '#95a5a6' : '#dc3545', 
                color: 'white', 
                border: 'none', 
                padding: '15px 40px', 
                fontSize: '16px', 
                fontWeight: '600',
                borderRadius: '50px', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                margin: '0 auto',
                minWidth: '200px',
                justifyContent: 'center'
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Durağı Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
          }
        `}
      </style>
    </div>
  );
};

export default StationAdd;