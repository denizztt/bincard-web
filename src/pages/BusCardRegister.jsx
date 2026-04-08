import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const BusCardRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    uid: '',
    fullName: '',
    status: 'ACTIVE',
    kartTipi: 'TAM',
    bakiye: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.uid.trim()) {
      setError('UID alanı zorunludur');
      return;
    }

    if (!formData.fullName.trim()) {
      setError('Ad Soyad alanı zorunludur');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const cardData = {
        uid: formData.uid.trim(),
        fullName: formData.fullName.trim(),
        status: formData.status,
        kartTipi: formData.kartTipi,
        bakiye: formData.bakiye && formData.bakiye.trim() ? parseFloat(formData.bakiye) : 0
      };
      
      console.log('📤 Gönderilen kart verisi:', cardData);

      const response = await busCardApi.registerCard(cardData);
      
      if (response) {
        setSuccess('Kart başarıyla kaydedildi');
        setFormData({
          uid: '',
          fullName: '',
          status: 'ACTIVE',
          kartTipi: 'TAM',
          bakiye: ''
        });
        setTimeout(() => {
          navigate('/buscard-management');
        }, 2000);
      }
    } catch (err) {
      console.error('Kart kayıt hatası:', err);
      setError(err.response?.data?.message || 'Kart kaydedilirken hata oluştu');
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
            <h1>Yeni Kart Kaydet</h1>
            <p>Yeni bir otobüs kartı kaydedin</p>
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
              placeholder="Örn: CARD-1234567890 veya 1234567890ABCDEF"
              required
              className="form-input"
            />
            <small className="form-hint">Kart UID'si genellikle 8-16 karakter arası alfanumerik bir değerdir. Örnek: CARD-1111, 12345678ABCD</small>
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Ad Soyad *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Örn: Ahmet Yılmaz veya Ayşe Demir"
              required
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
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="kartTipi">Kart Tipi *</label>
            <select
              id="kartTipi"
              name="kartTipi"
              value={formData.kartTipi}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="TAM">Tam</option>
              <option value="ÖĞRENCİ">Öğrenci</option>
              <option value="ÖĞRETMEN">Öğretmen</option>
              <option value="YAŞLI">Yaşlı</option>
              <option value="ENGELLİ">Engelli</option>
              <option value="TAM_AKTARMA">Tam Aktarma</option>
              <option value="ÖĞRENCİ_AKTARMA">Öğrenci Aktarma</option>
              <option value="QR_ÖDEME">QR Ödeme</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bakiye">Başlangıç Bakiyesi (TL)</label>
            <input
              type="number"
              id="bakiye"
              name="bakiye"
              value={formData.bakiye}
              onChange={handleChange}
              placeholder="Örn: 100.00 veya 50.50"
              min="0"
              step="0.01"
              className="form-input"
            />
            <small className="form-hint">Kartın başlangıç bakiyesini TL cinsinden girin. Ondalıklı değer girebilirsiniz. Örnek: 100.00, 50.50, 0 (boş bırakılabilir)</small>
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
                  Kaydediliyor...
                </>
              ) : (
                'Kartı Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusCardRegister;

