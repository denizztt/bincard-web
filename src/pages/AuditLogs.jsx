import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  Calendar,
  Filter,
  Search,
  FileText,
  Clock,
  Wifi,
  Monitor
} from 'lucide-react';
import { auditLogsApi } from '../services/apiService';
import { ActionType, getActionTypeDisplayName } from '../types';
import '../styles/AuditLogs.css';

const AuditLogs = () => {
  const navigate = useNavigate();
  
  // State management - AuditLogsPage.java'ya benzer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [statusMessage, setStatusMessage] = useState('Denetim kayıtları yükleniyor...');
  
  // Filtreleme state
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAction, setSelectedAction] = useState('Tümü');

  // AuditLogsPage.loadAuditLogs'e benzer
  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError('');
      setStatusMessage('Denetim kayıtları yükleniyor...');

      // Seçilen aksiyonu API formatına dönüştür
      const actionParam = selectedAction && selectedAction !== 'Tümü' && !selectedAction.startsWith('----') 
        ? selectedAction 
        : undefined;

      // API çağrısı - AuditLogsPage'deki parseAuditLogsResponse mantığına benzer
      const response = await auditLogsApi.getAuditLogs(fromDate, toDate, actionParam);
      
      if (response && response.success) {
        const logs = parseAuditLogsFromResponse(response);
        setAuditLogs(logs);
        
        if (logs.length === 0) {
          setStatusMessage('Gösterilecek denetim kaydı bulunamadı.');
        } else {
          setStatusMessage(`Son güncelleme: ${new Date().toLocaleString('tr-TR')} (${logs.length} kayıt)`);
        }
      } else {
        throw new Error(response?.message || 'API yanıtı başarısız');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Audit logs yüklenirken hata:', err);
      setError('Denetim kayıtları yüklenemedi');
      setAuditLogs([]);
      setStatusMessage('Denetim kayıtları yüklenemedi');
      setLoading(false);
    }
  };

  // AuditLogsPage.parseAuditLogsResponse'a benzer
  const parseAuditLogsFromResponse = (response) => {
    const logs = [];
    
    try {
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(item => {
          const log = parseAuditLogObject(item);
          if (log) {
            logs.push(log);
          }
        });
      }
    } catch (error) {
      console.error('Audit logs parse hatası:', error);
    }
    
    return logs;
  };

  // AuditLogsPage.parseAuditLogObject'e benzer
  const parseAuditLogObject = (logData) => {
    try {
      const formattedTimestamp = formatTimestamp(logData.timestamp);
      const displayAction = formatActionForDisplay(logData.action);
      
      return {
        id: logData.id?.toString() || '0',
        action: logData.action || 'UNKNOWN',
        displayAction,
        description: logData.description || '',
        timestamp: formattedTimestamp,
        ipAddress: logData.ipAddress || '',
        deviceInfo: logData.deviceInfo || ''
      };
    } catch (error) {
      console.error('Audit log object parse hatası:', error);
      return null;
    }
  };

  // AuditLogsPage.formatTimestamp'e benzer
  const formatTimestamp = (isoTimestamp) => {
    if (!isoTimestamp) return '';
    
    try {
      const date = new Date(isoTimestamp);
      return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    } catch (error) {
      return isoTimestamp;
    }
  };

  // AuditLogsPage.formatActionForDisplay'e benzer
  const formatActionForDisplay = (action) => {
    if (!action) return 'BİLİNMİYOR';
    
    // ActionType enum'da var mı kontrol et
    const actionType = Object.values(ActionType).find(type => type === action);
    if (actionType) {
      return getActionTypeDisplayName(actionType);
    }
    
    // Enum'da yoksa basit formatlama yap
    return action.replace(/_/g, ' ');
  };

  const clearFilters = () => {
    setFromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setSelectedAction('Tümü');
    loadAuditLogs();
  };

  // AuditLogsPage'deki satır renklendirme mantığına benzer
  const getRowClassName = (action) => {
    if (!action) return '';
    
    if (action.includes('DELETE') || action.includes('REJECT') || 
        action.includes('BLOCK') || action.includes('DEACTIVATE')) {
      return 'row-delete'; // Açık kırmızı - Silme/İptal işlemleri
    } 
    else if (action.includes('CREATE') || action.includes('ADD') || 
            action.includes('SIGN_UP') || action.includes('ENABLE')) {
      return 'row-create'; // Açık yeşil - Ekleme/Oluşturma işlemleri
    }
    else if (action.includes('LOGIN') || action.includes('VERIFY')) {
      return 'row-login'; // Açık mavi - Giriş/Doğrulama işlemleri
    }
    else if (action.includes('UPDATE') || action.includes('CHANGE') || 
            action.includes('EDIT')) {
      return 'row-update'; // Açık sarı - Güncelleme işlemleri
    }
    else if (action.includes('EXPORT') || action.includes('REPORT')) {
      return 'row-export'; // Açık turkuaz - Rapor işlemleri
    }
    else if (action.includes('APPROVE') || action.includes('ACTIVATE') || 
            action.includes('PROMOTE')) {
      return 'row-approve'; // Koyu yeşil - Onay/Aktivasyon işlemleri
    }
    else if (action.includes('SYSTEM')) {
      return 'row-system'; // Mor - Sistem işlemleri
    }
    
    return '';
  };

  // Action type seçeneklerini kategoriler halinde oluştur
  const createActionOptions = () => {
    const options = [
      { value: 'Tümü', label: 'Tümü', isCategory: false }
    ];

    // Kategoriler ve action'lar - AuditLogsPage'deki gibi
    const categories = [
      {
        title: '🔐 GİRİŞ / GÜVENLİK',
        actions: [ActionType.LOGIN, ActionType.LOGOUT, ActionType.RESET_PASSWORD, ActionType.CHANGE_PASSWORD]
      },
      {
        title: '👤 KULLANICI HESABI',
        actions: [ActionType.SIGN_UP, ActionType.UPDATE_PROFILE, ActionType.DELETE_USER, 
                 ActionType.DEACTIVATE_ACCOUNT, ActionType.ACTIVATE_ACCOUNT]
      },
      {
        title: '🛡️ YETKİLENDİRME / ADMIN',
        actions: [ActionType.APPROVE_ADMIN, ActionType.BLOCK_USER, ActionType.UNBLOCK_USER, 
                 ActionType.PROMOTE_TO_ADMIN, ActionType.DEMOTE_TO_USER]
      },
      {
        title: '🚌 KART İŞLEMLERİ',
        actions: [ActionType.ADD_BUS_CARD, ActionType.DELETE_BUS_CARD, ActionType.BUS_CARD_TOP_UP, 
                 ActionType.BUS_CARD_TRANSFER]
      },
      {
        title: '👛 CÜZDAN VE ÖDEME',
        actions: [ActionType.CREATE_WALLET, ActionType.DELETE_WALLET, ActionType.WALLET_TOP_UP, 
                 ActionType.WALLET_TRANSFER]
      },
      {
        title: '📊 RAPOR VE ANALİZ',
        actions: [ActionType.EXPORT_USER_DATA, ActionType.EXPORT_WALLET_HISTORY, 
                 ActionType.EXPORT_LOGIN_HISTORY]
      },
      {
        title: '⚙️ SİSTEM / GENEL',
        actions: [ActionType.SYSTEM_MAINTENANCE_START, ActionType.SYSTEM_MAINTENANCE_END]
      }
    ];

    categories.forEach(category => {
      options.push({ value: `----${category.title}`, label: category.title, isCategory: true });
      category.actions.forEach(action => {
        options.push({ value: action, label: action, isCategory: false });
      });
    });

    return options;
  };

  if (loading && auditLogs.length === 0) {
    return (
      <div className="audit-logs-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Denetim kayıtları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-logs-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-top">
          <div className="header-left">
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              <ArrowLeft size={20} />
              Dashboard
            </button>
            <h1 className="page-title">📋 Denetim Kayıtları</h1>
          </div>
          <div className="header-right">
            <button 
              onClick={loadAuditLogs}
              className="btn btn-primary"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              Yenile
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
          <button onClick={loadAuditLogs} className="retry-btn">
            <RefreshCw size={16} />
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-header">
          <h3>Filtreleme Seçenekleri</h3>
        </div>
        <div className="filters-content">
          <div className="filters-row">
            <div className="filter-group">
              <label>Başlangıç Tarihi:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="date-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Bitiş Tarihi:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="date-input"
              />
            </div>

            <div className="filter-group">
              <label>Aksiyon Türü:</label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="action-select"
              >
                {createActionOptions().map((option, index) => (
                  <option 
                    key={index} 
                    value={option.value}
                    disabled={option.isCategory}
                    className={option.isCategory ? 'option-category' : ''}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-actions">
              <button 
                onClick={loadAuditLogs}
                className="btn btn-primary"
                disabled={loading}
              >
                <Filter size={16} />
                Filtrele
              </button>
              <button 
                onClick={clearFilters}
                className="btn btn-outline"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="status-message">
        <p>{statusMessage}</p>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Aksiyon</th>
                <th>Açıklama</th>
                <th>Zaman</th>
                <th>IP Adresi</th>
                <th>Cihaz Bilgisi</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log.id} className={getRowClassName(log.action)}>
                    <td>{log.id}</td>
                    <td>
                      <div className="action-cell">
                        <FileText size={16} className="action-icon" />
                        {log.displayAction}
                      </div>
                    </td>
                    <td className="description-cell">{log.description}</td>
                    <td>
                      <div className="time-cell">
                        <Clock size={14} className="time-icon" />
                        {log.timestamp}
                      </div>
                    </td>
                    <td>
                      <div className="ip-cell">
                        <Wifi size={14} className="ip-icon" />
                        {log.ipAddress}
                      </div>
                    </td>
                    <td>
                      <div className="device-cell">
                        <Monitor size={14} className="device-icon" />
                        {log.deviceInfo}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    <div className="no-data-message">
                      <FileText size={48} className="no-data-icon" />
                      <p>Gösterilecek denetim kaydı bulunmuyor</p>
                      <button 
                        onClick={clearFilters}
                        className="btn btn-outline"
                      >
                        Filtreleri Temizle
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {auditLogs.length > 0 && (
        <div className="summary-section">
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Toplam Kayıt:</span>
              <span className="summary-value">{auditLogs.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Tarih Aralığı:</span>
              <span className="summary-value">{fromDate} - {toDate}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Filtre:</span>
              <span className="summary-value">{selectedAction}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs; 