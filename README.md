# YOLO Grid Demo 👁️

> **"Göz Açıp Kapayıncaya Kadar: YOLO'nun Hikayesi"** blog yazısına eşlik eden interaktif öğrenim aracı

YOLO (You Only Look Once) algoritmasının grid mantığını ve nesne tespit sürecini webcam ile gerçek zamanlı olarak öğreten interaktif web uygulaması.

## 🎯 Amaç

Bu proje, YOLO algoritmasının temel çalışma prensiplerini görsel ve interaktif bir şekilde öğretmeyi hedefler:

- **Grid Sistemi**: YOLO'nun görüntüyü nasıl ızgaralara böldüğünü gösterir
- **Gerçek Zamanlı Tespit**: Webcam ile canlı nesne tespiti yapar
- **Eğitici Yaklaşım**: Karmaşık kavramları basit görseller ile açıklar
- **Blog Entegrasyonu**: [Blog yazısı](https://www.muratsag.com/blog/40cad16b-fd88-4266-9671-f9b51eec6e9a) ile uyumlu içerik

## 🚀 Özellikler

### ✨ Temel Özellikler
- 📹 **Webcam Entegrasyonu**: Gerçek zamanlı görüntü işleme
- 🎯 **Grid Görselleştirme**: 7x7, 13x13, 19x19 grid seçenekleri
- 🧠 **YOLO Simülasyonu**: Algoritmanın grid-based mantığını gösterir
- 📊 **Gerçek Zamanlı Analiz**: Confidence skorları ve bounding box'lar
- 🎓 **Eğitici Modlar**: Başlangıç, orta ve ileri seviye açıklamalar

### 🛠️ Teknik Özellikler
- Vanilla JavaScript (bağımlılık yok)
- TensorFlow.js entegrasyonu
- COCO-SSD model desteği
- Responsive tasarım
- Modern browser desteği

## 📦 Kurulum

### Gereksinimler
- Modern web tarayıcısı (Chrome, Firefox, Safari, Edge)
- Webcam erişimi
- Node.js (geliştirme için)

### Hızlı Başlangıç

```bash
# Projeyi klonla
git clone https://github.com/mratsag/yolo-grid-demo.git
cd yolo-grid-demo

# Bağımlılıkları yükle (geliştirme için)
npm install

# Geliştirme sunucusunu başlat
npm start
```

**Alternatif olarak**, sadece `src/index.html` dosyasını tarayıcıda açabilirsiniz.

## 🎮 Kullanım

### 1. Temel Demo
```bash
# Tarayıcıda aç
open src/index.html
```

### 2. Gelişmiş Özellikler
```bash
# Geliştirme modu (auto-reload)
npm run dev
```

### 3. Demo Modları
- **Basic Demo**: `demo/basic-demo.html` - Grid kavramı
- **Advanced Demo**: `demo/advanced-demo.html` - Gerçek tespit
- **Tutorial**: `demo/tutorial.html` - Adım adım öğretici

## 📚 Dokümantasyon

- [Kurulum Rehberi](docs/setup.md)
- [API Dokümantasyonu](docs/api.md) 
- [Blog Yazısı](https://www.muratsag.com/blog/40cad16b-fd88-4266-9671-f9b51eec6e9a)

## 🗂️ Proje Yapısı

```
yolo-grid-demo/
├── src/                    # Ana kaynak kodlar
│   ├── index.html         # Ana demo sayfası
│   ├── css/               # Stil dosyaları
│   ├── js/                # JavaScript modülleri
│   └── components/        # UI bileşenleri
├── demo/                  # Demo versiyonları
├── docs/                  # Dokümantasyon
└── deploy/               # Deployment dosyaları
```

## 🎯 Öğrenim Hedefleri

Bu demo ile öğrenebilecekleriniz:

1. **YOLO Algoritması Temelleri**
   - Grid-based yaklaşım
   - "Tek bakışta" tespit mantığı
   - Confidence skorları

2. **Computer Vision Kavramları**
   - Bounding box nedir?
   - Grid hücrelerinin rolü
   - Real-time processing

3. **Pratik Uygulama**
   - Webcam ile nesne tespiti
   - JavaScript ile ML
   - TensorFlow.js kullanımı

## 🚀 Demo

[🎮 Canlı Demo'yu Deneyin]([https://[kullanici-adi].github.io/yolo-grid-demo](https://yolo-grid-demo-production.up.railway.app/))

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Commit edin (`git commit -am 'Yeni özellik: açıklama'`)
4. Push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje [MIT License](LICENSE) altında lisanslanmıştır.

## 👨‍💻 Geliştirici

**Murat Sağ**
- Website: [muratsag.com](https://www.muratsag.com)
- Blog: [YOLO'nun Hikayesi](https://www.muratsag.com/blog/40cad16b-fd88-4266-9671-f9b51eec6e9a)

## 🙏 Teşekkürler

- YOLO algoritması geliştiricileri
- TensorFlow.js ekibi
- Açık kaynak topluluğu

---

⭐ Projeyi beğendiyseniz star vermeyi unutmayın!
