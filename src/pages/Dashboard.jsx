import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/EnhancedAuthContext';
import { 
  BarChart3, 
  FileText, 
  MessageSquare, 
  MapPin, 
  CreditCard,
  TrendingUp,
  Activity,
  Clock,
  RefreshCw,
  Users,
  Shield,
  UserCheck,
  Bus,
  Route,
  FileCheck,
  UserSearch,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  Target,
  Zap,
  Database,
  Cpu,
  HardDrive,
  Mail,
  Image,
  Map,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  PieChart,
  Wallet
} from 'lucide-react';
import { healthApi } from '../services/apiService';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    dailyIncome: 0,
    monthlyIncome: 0,
    pendingRequests: 0,
    todayTransactions: 0,
    systemStatus: 'Normal',
    totalBuses: 0,
    totalStations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [statsSliderIndex, setStatsSliderIndex] = useState(0);
  const [quickActions, setQuickActions] = useState([
    { id: 1, label: 'Haber Ekle', path: '/news/add', icon: FileText },
    { id: 2, label: 'İstasyon Ekle', path: '/station/add', icon: MapPin },
    { id: 3, label: 'Otobüs Ekle', path: '/bus/create', icon: Bus },
    { id: 4, label: 'Şoför Ekle', path: '/driver/add', icon: UserSearch },
    { id: 5, label: 'Ödeme Noktası', path: '/payment-point/add', icon: CreditCard },
    { id: 6, label: 'Rota Ekle', path: '/route/add', icon: Route }
  ]);
  const [quickActionsSliderIndex, setQuickActionsSliderIndex] = useState(0);
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [monthlyIncomeData, setMonthlyIncomeData] = useState([]);
  const [userActivityData, setUserActivityData] = useState([]);


  useEffect(() => {
  loadDashboardData(); // API calls for dashboard removed, using mock data within function
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Initialize with empty/zero values - will be populated by real API calls
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        dailyIncome: 0,
        monthlyIncome: 0,
        pendingRequests: 0,
        todayTransactions: 0,
        systemStatus: 'Normal',
        totalBuses: 0,
        totalStations: 0
      });
      
      // Empty activities - will be populated by real API calls
      setRecentActivities([]);
      
      // System health will be loaded from API if available
      setSystemHealth(null);
      
      // Empty chart data - will be populated by real API calls
      setMonthlyIncomeData([]);
      setUserActivityData([]);
      
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('Dashboard data load error:', err);
      setError('Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };


  const handleRefresh = () => {
    loadDashboardData();
  };


  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'normal':
      case 'active':
      case 'online':
        return '#10b981';
      case 'warning':
      case 'maintenance':
        return '#f59e0b';
      case 'error':
      case 'offline':
      case 'critical':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('tr-TR').format(number || 0);
  };

  const formatTime = (date) => {
    if (!date) return 'Yükleniyor...';
    // Handle timestamp or Date/string
    const d = typeof date === 'number' ? new Date(date) : new Date(date);
    if (isNaN(d.getTime())) return 'Yükleniyor...';
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(d);
  };


  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration':
        return Users;
      case 'payment':
        return DollarSign;
      case 'bus_update':
        return Bus;
      case 'system_alert':
        return Shield;
      default:
        return Activity;
    }
  };

  // Stats slider functions
  const statsCards = [
    { key: 'users', component: 'users' },
    { key: 'income', component: 'income' },
    { key: 'requests', component: 'requests' },
    { key: 'system', component: 'system' },
    { key: 'buses', component: 'infrastructure' },
    { key: 'stations', component: 'infrastructure' }
  ];

  const handleStatsPrev = () => {
    setStatsSliderIndex(prev => Math.max(0, prev - 1));
  };

  const handleStatsNext = () => {
    const maxIndex = Math.max(0, statsCards.length - 3);
    setStatsSliderIndex(prev => Math.min(maxIndex, prev + 1));
  };

  // Quick actions functions
  const availablePages = [
    { label: 'Haber Ekle', path: '/news/add', icon: FileText },
    { label: 'Haberler', path: '/news', icon: FileText },
    { label: 'İstasyon Ekle', path: '/station/add', icon: MapPin },
    { label: 'İstasyon Listesi', path: '/station', icon: MapPin },
    { label: 'Otobüs Ekle', path: '/bus/create', icon: Bus },
    { label: 'Otobüs Listesi', path: '/bus', icon: Bus },
    { label: 'Şoför Ekle', path: '/driver/add', icon: UserSearch },
    { label: 'Şoför Listesi', path: '/driver', icon: UserSearch },
    { label: 'Ödeme Noktası Ekle', path: '/payment-point/add', icon: CreditCard },
    { label: 'Ödeme Noktaları', path: '/payment-point', icon: CreditCard },
    { label: 'Rota Ekle', path: '/route/add', icon: Route },
    { label: 'Rota Listesi', path: '/route', icon: Route },
    { label: 'Admin Ekle', path: '/admin/add', icon: UserCheck },
    { label: 'Admin Listesi', path: '/admin/list', icon: UserCheck },
    { label: 'Geri Bildirimler', path: '/feedback', icon: MessageSquare },
    { label: 'Cüzdanlar', path: '/all-wallets', icon: Wallet },
    { label: 'Raporlar', path: '/bus-income-reports', icon: BarChart3 },
    { label: 'İstatistikler', path: '/statistics', icon: BarChart3 },
    { label: 'Sistem Sağlığı', path: '/system-health', icon: Activity }
  ];

  const handleAddQuickAction = (page) => {
    if (!quickActions.find(qa => qa.path === page.path)) {
      const newAction = {
        id: Date.now(),
        label: page.label,
        path: page.path,
        icon: page.icon
      };
      setQuickActions([...quickActions, newAction]);
    }
    setShowQuickActionModal(false);
  };

  const handleRemoveQuickAction = (id) => {
    setQuickActions(quickActions.filter(qa => qa.id !== id));
  };

  const handleQuickActionsPrev = () => {
    setQuickActionsSliderIndex(prev => Math.max(0, prev - 1));
  };

  const handleQuickActionsNext = () => {
    const maxIndex = Math.max(0, quickActions.length - 3);
    setQuickActionsSliderIndex(prev => Math.min(maxIndex, prev + 1));
  };

  // Chart rendering functions
  const renderIncomeChart = () => {
    if (monthlyIncomeData.length === 0) {
      return (
        <div className="chart-placeholder">
          <PieChart size={100} />
          <p>Veri bulunmuyor</p>
        </div>
      );
    }

    const maxIncome = Math.max(...monthlyIncomeData.map(d => d.income));
    const chartHeight = 200;
    const chartWidth = 100;
    const barWidth = chartWidth / monthlyIncomeData.length - 2;

    return (
      <div className="chart-container">
        <svg width="100%" height={chartHeight + 40} viewBox={`0 0 ${monthlyIncomeData.length * 30} ${chartHeight + 40}`}>
          {monthlyIncomeData.map((data, index) => {
            const barHeight = (data.income / maxIncome) * chartHeight;
            const x = index * 30 + 5;
            const y = chartHeight - barHeight;
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y + 20}
                  width={barWidth}
                  height={barHeight}
                  fill="var(--primary-color)"
                  rx="4"
                />
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 35}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--text-secondary)"
                >
                  {data.month}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={y + 15}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--text-primary)"
                  fontWeight="600"
                >
                  {(data.income / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderActivityChart = () => {
    if (userActivityData.length === 0) {
      return (
        <div className="chart-placeholder">
          <BarChart3 size={100} />
          <p>Veri bulunmuyor</p>
        </div>
      );
    }

    const maxUsers = Math.max(...userActivityData.map(d => d.activeUsers));
    const chartHeight = 200;
    const chartWidth = 100;
    const barWidth = chartWidth / userActivityData.length - 1;

    return (
      <div className="chart-container">
        <svg width="100%" height={chartHeight + 40} viewBox={`0 0 ${userActivityData.length * 8} ${chartHeight + 40}`}>
          {userActivityData.map((data, index) => {
            const barHeight = (data.activeUsers / maxUsers) * chartHeight;
            const x = index * 8 + 2;
            const y = chartHeight - barHeight;
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y + 20}
                  width={barWidth}
                  height={barHeight}
                  fill="var(--secondary-color)"
                  rx="4"
                />
                {index % 5 === 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 35}
                    textAnchor="middle"
                    fontSize="8"
                    fill="var(--text-secondary)"
                  >
                    {data.date.split(' ')[0]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="dashboard-content-wrapper">
      {/* Header */}
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <h1>Dashboard</h1>
          </div>
          
          <div className="header-right">
            <div className="last-update">
              <Clock size={16} />
              <span>Son Güncelleme: {lastUpdate ? formatTime(lastUpdate) : 'Yükleniyor...'}</span>
            </div>
            <button 
              className="refresh-button"
              onClick={handleRefresh}
              disabled={loading}
              title="Verileri Yenile"
            >
              <RefreshCw className={loading ? 'spinning' : ''} size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {error && (
            <div className="error-banner">
              <AlertTriangle size={20} />
              <span>{error}</span>
              <button onClick={handleRefresh}>Tekrar Dene</button>
            </div>
          )}

          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-content">
              <h2>Hoş Geldiniz! 👋</h2>
              <p>City Card Admin paneline hoş geldiniz. Sistem durumunu ve önemli metrikleri buradan takip edebilirsiniz.</p>
            </div>
            <div className="welcome-stats">
              <div className="welcome-stat">
                <CheckCircle size={20} />
                <span>Sistem: {stats.systemStatus}</span>
              </div>
              <div className="welcome-stat">
                <Users size={20} />
                <span>{formatNumber(stats.activeUsers)} Aktif Kullanıcı</span>
              </div>
            </div>
          </div>

          {/* Stats Grid with Slider */}
          <div className="stats-slider-container">
            <button 
              className="slider-nav-btn slider-nav-left"
              onClick={handleStatsPrev}
              disabled={statsSliderIndex === 0}
            >
              <ChevronLeft size={24} />
            </button>
            <div className="stats-slider">
              <div 
                className="stats-slider-track"
                style={{ transform: `translateX(-${statsSliderIndex * 33.333}%)` }}
              >
                <div className="stat-card users">
                  <div className="stat-icon">
                    <Users size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>Toplam Kullanıcı</h3>
                    <div className="stat-number">{formatNumber(stats.totalUsers)}</div>
                    <div className="stat-subtitle">Aktif: {formatNumber(stats.activeUsers)}</div>
                  </div>
                </div>

                <div className="stat-card income">
                  <div className="stat-icon">
                    <DollarSign size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>Günlük Gelir</h3>
                    <div className="stat-number">{formatCurrency(stats.dailyIncome)}</div>
                    <div className="stat-subtitle">İşlem: {formatNumber(stats.todayTransactions)}</div>
                  </div>
                </div>

                <div className="stat-card requests">
                  <div className="stat-icon">
                    <Clock size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>Bekleyen İstekler</h3>
                    <div className="stat-number">{formatNumber(stats.pendingRequests)}</div>
                    <div className="stat-subtitle">İnceleme Gerekli</div>
                  </div>
                </div>

                <div className="stat-card system">
                  <div className="stat-icon">
                    <Activity size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>Sistem Durumu</h3>
                    <div className="stat-number" style={{ color: getStatusColor(stats.systemStatus) }}>
                      {stats.systemStatus}
                    </div>
                    <div className="stat-subtitle">Güvenli</div>
                  </div>
                </div>

                <div className="stat-card infrastructure">
                  <div className="stat-icon">
                    <Bus size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>Toplam Otobüs</h3>
                    <div className="stat-number">{formatNumber(stats.totalBuses)}</div>
                    <div className="stat-subtitle">Aktif Rotalar</div>
                  </div>
                </div>

                <div className="stat-card infrastructure">
                  <div className="stat-icon">
                    <MapPin size={24} />
                  </div>
                  <div className="stat-content">
                    <h3>Toplam İstasyon</h3>
                    <div className="stat-number">{formatNumber(stats.totalStations)}</div>
                    <div className="stat-subtitle">Hizmet Noktaları</div>
                  </div>
                </div>
              </div>
            </div>
            <button 
              className="slider-nav-btn slider-nav-right"
              onClick={handleStatsNext}
              disabled={statsSliderIndex >= statsCards.length - 3}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <div className="quick-actions-header">
              <h3>Hızlı İşlemler</h3>
              <button 
                className="add-quick-action-btn"
                onClick={() => setShowQuickActionModal(true)}
                title="Hızlı İşlem Ekle"
              >
                <Plus size={20} />
              </button>
            </div>
            {quickActions.length > 3 ? (
              <div className="quick-actions-slider-container">
                <button 
                  className="slider-nav-btn slider-nav-left"
                  onClick={handleQuickActionsPrev}
                  disabled={quickActionsSliderIndex === 0}
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="quick-actions-slider">
                <div 
                  className="quick-actions-slider-track"
                  style={{ transform: `translateX(-${quickActionsSliderIndex * 33.333}%)` }}
                >
                    {quickActions.map((action) => {
                      const IconComponent = action.icon;
                      return (
                        <div key={action.id} className="quick-action-card-wrapper">
                          <div className="quick-action-card" onClick={() => navigate(action.path)}>
                            <IconComponent size={24} />
                            <span>{action.label}</span>
                          </div>
                          <button 
                            className="remove-quick-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveQuickAction(action.id);
                            }}
                            title="Kaldır"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button 
                  className="slider-nav-btn slider-nav-right"
                  onClick={handleQuickActionsNext}
                  disabled={quickActionsSliderIndex >= quickActions.length - 3}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            ) : (
              <div className="quick-actions-grid">
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <div key={action.id} className="quick-action-card-wrapper">
                      <div className="quick-action-card" onClick={() => navigate(action.path)}>
                        <IconComponent size={24} />
                        <span>{action.label}</span>
                      </div>
                      <button 
                        className="remove-quick-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveQuickAction(action.id);
                        }}
                        title="Kaldır"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Action Modal */}
          {showQuickActionModal && (
            <div className="modal-overlay" onClick={() => setShowQuickActionModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Hızlı İşlem Ekle</h3>
                  <button className="modal-close" onClick={() => setShowQuickActionModal(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="available-pages-list">
                    {availablePages
                      .filter(page => !quickActions.find(qa => qa.path === page.path))
                      .map((page) => {
                        const IconComponent = page.icon;
                        return (
                          <div
                            key={page.path}
                            className="available-page-item"
                            onClick={() => handleAddQuickAction(page)}
                          >
                            <IconComponent size={20} />
                            <span>{page.label}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Aylık Gelir Trendi</h3>
                <div className="chart-value">
                  {formatCurrency(stats.monthlyIncome)}
                </div>
              </div>
              {renderIncomeChart()}
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Kullanıcı Aktivitesi</h3>
                <div className="chart-actions">
                  <button className="chart-btn">7G</button>
                  <button className="chart-btn active">30G</button>
                  <button className="chart-btn">3A</button>
                </div>
              </div>
              {renderActivityChart()}
            </div>
          </div>

          {/* System Health Section */}
          {systemHealth && (
            <div className="system-health-section">
              <div className="section-header clickable" onClick={() => navigate('/system-health')}>
                <h3>Sistem Sağlığı</h3>
                <div className="health-status">
                  <div className={`status-indicator ${systemHealth.status === 'UP' ? 'healthy' : 'unhealthy'}`}>
                    <Activity size={16} />
                    <span>{systemHealth.overall || systemHealth.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="health-grid">
                {/* Database Health */}
                <div className={`health-card ${systemHealth.database?.healthy ? 'healthy' : 'unhealthy'}`}>
                  <div className="health-icon">
                    <Database size={20} />
                  </div>
                  <div className="health-content">
                    <h4>Veritabanı</h4>
                    <div className="health-status-text">
                      {systemHealth.database?.status || 'UNKNOWN'}
                    </div>
                    {systemHealth.database?.activeConnections && (
                      <div className="health-detail">
                        Bağlantı: {systemHealth.database.activeConnections}
                      </div>
                    )}
                  </div>
                </div>

                {/* Redis Health */}
                <div className={`health-card ${systemHealth.redis?.healthy ? 'healthy' : 'unhealthy'}`}>
                  <div className="health-icon">
                    <Zap size={20} />
                  </div>
                  <div className="health-content">
                    <h4>Redis Cache</h4>
                    <div className="health-status-text">
                      {systemHealth.redis?.status || 'UNKNOWN'}
                    </div>
                    {systemHealth.redis?.keyCount && (
                      <div className="health-detail">
                        Keys: {systemHealth.redis.keyCount}
                      </div>
                    )}
                  </div>
                </div>

                {/* Memory Health */}
                <div className={`health-card ${systemHealth.memory?.status === 'OK' ? 'healthy' : systemHealth.memory?.status === 'WARNING' ? 'warning' : 'unhealthy'}`}>
                  <div className="health-icon">
                    <Cpu size={20} />
                  </div>
                  <div className="health-content">
                    <h4>Bellek Kullanımı</h4>
                    <div className="health-status-text">
                      {systemHealth.memory?.status || 'UNKNOWN'}
                    </div>
                    {systemHealth.memory?.heapUsagePercent && (
                      <div className="health-detail">
                        Kullanım: %{systemHealth.memory.heapUsagePercent}
                      </div>
                    )}
                  </div>
                </div>

                {/* CPU Health */}
                <div className={`health-card ${systemHealth.cpu?.status === 'OK' ? 'healthy' : systemHealth.cpu?.status === 'WARNING' ? 'warning' : 'unhealthy'}`}>
                  <div className="health-icon">
                    <Cpu size={20} />
                  </div>
                  <div className="health-content">
                    <h4>CPU Kullanımı</h4>
                    <div className="health-status-text">
                      {systemHealth.cpu?.status || 'UNKNOWN'}
                    </div>
                    {systemHealth.cpu?.systemLoadAverage && (
                      <div className="health-detail">
                        Yük: {systemHealth.cpu.systemLoadAverage}
                      </div>
                    )}
                  </div>
                </div>

                {/* Disk Health */}
                <div className={`health-card ${systemHealth.disk?.status === 'OK' ? 'healthy' : systemHealth.disk?.status === 'WARNING' ? 'warning' : 'unhealthy'}`}>
                  <div className="health-icon">
                    <HardDrive size={20} />
                  </div>
                  <div className="health-content">
                    <h4>Disk Kullanımı</h4>
                    <div className="health-status-text">
                      {systemHealth.disk?.status || 'UNKNOWN'}
                    </div>
                    {systemHealth.disk?.overallUsagePercent && (
                      <div className="health-detail">
                        Kullanım: %{systemHealth.disk.overallUsagePercent}
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Health */}
                <div className={`health-card ${systemHealth.security?.healthy ? 'healthy' : 'unhealthy'}`}>
                  <div className="health-icon">
                    <Shield size={20} />
                  </div>
                  <div className="health-content">
                    <h4>Güvenlik</h4>
                    <div className="health-status-text">
                      {systemHealth.security?.status || 'UNKNOWN'}
                    </div>
                    {systemHealth.security?.validTokens && (
                      <div className="health-detail">
                        Geçerli Token: {systemHealth.security.validTokens}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* External Services Health */}
              <div className="external-services">
                <h4>Harici Servisler</h4>
                <div className="services-grid">
                  <div className={`service-item ${systemHealth.mailService?.healthy ? 'healthy' : 'unhealthy'}`}>
                    <Mail size={16} />
                    <span>E-posta</span>
                  </div>
                  <div className={`service-item ${systemHealth.cloudinary?.healthy ? 'healthy' : 'unhealthy'}`}>
                    <Image size={16} />
                    <span>Cloudinary</span>
                  </div>
                  <div className={`service-item ${systemHealth.googleMaps?.healthy ? 'healthy' : 'unhealthy'}`}>
                    <Map size={16} />
                    <span>Google Maps</span>
                  </div>
                  <div className={`service-item ${systemHealth.iyzico?.healthy ? 'healthy' : 'unhealthy'}`}>
                    <CreditCard size={16} />
                    <span>Iyzico</span>
                  </div>
                  <div className={`service-item ${systemHealth.twilio?.healthy ? 'healthy' : 'unhealthy'}`}>
                    <MessageSquare size={16} />
                    <span>Twilio SMS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activities */}
          <div className="recent-activities">
            <div className="activities-header">
              <h3>Son Aktiviteler</h3>
              <button className="view-all-btn">
                Tümünü Gör
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="activities-list">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <div key={index} className="activity-item">
                      <div
                        className="activity-icon"
                        style={{
                          backgroundColor: `var(--${activity.color || 'blue'}-100)`
                        }}
                      >
                        <ActivityIcon
                          size={16}
                          style={{ color: `var(--${activity.color || 'blue'}-600)` }}
                        />
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">{activity.message}</p>
                        <span className="activity-time">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-activities">
                  <Activity size={48} />
                  <p>Henüz aktivite bulunmuyor</p>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default Dashboard;