import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/EnhancedAuthContext';
import { ArrowLeft, MessageSquare, RefreshCw, Clock, Shield, Zap, Loader2, Sparkles } from 'lucide-react';
import '../styles/Login.css';

export default function SMSVerification() {
  const navigate = useNavigate();
  const { verifyPhone, resendVerificationCode, isAuthenticated } = useAuth();

  // Loading state for initial page load
  const [isPageLoading, setIsPageLoading] = useState(true);

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
  const [phone, setPhone] = useState(null);

  // Initialize phone number from sessionStorage safely
  useEffect(() => {
    const initializePhone = () => {
      try {
        const storedPhone = sessionStorage.getItem('verificationPhone');
        setPhone(storedPhone);
        setIsPageLoading(false);
        
        // Redirect to login if no phone number after a short delay
        if (!storedPhone) {
          setTimeout(() => {
            navigate('/login');
          }, 100);
        }
      } catch (error) {
        console.error('Error accessing sessionStorage:', error);
        setIsPageLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 100);
      }
    };

    initializePhone();
  }, [navigate]);

  // Navigation after successful verification
  useEffect(() => {
    if (verificationSuccess && isAuthenticated) {
      try {
        sessionStorage.removeItem('verificationPhone');
      } catch (error) {
        console.error('Error removing from sessionStorage:', error);
      }
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

    // Auto-verify when 6th digit is entered
    if (value && index === 5) {
      // Use the new code directly instead of state to avoid async state update issue
      const finalCode = [...newCode];
      setTimeout(() => {
        handleVerifyWithCode(finalCode.join(''));
      }, 200);
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle enter
    else if (e.key === 'Enter') {
      handleVerify();
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

  const handleVerifyWithCode = async (verificationCode) => {
    // Skip validation if code is already 6 digits (called from auto-verify)
    if (!verificationCode || verificationCode.length !== 6) {
      return;
    }

    if (!phone) {
      setError('Telefon numarası bulunamadı');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage({ text: '', isError: false });

    try {
      const result = await verifyPhone(phone, verificationCode);

      if (result.success) {
        setVerificationSuccess(true);
        setMessage({ text: 'Doğrulama başarılı! Dashboard açılıyor...', isError: false });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(result.error || 'Doğrulama kodu hatalı');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Doğrulama sırasında bir hata oluştu');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setError('6 haneli doğrulama kodunu giriniz');
      return;
    }

    await handleVerifyWithCode(verificationCode);
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
      console.error('Resend error:', error);
      setMessage({ text: 'Kod gönderilirken bir hata oluştu', isError: true });
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

  // Show loading screen while initializing
  if (isPageLoading) {
    return (
      <div className="modern-login-container">
        <div className="animated-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
        </div>
        <div className="login-content">
          <div className="login-card" style={{ textAlign: 'center' }}>
            <Loader2 className="logo-shield" style={{ 
              width: '48px', 
              height: '48px', 
              margin: '0 auto 1rem', 
              animation: 'spin 1s linear infinite' 
            }} />
            <p style={{ fontSize: '1.125rem', color: '#374151' }}>Sayfa yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no phone number
  if (!phone) {
    return (
      <div className="modern-login-container">
        <div className="animated-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
        </div>
        <div className="login-content">
          <div className="login-card" style={{ textAlign: 'center' }}>
            <Shield className="logo-shield" style={{ 
              width: '64px', 
              height: '64px', 
              color: '#dc2626', 
              margin: '0 auto 1rem' 
            }} />
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#374151', 
              marginBottom: '1rem' 
            }}>
              Hata
            </h2>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '1.5rem', 
              lineHeight: '1.6' 
            }}>
              Telefon numarası bulunamadı. Lütfen giriş sayfasından tekrar deneyin.
            </p>
            <button 
              onClick={() => navigate('/login')} 
              className="submit-button"
              style={{ backgroundColor: '#dc2626' }}
            >
              Giriş Sayfasına Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-login-container">
      {/* Animated Background - Same as Login */}
      <div className="animated-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <div className="login-content">
        {/* Logo and Brand Section */}
        <div className="brand-section">
          <div className="logo-container">
            <div className="logo-icon">
              <MessageSquare className="logo-shield" />
              <Sparkles className="logo-sparkles" />
            </div>
            <h1 className="brand-title">Doğrulama</h1>
            <p className="brand-subtitle">SMS Kodu</p>
          </div>
        </div>

        {/* SMS Verification Card */}
        <div className="login-card">
          <div className="card-header">
            <div className="welcome-section">
              <h2 className="welcome-title">
                <Shield className="welcome-icon" />
                Telefon Doğrulama
              </h2>
              <div className="welcome-subtitle" style={{ lineHeight: '1.6' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Shield style={{ width: '16px', height: '16px', color: '#9333ea' }} />
                  <span style={{ fontWeight: '600', color: '#9333ea' }}>
                    {formatPhoneDisplay(phone)}
                  </span>
                </div>
                <span style={{ opacity: '0.8' }}>
                  numaralı telefona gönderilen 6 haneli doğrulama kodunu giriniz.
                </span>
              </div>
            </div>
          </div>

          <div className="card-body">
            <form className="login-form">
              {/* Code Input */}
              <div className="form-group">
                <label className="form-label">
                  <MessageSquare className="label-icon" />
                  Doğrulama Kodu
                </label>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '1rem' }}>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="form-input"
                      style={{ 
                        width: '56px', 
                        height: '64px', 
                        textAlign: 'center', 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold',
                        borderRadius: '12px'
                      }}
                      autoComplete="off"
                    />
                  ))}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    {error}
                  </div>
                )}

                {/* Success/Info Message */}
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
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={handleVerify}
                disabled={isLoading || code.join('').length !== 6}
                className="submit-button"
              >
                {isLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <span>Doğrulanıyor...</span>
                  </div>
                ) : (
                  <>
                    <Shield className="button-icon" />
                    Doğrula
                  </>
                )}
              </button>

              {/* Divider */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '1.5rem 0',
                opacity: '0.6'
              }}>
                <div style={{ height: '1px', flex: '1', backgroundColor: '#d1d5db', maxWidth: '120px' }}></div>
                <span style={{ padding: '0 1rem', fontSize: '0.875rem', color: '#6b7280' }}>veya</span>
                <div style={{ height: '1px', flex: '1', backgroundColor: '#d1d5db', maxWidth: '120px' }}></div>
              </div>

              {/* Resend Button */}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResendDisabled}
                className="back-button"
                style={{ 
                  width: '100%', 
                  backgroundColor: '#f9fafb',
                  border: '2px solid #e5e7eb',
                  color: '#374151',
                  marginBottom: '1rem'
                }}
              >
                <RefreshCw className={`back-icon ${isResendDisabled ? 'animate-spin' : ''}`} />
                {isResendDisabled ? 'Kod Gönderildi' : 'Yeniden Kod Gönder'}
              </button>

              {/* Countdown */}
              {countdown > 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#6b7280', 
                  opacity: '0.8', 
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '1rem'
                }}>
                  <Clock style={{ width: '16px', height: '16px' }} />
                  <span>
                    Yeni kod isteyebilmeniz için{" "}
                    <span style={{ fontWeight: 'bold', color: '#9333ea' }}>
                      {formatCountdown(countdown)}
                    </span>{" "}
                    beklemeniz gerekiyor
                  </span>
                </div>
              )}
            </form>
          </div>

          {/* Card Footer */}
          <div className="card-footer" style={{ paddingTop: '3rem' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="back-button"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                color: '#6b7280',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                minHeight: '44px'
              }}
            >
              <ArrowLeft className="back-icon" style={{ width: '16px', height: '16px' }} />
              Giriş Sayfasına Dön
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <div className="security-icon">
            <Shield className="shield-icon" />
          </div>
          <p className="security-text">
            🔒 Güvenli doğrulama sistemi
          </p>
        </div>
      </div>
    </div>
  );
}
