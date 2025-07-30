import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    countryCode: 'TR +90',
    telephone: '',
    password: ''
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // Country code options
  const countryCodes = [
    'TR +90',
    'US +1', 
    'DE +49',
    'FR +33',
    'GB +44'
  ];

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Format phone number as user types (Turkish format)
  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 10) return formData.telephone; // Don't allow more than 10 digits
    
    let formatted = '';
    if (digits.length > 0) {
      formatted += '(';
      formatted += digits.substring(0, Math.min(3, digits.length));
      if (digits.length >= 3) formatted += ') ';
      if (digits.length > 3) formatted += digits.substring(3, Math.min(6, digits.length));
      if (digits.length >= 6) formatted += ' ';
      if (digits.length > 6) formatted += digits.substring(6, Math.min(8, digits.length));
      if (digits.length >= 8) formatted += ' ';
      if (digits.length > 8) formatted += digits.substring(8, Math.min(10, digits.length));
    }
    
    return formatted;
  };

  // Format password (only numbers, max 6 digits)
  const formatPassword = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.substring(0, 6);
  };

  const handleInputChange = (field, value) => {
    if (field === 'telephone') {
      value = formatPhoneNumber(value);
    } else if (field === 'password') {
      value = formatPassword(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { telephone, password, countryCode } = formData;
    
    // Extract digits from phone number
    const phoneDigits = telephone.replace(/\D/g, '');
    
    if (!telephone.trim()) {
      newErrors.telephone = 'Telefon numarası zorunludur';
    } else if (countryCode.startsWith('TR') && phoneDigits.length !== 10) {
      newErrors.telephone = 'Türkiye için 10 haneli telefon numarası giriniz';
    } else if (!countryCode.startsWith('TR') && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
      newErrors.telephone = 'Geçerli bir telefon numarası giriniz';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Şifre zorunludur';
    } else if (!/^\d{6}$/.test(password)) {
      newErrors.password = 'Şifre 6 haneli sayı olmalıdır';
    }
    
    if (!countryCode) {
      newErrors.countryCode = 'Ülke kodu seçiniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    console.log('📝 LOGIN FORM SUBMIT BAŞLADI');
    e.preventDefault();
    
    console.log('📋 Form Data:', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation başarısız');
      return;
    }
    
    console.log('✅ Form validation başarılı');
    setIsLoading(true);
    setMessage({ text: '', isError: false });
    
    try {
      // Extract only digits from phone number
      const phoneDigits = formData.telephone.replace(/\D/g, '');
      console.log('📞 Temizlenmiş telefon numarası:', phoneDigits);
      console.log('🔐 Şifre uzunluğu:', formData.password.length);
      
      const result = await login(phoneDigits, formData.password);
      console.log('📤 LOGIN SONUCU:', result);
      
      if (result.success) {
        console.log('✅ Login başarılı - SMS sayfasına yönlendiriliyor');
        // Store phone for SMS verification
        sessionStorage.setItem('verificationPhone', phoneDigits);
        console.log('💾 Telefon numarası session storage\'a kaydedildi');
        setMessage({ text: result.message, isError: false });
        
        // Navigate to SMS verification page
        setTimeout(() => {
          console.log('🚀 SMS verification sayfasına yönlendiriliyor...');
          navigate('/verify-sms');
        }, 1500);
      } else {
        console.log('❌ Login başarısız:', result.error);
        setMessage({ text: result.error || 'Giriş başarısız', isError: true });
      }
    } catch (error) {
      console.error('❌ LOGIN CATCH ERROR:', error);
      setMessage({ text: 'Giriş sırasında bir hata oluştu', isError: true });
    } finally {
      setIsLoading(false);
      console.log('🏁 LOGIN FORM SUBMIT TAMAMLANDI');
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="login-container">
      <div className="login-main">
        {/* Welcome section */}
        <div className="login-welcome">
          <h1 className="login-greeting">Merhaba 👋</h1>
          <p className="login-time">{currentTime}</p>
        </div>

        {/* Login card */}
        <div className="login-card">
          <h2 className="login-title">Superadmin Girişi</h2>
          
          <form onSubmit={handleSubmit} className="login-form">
            {/* Phone number section */}
            <div className="form-group">
              <label className="form-label">Telefon (Kullanıcı Adı):</label>
              
              <div className="phone-input-container">
                {/* Country code selector */}
                <select 
                  value={formData.countryCode}
                  onChange={(e) => handleInputChange('countryCode', e.target.value)}
                  className="country-select"
                >
                  {countryCodes.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
                
                {/* Phone number input */}
                <input
                  type="text"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  placeholder="(5xx) xxx xx xx"
                  className={`phone-input ${errors.telephone ? 'error' : ''}`}
                />
              </div>
              
              {errors.telephone && (
                <span className="error-message">{errors.telephone}</span>
              )}
            </div>

            {/* Password section */}
            <div className="form-group">
              <label className="form-label">Şifre:</label>
              
              <div className="password-container">
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="6 haneli şifre giriniz"
                  className={`password-input ${errors.password ? 'error' : ''}`}
                  maxLength="6"
                />
                
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle"
                >
                  {isPasswordVisible ? '🙈' : '👁'}
                </button>
              </div>
              
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`login-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>

            {/* Message display */}
            {message.text && (
              <div className={`message ${message.isError ? 'error' : 'success'}`}>
                {message.text}
              </div>
            )}
          </form>

          {/* Back to main menu */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="back-button"
          >
            ← Ana Menü
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;