import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Bus,
  Route as RouteIcon,
  User,
  ToggleLeft,
  ToggleRight,
  Loader,
  MapPin,
  Clock,
  Users,
  CreditCard
} from 'lucide-react';
import { busApi } from '../services/apiService';
import { getBusStatusLabel, getBusStatusIcon } from '../constants/busTypes';

const BusDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadBusData();
    }
  }, [id]);

  const loadBusData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await busApi.getBusById(parseInt(id));
      
      if (response && (response.isSuccess || response.success)) {
        setBus(response.data);
      } else {
        throw new Error(response?.message || 'Otobüs bilgileri yüklenemedi');
      }
    } catch (error) {
      console.error('Otobüs yükleme hatası:', error);
      setError('Otobüs bilgileri yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setActionLoading(true);
      
      const response = await busApi.toggleActiveStatus(bus.id);
      
      if (response.isSuccess || response.success) {
        setBus(prev => ({ ...prev, isActive: !prev.isActive }));
        alert(`Otobüs ${!bus.isActive ? 'aktif hale getirildi' : 'pasif hale getirildi'}!`);
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

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <Loader size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '15px' }} />
          <p>Otobüs detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !bus) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <strong>Hata:</strong> {error}
          <div style={{ marginTop: '15px' }}>
            <button 
              onClick={() => navigate('/bus')}
              style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <ArrowLeft size={16} style={{ marginRight: '8px' }} />
              Otobüs Listesine Dön
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
              onClick={() => navigate('/bus')}
              style={{ background: 'transparent', color: '#6c757d', border: '1px solid #6c757d', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ArrowLeft size={20} />
              Geri Dön
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#2c3e50' }}>
                <Bus size={28} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                Otobüs Detayları
              </h1>
              <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                #{bus?.id} - {bus?.numberPlate}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleToggleStatus}
              disabled={actionLoading}
              style={{ 
                background: 'transparent', 
                color: bus?.isActive ? '#dc3545' : '#28a745', 
                border: `1px solid ${bus?.isActive ? '#dc3545' : '#28a745'}`, 
                padding: '10px 15px', 
                borderRadius: '8px', 
                cursor: actionLoading ? 'not-allowed' : 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                opacity: actionLoading ? 0.6 : 1
              }}
            >
              {actionLoading ? (
                <div style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              ) : bus?.isActive ? (
                <ToggleLeft size={16} />
              ) : (
                <ToggleRight size={16} />
              )}
              {bus?.isActive ? 'Pasif Yap' : 'Aktif Yap'}
            </button>
            <button 
              onClick={() => navigate(`/bus/${id}/edit`)}
              style={{ background: 'transparent', color: '#6c757d', border: '1px solid #6c757d', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
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
              <Bus size={28} style={{ color: '#667eea' }} />
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#2c3e50' }}>Temel Bilgiler</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Plaka Numarası
                </label>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>
                  {bus?.numberPlate || 'Belirtilmemiş'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Durum
                </label>
                <span style={{ 
                  background: 'white', 
                  color: '#374151', 
                  padding: '6px 12px', 
                  borderRadius: '12px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid #e9ecef'
                }}>
                  {getBusStatusIcon(bus?.status)}
                  {getBusStatusLabel(bus?.status)}
                </span>
              </div>

              {bus?.baseFare && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                    Ücret
                  </label>
                  <div style={{ fontSize: '16px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={16} style={{ color: '#007bff' }} />
                    {bus.baseFare} ₺
                  </div>
                </div>
              )}

              {bus?.capacity && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                    Kapasite
                  </label>
                  <div style={{ fontSize: '16px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} style={{ color: '#007bff' }} />
                    {bus.capacity} kişi
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Information */}
          <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '35px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
              <RouteIcon size={28} style={{ color: '#667eea' }} />
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#2c3e50' }}>Atama Bilgileri</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Rota
                </label>
                <div style={{ fontSize: '16px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RouteIcon size={16} style={{ color: '#007bff' }} />
                  {bus?.assignedRouteName || 'Atanmamış'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6c757d', marginBottom: '8px' }}>
                  Şoför
                </label>
                <div style={{ fontSize: '16px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} style={{ color: '#007bff' }} />
                  {bus?.driverName || 'Atanmamış'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Meta Information */}
          <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '30px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Clock size={24} style={{ color: '#667eea' }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>Meta Bilgiler</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6c757d', marginBottom: '4px' }}>
                  OTOBÜS ID
                </label>
                <div style={{ fontSize: '14px', color: '#2c3e50', fontFamily: 'monospace' }}>
                  #{bus?.id}
                </div>
              </div>

              {bus?.createdAt && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6c757d', marginBottom: '4px' }}>
                    OLUŞTURMA TARİHİ
                  </label>
                  <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                    {formatDate(bus.createdAt)}
                  </div>
                </div>
              )}

              {bus?.lastLocationUpdate && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6c757d', marginBottom: '4px' }}>
                    SON KONUM GÜNCELLEMESİ
                  </label>
                  <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                    {formatDate(bus.lastLocationUpdate)}
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

export default BusDetail;

