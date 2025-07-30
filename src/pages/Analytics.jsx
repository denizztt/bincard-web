import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Download, 
  Filter,
  DollarSign,
  Users,
  CreditCard,
  Bus,
  Navigation,
  ArrowLeft,
  RefreshCcw
} from 'lucide-react';
import { reportsApi, analyticsApi } from '../services/apiService';
import '../styles/Analytics.css';

const Analytics = () => {
  const navigate = useNavigate();
  
  // State management - IncomeReportsPage'e benzer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Analytics data state - IncomeReportsPage.IncomeData'ya benzer
  const [analyticsData, setAnalyticsData] = useState({
    revenue: {
      today: 0,
      yesterday: 0,
      week: 0,
      month: 0,
      year: 0,
      total: 0
    },
    transactions: {
      today: 0,
      yesterday: 0,
      week: 0,
      month: 0,
      year: 0
    },
    users: {
      today: 0,
      yesterday: 0,
      week: 0,
      month: 0,
      year: 0
    },
    stations: {
      active: 0,
      inactive: 0,
      total: 0
    },
    buses: {
      active: 0,
      maintenance: 0,
      total: 0
    }
  });

  // Chart data - IncomeReportsPage'deki grafik verilerine benzer
  const [chartData, setChartData] = useState({
    dailyRevenue: [],
    monthlyTrend: [],
    incomeCategories: []
  });

  // Load analytics data - IncomeReportsPage.loadIncomeData()'ya benzer
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      // Paralel API çağrıları - IncomeReportsPage gibi
      const [analyticsResponse, incomeResponse, dailyResponse, trendResponse, categoriesResponse] = await Promise.allSettled([
        analyticsApi.getAnalyticsData(selectedPeriod),
        reportsApi.getIncomeSummary(),
        reportsApi.getDailyIncomeReport(),
        reportsApi.getIncomeTrend('monthly'),
        reportsApi.getIncomeCategories()
      ]);

      // Analytics verilerini parse et
      if (analyticsResponse.status === 'fulfilled') {
        const data = analyticsResponse.value;
        setAnalyticsData(prev => ({
          ...prev,
          transactions: {
            today: data.transactions?.today || 0,
            yesterday: data.transactions?.yesterday || 0,
            week: data.transactions?.week || 0,
            month: data.transactions?.month || 0,
            year: data.transactions?.year || 0
          },
          users: {
            today: data.users?.today || 0,
            yesterday: data.users?.yesterday || 0,
            week: data.users?.week || 0,
            month: data.users?.month || 0,
            year: data.users?.year || 0
          },
          stations: data.stations || { active: 0, inactive: 0, total: 0 },
          buses: data.buses || { active: 0, maintenance: 0, total: 0 }
        }));
      }

      // Gelir verilerini parse et - IncomeReportsPage.parseIncomeResponse'a benzer
      if (incomeResponse.status === 'fulfilled') {
        const data = incomeResponse.value;
        setAnalyticsData(prev => ({
          ...prev,
          revenue: {
            today: data.dailyIncome || 0,
            yesterday: data.yesterdayIncome || prev.revenue.today * 0.92,
            week: data.weeklyIncome || 0,
            month: data.monthlyIncome || 0,
            year: data.yearlyIncome || 0,
            total: data.totalIncome || 0
          }
        }));
      }

      // Grafik verilerini parse et
      if (dailyResponse.status === 'fulfilled') {
        setChartData(prev => ({
          ...prev,
          dailyRevenue: dailyResponse.value.data || []
        }));
      }

      if (trendResponse.status === 'fulfilled') {
        setChartData(prev => ({
          ...prev,
          monthlyTrend: trendResponse.value.data || []
        }));
      }

      if (categoriesResponse.status === 'fulfilled') {
        setChartData(prev => ({
          ...prev,
          incomeCategories: categoriesResponse.value.data || []
        }));
      }

      setLastUpdate(new Date());
      setLoading(false);
      
    } catch (err) {
      console.error('Analytics API hatası, örnek verilerle devam ediliyor:', err);
      setError('API mevcut değil, örnek verilerle gösteriliyor');
      
      // Hata durumunda örnek verilerle devam et - IncomeReportsPage.createSampleIncomeData gibi
      createSampleAnalyticsData();
      setLoading(false);
    }
  };

  // IncomeReportsPage.createSampleIncomeData'ya benzer
  const createSampleAnalyticsData = () => {
    setAnalyticsData({
      revenue: {
        today: 45320,
        yesterday: 42150,
        week: 312450,
        month: 1245600,
        year: 14567800,
        total: 14567800
      },
      transactions: {
        today: 3421,
        yesterday: 3156,
        week: 24680,
        month: 98450,
        year: 1245600
      },
      users: {
        today: 156,
        yesterday: 142,
        week: 1048,
        month: 4567,
        year: 54890
      },
      stations: {
        active: 89,
        inactive: 12,
        total: 101
      },
      buses: {
        active: 156,
        maintenance: 24,
        total: 180
      }
    });

    setChartData({
      dailyRevenue: [
        { date: '01/01', amount: 35000, transactions: 2800 },
        { date: '02/01', amount: 42000, transactions: 3200 },
        { date: '03/01', amount: 38000, transactions: 2900 },
        { date: '04/01', amount: 45000, transactions: 3400 },
        { date: '05/01', amount: 48000, transactions: 3600 },
        { date: '06/01', amount: 52000, transactions: 3800 },
        { date: '07/01', amount: 45320, transactions: 3421 }
      ],
      monthlyTrend: [
        { month: 1, amount: 985000 },
        { month: 2, amount: 1125000 },
        { month: 3, amount: 1245600 },
        { month: 4, amount: 1156000 },
        { month: 5, amount: 1325000 },
        { month: 6, amount: 1456000 }
      ],
      incomeCategories: [
        { name: 'Günlük İşlemler', value: 45, color: '#3498db' },
        { name: 'Haftalık Abonelik', value: 30, color: '#27ae60' },
        { name: 'Aylık Paketler', value: 20, color: '#e74c3c' },
        { name: 'Diğer', value: 5, color: '#f39c12' }
      ]
    });

    setLastUpdate(new Date());
  };

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getPeriodData = (dataType) => {
    const data = analyticsData[dataType];
    switch (selectedPeriod) {
      case 'today':
        return { current: data.today, previous: data.yesterday };
      case 'week':
        return { current: data.week, previous: data.week * 0.85 }; // Mock previous week
      case 'month':
        return { current: data.month, previous: data.month * 0.92 }; // Mock previous month
      case 'year':
        return { current: data.year, previous: data.year * 0.88 }; // Mock previous year
      default:
        return { current: data.today, previous: data.yesterday };
    }
  };

  const handleExport = async (reportType) => {
    try {
      setLoading(true);
      
      // Excel export - IncomeReportsPage'deki export mantığına benzer
      const blob = await reportsApi.exportIncomeReport(reportType, 
        selectedPeriod === 'today' ? new Date().toISOString().split('T')[0] : undefined,
        new Date().toISOString().split('T')[0]
      );
      
      // Dosyayı indir
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${reportType}_raporu_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setLoading(false);
    } catch (error) {
      console.error('Export hatası:', error);
      alert(`${reportType} raporu Excel formatında indiriliyor... (Demo)`);
      setLoading(false);
    }
  };

  const renderStatCard = (title, icon, dataType, color, format = 'number') => {
    const IconComponent = icon;
    const { current, previous } = getPeriodData(dataType);
    const percentChange = calculatePercentageChange(current, previous);
    const isPositive = percentChange >= 0;

    return (
      <div className="stat-card">
        <div className="stat-header">
          <div className="stat-icon" style={{ backgroundColor: color }}>
            <IconComponent size={24} />
          </div>
          <h3 className="stat-title">{title}</h3>
        </div>
        <div className="stat-content">
          <div className="stat-value">
            {format === 'currency' ? formatCurrency(current) : current.toLocaleString()}
          </div>
          <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(percentChange)}%</span>
          </div>
        </div>
        <div className="stat-subtitle">
          {selectedPeriod === 'today' ? 'Dünkü veriye göre' : 'Önceki döneme göre'}
        </div>
      </div>
    );
  };

  // IncomeReportsPage.createTrendLineChart'a benzer
  const renderRevenueChart = () => {
    if (!chartData.dailyRevenue || chartData.dailyRevenue.length === 0) {
      return (
        <div className="chart-placeholder">
          <p>Grafik verisi yükleniyor...</p>
        </div>
      );
    }

    const maxAmount = Math.max(...chartData.dailyRevenue.map(item => item.amount));
    
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>📊 Günlük Gelir Trendi</h3>
          <button 
            onClick={() => handleExport('daily')}
            className="btn btn-outline"
            disabled={loading}
          >
            <Download size={16} />
            Excel'e Aktar
          </button>
        </div>
        <div className="chart-content">
          <div className="chart-bars">
            {chartData.dailyRevenue.map((item, index) => (
              <div key={index} className="chart-bar-container">
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar"
                    style={{ 
                      height: `${(item.amount / maxAmount) * 100}%`,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  />
                </div>
                <div className="chart-label">{item.date}</div>
                <div className="chart-value">
                  <div className="revenue-amount">{formatCurrency(item.amount)}</div>
                  <div className="transaction-count">{item.transactions} işlem</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // IncomeReportsPage.createIncomePieChart'a benzer
  const renderCategoriesChart = () => {
    if (!chartData.incomeCategories || chartData.incomeCategories.length === 0) {
      return null;
    }

    return (
      <div className="pie-chart-container">
        <h3>💰 Gelir Kategorileri Dağılımı</h3>
        <div className="pie-chart">
          <div className="pie-segments">
            {chartData.incomeCategories.map((category, index) => (
              <div key={index} className="pie-segment" style={{ 
                backgroundColor: category.color,
                width: `${category.value * 3}px`,
                height: `${category.value * 3}px`
              }}>
                <span>{category.value}%</span>
              </div>
            ))}
          </div>
          <div className="pie-legend">
            {chartData.incomeCategories.map((category, index) => (
              <div key={index} className="legend-item">
                <div className="legend-color" style={{ backgroundColor: category.color }}></div>
                <span className="legend-label">{category.name}</span>
                <span className="legend-value">{category.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSystemStats = () => {
    const stationUtilization = analyticsData.stations.total > 0 
      ? (analyticsData.stations.active / analyticsData.stations.total * 100).toFixed(1)
      : 0;
    const busUtilization = analyticsData.buses.total > 0 
      ? (analyticsData.buses.active / analyticsData.buses.total * 100).toFixed(1)
      : 0;

    return (
      <div className="system-stats">
        <h3>🔧 Sistem İstatistikleri</h3>
        <div className="system-grid">
          <div className="system-item">
            <div className="system-header">
              <Navigation size={20} />
              <span>Durak Durumu</span>
            </div>
            <div className="system-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill active"
                  style={{ width: `${stationUtilization}%` }}
                />
              </div>
              <div className="progress-text">
                <span>{analyticsData.stations.active} Aktif</span>
                <span>{stationUtilization}%</span>
              </div>
            </div>
            <div className="system-details">
              <span>Toplam: {analyticsData.stations.total}</span>
              <span>Pasif: {analyticsData.stations.inactive}</span>
            </div>
          </div>

          <div className="system-item">
            <div className="system-header">
              <Bus size={20} />
              <span>Otobüs Durumu</span>
            </div>
            <div className="system-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill active"
                  style={{ width: `${busUtilization}%` }}
                />
              </div>
              <div className="progress-text">
                <span>{analyticsData.buses.active} Aktif</span>
                <span>{busUtilization}%</span>
              </div>
            </div>
            <div className="system-details">
              <span>Toplam: {analyticsData.buses.total}</span>
              <span>Bakımda: {analyticsData.buses.maintenance}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !lastUpdate) {
    return (
      <div className="analytics-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Analytics verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div className="header-top">
          <div className="header-left">
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              <ArrowLeft size={20} />
              Dashboard
            </button>
            <h1 className="page-title">📊 Analytics & Raporlar</h1>
          </div>
          <div className="header-right">
            <button 
              onClick={loadAnalyticsData}
              className="btn btn-outline"
              disabled={loading}
            >
              <RefreshCcw size={16} className={loading ? 'spinning' : ''} />
              Yenile
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="period-selector">
          <label>📅 Zaman Periyodu:</label>
          <div className="period-buttons">
            {[
              { key: 'today', label: 'Bugün' },
              { key: 'week', label: 'Bu Hafta' },
              { key: 'month', label: 'Bu Ay' },
              { key: 'year', label: 'Bu Yıl' }
            ].map(period => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key)}
                className={`period-btn ${selectedPeriod === period.key ? 'active' : ''}`}
                disabled={loading}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-section">
          <p>❌ {error}</p>
          <button onClick={loadAnalyticsData} className="retry-btn">
            <RefreshCcw size={16} />
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Last Update Info */}
      {lastUpdate && (
        <div className="update-info">
          <p>Son güncelleme: {formatDateTime(lastUpdate)}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          {renderStatCard(
            'Toplam Gelir', 
            DollarSign, 
            'revenue', 
            '#27ae60', 
            'currency'
          )}
          {renderStatCard(
            'İşlem Sayısı', 
            CreditCard, 
            'transactions', 
            '#3498db'
          )}
          {renderStatCard(
            'Yeni Kullanıcılar', 
            Users, 
            'users', 
            '#9b59b6'
          )}
          <div className="stat-card summary">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: '#e74c3c' }}>
                <BarChart3 size={24} />
              </div>
              <h3 className="stat-title">Günlük Ortalama</h3>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {formatCurrency(analyticsData.revenue.month / 30)}
              </div>
              <div className="stat-change positive">
                <TrendingUp size={16} />
                <span>+5.2%</span>
              </div>
            </div>
            <div className="stat-subtitle">
              Aylık ortalamalara göre
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {renderRevenueChart()}
        {renderCategoriesChart()}
      </div>

      {/* System Stats */}
      <div className="bottom-section">
        {renderSystemStats()}
        
        <div className="quick-reports">
          <h3>📋 Hızlı Raporlar</h3>
          <div className="reports-grid">
            <button 
              onClick={() => handleExport('daily')}
              className="report-card"
              disabled={loading}
            >
              <Calendar size={24} />
              <span>Günlük Özet</span>
            </button>
            <button 
              onClick={() => handleExport('weekly')}
              className="report-card"
              disabled={loading}
            >
              <TrendingUp size={24} />
              <span>Haftalık Analiz</span>
            </button>
            <button 
              onClick={() => handleExport('monthly')}
              className="report-card"
              disabled={loading}
            >
              <Users size={24} />
              <span>Aylık Rapor</span>
            </button>
            <button 
              onClick={() => navigate('/analytics')}
              className="report-card"
            >
              <BarChart3 size={24} />
              <span>Detaylı Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 