import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, ListChecks } from 'lucide-react';
import '../styles/Roles.css';

const Roles = () => {
  const navigate = useNavigate();

  // Backend enum'larına uygun başlangıç listesi (düzenlenecek)
  const roles = useMemo(() => ([
    { key: 'SUPERADMIN', label: 'Super Admin', description: 'Sistem genelinde tüm yetkiler' },
    { key: 'ADMIN_ALL', label: 'Tüm Yetkiler', description: 'Admin kapsamındaki tüm yetkiler' },
    { key: 'STATION_ADMIN', label: 'İstasyon Yöneticisi', description: 'İstasyon CRUD ve durum yönetimi' },
    { key: 'BUS_ADMIN', label: 'Otobüs Yöneticisi', description: 'Otobüs CRUD, sürücü atama, konum' },
    { key: 'DRIVER_ADMIN', label: 'Sürücü Yöneticisi', description: 'Sürücü CRUD ve belge yönetimi' },
    { key: 'ROUTE_ADMIN', label: 'Rota Yöneticisi', description: 'Rota ve durak yönetimi' },
    { key: 'NEWS_ADMIN', label: 'Haber Yöneticisi', description: 'Duyuru/haber yönetimi' },
    { key: 'WALLET_ADMIN', label: 'Cüzdan Yöneticisi', description: 'Cüzdan ve transfer işlemleri' },
    { key: 'BUS_CARD_ADMIN', label: 'Kart Yöneticisi', description: 'Kart okuma, bloke, vize, bakiye' },
    { key: 'REPORT_ADMIN', label: 'Rapor Yöneticisi', description: 'Rapor ve metrik görüntüleme' },
    { key: 'PAYMENT_POINT_ADMIN', label: 'Ödeme Noktası Yöneticisi', description: 'Ödeme noktası CRUD' },
    { key: 'CONTRACT_ADMIN', label: 'Sözleşme Yöneticisi', description: 'Sözleşme içerikleri ve durum' },
    { key: 'NOTIFICATION_ADMIN', label: 'Bildirim Yöneticisi', description: 'Bildirim gönderimi ve geçmiş' },
    { key: 'HEALTH_ADMIN', label: 'Sistem Sağlık', description: 'Sistem sağlık ve altyapı görünümü' },
    { key: 'GEO_ALERT_ADMIN', label: 'Coğrafi Uyarı', description: 'Jeo-uyarı yapılandırmaları' },
    { key: 'AUTO_TOP_UP_ADMIN', label: 'Otomatik Yükleme', description: 'Oto bakiye yükleme kuralları' },
    { key: 'FEED_BACK_ADMIN', label: 'Geri Bildirim', description: 'Geri bildirim listeleme ve detay' },
    { key: 'LOCATION_ADMIN', label: 'Konum Yönetimi', description: 'Konum ve geçmiş verileri' },
    { key: 'SCHEDULE_ADMIN', label: 'Takvim/Sefer', description: 'Sefer ve zamanlama yönetimi' },
    { key: 'USER_ADMIN', label: 'Kullanıcı Yönetimi', description: 'Kullanıcı hesap ve durum yönetimi' },
    { key: 'MODERATOR', label: 'Moderatör', description: 'Sınırlı düzenleme yetkileri' },
  ]), []);

  return (
    <div className="roles-page-container">
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
            <h1 className="page-title">🛡️ Roller</h1>
          </div>
        </div>
        <p className="page-description">
          Sistem rol ve yetkilerinin listesi. Detayları tek tek düzenleyeceğiz.
        </p>
      </div>

      <div className="roles-list">
        {roles.map((role) => (
          <div key={role.key} className="role-card">
            <div className="role-icon">
              <Shield size={20} />
            </div>
            <div className="role-content">
              <div className="role-head">
                <span className="role-key">{role.key}</span>
                <span className="role-label">{role.label}</span>
              </div>
              <p className="role-desc">{role.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="roles-footer">
        <div className="footer-left">
          <ListChecks size={18} />
          <span>{roles.length} rol tanımlı</span>
        </div>
      </div>
    </div>
  );
};

export default Roles;


