import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Edit,
  Trash2
} from 'lucide-react';
import { busCardApi } from '../services/apiService';
import '../styles/BusCardPricing.css';

const BusCardPricing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pricingList, setPricingList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [formData, setFormData] = useState({
    cardType: '',
    price: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Kart tipleri - Backend CardType enum'ına uygun
  const cardTypes = [
    { value: 'TAM', label: 'Tam Bilet' },
    { value: 'ÖĞRENCİ', label: 'Öğrenci' },
    { value: 'ÖĞRETMEN', label: 'Öğretmen' },
    { value: 'YAŞLI', label: 'Yaşlı' },
    { value: 'ENGELLİ', label: 'Engelli' },
    { value: 'ÇOCUK', label: 'Çocuk' },
    { value: 'TURİST', label: 'Turist' },
    { value: 'ABONMAN', label: 'Abonman' },
    { value: 'ÖĞRENCİ_AKTARMA', label: 'Öğrenci Aktarma' },
    { value: 'ENGELLİ_AKTARMA', label: 'Engelli Aktarma' }
  ];

  // Mock data for demonstration
  const mockPricingList = [
    { id: 1, cardType: 'TAM', price: 20.00, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: 2, cardType: 'ÖĞRENCİ', price: 12.00, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: 3, cardType: 'ÖĞRETMEN', price: 15.00, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: 4, cardType: 'YAŞLI', price: 10.00, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: 5, cardType: 'ENGELLİ', price: 10.00, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: 6, cardType: 'ÇOCUK', price: 10.00, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: 7, cardType: 'TURİST', price: 18.00, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: 8, cardType: 'ABONMAN', price: 0.00, createdAt: '2024-01-15', updatedAt: '2024-01-15' }
  ];

  useEffect(() => {
    loadPricingList();
  }, []);

  const loadPricingList = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📋 Kart fiyatları yükleniyor...');
      
      // Gerçek API çağrısı yapalım
      const response = await busCardApi.getAllCardPricing();
      console.log('✅ Kart fiyatları başarıyla yüklendi:', response);
      setPricingList(response);
      
    } catch (err) {
      console.error('❌ Fiyatlandırma listesi yüklenirken hata:', err);
      setError('Fiyatlandırma listesi yüklenirken hata oluştu');
      
      // Hata durumunda mock data kullan
      console.log('⚠️ API hatası, mock data kullanılıyor');
      setPricingList(mockPricingList);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.cardType) {
      errors.cardType = 'Kart tipi seçilmelidir';
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Geçerli bir fiyat girilmelidir';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      
      // Integer girişini decimal'e çevir (örn: 25 → "25.00")
      const priceValue = parseFloat(formData.price);
      const decimalPrice = priceValue.toFixed(2); // Her zaman 2 decimal ile gönder
      
      const pricingData = {
        cardType: formData.cardType,
        price: decimalPrice // "25.00" formatında gönder
      };

      console.log('🔍 Form data:', formData);
      console.log('🔍 Price value:', priceValue, 'Type:', typeof priceValue);
      console.log('🔍 Decimal price:', decimalPrice, 'Type:', typeof decimalPrice);
      console.log('🔍 Pricing data:', pricingData);
      console.log('🔍 CardType:', pricingData.cardType, 'Type:', typeof pricingData.cardType);
      console.log('🔍 Price:', pricingData.price, 'Type:', typeof pricingData.price);

      if (editingPricing) {
        // Güncelleme
        console.log('🔄 Güncelleme işlemi başlatılıyor...');
        await busCardApi.updateCardPricing(pricingData);
        console.log('✅ Kart fiyatı başarıyla güncellendi');
        setSuccess('Fiyatlandırma başarıyla güncellendi');
      } else {
        // Yeni ekleme
        console.log('➕ Yeni ekleme işlemi başlatılıyor...');
        await busCardApi.createCardPricing(pricingData);
        console.log('✅ Yeni kart fiyatı başarıyla oluşturuldu');
        setSuccess('Fiyatlandırma başarıyla oluşturuldu');
      }
      
      setShowForm(false);
      setEditingPricing(null);
      setFormData({ cardType: '', price: '' });
      setFormErrors({});
      
      // Listeyi yenile
      console.log('🔄 Liste yenileniyor...');
      await loadPricingList();
    } catch (err) {
      console.error('Fiyatlandırma kaydetme hatası:', err);
      setError('Fiyatlandırma kaydedilirken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (pricing) => {
    setEditingPricing(pricing);
    setFormData({
      cardType: pricing.cardType,
      price: pricing.price.toString()
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPricing(null);
    setFormData({ cardType: '', price: '' });
    setFormErrors({});
  };

  const getCardTypeLabel = (cardType) => {
    const type = cardTypes.find(t => t.value === cardType);
    return type ? type.label : cardType;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div className="buscard-pricing-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
            title="Dashboard'a Dön"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="header-content">
            <h1>Kart Fiyatlandırma Yönetimi</h1>
            <p>Kart tiplerinin fiyatlarını oluştur ve güncelle</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-button"
            onClick={loadPricingList}
            disabled={loading}
            title="Yenile"
          >
            <RefreshCw className={loading ? 'spinning' : ''} size={20} />
          </button>
          <button 
            className="add-button"
            onClick={() => setShowForm(true)}
            title="Yeni Fiyatlandırma Ekle"
          >
            <Plus size={20} />
            Yeni Ekle
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
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

      {/* Pricing Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingPricing ? 'Fiyatlandırma Güncelle' : 'Yeni Fiyatlandırma Ekle'}</h3>
              <button 
                className="close-button"
                onClick={handleCancel}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="pricing-form">
              <div className="form-body">
                <div className="form-group">
                  <label htmlFor="cardType">Kart Tipi *</label>
                  <select
                    id="cardType"
                    value={formData.cardType}
                    onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
                    className={`form-select ${formErrors.cardType ? 'error' : ''}`}
                    disabled={!!editingPricing}
                  >
                    <option value="">Kart tipi seçiniz</option>
                    {cardTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.cardType && (
                    <span className="error-message">{formErrors.cardType}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="price">Fiyat (₺) *</label>
                  <input
                    type="number"
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`form-input ${formErrors.price ? 'error' : ''}`}
                  />
                  {formErrors.price && (
                    <span className="error-message">{formErrors.price}</span>
                  )}
                </div>
              </div>
              <div className="form-footer">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="spinning" size={16} />
                      {editingPricing ? 'Güncelleniyor...' : 'Kaydediliyor...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingPricing ? 'Güncelle' : 'Kaydet'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pricing List */}
      <div className="pricing-list-container">
        <div className="list-header">
          <h3>Fiyatlandırma Listesi ({pricingList.length})</h3>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <RefreshCw className="spinning" size={32} />
            <p>Fiyatlandırma listesi yükleniyor...</p>
          </div>
        ) : pricingList.length === 0 ? (
          <div className="empty-state">
            <Plus size={48} />
            <h3>Fiyatlandırma bulunamadı</h3>
            <p>Henüz hiç fiyatlandırma eklenmemiş</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} />
              İlk Fiyatlandırmayı Ekle
            </button>
          </div>
        ) : (
          <div className="pricing-grid">
            {pricingList.map((pricing) => (
              <div key={pricing.id} className="pricing-card">
                <div className="card-header">
                  <div className="card-type">
                    <span className="type-badge">{getCardTypeLabel(pricing.cardType)}</span>
                  </div>
                  <div className="card-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(pricing)}
                      title="Düzenle"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="price-display">
                    <span className="price-amount">{formatCurrency(pricing.price)}</span>
                    <span className="price-label">Bilet Fiyatı</span>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="date-info">
                    <span className="date-label">Son Güncelleme:</span>
                    <span className="date-value">{formatDate(pricing.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusCardPricing;
