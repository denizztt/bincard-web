import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  TrendingUp,
  Users,
  Wallet,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { walletStatsApi } from '../services/apiService';
import '../styles/Statistics.css';

const Statistics = () => {
  const navigate = useNavigate();
  
  // State management - StatisticsPage.java'ya benzer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalWallets: 0,
    activeWallets: 0,
    lockedWallets: 0,
    totalBalance: 0,
    serverTime: ''
  });
  const [lastUpdate, setLastUpdate] = useState(null);

  // StatisticsPage.loadWalletStats'e benzer
  useEffect(() => {
    loadWalletStats();
  }, []);

  const loadWalletStats = async () => {
    try {
      setLoading(true);
      setError('');

      // API çağrısı - StatisticsPage'deki updateStatsUI mantığına benzer
      const response = await walletStatsApi.getWalletAdminStats();
      
      if (response && response.success) {
        const statsData = parseStatsFromResponse(response);
        setStats(statsData);
        setLastUpdate(new Date());
      } else {
        throw new Error(response?.message || 'API yanıtı başarısız');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Wallet stats yüklenirken hata:', err);
      setError('API mevcut değil, örnek verilerle gösteriliyor');
      
      // Hata durumunda örnek verilerle devam et
      const sampleData = createSampleStats();
      setStats(sampleData);
      setLastUpdate(new Date());
      setLoading(false);
    }
  };

  // StatisticsPage.updateStatsUI'ye benzer
  const parseStatsFromResponse = (response) => {
    try {
      const data = response.data || {};
      
      return {
        totalTransactions: data.totalTransactions || 0,
        successfulTransactions: data.successfulTransactions || 0,
        failedTransactions: data.failedTransactions || 0,
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        suspendedUsers: data.suspendedUsers || 0,
        totalWallets: data.totalWallets || 0,
        activeWallets: data.activeWallets || 0,
        lockedWallets: data.lockedWallets || 0,
        totalBalance: data.totalBalance || 0,
        serverTime: data.serverTime || new Date().toISOString()
      };
    } catch (error) {
      console.error('Stats parse hatası:', error);
      return createSampleStats();
    }
  };

  // Örnek veri oluşturma - API hata durumunda
  const createSampleStats = () => {
    return {
      totalTransactions: 25680,
      successfulTransactions: 24156,
      failedTransactions: 1524,
      totalUsers: 12450,
      activeUsers: 8967,
      suspendedUsers: 123,
      totalWallets: 9854,
      activeWallets: 8234,
      lockedWallets: 156,
      totalBalance: 2456780.50,
      serverTime: new Date().toISOString()
    };
  };

  // StatisticsPage'deki numberFormat'a benzer
  const formatNumber = (number) => {
    return new Intl.NumberFormat('tr-TR').format(number);
  };

  // Bakiye formatı - TL ile
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Sunucu zamanı formatı
  const formatServerTime = (isoTime) => {
    if (!isoTime) return '-';
    
    try {
      const date = new Date(isoTime);
      return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    } catch (error) {
      return isoTime;
    }
  };

  // Son güncelleme zamanı formatı
  const formatLastUpdate = (date) => {
    if (!date) return '-';
    
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  // Yüzde hesaplama
  const calculatePercentage = (part, total) => {
    if (total === 0) return 0;
    return ((part / total) * 100).toFixed(1);
  };

  // İstatistik kartlarını oluştur - StatisticsPage.createStatsCards'a benzer
  const renderStatsSection = (title, color, icon, stats) => {
    const IconComponent = icon;
    
    return (
      <div className="stats-section">
        <div className="section-header">
          <div className="section-icon" style={{ color }}>
            <IconComponent size={20} />
          </div>
          <h3 className="section-title" style={{ color }}>{title}</h3>
        </div>
        <div className="stats-list">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-label">{stat.label}:</span>
              <span className="stat-value">{stat.value}</span>
              {stat.percentage && (
                <span className="stat-percentage">({stat.percentage}%)</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading && !lastUpdate) {
    return (
      <div className="statistics-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Sistem istatistikleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-container">
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
              <BarChart3 size={28} className="title-icon" />
              <h1 className="page-title">Sistem İstatistikleri</h1>
            </div>
          </div>
          <div className="header-right">
            <div className="loading-indicator" style={{ opacity: loading ? 1 : 0 }}>
              <div className="mini-spinner"></div>
            </div>
            <button 
              onClick={loadWalletStats}
              className="btn btn-success"
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
          <button onClick={loadWalletStats} className="retry-btn">
            <RefreshCw size={16} />
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <h2 className="content-title">Cüzdan Sistem İstatistikleri</h2>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {/* İşlem İstatistikleri */}
          {renderStatsSection(
            'İşlem İstatistikleri',
            '#007bff',
            TrendingUp,
            [
              { 
                label: 'Toplam İşlem', 
                value: formatNumber(stats.totalTransactions),
                percentage: null 
              },
              { 
                label: 'Başarılı İşlem', 
                value: formatNumber(stats.successfulTransactions),
                percentage: calculatePercentage(stats.successfulTransactions, stats.totalTransactions)
              },
              { 
                label: 'Başarısız İşlem', 
                value: formatNumber(stats.failedTransactions),
                percentage: calculatePercentage(stats.failedTransactions, stats.totalTransactions)
              }
            ]
          )}

          {/* Kullanıcı İstatistikleri */}
          {renderStatsSection(
            'Kullanıcı İstatistikleri',
            '#28a745',
            Users,
            [
              { 
                label: 'Toplam Kullanıcı', 
                value: formatNumber(stats.totalUsers),
                percentage: null 
              },
              { 
                label: 'Aktif Kullanıcı', 
                value: formatNumber(stats.activeUsers),
                percentage: calculatePercentage(stats.activeUsers, stats.totalUsers)
              },
              { 
                label: 'Askıya Alınan', 
                value: formatNumber(stats.suspendedUsers),
                percentage: calculatePercentage(stats.suspendedUsers, stats.totalUsers)
              }
            ]
          )}

          {/* Cüzdan İstatistikleri */}
          {renderStatsSection(
            'Cüzdan İstatistikleri',
            '#6f42c1',
            Wallet,
            [
              { 
                label: 'Toplam Cüzdan', 
                value: formatNumber(stats.totalWallets),
                percentage: null 
              },
              { 
                label: 'Aktif Cüzdan', 
                value: formatNumber(stats.activeWallets),
                percentage: calculatePercentage(stats.activeWallets, stats.totalWallets)
              },
              { 
                label: 'Kilitli Cüzdan', 
                value: formatNumber(stats.lockedWallets),
                percentage: calculatePercentage(stats.lockedWallets, stats.totalWallets)
              }
            ]
          )}

          {/* Bakiye İstatistikleri */}
          {renderStatsSection(
            'Bakiye İstatistikleri',
            '#dc3545',
            DollarSign,
            [
              { 
                label: 'Toplam Bakiye', 
                value: formatCurrency(stats.totalBalance),
                percentage: null 
              },
              { 
                label: 'Sunucu Zamanı', 
                value: formatServerTime(stats.serverTime),
                percentage: null 
              }
            ]
          )}
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card success">
            <div className="card-icon">
              <CheckCircle size={24} />
            </div>
            <div className="card-content">
              <h4>Başarı Oranı</h4>
              <p>{calculatePercentage(stats.successfulTransactions, stats.totalTransactions)}%</p>
            </div>
          </div>
          
          <div className="summary-card warning">
            <div className="card-icon">
              <XCircle size={24} />
            </div>
            <div className="card-content">
              <h4>Hata Oranı</h4>
              <p>{calculatePercentage(stats.failedTransactions, stats.totalTransactions)}%</p>
            </div>
          </div>
          
          <div className="summary-card info">
            <div className="card-icon">
              <Activity size={24} />
            </div>
            <div className="card-content">
              <h4>Aktif Kullanıcı Oranı</h4>
              <p>{calculatePercentage(stats.activeUsers, stats.totalUsers)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="footer-info">
        <div className="update-info">
          <Clock size={16} className="update-icon" />
          <span>Son Güncelleme: {formatLastUpdate(lastUpdate)}</span>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 