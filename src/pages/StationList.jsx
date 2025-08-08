import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  ToggleLeft,
  ToggleRight,
  Filter,
  ChevronLeft,
  ChevronRight,
  MapPin,
  X
} from 'lucide-react';
import { stationApi } from '../services/apiService';
import { STATION_TYPES, getStationTypeLabel, getStationTypeIcon } from '../constants/stationTypes';
import '../styles/StationList.css';

const StationList = () => {
  const navigate = useNavigate();
  
  // State management
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeywords, setSearchKeywords] = useState([]);
  const [showKeywords, setShowKeywords] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    type: 'ALL'
  });

  // Search mode: 'all' | 'search'
  const [searchMode, setSearchMode] = useState('all');

  // Load stations on component mount and when dependencies change
  useEffect(() => {
    if (searchTerm.trim()) {
      setSearchMode('search');
      const delayedSearch = setTimeout(() => {
        loadStationsByName();
      }, 500); // Debounce search

      return () => clearTimeout(delayedSearch);
    } else {
      setSearchMode('all');
      loadAllStations();
    }
  }, [searchTerm, currentPage, pageSize, filters.type]);

  // Load all stations with pagination and filtering
  const loadAllStations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await stationApi.getAllStations(
        null, // latitude
        null, // longitude  
        filters.type === 'ALL' ? null : filters.type, // type
        currentPage, // page
        pageSize // size
      );
      
      if (response && (response.isSuccess || response.success)) {
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

  // Search stations by name
  const loadStationsByName = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await stationApi.searchStationsByName(searchTerm, currentPage, pageSize);
      
      if (response && (response.isSuccess || response.success)) {
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
        throw new Error(response?.message || 'Arama sonucu bulunamadı');
      }
    } catch (error) {
      console.error('Arama hatası:', error);
      setError('Arama sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  // Search keywords autocomplete
  const searchKeywordsApi = async (query) => {
    if (!query || query.length < 2) {
      setSearchKeywords([]);
      setShowKeywords(false);
      return;
    }

    try {
      const response = await stationApi.searchKeywords(query);
      
      if (response && Array.isArray(response)) {
        setSearchKeywords(response.slice(0, 5)); // Limit to 5 suggestions
        setShowKeywords(true);
      } else if (response && response.data && Array.isArray(response.data)) {
        setSearchKeywords(response.data.slice(0, 5));
        setShowKeywords(true);
      } else {
        setSearchKeywords([]);
        setShowKeywords(false);
      }
    } catch (error) {
      console.error('Keyword search error:', error);
      setSearchKeywords([]);
      setShowKeywords(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(0); // Reset to first page on new search
    
    // Debounced keyword search
    const delayedKeywordSearch = setTimeout(() => {
      searchKeywordsApi(value);
    }, 300);

    return () => clearTimeout(delayedKeywordSearch);
  };

  // Handle keyword selection
  const handleKeywordSelect = (keyword) => {
    setSearchTerm(keyword);
    setShowKeywords(false);
    setCurrentPage(0);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setShowKeywords(false);
    setCurrentPage(0);
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(0); // Reset to first page on filter change
  };

  // Toggle station status
  const toggleStationStatus = async (stationId, currentStatus) => {
    try {
      setActionLoading(prev => ({...prev, [stationId]: true}));
      
      const response = await stationApi.changeStationStatus(stationId, !currentStatus);
      
      if (response && (response.isSuccess || response.success)) {
        // Refresh the list
        if (searchMode === 'search') {
          await loadStationsByName();
        } else {
          await loadAllStations();
        }
      } else {
        throw new Error(response?.message || 'Durum değiştirilemedi');
      }
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
      setError('Durum değiştirilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setActionLoading(prev => ({...prev, [stationId]: false}));
    }
  };

  // Delete station
  const deleteStation = async (stationId) => {
    if (!window.confirm('Bu durağı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setActionLoading(prev => ({...prev, [`delete_${stationId}`]: true}));
      
      const response = await stationApi.deleteStation(stationId);
      
      if (response && (response.isSuccess || response.success)) {
        // Refresh the list
        if (searchMode === 'search') {
          await loadStationsByName();
        } else {
          await loadAllStations();
        }
      } else {
        throw new Error(response?.message || 'Durak silinemedi');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      setError('Durak silinirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setActionLoading(prev => ({...prev, [`delete_${stationId}`]: false}));
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(0); // Reset to first page
  };

  // Refresh data
  const refreshData = () => {
    if (searchMode === 'search') {
      loadStationsByName();
    } else {
      loadAllStations();
    }
  };

  // Navigate to pages
  const navigateToDetail = (stationId) => {
    navigate(`/station-detail/${stationId}`);
  };

  const navigateToEdit = (stationId) => {
    navigate(`/station-form/${stationId}`);
  };

  const navigateToCreate = () => {
    navigate('/station-form');
  };

  const navigateToMap = () => {
    navigate('/station-map');
  };

  return (
    <div className="station-list-container">
      {/* Header */}
      <div className="station-list-header">
        <div className="header-actions">
          <button 
            className="btn-back"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={20} />
            Ana Sayfa
          </button>
          
          <h1>Durak Yönetimi</h1>
          
          <div className="header-buttons">
            <button 
              className="btn-map"
              onClick={navigateToMap}
            >
              <MapPin size={20} />
              Harita
            </button>
            
            <button 
              className="btn-primary"
              onClick={navigateToCreate}
            >
              <Plus size={20} />
              Yeni Durak
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="station-search-filters">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Durak adı, adres veya bölge ara..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={clearSearch}
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Autocomplete Keywords */}
          {showKeywords && searchKeywords.length > 0 && (
            <div className="search-keywords">
              {searchKeywords.map((keyword, index) => (
                <div
                  key={index}
                  className="keyword-item"
                  onClick={() => handleKeywordSelect(keyword)}
                >
                  {keyword}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <Filter size={16} />
            <label>Tür:</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="filter-select"
            >
              {STATION_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className="btn-refresh"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <span>
          {totalElements} durak bulundu
          {searchTerm && ` ("${searchTerm}" araması için)`}
          {filters.type !== 'ALL' && ` (${getStationTypeLabel(filters.type)} filtresi ile)`}
        </span>
        
        <div className="page-size-selector">
          <label>Sayfa başına:</label>
          <select value={pageSize} onChange={handlePageSizeChange}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Duraklar yükleniyor...</span>
        </div>
      )}

      {/* Stations Table */}
      {!loading && (
        <div className="stations-table-container">
          <table className="stations-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Durak Adı</th>
                <th>Tür</th>
                <th>Konum</th>
                <th>Adres</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {stations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    {searchTerm ? 'Arama kriterlerine uygun durak bulunamadı.' : 'Henüz durak eklenmemiş.'}
                  </td>
                </tr>
              ) : (
                stations.map((station) => (
                  <tr key={station.id}>
                    <td>{station.id}</td>
                    <td>
                      <div className="station-name">
                        <span className="type-icon">
                          {getStationTypeIcon(station.type)}
                        </span>
                        {station.name}
                      </div>
                    </td>
                    <td>
                      <span className="station-type">
                        {getStationTypeLabel(station.type)}
                      </span>
                    </td>
                    <td>
                      <div className="coordinates">
                        <small>
                          {station.latitude?.toFixed(6)}, {station.longitude?.toFixed(6)}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="address">
                        <div>{station.street}</div>
                        <small>{station.district}, {station.city}</small>
                      </div>
                    </td>
                    <td>
                      <button
                        className={`status-toggle ${station.active ? 'active' : 'inactive'}`}
                        onClick={() => toggleStationStatus(station.id, station.active)}
                        disabled={actionLoading[station.id]}
                      >
                        {actionLoading[station.id] ? (
                          <RefreshCw size={16} className="spinning" />
                        ) : station.active ? (
                          <ToggleRight size={16} />
                        ) : (
                          <ToggleLeft size={16} />
                        )}
                        {station.active ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => navigateToDetail(station.id)}
                          title="Detay"
                        >
                          <Eye size={16} />
                        </button>
                        
                        <button
                          className="btn-action btn-edit"
                          onClick={() => navigateToEdit(station.id)}
                          title="Düzenle"
                        >
                          <Edit size={16} />
                        </button>
                        
                        <button
                          className="btn-action btn-delete"
                          onClick={() => deleteStation(station.id)}
                          disabled={actionLoading[`delete_${station.id}`]}
                          title="Sil"
                        >
                          {actionLoading[`delete_${station.id}`] ? (
                            <RefreshCw size={16} className="spinning" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Sayfa {currentPage + 1} / {totalPages} - Toplam {totalElements} kayıt
          </div>
          
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
            >
              İlk
            </button>
            
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft size={16} />
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight size={16} />
            </button>
            
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Son
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationList;