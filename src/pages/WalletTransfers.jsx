import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw,
  ArrowLeftRight,
  Filter,
  Search,
  Download,
  FileText,
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { walletTransfersApi } from '../services/apiService';
import '../styles/WalletTransfers.css';

const WalletTransfers = () => {
  const navigate = useNavigate();
  
  // State management - WalletTransfersPage.java'ya benzer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transfers, setTransfers] = useState([]);
  const [totalTransfers, setTotalTransfers] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Filtreleme state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tümü');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // WalletTransfersPage.loadTransfersFromApi'ye benzer
  useEffect(() => {
    loadTransfersFromApi();
  }, []);

  const loadTransfersFromApi = async () => {
    try {
      setLoading(true);
      setError('');

      // API çağrısı - WalletTransfersPage'deki parseTransfersFromJson mantığına benzer
      const statusParam = statusFilter !== 'Tümü' ? statusFilter : undefined;
      const response = await walletTransfersApi.getWalletTransfers(
        statusParam, startDate, endDate, 0, 100, 'timestamp', 'desc'
      );
      
      if (response && response.success) {
        const transfersData = parseTransfersFromResponse(response);
        setTransfers(transfersData);
        updateStats(transfersData);
      } else {
        throw new Error(response?.message || 'API yanıtı başarısız');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Transfers yüklenirken hata:', err);
      setError('API mevcut değil, örnek verilerle gösteriliyor');
      
      // Hata durumunda örnek verilerle devam et
      const sampleData = createSampleTransfers();
      setTransfers(sampleData);
      updateStats(sampleData);
      setLoading(false);
    }
  };

  // WalletTransfersPage.parseTransfersFromJson'a benzer
  const parseTransfersFromResponse = (response) => {
    try {
      const data = response.data || {};
      const content = data.content || [];
      
      return content.map(item => parseTransferObject(item)).filter(Boolean);
    } catch (error) {
      console.error('Transfers parse hatası:', error);
      return [];
    }
  };

  // WalletTransfersPage'deki transfer object parse mantığına benzer
  const parseTransferObject = (transferData) => {
    try {
      return {
        id: transferData.id || 0,
        senderWiban: transferData.senderWiban || '',
        receiverWiban: transferData.receiverWiban || '',
        amount: parseFloat(transferData.amount) || 0,
        currency: transferData.currency || 'TRY',
        status: transferData.status || 'UNKNOWN',
        timestamp: transferData.timestamp || '',
        description: transferData.description || ''
      };
    } catch (error) {
      console.error('Transfer object parse hatası:', error);
      return null;
    }
  };

  // Örnek veri oluşturma - API hata durumunda
  const createSampleTransfers = () => {
    const sampleTransfers = [];
    const statuses = ['SUCCESS', 'PENDING', 'FAILED', 'CANCELLED'];
    
    for (let i = 1; i <= 20; i++) {
      sampleTransfers.push({
        id: i,
        senderWiban: `TR${String(i).padStart(6, '0')}00001234567890`,
        receiverWiban: `TR${String(i + 100).padStart(6, '0')}00009876543210`,
        amount: Math.random() * 5000 + 100,
        currency: 'TRY',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: `Transfer işlemi #${i}`
      });
    }
    return sampleTransfers;
  };

  // WalletTransfersPage.updateStats'a benzer
  const updateStats = (transfersData) => {
    setTotalTransfers(transfersData.length);
    const total = transfersData.reduce((sum, transfer) => sum + transfer.amount, 0);
    setTotalAmount(total);
  };

  // Formatters
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    
    try {
      const date = new Date(isoDate);
      return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="status-badge success">Başarılı</span>;
      case 'PENDING':
        return <span className="status-badge pending">Beklemede</span>;
      case 'FAILED':
        return <span className="status-badge failed">Başarısız</span>;
      case 'CANCELLED':
        return <span className="status-badge cancelled">İptal Edildi</span>;
      default:
        return <span className="status-badge unknown">Bilinmiyor</span>;
    }
  };

  // WIBAN kısaltma
  const shortenWiban = (wiban) => {
    if (!wiban || wiban.length <= 15) return wiban;
    return wiban.substring(0, 15) + '...';
  };

  // Filtreleme
  const applyFilters = () => {
    loadTransfersFromApi();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('Tümü');
    setStartDate('');
    setEndDate('');
    loadTransfersFromApi();
  };

  // WalletTransfersPage.downloadExcel'e benzer
  const handleExcelDownload = async () => {
    try {
      setLoading(true);
      
      const statusParam = statusFilter !== 'Tümü' ? statusFilter : undefined;
      const blob = await walletTransfersApi.exportTransferExcel(statusParam, startDate, endDate);
      
      // Dosyayı indir
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `transfer_raporu_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setLoading(false);
    } catch (error) {
      console.error('Excel indirme hatası:', error);
      alert('Excel raporu indiriliyor... (Demo)');
      setLoading(false);
    }
  };

  if (loading && transfers.length === 0) {
    return (
      <div className="wallet-transfers-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Transfer işlemleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-transfers-container">
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
            <div className="title-section">
              <ArrowLeftRight size={28} className="title-icon" />
              <h1 className="page-title">Transfer İşlemleri</h1>
            </div>
          </div>
          <div className="header-right">
            <button 
              onClick={handleExcelDownload}
              className="btn btn-success"
              disabled={loading}
            >
              <Download size={16} />
              Excel İndir
            </button>
            <button 
              onClick={loadTransfersFromApi}
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
          <button onClick={loadTransfersFromApi} className="retry-btn">
            <RefreshCw size={16} />
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stats-card">
            <div className="stats-icon transfers">
              <FileText size={24} />
            </div>
            <div className="stats-content">
              <div className="stats-value">{totalTransfers.toLocaleString()}</div>
              <div className="stats-label">Toplam Transfer</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon amount">
              <DollarSign size={24} />
            </div>
            <div className="stats-content">
              <div className="stats-value">{formatCurrency(totalAmount)}</div>
              <div className="stats-label">Toplam Tutar</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-header">
          <h3>Filtreleme ve Arama</h3>
        </div>
        <div className="filters-content">
          <div className="filters-row-1">
            <div className="search-group">
              <label>Arama:</label>
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Transfer ID veya WIBAN ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Durum:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="Tümü">Tüm Durumlar</option>
                <option value="SUCCESS">Başarılı</option>
                <option value="PENDING">Beklemede</option>
                <option value="FAILED">Başarısız</option>
                <option value="CANCELLED">İptal Edildi</option>
              </select>
            </div>
          </div>

          <div className="filters-row-2">
            <div className="date-group">
              <label>Tarih Aralığı:</label>
              <div className="date-inputs">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                  placeholder="Başlangıç"
                />
                <span>-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                  placeholder="Bitiş"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button 
                onClick={applyFilters}
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
          <table className="transfers-table">
            <thead>
              <tr>
                <th>Transfer ID</th>
                <th>Gönderen WIBAN</th>
                <th>Alıcı WIBAN</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>Tarih/Saat</th>
                <th>Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length > 0 ? (
                transfers.map((transfer) => (
                  <tr key={transfer.id}>
                    <td>
                      <div className="transfer-id-cell">
                        <ArrowLeftRight size={16} className="cell-icon" />
                        {transfer.id}
                      </div>
                    </td>
                    <td className="wiban-cell">{shortenWiban(transfer.senderWiban)}</td>
                    <td className="wiban-cell">{shortenWiban(transfer.receiverWiban)}</td>
                    <td className="amount-cell">
                      <span className="amount-value">
                        {formatCurrency(transfer.amount)}
                      </span>
                    </td>
                    <td>{getStatusBadge(transfer.status)}</td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={14} className="date-icon" />
                        {formatDate(transfer.timestamp)}
                      </div>
                    </td>
                    <td className="description-cell">
                      {transfer.description || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="no-data-message">
                      <ArrowLeftRight size={48} className="no-data-icon" />
                      <p>Gösterilecek transfer işlemi bulunmuyor</p>
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
      {transfers.length > 0 && (
        <div className="summary-section">
          <div className="summary-stats">
            <div className="summary-item">
              <TrendingUp size={20} className="summary-icon" />
              <div className="summary-content">
                <span className="summary-label">Toplam İşlem:</span>
                <span className="summary-value">{totalTransfers}</span>
              </div>
            </div>
            <div className="summary-item">
              <DollarSign size={20} className="summary-icon" />
              <div className="summary-content">
                <span className="summary-label">Toplam Tutar:</span>
                <span className="summary-value">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
            <div className="summary-item">
              <Calendar size={20} className="summary-icon" />
              <div className="summary-content">
                <span className="summary-label">Filtreleme:</span>
                <span className="summary-value">
                  {statusFilter} {startDate && `| ${startDate}`} {endDate && `- ${endDate}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletTransfers; 