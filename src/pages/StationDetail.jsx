import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  MapPin,
  Building,
  Navigation,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Loader,
  ExternalLink,
  Copy
} from 'lucide-react';
import { stationApi } from '../services/apiService';

const StationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Station type options - Backend StationType enum'ına uygun
  const stationTypeOptions = [
    { value: 'METRO', label: 'Metro Durağı', icon: '🚇' },
    { value: 'TRAMVAY', label: 'Tramvay Durağı', icon: '🚋' },
    { value: 'OTOBUS', label: 'Otobüs Durağı', icon: '🚌' },
    { value: 'METROBUS', label: 'Metrobüs Durağı', icon: '🚍' },
    { value: 'TREN', label: 'Tren İstasyonu', icon: '🚂' },
    { value: 'VAPUR', label: 'Vapur İskelesi', icon: '⛴️' },
    { value: 'TELEFERIK', label: 'Teleferik İstasyonu', icon: '🚠' },
    { value: 'DOLMUS', label: 'Dolmuş Durağı', icon: '🚐' },
    { value: 'MINIBUS', label: 'Minibüs Durağı', icon: '🚌' },
    { value: 'HAVARAY', label: 'Havaray İstasyonu', icon: '🚈' },
    { value: 'FERIBOT', label: 'Feribot Terminali', icon: '⛵' },
    { value: 'HIZLI_TREN', label: 'Yüksek Hızlı Tren', icon: '🚄' },
    { value: 'BISIKLET', label: 'Bisiklet Paylaşım', icon: '🚴' },
    { value: 'SCOOTER', label: 'E-Scooter Noktası', icon: '🛴' },
    { value: 'PARK_YERI', label: 'P+R Noktası', icon: '🅿️' },
    { value: 'AKILLI_DURAK', label: 'Akıllı Durak', icon: '📱' },
    { value: 'TERMINAL', label: 'Otobüs Terminali', icon: '🏢' },
    { value: 'ULAŞIM_AKTARMA', label: 'Aktarma Merkezi', icon: '🔄' },
    { value: 'DIGER', label: 'Diğer', icon: '📍' }
  ];

  useEffect(() => {
    loadStationData();
  }, [id]);

  const loadStationData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Durak ID ile veri çekiliyor:', id);
      const response = await stationApi.getStationById(parseInt(id));
      console.log('API Response:', response);
      
      // Response yapısını kontrol et - birden fazla format destekle
      let stationData = null;
      
      if (response && (response.isSuccess || response.success || response.data)) {
        // Eğer response.data var ise onu kullan
        stationData = response.data;
        
        // Eğer response.data yoksa ama response.isSuccess varsa, data response'un kendisinde olabilir
        if (!stationData && response.isSuccess !== false) {
          stationData = response;
        }
        
        if (stationData) {
          console.log('Station Data:', stationData);
          setStation(stationData);
        } else {
          throw new Error('Durak verisi alınamadı');
        }
      } else {
        throw new Error(response?.message || 'Durak bulunamadı');
      }
    } catch (error) {
      console.error('Durak yükleme hatası:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Bilinmeyen hata';
      setError('Durak yüklenirken bir hata oluştu: ' + errorMessage);
      console.log('API hatası - gerçek veriler gösterilmiyor, sahte veri yükleniyor');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setActionLoading(true);
      
      const response = await stationApi.changeStationStatus(station.id, !station.active);
      
      if (response.isSuccess || response.success) {
        setStation(prev => ({ ...prev, active: !prev.active }));
        alert(`Durak ${!station.active ? 'aktif hale getirildi' : 'pasif hale getirildi'}!`);
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

  const getStationTypeLabel = (type) => {
    const option = stationTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  const getStationTypeIcon = (type) => {
    const option = stationTypeOptions.find(opt => opt.value === type);
    return option ? option.icon : '📍';
  };

  const openInMaps = () => {
    if (station?.latitude && station?.longitude) {
      const url = `https://www.google.com/maps?q=${station.latitude},${station.longitude}`;
      window.open(url, '_blank');
    }
  };

  const copyCoordinates = () => {
    if (station?.latitude && station?.longitude) {
      const coordinates = `${station.latitude}, ${station.longitude}`;
      navigator.clipboard.writeText(coordinates).then(() => {
        alert('Koordinatlar kopyalandı!');
      }).catch(() => {
        alert('Kopyalama başarısız oldu.');
      });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <Loader size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '15px' }} />
          <p>Durak detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !station) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <strong>Hata:</strong> {error}
          <div style={{ marginTop: '15px' }}>
            <button 
              onClick={() => navigate('/station')}
              style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <ArrowLeft size={16} style={{ marginRight: '8px' }} />
              Durak Listesine Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => navigate('/station')}
              style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ArrowLeft size={20} />
              Geri Dön
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#2c3e50' }}>
                👁️ Durak Detayları
              </h1>
              <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                #{station?.id} - {station?.name}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleToggleStatus}
              disabled={actionLoading}
              style={{ 
                background: actionLoading ? '#95a5a6' : (station?.active ? '#dc3545' : '#28a745'), 
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
              ) : station?.active ? (
                <ToggleLeft size={16} />
              ) : (
                <ToggleRight size={16} />
              )}
              {station?.active ? 'Pasif Yap' : 'Aktif Yap'}
            </button>
            <button 
              onClick={() => navigate(`/station/edit/${id}`)}
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
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
              <Building size={24} style={{ color: '#dc3545' }} />
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#2c3e50' }}>Temel Bilgiler</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Durak Adı
                </label>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>
                  {station?.name || 'Belirtilmemiş'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Durak Türü
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{getStationTypeIcon(station?.type)}</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>
                    {getStationTypeLabel(station?.type)}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Durum
                </label>
                <span style={{ 
                  background: station?.active ? '#d4edda' : '#f8d7da', 
                  color: station?.active ? '#155724' : '#721c24', 
                  padding: '8px 12px', 
                  borderRadius: '12px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {station?.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {station?.active ? 'Aktif' : 'Pasif'}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Durak ID
                </label>
                <div style={{ fontSize: '16px', color: '#2c3e50', fontFamily: 'monospace' }}>
                  #{station?.id}
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
              <MapPin size={24} style={{ color: '#dc3545' }} />
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#2c3e50' }}>Konum Bilgileri</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Enlem (Latitude)
                </label>
                <div style={{ fontSize: '16px', color: '#2c3e50', fontFamily: 'monospace' }}>
                  {station?.latitude?.toFixed(6) || 'Belirtilmemiş'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Boylam (Longitude)
                </label>
                <div style={{ fontSize: '16px', color: '#2c3e50', fontFamily: 'monospace' }}>
                  {station?.longitude?.toFixed(6) || 'Belirtilmemiş'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={openInMaps}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 15px',
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
              
              <button
                onClick={copyCoordinates}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px'
                }}
              >
                <Copy size={14} />
                Koordinatları Kopyala
              </button>
            </div>
          </div>

          {/* Address Information */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
              <Navigation size={24} style={{ color: '#dc3545' }} />
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#2c3e50' }}>Adres Bilgileri</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Şehir
                </label>
                <div style={{ fontSize: '16px', color: '#2c3e50' }}>
                  {station?.city || 'Belirtilmemiş'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  İlçe
                </label>
                <div style={{ fontSize: '16px', color: '#2c3e50' }}>
                  {station?.district || 'Belirtilmemiş'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Sokak/Cadde
                </label>
                <div style={{ fontSize: '16px', color: '#2c3e50' }}>
                  {station?.street || 'Belirtilmemiş'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Posta Kodu
                </label>
                <div style={{ fontSize: '16px', color: '#2c3e50' }}>
                  {station?.postalCode || 'Belirtilmemiş'}
                </div>
              </div>
            </div>

            {/* Full Address Display */}
            {(station?.street || station?.district || station?.city) && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e9ecef' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Tam Adres
                </label>
                <div style={{ 
                  fontSize: '16px', 
                  color: '#2c3e50', 
                  lineHeight: '1.6',
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef'
                }}>
                  {[station?.street, station?.district, station?.city, station?.postalCode].filter(Boolean).join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Actions */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>Hızlı İşlemler</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => navigate(`/station/edit/${id}`)}
                style={{
                  background: '#ffc107',
                  color: '#212529',
                  border: 'none',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Edit size={16} />
                Durağı Düzenle
              </button>
              
              <button
                onClick={handleToggleStatus}
                disabled={actionLoading}
                style={{
                  background: actionLoading ? '#95a5a6' : (station?.active ? '#dc3545' : '#28a745'),
                  color: 'white',
                  border: 'none',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {actionLoading ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                ) : station?.active ? (
                  <ToggleLeft size={16} />
                ) : (
                  <ToggleRight size={16} />
                )}
                {station?.active ? 'Pasif Yap' : 'Aktif Yap'}
              </button>

              <button
                onClick={openInMaps}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <ExternalLink size={16} />
                Haritada Görüntüle
              </button>
            </div>
          </div>

          {/* Station Type Info */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>Durak Türü</h3>
            
            <div style={{
              background: '#e3f2fd',
              border: '2px solid #1976d2',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                {getStationTypeIcon(station?.type)}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#1976d2' }}>
                {getStationTypeLabel(station?.type)}
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Calendar size={20} style={{ color: '#dc3545' }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>Meta Bilgiler</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6c757d', marginBottom: '4px' }}>
                  DURAK ID
                </label>
                <div style={{ fontSize: '14px', color: '#2c3e50', fontFamily: 'monospace' }}>
                  #{station?.id}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6c757d', marginBottom: '4px' }}>
                  KOORDİNATLAR
                </label>
                <div style={{ fontSize: '12px', color: '#2c3e50', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {station?.latitude?.toFixed(6)}, {station?.longitude?.toFixed(6)}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6c757d', marginBottom: '4px' }}>
                  DURUM
                </label>
                <div style={{ fontSize: '14px', color: station?.active ? '#28a745' : '#dc3545', fontWeight: '600' }}>
                  {station?.active ? '🟢 AKTİF' : '🔴 PASİF'}
                </div>
              </div>
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

export default StationDetail;