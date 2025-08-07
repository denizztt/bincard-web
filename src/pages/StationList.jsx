import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Navigation,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  ToggleLeft,
  ToggleRight,
  ExternalLink
} from 'lucide-react';
import { stationApi } from '../services/apiService';

const StationList = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadAllStations();
  }, []);

  const loadAllStations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await stationApi.getAllStations(0, 100);
      
      if (response && (response.isSuccess || response.success)) {
        const data = response.data;
        setStations(Array.isArray(data) ? data : data.content || []);
      } else {
        throw new Error(response?.message || 'Duraklar yüklenemedi');
      }
    } catch (error) {
      console.error('Duraklar yükleme hatası:', error);
      setError('Duraklar yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStations = stations.filter(station =>
    station.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (station) => {
    navigate(`/station/detail/${station.id}`);
  };

  const handleEdit = (station) => {
    navigate(`/station/edit/${station.id}`);
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => navigate(-1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
            >
              <ArrowLeft size={24} color="#dc3545" />
            </button>
            <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '28px', fontWeight: '700' }}>
              Durak Yönetimi
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={loadAllStations}
              style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} />
              Yenile
            </button>
            <button 
              onClick={() => navigate('/station/add')}
              style={{ background: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} />
              Yeni Durak Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>
          <strong>Uyarı:</strong> {error}
        </div>
      )}

      {/* Search */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
          <input
            type="text"
            placeholder="Durak adı ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 40px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600', color: '#2c3e50' }}>Durak Adı</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600', color: '#2c3e50' }}>Konum</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600', color: '#2c3e50' }}>Durum</th>
                <th style={{ padding: '15px 12px', textAlign: 'center', fontWeight: '600', color: '#2c3e50' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredStations.length > 0 ? (
                filteredStations.map((station) => (
                  <tr key={station.id} style={{ borderBottom: '1px solid #f1f3f4' }}>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Navigation size={16} style={{ color: station.active ? '#dc3545' : '#6c757d' }} />
                        <div>
                          <div style={{ fontWeight: '600', color: '#2c3e50' }}>{station.name}</div>
                          <div style={{ fontSize: '12px', color: '#6c757d' }}>#{station.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ fontSize: '12px', color: '#6c757d', fontFamily: 'monospace' }}>
                        📍 {station.latitude?.toFixed(4)}, {station.longitude?.toFixed(4)}
                      </div>
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <span style={{
                        background: station.active ? '#d4edda' : '#f8d7da',
                        color: station.active ? '#155724' : '#721c24',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {station.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleView(station)}
                          style={{
                            background: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px'
                          }}
                        >
                          <Eye size={14} />
                          Görüntüle
                        </button>
                        <button
                          onClick={() => handleEdit(station)}
                          style={{
                            background: '#ffc107',
                            color: '#212529',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px'
                          }}
                        >
                          <Edit size={14} />
                          Düzenle
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                    {loading ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                        Duraklar yükleniyor...
                      </div>
                    ) : (
                      <div>
                        <Navigation size={48} style={{ color: '#dee2e6', marginBottom: '10px' }} />
                        <div>Henüz durak bulunmuyor</div>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StationList;