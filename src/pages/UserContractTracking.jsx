import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/EnhancedAuthContext';
import ThemeToggle from '../components/ThemeToggle';
import {
  FileText,
  Search,
  LogOut,
  ChevronLeft,
  User,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Eye,
  Calendar,
  Globe,
  Smartphone
} from 'lucide-react';
import { contractApi } from '../services/apiService';
import '../styles/UserContractTracking.css';

const UserContractTracking = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchUsername, setSearchUsername] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userContracts, setUserContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Contract types mapping
  const contractTypes = {
    KULLANIM_KOSULLARI: 'Kullanım Koşulları',
    GIZLILIK_POLITIKASI: 'Gizlilik Politikası',
    VERI_ISLEME_IZNI: 'Kişisel Verilerin İşlenmesine İlişkin Açık Rıza',
    PAZARLAMA_IZNI: 'Pazarlama Amaçlı Açık Rıza',
    CEREZ_POLITIKASI: 'Çerez Politikası',
    HIZMET_SOZLESMESI: 'Hizmet Sözleşmesi',
    LOYALTY_PROGRAMI_KOSULLARI: 'Sadakat Programı Katılım Koşulları',
    UYELIK_SOZLESMESI: 'Üyelik Sözleşmesi',
    KAMPANYA_KATILIM_KOSULLARI: 'Kampanya Katılım Koşulları',
    AYDINLATMA_METNI: 'KVKK Aydınlatma Metni',
    DIGER: 'Diğer'
  };

  const handleSearch = async () => {
    if (!searchUsername.trim()) {
      setError('Lütfen kullanıcı adı girin');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await contractApi.getUserAcceptedContracts(searchUsername.trim());
      console.log('User contracts loaded:', response);
      
      if (Array.isArray(response)) {
        setUserContracts(response);
        setSelectedUser(searchUsername.trim());
      } else {
        setUserContracts([]);
        setSelectedUser(searchUsername.trim());
      }
    } catch (err) {
      console.error('Error loading user contracts:', err);
      if (err.response?.status === 404) {
        setError('Kullanıcı bulunamadı');
      } else {
        setError('Kullanıcı sözleşmeleri yüklenirken hata oluştu');
      }
      setUserContracts([]);
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewDetail = (contract) => {
    setSelectedContract(contract);
    setShowDetailModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (contract) => {
    if (contract.accepted === true) {
      return {
        icon: CheckCircle,
        text: 'Onaylandı',
        className: 'accepted'
      };
    } else if (contract.accepted === false) {
      return {
        icon: XCircle,
        text: 'Reddedildi',
        className: 'rejected'
      };
    } else {
      return {
        icon: Clock,
        text: 'Beklemede',
        className: 'pending'
      };
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="user-contract-tracking">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            <ChevronLeft size={24} />
          </button>
          <h1>
            <User size={28} />
            Kullanıcı Sözleşme Takibi
          </h1>
        </div>
        
        <div className="header-right">
          <ThemeToggle />
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-group">
            <User size={20} />
            <input
              type="text"
              placeholder="Kullanıcı adı girin..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="search-button"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw size={20} className="spinning" />
              ) : (
                <Search size={20} />
              )}
              Ara
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="results-section">
        {selectedUser && (
          <div className="user-header">
            <div className="user-info">
              <User size={24} />
              <div>
                <h3>Kullanıcı: {selectedUser}</h3>
                <p>{userContracts.length} sözleşme kaydı bulundu</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <RefreshCw size={32} className="spinning" />
            <p>Kullanıcı sözleşmeleri yükleniyor...</p>
          </div>
        ) : selectedUser ? (
          userContracts.length > 0 ? (
            <div className="contracts-grid">
              {userContracts.map((contract) => {
                const statusInfo = getStatusInfo(contract);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={contract.acceptanceId} className={`contract-card ${statusInfo.className}`}>
                    <div className="contract-header">
                      <div className="contract-title">
                        <FileText size={20} />
                        <h4>{contract.contractTitle}</h4>
                      </div>
                      <div className={`status-badge ${statusInfo.className}`}>
                        <StatusIcon size={16} />
                        {statusInfo.text}
                      </div>
                    </div>

                    <div className="contract-info">
                      <div className="info-row">
                        <span className="label">Tip:</span>
                        <span className="value">{contractTypes[contract.contractType]}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Versiyon:</span>
                        <span className="value">v{contract.contractVersion}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Zorunlu:</span>
                        <span className={`value ${contract.contractMandatory ? 'mandatory' : 'optional'}`}>
                          {contract.contractMandatory ? 'Evet' : 'Hayır'}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="label">Onay Tarihi:</span>
                        <span className="value">{formatDate(contract.acceptedAt)}</span>
                      </div>
                      {contract.rejectionReason && (
                        <div className="info-row">
                          <span className="label">Red Sebebi:</span>
                          <span className="value rejection-reason">{contract.rejectionReason}</span>
                        </div>
                      )}
                    </div>

                    <div className="contract-actions">
                      <button 
                        className="detail-button"
                        onClick={() => handleViewDetail(contract)}
                      >
                        <Eye size={16} />
                        Detay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-data">
              <FileText size={48} />
              <p>Bu kullanıcı için sözleşme kaydı bulunamadı</p>
              <span>Kullanıcı henüz hiçbir sözleşmeyi onaylamamış veya reddetmemiş olabilir.</span>
            </div>
          )
        ) : (
          <div className="no-search">
            <Search size={48} />
            <p>Kullanıcı sözleşme durumunu görüntülemek için yukarıdan kullanıcı adı ile arama yapın</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedContract && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sözleşme Detayları</h3>
              <button 
                className="close-button"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="contract-details">
                <div className="detail-section">
                  <h4>Sözleşme Bilgileri</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Başlık:</label>
                      <span>{selectedContract.contractTitle}</span>
                    </div>
                    <div className="detail-item">
                      <label>Tip:</label>
                      <span>{contractTypes[selectedContract.contractType]}</span>
                    </div>
                    <div className="detail-item">
                      <label>Versiyon:</label>
                      <span>v{selectedContract.contractVersion}</span>
                    </div>
                    <div className="detail-item">
                      <label>Zorunlu:</label>
                      <span className={selectedContract.contractMandatory ? 'mandatory' : 'optional'}>
                        {selectedContract.contractMandatory ? 'Evet' : 'Hayır'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Kullanıcı İşlemi</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Durum:</label>
                      <span className={`status ${getStatusInfo(selectedContract).className}`}>
                        {getStatusInfo(selectedContract).text}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>İşlem Tarihi:</label>
                      <span>
                        <Calendar size={16} />
                        {formatDate(selectedContract.acceptedAt)}
                      </span>
                    </div>
                    {selectedContract.ipAddress && (
                      <div className="detail-item">
                        <label>IP Adresi:</label>
                        <span>
                          <Globe size={16} />
                          {selectedContract.ipAddress}
                        </span>
                      </div>
                    )}
                    {selectedContract.userAgent && (
                      <div className="detail-item">
                        <label>Cihaz Bilgisi:</label>
                        <span>
                          <Smartphone size={16} />
                          {selectedContract.userAgent}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedContract.rejectionReason && (
                  <div className="detail-section">
                    <h4>Red Sebebi</h4>
                    <div className="rejection-reason-detail">
                      <XCircle size={20} />
                      <p>{selectedContract.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="close-button"
                onClick={() => setShowDetailModal(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserContractTracking;