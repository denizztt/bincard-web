import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/EnhancedAuthContext';
import '../styles/SMSVerification.css';

const SMSVerification = () => {
  const navigate = useNavigate();
  const { verifyPhone, resendVerificationCode, isAuthenticated } = useAuth();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  // Resend functionality
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countdownTimer, setCountdownTimer] = useState(null);
  
  const inputRefs = useRef([]);
  const phone = sessionStorage.getItem('verificationPhone');

  // Redirect to login if no phone number
  useEffect(() => {
    if (!phone) {
      navigate('/login');
    }
  }, [phone, navigate]);

  // Navigation after successful verification
  useEffect(() => {
    if (verificationSuccess && isAuthenticated) {
      sessionStorage.removeItem('verificationPhone');
      navigate('/dashboard');
    }
  }, [isAuthenticated, verificationSuccess, navigate]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    };
  }, [countdownTimer]);

  const handleInputChange = (index, value) => {
    // Only allow numeric input
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');
    setMessage({ text: '', isError: false });

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle Enter key - only verify if 6 digits are entered
    else if (e.key === 'Enter') {
      const verificationCode = code.join('');
      if (verificationCode.length === 6) {
        handleVerify();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length > 0) {
      const newCode = [...code];
      for (let i = 0; i < 6; i++) {
        newCode[i] = digits[i] || '';
      }
      setCode(newCode);
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    console.log('📱 SMS VERIFICATION BAŞLADI');
    const verificationCode = code.join('');
    console.log('🔢 Girilen kod:', verificationCode);
    console.log('📞 Doğrulanacak telefon:', phone);
    
    if (verificationCode.length !== 6) {
      console.log('❌ Kod uzunluğu hatalı:', verificationCode.length);
      setError('6 haneli doğrulama kodunu giriniz');
      return;
    }

    console.log('✅ Kod uzunluğu doğru - API çağrısı yapılıyor');
    setIsLoading(true);
    setError('');
    setMessage({ text: '', isError: false });

    try {
      const result = await verifyPhone(phone, verificationCode);
      console.log('📤 VERIFICATION SONUCU:', result);
      
      if (result.success) {
        console.log('✅ Verification başarılı - Dashboard\'a yönlendiriliyor');
        setVerificationSuccess(true);
        setMessage({ text: 'Doğrulama başarılı! Dashboard açılıyor...', isError: false });
        // useEffect will handle the navigation when isAuthenticated becomes true
      } else {
        console.log('❌ Verification başarısız:', result.error);
        setError(result.error || 'Doğrulama kodu hatalı');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('❌ VERIFICATION CATCH ERROR:', error);
      console.error('🔍 Detailed Error Info:', {
        message: error.message,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      
      // More specific error messages
      let errorMessage = 'Doğrulama sırasında bir hata oluştu';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Geçersiz doğrulama kodu';
      } else if (error.response?.status === 404) {
        errorMessage = 'Telefon numarası bulunamadı';
      } else if (error.response?.status === 429) {
        errorMessage = 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.';
      } else if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
        errorMessage = 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
      }
      
      setError(errorMessage);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (isResendDisabled || !phone) {
      return;
    }

    setIsResendDisabled(true);
    setMessage({ text: 'Doğrulama kodu gönderiliyor...', isError: false });

    try {
      const result = await resendVerificationCode(phone);
      
      if (result.success) {
        setMessage({ text: result.message || 'Doğrulama kodu tekrar gönderildi', isError: false });
        startCountdown(180); // 3 minutes countdown
      } else {
        setMessage({ text: result.error || 'Kod gönderilemedi', isError: true });
        setIsResendDisabled(false);
      }
    } catch (error) {
      console.error('❌ RESEND ERROR:', error);
      console.error('🔍 Resend Error Details:', {
        message: error.message,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      
      // More specific error messages for resend
      let errorMessage = 'Kod gönderilirken bir hata oluştu';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 429) {
        errorMessage = 'Çok fazla kod talebinde bulundunuz. Lütfen daha sonra tekrar deneyin.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Telefon numarası bulunamadı';
      } else if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
        errorMessage = 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
      }
      
      setMessage({ text: errorMessage, isError: true });
      setIsResendDisabled(false);
    }
  };

  const startCountdown = (seconds) => {
    setCountdown(seconds);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setCountdownTimer(timer);
  };

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPhoneDisplay = (phoneNumber) => {
    if (!phoneNumber) return '';
    // Format as (5xx) xxx xx xx
    if (phoneNumber.length === 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 8)} ${phoneNumber.slice(8, 10)}`;
    }
    return phoneNumber;
  };

  return (
    <div className="sms-verification-container">
      <div className="sms-verification-card">
        <div className="sms-header">
          <div className="sms-icon">📱</div>
          <h1 className="sms-title">Telefon Doğrulama</h1>
          <p className="sms-subtitle">
            <strong>{formatPhoneDisplay(phone)}</strong> numaralı telefona gönderilen 6 haneli doğrulama kodunu giriniz.
          </p>
        </div>

        <div className="sms-form">
          <div className="code-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="code-input"
                autoComplete="off"
              />
            ))}
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {message.text && (
            <div className={`message ${message.isError ? 'error' : 'success'}`}>
              <span className="message-icon">
                {message.isError ? '❌' : '✅'}
              </span>
              {message.text}
            </div>
          )}

          <button
            type="button"
            onClick={handleVerify}
            disabled={isLoading || code.join('').length !== 6}
            className={`verify-button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Doğrulanıyor...
              </>
            ) : (
              'Doğrula'
            )}
          </button>

          <div className="resend-section">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResendDisabled}
              className={`resend-button ${isResendDisabled ? 'disabled' : ''}`}
            >
              {isResendDisabled ? 'Kod Gönderildi' : 'Yeniden Kod Gönder'}
            </button>
            
            {countdown > 0 && (
              <p className="countdown-text">
                Yeni kod isteyebilmeniz için {formatCountdown(countdown)} beklemeniz gerekiyor
              </p>
            )}
          </div>
        </div>

        <div className="sms-footer">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="back-button"
          >
            ← Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default SMSVerification;