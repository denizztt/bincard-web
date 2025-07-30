import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stationApi } from '../services/apiService';
import { StationType, StationStatus, getStationTypeDisplayName, getStationStatusDisplayName } from '../types';
import '../styles/StationList.css';

const StationList = () => {
  const navigate = useNavigate();
  
  // State management
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and filter states
  const [filters, setFilters] = useState({
    name: '',
    type: 'Tümü',
    city: 'Tümü',
    district: 'Tümü',
    status: 'Tümü',
    radius: 0,
    coordinates: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalResults, setTotalResults] = useState(0);

  // Available cities and districts for filtering
  const [cities] = useState(['Tümü', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya']);
  const [districts, setDistricts] = useState(['Tümü']);

  // Load stations data
  useEffect(() => {
    loadStations();
  }, [currentPage]);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [stations, filters]);

  // Update districts when city changes
  useEffect(() => {
    updateDistrictFilter();
  }, [filters.city]);

  const loadStations = async () => {
    try {
      setLoading(true);
      // Note: Using a mock response since the API might not be fully implemented
      // In production, this would be: const response = await stationApi.getAllStations();
      
      // Mock data for demonstration
      const mockStations = [
        {
          id: 1,
          name: "Taksim Meydanı Durağı",
          type: "METRO",
          status: "ACTIVE",
          location: { latitude: 41.0369, longitude: 28.9851 },
          address: { city: "İstanbul", district: "Beyoğlu", street: "Taksim Meydanı", fullAddress: "Taksim Meydanı, Beyoğlu, İstanbul" },
          description: "Ana metro transfer noktası"
        },
        {
          id: 2,
          name: "Kadıköy İskele Durağı",
          type: "VAPUR",
          status: "ACTIVE",
          location: { latitude: 40.9996, longitude: 29.0277 },
          address: { city: "İstanbul", district: "Kadıköy", street: "İskele Caddesi", fullAddress: "İskele Caddesi, Kadıköy, İstanbul" },
          description: "Vapur iskele durağı"
        },
        {
          id: 3,
          name: "Mecidiyeköy Metrobüs Durağı",
          type: "METROBUS",
          status: "ACTIVE",
          location: { latitude: 41.0631, longitude: 28.9897 },
          address: { city: "İstanbul", district: "Şişli", street: "Büyükdere Caddesi", fullAddress: "Büyükdere Caddesi, Şişli, İstanbul" },
          description: "Metrobüs hattı durağı"
        },
        {
          id: 4,
          name: "Kızılay Metro Durağı",
          type: "METRO",
          status: "INACTIVE",
          location: { latitude: 39.9208, longitude: 32.8541 },
          address: { city: "Ankara", district: "Çankaya", street: "Kızılay Meydanı", fullAddress: "Kızılay Meydanı, Çankaya, Ankara" },
          description: "Merkezi metro durağı - bakımda"
        }
      ];
      
      setStations(mockStations);
      setTotalResults(mockStations.length);
      setError('');
    } catch (err) {
      console.error('Station loading failed:', err);
      setError('Duraklar yüklenirken hata oluştu: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...stations];
    
    // Name filter
    if (filters.name.trim()) {
      const searchTerm = filters.name.toLowerCase();
      filtered = filtered.filter(station => 
        station.name.toLowerCase().includes(searchTerm) ||
        station.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Type filter
    if (filters.type !== 'Tümü') {
      filtered = filtered.filter(station => station.type === filters.type);
    }
    
    // City filter
    if (filters.city !== 'Tümü') {
      filtered = filtered.filter(station => station.address.city === filters.city);
    }
    
    // District filter
    if (filters.district !== 'Tümü') {
      filtered = filtered.filter(station => station.address.district === filters.district);
    }
    
    // Status filter
    if (filters.status !== 'Tümü') {
      filtered = filtered.filter(station => station.status === filters.status);
    }
    
    // Radius filter (if coordinates provided)
    if (filters.radius > 0 && filters.coordinates.trim()) {
      try {
        const [centerLat, centerLng] = filters.coordinates.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(centerLat) && !isNaN(centerLng)) {
          filtered = filtered.filter(station => {
            const distance = calculateDistance(
              centerLat, centerLng,
              station.location.latitude, station.location.longitude
            );
            return distance <= filters.radius;
          });
        }
      } catch (e) {
        console.error('Invalid coordinates format:', e);
      }
    }
    
    setFilteredStations(filtered);
    setTotalResults(filtered.length);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const updateDistrictFilter = () => {
    let newDistricts = ['Tümü'];
    
    switch (filters.city) {
      case 'İstanbul':
        newDistricts.push('Beyoğlu', 'Kadıköy', 'Üsküdar', 'Fatih', 'Beşiktaş', 
                          'Şişli', 'Bakırköy', 'Maltepe', 'Pendik', 'Ataşehir');
        break;
      case 'Ankara':
        newDistricts.push('Çankaya', 'Keçiören', 'Mamak', 'Sincan', 'Altındağ');
        break;
      case 'İzmir':
        newDistricts.push('Konak', 'Bornova', 'Karşıyaka', 'Alsancak', 'Buca');
        break;
    }
    
    setDistricts(newDistricts);
    if (filters.district !== 'Tümü' && !newDistricts.includes(filters.district)) {
      setFilters(prev => ({ ...prev, district: 'Tümü' }));
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const performQuickSearch = (searchType) => {
    switch (searchType) {
      case 'METRO':
        setFilters(prev => ({ ...prev, type: 'METRO' }));
        break;
      case 'OTOBUS':
        setFilters(prev => ({ ...prev, type: 'OTOBUS' }));
        break;
      case 'VAPUR':
        setFilters(prev => ({ ...prev, type: 'VAPUR' }));
        break;
      case 'ACTIVE_ONLY':
        setFilters(prev => ({ ...prev, status: 'ACTIVE' }));
        break;
      case 'ISTANBUL':
        setFilters(prev => ({ ...prev, city: 'İstanbul' }));
        break;
    }
  };

  const clearAllFilters = () => {
    setFilters({
      name: '',
      type: 'Tümü',
      city: 'Tümü',
      district: 'Tümü',
      status: 'Tümü',
      radius: 0,
      coordinates: ''
    });
  };

  const handleViewDetails = (station) => {
    // Show detailed information in a modal or navigate to detail page
    alert(`Durak Detayları:\n\nID: ${station.id}\nAdı: ${station.name}\nTip: ${getStationTypeDisplayName(station.type)}\nDurum: ${getStationStatusDisplayName(station.status)}\nKonum: ${station.address.fullAddress}\nKoordinat: ${station.location.latitude.toFixed(4)}, ${station.location.longitude.toFixed(4)}`);
  };

  const handleShowOnMap = (station) => {
    // Open Google Maps with the station location
    const mapsUrl = `https://www.google.com/maps?q=${station.location.latitude},${station.location.longitude}`;
    window.open(mapsUrl, '_blank');
  };

  const handleEditStation = (station) => {
    navigate(`/station/edit/${station.id}`, { state: { station } });
  };

  const handleDeleteStation = async (station) => {
    if (window.confirm(`"${station.name}" durağını silmek istediğinizden emin misiniz?`)) {
      try {
        // await stationApi.deleteStation(station.id);
        setStations(prev => prev.filter(s => s.id !== station.id));
        console.log('Station deleted:', station.id);
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Durak silme işlemi başarısız: ' + err.message);
      }
    }
  };

  const formatCoordinates = (latitude, longitude) => {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  };

  if (loading) {
    return (
      <div className="station-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Duraklar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="station-list-container">
      <div className="station-list-header">
        <div className="header-top">
          <h1 className="page-title">🚌 Durak Yönetimi</h1>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/station/add')}
              className="btn btn-primary"
            >
              ➕ Yeni Durak
            </button>
            <button 
              onClick={() => navigate('/station/map')}
              className="btn btn-secondary"
            >
              🗺️ Harita Görünümü
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="filters-section">
          {/* Main Search */}
          <div className="search-row">
            <div className="search-group">
              <label>Durak Adı:</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="Durak adı veya anahtar kelime..."
              />
            </div>
          </div>

          {/* Filter Row 1 */}
          <div className="filter-row">
            <div className="filter-group">
              <label>Durak Tipi:</label>
              <select 
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="Tümü">Tümü</option>
                {Object.values(StationType).map(type => (
                  <option key={type} value={type}>{getStationTypeDisplayName(type)}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Şehir:</label>
              <select 
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>İlçe:</label>
              <select 
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
              >
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Durum:</label>
              <select 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="Tümü">Tümü</option>
                {Object.values(StationStatus).map(status => (
                  <option key={status} value={status}>{getStationStatusDisplayName(status)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Row 2 - Location */}
          <div className="filter-row">
            <div className="filter-group">
              <label>Merkez Koordinat (Lat, Lng):</label>
              <input
                type="text"
                value={filters.coordinates}
                onChange={(e) => handleFilterChange('coordinates', e.target.value)}
                placeholder="41.0082, 28.9784"
              />
            </div>

            <div className="filter-group">
              <label>Yarıçap (km): {filters.radius === 0 ? 'Kapalı' : `${filters.radius} km`}</label>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={filters.radius}
                onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Quick Search Buttons */}
          <div className="quick-search-section">
            <label>⚡ Hızlı Arama:</label>
            <div className="quick-buttons">
              <button onClick={() => performQuickSearch('METRO')} className="btn btn-quick">🚇 Metro</button>
              <button onClick={() => performQuickSearch('OTOBUS')} className="btn btn-quick">🚌 Otobüs</button>
              <button onClick={() => performQuickSearch('VAPUR')} className="btn btn-quick">⛴️ Vapur</button>
              <button onClick={() => performQuickSearch('ACTIVE_ONLY')} className="btn btn-quick">🟢 Aktif</button>
              <button onClick={() => performQuickSearch('ISTANBUL')} className="btn btn-quick">🏙️ İstanbul</button>
              <button onClick={clearAllFilters} className="btn btn-clear">🗑️ Temizle</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <span>Toplam: {stations.length} durak</span>
          <span>Gösterilen: {filteredStations.length} durak</span>
          {error && <span className="error-message">{error}</span>}
        </div>
      </div>

      {/* Stations Table */}
      <div className="station-table-container">
        <table className="station-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Durak Adı</th>
              <th>Tip</th>
              <th>Konum</th>
              <th>Koordinatlar</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredStations.map((station) => (
              <tr key={station.id}>
                <td>{station.id}</td>
                <td className="station-name-cell">
                  <div className="station-info">
                    <h4>{station.name}</h4>
                    {station.description && (
                      <p className="station-description">{station.description}</p>
                    )}
                  </div>
                </td>
                <td>
                  <span className="type-badge">
                    {getStationTypeDisplayName(station.type)}
                  </span>
                </td>
                <td className="location-cell">
                  <div className="location-info">
                    <div>{station.address.district}, {station.address.city}</div>
                    <div className="street-info">{station.address.street}</div>
                  </div>
                </td>
                <td className="coordinates-cell">
                  {formatCoordinates(station.location.latitude, station.location.longitude)}
                </td>
                <td>
                  <span 
                    className={`status-badge ${station.status.toLowerCase()}`}
                  >
                    {getStationStatusDisplayName(station.status)}
                  </span>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleViewDetails(station)}
                      className="btn btn-view"
                      title="Detayları Görüntüle"
                    >
                      👁️
                    </button>
                    <button 
                      onClick={() => handleShowOnMap(station)}
                      className="btn btn-map"
                      title="Haritada Göster"
                    >
                      🗺️
                    </button>
                    <button 
                      onClick={() => handleEditStation(station)}
                      className="btn btn-edit"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteStation(station)}
                      className="btn btn-delete"
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStations.length === 0 && !loading && (
          <div className="no-data">
            <p>Gösterilecek durak bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationList; 