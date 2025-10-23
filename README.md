# 🚌 BinCard Web - Toplu Taşıma Yönetim Sistemi

Modern şehir içi toplu taşıma sistemlerinin dijital yönetimi için geliştirilmiş yönetici paneli uygulaması.

## 🌟 Özellikler

- **Dashboard**: Sistem istatistikleri ve analitik
- **Araç Yönetimi**: Otobüs listesi ve harita takibi
- **Rota Yönetimi**: Rota oluşturma ve durak yönetimi
- **Durak Yönetimi**: Durak listesi ve harita entegrasyonu
- **Şoför Yönetimi**: Şoför kayıt ve belge takibi
- **BusCard Yönetimi**: Kart okuma, bloklama ve fiyatlandırma
- **Ödeme Sistemi**: Cüzdan yönetimi ve transfer işlemleri
- **Güvenlik**: JWT token ve SMS doğrulama
- **Haber Yönetimi**: Duyuru ve haber sistemi
- **Raporlama**: İstatistik ve analitik raporlar

## 🛠️ Teknoloji Stack

- **React 19.1.0** - Frontend framework
- **Vite 7.0.4** - Build tool
- **TypeScript** - Tip güvenliği
- **Axios** - HTTP client
- **Google Maps** - Harita entegrasyonu
- **JWT** - Kimlik doğrulama
- **CSS Modules** - Styling

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
├── components/     # Yeniden kullanılabilir bileşenler
├── pages/         # Sayfa bileşenleri
├── services/      # API servisleri
├── styles/        # CSS stilleri
├── context/       # React Context
└── utils/         # Yardımcı fonksiyonlar
```

## 🎯 Kullanım

- **BusCard Yönetimi**: Kart okuma, bloklama ve fiyatlandırma
- **Rota Oluşturma**: Harita ile rota planlama
- **Otobüs Takibi**: Gerçek zamanlı konum takibi
- **Durak Yönetimi**: Durak ekleme ve düzenleme

## 📦 Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build

# Preview
npm run preview
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Commit yapın
4. Pull Request açın

## 📄 Lisans

MIT License

## 📞 İletişim

- **Geliştirici**: Deniz Tatar
- **GitHub**: [@denizztt](https://github.com/denizztt)
