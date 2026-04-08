import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw
} from 'lucide-react';
import { busCardApi } from '../services/apiService';
import '../styles/BusCardManagement.css';

const BusCardEdit = () => {
  const navigate = useNavigate();
  const { uid } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingCard, setLoadingCard] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    uid: '',
    fullName: '',
    status: 'ACTIVE',
    active: true,
    expiryDate: ''
  });

  useEffect(() => {
    if (uid) {
      loadCard();
    }
  }, [uid]);

  const loadCard = async () => {
    try {
      setLoadingCard(true);
      setError('');
      
      const response = await busCardApi.readCard(uid);
      
      if (response) {
        setFormData({
          uid: response.uid || uid,
          fullName: response.fullName || '',
          status: response.status || 'ACTIVE',
          active: response.active !== undefined ? response.active : true,
          expiryDate: response.expiryDate ? response.expiryDate.split('T')[0] : ''
        });
      }
    } catch (err) {
      console.error('Kart yükleme hatası:', err);
      setError('Kart bilgileri yüklenirken hata oluştu');
    } finally {
      setLoadingCard(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.uid.trim()) {
      setError('UID alanı zorunludur');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const cardData = {
        uid: formData.uid,
        fullName: formData.fullName || undefined,
        status: formData.status || undefined,
        active: formData.active !== undefined ? formData.active : undefined,
        expiryDate: formData.expiryDate || undefined
      };

      const response = await busCardApi.editCard(cardData);
      
      if (response) {
        setSuccess('Kart başarıyla güncellendi');
        setTimeout(() => {
          navigate('/buscard-management');
        }, 2000);
      }
    } catch (err) {
      console.error('Kart güncelleme hatası:', err);
      setError(err.response?.data?.message || 'Kart güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loadingCard) {
    return (
      <div className="buscard-management-container">
        <div className="loading-container">
          <RefreshCw className="spinning" size={32} />
          <p>Kart bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

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
            <h1>Kart Düzenle</h1>
            <p>Kart bilgilerini güncelleyin</p>
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
              required
              className="form-input"
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Ad Soyad</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Örn: Ahmet Yılmaz veya Ayşe Demir"
              className="form-input"
            />
            <small className="form-hint">Kart sahibinin tam adını ve soyadını girin. Örnek: Mehmet Özkan, Fatma Kaya</small>
          </div>

          <div className="form-group">
            <label htmlFor="status">Durum</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Pasif</option>
              <option value="BLOCKED">Bloklu</option>
              <option value="EXPIRED">Süresi Dolmuş</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="active" className="checkbox-label">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span>Aktif</span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="expiryDate">Son Kullanma Tarihi</label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
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
                  Güncelleniyor...
                </>
              ) : (
                'Güncelle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusCardEdit;

