import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  MapPin,
  Building,
  Phone,
  Mail,
  Clock,
  CreditCard,
  AlertCircle,
  Loader,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { paymentPointApi } from '../services/apiService';
import { config } from '../config/config';

const PaymentPointEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const fileInputRef = useRef(null);
  
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
    active: true,
    photos: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Payment method options
  const paymentMethodOptions = [
    { value: 'CREDIT_CARD', label: 'Kredi Kartı' },
    { value: 'DEBIT_CARD', label: 'Banka Kartı' },
    { value: 'CASH', label: 'Nakit' },
    { value: 'QR_CODE', label: 'QR Kod' },
    { value: 'NFC', label: 'NFC/Temassız' },
    { value: 'BANK_TRANSFER', label: 'Banka Transferi' }
  ];

  useEffect(() => {
    loadGoogleMaps();
    loadPaymentPointData();
  }, [id]);

  const loadGoogleMaps = () => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setTimeout(() => initializeMap(), 100);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMaps.apiKey}&libraries=${config.googleMaps.libraries.join(',')}&callback=initMapEdit`;
    script.async = true;
    script.defer = true;
    
    // Set up global callback
    window.initMapEdit = () => {
      initializeMap();
    };
    
    script.onerror = () => {
      setError('Google Maps yüklenemedi. İnternet bağlantınızı kontrol edin.');
    };
    
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !formData.location) return;

    try {
      const center = {
        lat: formData.location.latitude,
        lng: formData.location.longitude
      };
      
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
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

      // Place marker at current location
      placeMarker(new window.google.maps.LatLng(center.lat, center.lng));
      
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
            ...prev.address,
            city: city || prev.address.city,
            district: district || prev.address.district,
            street: street || prev.address.street,
            postalCode: postalCode || prev.address.postalCode,
            fullAddress: formattedAddress
          }
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const loadPaymentPointData = async () => {
    try {
      setLoading(true);
      const response = await paymentPointApi.getPaymentPointById(parseInt(id));
      
      if (response.isSuccess || response.success) {
        const data = response.data;
        setFormData({
          name: data.name || '',
          location: data.location || {
            latitude: config.googleMaps.defaultCenter.lat,
            longitude: config.googleMaps.defaultCenter.lng
          },
          address: data.address || {
            city: '',
            district: '',
            street: '',
            postalCode: '',
            fullAddress: ''
          },
          contactNumber: data.contactNumber || '',
          workingHours: data.workingHours || '',
          paymentMethods: data.paymentMethods || [],
          description: data.description || '',
          active: data.active !== undefined ? data.active : true,
          photos: data.photos || []
        });
      } else {
        throw new Error(response.message || 'Ödeme noktası bulunamadı');
      }
    } catch (error) {
      console.error('Ödeme noktası yükleme hatası:', error);
      setError('Ödeme noktası yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      setUploadingPhotos(true);
      const response = await paymentPointApi.addPaymentPointPhotos(parseInt(id), selectedFiles);
      
      if (response.isSuccess || response.success) {
        // Refresh data to get new photos
        await loadPaymentPointData();
        setSelectedFiles([]);
        alert('Fotoğraflar başarıyla yüklendi!');
      } else {
        throw new Error(response.message || 'Fotoğraf yüklenemedi');
      }
    } catch (error) {
      console.error('Fotoğraf yükleme hatası:', error);
      alert('Fotoğraf yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setUploadingPhotos(false);
    }
  };

  const deletePhoto = async (photoId) => {
    if (!confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await paymentPointApi.deletePaymentPointPhoto(parseInt(id), photoId);
      
      if (response.isSuccess || response.success) {
        // Remove photo from state
        setFormData(prev => ({
          ...prev,
          photos: prev.photos.filter(photo => photo.id !== photoId)
        }));
        alert('Fotoğraf başarıyla silindi!');
      } else {
        throw new Error(response.message || 'Fotoğraf silinemedi');
      }
    } catch (error) {
      console.error('Fotoğraf silme hatası:', error);
      alert('Fotoğraf silinirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Lütfen tüm gerekli alanları doldurun');
      return;
    }
    
    setSaving(true);
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
      
      console.log('Ödeme noktası güncelleme verileri:', submitData);
      
      const response = await paymentPointApi.updatePaymentPoint(parseInt(id), submitData);
      
      if (response.isSuccess || response.success) {
        alert('Ödeme noktası başarıyla güncellendi!');
        navigate('/payment-point');
      } else {
        throw new Error(response.message || 'Ödeme noktası güncellenemedi');
      }
    } catch (error) {
      console.error('Ödeme noktası güncelleme hatası:', error);
      setError('Ödeme noktası güncellenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <Loader size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '15px' }} />
          <p>Ödeme noktası bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#f8f9fa', minHeight: '100vh' }}>
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
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#2c3e50' }}>✏️ Ödeme Noktası Düzenle #{id}</h1>
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
        <div style={{ background: 'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)', color: 'white', padding: '30px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '700' }}>Ödeme Noktası Bilgilerini Düzenle</h2>
          <p style={{ margin: 0, fontSize: '16px', opacity: '0.9' }}>Mevcut bilgileri güncelleyerek kaydedin.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
          <div style={{ display: 'grid', gap: '25px' }}>
            {/* Nokta Adı */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#34495e', marginBottom: '12px' }}>
                <Building size={16} />
                Nokta Adı *:
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="örn: Merkez Ödeme Noktası"
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
              {validationErrors.name && (
                <span style={{ color: '#e74c3c', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <AlertCircle size={12} />
                  {validationErrors.name}
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
                      <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #ffc107', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }}></div>
                      <p style={{ color: '#6c757d' }}>Harita yükleniyor...</p>
                    </div>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '14px', color: '#6c757d', marginTop: '8px' }}>
                📍 Ödeme noktasının konumunu değiştirmek için harita üzerine tıklayın
              </p>
            </div>

            {/* Adres Bilgileri - PaymentPointAdd'deki aynı yapı */}
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
                  placeholder="Tam adres bilgisi..."
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

            {/* Fotoğraf Yönetimi */}
            <div style={{ border: '1px solid #e1e8ed', borderRadius: '8px', padding: '20px', background: '#f8f9fa' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600', color: '#34495e' }}>Fotoğraf Yönetimi</h3>
              
              {/* Mevcut Fotoğraflar */}
              {formData.photos && formData.photos.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600', color: '#34495e' }}>Mevcut Fotoğraflar</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                    {formData.photos.map((photo, index) => (
                      <div key={photo.id || index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                        <img 
                          src={photo.url || photo.path} 
                          alt={`Fotoğraf ${index + 1}`}
                          style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          onClick={() => deletePhoto(photo.id)}
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            background: 'rgba(231, 76, 60, 0.8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Yeni Fotoğraf Ekleme */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600', color: '#34495e' }}>Yeni Fotoğraf Ekle</h4>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: '#e3f2fd',
                    color: '#1976d2',
                    border: '2px dashed #1976d2',
                    padding: '15px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '15px'
                  }}
                >
                  <ImageIcon size={16} />
                  Fotoğraf Seç
                </button>

                {/* Seçilen Dosyalar */}
                {selectedFiles.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600', color: '#34495e' }}>Seçilen Dosyalar:</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {selectedFiles.map((file, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f3f4', padding: '8px 12px', borderRadius: '6px' }}>
                          <span style={{ fontSize: '14px' }}>{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={uploadPhotos}
                      disabled={uploadingPhotos}
                      style={{
                        background: uploadingPhotos ? '#95a5a6' : '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: uploadingPhotos ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '10px'
                      }}
                    >
                      {uploadingPhotos ? (
                        <>
                          <div style={{ width: '14px', height: '14px', border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                          Yükleniyor...
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          Fotoğrafları Yükle
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{ 
                background: saving ? '#95a5a6' : '#ffc107', 
                color: saving ? 'white' : '#212529',
                border: 'none', 
                padding: '15px 40px', 
                fontSize: '16px', 
                fontWeight: '600',
                borderRadius: '50px', 
                cursor: saving ? 'not-allowed' : 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                margin: '0 auto',
                minWidth: '200px',
                justifyContent: 'center'
              }}
            >
              {saving ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
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

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: #ffc107 !important;
            box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.1);
          }
        `}
      </style>
    </div>
  );
};

export default PaymentPointEdit; 