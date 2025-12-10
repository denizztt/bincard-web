import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/EnhancedAuthContext';
import { 
  Home,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  FileText,
  MessageSquare,
  MapPin,
  CreditCard,
  Bus,
  Route,
  Wallet,
  UserCheck,
  BarChart3,
  FileCheck,
  UserSearch,
  Activity,
  LogOut,
  User,
  Settings
} from 'lucide-react';
import '../styles/Dashboard.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    news: false,
    feedback: false,
    station: false,
    payment: false,
    admin: false,
    wallet: false,
    reports: false,
    contracts: false,
    system: false,
    logs: false,
    superadmin: false
  });

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

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSearchClick = () => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const shouldShowMenuItem = (label, subItems = []) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return label.toLowerCase().includes(query) || 
           subItems.some(item => item.toLowerCase().includes(query));
  };

  const renderMenuItem = (icon, label, path, isExpanded = false, hasSubmenu = false, onClick, subItems = []) => {
    const IconComponent = icon;
    const isActive = location.pathname === path;
    
    if (!shouldShowMenuItem(label, subItems)) {
      return null;
    }
    
    if (hasSubmenu) {
      return (
        <div key={label} className="menu-item-container">
          <div 
            className={`menu-item ${isExpanded ? 'expanded' : ''} ${sidebarCollapsed ? 'collapsed' : ''} ${isActive ? 'active' : ''}`}
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
        className={`menu-item ${sidebarCollapsed ? 'collapsed' : ''} ${isActive ? 'active' : ''}`}
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
    const isActive = location.pathname === path;
    
    return (
      <div 
        key={path}
        className={`submenu-item ${isActive ? 'active' : ''}`}
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
          <div className="sidebar-title">
            {!sidebarCollapsed && <h2>City Card Süper Admin</h2>}
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
            <div className="search-input-container" onClick={handleSearchClick}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Menü ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={handleSearchClick}
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
              {renderSubmenuItem('Otobüs Ekle', '/bus/create')}
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
            ['Admin Listesi', 'Admin Ekle', 'Admin Onayları', 'Rol Yönetimi']
          )}
          {expandedMenus.system && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Admin Listesi', '/admin/list')}
              {renderSubmenuItem('Admin Ekle', '/admin/add')}
              {renderSubmenuItem('Admin Onayları', '/admin-approvals')}
            </div>
          )}

          {/* Süperadmin */}
          {renderMenuItem(
            User, 
            'Süperadmin', 
            null, 
            expandedMenus.superadmin, 
            true, 
            () => toggleMenu('superadmin'),
            ['Profilim', 'Ayarlar', 'Aktivitelerim']
          )}
          {expandedMenus.superadmin && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Profilim', '/admin/profile')}
              {renderSubmenuItem('Ayarlar', '/admin/settings')}
              {renderSubmenuItem('Aktivitelerim', '/admin/activity')}
            </div>
          )}

          {/* Raporlar & Analiz */}
          {renderMenuItem(
            BarChart3, 
            'Raporlar & Analiz', 
            null, 
            expandedMenus.reports, 
            true, 
            () => toggleMenu('reports'),
            ['Gelir Raporları', 'İstatistikler', 'Analitik', 'Denetim Kayıtları']
          )}
          {expandedMenus.reports && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Gelir Raporları', '/bus-income-reports')}
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

          {/* Otobüs Kart Yönetimi */}
          {renderMenuItem(
            CreditCard, 
            'Otobüs Kart Yönetimi', 
            null, 
            expandedMenus.payment, 
            true, 
            () => toggleMenu('payment'),
            ['Kart Yönetimi', 'Yeni Kart Ekle', 'Kart Düzenle', 'Abonman Oluştur', 'Fiyatlandırma Yönetimi', 'Fiyatlandırma Listesi']
          )}
          {expandedMenus.payment && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Kart Yönetimi', '/buscard-management')}
              {renderSubmenuItem('Yeni Kart Ekle', '/buscard-register')}
              {renderSubmenuItem('Abonman Oluştur', '/buscard-subscription')}
              {renderSubmenuItem('Fiyatlandırma Yönetimi', '/buscard-pricing')}
              {renderSubmenuItem('Fiyatlandırma Listesi', '/buscard-pricing-list')}
            </div>
          )}

          {/* Log Kayıtları */}
          {renderMenuItem(
            FileText, 
            'Log Kayıtları', 
            null, 
            expandedMenus.logs, 
            true, 
            () => toggleMenu('logs'),
            ['Otomatik Yükleme Logları']
          )}
          {expandedMenus.logs && !sidebarCollapsed && (
            <div className="submenu">
              {renderSubmenuItem('Otomatik Yükleme Logları', '/auto-top-up-logs')}
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
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default Layout;

