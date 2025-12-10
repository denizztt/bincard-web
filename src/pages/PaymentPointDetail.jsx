import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  MapPin,
  Building,
  Phone,
  Clock,
  CreditCard,
  Calendar,
  User,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  Loader,
  Trash2,
  Plus,
  ExternalLink
} from 'lucide-react';
import { paymentPointApi } from '../services/apiService';

const PaymentPointDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [paymentPoint, setPaymentPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Payment method options for display
  const paymentMethodOptions = [
    { value: 'CREDIT_CARD', label: 'Kredi Kartı', icon: '💳' },
    { value: 'DEBIT_CARD', label: 'Banka Kartı', icon: '💳' },
    { value: 'CASH', label: 'Nakit', icon: '💰' },
    { value: 'QR_CODE', label: 'QR Kod', icon: '📱' },
    { value: 'NFC', label: 'NFC/Temassız', icon: '📲' },
    { value: 'BANK_TRANSFER', label: 'Banka Transferi', icon: '🏦' }
  ];

  useEffect(() => {
    loadPaymentPointData();
  }, [id]);

  const loadPaymentPointData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Payment Point ID ile veri çekiliyor:', id);
      const response = await paymentPointApi.getPaymentPointById(parseInt(id));
      console.log('Payment Point API Response:', response);
      
      // Response yapısını kontrol et - birden fazla format destekle
      let paymentPointData = null;
      
      if (response && (response.isSuccess || response.success || response.data)) {
        // Eğer response.data var ise onu kullan
        paymentPointData = response.data;
        
        // Eğer response.data yoksa ama response başarılıysa, data response'un kendisinde olabilir
        if (!paymentPointData && response.isSuccess !== false) {
          paymentPointData = response;
        }
        
        if (paymentPointData) {
          console.log('Payment Point Data:', paymentPointData);
          setPaymentPoint(paymentPointData);
        } else {
          throw new Error('Ödeme noktası verisi alınamadı');
        }
      } else {
        throw new Error(response?.message || 'Ödeme noktası bulunamadı');
      }
    } catch (error) {
      console.error('Ödeme noktası yükleme hatası:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Bilinmeyen hata';
      setError('Ödeme noktası yüklenirken bir hata oluştu: ' + errorMessage);
      console.log('API hatası - gerçek veriler gösterilmiyor');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setActionLoading(true);
      
      const response = await paymentPointApi.togglePaymentPointStatus(paymentPoint.id, !paymentPoint.active);
      
      if (response.isSuccess || response.success) {
        setPaymentPoint(prev => ({ ...prev, active: !prev.active }));
        alert(`Ödeme noktası ${!paymentPoint.active ? 'aktif hale getirildi' : 'pasif hale getirildi'}!`);
      } else {
        throw new Error(response.message || 'Durum güncellenemedi');
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      alert('Durum güncellenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setActionLoading(false);
    }
  };

  const getPaymentMethodLabel = (method) => {
    const option = paymentMethodOptions.find(opt => opt.value === method);
    return option ? option.label : method;
  };

  const getPaymentMethodIcon = (method) => {
    const option = paymentMethodOptions.find(opt => opt.value === method);
    return option ? option.icon : '💳';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const openInMaps = () => {
    if (paymentPoint?.location) {
      const { latitude, longitude } = paymentPoint.location;
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <Loader size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '15px' }} />
          <p>Ödeme noktası detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !paymentPoint) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <strong>Hata:</strong> {error}
          <div style={{ marginTop: '15px' }}>
            <button 
              onClick={() => navigate('/payment-point')}
              style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <ArrowLeft size={16} style={{ marginRight: '8px' }} />
              Ödeme Noktaları Listesine Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', background: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '30px', marginBottom: '25px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => navigate('/payment-point')}
              style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ArrowLeft size={20} />
              Geri Dön
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#2c3e50' }}>
                👁️ Ödeme Noktası Detayları
              </h1>
              <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                #{paymentPoint?.id} - {paymentPoint?.name}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleToggleStatus}
              disabled={actionLoading}
              style={{ 
                background: actionLoading ? '#95a5a6' : (paymentPoint?.active ? '#dc3545' : '#28a745'), 
                color: 'white', 
                border: 'none', 
                padding: '10px 15px', 
                borderRadius: '8px', 
                cursor: actionLoading ? 'not-allowed' : 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}
            >
              {actionLoading ? (
                <div style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              ) : paymentPoint?.active ? (
                <ToggleLeft size={16} />
              ) : (
                <ToggleRight size={16} />
              )}
              {paymentPoint?.active ? 'Pasif Yap' : 'Aktif Yap'}
            </button>
            <button 
              onClick={() => navigate(`/payment-point/edit/${id}`)}
              style={{ background: '#ffc107', color: '#212529', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Edit size={16} />
              Düzenle
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ background: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffeaa7' }}>
          <strong>Hata:</strong> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Basic Information */}
          <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '35px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
              <Building size={28} style={{ color: '#667eea' }} />
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#2c3e50' }}>Temel Bilgiler</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Nokta Adı
                </label>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>
                  {paymentPoint?.name || 'Belirtilmemiş'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Durum
                </label>
                <span style={{ 
                  background: paymentPoint?.active ? '#d4edda' : '#f8d7da', 
                  color: paymentPoint?.active ? '#155724' : '#721c24', 
                  padding: '6px 12px', 
                  borderRadius: '12px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {paymentPoint?.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {paymentPoint?.active ? 'Aktif' : 'Pasif'}
                </span>
              </div>

              {paymentPoint?.contactNumber && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                    İletişim Numarası
                  </label>
                  <div style={{ fontSize: '16px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} style={{ color: '#007bff' }} />
                    {paymentPoint.contactNumber}
                  </div>
                </div>
              )}

              {paymentPoint?.workingHours && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                    Çalışma Saatleri
                  </label>
                  <div style={{ fontSize: '16px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} style={{ color: '#007bff' }} />
                    {paymentPoint.workingHours}
                  </div>
                </div>
              )}
            </div>

            {paymentPoint?.description && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e9ecef' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Açıklama
                </label>
                <div style={{ fontSize: '16px', color: '#2c3e50', lineHeight: '1.6' }}>
                  {paymentPoint.description}
                </div>
              </div>
            )}
          </div>

          {/* Address Information */}
          <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '35px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
              <MapPin size={28} style={{ color: '#667eea' }} />
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#2c3e50' }}>Adres Bilgileri</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Şehir
                </label>
                <div style={{ fontSize: '16px', color: '#2c3e50' }}>
                  {paymentPoint?.address?.city || 'Belirtilmemiş'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  İlçe
                </label>
                <div style={{ fontSize: '16px', color: '#2c3e50' }}>
                  {paymentPoint?.address?.district || 'Belirtilmemiş'}
                </div>
              </div>

              {paymentPoint?.address?.street && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                    Sokak/Cadde
                  </label>
                  <div style={{ fontSize: '16px', color: '#2c3e50' }}>
                    {paymentPoint.address.street}
                  </div>
                </div>
              )}

              {paymentPoint?.address?.postalCode && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                    Posta Kodu
                  </label>
                  <div style={{ fontSize: '16px', color: '#2c3e50' }}>
                    {paymentPoint.address.postalCode}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                Tam Adres
              </label>
              <div style={{ fontSize: '16px', color: '#2c3e50', lineHeight: '1.6', marginBottom: '15px' }}>
                {paymentPoint?.address?.fullAddress || 'Adres bilgisi mevcut değil'}
              </div>
              
              {paymentPoint?.location && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={openInMaps}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '8px 15px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <ExternalLink size={14} />
                    Google Maps'te Aç
                  </button>
                  
                  <div style={{ 
                    background: 'white', 
                    padding: '8px 12px', 
                    borderRadius: '6px', 
                    fontSize: '12px', 
                    color: '#6c757d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    📍 {paymentPoint.location.latitude.toFixed(6)}, {paymentPoint.location.longitude.toFixed(6)}
                    {paymentPoint.distance && (
                      <span> • {paymentPoint.distance} km</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '35px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
              <CreditCard size={28} style={{ color: '#667eea' }} />
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#2c3e50' }}>Ödeme Yöntemleri</h2>
            </div>

            {paymentPoint?.paymentMethods && paymentPoint.paymentMethods.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {paymentPoint.paymentMethods.map((method, index) => (
                  <div key={index} style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '20px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    transform: 'scale(1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                  }}>
                    <div style={{ fontSize: '24px' }}>{getPaymentMethodIcon(method)}</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>
                      {getPaymentMethodLabel(method)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#6c757d', fontSize: '16px' }}>
                Ödeme yöntemi bilgisi mevcut değil
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Photos */}
          <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '30px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <ImageIcon size={24} style={{ color: '#667eea' }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>Fotoğraflar</h3>
            </div>

            {paymentPoint?.photos && paymentPoint.photos.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {paymentPoint.photos.map((photo, index) => (
                  <div key={photo.id || index} style={{ 
                    borderRadius: '8px', 
                    overflow: 'hidden', 
                    border: '1px solid #dee2e6',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    <img 
                      src={photo.url || photo.path} 
                      alt={`Fotoğraf ${index + 1}`}
                      style={{ 
                        width: '100%', 
                        height: '120px', 
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x120?text=Fotoğraf+Yüklenemedi';
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                color: '#6c757d', 
                fontSize: '14px',
                padding: '20px',
                border: '2px dashed #dee2e6',
                borderRadius: '8px'
              }}>
                <ImageIcon size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <div>Fotoğraf mevcut değil</div>
              </div>
            )}
          </div>

          {/* Meta Information */}
          <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '30px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Calendar size={24} style={{ color: '#667eea' }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>Meta Bilgiler</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6c757d', marginBottom: '4px' }}>
                  ÖDEME NOKTASI ID
                </label>
                <div style={{ fontSize: '14px', color: '#2c3e50', fontFamily: 'monospace' }}>
                  #{paymentPoint?.id}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6c757d', marginBottom: '4px' }}>
                  OLUŞTURMA TARİHİ
                </label>
                <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                  {formatDate(paymentPoint?.createdAt)}
                </div>
              </div>

              {paymentPoint?.lastUpdated && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6c757d', marginBottom: '4px' }}>
                    SON GÜNCELLEME
                  </label>
                  <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                    {formatDate(paymentPoint.lastUpdated)}
                  </div>
                </div>
              )}

              {paymentPoint?.distance !== undefined && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6c757d', marginBottom: '4px' }}>
                    MESAFE
                  </label>
                  <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                    {paymentPoint.distance} km
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default PaymentPointDetail;