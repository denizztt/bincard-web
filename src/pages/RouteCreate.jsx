import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routeApi } from '../services/apiService';
import { stationApi } from '../services/apiService';
import { 
  ROUTE_TYPES, 
  ROUTE_TYPE_LABELS, 
  TIME_SLOTS, 
  formatTimeSlot,
  ROUTE_COLORS 
} from '../constants/routeTypes';
import '../styles/RouteCreate.css';

const RouteCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stations, setStations] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    routeName: '',
    routeCode: '',
    description: '',
    routeType: 'CITY_BUS',
    color: ROUTE_COLORS[0],
    startStationId: '',
    endStationId: '',
    estimatedDurationMinutes: '',
    totalDistanceKm: '',
    weekdayHours: [],
    weekendHours: [],
    outgoingStations: [],
    returnStations: []
  });

  // Durak node state
  const [newOutgoingNode, setNewOutgoingNode] = useState({
    fromStationId: '',
    toStationId: '',
    estimatedTravelTimeMinutes: '',
    distanceKm: '',
    notes: ''
  });

  // İstasyonları yükle
  const loadStations = async () => {
    try {
      const response = await stationApi.getAllStations();
      if (response.success) {
        setStations(response.data.content || response.data);
      }
    } catch (error) {
      console.error('Stations loading error:', error);
    }
  };

  // Form input değişiklikleri
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Çoklu seçim için (time slots)
  const handleTimeSlotChange = (timeSlot, dayType) => {
    setFormData(prev => {
      const currentSlots = prev[dayType];
      const newSlots = currentSlots.includes(timeSlot)
        ? currentSlots.filter(slot => slot !== timeSlot)
        : [...currentSlots, timeSlot];
      
      return {
        ...prev,
        [dayType]: newSlots
      };
    });
  };

  // Gidiş node ekleme
  const addOutgoingNode = () => {
    if (!newOutgoingNode.fromStationId || !newOutgoingNode.toStationId) {
      alert('Lütfen başlangıç ve bitiş durağını seçin');
      return;
    }

    setFormData(prev => ({
      ...prev,
      outgoingStations: [...prev.outgoingStations, { ...newOutgoingNode }]
    }));

    setNewOutgoingNode({
      fromStationId: '',
      toStationId: '',
      estimatedTravelTimeMinutes: '',
      distanceKm: '',
      notes: ''
    });
  };

  // Node silme
  const removeOutgoingNode = (index) => {
    setFormData(prev => ({
      ...prev,
      outgoingStations: prev.outgoingStations.filter((_, i) => i !== index)
    }));
  };

  // Form gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.routeName || !formData.routeCode || !formData.startStationId || !formData.endStationId) {
      setError('Lütfen zorunlu alanları doldurun');
      return;
    }

    if (formData.outgoingStations.length === 0) {
      setError('En az bir gidiş durağı eklemelisiniz');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
        routeName: formData.routeName,
        routeCode: formData.routeCode,
        description: formData.description,
        routeType: formData.routeType,
        color: formData.color,
        startStationId: parseInt(formData.startStationId),
        endStationId: parseInt(formData.endStationId),
        estimatedDurationMinutes: formData.estimatedDurationMinutes ? parseInt(formData.estimatedDurationMinutes) : null,
        totalDistanceKm: formData.totalDistanceKm ? parseFloat(formData.totalDistanceKm) : null,
        weekdayHours: formData.weekdayHours,
        weekendHours: formData.weekendHours,
        outgoingStations: formData.outgoingStations.map(node => ({
          fromStationId: parseInt(node.fromStationId),
          toStationId: parseInt(node.toStationId),
          estimatedTravelTimeMinutes: node.estimatedTravelTimeMinutes ? parseInt(node.estimatedTravelTimeMinutes) : null,
          distanceKm: node.distanceKm ? parseFloat(node.distanceKm) : null,
          notes: node.notes
        })),
        returnStations: [] // Otomatik ters sıra oluşturulacak
      };

      const response = await routeApi.createBidirectionalRoute(requestData);
      
      if (response.success) {
        alert('Rota başarıyla oluşturuldu!');
        navigate('/routes');
      } else {
        setError('Rota oluşturulurken hata oluştu');
      }
    } catch (error) {
      console.error('Route creation error:', error);
      setError('Rota oluşturulurken hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  return (
    <div className="route-create-container">
      {/* Header */}
      <div className="route-create-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/routes')}
            className="btn btn-back"
          >
            ← Geri
          </button>
          <h1>🚌 Yeni Rota Oluştur</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="route-create-form">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Temel Bilgiler */}
        <div className="form-section">
          <h3>📋 Temel Bilgiler</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="routeName">Rota Adı *</label>
              <input
                type="text"
                id="routeName"
                name="routeName"
                value={formData.routeName}
                onChange={handleInputChange}
                placeholder="Örn: Kadıköy - Taksim"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="routeCode">Rota Kodu *</label>
              <input
                type="text"
                id="routeCode"
                name="routeCode"
                value={formData.routeCode}
                onChange={handleInputChange}
                placeholder="Örn: 34A"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="routeType">Rota Tipi</label>
              <select
                id="routeType"
                name="routeType"
                value={formData.routeType}
                onChange={handleInputChange}
              >
                {Object.entries(ROUTE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="color">Rota Rengi</label>
              <div className="color-picker">
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
                <div className="color-presets">
                  {ROUTE_COLORS.slice(0, 8).map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-preset ${formData.color === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Açıklama</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Rota hakkında ek bilgiler..."
              rows="3"
            />
          </div>
        </div>

        {/* Durak Bilgileri */}
        <div className="form-section">
          <h3>🚏 Durak Bilgileri</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startStationId">Başlangıç Durağı *</label>
              <select
                id="startStationId"
                name="startStationId"
                value={formData.startStationId}
                onChange={handleInputChange}
                required
              >
                <option value="">Durak seçin...</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.name} - {station.city}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="endStationId">Bitiş Durağı *</label>
              <select
                id="endStationId"
                name="endStationId"
                value={formData.endStationId}
                onChange={handleInputChange}
                required
              >
                <option value="">Durak seçin...</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.name} - {station.city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estimatedDurationMinutes">Tahmini Süre (dakika)</label>
              <input
                type="number"
                id="estimatedDurationMinutes"
                name="estimatedDurationMinutes"
                value={formData.estimatedDurationMinutes}
                onChange={handleInputChange}
                placeholder="60"
                min="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="totalDistanceKm">Toplam Mesafe (km)</label>
              <input
                type="number"
                id="totalDistanceKm"
                name="totalDistanceKm"
                value={formData.totalDistanceKm}
                onChange={handleInputChange}
                placeholder="25.5"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Gidiş Yönü Durakları */}
        <div className="form-section">
          <h3>➡️ Gidiş Yönü Durakları</h3>
          
          {/* Yeni durak ekleme */}
          <div className="add-station-form">
            <div className="form-row">
              <div className="form-group">
                <label>Başlangıç Durağı</label>
                <select
                  value={newOutgoingNode.fromStationId}
                  onChange={(e) => setNewOutgoingNode(prev => ({ ...prev, fromStationId: e.target.value }))}
                >
                  <option value="">Durak seçin...</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Hedef Durak</label>
                <select
                  value={newOutgoingNode.toStationId}
                  onChange={(e) => setNewOutgoingNode(prev => ({ ...prev, toStationId: e.target.value }))}
                >
                  <option value="">Durak seçin...</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Süre (dk)</label>
                <input
                  type="number"
                  value={newOutgoingNode.estimatedTravelTimeMinutes}
                  onChange={(e) => setNewOutgoingNode(prev => ({ ...prev, estimatedTravelTimeMinutes: e.target.value }))}
                  placeholder="5"
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Mesafe (km)</label>
                <input
                  type="number"
                  value={newOutgoingNode.distanceKm}
                  onChange={(e) => setNewOutgoingNode(prev => ({ ...prev, distanceKm: e.target.value }))}
                  placeholder="2.5"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <button
                  type="button"
                  onClick={addOutgoingNode}
                  className="btn btn-add"
                >
                  ➕ Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Mevcut duraklar */}
          {formData.outgoingStations.length > 0 && (
            <div className="stations-list">
              <h4>Eklenen Duraklar:</h4>
              {formData.outgoingStations.map((node, index) => {
                const fromStation = stations.find(s => s.id == node.fromStationId);
                const toStation = stations.find(s => s.id == node.toStationId);
                return (
                  <div key={index} className="station-node">
                    <span className="station-path">
                      {fromStation?.name} → {toStation?.name}
                    </span>
                    <span className="station-details">
                      {node.estimatedTravelTimeMinutes}dk, {node.distanceKm}km
                    </span>
                    <button
                      type="button"
                      onClick={() => removeOutgoingNode(index)}
                      className="btn btn-remove"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Çalışma Saatleri */}
        <div className="form-section">
          <h3>⏰ Çalışma Saatleri</h3>
          
          <div className="schedule-section">
            <h4>Hafta İçi Saatleri</h4>
            <div className="time-slots">
              {TIME_SLOTS.map(slot => (
                <label key={`weekday-${slot}`} className="time-slot">
                  <input
                    type="checkbox"
                    checked={formData.weekdayHours.includes(slot)}
                    onChange={() => handleTimeSlotChange(slot, 'weekdayHours')}
                  />
                  {formatTimeSlot(slot)}
                </label>
              ))}
            </div>
          </div>

          <div className="schedule-section">
            <h4>Hafta Sonu Saatleri</h4>
            <div className="time-slots">
              {TIME_SLOTS.map(slot => (
                <label key={`weekend-${slot}`} className="time-slot">
                  <input
                    type="checkbox"
                    checked={formData.weekendHours.includes(slot)}
                    onChange={() => handleTimeSlotChange(slot, 'weekendHours')}
                  />
                  {formatTimeSlot(slot)}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/routes')}
            className="btn btn-secondary"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? '⏳ Oluşturuluyor...' : '✅ Rotayı Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RouteCreate;
