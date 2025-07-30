import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedbackApi } from '../services/apiService';
import { FeedbackType, FeedbackSource, getFeedbackTypeDisplayName, getFeedbackSourceDisplayName, getFeedbackTypeColor } from '../types';
import '../styles/FeedbackList.css';

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
      
      if (response && response.content) {
        setFeedbacks(response.content);
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
    
    // Type filter
    if (filters.type !== 'Tümü') {
      filtered = filtered.filter(item => item.type === filters.type);
    }
    
    // Source filter
    if (filters.source !== 'Tümü') {
      filtered = filtered.filter(item => item.source === filters.source);
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
    navigate(`/feedback/detail/${feedback.id}`, { state: { feedback } });
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

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
          <div className="filter-row">
            <div className="filter-group">
              <label>Tür:</label>
              <select 
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="Tümü">Tümü</option>
                {Object.values(FeedbackType).map(type => (
                  <option key={type} value={type}>{getFeedbackTypeDisplayName(type)}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Kaynak:</label>
              <select 
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
              >
                <option value="Tümü">Tümü</option>
                {Object.values(FeedbackSource).map(source => (
                  <option key={source} value={source}>{getFeedbackSourceDisplayName(source)}</option>
                ))}
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
          <span>Toplam: {feedbacks.length} geri bildirim</span>
          <span>Gösterilen: {filteredFeedbacks.length} geri bildirim</span>
          {error && <span className="error-message">{error}</span>}
        </div>
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
                      {truncateText(feedback.shortMessage || feedback.message)}
                    </p>
                  </div>
                </td>
                <td>
                  <span 
                    className="type-badge"
                    style={{ backgroundColor: getFeedbackTypeColor(feedback.type) }}
                  >
                    {getFeedbackTypeDisplayName(feedback.type)}
                  </span>
                </td>
                <td>
                  <span className="source-badge">
                    {getFeedbackSourceDisplayName(feedback.source)}
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
                      👁️
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