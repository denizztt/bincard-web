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
  CheckCircle,
  XCircle,
  CreditCard,
  DollarSign,
  Wallet
} from 'lucide-react';
import { autoTopUpApi } from '../services/apiService';
import '../styles/AutoTopUpLogs.css';

const AutoTopUpLogs = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);
  const [statusMessage, setStatusMessage] = useState('Otomatik yükleme logları yükleniyor...');
  
  // Filtreleme state
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [successFilter, setSuccessFilter] = useState('Tümü'); // Tümü, Başarılı, Başarısız
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      setStatusMessage('Otomatik yükleme logları yükleniyor...');

      const response = await autoTopUpApi.getAutoTopUpLogs();
      
      if (Array.isArray(response)) {
        let filteredLogs = response;
        
        // Başarı filtresi
        if (successFilter === 'Başarılı') {
          filteredLogs = filteredLogs.filter(log => log.success === true);
        } else if (successFilter === 'Başarısız') {
          filteredLogs = filteredLogs.filter(log => log.success === false);
        }
        
        // Tarih filtresi
        if (fromDate && toDate) {
          filteredLogs = filteredLogs.filter(log => {
            if (!log.timestamp) return false;
            const logDate = new Date(log.timestamp).toISOString().split('T')[0];
            return logDate >= fromDate && logDate <= toDate;
          });
        }
        
        // Arama filtresi
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filteredLogs = filteredLogs.filter(log => 
            (log.busCardNumber && log.busCardNumber.toLowerCase().includes(query)) ||
            (log.failureReason && log.failureReason.toLowerCase().includes(query)) ||
            (log.configId && log.configId.toString().includes(query))
          );
        }
        
        setLogs(filteredLogs);
        
        if (filteredLogs.length === 0) {
          setStatusMessage('Gösterilecek log kaydı bulunamadı.');
        } else {
          setStatusMessage(`Son güncelleme: ${new Date().toLocaleString('tr-TR')} (${filteredLogs.length} kayıt)`);
        }
      } else {
        throw new Error('API yanıtı beklenmeyen formatta');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('AutoTopUp logs yüklenirken hata:', err);
      setError('Otomatik yükleme logları yüklenemedi: ' + (err.response?.data?.message || err.message));
      setLogs([]);
      setStatusMessage('Otomatik yükleme logları yüklenemedi');
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

  const formatAmount = (amount) => {
    if (!amount) return '0.00';
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const clearFilters = () => {
    setFromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setSuccessFilter('Tümü');
    setSearchQuery('');
    loadLogs();
  };

  if (loading && logs.length === 0) {
    return (
      <div className="auto-top-up-logs-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Otomatik yükleme logları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auto-top-up-logs-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-top">
          <div className="header-left">
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              <ArrowLeft size={18} />
              Geri
            </button>
            <h1 className="page-title">📋 Otomatik Yükleme Log Kayıtları</h1>
          </div>
          <div className="header-right">
            <button 
              onClick={loadLogs}
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
          <button onClick={loadLogs} className="retry-btn">
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
              <label>Durum:</label>
              <select
                value={successFilter}
                onChange={(e) => setSuccessFilter(e.target.value)}
                className="status-select"
              >
                <option value="Tümü">Tümü</option>
                <option value="Başarılı">Başarılı</option>
                <option value="Başarısız">Başarısız</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Ara:</label>
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Kart numarası, hata mesajı..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button 
                onClick={loadLogs}
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
          <table className="auto-top-up-logs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Kart Numarası</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>Zaman</th>
                <th>Hata Nedeni</th>
                <th>Konfigürasyon ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr 
                    key={log.id} 
                    className={log.success ? 'row-success' : 'row-failed'}
                  >
                    <td>{log.id}</td>
                    <td>
                      <div className="card-cell">
                        <CreditCard size={16} className="card-icon" />
                        {log.busCardNumber || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="amount-cell">
                        <DollarSign size={16} className="amount-icon" />
                        {formatAmount(log.amount)} TL
                      </div>
                    </td>
                    <td>
                      <div className={`status-cell ${log.success ? 'status-success' : 'status-failed'}`}>
                        {log.success ? (
                          <>
                            <CheckCircle size={16} />
                            <span>Başarılı</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} />
                            <span>Başarısız</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="time-cell">
                        <Clock size={14} className="time-icon" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                    <td className="failure-reason-cell">
                      {log.failureReason || '-'}
                    </td>
                    <td>{log.configId || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="no-data-message">
                      <FileText size={48} className="no-data-icon" />
                      <p>Gösterilecek log kaydı bulunmuyor</p>
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
      {logs.length > 0 && (
        <div className="summary-section">
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Toplam Kayıt:</span>
              <span className="summary-value">{logs.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Başarılı:</span>
              <span className="summary-value success">{logs.filter(l => l.success).length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Başarısız:</span>
              <span className="summary-value failed">{logs.filter(l => !l.success).length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Toplam Tutar:</span>
              <span className="summary-value">
                {formatAmount(logs.filter(l => l.success && l.amount).reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0))} TL
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Tarih Aralığı:</span>
              <span className="summary-value">{fromDate} - {toDate}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoTopUpLogs;

