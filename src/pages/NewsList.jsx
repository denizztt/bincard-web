import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { newsApi } from '../services/apiService';
import '../styles/NewsList.css';

const NewsManagement = () => {
  const navigate = useNavigate();
  
  // State management
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    platform: '',
    type: '',
    active: 'AKTIF', // Default olarak aktif haberler
    dateRange: '',
    search: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // UI states
  const [selectedNews, setSelectedNews] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [previewNews, setPreviewNews] = useState(null);
  const [showStatistics, setShowStatistics] = useState(false);

  useEffect(() => {
    loadNews();
  }, [currentPage, filters]);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      
      // Aktif haberleri getir (default)
      if (filters.active === 'AKTIF') {
        response = await newsApi.getActiveNewsForAdmin(
          filters.platform || undefined,
          filters.type || undefined,
          currentPage,
          pageSize
        );
      } else {
        // Tüm haberleri getir
        response = await newsApi.getAllNews(
          filters.platform || undefined,
          currentPage,
          pageSize
        );
      }
      
      if (response && response.content) {
        setNews(response.content);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      }
    } catch (err) {
      console.error('News loading failed:', err);
      setError('Haberler yüklenirken hata oluştu: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(0); // Reset to first page when filters change
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm('Bu haberi pasif yapmak istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await newsApi.softDeleteNews(id);
      await loadNews();
    } catch (err) {
      setError('Haber silinirken hata oluştu: ' + (err.message || err));
    }
  };

  const handleEdit = (newsItem) => {
    navigate(`/news/edit/${newsItem.id}`, { state: { newsItem } });
  };

  const handlePreview = async (newsItem) => {
    try {
      const fullNews = await newsApi.getNewsById(newsItem.id);
      setPreviewNews(fullNews);
    } catch (err) {
      setError('Haber önizleme yüklenirken hata oluştu');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'COK_DUSUK': '#95a5a6',
      'DUSUK': '#74b9ff',
      'NORMAL': '#00b894',
      'ORTA_YUKSEK': '#fdcb6e',
      'YUKSEK': '#e17055',
      'COK_YUKSEK': '#e84393',
      'KRITIK': '#d63031'
    };
    return colors[priority] || '#00b894';
  };

  const getTypeDisplayName = (type) => {
    const typeNames = {
      'DUYURU': 'Duyuru',
      'KAMPANYA': 'Kampanya', 
      'BAKIM': 'Bakım',
      'BILGILENDIRME': 'Bilgilendirme',
      'GUNCELLEME': 'Güncelleme',
      'UYARI': 'Uyarı',
      'ETKINLIK': 'Etkinlik',
      'BASIN_BULTENI': 'Basın Bülteni',
      'GUVENLIK': 'Güvenlik',
      'OZELLIK': 'Özellik',
      'HATIRLATMA': 'Hatırlatma',
      'KESINTI': 'Kesinti'
    };
    return typeNames[type] || type;
  };

  const getPriorityDisplayName = (priority) => {
    const priorityNames = {
      'COK_DUSUK': 'Çok Düşük',
      'DUSUK': 'Düşük',
      'NORMAL': 'Normal',
      'ORTA_YUKSEK': 'Orta Yüksek',
      'YUKSEK': 'Yüksek',
      'COK_YUKSEK': 'Çok Yüksek',
      'KRITIK': 'Kritik'
    };
    return priorityNames[priority] || priority;
  };

  const getPlatformDisplayName = (platform) => {
    const platformNames = {
      'WEB': 'Web',
      'MOBILE': 'Mobil',
      'DESKTOP': 'Masaüstü',
      'TABLET': 'Tablet',
      'SMART_TV': 'Smart TV',
      'KIOSK': 'Kiosk',
      'ALL': 'Tümü'
    };
    return platformNames[platform] || platform;
  };

  if (loading) {
    return (
      <div className="news-management-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Haberler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="news-management-container">
      {/* Header */}
      <div className="news-management-header">
        <div className="header-left">
          <h1>Haber Yönetimi</h1>
          <span className="news-count">
            {totalElements} haber
            {filters.active === 'AKTIF' && ' (aktif)'}
          </span>
        </div>
        
        <div className="header-right">
          <button 
            className="btn-secondary"
            onClick={() => setShowStatistics(!showStatistics)}
          >
            <BarChart3 size={20} />
            <span>İstatistikler</span>
          </button>
          
          <button 
            className="btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            <span>Filtreler</span>
          </button>
          
          <button 
            className={`btn-secondary ${refreshing ? 'spinning' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={20} />
            <span>Yenile</span>
          </button>
          
          <button 
            className="btn-primary"
            onClick={() => navigate('/news/add')}
          >
            <Plus size={20} />
            <span>Yeni Haber</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')}>Kapat</button>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Durum</label>
              <select 
                value={filters.active}
                onChange={(e) => handleFilterChange('active', e.target.value)}
              >
                <option value="AKTIF">Aktif</option>
                <option value="PASIF">Pasif</option>
                <option value="TUMÜ">Tümü</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Platform</label>
              <select 
                value={filters.platform}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
              >
                <option value="">Tümü</option>
                <option value="WEB">Web</option>
                <option value="MOBILE">Mobil</option>
                <option value="DESKTOP">Masaüstü</option>
                <option value="ALL">Tüm Platformlar</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Tür</label>
              <select 
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">Tümü</option>
                <option value="DUYURU">Duyuru</option>
                <option value="KAMPANYA">Kampanya</option>
                <option value="BAKIM">Bakım</option>
                <option value="BILGILENDIRME">Bilgilendirme</option>
                <option value="GUNCELLEME">Güncelleme</option>
                <option value="UYARI">Uyarı</option>
                <option value="ETKINLIK">Etkinlik</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Ara</label>
              <div className="search-input-container">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Haber başlığı ara..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Table */}
      <div className="news-table-container">
        {news.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>Henüz haber bulunmamaktadır</h3>
            <p>İlk haberi eklemek için "Yeni Haber" butonuna tıklayın.</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/news/add')}
            >
              <Plus size={20} />
              <span>Yeni Haber Ekle</span>
            </button>
          </div>
        ) : (
          <div className="news-table">
            <table>
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Tür</th>
                  <th>Platform</th>
                  <th>Öncelik</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th>İstatistikler</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item) => (
                  <tr key={item.id} className={!item.active ? 'inactive' : ''}>
                    <td>
                      <div className="news-title">
                        {item.thumbnail && (
                          <img 
                            src={item.thumbnail} 
                            alt="thumbnail" 
                            className="news-thumbnail"
                          />
                        )}
                        <div>
                          <h4>{item.title}</h4>
                          <p>{item.content?.substring(0, 100)}...</p>
                        </div>
                      </div>
                    </td>
                    
                    <td>
                      <span className="news-type">
                        {getTypeDisplayName(item.type)}
                      </span>
                    </td>
                    
                    <td>
                      <span className="platform-badge">
                        {getPlatformDisplayName(item.platform)}
                      </span>
                    </td>
                    
                    <td>
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(item.priority) }}
                      >
                        {getPriorityDisplayName(item.priority)}
                      </span>
                    </td>
                    
                    <td>
                      <span className={`status-badge ${item.active ? 'active' : 'inactive'}`}>
                        {item.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    
                    <td className="date-cell">
                      {formatDate(item.createdAt || item.startDate)}
                    </td>
                    
                    <td className="stats-cell">
                      <div className="stats-row">
                        <span><Eye size={16} /> {item.viewCount || 0}</span>
                        <span>👍 {item.likeCount || 0}</span>
                      </div>
                    </td>
                    
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-preview"
                          onClick={() => handlePreview(item)}
                          title="Önizle"
                        >
                          <Eye size={16} />
                        </button>
                        
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEdit(item)}
                          title="Düzenle"
                        >
                          <Edit3 size={16} />
                        </button>
                        
                        {item.active && (
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleSoftDelete(item.id)}
                            title="Pasif Yap"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft size={20} />
            <span>Önceki</span>
          </button>
          
          <span className="pagination-info">
            Sayfa {currentPage + 1} / {totalPages}
          </span>
          
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
          >
            <span>Sonraki</span>
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {previewNews && (
        <div className="modal-overlay" onClick={() => setPreviewNews(null)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Haber Önizleme</h2>
              <button onClick={() => setPreviewNews(null)}>×</button>
            </div>
            
            <div className="modal-content">
              {previewNews.image && (
                <img src={previewNews.image} alt="Haber görseli" className="preview-image" />
              )}
              
              <h1>{previewNews.title}</h1>
              
              <div className="preview-meta">
                <span className="preview-type">{getTypeDisplayName(previewNews.type)}</span>
                <span className="preview-platform">{getPlatformDisplayName(previewNews.platform)}</span>
                <span 
                  className="preview-priority"
                  style={{ backgroundColor: getPriorityColor(previewNews.priority) }}
                >
                  {getPriorityDisplayName(previewNews.priority)}
                </span>
              </div>
              
              <div className="preview-content">
                {previewNews.content}
              </div>
              
              <div className="preview-stats">
                <span><Eye size={16} /> {previewNews.viewCount || 0} görüntülenme</span>
                <span>👍 {previewNews.likeCount || 0} beğeni</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;
