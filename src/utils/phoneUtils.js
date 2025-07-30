// Country codes with flags
export const countryCodes = [
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' }
];

// Format phone number as 3-3-2-2 pattern
export const formatPhoneNumber = (value) => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limitedDigits = digits.slice(0, 10);
  
  // Apply 3-3-2-2 formatting
  let formatted = '';
  for (let i = 0; i < limitedDigits.length; i++) {
    if (i === 3 || i === 6 || i === 8) {
      formatted += ' ';
    }
    formatted += limitedDigits[i];
  }
  
  return formatted;
};

// Remove formatting from phone number
export const cleanPhoneNumber = (formattedNumber) => {
  return formattedNumber.replace(/\s/g, '');
};

// Validate phone number (should be exactly 10 digits)
export const validatePhoneNumber = (phoneNumber) => {
  const cleaned = cleanPhoneNumber(phoneNumber);
  return cleaned.length === 10 && /^\d{10}$/.test(cleaned);
};

// Validate password (should be exactly 6 characters)
export const validatePassword = (password) => {
  return password.length === 6;
};