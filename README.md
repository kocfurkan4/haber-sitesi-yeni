# 💻 Piyade - Piyade Haberleri

Modern ve profesyonel piyade haberleri portalı. Next.js 14+, TypeScript ve Tailwind CSS ile geliştirilmiştir.

## 🚀 Canlı Demo

[Vercel'de Görüntüle](https://piyade.vercel.app/)

## ✨ Özellikler

- 📰 **Modern Haber Kartları** - Her haber için detaylı bilgi, kategori ve ilgi puanı
- 🎯 **Akıllı Filtreleme** - Gönderilen/gönderilmeyen haberleri filtreleyin
- ⚙️ **Kişiselleştirme** - Minimum ilgi puanı ve haber sayısı ayarları
- 🔐 **Giriş Sistemi** - Kullanıcı dostu login sayfası
- 📱 **Responsive Tasarım** - Mobil, tablet ve masaüstü uyumlu
- 🎨 **Modern UI** - Tailwind CSS ile şık ve hızlı arayüz

## 📋 Sayfa Yapısı

- `/` - Ana sayfa (Hero section, özellikler, CTA)
- `/haberler` - Tüm piyade haberleri
- `/settings` - Kullanıcı ayarları
- `/login` - Giriş sayfası

## 🛠️ Teknolojiler

- **Framework:** Next.js 15.5.9 (App Router)
- **Dil:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Deploy:** Vercel

## 🏃‍♂️ Projeyi Çalıştırma

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/kocfurkan4/haber-sitesi-yeni.git
cd haber-sitesi-yeni
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📦 Build

Production build oluşturmak için:

```bash
npm run build
npm start
```

## 🌐 Vercel'e Deploy Etme

### Yöntem 1: Vercel Dashboard (Önerilen - En Kolay)

1. [Vercel](https://vercel.com) hesabınıza giriş yapın
2. "Add New..." → "Project" seçin
3. GitHub repository'nizi seçin (`haber-sitesi-yeni`)
4. "Import" butonuna tıklayın
5. Framework Preset otomatik olarak "Next.js" seçilecek
6. "Deploy" butonuna tıklayın
7. 1-2 dakika içinde siteniz yayında olacak!

### Yöntem 2: Vercel CLI

```bash
# Vercel CLI'yi yükleyin
npm i -g vercel

# Projeyi deploy edin
vercel

# Production deploy için
vercel --prod
```

### Yöntem 3: GitHub Actions (Otomatik Deploy)

Her push'da otomatik deploy için `.github/workflows/deploy.yml` eklenebilir.

## 📝 Örnek Haberler

Proje 8 farklı kategoride örnek haberler içerir:
- AI (Yapay Zeka)
- Hardware (Donanım)
- Computing (Bilişim)
- Automotive (Otomotiv)
- Social (Sosyal Medya)
- Software (Yazılım)
- Network (Ağ)
- Entertainment (Eğlence)

## 🎨 Özelleştirme

### Renkleri Değiştirme

`tailwind.config.ts` dosyasında primary renklerini düzenleyin:

```typescript
colors: {
  primary: {
    DEFAULT: '#1e3a8a',  // Ana mavi
    dark: '#1e40af',
    light: '#3b82f6',
  },
}
```

### Haber Ekleme/Düzenleme

`lib/mockData.ts` dosyasında haberleri düzenleyebilirsiniz.

## 📂 Proje Yapısı

```
haber-sitesi-yeni/
├── app/
│   ├── haberler/
│   │   └── page.tsx          # Haberler sayfası
│   ├── login/
│   │   └── page.tsx          # Giriş sayfası
│   ├── settings/
│   │   └── page.tsx          # Ayarlar sayfası
│   ├── globals.css           # Global stiller
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Ana sayfa
├── components/
│   ├── Navbar.tsx            # Navigation bar
│   └── NewsCard.tsx          # Haber kartı bileşeni
├── lib/
│   └── mockData.ts           # Örnek haber verileri
├── tailwind.config.ts        # Tailwind yapılandırması
├── next.config.ts            # Next.js yapılandırması
└── package.json
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

Furkan Koç - [@kocfurkan4](https://github.com/kocfurkan4)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
