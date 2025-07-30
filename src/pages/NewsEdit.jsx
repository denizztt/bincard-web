import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { newsApi } from '../services/apiService';
import { NewsPlatform, NewsPriority, NewsType } from '../types';
import '../styles/NewsEdit.css';

const NewsEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  // Get initial data from navigation state or empty
  const initialNewsData = location.state?.newsItem;
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
    type: 'DUYURU',
    platform: 'WEB',
    priority: 'NORMAL',
    startDate: '',
    startTime: '00:00',
    endDate: '',
    endTime: '23:59',
    allowFeedback: true,
    active: true
  });
  
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(!initialNewsData);
  const [message, setMessage] = useState({ text: '', isError: false });

  // Load initial data
  useEffect(() => {
    if (initialNewsData) {
      populateForm(initialNewsData);
    } else if (id) {
      // If no data passed via navigation, we would need to fetch it
      // For now, redirect back to news list
      setMessage({ text: 'Haber verisi bulunamadı. Haber listesine yönlendiriliyorsunuz...', isError: true });
      setTimeout(() => navigate('/news'), 2000);
    }
  }, [id, initialNewsData, navigate]);

  const populateForm = (newsData) => {
    try {
      // Parse dates
      const startDate = new Date(newsData.startDate);
      const endDate = new Date(newsData.endDate);
      
      setFormData({
        title: newsData.title || '',
        content: newsData.content || '',
        image: null, // Don't set existing image as File object
        type: newsData.type || 'DUYURU',
        platform: newsData.platform || 'WEB',
        priority: newsData.priority || 'NORMAL',
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endDate: endDate.toISOString().split('T')[0],
        endTime: endDate.toTimeString().slice(0, 5),
        allowFeedback: newsData.allowFeedback ?? true,
        active: newsData.active ?? true
      });
      
      // Set original image URL for display
      if (newsData.image) {
        setOriginalImageUrl(newsData.image);
        setImagePreview(newsData.image);
      }
      
      setPageLoading(false);
    } catch (error) {
      console.error('Error populating form:', error);
      setMessage({ text: 'Haber verileri yüklenirken hata oluştu', isError: true });
      setPageLoading(false);
    }
  };

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
      setImageChanged(true);
      
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
    setImagePreview(originalImageUrl || null);
    setImageChanged(true);
    
    // Reset file input
    const fileInput = document.getElementById('image-input');
    if (fileInput) fileInput.value = '';
  };

  const revertToOriginalImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(originalImageUrl || null);
    setImageChanged(false);
    
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
      
      // Prepare update data - only include changed fields
      const updateData = {
        id: parseInt(id),
        title: formData.title.trim(),
        content: formData.content.trim(),
        startDate: startDateTime,
        endDate: endDateTime,
        platform: formData.platform,
        priority: formData.priority,
        type: formData.type,
        allowFeedback: formData.allowFeedback,
        active: formData.active
      };
      
      // Include image only if it was changed
      if (imageChanged) {
        updateData.image = formData.image; // Could be null if removed
      }
      
      const result = await newsApi.updateNews(updateData);
      
      if (result && result.success !== false) {
        setMessage({ text: 'Haber başarıyla güncellendi! Haber listesine yönlendiriliyorsunuz...', isError: false });
        
        // Redirect to news list after 2 seconds
        setTimeout(() => {
          navigate('/news');
        }, 2000);
      } else {
        setMessage({ text: result.message || 'Haber güncellenirken bir hata oluştu', isError: true });
      }
    } catch (error) {
      console.error('News update failed:', error);
      setMessage({ text: `Haber güncellenirken hata: ${error.message || error}`, isError: true });
    } finally {
      setIsLoading(false);
    }
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

  if (pageLoading) {
    return (
      <div className="news-edit-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Haber verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="news-edit-container">
      <div className="news-edit-header">
        <h1 className="page-title">✏️ Haber Düzenle</h1>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/news')}
            className="btn btn-secondary"
          >
            ← Haber Listesi
          </button>
        </div>
      </div>

      <div className="news-edit-form-container">
        <form onSubmit={handleSubmit} className="news-form">
          {/* News ID Display */}
          <div className="news-id-display">
            <strong>Haber ID:</strong> {id}
          </div>

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
                    📁 Görsel Seç
                  </label>
                  <p>PNG, JPG, JPEG (Max 5MB)</p>
                </div>
              ) : (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <div className="image-actions">
                    <button 
                      type="button" 
                      onClick={removeImage}
                      className="btn btn-danger btn-sm"
                    >
                      🗑️ Kaldır
                    </button>
                    {originalImageUrl && imageChanged && (
                      <button 
                        type="button" 
                        onClick={revertToOriginalImage}
                        className="btn btn-secondary btn-sm"
                      >
                        ↶ Geri Al
                      </button>
                    )}
                    <input
                      id="image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden-input"
                    />
                    <label htmlFor="image-input" className="btn btn-primary btn-sm">
                      🔄 Değiştir
                    </label>
                  </div>
                </div>
              )}
            </div>
            {errors.image && <span className="error-message">{errors.image}</span>}
            {imageChanged && (
              <small className="form-hint">* Görsel değiştirildi</small>
            )}
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
                  Güncelleniyor...
                </>
              ) : (
                '💾 Haberi Güncelle'
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/news')}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              ❌ İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsEdit; 