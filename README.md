# 🚌 BinCard Web - Toplu Taşıma Yönetim Sistemi

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.4-646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📖 Türkçe Açıklama

BinCard Web, modern şehir içi toplu taşıma sistemlerinin dijital yönetimi için geliştirilmiş kapsamlı bir yönetici paneli uygulamasıdır. Bu platform, otobüs, metro, tramvay gibi toplu taşıma araçlarının, rotaların, durakların ve personelin yönetimini kolaylaştırmak için tasarlanmıştır.

## 🌟 Özellikler

### 📊 **Dashboard & Analitik**
- Gerçek zamanlı sistem istatistikleri
- Kullanıcı, şoför, otobüs, durak sayıları
- Sistem sağlık kontrolleri ve performans metrikleri
- Son aktiviteler ve güncellemeler

### 🚌 **Araç Yönetimi**
- **Otobüs Listesi**: Araç ekleme, düzenleme, silme
- **Otobüs Haritası**: Gerçek zamanlı konum takibi
- Araç durumu (aktif/pasif/bakım)
- Şoför atama ve rota takibi

### 🛤️ **Rota Yönetimi**
- **Rota Oluşturma**: 4 adımlı süreç (Bilgiler → Durak Seçimi → Tarife → Güzergah)
- **Harita Entegrasyonu**: Google Maps ile görsel rota planlama
- **Durak Yönetimi**: Rotalara durak ekleme/çıkarma
- **Rota Detayları**: Güzergah bilgileri ve optimizasyon

### 🚏 **Durak Yönetimi**
- **Durak Listesi**: CRUD işlemleri
- **Durak Haritası**: Google Maps entegrasyonu
- **Durak Detayları**: Konum, adres, özellikler
- **Durak Formu**: Kolay ekleme ve düzenleme

### 👤 **Şoför Yönetimi**
- **Şoför Listesi**: Kayıt, düzenleme, silme
- **Şoför Ekleme**: Detaylı bilgi formu
- **Belge Takibi**: Lisans, ehliyet, sağlık raporu
- **Performans Analizi**: İstatistikler ve raporlar

### 💰 **Ödeme & Cüzdan Sistemi**
- **Ödeme Noktaları**: CRUD işlemleri ve detay görüntüleme
- **Cüzdan Durumu**: Güncelleme ve takip
- **Transfer İşlemleri**: Cüzdanlar arası transfer
- **Tüm Cüzdanlar**: Genel cüzdan yönetimi

### 🔐 **Kimlik Doğrulama & Güvenlik**
- **Kullanıcı Kaydı**: Form validasyonu
- **Giriş Sistemi**: JWT token yönetimi
- **SMS Doğrulama**: 2FA güvenlik
- **Korumalı Rotalar**: Yetki kontrolü

### 📰 **Haber & Duyuru Yönetimi**
- **Haber Listesi**: CRUD işlemleri
- **Haber Ekleme**: Zengin metin editörü
- **Haber Düzenleme**: Güncelleme ve yayınlama
- **Duyuru Sistemi**: Kullanıcı bildirimleri

### 📈 **Raporlama & Analitik**
- **İstatistikler**: Detaylı metrikler
- **Analitik**: Grafik ve tablolar
- **Denetim Kayıtları**: Sistem logları
- **Uyumluluk Kontrolü**: Standart kontrol listeleri

### ⚙️ **Sistem & Konfigürasyon**
- **Sistem Sağlığı**: Monitör ve alarmlar
- **Admin Onayları**: Kullanıcı işlem onayları
- **Kimlik Talepleri**: Doğrulama süreçleri
- **Sözleşme Yönetimi**: Kullanıcı sözleşmeleri

## 🛠️ Teknoloji Stack

### **Frontend Framework**
- **React 19.1.0** - Modern React hooks ve functional components
- **React Router DOM 7.7.1** - Client-side routing
- **Vite 7.0.4** - Hızlı build tool ve development server

### **Haritalama & Konum**
- **@googlemaps/react-wrapper** - React için Google Maps wrapper
- **@googlemaps/js-api-loader** - Google Maps API yükleyici
- **Gerçek zamanlı konum takibi** - Otobüs ve durak konumları

### **HTTP & API**
- **Axios 1.11.0** - HTTP client ve API entegrasyonu
- **JWT Token** - Güvenli kimlik doğrulama
- **Interceptors** - Request/response işleme

### **UI & Styling**
- **Lucide React 0.533.0** - Modern ikon seti
- **CSS Custom Properties** - Tema sistemi (Light/Dark)
- **Responsive Design** - Mobil uyumlu tasarım
- **CSS Modules** - Component-based styling

### **Güvenlik & Şifreleme**
- **Crypto-js 4.2.0** - Veri şifreleme
- **Protected Routes** - Yetki kontrolü
- **Session Management** - Oturum yönetimi

### **Development Tools**
- **ESLint 9.30.1** - Kod kalitesi
- **TypeScript** - Tip güvenliği
- **Hot Reload** - Geliştirme deneyimi

## 🚀 Kurulum

### **Gereksinimler**
- Node.js 18+ 
- npm veya yarn
- Google Maps API anahtarı

### **Adım 1: Projeyi Klonlayın**
```bash
git clone https://github.com/denizztt/bincard-web.git
cd bincard-web
```

### **Adım 2: Bağımlılıkları Yükleyin**
```bash
npm install
```

### **Adım 3: Environment Variables**
`.env` dosyası oluşturun:
```env
# Google Maps API anahtarı
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Backend API URL
VITE_API_BASE_URL=http://localhost:8080

# Ortam
VITE_ENVIRONMENT=development
```

### **Adım 4: Uygulamayı Başlatın**
```bash
# Development server
npm run dev

# Production build
npm run build

# Build preview
npm run preview
```

## 🏗️ Proje Yapısı

```
bincard-web/
├── 📁 src/
│   ├── 🎨 assets/              # Resimler ve statik dosyalar
│   ├── 🧩 components/          # Yeniden kullanılabilir bileşenler
│   │   ├── GoogleMapWrapper.jsx    # Google Maps entegrasyonu
│   │   ├── ProtectedRoute.jsx      # Yetki kontrolü
│   │   └── ThemeToggle.jsx         # Tema değiştirici
│   ├── ⚙️ config/              # Konfigürasyon dosyaları
│   │   ├── config.js               # Genel ayarlar
│   │   └── googleMaps.js          # Google Maps ayarları
│   ├── 🔧 constants/            # Sabit değerler
│   │   ├── busTypes.js             # Otobüs türleri
│   │   ├── driverTypes.js          # Şoför türleri
│   │   ├── routeTypes.js           # Rota türleri
│   │   └── stationTypes.js         # Durak türleri
│   ├── 🔄 context/               # React Context API
│   │   ├── AuthContext.jsx         # Kimlik doğrulama
│   │   ├── EnhancedAuthContext.jsx # Gelişmiş auth
│   │   └── ThemeContext.jsx        # Tema yönetimi
│   ├── 📄 main.jsx               # Uygulama giriş noktası
│   ├── 📱 pages/                 # Sayfa bileşenleri
│   │   ├── 🏠 Dashboard.jsx          # Ana sayfa
│   │   ├── 🚌 BusList.jsx            # Otobüs listesi
│   │   ├── 🗺️ BusMap.jsx             # Otobüs haritası
│   │   ├── 👤 DriverList.jsx         # Şoför listesi
│   │   ├── 🛤️ RouteAdd.jsx           # Rota ekleme
│   │   ├── 🚏 StationList.jsx        # Durak listesi
│   │   ├── 💰 PaymentPointList.jsx   # Ödeme noktaları
│   │   └── ...                     # Diğer sayfalar
│   ├── 🔌 services/              # API servisleri
│   │   ├── apiService.ts            # Ana API servisi
│   │   └── authService.js           # Kimlik doğrulama
│   ├── 🎨 styles/                 # CSS stilleri
│   │   ├── index.css                # Global stiller
│   │   ├── App.css                  # Ana uygulama stilleri
│   │   └── ...                     # Sayfa stilleri
│   ├── 📝 types/                  # TypeScript tip tanımları
│   │   └── index.ts                 # Ana tip tanımları
│   └── 🛠️ utils/                  # Yardımcı fonksiyonlar
│       ├── phoneUtils.js            # Telefon yardımcıları
│       └── tokenManager.js          # Token yönetimi
├── 📁 public/                     # Statik dosyalar
├── 📄 package.json                # Proje bağımlılıkları
├── ⚙️ vite.config.js             # Vite konfigürasyonu
└── 📖 README.md                   # Bu dosya
```

## 🎯 Kullanım Örnekleri

### **Rota Oluşturma (Harita ile)**
1. **Adım 1**: Rota bilgilerini girin (ad, kod, tür, renk)
2. **Adım 2**: Haritayı açın ve durakları tıklayarak seçin
3. **Adım 3**: Tarife saatlerini belirleyin
4. **Adım 4**: Güzergah detaylarını planlayın

### **Otobüs Takibi**
- Gerçek zamanlı konum görüntüleme
- Rota üzerinde ilerleme takibi
- Şoför bilgileri ve iletişim

### **Durak Yönetimi**
- Google Maps ile konum belirleme
- Durak özellikleri ve bilgileri
- Rota bağlantıları

## 🔧 Konfigürasyon

### **Google Maps API**
```javascript
// src/config/googleMaps.js
export const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.VITE_GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places', 'geometry', 'drawing'],
  language: 'tr',
  region: 'TR'
};
```

### **API Servisleri**
```typescript
// src/services/apiService.ts
export const routeApi = {
  createBidirectionalRoute: async (data) => { /* ... */ },
  getRouteStations: async (routeId) => { /* ... */ },
  addStationToRoute: async (routeId, stationId) => { /* ... */ }
};
```

## 📱 Responsive Tasarım

- **Desktop**: Tam özellikli arayüz
- **Tablet**: Optimize edilmiş layout
- **Mobile**: Touch-friendly tasarım
- **Breakpoints**: 768px, 1024px, 1440px

## 🌙 Tema Sistemi

- **Light Theme**: Varsayılan açık tema
- **Dark Theme**: Göz yormayan koyu tema
- **CSS Variables**: Dinamik renk değişimi
- **Theme Toggle**: Kolay tema değiştirme

## 🚀 Performance Özellikleri

- **Code Splitting**: Lazy loading
- **Bundle Optimization**: Vite ile hızlı build
- **Image Optimization**: Responsive images
- **Caching**: API response caching

## 🧪 Testing

```bash
# Lint kontrolü
npm run lint

# Type checking
npm run type-check

# Build test
npm run build
```

## 📦 Build & Deployment

```bash
# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Deploy to Vercel/Netlify
npm run build
# dist/ klasörünü deploy edin
```

## 🤝 Katkıda Bulunma

1. **Fork** yapın
2. **Feature branch** oluşturun (`git checkout -b feature/AmazingFeature`)
3. **Commit** yapın (`git commit -m 'Add AmazingFeature'`)
4. **Push** yapın (`git push origin feature/AmazingFeature`)
5. **Pull Request** açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- **👨‍💻 Geliştirici**: Deniz Tatar
- **📧 E-posta**: deniz@bincard.com
- **🐙 GitHub**: [@denizztt](https://github.com/denizztt)
- **🌐 Demo**: [Live Demo](https://bincard-web.vercel.app)

## 🙏 Teşekkürler

- **React Team** - Harika framework için
- **Vite Team** - Hızlı build tool için
- **Google Maps** - Harita servisleri için
- **Lucide** - Güzel ikonlar için

---

⭐ **Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!** / **Don't forget to star this project if you like it!**

---

*Son güncelleme: Aralık 2024*
