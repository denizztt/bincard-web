import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { feedbackApi } from '../services/apiService';
import { FeedbackType, FeedbackSource } from '../types';
import '../styles/FeedbackList.css';

// Helper removed: inline truncation applied in JSX

// Source değerlerini normalize et (backend'den gelen farklı formatları enum değerlerine çevir)
const normalizeSource = (source) => {
  if (!source) return '';
  const normalized = source.toUpperCase().trim().replace(/[-\s]/g, '_');
  
  // Bilinen mapping'ler - backend'den gelen farklı formatları enum değerlerine çevir
  const sourceMapping = {
    'MOBILE': 'MOBILE_APP',
    'MOBILEAPP': 'MOBILE_APP',
    'MOBILE_APP': 'MOBILE_APP',
    'WEB': 'WEB_APP',
    'WEBAPP': 'WEB_APP',
    'WEB_APP': 'WEB_APP',
    'WEB_PORTAL': 'WEB_APP',
    'CALL_CENTER': 'PHONE',
    'CALL': 'PHONE',
    'TELEFON': 'PHONE',
    'PHONE': 'PHONE',
    'EMAIL': 'EMAIL',
    'SOCIAL_MEDIA': 'SOCIAL_MEDIA',
    'OTHER': 'OTHER'
  };
  
  // Önce tam eşleşme kontrolü
  if (sourceMapping[normalized]) {
    return sourceMapping[normalized];
  }
  
  // Kısmi eşleşme kontrolü (mobile içeriyorsa MOBILE_APP)
  if (normalized.includes('MOBILE')) {
    return 'MOBILE_APP';
  }
  if (normalized.includes('WEB')) {
    return 'WEB_APP';
  }
  if (normalized.includes('CALL') || normalized.includes('PHONE') || normalized.includes('TELEFON')) {
    return 'PHONE';
  }
  
  return normalized;
};

const FeedbackList = () => {
  const navigate = useNavigate();
  
  // State management
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    type: 'Tümü',
    source: 'Tümü',
    dateRange: 'Tümü'
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  // Load feedback data
  useEffect(() => {
    loadFeedbacks();
  }, [currentPage]);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [feedbacks, filters]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbackApi.getAllFeedbacks({
        page: currentPage,
        size: pageSize,
        sort: 'submittedAt,desc'
      });
      
      if (response && response.data && response.data.content) {
        // Backend'den gelen verileri normalize et (source ve type değerlerini uppercase yap)
        const normalizedFeedbacks = response.data.content.map(feedback => {
          const originalSource = feedback.source;
          const normalizedSource = normalizeSource(feedback.source);
          
          // Debug: Backend'den gelen source değerlerini logla
          if (originalSource && originalSource !== normalizedSource) {
            console.log(`Source normalize: "${originalSource}" -> "${normalizedSource}"`);
          }
          
          return {
            ...feedback,
            type: (feedback.type || '').toUpperCase().trim(),
            source: normalizedSource
          };
        });
        setFeedbacks(normalizedFeedbacks);
        setTotalPages(response.data.totalPages || 0);
      } else if (response && response.content) {
        // Fallback for direct content response
        const normalizedFeedbacks = response.content.map(feedback => {
          const originalSource = feedback.source;
          const normalizedSource = normalizeSource(feedback.source);
          
          // Debug: Backend'den gelen source değerlerini logla
          if (originalSource && originalSource !== normalizedSource) {
            console.log(`Source normalize: "${originalSource}" -> "${normalizedSource}"`);
          }
          
          return {
            ...feedback,
            type: (feedback.type || '').toUpperCase().trim(),
            source: normalizedSource
          };
        });
        setFeedbacks(normalizedFeedbacks);
        setTotalPages(response.totalPages || 0);
      }
      setError('');
    } catch (err) {
      console.error('Feedback loading failed:', err);
      setError('Geri bildirimler yüklenirken hata oluştu: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...feedbacks];
    
    // Type filter - Case-insensitive karşılaştırma
    if (filters.type !== 'Tümü') {
      const filterType = filters.type.toUpperCase().trim();
      filtered = filtered.filter(item => {
        const itemType = (item.type || '').toUpperCase().trim();
        return itemType === filterType;
      });
    }
    
    // Source filter - Normalize edilmiş karşılaştırma
    if (filters.source !== 'Tümü') {
      const filterSource = normalizeSource(filters.source);
      filtered = filtered.filter(item => {
        const itemSource = normalizeSource(item.source);
        return itemSource === filterSource;
      });
    }
    
    // Date range filter
    if (filters.dateRange !== 'Tümü') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'Bugün':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(item => 
            new Date(item.submittedAt) >= filterDate
          );
          break;
        case 'Bu Hafta':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(item => 
            new Date(item.submittedAt) >= filterDate
          );
          break;
        case 'Bu Ay':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(item => 
            new Date(item.submittedAt) >= filterDate
          );
          break;
      }
    }
    
    setFilteredFeedbacks(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleViewDetail = (feedback) => {
    navigate(`/feedback/${feedback.id}`, { state: { feedback } });
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

  if (loading) {
    return (
      <div className="feedback-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Geri bildirimler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-list-container">
      <div className="feedback-list-header">
        <div className="header-top">
          <h1 className="page-title">📢 Geri Bildirim Yönetimi</h1>
          <div className="header-actions">
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
          <div className="filters-header">
            <h3 className="filters-title">
              <span className="filter-icon">🔍</span>
              Filtreleme Seçenekleri
            </h3>
            <div className="filters-count">
              Toplam: {feedbacks.length} | Gösterilen: {filteredFeedbacks.length}
            </div>
          </div>
          
          <div className="filters-grid">
            <div className="filter-card">
              <label className="filter-label">
                <span className="label-icon">📝</span>
                Tür
              </label>
              <div className="filter-select-wrapper">
                <select 
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="modern-select"
                >
                  <option value="Tümü">Tüm Türler</option>
                  {Object.values(FeedbackType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-card">
              <label className="filter-label">
                <span className="label-icon">📡</span>
                Kaynak
              </label>
              <div className="filter-select-wrapper">
                <select 
                  value={filters.source}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  className="modern-select"
                >
                  <option value="Tümü">Tüm Kaynaklar</option>
                  {Object.values(FeedbackSource).map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-card">
              <label className="filter-label">
                <span className="label-icon">📅</span>
                Tarih
              </label>
              <div className="filter-select-wrapper">
                <select 
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="modern-select"
                >
                  <option value="Tümü">Tüm Tarihler</option>
                  <option value="Bugün">Bugün</option>
                  <option value="Bu Hafta">Bu Hafta</option>
                  <option value="Bu Ay">Bu Ay</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Feedback Table */}
      <div className="feedback-table-container">
        <table className="feedback-table">
          <thead>
            <tr>
              <th>Konu</th>
              <th>Tür</th>
              <th>Kaynak</th>
              <th>Kullanıcı</th>
              <th>Tarih</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedbacks.map((feedback) => (
              <tr key={feedback.id}>
                <td className="subject-cell">
                  <div className="subject-content">
                    <h4>{feedback.subject}</h4>
                    <p className="message-preview">
                      {(() => {
                        const msg = feedback.shortMessage || feedback.message || '';
                        return msg.length > 100 ? msg.substring(0, 100) + '…' : msg;
                      })()}
                    </p>
                  </div>
                </td>
                <td>
                  <span className="type-badge">
                    {feedback.type}
                  </span>
                </td>
                <td>
                  <span className="source-badge">
                    {feedback.source}
                  </span>
                </td>
                <td className="user-cell">
                  {feedback.userInfo || feedback.userName || 'Anonim'}
                  {feedback.userEmail && (
                    <div className="user-email">
                      {feedback.userEmail}
                    </div>
                  )}
                </td>
                <td className="date-cell">
                  {formatDate(feedback.submittedAt)}
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleViewDetail(feedback)}
                      className="btn btn-view"
                      title="Detayları Görüntüle"
                    >
                      <Search size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredFeedbacks.length === 0 && !loading && (
          <div className="no-data">
            <p>Gösterilecek geri bildirim bulunamadı.</p>
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

export default FeedbackList;