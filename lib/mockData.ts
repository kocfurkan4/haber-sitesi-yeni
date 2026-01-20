export interface NewsItem {
  id: string;
  title: string;
  interestScore: number;
  source: string;
  date: string;
  summary: string;
  content: string;
  tags: string[];
  category: string;
  sourceUrl: string;
  isSent: boolean;
}

export const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "Yapay Zeka ChatGPT-5 Piyasaya Çıkıyor: İşte Beklenen Yenilikler",
    interestScore: 10,
    source: "TechCrunch",
    date: "20 Ocak 2026",
    summary: "OpenAI'nin yeni nesil yapay zeka modeli ChatGPT-5, gelişmiş mantık yürütme ve çoklu dil desteğiyle kullanıcıları şaşırtmaya hazırlanıyor.",
    content: "OpenAI, yapay zeka alanındaki en büyük atılımlarından birini gerçekleştirerek ChatGPT-5 modelini duyurdu. Yeni model, önceki versiyonlara göre %40 daha hızlı yanıt verebiliyor ve çok daha karmaşık problemleri çözebiliyor. Özellikle bilimsel araştırmalar, kod yazımı ve yaratıcı içerik üretiminde devrim yaratması bekleniyor.",
    tags: ["Yapay Zeka", "ChatGPT", "OpenAI", "Teknoloji"],
    category: "AI",
    sourceUrl: "https://techcrunch.com",
    isSent: true
  },
  {
    id: "2",
    title: "Apple Vision Pro 2 Tanıtıldı: Daha Hafif, Daha Güçlü",
    interestScore: 9,
    source: "The Verge",
    date: "19 Ocak 2026",
    summary: "Apple'ın merakla beklenen ikinci nesil AR/VR başlığı Vision Pro 2, %30 daha hafif tasarımı ve gelişmiş özellikleriyle geliyor.",
    content: "Apple, Vision Pro serisinin ikinci jenerasyonunu tanıttı. Yeni cihaz sadece 450 gram ağırlığında ve 8 saate kadar pil ömrü sunuyor. M4 çipi ile desteklenen Vision Pro 2, 4K çözünürlükte video kaydı yapabiliyor ve gelişmiş göz takibi teknolojisi sayesinde daha doğal bir kullanıcı deneyimi vaat ediyor.",
    tags: ["Apple", "Vision Pro", "AR", "VR", "Donanım"],
    category: "Hardware",
    sourceUrl: "https://theverge.com",
    isSent: true
  },
  {
    id: "3",
    title: "Quantum Bilgisayarlar Ticari Kullanıma Açıldı",
    interestScore: 10,
    source: "MIT Technology Review",
    date: "18 Ocak 2026",
    summary: "IBM ve Google'ın ortak projesi ile quantum bilgisayarlar artık bulut üzerinden şirketlere hizmet verecek.",
    content: "Uzun yıllardır laboratuvar ortamında geliştirilen quantum bilgisayarlar, nihayet ticari kullanıma sunuldu. IBM Q System Two ve Google Willow işlemcileri, özellikle ilaç geliştirme, finans modelleme ve kripto çözme alanlarında devrim yaratacak. İlk kullanıcılar arasında büyük ilaç firmaları ve finans kuruluşları yer alıyor.",
    tags: ["Quantum", "IBM", "Google", "Bulut Bilişim"],
    category: "Computing",
    sourceUrl: "https://technologyreview.com",
    isSent: false
  },
  {
    id: "4",
    title: "Tesla'nın Yeni Otonom Sürüş Yazılımı Beta'dan Çıktı",
    interestScore: 8,
    source: "Electrek",
    date: "17 Ocak 2026",
    summary: "Full Self-Driving (FSD) v13, artık tüm Tesla kullanıcılarına açık ve tamamen otonom sürüş deneyimi sunuyor.",
    content: "Tesla'nın uzun süredir geliştirdiği Full Self-Driving yazılımının 13. versiyonu beta aşamasından çıktı. Yeni sistem, şehir içi trafikte, otoyollarda ve park etme işlemlerinde insan müdahalesi gerektirmiyor. Ancak güvenlik nedeniyle sürücülerin direksiyonda hazır beklemesi zorunlu.",
    tags: ["Tesla", "Otonom Sürüş", "FSD", "Elektrikli Araç"],
    category: "Automotive",
    sourceUrl: "https://electrek.co",
    isSent: false
  },
  {
    id: "5",
    title: "Meta Yeni Sosyal Platform 'Threads Pro' yu Duyurdu",
    interestScore: 7,
    source: "TechCrunch",
    date: "16 Ocak 2026",
    summary: "Meta, profesyonel kullanıcılara özel yeni platformu Threads Pro ile iş dünyasına giriş yapıyor.",
    content: "Meta, Instagram ve Threads'in ardından profesyonel kullanıcılara hitap eden yeni platformu Threads Pro'yu tanıttı. Platform, LinkedIn benzeri özelliklere sahip ancak daha modern bir arayüz sunuyor. Özellikle freelancer'lar, girişimciler ve küçük işletmeler için tasarlanan platform, AI destekli networking önerileri ve gelişmiş analitik araçları içeriyor.",
    tags: ["Meta", "Social Media", "Threads", "Business"],
    category: "Social",
    sourceUrl: "https://techcrunch.com",
    isSent: false
  },
  {
    id: "6",
    title: "Microsoft, Windows 12'yi Resmen Duyurdu",
    interestScore: 9,
    source: "Windows Central",
    date: "15 Ocak 2026",
    summary: "Microsoft'un yeni işletim sistemi Windows 12, tamamen AI entegrasyonu ve modüler tasarımıyla geliyor.",
    content: "Microsoft, Windows serisinin en büyük güncellemesi olan Windows 12'yi tanıttı. Yeni işletim sistemi, her köşesine entegre edilmiş yapay zeka asistanı Copilot ile geliyor. Ayrıca modüler yapısı sayesinde kullanıcılar istedikleri özellikleri ekleyip çıkarabilecek. İlk kez ARM ve x86 mimarilerinde tam uyumluluk sağlanıyor.",
    tags: ["Microsoft", "Windows", "İşletim Sistemi", "AI"],
    category: "Software",
    sourceUrl: "https://windowscentral.com",
    isSent: true
  },
  {
    id: "7",
    title: "5G'nin Yerini Alacak 6G Teknolojisi Test Ediliyor",
    interestScore: 8,
    source: "The Register",
    date: "14 Ocak 2026",
    summary: "Japonya ve Güney Kore'de başlatılan 6G testleri, 1 Tbps hıza ulaşmayı hedefliyor.",
    content: "5G henüz tam olarak yaygınlaşmadan, 6G teknolojisi test aşamasına girdi. İlk testler Japonya ve Güney Kore'de gerçekleştiriliyor ve 1 Terabit/saniye hıza ulaşabiliyor. Bu hız, 5G'den yaklaşık 50 kat daha hızlı demek. 6G ile holografik görüşmeler, gerçek zamanlı AI işleme ve IoT cihazları arasında anlık iletişim mümkün olacak.",
    tags: ["6G", "Telekom", "Ağ", "Japonya"],
    category: "Network",
    sourceUrl: "https://theregister.com",
    isSent: false
  },
  {
    id: "8",
    title: "Netflix, İnteraktif AI Film Deneyimini Başlattı",
    interestScore: 6,
    source: "Variety",
    date: "13 Ocak 2026",
    summary: "Netflix'in yeni AI teknolojisi, izleyicilerin tercihlerine göre hikayeyi gerçek zamanlı değiştiriyor.",
    content: "Netflix, yapay zeka destekli interaktif film deneyimini kullanıma sundu. İzleyiciler, karakterlerin kararlarını etkileyebiliyor ve hikaye AI tarafından anlık olarak şekilleniyor. Her izleyici için benzersiz bir deneyim oluşturan sistem, ilk olarak bilim kurgu filmi 'Infinite Choices' ile test ediliyor.",
    tags: ["Netflix", "AI", "Eğlence", "Streaming"],
    category: "Entertainment",
    sourceUrl: "https://variety.com",
    isSent: false
  }
];
