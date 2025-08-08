# BinCard Web - Yönetici Paneli / Admin Panel

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.6-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌍 Türkçe

BinCard Web, modern bir toplu taşıma yönetim sistemi için geliştirilmiş kapsamlı bir yönetici paneli uygulamasıdır. Bu platform, şehir içi ulaşım hizmetlerinin dijital yönetimini kolaylaştırmak için tasarlanmıştır.

### 🚀 Özellikler

- **📊 Dashboard**: Gerçek zamanlı sistem istatistikleri ve analitikler
- **👥 Kullanıcı Yönetimi**: Kapsamlı kullanıcı kayıt, düzenleme ve yönetim sistemi
# BinCard Web - Yönetici Paneli / Admin Panel (Admin Panel)
- **🛤️ Rota Yönetimi**: Güzergah planlama ve optimizasyonu
# **BinCard Web**, modern toplu taşıma yönetim sistemi için geliştirilmiş kapsamlı bir **Yönetici Paneli** uygulamasıdır. Şehir içi ulaşım hizmetlerinin dijital yönetimini kolaylaştırır.
- **👤 Sürücü Yönetimi**: Sürücü kaydı, lisans takibi ve performans analizi
 - � **Dashboard**
	 - İstatistikler: kullanıcı, şoför, otobüs, durak sayıları
	 - Son aktiviteler: kullanıcı kayıt, şoför işlemleri, rota güncellemeleri
	 - Sistem durumu ve sağlık kontrolleri
 - 👥 **Kullanıcı Yönetimi**
	 - Yeni kullanıcı ekleme, düzenleme, silme
	 - Rol ve yetki tanımlama
 - 🚌 **Otobüs & Araç Takibi**
	 - Anlık konum takibi (BusMap)
	 - Harita üzerinde rota çizimi
 - 🚏 **Durak Yönetimi (StationMap)**
	 - Durak ekleme, düzenleme, silme
	 - Google Maps entegrasyonu ile konum gösterimi
 - 🛤️ **Rota Yönetimi**
	 - Yeni rota ekleme ve listeleme
	 - Rota detayları ve güzergah optimizasyonu
 - 👤 **Şoför Yönetimi**
	 - Şoför ekleme, düzenleme, silme
	 - Lisans belgeleri ve cezaların takibi
	 - Performans analizi ve istatistikler
 - 💰 **Ödeme Noktaları & Cüzdan İşlemleri**
	 - Ödeme noktası ekleme, düzenleme, detay görüntüleme
	 - Cüzdan durumu güncelleme ve transfer işlemleri
 - � **Kimlik Doğrulama**
	 - Kayıt, Giriş, SMS doğrulama (2FA)
 - 📝 **Haber Yönetimi**
	 - Duyuru ekleme, düzenleme, silme
 - 📊 **Analitik & Raporlar**
	 - Grafikler ve raporlar (kullanım, gelir, performans)
 - ⚙️ **Uygulama Ayarları**
	 - Tema (Light/Dark) desteği
	 - Sistem ayarları ve konfigürasyon
- **HTTP Client**: Axios (API entegrasyonu için)
 - **Frontend**
	 - React 19.1.0
	 - React Router DOM 7.7.1
	 - Vite 7.0.6
	 - Axios, JWT token yönetimi
 - **Haritalama**
	 - @googlemaps/react-wrapper
	 - @googlemaps/js-api-loader
 - **Stil & UI**
	 - CSS Custom Properties / Modules
	 - Lucide React ikon seti
 - **Araçlar**
	 - Node.js, npm
	 - PowerShell (Windows geliştirici ortamı)
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

`.env` dosyası oluşturun veya güncelleyin:
```env
# Google Maps API anahtarı
VITE_GOOGLE_MAPS_API_KEY=AIzaSyALXqOX99y2ojPxVTfLmN9kPKiUrjOx6dc

# Backend API URL
VITE_API_BASE_URL=http://localhost:8080

# Ortam (development / production)
VITE_ENVIRONMENT=development
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
```


 ### 🚀 Features
 - 📊 **Dashboard**
	 - Statistics: user, driver, bus, station counts
	 - Recent activities: user registration, driver actions, route updates
	 - System health checks
 - 👥 **User Management**
	 - Create, edit, delete users
	 - Role and permission settings
 - 🚌 **Bus & Vehicle Tracking**
	 - Real-time location tracking (BusMap)
	 - Route drawing on maps
 - 🚏 **Stop Management (StationMap)**
	 - Add, edit, delete stops
	 - Google Maps integration for location display
 - 🛤️ **Route Management**
	 - Add and list routes
	 - Route details and optimization
 - 👤 **Driver Management**
	 - Add, edit, delete drivers
	 - License documents and penalty tracking
	 - Performance analytics and statistics
 - 💰 **Payment Points & Wallet**
	 - Manage payment points (add/edit/view)
	 - Update wallet status and transfers
 - 🔐 **Authentication**
	 - Registration, login, SMS verification (2FA)
 - 📰 **News & Announcements**
	 - Create, edit, delete announcements
 - 📈 **Analytics & Reports**
	 - Charts and reports (usage, revenue, performance)
 - ⚙️ **Settings**
	 - Theme (Light/Dark) support
	 - System configuration
 - 📱 **Responsive Design**
	 - Mobile, tablet, and desktop compatibility
- **� Stop Management**: Bus stop locations and information systems
 - **Frontend**
	 - React 19.1.0, Vite 7.0.6
	 - React Router DOM 7.7.1
	 - Axios, JWT token management
 - **Mapping**
	 - @googlemaps/react-wrapper
	 - @googlemaps/js-api-loader
 - **Styling & UI**
	 - CSS Custom Properties / Modules
	 - Lucide React icon set
 - **Tools**
	 - Node.js, npm
	 - PowerShell (Windows development)
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

 Create or update `.env` file:
 ```env
# Google Maps API key
VITE_GOOGLE_MAPS_API_KEY=AIzaSyALXqOX99y2ojPxVTfLmN9kPKiUrjOx6dc

# Backend API URL
VITE_API_BASE_URL=http://localhost:8080

# Environment (development / production)
VITE_ENVIRONMENT=development
```

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
 1. Fork the repository
 2. Create a feature branch (`git checkout -b feature/YourFeature`)
 3. Commit your changes (`git commit -m 'Add YourFeature'`)
 4. Push to your branch (`git push origin feature/YourFeature`)
 5. Open a Pull Request
│   │   └── authService.js
 This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
│   │   ├── common-components.css
 - **Demo**: [Live Demo](https://bincard-web.vercel.app)
 - **API Docs**: https://api.bincard.com/docs
 - **Issues**: https://github.com/denizztt/bincard-web/issues
└── README.md
 - **Geliştirici / Developer**: Deniz Tatar
 - **E-posta / Email**: deniz@bincard.com
 - **GitHub**: https://github.com/denizztt

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
