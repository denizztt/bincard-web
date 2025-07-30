import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="register-container">
      <div className="register-card">
        <button className="back-button" onClick={() => navigate('/login')}>
          <ArrowLeft size={20} />
          Geri
        </button>

        <div className="register-header">
          <div className="register-icon">
            <UserPlus size={48} />
          </div>
          <h1>Kayıt Ol</h1>
          <p>Yeni hesap oluşturun</p>
        </div>

        <div className="register-content">
          <div className="info-message">
            <h3>Kayıt İşlemi</h3>
            <p>
              Süper admin hesabı oluşturmak için sistem yöneticisi ile iletişime geçin.
              Bu platform sadece yetkili personel tarafından kullanılabilir.
            </p>
          </div>

          <div className="register-actions">
            <button 
              className="contact-button"
              onClick={() => window.location.href = 'mailto:admin@example.com'}
            >
              İletişime Geç
            </button>
            
            <button 
              className="back-to-login-button"
              onClick={() => navigate('/login')}
            >
              Giriş Sayfasına Dön
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;