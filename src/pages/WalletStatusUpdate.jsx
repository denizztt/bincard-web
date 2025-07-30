import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { walletStatusApi } from '../services/apiService';
import '../styles/WalletStatusUpdate.css';

const WalletStatusUpdate = () => {
  const navigate = useNavigate();
  
  // State management - WalletStatusUpdatePage.java'ya benzer
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // WalletStatusUpdatePage.updateWalletStatus'e benzer
  const handleUpdateWalletStatus = async () => {
    // Form validasyonu
    if (!phoneNumber.trim()) {
      showResult('Lütfen telefon numarasını girin.', false);
      return;
    }

    if (phoneNumber.length !== 11) {
      showResult('Telefon numarası 11 hane olmalıdır.', false);
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      // API çağrısı - WalletStatusUpdatePage'deki mantığa benzer
      const response = await walletStatusApi.updateWalletStatus(phoneNumber, isActive);
      
      if (response && response.success) {
        showResult('Cüzdan durumu başarıyla güncellendi.', true);
        setPhoneNumber(''); // Formu temizle
      } else {
        const errorMessage = extractErrorMessage(response);
        showResult(`Güncelleme başarısız: ${errorMessage}`, false);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Wallet status update hatası:', err);
      showResult(`Hata oluştu: ${err.message}`, false);
      setLoading(false);
    }
  };

  // WalletStatusUpdatePage.extractErrorMessage'a benzer
  const extractErrorMessage = (response) => {
    if (!response) return 'Bilinmeyen hata';
    
    try {
      return response.message || 'API yanıt hatası';
    } catch (error) {
      return 'JSON parsing hatası';
    }
  };

  // WalletStatusUpdatePage.showResult'a benzer
  const showResult = (message, success) => {
    setResult({
      message,
      success
    });
  };

  // Telefon numarası formatlaması - sadece rakam kabul et
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Sadece rakamlar
    if (value.length <= 11) {
      setPhoneNumber(value);
    }
  };

  return (
    <div className="wallet-status-update-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-top">
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            <ArrowLeft size={20} />
            Dashboard
          </button>
          <div className="title-section">
            <Edit3 size={28} className="title-icon" />
            <h1 className="page-title">Cüzdan Durumu Güncelleme</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Form Container */}
        <div className="form-container">
          <div className="form-header">
            <h2>Cüzdan Durumu Güncelle</h2>
            <p>Kullanıcının cüzdan durumunu aktif veya pasif yapabilirsiniz.</p>
          </div>

          <div className="form-content">
            {/* Telefon Numarası */}
            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label">
                <Phone size={16} />
                Telefon Numarası:
              </label>
              <input
                id="phoneNumber"
                type="text"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="örn: 05321234567 (11 hane)"
                className="form-input"
                maxLength={11}
              />
              <div className="input-info">
                {phoneNumber.length > 0 && (
                  <span className={phoneNumber.length === 11 ? 'valid' : 'invalid'}>
                    {phoneNumber.length}/11 hane
                  </span>
                )}
              </div>
            </div>

            {/* Cüzdan Durumu */}
            <div className="form-group">
              <label className="form-label">Cüzdan Durumu:</label>
              <div className="status-options">
                <label className={`status-option ${isActive ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="walletStatus"
                    checked={isActive}
                    onChange={() => setIsActive(true)}
                  />
                  <div className="option-content">
                    <CheckCircle size={20} className="option-icon active" />
                    <span>Aktif</span>
                  </div>
                </label>
                
                <label className={`status-option ${!isActive ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="walletStatus"
                    checked={!isActive}
                    onChange={() => setIsActive(false)}
                  />
                  <div className="option-content">
                    <XCircle size={20} className="option-icon inactive" />
                    <span>Pasif</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                onClick={handleUpdateWalletStatus}
                disabled={loading || !phoneNumber || phoneNumber.length !== 11}
                className="btn btn-primary btn-update"
              >
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <Edit3 size={16} />
                    Cüzdan Durumunu Güncelle
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className={`result-container ${result.success ? 'success' : 'error'}`}>
            <div className="result-content">
              <div className="result-icon">
                {result.success ? (
                  <CheckCircle size={24} />
                ) : (
                  <AlertCircle size={24} />
                )}
              </div>
              <div className="result-message">
                <h3>{result.success ? 'İşlem Başarılı' : 'İşlem Başarısız'}</h3>
                <p>{result.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="info-section">
          <h3>Bilgilendirme</h3>
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon active">
                <CheckCircle size={20} />
              </div>
              <div className="info-content">
                <h4>Aktif Cüzdan</h4>
                <p>Kullanıcı tüm cüzdan işlemlerini yapabilir (para gönderme, alma, bakiye görüntüleme vb.)</p>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon inactive">
                <XCircle size={20} />
              </div>
              <div className="info-content">
                <h4>Pasif Cüzdan</h4>
                <p>Kullanıcının cüzdan işlemleri geçici olarak devre dışı bırakılır</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletStatusUpdate; 