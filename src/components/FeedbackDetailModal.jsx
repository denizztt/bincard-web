import React, { useState, useEffect } from 'react';
import { X, Calendar, Phone, Mail, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { feedbackApi } from '../services/apiService';
import { FeedbackTypeDisplayNames } from '../types';

const FeedbackDetailModal = ({ feedbackId, isOpen, onClose }) => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && feedbackId) {
      loadFeedbackDetail();
    }
  }, [isOpen, feedbackId]);

  const loadFeedbackDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await feedbackApi.getFeedbackById(feedbackId);
      
      if (response && response.isSuccess !== false) {
        const data = response.data || response;
        setFeedback(data);
      } else {
        throw new Error(response.message || 'Feedback detayı yüklenemedi');
      }
    } catch (err) {
      console.error('Feedback detail loading failed:', err);
      setError('Feedback detayı yüklenirken hata oluştu: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'SUGGESTION': return '#28a745';
      case 'COMPLAINT': return '#dc3545';
      case 'TECHNICAL_ISSUE': return '#ffc107';
      case 'OTHER': return '#6c757d';
      default: return '#007bff';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '0',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '20px', fontWeight: '600' }}>
            Feedback Detayı
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} color="#6c757d" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(80vh - 80px)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              <div>Yükleniyor...</div>
            </div>
          ) : error ? (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '15px', 
              borderRadius: '8px',
              border: '1px solid #f5c6cb'
            }}>
              <strong>Hata:</strong> {error}
            </div>
          ) : feedback ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Basic Info */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{
                    backgroundColor: getTypeColor(feedback.type),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {FeedbackTypeDisplayNames[feedback.type] || feedback.type}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6c757d' }}>
                    #{feedback.id}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '16px' }}>
                  {feedback.subject}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '14px', color: '#6c757d' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={14} />
                    {formatDate(feedback.submittedAt)}
                  </div>
                  {feedback.phoneNumber && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Phone size={14} />
                      {feedback.phoneNumber}
                    </div>
                  )}
                  {feedback.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Mail size={14} />
                      {feedback.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <MessageSquare size={16} color="#495057" />
                  <h4 style={{ margin: 0, color: '#495057', fontSize: '14px', fontWeight: '600' }}>
                    Feedback İçeriği
                  </h4>
                </div>
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '15px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {feedback.content}
                </div>
              </div>

              {/* Photo */}
              {feedback.photoUrl && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <ImageIcon size={16} color="#495057" />
                    <h4 style={{ margin: 0, color: '#495057', fontSize: '14px', fontWeight: '600' }}>
                      Ek Fotoğraf
                    </h4>
                  </div>
                  <div style={{
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    maxWidth: '300px'
                  }}>
                    <img 
                      src={feedback.photoUrl} 
                      alt="Feedback fotoğrafı"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div style={{
                      display: 'none',
                      padding: '20px',
                      textAlign: 'center',
                      color: '#6c757d',
                      fontSize: '14px'
                    }}>
                      Fotoğraf yüklenemedi
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Response */}
              {feedback.adminResponse && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <MessageSquare size={16} color="#495057" />
                    <h4 style={{ margin: 0, color: '#495057', fontSize: '14px', fontWeight: '600' }}>
                      Admin Yanıtı
                    </h4>
                  </div>
                  <div style={{
                    backgroundColor: '#e8f4fd',
                    border: '1px solid #bee5eb',
                    borderRadius: '8px',
                    padding: '15px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {feedback.adminResponse}
                  </div>
                </div>
              )}

              {/* Status */}
              {feedback.status && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#495057', fontSize: '14px', fontWeight: '600' }}>
                      Durum
                    </h4>
                  </div>
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {feedback.status}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              <div>Feedback detayı bulunamadı</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetailModal;
