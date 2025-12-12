import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Route, 
  Save, 
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Bus,
  Plus,
  Trash2,
  Navigation,
  Palette,
  Info,
  Map,
  Target,
  Route as RouteIcon
} from 'lucide-react';
import { routeApi } from '../services/apiService';
import { stationApi } from '../services/apiService';
import GoogleMapWrapper from '../components/GoogleMapWrapper';
import '../styles/RouteAdd.css';

const RouteAdd = () => {
  const navigate = useNavigate();
  
  // Form data
  const [formData, setFormData] = useState({
    routeName: '',
    routeCode: '',
    description: '',
    routeType: 'CITY_BUS',
    color: '#4f46e5',
    startStationId: '',
    endStationId: '',
    estimatedDurationMinutes: '',
    totalDistanceKm: '',
    weekdayHours: [],
    weekendHours: [],
    outgoingStations: [],
    returnStations: []
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stations, setStations] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStations, setSelectedStations] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 41.0082, lng: 28.9784 });
  const [showMap, setShowMap] = useState(false);
  const totalSteps = 4;

  // Route type options
  const routeTypeOptions = [
    { value: 'CITY_BUS', label: 'Şehir İçi Otobüs' },
    { value: 'METRO', label: 'Metro' },
    { value: 'METROBUS', label: 'Metrobüs' },
    { value: 'TRAM', label: 'Tramvay' },
    { value: 'FERRY', label: 'Vapur' },
    { value: 'MINIBUS', label: 'Minibüs' },
    { value: 'EXPRESS', label: 'Ekspres' }
  ];

  // Time slots (simplified for demo)
  const timeSlots = [
    'T_05_00', 'T_05_15', 'T_05_30', 'T_05_45',
    'T_06_00', 'T_06_15', 'T_06_30', 'T_06_45',
    'T_07_00', 'T_07_15', 'T_07_30', 'T_07_45',
    'T_08_00', 'T_08_15', 'T_08_30', 'T_08_45',
    'T_09_00', 'T_09_15', 'T_09_30', 'T_09_45',
    'T_10_00', 'T_10_15', 'T_10_30', 'T_10_45',
    'T_11_00', 'T_11_15', 'T_11_30', 'T_11_45',
    'T_12_00', 'T_12_15', 'T_12_30', 'T_12_45',
    'T_13_00', 'T_13_15', 'T_13_30', 'T_13_45',
    'T_14_00', 'T_14_15', 'T_14_30', 'T_14_45',
    'T_15_00', 'T_15_15', 'T_15_30', 'T_15_45',
    'T_16_00', 'T_16_15', 'T_16_30', 'T_16_45',
    'T_17_00', 'T_17_15', 'T_17_30', 'T_17_45',
    'T_18_00', 'T_18_15', 'T_18_30', 'T_18_45',
    'T_19_00', 'T_19_15', 'T_19_30', 'T_19_45',
    'T_20_00', 'T_20_15', 'T_20_30', 'T_20_45',
    'T_21_00', 'T_21_15', 'T_21_30', 'T_21_45',
    'T_22_00', 'T_22_15', 'T_22_30', 'T_22_45',
    'T_23_00', 'T_23_15', 'T_23_30', 'T_23_45',
    'T_00_00'
  ];

  // Load stations
  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const response = await stationApi.getAllStations(0, 1000);
      if (response && response.success && response.data && response.data.content) {
        setStations(response.data.content);
      }
    } catch (err) {
      console.error('Error loading stations:', err);
      setError('Duraklar yüklenirken hata oluştu');
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  // Handle station selection from map
  const handleStationClick = (station) => {
    if (!selectedStations.find(s => s.id === station.id)) {
      setSelectedStations(prev => [...prev, station]);
      
      // Auto-fill start and end stations if not set
      if (!formData.startStationId) {
        handleInputChange('startStationId', station.id.toString());
      } else if (!formData.endStationId && station.id.toString() !== formData.startStationId) {
        handleInputChange('endStationId', station.id.toString());
      }
    }
  };

  // Remove selected station
  const removeSelectedStation = (stationId) => {
    setSelectedStations(prev => prev.filter(s => s.id !== stationId));
    
    // Clear start/end station if it was removed
    if (formData.startStationId === stationId.toString()) {
      handleInputChange('startStationId', '');
    }
    if (formData.endStationId === stationId.toString()) {
      handleInputChange('endStationId', '');
    }
  };

  // Handle time slot selection
  const handleTimeSlotChange = (type, timeSlot) => {
    const currentSlots = formData[type];
    const isSelected = currentSlots.includes(timeSlot);
    
    if (isSelected) {
      handleInputChange(type, currentSlots.filter(slot => slot !== timeSlot));
    } else {
      handleInputChange(type, [...currentSlots, timeSlot]);
    }
  };

  // Add station to route
  const addStationToRoute = (routeType) => {
    const newStation = {
      fromStationId: '',
      toStationId: '',
      estimatedTravelTimeMinutes: 5,
      distanceKm: 1.0,
      notes: ''
    };

    handleInputChange(routeType, [...formData[routeType], newStation]);
  };

  // Remove station from route
  const removeStationFromRoute = (routeType, index) => {
    const updatedStations = formData[routeType].filter((_, i) => i !== index);
    handleInputChange(routeType, updatedStations);
  };

  // Update station in route
  const updateStationInRoute = (routeType, index, field, value) => {
    const updatedStations = [...formData[routeType]];
    updatedStations[index] = {
      ...updatedStations[index],
      [field]: value
    };
    handleInputChange(routeType, updatedStations);
  };

  // Validate current step
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.routeName || !formData.routeCode || !formData.routeType) {
          setError('Rota adı, kodu ve türü zorunludur');
          return false;
        }
        break;
      case 2:
        if (!formData.startStationId || !formData.endStationId) {
          setError('Başlangıç ve bitiş durağı seçilmelidir');
          return false;
        }
        if (formData.startStationId === formData.endStationId) {
          setError('Başlangıç ve bitiş durağı aynı olamaz');
          return false;
        }
        break;
      case 3:
        if (formData.weekdayHours.length === 0 && formData.weekendHours.length === 0) {
          setError('En az bir tarife seçilmelidir');
          return false;
        }
        break;
      case 4:
        if (formData.outgoingStations.length === 0) {
          setError('En az bir gidiş istasyonu eklenmelidir');
          return false;
        }
        break;
    }
    return true;
  };

  // Navigate between steps
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setError('');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    setError('');

    try {
      // Backend'in beklediği formata göre veriyi hazırla
      const submitData = {
        routeName: formData.routeName.trim(),
        routeCode: formData.routeCode.trim(),
        description: formData.description ? formData.description.trim() : null,
        routeType: formData.routeType,
        color: formData.color || '#4f46e5',
        startStationId: parseInt(formData.startStationId),
        endStationId: parseInt(formData.endStationId),
        estimatedDurationMinutes: formData.estimatedDurationMinutes ? parseInt(formData.estimatedDurationMinutes) : null,
        totalDistanceKm: formData.totalDistanceKm ? parseFloat(formData.totalDistanceKm) : null,
        weekdayHours: formData.weekdayHours || [],
        weekendHours: formData.weekendHours || [],
        outgoingStations: formData.outgoingStations.map(station => ({
          fromStationId: station.fromStationId ? parseInt(station.fromStationId) : null,
          toStationId: station.toStationId ? parseInt(station.toStationId) : null,
          estimatedTravelTimeMinutes: station.estimatedTravelTimeMinutes ? parseInt(station.estimatedTravelTimeMinutes) : null,
          distanceKm: station.distanceKm ? parseFloat(station.distanceKm) : null,
          notes: station.notes ? station.notes.trim() : null
        })),
        returnStations: formData.returnStations && formData.returnStations.length > 0 ? formData.returnStations.map(station => ({
          fromStationId: station.fromStationId ? parseInt(station.fromStationId) : null,
          toStationId: station.toStationId ? parseInt(station.toStationId) : null,
          estimatedTravelTimeMinutes: station.estimatedTravelTimeMinutes ? parseInt(station.estimatedTravelTimeMinutes) : null,
          distanceKm: station.distanceKm ? parseFloat(station.distanceKm) : null,
          notes: station.notes ? station.notes.trim() : null
        })) : null
      };

      console.log('Creating route with data:', submitData);
      const response = await routeApi.createBidirectionalRoute(submitData);

      if (response && response.success) {
        setSuccess('Rota başarıyla oluşturuldu!');
        setTimeout(() => {
          navigate('/route');
        }, 2000);
      } else {
        setError(response.message || 'Rota oluşturulurken hata oluştu');
      }
    } catch (err) {
      console.error('Error creating route:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Rota oluşturulurken hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format time slot for display
  const formatTimeSlot = (slot) => {
    return slot.substring(2).replace('_', ':');
  };

  // Get station name by ID
  const getStationName = (stationId) => {
    const station = stations.find(s => s.id === parseInt(stationId));
    return station ? station.name : 'Durak seçin';
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3>Rota Bilgileri</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Rota Adı *</label>
                <input
                  type="text"
                  value={formData.routeName}
                  onChange={(e) => handleInputChange('routeName', e.target.value)}
                  placeholder="Örn: 1 Numara Hat veya Taksim-Kadıköy Hattı"
                  className="form-input"
                />
                <small className="form-hint">Rota adını girin. Örnek: 1 Numara Hat, Taksim-Kadıköy Hattı, Metrobüs M34</small>
              </div>

              <div className="form-group">
                <label>Rota Kodu *</label>
                <input
                  type="text"
                  value={formData.routeCode}
                  onChange={(e) => handleInputChange('routeCode', e.target.value)}
                  placeholder="Örn: 01 veya M34"
                  className="form-input"
                />
                <small className="form-hint">Rota kodunu girin (genellikle 2-4 karakter). Örnek: 01, M34, T1, 15T</small>
              </div>

              <div className="form-group">
                <label>Rota Türü *</label>
                <select
                  value={formData.routeType}
                  onChange={(e) => handleInputChange('routeType', e.target.value)}
                  className="form-select"
                >
                  {routeTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Rota Rengi</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="color-input"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="color-text-input"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Örn: Taksim ve Kadıköy arasında hizmet veren ana hat..."
                  className="form-textarea"
                  rows={3}
                />
                <small className="form-hint">Rota hakkında açıklama girin (opsiyonel). Örnek: Taksim ve Kadıköy arasında hizmet veren ana hat, Metro hattı açıklaması</small>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3>Durak Seçimi</h3>
            
            {/* Map Toggle */}
            <div className="map-toggle-section">
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="btn btn-secondary map-toggle-btn"
              >
                <Map size={16} />
                {showMap ? 'Haritayı Gizle' : 'Haritayı Göster'}
              </button>
              <p className="map-instructions">
                Haritada durakları tıklayarak seçin veya aşağıdaki dropdown'lardan seçim yapın
              </p>
            </div>

            {/* Map Section */}
            {showMap && (
              <div className="map-section">
                <div className="map-container">
                  <GoogleMapWrapper
                    stations={stations}
                    onStationClick={handleStationClick}
                    center={mapCenter}
                    zoom={11}
                    height="400px"
                  />
                </div>
                
                {/* Selected Stations */}
                <div className="selected-stations">
                  <h4>Seçilen Duraklar</h4>
                  {selectedStations.length === 0 ? (
                    <p className="no-selection">Henüz durak seçilmedi</p>
                  ) : (
                    <div className="selected-stations-list">
                      {selectedStations.map((station, index) => (
                        <div key={station.id} className="selected-station-item">
                          <div className="station-info">
                            <span className="station-number">{index + 1}</span>
                            <span className="station-name">{station.name}</span>
                            <span className="station-address">{station.address || 'Adres bilgisi yok'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSelectedStation(station.id)}
                            className="btn-remove-station"
                            title="Durağı kaldır"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="form-grid">
              <div className="form-group">
                <label>Başlangıç Durağı *</label>
                <select
                  value={formData.startStationId}
                  onChange={(e) => handleInputChange('startStationId', e.target.value)}
                  className="form-select"
                >
                  <option value="">Başlangıç durağı seçin</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Bitiş Durağı *</label>
                <select
                  value={formData.endStationId}
                  onChange={(e) => handleInputChange('endStationId', e.target.value)}
                  className="form-select"
                >
                  <option value="">Bitiş durağı seçin</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tahmini Süre (dakika)</label>
                <input
                  type="number"
                  value={formData.estimatedDurationMinutes}
                  onChange={(e) => handleInputChange('estimatedDurationMinutes', e.target.value)}
                  placeholder="Örn: 60 veya 90"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Toplam Mesafe (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.totalDistanceKm}
                  onChange={(e) => handleInputChange('totalDistanceKm', e.target.value)}
                  placeholder="Örn: 10.0 veya 25.5"
                  className="form-input"
                />
              </div>
            </div>

            {formData.startStationId && formData.endStationId && (
              <div className="route-preview">
                <h4>Rota Önizleme</h4>
                <div className="route-path">
                  <div className="station start">
                    <MapPin size={16} />
                    {getStationName(formData.startStationId)}
                  </div>
                  <Navigation size={20} className="route-arrow" />
                  <div className="station end">
                    <MapPin size={16} />
                    {getStationName(formData.endStationId)}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3>Tarife Ayarları</h3>
            
            <div className="schedule-section">
              <h4>Hafta İçi Seferler</h4>
              <div className="time-slots">
                {timeSlots.map(slot => (
                  <label key={`weekday-${slot}`} className="time-slot">
                    <input
                      type="checkbox"
                      checked={formData.weekdayHours.includes(slot)}
                      onChange={() => handleTimeSlotChange('weekdayHours', slot)}
                    />
                    <span>{formatTimeSlot(slot)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="schedule-section">
              <h4>Hafta Sonu Seferler</h4>
              <div className="time-slots">
                {timeSlots.map(slot => (
                  <label key={`weekend-${slot}`} className="time-slot">
                    <input
                      type="checkbox"
                      checked={formData.weekendHours.includes(slot)}
                      onChange={() => handleTimeSlotChange('weekendHours', slot)}
                    />
                    <span>{formatTimeSlot(slot)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="schedule-summary">
              <p>Hafta içi: {formData.weekdayHours.length} sefer</p>
              <p>Hafta sonu: {formData.weekendHours.length} sefer</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3>Güzergah Planlaması</h3>
            
            <div className="route-directions">
              {/* Gidiş Yönü */}
              <div className="direction-section">
                <div className="direction-header">
                  <h4>Gidiş Yönü</h4>
                  <button
                    type="button"
                    onClick={() => addStationToRoute('outgoingStations')}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} />
                    Durak Ekle
                  </button>
                </div>

                <div className="stations-list">
                  {formData.outgoingStations.map((station, index) => (
                    <div key={index} className="station-item">
                      <div className="station-number">{index + 1}</div>
                      <div className="station-fields">
                        <select
                          value={station.fromStationId}
                          onChange={(e) => updateStationInRoute('outgoingStations', index, 'fromStationId', e.target.value)}
                          className="form-select-sm"
                        >
                          <option value="">Nereden</option>
                          {stations.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        
                        <select
                          value={station.toStationId}
                          onChange={(e) => updateStationInRoute('outgoingStations', index, 'toStationId', e.target.value)}
                          className="form-select-sm"
                        >
                          <option value="">Nereye</option>
                          {stations.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>

                        <input
                          type="number"
                          value={station.estimatedTravelTimeMinutes}
                          onChange={(e) => updateStationInRoute('outgoingStations', index, 'estimatedTravelTimeMinutes', parseInt(e.target.value))}
                          placeholder="Dakika"
                          className="form-input-sm"
                        />

                        <input
                          type="number"
                          step="0.1"
                          value={station.distanceKm}
                          onChange={(e) => updateStationInRoute('outgoingStations', index, 'distanceKm', parseFloat(e.target.value))}
                          placeholder="KM"
                          className="form-input-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStationFromRoute('outgoingStations', index)}
                        className="btn-remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dönüş Yönü */}
              <div className="direction-section">
                <div className="direction-header">
                  <h4>Dönüş Yönü (Opsiyonel)</h4>
                  <button
                    type="button"
                    onClick={() => addStationToRoute('returnStations')}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} />
                    Durak Ekle
                  </button>
                </div>

                <div className="stations-list">
                  {formData.returnStations.map((station, index) => (
                    <div key={index} className="station-item">
                      <div className="station-number">{index + 1}</div>
                      <div className="station-fields">
                        <select
                          value={station.fromStationId}
                          onChange={(e) => updateStationInRoute('returnStations', index, 'fromStationId', e.target.value)}
                          className="form-select-sm"
                        >
                          <option value="">Nereden</option>
                          {stations.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        
                        <select
                          value={station.toStationId}
                          onChange={(e) => updateStationInRoute('returnStations', index, 'toStationId', e.target.value)}
                          className="form-select-sm"
                        >
                          <option value="">Nereye</option>
                          {stations.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>

                        <input
                          type="number"
                          value={station.estimatedTravelTimeMinutes}
                          onChange={(e) => updateStationInRoute('returnStations', index, 'estimatedTravelTimeMinutes', parseInt(e.target.value))}
                          placeholder="Dakika"
                          className="form-input-sm"
                        />

                        <input
                          type="number"
                          step="0.1"
                          value={station.distanceKm}
                          onChange={(e) => updateStationInRoute('returnStations', index, 'distanceKm', parseFloat(e.target.value))}
                          placeholder="KM"
                          className="form-input-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStationFromRoute('returnStations', index)}
                        className="btn-remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="route-add-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button
            onClick={() => navigate('/route')}
            className="btn btn-secondary"
          >
            <ArrowLeft size={18} />
            Geri
          </button>
          <div>
            <h1><Route size={24} /> Yeni Rota Oluştur</h1>
            <p>İki yönlü rota oluşturun ve güzergah planlayın</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="progress-container">
        <div className="progress-steps">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
            >
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && 'Rota Bilgileri'}
                {step === 2 && 'Durak Seçimi'}
                {step === 3 && 'Tarife'}
                {step === 4 && 'Güzergah'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="form-container">
        {renderStepContent()}

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

        {/* Navigation */}
        <div className="form-navigation">
          <div className="nav-left">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-secondary"
              >
                <ArrowLeft size={16} />
                Önceki
              </button>
            )}
          </div>
          
          <div className="nav-right">
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
              >
                Sonraki
                <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-success"
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Rotayı Oluştur
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteAdd;