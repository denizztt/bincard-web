import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { newsApi } from '../services/apiService';
import { NewsPlatform, NewsPriority, NewsType } from '../types';
import '../styles/NewsAdd.css';

const NewsAdd = () => {
  const navigate = useNavigate();
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
    type: 'DUYURU',
    platform: 'WEB',
    priority: 'NORMAL',
    startDate: new Date().toISOString().split('T')[0], // Today
    startTime: '00:00',
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
    endTime: '23:59',
    allowFeedback: true,
    active: true
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Lütfen geçerli bir resim dosyası seçin' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Resim dosyası 5MB\'dan küçük olmalıdır' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('image-input');
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Başlık zorunludur';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Başlık en az 5 karakter olmalıdır';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Başlık en fazla 200 karakter olabilir';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'İçerik zorunludur';
    } else if (formData.content.length < 10) {
      newErrors.content = 'İçerik en az 10 karakter olmalıdır';
    } else if (formData.content.length > 5000) {
      newErrors.content = 'İçerik en fazla 5000 karakter olabilir';
    }
    
    // Date validation
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    const now = new Date();
    
    if (startDateTime < now) {
      newErrors.startDate = 'Başlangıç tarihi gelecekte olmalıdır';
    }
    
    if (endDateTime <= startDateTime) {
      newErrors.endDate = 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ text: 'Lütfen tüm zorunlu alanları doğru şekilde doldurun', isError: true });
      return;
    }
    
    setIsLoading(true);
    setMessage({ text: '', isError: false });
    
    try {
      // Prepare date-time strings in ISO format
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();
      
      const newsData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        image: formData.image,
        startDate: startDateTime,
        endDate: endDateTime,
        platform: formData.platform,
        priority: formData.priority,
        type: formData.type,
        allowFeedback: formData.allowFeedback
      };
      
      const result = await newsApi.createNews(newsData);
      
      if (result && result.success !== false) {
        setMessage({ text: 'Haber başarıyla kaydedildi! Haber listesine yönlendiriliyorsunuz...', isError: false });
        
        // Clear form
        clearForm();
        
        // Redirect to news list after 2 seconds
        setTimeout(() => {
          navigate('/news');
        }, 2000);
      } else {
        setMessage({ text: result.message || 'Haber kaydedilirken bir hata oluştu', isError: true });
      }
    } catch (error) {
      console.error('News creation failed:', error);
      setMessage({ text: `Haber kaydedilirken hata: ${error.message || error}`, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      title: '',
      content: '',
      image: null,
      type: 'DUYURU',
      platform: 'WEB',
      priority: 'NORMAL',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '00:00',
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endTime: '23:59',
      allowFeedback: true,
      active: true
    });
    setImagePreview(null);
    setErrors({});
    
    // Reset file input
    const fileInput = document.getElementById('image-input');
    if (fileInput) fileInput.value = '';
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
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

  return (
    <div className="news-add-container">
      <div className="news-add-header">
        <h1 className="page-title">Yeni Haber Ekle</h1>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/news')}
            className="btn btn-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11 1L4 8l7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Haber Listesi</span>
          </button>
        </div>
      </div>

      <div className="news-add-form-container">
        <form onSubmit={handleSubmit} className="news-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label required">Başlık</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Haber başlığını giriniz"
              className={`form-input ${errors.title ? 'error' : ''}`}
              maxLength="200"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
            <small className="form-hint">{formData.title.length}/200 karakter</small>
          </div>

          {/* Content */}
          <div className="form-group">
            <label className="form-label required">İçerik</label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Haber içeriğini giriniz"
              className={`form-textarea ${errors.content ? 'error' : ''}`}
              rows="6"
              maxLength="5000"
            />
            {errors.content && <span className="error-message">{errors.content}</span>}
            <small className="form-hint">{formData.content.length}/5000 karakter</small>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">Görsel</label>
            <div className="image-upload-area">
              {!imagePreview ? (
                <div className="upload-placeholder">
                  <input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden-input"
                  />
                  <label htmlFor="image-input" className="upload-button">
                    <span>Görsel Seç</span>
                  </label>
                  <p>PNG, JPG, JPEG (Max 5MB)</p>
                </div>
              ) : (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button 
                    type="button" 
                    onClick={removeImage}
                    className="remove-image-btn"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            {errors.image && <span className="error-message">{errors.image}</span>}
          </div>

          {/* Form Row 1: Type, Platform, Priority */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select 
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="form-select"
              >
                {Object.values(NewsType).map(type => (
                  <option key={type} value={type}>{getTypeDisplayName(type)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Platform</label>
              <select 
                value={formData.platform}
                onChange={(e) => handleInputChange('platform', e.target.value)}
                className="form-select"
              >
                {Object.values(NewsPlatform).map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Öncelik</label>
              <select 
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="form-select"
              >
                {Object.values(NewsPriority).map(priority => (
                  <option key={priority} value={priority}>{getPriorityDisplayName(priority)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date and Time Section */}
          <div className="form-section">
            <h3 className="section-title">Yayın Süresi</h3>
            
            <div className="form-row">
              {/* Start Date/Time */}
              <div className="form-group">
                <label className="form-label">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`form-input ${errors.startDate ? 'error' : ''}`}
                />
                {errors.startDate && <span className="error-message">{errors.startDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Başlangıç Saati</label>
                <select 
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="form-select"
                >
                  {generateTimeOptions().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              {/* End Date/Time */}
              <div className="form-group">
                <label className="form-label">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`form-input ${errors.endDate ? 'error' : ''}`}
                />
                {errors.endDate && <span className="error-message">{errors.endDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Bitiş Saati</label>
                <select 
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="form-select"
                >
                  {generateTimeOptions().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="form-section">
            <h3 className="section-title">Seçenekler</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={formData.allowFeedback}
                    onChange={(e) => handleInputChange('allowFeedback', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Geri Bildirime İzin Ver
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Aktif
                </label>
              </div>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`message ${message.isError ? 'error' : 'success'}`}>
              {message.text}
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading}
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h10l3 3v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" stroke="none"/>
                    <rect x="5" y="1" width="6" height="5" fill="var(--white)"/>
                    <rect x="4" y="8" width="8" height="6" fill="var(--white)"/>
                  </svg>
                  <span>Haberi Kaydet</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={clearForm}
              className="btn btn-outline"
              disabled={isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 3l1-2h8l1 2m-10 0h10m-9 1v9a1 1 0 001 1h6a1 1 0 001-1V4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 7v4m4-4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Formu Temizle</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/news')}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12 4L4 12m0-8l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>İptal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsAdd; 