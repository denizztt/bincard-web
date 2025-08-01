import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { newsApi } from '../services/apiService';
import { NewsPlatform, NewsPriority, NewsType } from '../types';
import '../styles/NewsAdd.css';

const NewsAdd = () => {
  const navigate = useNavigate();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
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
  const [dragActive, setDragActive] = useState(false);

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

  const processImageFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Lütfen geçerli bir resim dosyası seçin' }));
      return false;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Resim dosyası 5MB\'dan küçük olmalıdır' }));
      return false;
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
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processImageFile(file);
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

  // Step management functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  // Step validation
  const validateCurrentStep = () => {
    const newErrors = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          newErrors.title = 'Başlık zorunludur';
        } else if (formData.title.length < 5) {
          newErrors.title = 'Başlık en az 5 karakter olmalıdır';
        }
        
        if (!formData.content.trim()) {
          newErrors.content = 'İçerik zorunludur';
        } else if (formData.content.length < 10) {
          newErrors.content = 'İçerik en az 10 karakter olmalıdır';
        }
        break;
      
      case 3:
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
        const now = new Date();
        
        if (startDateTime < now) {
          newErrors.startDate = 'Başlangıç tarihi gelecekte olmalıdır';
        }
        
        if (endDateTime <= startDateTime) {
          newErrors.endDate = 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>📝 Temel Bilgiler</h2>
              <p>Haberin başlığını ve içeriğini girin</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label required">Başlık</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Haber başlığını giriniz"
                  className={`modern-input ${errors.title ? 'error' : ''}`}
                  maxLength="200"
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
                <small className="form-hint">{formData.title.length}/200 karakter</small>
              </div>

              <div className="form-group full-width">
                <label className="form-label required">İçerik</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Haber içeriğini giriniz"
                  className={`modern-textarea ${errors.content ? 'error' : ''}`}
                  rows="8"
                  maxLength="5000"
                />
                {errors.content && <span className="error-message">{errors.content}</span>}
                <small className="form-hint">{formData.content.length}/5000 karakter</small>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>🖼️ Görsel Ekle</h2>
              <p>Haberiniz için bir görsel seçin (isteğe bağlı)</p>
            </div>
            
            <div className="image-upload-section">
              {!imagePreview ? (
                <div 
                  className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden-input"
                  />
                  
                  <div className="upload-content">
                    <div className="upload-icon">📸</div>
                    <h3>Resmi buraya sürükleyin</h3>
                    <p>ya da</p>
                    <label htmlFor="image-input" className="upload-button">
                      Dosya Seç
                    </label>
                    <small>PNG, JPG, JPEG • Max 5MB</small>
                  </div>
                </div>
              ) : (
                <div className="image-preview-container">
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <div className="image-overlay">
                      <button 
                        type="button" 
                        onClick={removeImage}
                        className="remove-image-btn"
                      >
                        🗑️ Kaldır
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {errors.image && <span className="error-message">{errors.image}</span>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>⚙️ Ayarlar</h2>
              <p>Haber kategorisi, platform ve öncelik seviyesini belirleyin</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">📂 Kategori</label>
                <select 
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="modern-select"
                >
                  {Object.values(NewsType).map(type => (
                    <option key={type} value={type}>{getTypeDisplayName(type)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">🌐 Platform</label>
                <select 
                  value={formData.platform}
                  onChange={(e) => handleInputChange('platform', e.target.value)}
                  className="modern-select"
                >
                  {Object.values(NewsPlatform).map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">⚡ Öncelik</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="modern-select"
                >
                  {Object.values(NewsPriority).map(priority => (
                    <option key={priority} value={priority}>{getPriorityDisplayName(priority)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-section">
              <h3>📅 Yayın Süresi</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Başlangıç Tarihi</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`modern-input ${errors.startDate ? 'error' : ''}`}
                  />
                  {errors.startDate && <span className="error-message">{errors.startDate}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Başlangıç Saati</label>
                  <select 
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="modern-select"
                  >
                    {generateTimeOptions().map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Bitiş Tarihi</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`modern-input ${errors.endDate ? 'error' : ''}`}
                  />
                  {errors.endDate && <span className="error-message">{errors.endDate}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Bitiş Saati</label>
                  <select 
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="modern-select"
                  >
                    {generateTimeOptions().map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>✅ Önizleme & Onay</h2>
              <p>Haberin son halini kontrol edin ve yayınlayın</p>
            </div>
            
            <div className="news-preview">
              <div className="preview-card">
                <div className="preview-header">
                  <div className="preview-meta">
                    <span className="preview-type">{getTypeDisplayName(formData.type)}</span>
                    <span className="preview-platform">{formData.platform}</span>
                    <span className="preview-priority">{getPriorityDisplayName(formData.priority)}</span>
                  </div>
                </div>
                
                <h3 className="preview-title">{formData.title}</h3>
                
                {imagePreview && (
                  <div className="preview-image">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
                
                <div className="preview-content">
                  {formData.content}
                </div>
                
                <div className="preview-footer">
                  <div className="preview-dates">
                    <strong>Yayın Süresi:</strong> {formData.startDate} {formData.startTime} - {formData.endDate} {formData.endTime}
                  </div>
                </div>
              </div>
            </div>

            <div className="final-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={formData.allowFeedback}
                  onChange={(e) => handleInputChange('allowFeedback', e.target.checked)}
                />
                <span className="checkmark"></span>
                💬 Geri Bildirime İzin Ver
              </label>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => handleInputChange('active', e.target.checked)}
                />
                <span className="checkmark"></span>
                🟢 Aktif Olarak Yayınla
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="news-add-container">
      <div className="news-add-header">
        <div className="header-top">
          <h1 className="page-title">✨ Yeni Haber Oluştur</h1>
          <button 
            onClick={() => navigate('/news')}
            className="btn btn-secondary"
          >
            ← Haber Listesi
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="progress-steps">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div 
              key={step}
              className={`progress-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
              onClick={() => goToStep(step)}
            >
              <div className="step-number">
                {currentStep > step ? '✓' : step}
              </div>
              <div className="step-label">
                {step === 1 && 'Temel Bilgiler'}
                {step === 2 && 'Görsel'}
                {step === 3 && 'Ayarlar'}
                {step === 4 && 'Önizleme'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="news-add-form-container">
        <div className="wizard-content">
          {/* Render current step content */}
          {renderStepContent()}
          
          {/* Message */}
          {message.text && (
            <div className={`message ${message.isError ? 'error' : 'success'}`}>
              {message.text}
            </div>
          )}
          
          {/* Navigation */}
          <div className="wizard-navigation">
            <div className="nav-left">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-outline"
                  disabled={isLoading}
                >
                  ← Önceki
                </button>
              )}
            </div>
            
            <div className="nav-right">
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  Sonraki →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`btn btn-success ${isLoading ? 'loading' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Yayınlanıyor...
                    </>
                  ) : (
                    <>
                      🚀 Haberi Yayınla
                    </>
                  )}
                </button>
              )}
              
              <button
                type="button"
                onClick={() => navigate('/news')}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                ✕ İptal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsAdd; 