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
  },
  {
    id: "9",
    title: "Samsung Galaxy S26 Ultra 200MP Kamera ile Geliyor",
    interestScore: 7,
    source: "Android Authority",
    date: "12 Ocak 2026",
    summary: "Samsung'un yeni amiral gemisi telefonu 200MP ana kamera ve gelişmiş AI fotoğraf özellikleri ile tanıtıldı.",
    content: "Samsung, Galaxy S26 Ultra'yı tanıttı. Yeni telefon, 200MP ana kamera, 1 inç sensör boyutu ve gece modunda devrim yaratan AI destekli görüntü işleme ile geliyor. Ayrıca 5000mAh pil, 120W hızlı şarj ve titanium çerçeve içeriyor.",
    tags: ["Samsung", "Smartphone", "Camera", "Android"],
    category: "Mobile",
    sourceUrl: "https://androidauthority.com",
    isSent: false
  },
  {
    id: "10",
    title: "SpaceX Starship İlk İnsanlı Mars Misyonunu Planlıyor",
    interestScore: 10,
    source: "Space.com",
    date: "11 Ocak 2026",
    summary: "SpaceX, Starship ile 2028'de ilk insanlı Mars misyonunu gerçekleştirmeyi hedefliyor.",
    content: "Elon Musk, Starship'in 2028 yılında ilk insanlı Mars misyonunu gerçekleştireceğini duyurdu. Altı astronotun katılacağı görev, Mars yüzeyinde 30 gün kalacak ve bilimsel araştırmalar yapacak. Bu, insanlık tarihindeki en önemli uzay keşfi olacak.",
    tags: ["SpaceX", "Mars", "Starship", "Uzay"],
    category: "Space",
    sourceUrl: "https://space.com",
    isSent: false
  },
  {
    id: "11",
    title: "Amazon Alexa 2.0 Tamamen Yeni AI Modeliyle Güncellendi",
    interestScore: 8,
    source: "CNET",
    date: "10 Ocak 2026",
    summary: "Amazon'un yeni Alexa 2.0 sürümü, daha doğal konuşma ve gelişmiş anlama yetenekleriyle geliyor.",
    content: "Amazon, Alexa'nın 2.0 sürümünü kullanıma sundu. Yeni yapay zeka modeli, daha doğal ve akıcı konuşmalar yapabiliyor, bağlam anlayışı çok daha gelişmiş ve kullanıcıların isteklerini daha iyi yorumlayabiliyor. Ayrıca 40'tan fazla dilde tam destek sunuyor.",
    tags: ["Amazon", "Alexa", "AI", "Smart Home"],
    category: "AI",
    sourceUrl: "https://cnet.com",
    isSent: true
  },
  {
    id: "12",
    title: "NVIDIA RTX 5090 Oyun Performansında Yeni Rekor Kırdı",
    interestScore: 9,
    source: "Tom's Hardware",
    date: "09 Ocak 2026",
    summary: "NVIDIA'nın yeni nesil ekran kartı RTX 5090, 8K çözünürlükte 240 FPS'e ulaşabiliyor.",
    content: "NVIDIA, RTX 5090 ekran kartını tanıttı. Yeni GPU, 24,576 CUDA çekirdeği ve 48GB GDDR7 bellek ile geliyor. 8K çözünürlükte AAA oyunlarda 240 FPS'e ulaşabilen kart, ray tracing performansında da önceki nesile göre %300 artış sağlıyor.",
    tags: ["NVIDIA", "GPU", "Gaming", "Hardware"],
    category: "Hardware",
    sourceUrl: "https://tomshardware.com",
    isSent: false
  },
  {
    id: "13",
    title: "Uber Otonom Uçan Taksi Testlerine Başladı",
    interestScore: 9,
    source: "Bloomberg",
    date: "08 Ocak 2026",
    summary: "Uber, şehir içi ulaşım için otonom uçan taksi prototiplerini test etmeye başladı.",
    content: "Uber, Elevate Air adlı yeni hizmetiyle otonom uçan taksi testlerine başladı. İlk testler Dubai'de gerçekleştiriliyor ve başarılı olursa 2027'de ticari hizmete başlanacak. Elektrikli uçan taksiler, 4 yolcu kapasiteli ve 100 km menzile sahip.",
    tags: ["Uber", "Flying Taxi", "Otonom", "Transportation"],
    category: "Transportation",
    sourceUrl: "https://bloomberg.com",
    isSent: false
  },
  {
    id: "14",
    title: "Sony PlayStation 6 2027'de Çıkacak",
    interestScore: 8,
    source: "IGN",
    date: "07 Ocak 2026",
    summary: "Sony, PlayStation 6'nın 2027 yılında piyasaya çıkacağını ve 8K 120FPS destekleyeceğini duyurdu.",
    content: "Sony Interactive Entertainment, PlayStation 6'yı resmen duyurdu. Yeni konsol, custom AMD Zen 5 işlemci, RDNA 4 grafik mimarisi ve 32GB GDDR7 RAM ile geliyor. 8K 120FPS oyun desteği, ray tracing ve AI destekli upscaling özellikleri içeriyor.",
    tags: ["Sony", "PlayStation", "Gaming", "Console"],
    category: "Gaming",
    sourceUrl: "https://ign.com",
    isSent: true
  },
  {
    id: "15",
    title: "GitHub Copilot X Tam Otonom Kod Yazabiliyor",
    interestScore: 9,
    source: "The Verge",
    date: "06 Ocak 2026",
    summary: "GitHub'ın yeni AI asistanı Copilot X, minimal talimatlarla tam projeler geliştirebiliyor.",
    content: "GitHub, Copilot'un en gelişmiş versiyonu olan Copilot X'i tanıttı. Yeni sistem, sadece birkaç cümlelik açıklama ile tam bir web uygulaması, mobil uygulama veya backend sistemi geliştirebiliyor. Ayrıca otomatik test yazma, bug düzeltme ve kod optimizasyonu yapabiliyor.",
    tags: ["GitHub", "Copilot", "AI", "Programming"],
    category: "Software",
    sourceUrl: "https://theverge.com",
    isSent: false
  }
];
