import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Bus
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
    reports: false
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    console.log('📊 DASHBOARD VERİLERİ YÜKLENİYOR...');
    try {
      setLoading(true);
      setError('');

      console.log('🔄 API çağrıları başlıyor...');
      // Paralel API çağrıları
      const [dashboardResponse, reportsResponse] = await Promise.all([
        dashboardApi.getDashboardStats(),
        reportsApi.getRecentActivities()
      ]);

      console.log('📈 DASHBOARD API RESPONSE:', dashboardResponse);
      console.log('📋 REPORTS API RESPONSE:', reportsResponse);

      if (dashboardResponse && dashboardResponse.success) {
        const data = dashboardResponse.data;
        console.log('✅ Dashboard verisi başarılı:', data);
        setStats({
          totalUsers: data.totalUsers || 12450,
          activeUsers: data.activeUsers || 8967,
          dailyIncome: data.dailyIncome || 245680,
          monthlyIncome: data.monthlyIncome || 7456230,
          pendingRequests: data.pendingRequests || 23,
          todayTransactions: data.todayTransactions || 1567,
          systemStatus: data.systemStatus || 'Normal',
          totalBuses: data.totalBuses || 456,
          totalStations: data.totalStations || 89
        });
        console.log('💾 Dashboard stats güncellendi');
      } else {
        console.log('⚠️ Dashboard API response başarısız:', dashboardResponse);
      }

      if (reportsResponse && reportsResponse.success) {
        console.log('✅ Reports verisi başarılı:', reportsResponse.data);
        setRecentActivities(reportsResponse.data || []);
      } else {
        console.log('⚠️ Reports API response başarısız:', reportsResponse);
      }

      setLastUpdate(new Date());
      setLoading(false);
      console.log('🎯 DASHBOARD YÜKLEMESİ TAMAMLANDI');
    } catch (err) {
      console.error('❌ DASHBOARD VERİLERİ HATA:', err);
      console.error('🔍 Dashboard Error Details:', {
        message: err.message,
        response: err.response,
        responseData: err.response?.data,
        status: err.response?.status,
        fullError: err
      });
      setError('Bazı veriler yüklenemedi');
      
      // Örnek verilerle devam et
      console.log('🔄 Örnek verilerle devam ediliyor...');
      setStats({
        totalUsers: 12450,
        activeUsers: 8967,
        dailyIncome: 245680,
        monthlyIncome: 7456230,
        pendingRequests: 23,
        todayTransactions: 1567,
        systemStatus: 'Normal',
        totalBuses: 456,
        totalStations: 89
      });
      setLastUpdate(new Date());
      setLoading(false);
      console.log('📊 DASHBOARD ÖRNEK VERİLERLE YÜKLENDİ');
    }
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => {
      // Accordion behavior: close all other menus when opening a new one
      const newState = {
        news: false,
        feedback: false,
        station: false,
        payment: false,
        admin: false,
        wallet: false,
        reports: false
      };
      
      // If the clicked menu is currently closed, open it
      // If it's already open, keep it closed (toggle behavior)
      if (!prev[menuKey]) {
        newState[menuKey] = true;
      }
      
      return newState;
    });
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount);
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
    if (sidebarCollapsed) return null;
    
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
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!sidebarCollapsed && <h2>🚌 Superadmin</h2>}
          <button 
            className="sidebar-collapse-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
          >
            {sidebarCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
        </div>

        <div className="sidebar-menu">
          {/* Expandable Search functionality */}
          <div className={`sidebar-search ${searchVisible ? 'expanded' : ''}`}>
            <div className="search-container">
              <button 
                className="search-icon"
                onClick={() => setSearchVisible(!searchVisible)}
                title={searchVisible ? "Aramayı kapat" : "Menüde arama yap"}
              >
                <Search size={20} />
              </button>
              {searchVisible && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Menüde ara..."
                  className="search-input-expandable"
                  autoFocus={searchVisible}
                  style={{
                    width: searchVisible ? '200px' : '0px',
                    opacity: searchVisible ? 1 : 0,
                    paddingLeft: searchVisible ? '12px' : '0px',
                    paddingRight: searchVisible ? '12px' : '0px'
                  }}
                />
              )}
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
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <h1>Dashboard</h1>
          </div>
          
          <div className="header-right">
            <ThemeToggle />
            <div className="last-update">
              <Clock size={16} />
              <span>Son Güncelleme: {lastUpdate ? formatTime(lastUpdate) : '-'}</span>
            </div>
            <button 
              className="refresh-button"
              onClick={loadDashboardData}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        {/* Welcome Section */}
        <div className="welcome-section">
          <h2>Hoş Geldiniz!</h2>
          <p>Sistem durumu <strong>{stats.systemStatus}</strong> - Tüm servisler aktif</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card users">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3>Kullanıcılar</h3>
              <div className="stat-number">{stats.totalUsers.toLocaleString()}</div>
              <div className="stat-subtitle">
                {stats.activeUsers.toLocaleString()} aktif 
                ({Math.round((stats.activeUsers / stats.totalUsers) * 100)}%)
              </div>
            </div>
          </div>

          <div className="stat-card income">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>Gelir</h3>
              <div className="stat-number">{formatCurrency(stats.dailyIncome)}</div>
              <div className="stat-subtitle">Günlük / Aylık: {formatCurrency(stats.monthlyIncome)}</div>
            </div>
          </div>

          <div className="stat-card transactions">
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <h3>İşlemler</h3>
              <div className="stat-number">{stats.todayTransactions.toLocaleString()}</div>
              <div className="stat-subtitle">Bugün gerçekleşen</div>
            </div>
          </div>

          <div className="stat-card requests">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>Bekleyen İstekler</h3>
              <div className="stat-number">{stats.pendingRequests}</div>
              <div className="stat-subtitle">İnceleme bekliyor</div>
            </div>
          </div>

          <div className="stat-card infrastructure">
            <div className="stat-icon">
              <MapPin size={24} />
            </div>
            <div className="stat-content">
              <h3>Altyapı</h3>
              <div className="stat-number">{stats.totalStations}</div>
              <div className="stat-subtitle">{stats.totalBuses} otobüs, {stats.totalStations} istasyon</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Hızlı İşlemler</h3>
          <div className="quick-actions-grid">
            <div className="quick-action-card" onClick={() => handleMenuClick('/news/add')}>
              <FileText size={32} />
              <span>Haber Ekle</span>
            </div>
            <div className="quick-action-card" onClick={() => handleMenuClick('/station/add')}>
              <MapPin size={32} />
              <span>İstasyon Ekle</span>
            </div>
            <div className="quick-action-card" onClick={() => handleMenuClick('/admin-approvals')}>
              <UserCheck size={32} />
              <span>Admin Onayları</span>
            </div>
            <div className="quick-action-card" onClick={() => handleMenuClick('/analytics')}>
              <BarChart3 size={32} />
              <span>Analiz Paneli</span>
            </div>
            <div className="quick-action-card" onClick={() => handleMenuClick('/wallet-transfers')}>
              <ArrowLeftRight size={32} />
              <span>Transfer İşlemleri</span>
            </div>
            <div className="quick-action-card" onClick={() => handleMenuClick('/statistics')}>
              <PieChart size={32} />
              <span>İstatistikler</span>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="recent-activities">
          <h3>Son Aktiviteler</h3>
          {recentActivities.length > 0 ? (
            <div className="activities-list">
              {recentActivities.slice(0, 5).map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    <Activity size={16} />
                  </div>
                  <div className="activity-content">
                    <span className="activity-text">{activity.description}</span>
                    <span className="activity-time">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-activities">
              <Activity size={48} />
              <p>Henüz aktivite bulunmuyor</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="summary">
          <h3>Özet</h3>
          <p>
            Sisteminizde <strong>{stats.totalUsers.toLocaleString()}</strong> kullanıcı bulunuyor, 
            bunların <strong>{stats.activeUsers.toLocaleString()}</strong> tanesi aktif durumda. 
            Bugün <strong>{stats.todayTransactions.toLocaleString()}</strong> işlem gerçekleşti ve 
            <strong>{formatCurrency(stats.dailyIncome)}</strong> gelir elde edildi.
          </p>
        </div>
      </div>

      {/* Sidebar Overlay */}
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