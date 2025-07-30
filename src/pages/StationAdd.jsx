import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { stationApi } from '../services/apiService';
import { StationType, StationStatus, getStationTypeDisplayName } from '../types';
import { config } from '../config/config';
import '../styles/StationAdd.css';

const StationAdd = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'OTOBUS',
    latitude: '',
    longitude: '',
    city: '',
    district: '',
    street: '',
    postalCode: '',
    fullAddress: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);

  // Initialize Google Maps
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
      // Default center coordinates from config
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
      setMessage('Harita yüklendi. Durak konumunu seçmek için harita üzerine tıklayın.');
      
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
      title: "Seçilen Durak Konumu",
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#e74c3c">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32)
      }
    });

    markerRef.current = marker;

    // Update coordinates in form
    setFormData(prev => ({
      ...prev,
      latitude: location.lat().toFixed(6),
      longitude: location.lng().toFixed(6)
    }));

    setLocationSelected(true);
  };

  const getAddressFromCoordinates = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat: lat, lng: lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK" && results[0]) {
        parseAddressComponents(results[0]);
      } else {
        console.error("Adres bulunamadı: " + status);
        setError("Bu konum için adres bilgisi alınamadı.");
      }
    });
  };

  const parseAddressComponents = (result) => {
    let city = "";
    let district = "";
    let street = "";
    let postalCode = "";

    for (let component of result.address_components) {
      const types = component.types;
      
      if (types.includes("administrative_area_level_1")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_2")) {
        district = component.long_name;
      } else if (types.includes("route") || types.includes("street_address")) {
        street = component.long_name;
      } else if (types.includes("postal_code")) {
        postalCode = component.long_name;
      }
    }

    // Update form data
    setFormData(prev => ({
      ...prev,
      city: city,
      district: district,
      street: street,
      postalCode: postalCode,
      fullAddress: result.formatted_address
    }));

    // Auto-generate station name if empty
    if (!formData.name.trim()) {
      let autoName = "";
      if (street) {
        autoName = street + " Durağı";
      } else if (district) {
        autoName = district + " Durağı";
      } else if (city) {
        autoName = city + " Durağı";
      }
      
      if (autoName) {
        setFormData(prev => ({
          ...prev,
          name: autoName
        }));
      }
    }

    setMessage('Konum bilgileri başarıyla alındı ve form alanlarına aktarıldı.');
    setError('');
  };

  const centerToIstanbul = () => {
    if (mapInstanceRef.current) {
      const istanbul = { lat: 41.0082, lng: 28.9784 };
      mapInstanceRef.current.setCenter(istanbul);
      mapInstanceRef.current.setZoom(13);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Durak adı boş olamaz!');
      return false;
    }

    if (!formData.latitude || !formData.longitude) {
      setError('Konum bilgileri eksik! Lütfen haritadan konum seçin.');
      return false;
    }

    if (!formData.type) {
      setError('Durak tipi seçilmeli!');
      return false;
    }

    // Validate coordinates
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Geçersiz koordinat değerleri!');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setMessage('Durak kaydediliyor...');

    try {
      // Prepare station data
      const stationData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: 'ACTIVE',
        location: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        },
        address: {
          fullAddress: formData.fullAddress,
          city: formData.city,
          district: formData.district,
          street: formData.street,
          postalCode: formData.postalCode
        }
      };

      console.log('Creating station with data:', stationData);
      
      // Call API
      const result = await stationApi.createStation(stationData);
      
      setMessage('Durak başarıyla kaydedildi! Ana sayfaya yönlendiriliyorsunuz...');
      
      // Redirect after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Station creation failed:', err);
      setError('Durak kaydedilemedi: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Değişiklikler kaydedilmeyecek. Çıkmak istediğinizden emin misiniz?')) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="station-add-container">
      <div className="station-add-header">
        <div className="header-top">
          <h1 className="page-title">🚌 Yeni Durak Ekle</h1>
          <div className="header-actions">
            <button 
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              ← Ana Menü
            </button>
          </div>
        </div>
        <p className="page-description">
          Google Maps üzerinden durak konumunu seçin ve bilgileri doldurun
        </p>
      </div>

      {/* Info Card */}
      <div className="info-card">
        <h3>📍 Durak Konumu Seçimi</h3>
        <div className="info-content">
          <ul>
            <li>Harita üzerinden durak konumunu seçin</li>
            <li>Seçilen konum otomatik olarak form alanlarına aktarılacaktır</li>
            <li>Adres bilgileri Google Maps'ten otomatik doldurulur</li>
            <li>Durak tipini ve diğer bilgileri manuel olarak girin</li>
          </ul>
          {mapLoaded && (
            <button 
              onClick={centerToIstanbul}
              className="btn btn-secondary btn-small"
            >
              📍 İstanbul'a Git
            </button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="map-card">
        <h3>🗺️ Konum Seçim Haritası</h3>
        <div 
          ref={mapRef}
          className="map-container"
          style={{ height: '400px', width: '100%', borderRadius: '8px' }}
        >
          {!mapLoaded && (
            <div className="map-loading">
              <div className="spinner"></div>
              <p>Google Maps yükleniyor...</p>
            </div>
          )}
        </div>
        {locationSelected && (
          <div className="location-info">
            <p>✅ Konum seçildi: {formData.latitude}, {formData.longitude}</p>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="station-form">
        <div className="form-card">
          <h3>📝 Durak Bilgileri</h3>
          
          <div className="form-grid">
            {/* Station Name */}
            <div className="form-group">
              <label htmlFor="name">Durak Adı *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Örn: Taksim Meydanı Durağı"
                required
              />
            </div>

            {/* Station Type */}
            <div className="form-group">
              <label htmlFor="type">Durak Tipi *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                {Object.values(StationType).map(type => (
                  <option key={type} value={type}>
                    {getStationTypeDisplayName(type)}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label htmlFor="description">Açıklama</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Durak hakkında ek bilgiler..."
                rows="3"
              />
            </div>

            {/* Coordinates (read-only) */}
            <div className="form-group">
              <label htmlFor="latitude">Enlem (Latitude)</label>
              <input
                type="text"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                readOnly
                placeholder="Haritadan otomatik doldurulacak"
                className="readonly-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Boylam (Longitude)</label>
              <input
                type="text"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                readOnly
                placeholder="Haritadan otomatik doldurulacak"
                className="readonly-field"
              />
            </div>

            {/* Address fields */}
            <div className="form-group">
              <label htmlFor="city">Şehir</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Haritadan otomatik doldurulacak"
              />
            </div>

            <div className="form-group">
              <label htmlFor="district">İlçe</label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Haritadan otomatik doldurulacak"
              />
            </div>

            <div className="form-group">
              <label htmlFor="street">Sokak</label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="Haritadan otomatik doldurulacak"
              />
            </div>

            <div className="form-group">
              <label htmlFor="postalCode">Posta Kodu</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder="Opsiyonel"
              />
            </div>

            {/* Full Address (read-only) */}
            <div className="form-group full-width">
              <label htmlFor="fullAddress">Tam Adres</label>
              <input
                type="text"
                id="fullAddress"
                name="fullAddress"
                value={formData.fullAddress}
                readOnly
                placeholder="Haritadan otomatik doldurulacak"
                className="readonly-field"
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="message-card error">
            <p>❌ {error}</p>
          </div>
        )}

        {message && !error && (
          <div className="message-card success">
            <p>✅ {message}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            ❌ İptal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !locationSelected}
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Kaydediliyor...
              </>
            ) : (
              '💾 Durak Kaydet'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StationAdd; 