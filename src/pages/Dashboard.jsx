import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/EnhancedAuthContext';
import ThemeToggle from '../components/ThemeToggle';
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
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  ChevronDown,
  ChevronRight,
  Wallet,
  ArrowLeftRight,
  Edit3,
  PieChart,
  ChevronLeft,
  Search,
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
  Map
} from 'lucide-react';
import { dashboardApi, reportsApi, healthApi } from '../services/apiService';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  // Expandable menu state
  const [expandedMenus, setExpandedMenus] = useState({
    news: false,
    feedback: false,
    station: false,
    payment: false,
    admin: false,
    wallet: false,
    reports: false,
    contracts: false,
    system: false
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock data for now since backend is not working
      const mockStats = {
        totalUsers: 1250,
        activeUsers: 890,
        dailyIncome: 15420.50,
        monthlyIncome: 456780.25,
        pendingRequests: 23,
        todayTransactions: 156,
        systemStatus: 'Normal',
        totalBuses: 45,
        totalStations: 12
      };
      
      setStats(mockStats);
      
      const mockActivities = [
        {
          id: 1,
          type: 'user_registration',
          message: 'Yeni kullanıcı kaydı: Ahmet Yılmaz',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          icon: Users,
          color: 'blue'
        },
        {
          id: 2,
          type: 'payment',
          message: 'Ödeme işlemi tamamlandı: ₺25.50',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          icon: DollarSign,
          color: 'green'
        },
        {
          id: 3,
          type: 'bus_update',
          message: 'Otobüs durumu güncellendi: 34ABC123',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          icon: Bus,
          color: 'orange'
        },
        {
          id: 4,
          type: 'system_alert',
          message: 'Sistem güvenlik kontrolü tamamlandı',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          icon: Shield,
          color: 'purple'
        }
      ];
      
      setRecentActivities(mockActivities);
      setLastUpdate(new Date());
      
      // Load system health data
      try {
        const healthResponse = await healthApi.getHealthStatus();
        if (healthResponse) {
          setSystemHealth(healthResponse);
        }
      } catch (healthError) {
        console.log('System health data not available, using mock data');
        // Mock system health data
        setSystemHealth({
          status: 'UP',
          overall: 'HEALTHY',
          database: { healthy: true, status: 'UP' },
          redis: { healthy: true, status: 'UP' },
          mailService: { healthy: true, status: 'UP' },
          cloudinary: { healthy: true, status: 'UP' },
          googleMaps: { healthy: true, status: 'UP' },
          iyzico: { healthy: true, status: 'UP' },
          twilio: { healthy: true, status: 'UP' },
          memory: { status: 'OK', heapUsagePercent: 45.2 },
          cpu: { status: 'OK', systemLoadAverage: 0.8 },
          disk: { status: 'OK', overallUsagePercent: 65.3 },
          security: { healthy: true, status: 'SECURE' },
          activeUsers: 890
        });
      }
      
      // Try to load real data if available
      try {
        const response = await dashboardApi.getStats();
        if (response && response.success && response.data) {
          setStats(response.data);
        }
      } catch (apiError) {
        console.warn('Real API data not available, using mock data:', apiError);
      }
      
      try {
        const activitiesResponse = await dashboardApi.getRecentActivities();
        if (activitiesResponse && activitiesResponse.success && activitiesResponse.data) {
          setRecentActivities(activitiesResponse.data);
        }
      } catch (apiError) {
        console.warn('Real activities data not available, using mock data:', apiError);
      }
      
    } catch (err) {
      console.error('Dashboard data load error:', err);
      setError('Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (path) => {
    if (path) {
      navigate(path);
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
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
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const shouldShowMenuItem = (label, subItems = []) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return label.toLowerCase().includes(query) || 
           subItems.some(item => item.toLowerCase().includes(query));
  };

  const renderMenuItem = (icon, label, path, isExpanded = false, hasSubmenu = false, onClick, subItems = []) => {
    const IconComponent = icon;
    
    if (!shouldShowMenuItem(label, subItems)) {
      return null;
    }
    
    if (hasSubmenu) {
      return (
        <div key={label} className="menu-item-container">
          <div 
            className={`menu-item ${isExpanded ? 'expanded' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
            onClick={onClick}
            title={sidebarCollapsed ? label : ''}
          >
            <div className="menu-item-content">
              <IconComponent size={20} />
              {!sidebarCollapsed && <span>{label}</span>}
            </div>
            {!sidebarCollapsed && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
          </div>
        </div>
      );
    }

    return (
      <div 
        key={path || label}
        className={`menu-item ${sidebarCollapsed ? 'collapsed' : ''}`}
        onClick={() => handleMenuClick(path)}
        title={sidebarCollapsed ? label : ''}
      >
        <div className="menu-item-content">
          <IconComponent size={20} />
          {!sidebarCollapsed && <span>{label}</span>}
        </div>
      </div>
    );
  };

  const renderSubmenuItem = (label, path) => {
    if (!shouldShowMenuItem(label)) {
      return null;
    }
    
    return (
      <div 
        key={path}
        className="submenu-item"
        onClick={() => handleMenuClick(path)}
      >
        <span>{label}</span>
      </div>
    );
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

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            {!sidebarCollapsed && <h2>City Card Admin</h2>}
            <button 
              className="sidebar-collapse-toggle"
              onClick={toggleSidebarCollapse}
              title={sidebarCollapsed ? 'Genişlet' : 'Daralt'}
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          
          {/* Search */}
          <div className={`sidebar-search ${searchVisible || !sidebarCollapsed ? 'visible' : ''}`}>
            <div className="search-input-container">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Menü ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        <div className="sidebar-menu">
          {renderMenuItem(Home, 'Dashboard', '/dashboard')}
          
          {/* Haber Yönetimi */}
          {renderMenuItem(
            FileText, 
            'Haber Yönetimi', 
            null, 
            expandedMenus.news, 
            true, 
            () => toggleMenu('news'),
            ['Haberler', 'Haber Ekle']
          )}
          {expandedMenus.news && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Haberler', '/news')}
              {renderSubmenuItem('Haber Ekle', '/news/add')}
            </div>
          )}

          {/* Geri Bildirim Yönetimi */}
          {renderMenuItem(
            MessageSquare, 
            'Geri Bildirim', 
            null, 
            expandedMenus.feedback, 
            true, 
            () => toggleMenu('feedback'),
            ['Geri Bildirimler']
          )}
          {expandedMenus.feedback && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Geri Bildirimler', '/feedback')}
            </div>
          )}

          {/* İstasyon Yönetimi */}
          {renderMenuItem(
            MapPin, 
            'İstasyon Yönetimi', 
            null, 
            expandedMenus.station, 
            true, 
            () => toggleMenu('station'),
            ['İstasyon Listesi', 'İstasyon Ekle', 'Harita Görünümü']
          )}
          {expandedMenus.station && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('İstasyon Listesi', '/station')}
              {renderSubmenuItem('İstasyon Ekle', '/station/add')}
              {renderSubmenuItem('Harita Görünümü', '/station/map')}
            </div>
          )}

          {/* Ödeme Noktası Yönetimi */}
          {renderMenuItem(
            CreditCard, 
            'Ödeme Noktaları', 
            null, 
            expandedMenus.payment, 
            true, 
            () => toggleMenu('payment'),
            ['Ödeme Noktaları', 'Yeni Nokta Ekle']
          )}
          {expandedMenus.payment && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Ödeme Noktaları', '/payment-point')}
              {renderSubmenuItem('Yeni Nokta Ekle', '/payment-point/add')}
            </div>
          )}

          {/* Otobüs Yönetimi */}
          {renderMenuItem(
            Bus, 
            'Otobüs Yönetimi', 
            null, 
            expandedMenus.admin, 
            true, 
            () => toggleMenu('admin'),
            ['Otobüs Listesi', 'Otobüs Ekle', 'Harita Görünümü']
          )}
          {expandedMenus.admin && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Otobüs Listesi', '/bus')}
              {renderSubmenuItem('Otobüs Ekle', '/bus/add')}
              {renderSubmenuItem('Harita Görünümü', '/bus/map')}
            </div>
          )}

          {/* Şoför Yönetimi */}
          {renderMenuItem(
            UserSearch, 
            'Şoför Yönetimi', 
            null, 
            expandedMenus.wallet, 
            true, 
            () => toggleMenu('wallet'),
            ['Şoför Listesi', 'Şoför Ekle']
          )}
          {expandedMenus.wallet && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Şoför Listesi', '/driver')}
              {renderSubmenuItem('Şoför Ekle', '/driver/add')}
            </div>
          )}

          {/* Rota Yönetimi */}
          {renderMenuItem(
            Route, 
            'Rota Yönetimi', 
            null, 
            expandedMenus.reports, 
            true, 
            () => toggleMenu('reports'),
            ['Rota Listesi', 'Rota Ekle']
          )}
          {expandedMenus.reports && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Rota Listesi', '/route')}
              {renderSubmenuItem('Rota Ekle', '/route/add')}
            </div>
          )}

          {/* Cüzdan Yönetimi */}
          {renderMenuItem(
            Wallet, 
            'Cüzdan Yönetimi', 
            null, 
            expandedMenus.contracts, 
            true, 
            () => toggleMenu('contracts'),
            ['Tüm Cüzdanlar', 'Cüzdan Durumu', 'Cüzdan Transferleri']
          )}
          {expandedMenus.contracts && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Tüm Cüzdanlar', '/all-wallets')}
              {renderSubmenuItem('Cüzdan Durumu', '/wallet-status')}
              {renderSubmenuItem('Cüzdan Transferleri', '/wallet-transfers')}
            </div>
          )}

          {/* Admin Yönetimi */}
          {renderMenuItem(
            UserCheck, 
            'Admin Yönetimi', 
            null, 
            expandedMenus.system, 
            true, 
            () => toggleMenu('system'),
            ['Admin Onayları', 'Kimlik İstekleri']
          )}
          {expandedMenus.system && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Admin Onayları', '/admin-approvals')}
              {renderSubmenuItem('Kimlik İstekleri', '/identity-requests')}
            </div>
          )}

          {/* Raporlar & Analiz */}
          {renderMenuItem(
            BarChart3, 
            'Raporlar & Analiz', 
            null, 
            expandedMenus.news, 
            true, 
            () => toggleMenu('news'),
            ['İstatistikler', 'Analitik', 'Denetim Kayıtları']
          )}
          {expandedMenus.news && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('İstatistikler', '/statistics')}
              {renderSubmenuItem('Analitik', '/analytics')}
              {renderSubmenuItem('Denetim Kayıtları', '/audit-logs')}
            </div>
          )}

          {/* Sözleşmeler */}
          {renderMenuItem(
            FileCheck, 
            'Sözleşmeler', 
            null, 
            expandedMenus.feedback, 
            true, 
            () => toggleMenu('feedback'),
            ['Sözleşme Yönetimi', 'Kullanıcı Takibi', 'Uyumluluk Kontrolü']
          )}
          {expandedMenus.feedback && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Sözleşme Yönetimi', '/contract-management')}
              {renderSubmenuItem('Kullanıcı Takibi', '/user-contract-tracking')}
              {renderSubmenuItem('Uyumluluk Kontrolü', '/compliance-check')}
            </div>
          )}

          {/* Sistem Yönetimi */}
          {renderMenuItem(
            Activity, 
            'Sistem Yönetimi', 
            null, 
            expandedMenus.station, 
            true, 
            () => toggleMenu('station'),
            ['Sistem Sağlığı']
          )}
          {expandedMenus.station && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Sistem Sağlığı', '/system-health')}
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-info" title={sidebarCollapsed ? 'Superadmin' : ''}>
            <UserCheck size={20} />
            {!sidebarCollapsed && <span>Superadmin</span>}
          </div>
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Çıkış Yap' : ''}
          >
            <LogOut size={20} />
            {!sidebarCollapsed && 'Çıkış Yap'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <button 
              className="sidebar-toggle"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
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
            <ThemeToggle />
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

          {/* Stats Grid */}
          <div className="stats-grid">
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

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Hızlı İşlemler</h3>
            <div className="quick-actions-grid">
              <div className="quick-action-card" onClick={() => navigate('/news/add')}>
                <FileText size={24} />
                <span>Haber Ekle</span>
              </div>
              <div className="quick-action-card" onClick={() => navigate('/station/add')}>
                <MapPin size={24} />
                <span>İstasyon Ekle</span>
              </div>
              <div className="quick-action-card" onClick={() => navigate('/bus/add')}>
                <Bus size={24} />
                <span>Otobüs Ekle</span>
              </div>
              <div className="quick-action-card" onClick={() => navigate('/driver/add')}>
                <UserSearch size={24} />
                <span>Şoför Ekle</span>
              </div>
              <div className="quick-action-card" onClick={() => navigate('/payment-point/add')}>
                <CreditCard size={24} />
                <span>Ödeme Noktası</span>
              </div>
              <div className="quick-action-card" onClick={() => navigate('/route/add')}>
                <Route size={24} />
                <span>Rota Ekle</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Aylık Gelir Trendi</h3>
                <div className="chart-value">
                  {formatCurrency(stats.monthlyIncome)}
                </div>
              </div>
              <div className="chart-placeholder">
                <PieChart size={100} />
                <p>Grafik verileri yükleniyor...</p>
              </div>
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
              <div className="chart-placeholder">
                <BarChart3 size={100} />
                <p>Aktivite grafiği hazırlanıyor...</p>
              </div>
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
                      <div className="activity-icon" style={{ backgroundColor: `var(--${activity.color}-100)` }}>
                        <ActivityIcon size={16} style={{ color: `var(--${activity.color}-600)` }} />
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">{activity.message}</p>
                        <span className="activity-time">{formatTime(activity.timestamp)}</span>
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

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;