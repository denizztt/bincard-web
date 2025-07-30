import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { newsApi } from '../services/apiService';
import { NewsPlatform, NewsPriority, NewsType } from '../types';
import '../styles/NewsList.css';

const NewsList = () => {
  const navigate = useNavigate();
  
  // State management
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    platform: 'Tümü',
    type: 'Tümü',
    priority: 'Tümü',
    active: 'Tümü',
    dateRange: 'Tümü'
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  
  // Load news data
  useEffect(() => {
    loadNews();
  }, [currentPage]);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [news, filters]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await newsApi.getAllNews();
      
      if (response && response.content) {
        setNews(response.content);
        setTotalPages(response.totalPages || 0);
      }
      setError('');
    } catch (err) {
      console.error('News loading failed:', err);
      setError('Haberler yüklenirken hata oluştu: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...news];
    
    // Platform filter
    if (filters.platform !== 'Tümü') {
      filtered = filtered.filter(item => item.platform === filters.platform);
    }
    
    // Type filter
    if (filters.type !== 'Tümü') {
      filtered = filtered.filter(item => item.type === filters.type);
    }
    
    // Priority filter
    if (filters.priority !== 'Tümü') {
      filtered = filtered.filter(item => item.priority === filters.priority);
    }
    
    // Active filter
    if (filters.active !== 'Tümü') {
      const isActive = filters.active === 'Aktif';
      filtered = filtered.filter(item => item.active === isActive);
    }
    
    // Date range filter
    if (filters.dateRange !== 'Tümü') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'Bugün':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(item => 
            new Date(item.createdAt) >= filterDate
          );
          break;
        case 'Bu Hafta':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(item => 
            new Date(item.createdAt) >= filterDate
          );
          break;
        case 'Bu Ay':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(item => 
            new Date(item.createdAt) >= filterDate
          );
          break;
      }
    }
    
    setFilteredNews(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm('Bu haberi pasif yapmak istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await newsApi.softDeleteNews(id);
      await loadNews(); // Reload data
    } catch (err) {
      setError('Haber silinirken hata oluştu: ' + (err.message || err));
    }
  };

  const handleEdit = (newsItem) => {
    navigate(`/news/edit/${newsItem.id}`, { state: { newsItem } });
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
    return colors[priority] || '#95a5a6';
  };

  const getTypeDisplayName = (type) => {
    const typeNames = {
      'DUYURU': 'Duyuru',
      'KAMPANYA': 'Kampanya', 
      'BAKIM': 'Bakım',
      'BILGILENDIRME': 'Bilgilendirme',
      'GUNCELLEME': 'Güncelleme',
      'UYARI': 'Uyarı',
      'ETKINLIK': 'Etkinlik'
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

  if (loading) {
    return (
      <div className="news-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Haberler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="news-list-container">
      <div className="news-list-header">
        <div className="header-top">
          <h1 className="page-title">📰 Haber Yönetimi</h1>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/news/add')}
              className="btn btn-primary"
            >
              ➕ Yeni Haber Ekle
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-container">
          <div className="filter-row">
            <div className="filter-group">
              <label>Platform:</label>
              <select 
                value={filters.platform}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
              >
                <option value="Tümü">Tümü</option>
                {Object.values(NewsPlatform).map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Kategori:</label>
              <select 
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="Tümü">Tümü</option>
                {Object.values(NewsType).map(type => (
                  <option key={type} value={type}>{getTypeDisplayName(type)}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Öncelik:</label>
              <select 
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="Tümü">Tümü</option>
                {Object.values(NewsPriority).map(priority => (
                  <option key={priority} value={priority}>{getPriorityDisplayName(priority)}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Durum:</label>
              <select 
                value={filters.active}
                onChange={(e) => handleFilterChange('active', e.target.value)}
              >
                <option value="Tümü">Tümü</option>
                <option value="Aktif">Aktif</option>
                <option value="Pasif">Pasif</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Tarih:</label>
              <select 
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="Tümü">Tümü</option>
                <option value="Bugün">Bugün</option>
                <option value="Bu Hafta">Bu Hafta</option>
                <option value="Bu Ay">Bu Ay</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <span>Toplam: {news.length} haber</span>
          <span>Gösterilen: {filteredNews.length} haber</span>
          {error && <span className="error-message">{error}</span>}
        </div>
      </div>

      {/* News Table */}
      <div className="news-table-container">
        <table className="news-table">
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Kategori</th>
              <th>Platform</th>
              <th>Öncelik</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredNews.map((newsItem) => (
              <tr key={newsItem.id} className={!newsItem.active ? 'inactive-row' : ''}>
                <td className="title-cell">
                  <div className="title-content">
                    <h4>{newsItem.title}</h4>
                    <p className="content-preview">
                      {newsItem.content.length > 100 
                        ? newsItem.content.substring(0, 100) + '...'
                        : newsItem.content
                      }
                    </p>
                  </div>
                </td>
                <td>
                  <span className="type-badge">
                    {getTypeDisplayName(newsItem.type)}
                  </span>
                </td>
                <td>
                  <span className="platform-badge">
                    {newsItem.platform}
                  </span>
                </td>
                <td>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(newsItem.priority) }}
                  >
                    {getPriorityDisplayName(newsItem.priority)}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${newsItem.active ? 'active' : 'inactive'}`}>
                    {newsItem.active ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="date-cell">
                  <div>
                    <strong>Oluşturma:</strong> {formatDate(newsItem.createdAt)}
                  </div>
                  {newsItem.updatedAt && (
                    <div>
                      <strong>Güncelleme:</strong> {formatDate(newsItem.updatedAt)}
                    </div>
                  )}
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(newsItem)}
                      className="btn btn-edit"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleSoftDelete(newsItem.id)}
                      className="btn btn-delete"
                      title="Pasif Yap"
                      disabled={!newsItem.active}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredNews.length === 0 && !loading && (
          <div className="no-data">
            <p>Gösterilecek haber bulunamadı.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button 
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="btn btn-pagination"
          >
            ← Önceki
          </button>
          <span className="page-info">
            Sayfa {currentPage + 1} / {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            className="btn btn-pagination"
          >
            Sonraki →
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsList; 