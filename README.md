# 🚌 BinCard Web - Toplu Taşıma Yönetim Sistemi

Modern şehir içi toplu taşıma sistemlerinin dijital yönetimi için geliştirilmiş yönetici paneli uygulaması.

## 🌟 Özellikler

### 📊 Dashboard
- **İstatistik Kartları**: Kullanıcı, gelir, sistem durumu ve altyapı metrikleri
- **Kaydırmalı Kart Sistemi**: 6 istatistik kartı slider yapısı ile görüntüleme (her seferinde 3 kart)
- **Dinamik Hızlı İşlemler**: Kullanıcı özelleştirilebilir hızlı erişim menüsü
- **Grafikler**: Aylık gelir trendi ve kullanıcı aktivitesi grafikleri
- **Sistem Sağlığı**: Veritabanı, Redis, CPU, bellek ve disk kullanım takibi

### 🚍 Araç Yönetimi
- **Otobüs Listesi**: Tüm otobüslerin listelenmesi ve yönetimi
- **Harita Takibi**: Gerçek zamanlı konum takibi
- **Otobüs Ekleme/Düzenleme**: Detaylı otobüs bilgisi yönetimi

### 🗺️ Rota Yönetimi
- **Rota Oluşturma**: Harita ile interaktif rota planlama
- **Durak Yönetimi**: Rotalara durak ekleme ve çıkarma
- **Rota Listesi**: Tüm rotaların görüntülenmesi

### 📍 Durak Yönetimi
- **Durak Listesi**: Tüm durakların listelenmesi
- **Harita Entegrasyonu**: Google Maps ile durak konumları
- **Durak Ekleme/Düzenleme**: Detaylı durak bilgisi yönetimi

### 👤 Şoför Yönetimi
- **Şoför Listesi**: Tüm şoförlerin görüntülenmesi
- **Belge Takibi**: Şoför belgelerinin yönetimi
- **Şoför Ekleme/Düzenleme**: Detaylı şoför bilgisi yönetimi

### 💳 BusCard Yönetimi
- **Kart Yönetimi**: Kart okuma, bloklama ve aktifleştirme
- **Fiyatlandırma**: Kart fiyatlandırma yönetimi
- **Fiyatlandırma Listesi**: Tüm fiyatlandırmaların görüntülenmesi

### 💰 Ödeme Sistemi
- **Cüzdan Yönetimi**: Tüm cüzdanların listelenmesi
- **Cüzdan Durumu**: Cüzdan durumu güncelleme
- **Transfer İşlemleri**: Cüzdan transferleri takibi

### 🔐 Güvenlik
- **JWT Token**: Güvenli kimlik doğrulama
- **SMS Doğrulama**: İki faktörlü doğrulama
- **Rol Tabanlı Erişim**: Yetki yönetimi

### 📰 Haber Yönetimi
- **Haber Listesi**: Tüm haberlerin görüntülenmesi
- **Haber Ekleme/Düzenleme**: Detaylı haber yönetimi
- **Filtreleme**: Platform, tip ve durum bazlı filtreleme
- **Arama**: Başlık ve içerik bazlı arama

### 📈 Raporlama
- **Gelir Raporları**: Otobüs gelir raporları
- **İstatistikler**: Detaylı sistem istatistikleri
- **Analitik**: Kullanıcı ve sistem analitikleri
- **Denetim Kayıtları**: Sistem denetim logları

## 🛠️ Teknoloji Stack

### Frontend
- **React 19.1.0** - Modern UI framework
- **Vite 7.0.4** - Hızlı build tool ve dev server
- **TypeScript** - Tip güvenliği ve geliştirici deneyimi
- **React Router 7.7.1** - Client-side routing
- **Axios 1.11.0** - HTTP client ve API yönetimi
- **Lucide React** - Modern icon library

### Harita ve Konum
- **Google Maps JS API** - Harita entegrasyonu
- **@googlemaps/js-api-loader** - Google Maps yükleyici
- **@googlemaps/react-wrapper** - React wrapper

### Güvenlik ve Kimlik Doğrulama
- **JWT (JSON Web Tokens)** - Token tabanlı kimlik doğrulama
- **Crypto-js** - Şifreleme işlemleri
- **SMS Doğrulama** - İki faktörlü doğrulama

### Styling
- **CSS Modules** - Modüler stil yönetimi
- **CSS Variables** - Tema yönetimi
- **Responsive Design** - Mobil uyumlu tasarım

## 🚀 Kurulum

```bash
# Projeyi klonla
git clone https://github.com/denizztt/bincard-web.git
cd bincard-web

# Bağımlılıkları yükle
npm install

# Environment variables
cp .env.example .env
# .env dosyasını düzenle

# Uygulamayı başlat
npm run dev
```

### Environment Variables
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key
VITE_API_BASE_URL=http://localhost:8080
```

## 📁 Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   └── ProtectedRoute.jsx
├── pages/              # Sayfa bileşenleri
│   ├── Dashboard.jsx   # Ana dashboard
│   ├── NewsList.jsx    # Haber yönetimi
│   ├── StationList.jsx # Durak yönetimi
│   ├── BusList.jsx     # Otobüs yönetimi
│   ├── DriverList.jsx  # Şoför yönetimi
│   └── ...
├── services/           # API servisleri
│   ├── apiService.ts   # Ana API servisi
│   └── authService.js  # Kimlik doğrulama servisi
├── styles/             # CSS stilleri
│   ├── Dashboard.css
│   ├── NewsList.css
│   └── ...
├── context/            # React Context
│   ├── EnhancedAuthContext.jsx  # Kimlik doğrulama context
│   └── ThemeContext.jsx         # Tema context
├── utils/              # Yardımcı fonksiyonlar
│   └── tokenManager.js # Token yönetimi
└── types/              # TypeScript type tanımları
    └── index.ts
```

## 🎯 Kullanım

### Giriş ve Kimlik Doğrulama
1. Telefon numarası ile giriş yapın
2. SMS ile gönderilen doğrulama kodunu girin
3. JWT token otomatik olarak saklanır ve yenilenir

### Dashboard Kullanımı
- **İstatistik Kartları**: Sağ/sol ok tuşları ile kartlar arasında gezinin
- **Hızlı İşlemler**: "+" butonu ile yeni hızlı işlem ekleyin
- **Grafikler**: Aylık gelir ve kullanıcı aktivitesi grafiklerini görüntüleyin

### Haber Yönetimi
- **Haber Ekleme**: "Yeni Haber" butonu ile yeni haber oluşturun
- **Filtreleme**: Platform, tip ve durum bazlı filtreleme yapın
- **Arama**: Başlık veya içerik bazlı arama yapın
- **Düzenleme/Silme**: Her haber için düzenleme ve pasif yapma seçenekleri

### Sidebar Özellikleri
- **Daraltma**: Sidebar'ı daraltarak daha fazla alan kazanın
- **Arama**: Daraltılmış sidebar'da arama ikonuna tıklayarak sidebar'ı açın
- **Menü Arama**: Menü öğelerinde hızlı arama yapın

## 📦 Build & Deploy

### Development
```bash
npm run dev
```
Uygulama `http://localhost:5173` adresinde çalışacaktır.

### Production Build
```bash
npm run build
```
Build çıktısı `dist/` klasörüne oluşturulur.

### Preview
```bash
npm run preview
```
Production build'i yerel olarak test edin.

### Linting
```bash
npm run lint
```
Kod kalitesini kontrol edin.

## 🔧 Geliştirme Notları

### API Entegrasyonu
- Backend API: `http://localhost:8080/v1/api`
- Tüm API istekleri `apiService.ts` üzerinden yönetilir
- Token otomatik olarak request header'larına eklenir
- Token süresi dolduğunda otomatik yenilenir

### Hata Yönetimi
- Backend'den gelen business error'lar (200 OK ile dönen hatalar) yakalanır
- Kullanıcıya anlaşılır hata mesajları gösterilir
- Yetkisizlik hataları özel olarak handle edilir

### State Yönetimi
- React Hooks (useState, useEffect) kullanılır
- Context API ile global state yönetimi (Auth, Theme)
- URL parametreleri ile state senkronizasyonu

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Commit yapın
4. Pull Request açın

## 📄 Lisans

Bu proje özel lisans altındadır. Kullanım için yazılı izin gereklidir.
Detaylar için [LICENSE](LICENSE) dosyasını inceleyiniz.

**⚠️ UYARI**: Bu yazılım, geliştiricinin açık yazılı izni olmadan 
hiçbir şekilde kullanılamaz, kopyalanamaz veya dağıtılamaz.

## 📞 İletişim

- **Geliştirici**: Deniz Tatar
- **GitHub**: [@denizztt](https://github.com/denizztt)
