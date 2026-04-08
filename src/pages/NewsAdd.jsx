import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';
import { newsApi } from '../services/apiService';
import '../styles/NewsAdd.css';

const NewsAdd = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    startDate: '',
    endDate: '',
    platform: 'WEB',
    priority: 'NORMAL',
    type: 'BILGILENDIRME',
    allowFeedback: true
  });
  
  const [files, setFiles] = useState({
    thumbnail: null,
    image: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrls, setPreviewUrls] = useState({
    thumbnail: '',
    image: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya türü kontrolü
    if (!file.type.startsWith('image/')) {
      setError('Sadece resim dosyaları yüklenebilir.');
      return;
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu 5MB\'dan küçük olmalıdır.');
      return;
    }

    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));

    // Preview oluştur
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrls(prev => ({
        ...prev,
        [fileType]: e.target.result
      }));
    };
    reader.readAsDataURL(file);
    
    setError('');
  };

  const removeFile = (fileType) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: null
    }));
    setPreviewUrls(prev => ({
      ...prev,
      [fileType]: ''
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Haber başlığı gereklidir.');
      return false;
    }
    
    if (!formData.content.trim()) {
      setError('Haber içeriği gereklidir.');
      return false;
    }

    if (!files.thumbnail) {
      setError('Kapak görseli gereklidir.');
      return false;
    }

    if (!formData.startDate) {
      setError('Başlangıç tarihi gereklidir.');
      return false;
    }

    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError('Bitiş tarihi başlangıç tarihinden sonra olmalıdır.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const submitFormData = new FormData();
      
      // Form verilerini ekle
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitFormData.append(key, formData[key]);
        }
      });

      // Dosyaları ekle
      if (files.thumbnail) {
        submitFormData.append('thumbnail', files.thumbnail);
      }
      if (files.image) {
        submitFormData.append('image', files.image);
      }

      const response = await newsApi.createNews(submitFormData);
      
      if (response.success) {
        setSuccess('Haber başarıyla oluşturuldu!');
        setTimeout(() => {
          navigate('/news');
        }, 2000);
      } else {
        setError(response.message || 'Haber oluşturulurken hata oluştu.');
      }
      
    } catch (err) {
      console.error('Haber oluşturma hatası:', err);
      setError('Haber oluşturulurken hata oluştu: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="news-add-container">
      <div className="news-add-header">
        <div className="header-left">
          <button 
            className="btn-back"
            onClick={() => navigate('/news')}
          >
            <ArrowLeft size={20} />
          </button>
          <h1>Yeni Haber Ekle</h1>
        </div>
        
        <div className="header-right">
          <button 
            className="btn-secondary"
            onClick={() => navigate('/news')}
            disabled={loading}
          >
            İptal
          </button>
          
          <button 
            className={`btn-primary ${loading ? 'loading' : ''}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Kaydet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="success-banner">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="news-add-content">
        <form onSubmit={handleSubmit} className="news-form">
          
          {/* Temel Bilgiler */}
          <div className="form-section">
            <h2>Temel Bilgiler</h2>
            
            <div className="form-group">
              <label htmlFor="title">
                Haber Başlığı <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Örn: Yeni Otobüs Hattı Açıldı veya Kart Fiyatları Güncellendi"
                maxLength={150}
                required
              />
              <small className="form-hint">Haber başlığını girin (maksimum 150 karakter). Örnek: Yeni Otobüs Hattı Açıldı, Kart Fiyatları Güncellendi</small>
              <small>{formData.title.length}/150 karakter</small>
            </div>

            <div className="form-group">
              <label htmlFor="content">
                Haber İçeriği <span className="required">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Örn: İstanbul Büyükşehir Belediyesi tarafından yeni bir otobüs hattı açıldı..."
                rows="8"
                required
              ></textarea>
              <small className="form-hint">Haber içeriğini detaylı olarak girin. Örnek: İstanbul Büyükşehir Belediyesi tarafından yeni bir otobüs hattı açıldı. Bu hat Taksim ve Kadıköy arasında hizmet verecek...</small>
              <small>{formData.content.length} karakter</small>
            </div>
          </div>

          {/* Görseller */}
          <div className="form-section">
            <h2>Görseller</h2>
            
            {/* Kapak Görseli */}
            <div className="form-group">
              <label>
                Kapak Görseli <span className="required">*</span>
              </label>
              <div className="file-upload-area">
                {previewUrls.thumbnail ? (
                  <div className="file-preview">
                    <img src={previewUrls.thumbnail} alt="Kapak önizleme" />
                    <button 
                      type="button"
                      className="remove-file-btn"
                      onClick={() => removeFile('thumbnail')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <Upload size={48} />
                    <p>Kapak görseli yükleyin</p>
                    <small>PNG, JPG veya JPEG - Maksimum 5MB</small>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                  hidden
                  id="thumbnail-upload"
                />
                <label htmlFor="thumbnail-upload" className="upload-btn">
                  <ImageIcon size={20} />
                  <span>{previewUrls.thumbnail ? 'Değiştir' : 'Dosya Seç'}</span>
                </label>
              </div>
            </div>

            {/* Ek Görsel */}
            <div className="form-group">
              <label>Ek Görsel (Opsiyonel)</label>
              <div className="file-upload-area">
                {previewUrls.image ? (
                  <div className="file-preview">
                    <img src={previewUrls.image} alt="Ek görsel önizleme" />
                    <button 
                      type="button"
                      className="remove-file-btn"
                      onClick={() => removeFile('image')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <Upload size={48} />
                    <p>Ek görsel yükleyin</p>
                    <small>PNG, JPG veya JPEG - Maksimum 5MB</small>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'image')}
                  hidden
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="upload-btn">
                  <ImageIcon size={20} />
                  <span>{previewUrls.image ? 'Değiştir' : 'Dosya Seç'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Kategoriler */}
          <div className="form-section">
            <h2>Kategoriler</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">
                  Haber Türü <span className="required">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="BILGILENDIRME">Bilgilendirme</option>
                  <option value="DUYURU">Duyuru</option>
                  <option value="KAMPANYA">Kampanya</option>
                  <option value="BAKIM">Bakım</option>
                  <option value="GUNCELLEME">Güncelleme</option>
                  <option value="UYARI">Uyarı</option>
                  <option value="ETKINLIK">Etkinlik</option>
                  <option value="BASIN_BULTENI">Basın Bülteni</option>
                  <option value="GUVENLIK">Güvenlik</option>
                  <option value="OZELLIK">Özellik</option>
                  <option value="HATIRLATMA">Hatırlatma</option>
                  <option value="KESINTI">Kesinti</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="platform">
                  Platform <span className="required">*</span>
                </label>
                <select
                  id="platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  required
                >
                  <option value="WEB">Web</option>
                  <option value="MOBILE">Mobil</option>
                  <option value="DESKTOP">Masaüstü</option>
                  <option value="TABLET">Tablet</option>
                  <option value="SMART_TV">Smart TV</option>
                  <option value="KIOSK">Kiosk</option>
                  <option value="ALL">Tüm Platformlar</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                Öncelik Düzeyi <span className="required">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
              >
                <option value="COK_DUSUK">Çok Düşük</option>
                <option value="DUSUK">Düşük</option>
                <option value="NORMAL">Normal</option>
                <option value="ORTA_YUKSEK">Orta Yüksek</option>
                <option value="YUKSEK">Yüksek</option>
                <option value="COK_YUKSEK">Çok Yüksek</option>
                <option value="KRITIK">Kritik</option>
              </select>
            </div>
          </div>

          {/* Tarih Ayarları */}
          <div className="form-section">
            <h2>Tarih Ayarları</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">
                  Başlangıç Tarihi <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
                <small>Haberin yayınlanacağı tarih</small>
              </div>

              <div className="form-group">
                <label htmlFor="endDate">Bitiş Tarihi (Opsiyonel)</label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
                <small>Haberin yayından kalkacağı tarih</small>
              </div>
            </div>
          </div>

          {/* Ek Ayarlar */}
          <div className="form-section">
            <h2>Ek Ayarlar</h2>
            
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="allowFeedback"
                  name="allowFeedback"
                  checked={formData.allowFeedback}
                  onChange={handleInputChange}
                />
                <label htmlFor="allowFeedback">
                  Kullanıcı geri bildirimlerine izin ver (beğeni, yorum)
                </label>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NewsAdd;
