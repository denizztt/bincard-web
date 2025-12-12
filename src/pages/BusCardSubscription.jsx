import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw
} from 'lucide-react';
import { busCardApi } from '../services/apiService';
import '../styles/BusCardManagement.css';

const BusCardSubscription = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    uid: '',
    type: 'MONTHLY',
    loaded: 1,
    startDate: '',
    endDate: '',
    remainingUses: 30,
    remainingDays: 30
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.uid.trim()) {
      setError('UID alanı zorunludur');
      return;
    }

    if (!formData.type.trim()) {
      setError('Abonman tipi zorunludur');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const subscriptionData = {
        uid: formData.uid,
        type: formData.type,
        loaded: formData.loaded || 1,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        remainingUses: formData.remainingUses || 30,
        remainingDays: formData.remainingDays || 30
      };

      const response = await busCardApi.createSubscription(subscriptionData);
      
      if (response) {
        setSuccess('Abonman başarıyla oluşturuldu');
        setFormData({
          uid: '',
          type: 'MONTHLY',
          loaded: 1,
          startDate: '',
          endDate: '',
          remainingUses: 30,
          remainingDays: 30
        });
        setTimeout(() => {
          navigate('/buscard-management');
        }, 2000);
      }
    } catch (err) {
      console.error('Abonman oluşturma hatası:', err);
      setError(err.response?.data?.message || 'Abonman oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="buscard-management-container">
      <div className="page-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => navigate('/buscard-management')}
            title="Geri Dön"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="header-content">
            <h1>Abonman Oluştur</h1>
            <p>Kart için yeni abonman oluşturun</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit} className="card-form">
          <div className="form-group">
            <label htmlFor="uid">Kart UID *</label>
            <input
              type="text"
              id="uid"
              name="uid"
              value={formData.uid}
              onChange={handleChange}
              placeholder="Kart UID'sini girin"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Abonman Tipi *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="MONTHLY">Aylık</option>
              <option value="WEEKLY">Haftalık</option>
              <option value="DAILY">Günlük</option>
              <option value="YEARLY">Yıllık</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="loaded">Yüklenmiş</label>
            <input
              type="number"
              id="loaded"
              name="loaded"
              value={formData.loaded}
              onChange={handleChange}
              min="0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Başlangıç Tarihi</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">Bitiş Tarihi</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="remainingUses">Kalan Kullanım</label>
            <input
              type="number"
              id="remainingUses"
              name="remainingUses"
              value={formData.remainingUses}
              onChange={handleChange}
              min="0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="remainingDays">Kalan Gün</label>
            <input
              type="number"
              id="remainingDays"
              name="remainingDays"
              value={formData.remainingDays}
              onChange={handleChange}
              min="0"
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/buscard-management')}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="spinning" size={16} />
                  Oluşturuluyor...
                </>
              ) : (
                'Abonman Oluştur'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusCardSubscription;

