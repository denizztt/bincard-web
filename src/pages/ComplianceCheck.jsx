import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/EnhancedAuthContext';
import {
  Shield,
  Search,
  LogOut,
  ChevronLeft,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  FileText,
  Clock,
  Download,
  Filter
} from 'lucide-react';
import { contractApi } from '../services/apiService';
import '../styles/ComplianceCheck.css';

const ComplianceCheck = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchUsername, setSearchUsername] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bulkCheckMode, setBulkCheckMode] = useState(false);
  const [bulkResults, setBulkResults] = useState([]);

  const handleSingleUserCheck = async () => {
    if (!searchUsername.trim()) {
      setError('Lütfen kullanıcı adı girin');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await contractApi.checkUserMandatoryStatus(searchUsername.trim());
      console.log('Compliance check result:', response);
      
      // Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
      const isCompliant = response.success !== undefined ? response.success : response.isSuccess;
      
      setComplianceData({
        username: searchUsername.trim(),
        isCompliant: isCompliant,
        message: response.message,
        checkedAt: new Date()
      });
      setSelectedUser(searchUsername.trim());
    } catch (err) {
      console.error('Error checking compliance:', err);
      if (err.response?.status === 404) {
        setError('Kullanıcı bulunamadı');
      } else {
        setError('Uyumluluk kontrolü yapılırken hata oluştu');
      }
      setComplianceData(null);
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSingleUserCheck();
    }
  };

  const handleBulkCheck = async () => {
    // Bu örnekte sadece UI'ı gösteriyoruz
    // Gerçek implementasyonda backend'den kullanıcı listesi alınır
    setBulkCheckMode(true);
    setLoading(true);
    
    // Simulated bulk check
    setTimeout(() => {
      setBulkResults([
        { username: 'user001', isCompliant: true, lastCheck: new Date() },
        { username: 'user002', isCompliant: false, lastCheck: new Date() },
        { username: 'user003', isCompliant: true, lastCheck: new Date() },
        { username: 'user004', isCompliant: false, lastCheck: new Date() },
      ]);
      setLoading(false);
    }, 2000);
  };

  const exportResults = () => {
    // CSV export functionality
    const csvContent = bulkResults.map(result => 
      `${result.username},${result.isCompliant ? 'Uyumlu' : 'Uyumsuz'},${result.lastCheck.toISOString()}`
    ).join('\n');
    
    const blob = new Blob([`Kullanıcı,Durum,Kontrol Tarihi\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uyumluluk-raporu-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getComplianceIcon = (isCompliant) => {
    return isCompliant ? CheckCircle : XCircle;
  };

  const getComplianceClass = (isCompliant) => {
    return isCompliant ? 'compliant' : 'non-compliant';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="compliance-check">
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
            <Shield size={28} />
            Uyumluluk Kontrolü
          </h1>
        </div>
        
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="control-panel">
        <div className="panel-section">
          <h3>Tekli Kullanıcı Kontrolü</h3>
          <p>Belirli bir kullanıcının zorunlu sözleşmeleri onaylayıp onaylamadığını kontrol edin</p>
          
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
                onClick={handleSingleUserCheck}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw size={20} className="spinning" />
                ) : (
                  <Search size={20} />
                )}
                Kontrol Et
              </button>
            </div>
          </div>
        </div>

        <div className="panel-section">
          <h3>Toplu Uyumluluk Kontrolü</h3>
          <p>Tüm kullanıcıların uyumluluk durumunu kontrol edin ve rapor alın</p>
          
          <div className="bulk-actions">
            <button 
              className="bulk-check-button"
              onClick={handleBulkCheck}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw size={20} className="spinning" />
              ) : (
                <Shield size={20} />
              )}
              Toplu Kontrol Başlat
            </button>
            
            {bulkResults.length > 0 && (
              <button 
                className="export-button"
                onClick={exportResults}
              >
                <Download size={20} />
                Rapor İndir
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Single User Results */}
      {!bulkCheckMode && selectedUser && complianceData && (
        <div className="results-section">
          <div className="user-compliance-card">
            <div className="card-header">
              <div className="user-info">
                <User size={24} />
                <div>
                  <h3>Kullanıcı: {selectedUser}</h3>
                  <p>Kontrol Tarihi: {formatDate(complianceData.checkedAt)}</p>
                </div>
              </div>
              <div className={`compliance-status ${getComplianceClass(complianceData.isCompliant)}`}>
                {React.createElement(getComplianceIcon(complianceData.isCompliant), { size: 32 })}
                <span>{complianceData.isCompliant ? 'Uyumlu' : 'Uyumsuz'}</span>
              </div>
            </div>

            <div className="card-content">
              <div className="status-message">
                <FileText size={20} />
                <p>{complianceData.message}</p>
              </div>

              {!complianceData.isCompliant && (
                <div className="warning-section">
                  <AlertTriangle size={24} />
                  <div>
                    <h4>Uyarı</h4>
                    <p>Bu kullanıcı tüm zorunlu sözleşmeleri onaylamamıştır. Kullanıcıdan eksik sözleşmeleri onaylaması istenmelidir.</p>
                  </div>
                </div>
              )}

              <div className="actions">
                <button 
                  className="view-contracts-button"
                  onClick={() => navigate(`/user-contract-tracking`)}
                >
                  <FileText size={16} />
                  Kullanıcı Sözleşmelerini Görüntüle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Results */}
      {bulkCheckMode && (
        <div className="bulk-results-section">
          <div className="bulk-header">
            <h3>Toplu Uyumluluk Kontrolü Sonuçları</h3>
            <div className="bulk-stats">
              <div className="stat compliant">
                <CheckCircle size={20} />
                <span>{bulkResults.filter(r => r.isCompliant).length} Uyumlu</span>
              </div>
              <div className="stat non-compliant">
                <XCircle size={20} />
                <span>{bulkResults.filter(r => !r.isCompliant).length} Uyumsuz</span>
              </div>
              <div className="stat total">
                <User size={20} />
                <span>{bulkResults.length} Toplam</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <RefreshCw size={32} className="spinning" />
              <p>Kullanıcılar kontrol ediliyor...</p>
            </div>
          ) : (
            <div className="bulk-results-table">
              <table>
                <thead>
                  <tr>
                    <th>Kullanıcı</th>
                    <th>Durum</th>
                    <th>Son Kontrol</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkResults.map((result, index) => {
                    const ComplianceIcon = getComplianceIcon(result.isCompliant);
                    return (
                      <tr key={index}>
                        <td>
                          <div className="user-cell">
                            <User size={16} />
                            {result.username}
                          </div>
                        </td>
                        <td>
                          <div className={`status-cell ${getComplianceClass(result.isCompliant)}`}>
                            <ComplianceIcon size={16} />
                            {result.isCompliant ? 'Uyumlu' : 'Uyumsuz'}
                          </div>
                        </td>
                        <td>{formatDate(result.lastCheck)}</td>
                        <td>
                          <button 
                            className="detail-button"
                            onClick={() => {
                              setSearchUsername(result.username);
                              setBulkCheckMode(false);
                              handleSingleUserCheck();
                            }}
                          >
                            Detay
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="bulk-actions-bottom">
            <button 
              className="back-to-single"
              onClick={() => setBulkCheckMode(false)}
            >
              Tekli Kontrole Dön
            </button>
            {bulkResults.length > 0 && (
              <button 
                className="export-button"
                onClick={exportResults}
              >
                <Download size={20} />
                Rapor İndir (CSV)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="info-panel">
        <h3>Uyumluluk Kontrolü Hakkında</h3>
        <div className="info-grid">
          <div className="info-item">
            <CheckCircle size={24} />
            <div>
              <h4>Uyumlu Kullanıcı</h4>
              <p>Tüm zorunlu sözleşmeleri onaylamış kullanıcılardır</p>
            </div>
          </div>
          <div className="info-item">
            <XCircle size={24} />
            <div>
              <h4>Uyumsuz Kullanıcı</h4>
              <p>Bir veya daha fazla zorunlu sözleşmeyi onaylamamış kullanıcılardır</p>
            </div>
          </div>
          <div className="info-item">
            <AlertTriangle size={24} />
            <div>
              <h4>Öneri</h4>
              <p>Uyumsuz kullanıcılara bildirim göndererek eksik sözleşmeleri onaylamaları sağlanmalıdır</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceCheck;