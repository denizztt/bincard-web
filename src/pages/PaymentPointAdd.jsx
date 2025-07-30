import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  MapPin,
  Building,
  Phone,
  Mail,
  Clock,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { config } from '../config/config';
import { paymentPointApi } from '../services/apiService';

const PaymentPointAdd = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    location: {
      latitude: config.googleMaps.defaultCenter.lat,
      longitude: config.googleMaps.defaultCenter.lng
    },
    address: {
      city: '',
      district: '',
      street: '',
      postalCode: '',
      fullAddress: ''
    },
    contactNumber: '',
    workingHours: '',
    paymentMethods: [],
    description: '',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Payment method options
  const paymentMethodOptions = [
    { value: 'CREDIT_CARD', label: 'Kredi Kartı' },
    { value: 'DEBIT_CARD', label: 'Banka Kartı' },
    { value: 'CASH', label: 'Nakit' },
    { value: 'QR_CODE', label: 'QR Kod' },
    { value: 'NFC', label: 'NFC/Temassız' },
    { value: 'BANK_TRANSFER', label: 'Banka Transferi' }
  ];

  // Load Google Maps on component mount
  useEffect(() => {
    loadGoogleMaps();
  }, []);

  const loadGoogleMaps = () => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMaps.apiKey}&libraries=${config.googleMaps.libraries.join(',')}&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Set up global callback
    window.initMap = () => {
      initializeMap();
    };
    
    script.onerror = () => {
      setError('Google Maps yüklenemedi. İnternet bağlantınızı kontrol edin.');
    };
    
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    try {
      const center = config.googleMaps.defaultCenter;
      
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: center,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
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
      setError('Harita başlatılırken hata oluştu: ' + err.message);
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
      title: 'Ödeme Noktası Konumu',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#007bff">
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
      location: {
        latitude: location.lat(),
        longitude: location.lng()
      }
    }));
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({
        location: { lat: lat, lng: lng }
      });

      if (result.results && result.results.length > 0) {
        const addressComponents = result.results[0].address_components;
        const formattedAddress = result.results[0].formatted_address;
        
        // Parse address components
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
          address: {
            city: city || 'İstanbul',
            district: district || '',
            street: street || '',
            postalCode: postalCode || '',
            fullAddress: formattedAddress
          }
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handlePaymentMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Ödeme noktası adı gereklidir';
    }
    
    if (!formData.address.city.trim()) {
      errors['address.city'] = 'Şehir gereklidir';
    }
    
    if (!formData.address.district.trim()) {
      errors['address.district'] = 'İlçe gereklidir';
    }
    
    if (!formData.address.fullAddress.trim()) {
      errors['address.fullAddress'] = 'Tam adres gereklidir';
    }
    
    if (formData.paymentMethods.length === 0) {
      errors.paymentMethods = 'En az bir ödeme yöntemi seçilmelidir';
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
        location: formData.location,
        address: formData.address,
        contactNumber: formData.contactNumber || undefined,
        workingHours: formData.workingHours || undefined,
        paymentMethods: formData.paymentMethods,
        description: formData.description || undefined,
        active: formData.active
      };
      
      console.log('Ödeme noktası verileri:', submitData);
      
      const response = await paymentPointApi.createPaymentPoint(submitData);
      
      if (response.isSuccess || response.success) {
        alert('Ödeme noktası başarıyla eklendi!');
        navigate('/payment-point');
      } else {
        throw new Error(response.message || 'Ödeme noktası eklenemedi');
      }
    } catch (error) {
      console.error('Ödeme noktası ekleme hatası:', error);
      setError('Ödeme noktası eklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => navigate('/payment-point')}
            style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={20} />
            Geri Dön
          </button>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#2c3e50' }}>➕ Yeni Ödeme Noktası Ekle</h1>
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
        <div style={{ background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)', color: 'white', padding: '30px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '700' }}>Ödeme Noktası Bilgileri</h2>
          <p style={{ margin: 0, fontSize: '16px', opacity: '0.9' }}>Yeni ödeme noktası eklemek için gerekli bilgileri doldurun.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
          <div style={{ display: 'grid', gap: '25px' }}>
            {/* Nokta Adı */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#34495e', marginBottom: '12px' }}>
                <Building size={16} />
                Nokta Adı:
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="örn: Merkez Ödeme Noktası"
                required
                style={{ width: '100%', padding: '15px', border: '2px solid #bdc3c7', borderRadius: '8px', fontSize: '16px', transition: 'border-color 0.3s ease' }}
              />
            </div>

            {/* Harita ve Konum Seçimi */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#34495e', marginBottom: '12px' }}>
                <MapPin size={16} />
                Konum Seçimi:
              </label>
              <div style={{ border: '2px solid #bdc3c7', borderRadius: '8px', overflow: 'hidden' }}>
                <div 
                  ref={mapRef}
                  style={{ 
                    width: '100%', 
                    height: '300px',
                    background: '#f8f9fa'
                  }}
                />
                {!mapLoaded && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }}></div>
                      <p style={{ color: '#6c757d' }}>Harita yükleniyor...</p>
                    </div>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '14px', color: '#6c757d', marginTop: '8px' }}>
                📍 Ödeme noktasının konumunu seçmek için harita üzerine tıklayın
              </p>
            </div>

            {/* Adres Bilgileri */}
            <div style={{ border: '1px solid #e1e8ed', borderRadius: '8px', padding: '20px', background: '#f8f9fa' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600', color: '#34495e' }}>Adres Bilgileri</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
                    Şehir *
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="İstanbul"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: validationErrors['address.city'] ? '2px solid #e74c3c' : '2px solid #bdc3c7', 
                      borderRadius: '6px', 
                      fontSize: '14px' 
                    }}
                  />
                  {validationErrors['address.city'] && (
                    <span style={{ color: '#e74c3c', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <AlertCircle size={12} />
                      {validationErrors['address.city']}
                    </span>
                  )}
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
                    İlçe *
                  </label>
                  <input
                    type="text"
                    name="address.district"
                    value={formData.address.district}
                    onChange={handleInputChange}
                    placeholder="Kadıköy"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: validationErrors['address.district'] ? '2px solid #e74c3c' : '2px solid #bdc3c7', 
                      borderRadius: '6px', 
                      fontSize: '14px' 
                    }}
                  />
                  {validationErrors['address.district'] && (
                    <span style={{ color: '#e74c3c', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <AlertCircle size={12} />
                      {validationErrors['address.district']}
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
                    Sokak/Cadde
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    placeholder="Atatürk Caddesi"
                    style={{ width: '100%', padding: '12px', border: '2px solid #bdc3c7', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
                    Posta Kodu
                  </label>
                  <input
                    type="text"
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleInputChange}
                    placeholder="34000"
                    style={{ width: '100%', padding: '12px', border: '2px solid #bdc3c7', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
                  Tam Adres *
                </label>
                <textarea
                  name="address.fullAddress"
                  value={formData.address.fullAddress}
                  onChange={handleInputChange}
                  placeholder="Tam adres bilgisi (haritadan otomatik doldurulur)..."
                  required
                  rows={3}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: validationErrors['address.fullAddress'] ? '2px solid #e74c3c' : '2px solid #bdc3c7', 
                    borderRadius: '6px', 
                    fontSize: '14px', 
                    resize: 'vertical' 
                  }}
                />
                {validationErrors['address.fullAddress'] && (
                  <span style={{ color: '#e74c3c', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <AlertCircle size={12} />
                    {validationErrors['address.fullAddress']}
                  </span>
                )}
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#34495e', marginBottom: '12px' }}>
                  <Phone size={16} />
                  İletişim Numarası:
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="örn: 0212 555 12 34"
                  style={{ width: '100%', padding: '15px', border: '2px solid #bdc3c7', borderRadius: '8px', fontSize: '16px' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#34495e', marginBottom: '12px' }}>
                  <Clock size={16} />
                  Çalışma Saatleri:
                </label>
                <input
                  type="text"
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleInputChange}
                  placeholder="örn: 09:00 - 18:00"
                  style={{ width: '100%', padding: '15px', border: '2px solid #bdc3c7', borderRadius: '8px', fontSize: '16px' }}
                />
              </div>
            </div>

            {/* Ödeme Yöntemleri */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#34495e', marginBottom: '12px' }}>
                <CreditCard size={16} />
                Ödeme Yöntemleri * 
              </label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '10px',
                border: validationErrors.paymentMethods ? '2px solid #e74c3c' : '2px solid #bdc3c7',
                borderRadius: '8px',
                padding: '15px'
              }}>
                {paymentMethodOptions.map(option => (
                  <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', borderRadius: '6px', background: formData.paymentMethods.includes(option.value) ? '#e3f2fd' : 'transparent' }}>
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods.includes(option.value)}
                      onChange={() => handlePaymentMethodChange(option.value)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{option.label}</span>
                  </label>
                ))}
              </div>
              {validationErrors.paymentMethods && (
                <span style={{ color: '#e74c3c', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                  <AlertCircle size={12} />
                  {validationErrors.paymentMethods}
                </span>
              )}
            </div>

            {/* Açıklama */}
            <div>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#34495e', marginBottom: '12px' }}>
                Açıklama:
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Ek bilgiler, özel notlar..."
                rows={3}
                style={{ width: '100%', padding: '15px', border: '2px solid #bdc3c7', borderRadius: '8px', fontSize: '16px', resize: 'vertical' }}
              />
            </div>

            {/* Aktif Durumu */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#34495e', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px' }}
                />
                Ödeme noktası aktif
              </label>
              <p style={{ fontSize: '14px', color: '#6c757d', margin: '8px 0 0 0' }}>
                Bu seçenek işaretliyse ödeme noktası kullanıcılara görünür olacaktır.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ 
                background: loading ? '#95a5a6' : '#28a745', 
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
                  Ödeme Noktasını Kaydet
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
            border-color: #3498db !important;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
          }
        `}
      </style>
    </div>
  );
};

export default PaymentPointAdd; 