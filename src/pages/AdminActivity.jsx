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
  Monitor,
  History
} from 'lucide-react';
import { adminApi } from '../services/apiService';
import { ActionType, getActionTypeDisplayName } from '../types';
import '../styles/AdminActivity.css';

const AdminActivity = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login-history'); // 'login-history', 'audit-logs'
  
  // Login History State
  const [loginHistory, setLoginHistory] = useState([]);
  const [loginHistoryPage, setLoginHistoryPage] = useState(0);
  const [loginHistorySize] = useState(10);
  
  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAction, setSelectedAction] = useState('Tümü');

  useEffect(() => {
    if (activeTab === 'login-history') {
      loadLoginHistory();
    } else {
      loadAuditLogs();
    }
  }, [activeTab, loginHistoryPage]);

  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await adminApi.getLoginHistory(loginHistoryPage, loginHistorySize, 'id,desc');
      
      if (response && response.success && response.data) {
        const pageData = response.data;
        if (Array.isArray(pageData.content)) {
          setLoginHistory(pageData.content);
        } else if (Array.isArray(pageData)) {
          setLoginHistory(pageData);
        } else {
          setLoginHistory([]);
        }
      } else {
        setLoginHistory([]);
      }
    } catch (err) {
      console.error('Giriş geçmişi yükleme hatası:', err);
      setError('Giriş geçmişi yüklenemedi');
      setLoginHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const actionParam = selectedAction && selectedAction !== 'Tümü' && !selectedAction.startsWith('----') 
        ? selectedAction 
        : undefined;

      const response = await adminApi.getAuditLogs(fromDate, toDate, actionParam);
      
      if (response && response.success && response.data) {
        const pageData = response.data;
        if (Array.isArray(pageData.content)) {
          setAuditLogs(pageData.content);
        } else if (Array.isArray(pageData)) {
          setAuditLogs(pageData);
        } else {
          setAuditLogs([]);
        }
      } else {
        setAuditLogs([]);
      }
    } catch (err) {
      console.error('Audit log yükleme hatası:', err);
      setError('Denetim kayıtları yüklenemedi');
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

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

  const formatActionForDisplay = (action) => {
    if (!action) return 'BİLİNMİYOR';
    
    const actionType = Object.values(ActionType).find(type => type === action);
    if (actionType) {
      return getActionTypeDisplayName(actionType);
    }
    
    return action.replace(/_/g, ' ');
  };

  const createActionOptions = () => {
    const options = [
      { value: 'Tümü', label: 'Tümü', isCategory: false }
    ];

    const categories = [
      {
        title: '🔐 GİRİŞ / GÜVENLİK',
        actions: [ActionType.LOGIN, ActionType.LOGOUT, ActionType.RESET_PASSWORD, ActionType.CHANGE_PASSWORD]
      },
      {
        title: '👤 KULLANICI HESABI',
        actions: [ActionType.SIGN_UP, ActionType.UPDATE_PROFILE, ActionType.DELETE_USER]
      },
      {
        title: '🛡️ YETKİLENDİRME / ADMIN',
        actions: [ActionType.APPROVE_ADMIN, ActionType.BLOCK_USER, ActionType.UNBLOCK_USER]
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

  const clearFilters = () => {
    setFromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setSelectedAction('Tümü');
    loadAuditLogs();
  };

  return (
    <div className="admin-activity-container">
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
            <h1 className="page-title">📊 Aktivitelerim</h1>
          </div>
          <div className="header-right">
            <button 
              onClick={() => activeTab === 'login-history' ? loadLoginHistory() : loadAuditLogs()}
              className="btn btn-secondary"
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
        </div>
      )}

      {/* Tabs */}
      <div className="activity-tabs">
        <button
          className={`tab-button ${activeTab === 'login-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('login-history')}
        >
          <History size={16} />
          Giriş Geçmişi
        </button>
        <button
          className={`tab-button ${activeTab === 'audit-logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit-logs')}
        >
          <FileText size={16} />
          Denetim Kayıtları
        </button>
      </div>

      {/* Login History Tab */}
      {activeTab === 'login-history' && (
        <div className="activity-content">
          <div className="table-container">
            <div className="table-wrapper">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>IP Adresi</th>
                    <th>Cihaz</th>
                    <th>Platform</th>
                    <th>Uygulama Versiyonu</th>
                    <th>Giriş Zamanı</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.length > 0 ? (
                    loginHistory.map((login, index) => (
                      <tr key={index}>
                        <td>
                          <div className="ip-cell">
                            <Wifi size={14} className="ip-icon" />
                            {login.ipAddress || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div className="device-cell">
                            <Monitor size={14} className="device-icon" />
                            {login.device || 'N/A'}
                          </div>
                        </td>
                        <td>{login.platform || 'N/A'}</td>
                        <td>{login.appVersion || 'N/A'}</td>
                        <td>
                          <div className="time-cell">
                            <Clock size={14} className="time-icon" />
                            {formatTimestamp(login.loginAt)}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">
                        <div className="no-data-message">
                          <History size={48} className="no-data-icon" />
                          <p>Giriş geçmişi bulunmuyor</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit-logs' && (
        <div className="activity-content">
          {/* Filters */}
          <div className="filters-section">
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

          {/* Table */}
          <div className="table-container">
            <div className="table-wrapper">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Aksiyon</th>
                    <th>Açıklama</th>
                    <th>Zaman</th>
                    <th>IP Adresi</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.id}</td>
                        <td>
                          <div className="action-cell">
                            <FileText size={16} className="action-icon" />
                            {formatActionForDisplay(log.action)}
                          </div>
                        </td>
                        <td className="description-cell">{log.description || 'N/A'}</td>
                        <td>
                          <div className="time-cell">
                            <Clock size={14} className="time-icon" />
                            {formatTimestamp(log.timestamp)}
                          </div>
                        </td>
                        <td>
                          <div className="ip-cell">
                            <Wifi size={14} className="ip-icon" />
                            {log.ipAddress || 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">
                        <div className="no-data-message">
                          <FileText size={48} className="no-data-icon" />
                          <p>Denetim kaydı bulunmuyor</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivity;

