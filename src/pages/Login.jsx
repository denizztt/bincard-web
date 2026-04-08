import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/EnhancedAuthContext';
import { Eye, EyeOff, Phone, Lock, ArrowLeft, Shield, User, Sparkles } from 'lucide-react';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  // Form states
  const [formData, setFormData] = useState({
    telephone: '',
    password: ''
  });
  const [rawTelephone, setRawTelephone] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Simple phone number formatting (xxx) xxx xx xx
  const formatPhoneNumber = (value) => {
    // Only allow digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = digits.substring(0, 10);
    
    // Apply format: (xxx) xxx xx xx
    let formatted = '';
    if (limited.length > 0) {
      if (limited.length <= 3) {
        formatted = `(${limited}`;
      } else if (limited.length <= 6) {
        formatted = `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
      } else if (limited.length <= 8) {
        formatted = `(${limited.slice(0, 3)}) ${limited.slice(3, 6)} ${limited.slice(6)}`;
      } else {
        formatted = `(${limited.slice(0, 3)}) ${limited.slice(3, 6)} ${limited.slice(6, 8)} ${limited.slice(8)}`;
      }
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
      // Format phone number as user types
      const formattedPhone = formatPhoneNumber(value);
      
      // Store both formatted and raw phone
      setFormData(prev => ({ ...prev, telephone: formattedPhone }));
      
      // Store raw digits for API
      const rawDigits = value.replace(/\D/g, '').substring(0, 10);
      setRawTelephone(rawDigits);
    } else if (field === 'password') {
      value = formatPassword(value);
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { telephone, password } = formData;
    
    // Extract digits from phone number
    const phoneDigits = telephone.replace(/\D/g, '');
    
    if (!telephone.trim()) {
      newErrors.telephone = 'Telefon numarası zorunludur';
    } else if (phoneDigits.length !== 10) {
      newErrors.telephone = '10 haneli telefon numarası giriniz';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Şifre zorunludur';
    } else if (!/^\d{6}$/.test(password)) {
      newErrors.password = 'Şifre 6 haneli sayı olmalıdır';
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
      
      // Call API directly for login with token response expected
      // Try most common phone number formats first to avoid brute force protection
      const phoneFormats = [
        `+90${phoneDigits}`, // +905550000000 (international format - backend expects this)
        phoneDigits, // 5550000000 (fallback)
        `0${phoneDigits}`, // 05550000000 (local format)
      ];
      
      console.log('🚀 API login call yapılıyor...', { original: phoneDigits, formats: phoneFormats });
      
      let response;
      let result;
      let success = false;
      
      // Try the most likely format first (without +90 prefix - backend expects this)
      const loginPayload = {
        telephone: phoneDigits,
        password: formData.password
      };
      
      console.log('🔄 İlk deneme (orijinal format):', loginPayload);
      
      try {
        response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bingolkart.com.tr/v1/api'}/auth/superadmin-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginPayload)
        });
        
        result = await response.json();
        console.log('📤 İlk deneme Response:', result);
        
        if (response.ok && result.success) {
          console.log('✅ İlk deneme başarılı!');
          // SMS doğrulama gerekiyor
          if (result.message && result.message.includes('SMS')) {
            console.log('📱 SMS doğrulama gerekiyor');
            sessionStorage.setItem('verificationPhone', phoneDigits);
            setMessage({ text: result.message || 'SMS doğrulama gerekli', isError: false });
            
            setTimeout(() => {
              console.log('🚀 SMS verification sayfasına yönlendiriliyor...');
              navigate('/verify-sms');
            }, 1500);
            return;
          }
          success = true;
        } else if (response.status === 400) {
          console.log('❌ 400 hatası - brute force protection tetiklendi');
          setMessage({ text: 'Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyin.', isError: true });
          return;
        }
      } catch (error) {
        console.log('❌ İlk deneme hatası:', error);
      }
      
      // If first attempt failed and no 400 error, try different phone formats
      if (!success && response?.status !== 400) {
        const alternativePayload = {
          telephone: `+90${phoneDigits}`, // Try with +90 prefix
          password: formData.password
        };
        
        console.log('🔄 Alternatif format ile deneme:', alternativePayload);
        
        try {
          response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bingolkart.com.tr/v1/api'}/auth/superadmin-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(alternativePayload)
          });
          
          result = await response.json();
          console.log('📤 Alternatif format Response:', result);
          
          if (response.ok && result.success) {
            console.log('✅ Alternatif format ile başarılı');
            // SMS doğrulama gerekiyor
            if (result.message && result.message.includes('SMS')) {
              console.log('📱 SMS doğrulama gerekiyor');
              sessionStorage.setItem('verificationPhone', phoneDigits);
              setMessage({ text: result.message || 'SMS doğrulama gerekli', isError: false });
              
              setTimeout(() => {
                console.log('🚀 SMS verification sayfasına yönlendiriliyor...');
                navigate('/verify-sms');
              }, 1500);
              return;
            }
            success = true;
          }
        } catch (error) {
          console.log('❌ Alternatif format deneme hatası:', error);
        }
      }
      
      console.log('📤 FINAL LOGIN API RESPONSE:', result);
      
      if (success && response.ok && result.success) {
        // Expect backend to return: { success: true, accessToken: "...", refreshToken: "...", user: {...} }
        const { accessToken, refreshToken, user } = result;
        
        if (accessToken && refreshToken) {
          console.log('✅ Tokens received, storing securely...');
          
          // Use enhanced auth context login with tokens
          const loginSuccess = await login(accessToken, refreshToken, user || { telephone: phoneDigits });
          
          if (loginSuccess) {
            console.log('✅ Enhanced login successful - redirecting to dashboard');
            setMessage({ text: 'Giriş başarılı!', isError: false });
            
            // Redirect to dashboard
            setTimeout(() => {
              console.log('🚀 Dashboard\'a yönlendiriliyor...');
              navigate('/dashboard');
            }, 1500);
          } else {
            throw new Error('Token storage failed');
          }
        } else {
          // If no tokens, might be SMS verification required
          console.log('📱 SMS verification required');
          sessionStorage.setItem('verificationPhone', phoneDigits);
          setMessage({ text: result.message || 'SMS doğrulama gerekli', isError: false });
          
          setTimeout(() => {
            console.log('🚀 SMS verification sayfasına yönlendiriliyor...');
            navigate('/verify-sms');
          }, 1500);
        }
      } else {
        console.log('❌ Login başarısız:', result.message || result.error);
        setMessage({ text: result.message || result.error || 'Giriş başarısız', isError: true });
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

  return (
    <div className="modern-login-container">
      {/* Simplified Animated Background */}
      <div className="animated-background">
        <div className="floating-shapes">
          {/* Shapes removed for better mobile performance */}
        </div>
      </div>

      <div className="login-content">
        {/* Logo and Brand Section */}
        <div className="brand-section">
          <div className="logo-container">
            <div className="logo-icon">
              <Shield className="logo-shield" />
            </div>
            <h1 className="brand-title">BinCard</h1>
            <p className="brand-subtitle">Yönetici Paneli</p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="login-card">
          <div className="card-header">
            <div className="welcome-section">
              <h2 className="welcome-title">
                <User className="welcome-icon" />
                Hoş Geldiniz
              </h2>
              <p className="welcome-subtitle">
                Güvenli yönetici erişimi için giriş yapın
              </p>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} className="login-form">
              {/* Phone Number Field */}
              <div className="form-group">
                <label className="form-label">
                  <Phone className="label-icon" />
                  Telefon Numarası
                </label>
                
                <div className="phone-input-group">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={15}
                    value={formData.telephone}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                    placeholder="(5xx) xxx xx xx"
                    className={`form-input phone-input ${errors.telephone ? 'error' : ''}`}
                  />
                </div>

                {errors.telephone && (
                  <div className="error-message">
                    {errors.telephone}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">
                  <Lock className="label-icon" />
                  Şifre
                </label>
                
                <div className="password-input-group">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="6 haneli şifre"
                    maxLength={6}
                    className={`form-input password-input ${errors.password ? 'error' : ''}`}
                  />

                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="password-toggle"
                  >
                    {isPasswordVisible ? <EyeOff className="toggle-icon" /> : <Eye className="toggle-icon" />}
                  </button>
                </div>

                {errors.password && (
                  <div className="error-message">
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <span>Giriş yapılıyor...</span>
                  </div>
                ) : (
                  <>
                    <Shield className="button-icon" />
                    Giriş Yap
                  </>
                )}
              </button>

              {/* Message Display */}
              {message.text && (
                <div className={`message-container ${message.isError ? 'error' : 'success'}`}>
                  <div className="message-icon">
                    {message.isError ? '⚠️' : '✅'}
                  </div>
                  <p className="message-text">
                    {message.text}
                  </p>
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <div className="security-icon">
            <Shield className="shield-icon" />
          </div>
          <p className="security-text">
            SSL şifreleme ile korunan güvenli bağlantı
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
