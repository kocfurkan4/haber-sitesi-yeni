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

  // Haberleri Vercel KV'den Yükleme Fonksiyonu
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Önce Vercel KV'den haberleri çek
      const response = await fetch('/api/news-storage');

      if (!response.ok) {
        throw new Error('Haberler Vercel KV\'den yüklenemedi.');
      }

      const data = await response.json();

      if (!data.success || !Array.isArray(data.news)) {
        throw new Error('Geçersiz veri formatı alındı.');
      }

      // Haberleri tarihe göre sırala (en yeni en üstte)
      const sortedNews = data.news.sort((a: any, b: any) =>
        new Date(b.pubDate || b.date).getTime() - new Date(a.pubDate || a.date).getTime()
      );

      setNews(sortedNews.map((item: any) => ({
        id: item.id || item.sourceUrl,
        title: item.title,
        link: item.sourceUrl || item.link,
        pubDate: item.pubDate || item.date,
        content: item.content,
        source: item.source,
        score: item.score || Math.floor(Math.random() * 5) + 6,
        isSent: item.isSent || false,
      })));
    } catch (err) {
      console.error('Haber çekme hatası:', err);

      // Fallback: localStorage'dan yükle
      try {
        const localNews = localStorage.getItem('collectedNews');
        if (localNews) {
          const parsedNews = JSON.parse(localNews);
          setNews(parsedNews.map((item: any) => ({
            id: item.id || item.sourceUrl,
            title: item.title,
            link: item.sourceUrl || item.link,
            pubDate: item.pubDate || item.date,
            content: item.content,
            source: item.source,
            score: item.score || Math.floor(Math.random() * 5) + 6,
            isSent: item.isSent || false,
          })));
        } else {
          setError('Haberler yüklenirken bir sorun oluştu. Lütfen Admin panelinden haber toplayın.');
        }
      } catch (localErr) {
        setError('Haberler yüklenirken bir sorun oluştu. Lütfen Admin panelinden haber toplayın.');
      }
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
