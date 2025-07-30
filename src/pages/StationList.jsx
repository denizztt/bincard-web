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
  MapPin,
  Filter,
  ExternalLink
} from 'lucide-react';
import { stationApi } from '../services/apiService';
import { config } from '../config/config';

const StationList = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [searchMode, setSearchMode] = useState('location'); // 'location' or 'name'

  // Default location (Istanbul center for location-based search)
  const [searchLocation, setSearchLocation] = useState({
    latitude: config.googleMaps.defaultCenter.lat,
    longitude: config.googleMaps.defaultCenter.lng
  });

  // Filter states
  const [filters, setFilters] = useState({
    type: 'ALL'
  });

  // Station type options - Backend StationType enum'ına uygun
  const stationTypeOptions = [
    { value: 'ALL', label: 'Tüm Türler', icon: '📍' },
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
    if (searchMode === 'location') {
      loadStationsByLocation();
    }
  }, [currentPage, pageSize, filters.type, searchLocation, searchMode]);

  useEffect(() => {
    if (searchMode === 'name' && searchTerm.trim()) {
      const delayedSearch = setTimeout(() => {
        loadStationsByName();
      }, 500); // Debounce search

      return () => clearTimeout(delayedSearch);
    } else if (searchMode === 'name' && !searchTerm.trim()) {
      setStations([]);
      setTotalPages(0);
      setTotalElements(0);
    }
  }, [searchTerm, currentPage, pageSize, searchMode]);

  const loadStationsByLocation = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await stationApi.getAllStations(
        searchLocation.latitude,
        searchLocation.longitude,
        filters.type,
        currentPage,
        pageSize
      );
      
      if (response.isSuccess || response.success) {
        const data = response.data;
        
        if (data.content) {
          setStations(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
        } else if (Array.isArray(data)) {
          setStations(data);
          setTotalPages(1);
          setTotalElements(data.length);
        } else {
          setStations([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } else {
        throw new Error(response.message || 'Duraklar yüklenemedi');
      }
    } catch (error) {
      console.error('Duraklar yükleme hatası:', error);
      setError('Duraklar yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      
      // Show sample data in case of error
      setStations([
        {
          id: 1,
          name: 'Taksim Meydanı',
          latitude: 41.0369,
          longitude: 28.9850,
          type: 'METRO_STATION',
          city: 'İstanbul',
          district: 'Beyoğlu',
          street: 'Cumhuriyet Caddesi',
          postalCode: '34437',
          active: true
        },
        {
          id: 2,
          name: 'Kadıköy İskelesi',
          latitude: 40.9061,
          longitude: 29.0250,
          type: 'FERRY_TERMINAL',
          city: 'İstanbul',
          district: 'Kadıköy',
          street: 'Rıhtım Caddesi',
          postalCode: '34710',
          active: true
        }
      ]);
      setTotalPages(1);
      setTotalElements(2);
    } finally {
      setLoading(false);
    }
  };

  const loadStationsByName = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await stationApi.searchStationsByName(searchTerm, currentPage, pageSize);
      
      if (response.isSuccess || response.success) {
        const data = response.data;
        
        if (data.content) {
          setStations(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
        } else if (Array.isArray(data)) {
          setStations(data);
          setTotalPages(1);
          setTotalElements(data.length);
        } else {
          setStations([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } else {
        throw new Error(response.message || 'Arama sonucu bulunamadı');
      }
    } catch (error) {
      console.error('Durak arama hatası:', error);
      setError('Durak ararken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      setStations([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      
      const response = await stationApi.changeStationStatus(id, !currentStatus);
      
      if (response.isSuccess || response.success) {
        setStations(prev => 
          prev.map(station => 
            station.id === id 
              ? { ...station, active: !currentStatus }
              : station
          )
        );
        alert(`Durak ${!currentStatus ? 'aktif hale getirildi' : 'pasif hale getirildi'}!`);
      } else {
        throw new Error(response.message || 'Durum güncellenemedi');
      }
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      alert('Durum güncellenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" durağını silmek istediğinizden emin misiniz?`)) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      
      const response = await stationApi.deleteStation(id);
      
      if (response.isSuccess || response.success) {
        setStations(prev => prev.filter(station => station.id !== id));
        setTotalElements(prev => prev - 1);
        alert('Durak başarıyla silindi!');
      } else {
        throw new Error(response.message || 'Durak silinemedi');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Durak silinirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
    setCurrentPage(0);
    if (mode === 'location') {
      setSearchTerm('');
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

  const openInMaps = (station) => {
    const url = `https://www.google.com/maps?q=${station.latitude},${station.longitude}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #dc3545', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p>Duraklar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '25px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ArrowLeft size={20} />
              Dashboard
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#2c3e50' }}>🚇 Duraklar</h1>
              <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                {searchMode === 'location' 
                  ? `Konum bazlı: ${totalElements} durak` 
                  : `Arama sonucu: ${totalElements} durak`}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => searchMode === 'location' ? loadStationsByLocation() : loadStationsByName()}
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

      {/* Search and Filters */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        {/* Search Mode Toggle */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button
              onClick={() => handleSearchModeChange('location')}
              style={{
                background: searchMode === 'location' ? '#dc3545' : '#f8f9fa',
                color: searchMode === 'location' ? 'white' : '#6c757d',
                border: '1px solid #dee2e6',
                padding: '8px 15px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px'
              }}
            >
              <MapPin size={14} />
              Konum Bazlı
            </button>
            <button
              onClick={() => handleSearchModeChange('name')}
              style={{
                background: searchMode === 'name' ? '#dc3545' : '#f8f9fa',
                color: searchMode === 'name' ? 'white' : '#6c757d',
                border: '1px solid #dee2e6',
                padding: '8px 15px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px'
              }}
            >
              <Search size={14} />
              İsim Bazlı
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
          {/* Search Input */}
          {searchMode === 'name' && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
                Durak Adı Ara
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Durak adı girin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>
          )}

          {/* Location Inputs */}
          {searchMode === 'location' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
                  Enlem (Latitude)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={searchLocation.latitude}
                  onChange={(e) => setSearchLocation(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
                  Boylam (Longitude)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={searchLocation.longitude}
                  onChange={(e) => setSearchLocation(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </>
          )}

          {/* Station Type Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
              Durak Türü
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', background: 'white' }}
            >
              {stationTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Page Size */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#34495e', marginBottom: '8px' }}>
              Sayfa Boyutu
            </label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value))}
              style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', background: 'white' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600', color: '#2c3e50', minWidth: '200px' }}>Durak Adı</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600', color: '#2c3e50', minWidth: '120px' }}>Tür</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600', color: '#2c3e50', minWidth: '200px' }}>Konum</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600', color: '#2c3e50', minWidth: '180px' }}>Adres</th>
                <th style={{ padding: '15px 12px', textAlign: 'left', fontWeight: '600', color: '#2c3e50', minWidth: '100px' }}>Durum</th>
                <th style={{ padding: '15px 12px', textAlign: 'center', fontWeight: '600', color: '#2c3e50', minWidth: '200px' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {stations.length > 0 ? (
                stations.map((station) => (
                  <tr key={station.id} style={{ borderBottom: '1px solid #f1f3f4', '&:hover': { background: '#f8f9fa' } }}>
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
                      <span style={{ 
                        background: '#e3f2fd', 
                        color: '#1976d2', 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>{getStationTypeIcon(station.type)}</span>
                        {getStationTypeLabel(station.type)}
                      </span>
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ fontSize: '12px', color: '#6c757d', fontFamily: 'monospace' }}>
                        📍 {station.latitude?.toFixed(4)}, {station.longitude?.toFixed(4)}
                      </div>
                      <button
                        onClick={() => openInMaps(station)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#007bff',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '2px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '4px'
                        }}
                      >
                        <ExternalLink size={12} />
                        Haritada Aç
                      </button>
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ color: '#6c757d', fontSize: '14px' }}>
                        {station.district && station.city && (
                          <div>{station.district}, {station.city}</div>
                        )}
                        {station.street && (
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>{station.street}</div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleToggleStatus(station.id, station.active)}
                          disabled={actionLoading[station.id]}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: actionLoading[station.id] ? 'not-allowed' : 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title={station.active ? 'Pasif hale getir' : 'Aktif hale getir'}
                        >
                          {actionLoading[station.id] ? (
                            <div style={{ width: '20px', height: '20px', border: '2px solid #f3f3f3', borderTop: '2px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                          ) : station.active ? (
                            <ToggleRight size={20} style={{ color: '#28a745' }} />
                          ) : (
                            <ToggleLeft size={20} style={{ color: '#6c757d' }} />
                          )}
                        </button>
                        <span style={{ 
                          background: station.active ? '#d4edda' : '#f8d7da', 
                          color: station.active ? '#155724' : '#721c24', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          fontWeight: '600' 
                        }}>
                          {station.active ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => navigate(`/station/detail/${station.id}`)}
                          style={{ 
                            background: '#007bff', 
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
                          title="Detayları Görüntüle"
                        >
                          <Eye size={12} />
                          Detay
                        </button>
                        <button 
                          onClick={() => navigate(`/station/edit/${station.id}`)}
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
                          title="Düzenle"
                        >
                          <Edit size={12} />
                          Düzenle
                        </button>
                        <button 
                          onClick={() => handleDelete(station.id, station.name)}
                          disabled={actionLoading[station.id]}
                          style={{ 
                            background: actionLoading[station.id] ? '#95a5a6' : '#dc3545', 
                            color: 'white', 
                            border: 'none', 
                            padding: '6px 10px', 
                            borderRadius: '6px', 
                            cursor: actionLoading[station.id] ? 'not-allowed' : 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            fontSize: '12px'
                          }}
                          title="Sil"
                        >
                          {actionLoading[station.id] ? (
                            <div style={{ width: '12px', height: '12px', border: '2px solid transparent', borderTop: '2px solid currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                          ) : (
                            <Trash2 size={12} />
                          )}
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <Navigation size={48} style={{ color: '#cbd5e1', marginBottom: '15px' }} />
                    <p style={{ color: '#6c757d', fontSize: '16px', margin: 0 }}>
                      {searchMode === 'name' && !searchTerm.trim()
                        ? 'Aramak için durak adı girin'
                        : 'Durak bulunamadı'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '20px', borderTop: '1px solid #f1f3f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#6c757d', fontSize: '14px' }}>
              Sayfa {currentPage + 1} / {totalPages} - Toplam {totalElements} kayıt
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  background: currentPage === 0 ? '#f8f9fa' : 'white',
                  color: currentPage === 0 ? '#6c757d' : '#007bff',
                  borderRadius: '4px',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                İlk
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  background: currentPage === 0 ? '#f8f9fa' : 'white',
                  color: currentPage === 0 ? '#6c757d' : '#007bff',
                  borderRadius: '4px',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Önceki
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 3) {
                  pageNum = i;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #dee2e6',
                      background: currentPage === pageNum ? '#dc3545' : 'white',
                      color: currentPage === pageNum ? 'white' : '#007bff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: currentPage === pageNum ? '600' : '400'
                    }}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  background: currentPage === totalPages - 1 ? '#f8f9fa' : 'white',
                  color: currentPage === totalPages - 1 ? '#6c757d' : '#007bff',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Sonraki
              </button>
              <button
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage === totalPages - 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  background: currentPage === totalPages - 1 ? '#f8f9fa' : 'white',
                  color: currentPage === totalPages - 1 ? '#6c757d' : '#007bff',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Son
              </button>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          table tbody tr:hover {
            background-color: #f8f9fa !important;
          }
        `}
      </style>
    </div>
  );
};

export default StationList;