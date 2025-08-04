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
  UserSearch
} from 'lucide-react';
import { dashboardApi, reportsApi } from '../services/apiService';
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
      const response = await dashboardApi.getStats();
      
      if (response && response.success) {
        setStats(response.data);
      }
      
      const activitiesResponse = await dashboardApi.getRecentActivities();
      if (activitiesResponse && activitiesResponse.success) {
        setRecentActivities(activitiesResponse.data);
      }
      
      setLastUpdate(new Date());
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
    } catch (err) {
      console.error('Logout error:', err);
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
    // Sidebar açıksa kapat
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    if (!searchVisible) {
      setSearchQuery('');
    }
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // Dashboard kartları için yardımcı fonksiyonlar
  const getStatusColor = (status) => {
    switch (status) {
      case 'Normal':
        return '#10b981';
      case 'Uyarı':
        return '#f59e0b';
      case 'Kritik':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('tr-TR').format(number);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const shouldShowMenuItem = (label, subItems = []) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const labelMatch = label.toLowerCase().includes(query);
    const subItemsMatch = subItems.some(item => item.toLowerCase().includes(query));
    
    return labelMatch || subItemsMatch;
  };

  const renderMenuItem = (icon, label, path, isExpanded = false, hasSubmenu = false, onClick, subItems = []) => {
    const IconComponent = icon;
    
    // Hide item if it doesn't match search
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

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            {!sidebarCollapsed && <span>City Card Admin</span>}
            <button 
              className="sidebar-collapse-btn"
              onClick={toggleSidebarCollapse}
              title={sidebarCollapsed ? 'Genişlet' : 'Daralt'}
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          
          {/* Search */}
          <div className={`sidebar-search ${searchVisible || !sidebarCollapsed ? 'visible' : ''}`}>
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Menü ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <div className="search-icon">
                <Search size={16} />
              </div>
            </div>
          </div>

          {renderMenuItem(Home, 'Dashboard', '/dashboard')}
          
          {/* Haber Yönetimi */}
          {renderMenuItem(
            FileText, 
            'Haber Yönetimi', 
            null, 
            expandedMenus.news, 
            true, 
            () => toggleMenu('news'),
            ['Haber Listesi', 'Haber Ekle']
          )}
          {expandedMenus.news && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Haber Listesi', '/news')}
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

          {/* Otobüs Yönetimi - YENİ */}
          {renderMenuItem(
            Bus, 
            'Otobüs Yönetimi', 
            null, 
            expandedMenus.bus, 
            true, 
            () => toggleMenu('bus'),
            ['Otobüs Listesi', 'Yeni Otobüs', 'Otobüs Haritası']
          )}
          {expandedMenus.bus && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Otobüs Listesi', '/bus')}
              {renderSubmenuItem('Yeni Otobüs', '/bus/add')}
              {renderSubmenuItem('Otobüs Haritası', '/bus/map')}
            </div>
          )}

          {/* Şoför Yönetimi - YENİ */}
          {renderMenuItem(
            Users, 
            'Şoför Yönetimi', 
            null, 
            expandedMenus.driver, 
            true, 
            () => toggleMenu('driver'),
            ['Şoför Listesi', 'Yeni Şoför']
          )}
          {expandedMenus.driver && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Şoför Listesi', '/driver')}
              {renderSubmenuItem('Yeni Şoför', '/driver/add')}
            </div>
          )}

          {/* Rota Yönetimi - YENİ */}
          {renderMenuItem(
            Route, 
            'Rota Yönetimi', 
            null, 
            expandedMenus.route, 
            true, 
            () => toggleMenu('route'),
            ['Rota Listesi', 'Yeni Rota', 'Rota Haritası']
          )}
          {expandedMenus.route && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Rota Listesi', '/route')}
              {renderSubmenuItem('Yeni Rota', '/route/add')}
              {renderSubmenuItem('Rota Haritası', '/route/map')}
            </div>
          )}

          {/* Cüzdan Yönetimi - YENİ */}
          {renderMenuItem(
            Wallet, 
            'Cüzdan Yönetimi', 
            null, 
            expandedMenus.wallet, 
            true, 
            () => toggleMenu('wallet'),
            ['Tüm Cüzdanlar', 'Transfer İşlemleri', 'Durum Güncelle']
          )}
          {expandedMenus.wallet && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Tüm Cüzdanlar', '/all-wallets')}
              {renderSubmenuItem('Transfer İşlemleri', '/wallet-transfers')}
              {renderSubmenuItem('Durum Güncelle', '/wallet-status-update')}
            </div>
          )}

          {/* Admin Yönetimi */}
          {renderMenuItem(
            Shield, 
            'Admin Yönetimi', 
            null, 
            expandedMenus.admin, 
            true, 
            () => toggleMenu('admin'),
            ['Admin Onayları', 'Kimlik İstekleri']
          )}
          {expandedMenus.admin && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Admin Onayları', '/admin-approvals')}
              {renderSubmenuItem('Kimlik İstekleri', '/identity-requests')}
            </div>
          )}

          {/* Raporlar ve Analiz - YENİ */}
          {renderMenuItem(
            BarChart3, 
            'Raporlar & Analiz', 
            null, 
            expandedMenus.reports, 
            true, 
            () => toggleMenu('reports'),
            ['Analiz Paneli', 'Sistem İstatistikleri', 'Denetim Kayıtları']
          )}
          {expandedMenus.reports && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Analiz Paneli', '/analytics')}
              {renderSubmenuItem('Sistem İstatistikleri', '/statistics')}
              {renderSubmenuItem('Denetim Kayıtları', '/audit-logs')}
            </div>
          )}

          {/* Sözleşmeler - YENİ */}
          {renderMenuItem(
            FileCheck, 
            'Sözleşmeler', 
            null, 
            expandedMenus.contracts, 
            true, 
            () => toggleMenu('contracts'),
            ['Sözleşme Yönetimi', 'Kullanıcı Takibi', 'Uyumluluk Kontrolü']
          )}
          {expandedMenus.contracts && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Sözleşme Yönetimi', '/contract-management')}
              {renderSubmenuItem('Kullanıcı Takibi', '/user-contract-tracking')}
              {renderSubmenuItem('Uyumluluk Kontrolü', '/compliance-check')}
            </div>
          )}

          {/* Sistem Yönetimi - YENİ */}
          {renderMenuItem(
            Activity, 
            'Sistem Yönetimi', 
            null, 
            expandedMenus.system, 
            true, 
            () => toggleMenu('system'),
            ['Sistem Sağlığı']
          )}
          {expandedMenus.system && !sidebarCollapsed && (
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
        <div className="main-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
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
              className="refresh-btn"
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
            <div className="error-message">
              <span>⚠️ {error}</span>
              <button onClick={handleRefresh}>Tekrar Dene</button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon users">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <h3>Toplam Kullanıcı</h3>
                  <p className="stat-value">{formatNumber(stats.totalUsers)}</p>
                </div>
              </div>
              <div className="stat-footer">
                <div className="stat-badge">
                  <TrendingUp size={16} />
                  <span>Aktif: {formatNumber(stats.activeUsers)}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon revenue">
                  <BarChart3 size={24} />
                </div>
                <div className="stat-info">
                  <h3>Günlük Gelir</h3>
                  <p className="stat-value">{formatCurrency(stats.dailyIncome)}</p>
                </div>
              </div>
              <div className="stat-footer">
                <div className="stat-badge">
                  <ArrowLeftRight size={16} />
                  <span>İşlem: {formatNumber(stats.todayTransactions)}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon pending">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <h3>Bekleyen İstekler</h3>
                  <p className="stat-value">{formatNumber(stats.pendingRequests)}</p>
                </div>
              </div>
              <div className="stat-footer">
                <div className="stat-badge">
                  <Edit3 size={16} />
                  <span>İnceleme Gerekli</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon system">
                  <Activity size={24} />
                </div>
                <div className="stat-info">
                  <h3>Sistem Durumu</h3>
                  <p className="stat-value" style={{ color: getStatusColor(stats.systemStatus) }}>
                    {stats.systemStatus}
                  </p>
                </div>
              </div>
              <div className="stat-footer">
                <div className="stat-badge">
                  <Shield size={16} />
                  <span>Güvenli</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon buses">
                  <Bus size={24} />
                </div>
                <div className="stat-info">
                  <h3>Toplam Otobüs</h3>
                  <p className="stat-value">{formatNumber(stats.totalBuses)}</p>
                </div>
              </div>
              <div className="stat-footer">
                <div className="stat-badge">
                  <Route size={16} />
                  <span>Aktif Rotalar</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon stations">
                  <MapPin size={24} />
                </div>
                <div className="stat-info">
                  <h3>Toplam İstasyon</h3>
                  <p className="stat-value">{formatNumber(stats.totalStations)}</p>
                </div>
              </div>
              <div className="stat-footer">
                <div className="stat-badge">
                  <MapPin size={16} />
                  <span>Hizmet Noktaları</span>
                </div>
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

          {/* Recent Activities */}
          <div className="activities-section">
            <div className="activities-header">
              <h3>Son Aktiviteler</h3>
              <button className="view-all-btn">
                Tümünü Gör
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="activities-list">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <Activity size={16} />
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">{activity.description}</p>
                      <span className="activity-time">{activity.timestamp}</span>
                    </div>
                  </div>
                ))
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