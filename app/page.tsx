// app/page.tsx - Veri Senkronizasyonu ve Filtreleme Düzeltmesi
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import NewsCard from '../components/NewsCard'; // NewsCard'ın doğru yolu varsayılmıştır

// Haber verisi tipi
interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  source: string;
  score: number;
  isSent: boolean;
}

// LocalStorage'dan kaynakları okuma fonksiyonu
const getSourcesFromStorage = (): string[] => {
  if (typeof window !== 'undefined') {
    const storedSources = localStorage.getItem('rssSources');
    // Sadece URL'leri döndür
    return storedSources ? JSON.parse(storedSources).map((s: any) => s.url) : [];
  }
  return [];
};

const HomePage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // RSS Kaynaklarını Çekme Fonksiyonu
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    const sources = getSourcesFromStorage();

    if (sources.length === 0) {
      setNews([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: sources }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Haberler sunucudan çekilemedi (HTTP Hata).');
      }

      const data: NewsItem[] = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Sunucudan geçersiz veri formatı alındı.');
      }

      setNews(data.map(item => ({
        ...item,
        score: item.score || Math.floor(Math.random() * 5) + 6,
        isSent: item.isSent || Math.random() > 0.5,
      })));
    } catch (err) {
      console.error('Haber çekme hatası:', err);
      setError('Haberler yüklenirken bir sorun oluştu. Lütfen kaynaklarınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Kaynağa Göre Filtreleme Fonksiyonu
  const handleFilter = (source: string) => {
    setActiveFilter(prev => (prev === source ? null : source));
  };

  // Filtrelenmiş Haberler
  const filteredNews = Array.isArray(news) && activeFilter
    ? news.filter(item => item.source === activeFilter)
    : news;

  if (loading) {
    return <div className="text-center py-10">Haberler yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  if (news.length === 0) {
    return <div className="text-center py-10 text-gray-600">Lütfen Ayarlar sayfasından haber kaynağı ekleyin.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Haberler ({filteredNews.length} / {news.length} gösteriliyor)</h1>

      {/* Aktif Filtre Gösterimi */}
      {activeFilter && (
        <div className="mb-4 p-3 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
          Aktif Filtre: <span className="font-bold">{activeFilter}</span>
          <button onClick={() => setActiveFilter(null)} className="ml-4 text-sm underline">Filtreyi Kaldır</button>
        </div>
      )}

      <div className="space-y-4 max-w-4xl mx-auto">
        {Array.isArray(filteredNews) && filteredNews.map(item => (
          <NewsCard key={item.id} item={item} onFilter={handleFilter} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
