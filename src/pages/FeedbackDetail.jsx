import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { feedbackApi } from '../services/apiService';
import { getFeedbackTypeDisplayName, getFeedbackSourceDisplayName, getFeedbackTypeColor } from '../types';
import '../styles/FeedbackDetail.css';

const FeedbackDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  // Get initial data from navigation state
  const initialFeedback = location.state?.feedback;
  
  const [feedback, setFeedback] = useState(initialFeedback || null);
  const [loading, setLoading] = useState(!initialFeedback);
  const [error, setError] = useState('');

  // Load feedback if not provided via navigation
  useEffect(() => {
    if (!initialFeedback && id) {
      loadFeedback();
    }
  }, [id, initialFeedback]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      // Since we don't have getFeedbackById in the API client yet,
      // we'll redirect back if no data is provided
      setError('Geri bildirim verisi bulunamadı. Liste sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => navigate('/feedback'), 2000);
    } catch (err) {
      console.error('Feedback loading failed:', err);
      setError('Geri bildirim yüklenirken hata oluştu: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="feedback-detail-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Geri bildirim yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feedback-detail-container">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button 
            onClick={() => navigate('/feedback')}
            className="btn btn-primary"
          >
            Geri Bildirim Listesi
          </button>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="feedback-detail-container">
        <div className="error-container">
          <p>Geri bildirim bulunamadı.</p>
          <button 
            onClick={() => navigate('/feedback')}
            className="btn btn-primary"
          >
            Geri Bildirim Listesi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-detail-container">
      <div className="feedback-detail-header">
        <h1 className="page-title">📢 Geri Bildirim Detayı</h1>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/feedback')}
            className="btn btn-secondary"
          >
            ← Geri Bildirim Listesi
          </button>
        </div>
      </div>

      <div className="feedback-detail-content">
        {/* Feedback Info Card */}
        <div className="feedback-card">
          <div className="card-header">
            <div className="feedback-meta">
              <span 
                className="type-badge"
                style={{ backgroundColor: getFeedbackTypeColor(feedback.type) }}
              >
                {getFeedbackTypeDisplayName(feedback.type)}
              </span>
              <span className="source-badge">
                {getFeedbackSourceDisplayName(feedback.source)}
              </span>
              <span className="feedback-id">
                ID: {feedback.id}
              </span>
            </div>
            <div className="feedback-date">
              {formatDate(feedback.submittedAt)}
            </div>
          </div>

          <div className="card-body">
            {/* Subject */}
            <div className="feedback-section">
              <h3 className="section-title">Konu</h3>
              <p className="feedback-subject">{feedback.subject}</p>
            </div>

            {/* Message */}
            <div className="feedback-section">
              <h3 className="section-title">Mesaj</h3>
              <div className="feedback-message">
                {feedback.message}
              </div>
            </div>

            {/* User Info */}
            <div className="feedback-section">
              <h3 className="section-title">Kullanıcı Bilgileri</h3>
              <div className="user-info-grid">
                <div className="info-item">
                  <label>İsim:</label>
                  <span>{feedback.userName || 'Belirtilmemiş'}</span>
                </div>
                <div className="info-item">
                  <label>E-posta:</label>
                  <span>{feedback.userEmail || 'Belirtilmemiş'}</span>
                </div>
                <div className="info-item">
                  <label>Kullanıcı Bilgisi:</label>
                  <span>{feedback.userInfo || 'Belirtilmemiş'}</span>
                </div>
              </div>
            </div>

            {/* Technical Info */}
            <div className="feedback-section">
              <h3 className="section-title">Teknik Bilgiler</h3>
              <div className="technical-info-grid">
                <div className="info-item">
                  <label>Kaynak:</label>
                  <span>{getFeedbackSourceDisplayName(feedback.source)}</span>
                </div>
                <div className="info-item">
                  <label>Tür:</label>
                  <span>{getFeedbackTypeDisplayName(feedback.type)}</span>
                </div>
                <div className="info-item">
                  <label>Gönderim Tarihi:</label>
                  <span>{formatDate(feedback.submittedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="feedback-actions">
          <button 
            onClick={() => window.print()}
            className="btn btn-outline"
          >
            🖨️ Yazdır
          </button>
          
          <button 
            onClick={() => {
              const feedbackText = `
Geri Bildirim Detayı
===================
ID: ${feedback.id}
Tür: ${getFeedbackTypeDisplayName(feedback.type)}
Kaynak: ${getFeedbackSourceDisplayName(feedback.source)}
Tarih: ${formatDate(feedback.submittedAt)}

Konu: ${feedback.subject}

Mesaj:
${feedback.message}

Kullanıcı: ${feedback.userName || 'Belirtilmemiş'}
E-posta: ${feedback.userEmail || 'Belirtilmemiş'}
              `.trim();
              
              navigator.clipboard.writeText(feedbackText);
              alert('Geri bildirim detayı panoya kopyalandı!');
            }}
            className="btn btn-outline"
          >
            📋 Kopyala
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetail; 