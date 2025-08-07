import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw,
  Wallet,
  DollarSign,
  User,
  CreditCard,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { walletsApi } from '../services/apiService';
import '../styles/AllWallets.css';

const AllWallets = () => {
  const navigate = useNavigate();
  
  // State management - AllWalletsPage.java'ya benzer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wallets, setWallets] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWallets, setTotalWallets] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const pageSize = 10; // AllWalletsPage'deki gibi sabit

  // AllWalletsPage.loadWalletsData'ya benzer
  useEffect(() => {
    loadWalletsData(currentPage);
  }, [currentPage]);

  const loadWalletsData = async (page) => {
    try {
      setLoading(true);
      setError('');

      // API çağrısı - AllWalletsPage'deki parseWalletsResponse mantığına benzer
      const response = await walletsApi.getAllWallets(page, pageSize);
      
      if (response && response.success) {
        const walletsData = parseWalletsFromResponse(response);
        setWallets(walletsData.wallets);
        setTotalPages(walletsData.totalPages);
        setTotalWallets(walletsData.totalElements);
        updateStats(walletsData.wallets);
      } else {
        throw new Error(response?.message || 'API yanıtı başarısız');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Wallets yüklenirken hata:', err);
      setError('Cüzdan verileri yüklenemedi');
      setWallets([]);
      setTotalPages(0);
      setTotalWallets(0);
      setLoading(false);
    }
  };

  // AllWalletsPage.parseWalletsResponse'a benzer
  const parseWalletsFromResponse = (response) => {
    try {
      const data = response.data || {};
      const content = data.content || [];
      
      const wallets = content.map(item => parseWalletObject(item)).filter(Boolean);
      
      return {
        wallets,
        totalPages: data.totalPages || 1,
        totalElements: data.totalElements || 0
      };
    } catch (error) {
      console.error('Wallets parse hatası:', error);
      return { wallets: [], totalPages: 1, totalElements: 0 };
    }
  };

  // AllWalletsPage.parseWalletObject'e benzer
  const parseWalletObject = (walletData) => {
    try {
      return {
        walletId: walletData.walletId || 0,
        userId: walletData.userId || 0,
        wiban: walletData.wiban || '',
        currency: walletData.currency || 'TRY',
        balance: parseFloat(walletData.balance) || 0,
        status: walletData.status || 'UNKNOWN',
        lastUpdated: walletData.lastUpdated || '',
        totalTransactionCount: walletData.totalTransactionCount || 0
      };
    } catch (error) {
      console.error('Wallet object parse hatası:', error);
      return null;
    }
  };

  // AllWalletsPage.updateStats'a benzer
  const updateStats = (walletsData) => {
    const total = walletsData.reduce((sum, wallet) => sum + wallet.balance, 0);
    setTotalBalance(total);
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
      case 'ACTIVE':
        return <span className="status-badge active">Aktif</span>;
      case 'LOCKED':
        return <span className="status-badge locked">Kilitli</span>;
      case 'SUSPENDED':
        return <span className="status-badge suspended">Askıya Alındı</span>;
      default:
        return <span className="status-badge unknown">Bilinmiyor</span>;
    }
  };

  // Sayfalama kontrolleri
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderPaginationInfo = () => {
    const startItem = (currentPage * pageSize) + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalWallets);
    
    return `${startItem}-${endItem} / ${totalWallets}`;
  };

  if (loading && wallets.length === 0) {
    return (
      <div className="all-wallets-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cüzdan verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-wallets-container">
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
              <Wallet size={28} className="title-icon" />
              <h1 className="page-title">Tüm Cüzdanlar</h1>
            </div>
          </div>
          <div className="header-right">
            <button 
              onClick={() => loadWalletsData(currentPage)}
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
          <button onClick={() => loadWalletsData(currentPage)} className="retry-btn">
            <RefreshCw size={16} />
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stats-card">
            <div className="stats-icon">
              <Wallet size={24} />
            </div>
            <div className="stats-content">
              <div className="stats-value">{totalWallets.toLocaleString()}</div>
              <div className="stats-label">Toplam Cüzdan</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon balance">
              <DollarSign size={24} />
            </div>
            <div className="stats-content">
              <div className="stats-value">{formatCurrency(totalBalance)}</div>
              <div className="stats-label">Toplam Bakiye</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon page">
              <CreditCard size={24} />
            </div>
            <div className="stats-content">
              <div className="stats-value">{renderPaginationInfo()}</div>
              <div className="stats-label">Görüntülenen</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="wallets-table">
            <thead>
              <tr>
                <th>Cüzdan ID</th>
                <th>Kullanıcı ID</th>
                <th>WIBAN</th>
                <th>Bakiye</th>
                <th>Durum</th>
                <th>İşlem Sayısı</th>
                <th>Son Güncelleme</th>
              </tr>
            </thead>
            <tbody>
              {wallets.length > 0 ? (
                wallets.map((wallet) => (
                  <tr key={wallet.walletId}>
                    <td>
                      <div className="wallet-id-cell">
                        <Wallet size={16} className="cell-icon" />
                        {wallet.walletId}
                      </div>
                    </td>
                    <td>
                      <div className="user-id-cell">
                        <User size={16} className="cell-icon" />
                        {wallet.userId}
                      </div>
                    </td>
                    <td className="wiban-cell">{wallet.wiban}</td>
                    <td className="balance-cell">
                      <span className="balance-amount">
                        {formatCurrency(wallet.balance)}
                      </span>
                    </td>
                    <td>{getStatusBadge(wallet.status)}</td>
                    <td>
                      <div className="transaction-count-cell">
                        <Activity size={16} className="cell-icon" />
                        {wallet.totalTransactionCount}
                      </div>
                    </td>
                    <td className="date-cell">{formatDate(wallet.lastUpdated)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="no-data-message">
                      <Wallet size={48} className="no-data-icon" />
                      <p>Gösterilecek cüzdan bulunmuyor</p>
                      <button 
                        onClick={() => loadWalletsData(0)}
                        className="btn btn-outline"
                      >
                        Yeniden Yükle
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-section">
          <div className="pagination-info">
            <span>Sayfa {currentPage + 1} / {totalPages}</span>
          </div>
          <div className="pagination-controls">
            <button 
              onClick={handlePreviousPage}
              disabled={currentPage === 0 || loading}
              className="btn btn-pagination"
            >
              <ChevronLeft size={16} />
              Önceki
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = index;
                } else if (currentPage < 3) {
                  pageNum = index;
                } else if (currentPage > totalPages - 4) {
                  pageNum = totalPages - 5 + index;
                } else {
                  pageNum = currentPage - 2 + index;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`btn btn-page ${currentPage === pageNum ? 'active' : ''}`}
                    disabled={loading}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1 || loading}
              className="btn btn-pagination"
            >
              Sonraki
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllWallets; 