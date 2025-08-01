import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Phone, Lock, Clock, Zap, Palette, Bus, Car, Truck } from 'lucide-react';
import '../styles/Login.css';

// Enhanced Color themes with more variety
const colorThemes = {
  neon: {
    name: "Neon City",
    bg: "neon-gradient",
    accent1: "neon-accent-1",
    accent2: "neon-accent-2", 
    accent3: "neon-accent-3",
    primary: "neon-primary",
    button: "neon-button",
    secondary: "neon-secondary",
  },
  fire: {
    name: "Fire Storm",
    bg: "fire-gradient",
    accent1: "fire-accent-1",
    accent2: "fire-accent-2",
    accent3: "fire-accent-3", 
    primary: "fire-primary",
    button: "fire-button",
    secondary: "fire-secondary",
  },
  ice: {
    name: "Ice Crystal",
    bg: "ice-gradient",
    accent1: "ice-accent-1",
    accent2: "ice-accent-2",
    accent3: "ice-accent-3",
    primary: "ice-primary", 
    button: "ice-button",
    secondary: "ice-secondary",
  },
  galaxy: {
    name: "Galaxy Dream",
    bg: "galaxy-gradient",
    accent1: "galaxy-accent-1",
    accent2: "galaxy-accent-2",
    accent3: "galaxy-accent-3",
    primary: "galaxy-primary",
    button: "galaxy-button", 
    secondary: "galaxy-secondary",
  },
  earth: {
    name: "Earth Tone",
    bg: "earth-gradient",
    accent1: "earth-accent-1",
    accent2: "earth-accent-2",
    accent3: "earth-accent-3",
    primary: "earth-primary",
    button: "earth-button",
    secondary: "earth-secondary",
  },
  ocean: {
    name: "Ocean Breeze", 
    bg: "ocean-gradient",
    accent1: "ocean-accent-1",
    accent2: "ocean-accent-2",
    accent3: "ocean-accent-3",
    primary: "ocean-primary",
    button: "ocean-button",
    secondary: "ocean-secondary",
  },
};

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [currentTheme, setCurrentTheme] = useState('neon'); // Neon default
  const theme = colorThemes[currentTheme];

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
  const formatPhoneNumber = (value, isDeleting = false) => {
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

  // Handle phone input with proper backspace support
  const handlePhoneInput = (e) => {
    const inputValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const isDeleting = e.nativeEvent.inputType === 'deleteContentBackward';
    
    if (isDeleting) {
      // If deleting and cursor is after a space or ), delete the digit before it
      const beforeCursor = inputValue.substring(0, cursorPosition);
      const afterCursor = inputValue.substring(cursorPosition);
      
      // Check if we're deleting a space or ) character
      if (beforeCursor.length > 0 && [' ', ')'].includes(beforeCursor[beforeCursor.length - 1])) {
        // Remove the space/bracket and the digit before it
        const newValue = beforeCursor.substring(0, beforeCursor.length - 2) + afterCursor;
        const formattedValue = formatPhoneNumber(newValue, true);
        setFormData(prev => ({ ...prev, telephone: formattedValue }));
        
        // Set cursor position after formatting
        setTimeout(() => {
          const newCursorPos = Math.max(0, cursorPosition - 2);
          e.target.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
        return;
      }
    }
    
    // Normal formatting
    const formattedValue = formatPhoneNumber(inputValue, isDeleting);
    setFormData(prev => ({ ...prev, telephone: formattedValue }));
    
    // Clear error when user starts typing
    if (errors.telephone) {
      setErrors(prev => ({ ...prev, telephone: '' }));
    }
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
    <div className={`modern-login-container ${theme.bg}`}>
      {/* Theme Selector */}
      <div className="theme-selector">
        <div className="theme-selector-button">
          <Palette size={16} />
          <select 
            value={currentTheme} 
            onChange={(e) => setCurrentTheme(e.target.value)}
            className="theme-select"
          >
            {Object.entries(colorThemes).map(([key, themeData]) => (
              <option key={key} value={key}>
                {themeData.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Moving Buses Background Animation */}
      <div className="background-animation">
        <div className="moving-vehicle bus-1">
          <Bus size={32} />
        </div>
        <div className="moving-vehicle car-1">
          <Car size={24} />
        </div>
        <div className="moving-vehicle truck-1">
          <Truck size={40} />
        </div>
        <div className="moving-vehicle bus-2">
          <Bus size={24} />
        </div>
        <div className="moving-vehicle car-2">
          <Car size={20} />
        </div>
      </div>

      {/* Enhanced Background Elements */}
      <div className="background-elements">
        <div className={`accent-blob blob-1 ${theme.accent1}`}></div>
        <div className={`accent-blob blob-2 ${theme.accent2}`}></div>
        <div className={`accent-blob blob-3 ${theme.accent3}`}></div>
      </div>

      {/* Enhanced Grid Pattern */}
      <div className="grid-pattern"></div>

      <div className="login-content">
        {/* Enhanced Welcome Section */}
        <div className="welcome-section">
          <div className="logo-container">
            {/* Multiple Glow Layers */}
            <div className={`glow-layer glow-primary ${theme.primary}`}></div>
            <div className={`glow-layer glow-secondary ${theme.secondary}`}></div>
            <div className={`logo-icon ${theme.primary}`}>
              <Bus size={40} />
              {/* Smoke Effect */}
              <div className="smoke-effects">
                <div className="smoke-particle smoke-1"></div>
                <div className="smoke-particle smoke-2"></div>
                <div className="smoke-particle smoke-3"></div>
                <div className="smoke-particle smoke-4"></div>
                <div className="smoke-particle smoke-5"></div>
              </div>
            </div>
          </div>

          <h1 className="welcome-title">
            Merhaba <span className="wave-emoji">👋</span>
          </h1>

          <div className={`time-display ${theme.primary}`}>
            <div className="time-icon-container">
              <Clock size={20} />
              <Bus size={8} className="mini-bus" />
            </div>
            <p className="current-time">{currentTime}</p>
          </div>
        </div>

        {/* Enhanced Login Card */}
        <div className="modern-login-card">
          {/* Enhanced Card Glow Effect */}
          <div className={`card-glow card-glow-primary ${theme.primary}`}></div>
          <div className={`card-glow card-glow-secondary ${theme.secondary}`}></div>

          <div className="card-header">
            <div className="header-icon-container">
              <div className="header-icon-glow">
                <Zap size={28} className="header-zap" />
                <Bus size={12} className="header-mini-bus" />
              </div>
              <h2 className={`card-title ${theme.primary}`}>
                Superadmin Girişi
              </h2>
            </div>
            <p className="card-description">
              <Bus size={16} className="desc-bus" />
              <span>Yönetici paneline güvenli erişim</span>
            </p>
          </div>

          <div className="card-content">
            <form onSubmit={handleSubmit} className="modern-form">
              {/* Enhanced Phone Number Section */}
              <div className="form-section">
                <label className="modern-label">
                  <div className={`label-icon ${theme.primary}`}>
                    <Phone size={20} />
                    <Bus size={8} className="label-mini-bus" />
                  </div>
                  <span>Telefon (Kullanıcı Adı)</span>
                </label>

                <div className="phone-input-row">
                  {/* Enhanced Country Code Selector */}
                  <select
                    value={formData.countryCode}
                    onChange={(e) => handleInputChange('countryCode', e.target.value)}
                    className="modern-country-select"
                  >
                    {countryCodes.map((code) => (
                      <option key={code} value={code}>
                        <Bus size={12} /> {code}
                      </option>
                    ))}
                  </select>

                  {/* Enhanced Phone Number Input */}
                  <div className="modern-input-container">
                    <input
                      type="text"
                      value={formData.telephone}
                      onChange={handlePhoneInput}
                      placeholder="(5xx) xxx xx xx"
                      className={`modern-input ${errors.telephone ? 'error' : ''}`}
                    />
                    {formData.telephone && (
                      <button
                        type="button"
                        className="clear-input-btn"
                        onClick={() => handleInputChange('telephone', '')}
                        title="Telefon numarasını temizle"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {errors.telephone && (
                  <p className="modern-error">
                    <Bus size={16} />
                    <span>{errors.telephone}</span>
                  </p>
                )}
              </div>

              {/* Enhanced Password Section */}
              <div className="form-section">
                <label className="modern-label">
                  <div className={`label-icon ${theme.secondary}`}>
                    <Lock size={20} />
                    <Truck size={8} className="label-mini-bus" />
                  </div>
                  <span>Şifre</span>
                </label>

                <div className="modern-input-container">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="6 haneli şifre giriniz"
                    maxLength={6}
                    className={`modern-input ${errors.password ? 'error' : ''}`}
                  />

                  {formData.password && (
                    <button
                      type="button"
                      onClick={() => handleInputChange('password', '')}
                      className="clear-password-btn"
                      title="Şifreyi temizle"
                    >
                      ✕
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="password-visibility-btn"
                  >
                    <div className="visibility-icon-container">
                      {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                      <Car size={8} className="visibility-mini-car" />
                    </div>
                  </button>
                </div>

                {errors.password && (
                  <p className="modern-error">
                    <Truck size={16} />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`modern-submit-btn ${theme.button} ${isLoading ? 'loading' : ''}`}
              >
                {isLoading ? (
                  <div className="loading-content">
                    <Bus size={24} className="loading-bus" />
                    <span>Giriş yapılıyor...</span>
                  </div>
                ) : (
                  <div className="submit-content">
                    <div className="submit-icon-container">
                      <Zap size={20} />
                      <Bus size={8} className="submit-mini-bus" />
                    </div>
                    <span>Giriş Yap</span>
                  </div>
                )}
              </button>

              {/* Enhanced Message Display */}
              {message.text && (
                <div className={`modern-message ${message.isError ? 'error' : 'success'}`}>
                  <div className="message-content">
                    <Bus size={20} className="message-bus" />
                    <span>{message.text}</span>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="modern-footer">
          <p>
            <Truck size={16} />
            <span>🔒 Güvenli yönetici erişimi</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;