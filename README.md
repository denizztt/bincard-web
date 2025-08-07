# BinCard Web - Yönetici Paneli / Admin Panel

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.6-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌍 Türkçe

BinCard Web, modern bir toplu taşıma yönetim sistemi için geliştirilmiş kapsamlı bir yönetici paneli uygulamasıdır. Bu platform, şehir içi ulaşım hizmetlerinin dijital yönetimini kolaylaştırmak için tasarlanmıştır.

### 🚀 Özellikler

- **📊 Dashboard**: Gerçek zamanlı sistem istatistikleri ve analitikler
- **👥 Kullanıcı Yönetimi**: Kapsamlı kullanıcı kayıt, düzenleme ve yönetim sistemi
- **🚌 Araç Takibi**: Otobüs filosunun anlık izlenmesi ve yönetimi
- **🛤️ Rota Yönetimi**: Güzergah planlama ve optimizasyonu
- **🚏 Durak Yönetimi**: Otobüs durağı lokasyonları ve bilgilendirme
- **👤 Sürücü Yönetimi**: Sürücü kaydı, lisans takibi ve performans analizi
- **💰 Ödeme Sistemi**: Dijital ödeme yöntemleri ve cüzdan yönetimi
- **📰 Haber Yönetimi**: Duyuru ve bilgilendirme sistemi
- **🔐 Güvenlik**: JWT tabanlı kimlik doğrulama ve yetkilendirme
- **📱 Responsive Tasarım**: Tüm cihazlarda uyumlu modern arayüz

### 🛠️ Teknoloji Yığını

- **Frontend**: React 19.1.0, React Router DOM 7.7.1
- **Build Tool**: Vite 7.0.6 (Hızlı geliştirme ve optimizasyon)
- **UI/UX**: Lucide React ikonları, CSS Custom Properties
- **HTTP Client**: Axios (API entegrasyonu için)
- **Kimlik Doğrulama**: JWT token yönetimi
- **Tema Sistemi**: Light/Dark mode desteği

### 📦 Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/denizztt/bincard-web.git

# Proje dizinine gidin
cd bincard-web

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Production build
npm run build
```

### ⚙️ Konfigürasyon

`.env` dosyası oluşturun:
```env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=BinCard Admin Panel
```

### 🏗️ Proje Yapısı

```
bincard-web/
├── src/
│   ├── components/         # Yeniden kullanılabilir bileşenler
│   │   ├── ProtectedRoute.jsx
│   │   └── ThemeToggle.jsx
│   ├── context/           # React Context API
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/             # Sayfa bileşenleri
│   │   ├── Dashboard.jsx
│   │   ├── UserManagement.jsx
│   │   ├── NewsManagement.jsx
│   │   └── ...
│   ├── services/          # API servisleri
│   │   ├── apiService.ts
│   │   └── authService.js
│   ├── styles/            # CSS stilleri
│   │   ├── common-components.css
│   │   └── ...
│   └── utils/             # Yardımcı fonksiyonlar
├── public/                # Statik dosyalar
└── README.md
```

---

## 🌍 English

BinCard Web is a comprehensive admin panel application developed for modern public transportation management systems. This platform is designed to facilitate digital management of urban transportation services.

### 🚀 Features

- **📊 Dashboard**: Real-time system statistics and analytics
- **👥 User Management**: Comprehensive user registration, editing, and management system
- **🚌 Vehicle Tracking**: Real-time monitoring and management of bus fleet
- **🛤️ Route Management**: Route planning and optimization
- **🚏 Stop Management**: Bus stop locations and information systems
- **👤 Driver Management**: Driver registration, license tracking, and performance analysis
- **💰 Payment System**: Digital payment methods and wallet management
- **📰 News Management**: Announcement and information system
- **🔐 Security**: JWT-based authentication and authorization
- **📱 Responsive Design**: Modern interface compatible with all devices

### 🛠️ Tech Stack

- **Frontend**: React 19.1.0, React Router DOM 7.7.1
- **Build Tool**: Vite 7.0.6 (Fast development and optimization)
- **UI/UX**: Lucide React icons, CSS Custom Properties
- **HTTP Client**: Axios (for API integration)
- **Authentication**: JWT token management
- **Theme System**: Light/Dark mode support

### 📦 Installation

```bash
# Clone the repository
git clone https://github.com/denizztt/bincard-web.git

# Navigate to project directory
cd bincard-web

# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```

### ⚙️ Configuration

Create `.env` file:
```env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=BinCard Admin Panel
```

### 🏗️ Project Structure

```
bincard-web/
├── src/
│   ├── components/         # Reusable components
│   │   ├── ProtectedRoute.jsx
│   │   └── ThemeToggle.jsx
│   ├── context/           # React Context API
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/             # Page components
│   │   ├── Dashboard.jsx
│   │   ├── UserManagement.jsx
│   │   ├── NewsManagement.jsx
│   │   └── ...
│   ├── services/          # API services
│   │   ├── apiService.ts
│   │   └── authService.js
│   ├── styles/            # CSS styles
│   │   ├── common-components.css
│   │   └── ...
│   └── utils/             # Utility functions
├── public/                # Static files
└── README.md
```

### 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🔗 Links

- **Demo**: [Live Demo](https://bincard-web.vercel.app)
- **API Documentation**: [Backend API Docs](https://api.bincard.com/docs)
- **Issues**: [GitHub Issues](https://github.com/denizztt/bincard-web/issues)

### 📞 Contact

- **Developer**: Deniz Tatar
- **Email**: deniz@bincard.com
- **GitHub**: [@denizztt](https://github.com/denizztt)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın! / If you like this project, don't forget to give it a star!
