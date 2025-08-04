import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/EnhancedAuthContext';
import { Eye, EyeOff, Phone, Lock, ArrowLeft } from 'lucide-react';
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

  const countryCodes = ['TR +90', 'US +1', 'DE +49', 'FR +33', 'GB +44'];

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Format phone number as user types (Turkish format)
  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 10) return formData.telephone;
    
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
      
      // Call API directly for login with token response expected
      const loginPayload = {
        telephone: phoneDigits,
        password: formData.password
      };
      
      console.log('🚀 API login call yapılıyor...', loginPayload);
      
      // Direct API call to get tokens (backend should return accessToken and refreshToken)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/v1/api/auth/superadmin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload)
      });
      
      const result = await response.json();
      console.log('📤 LOGIN API RESPONSE:', result);
      
      if (response.ok && result.success) {
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
      <div className="w-full max-w-md relative z-10">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Merhaba 👋
          </h1>
          <p className="text-lg text-gray-600">
            Yönetici paneline güvenli erişim
          </p>
        </div>

        {/* Login Card */}
        <div className="modern-login-card">
          <div className="text-center pb-8 pt-8">
            <h2 className="text-3xl font-bold mb-2">
              Superadmin Girişi
            </h2>
            <p className="text-gray-600">
              Yönetici paneline güvenli erişim
            </p>
          </div>

          <div className="space-y-8 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Phone Number Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Telefon (Kullanıcı Adı)
                </label>

                <div className="flex gap-4">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => handleInputChange('countryCode', e.target.value)}
                    className="w-32 px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {countryCodes.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={formData.telephone}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                    placeholder="(5xx) xxx xx xx"
                    className="flex-1 px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {errors.telephone && (
                  <p className="text-red-500 text-sm">
                    {errors.telephone}
                  </p>
                )}
              </div>

              {/* Password Section */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  <Lock className="inline w-4 h-4 mr-2" />
                  Şifre
                </label>

                <div className="relative">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="6 haneli şifre giriniz"
                    maxLength={6}
                    className="w-full px-3 py-3 pr-14 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 p-0 text-gray-500 hover:text-gray-700"
                  >
                    {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-base transition-all duration-300 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>

              {/* Message Display */}
              {message.text && (
                <div className={`p-4 rounded-xl ${message.isError ? 'bg-red-100 border border-red-400' : 'bg-green-100 border border-green-400'}`}>
                  <p className={`font-semibold text-base ${message.isError ? 'text-red-700' : 'text-green-700'}`}>
                    {message.text}
                  </p>
                </div>
              )}

              {/* Back Button */}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full text-gray-600 hover:text-gray-800 font-semibold border border-gray-300 rounded-xl py-3 text-base flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Ana Menü
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;