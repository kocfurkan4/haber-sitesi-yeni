// components/NewsCard.tsx - Kapsamlı Haber Kartı Bileşeni
'use client';

import React, { useState, useCallback } from 'react';
import { Download, Copy, Languages, Volume2, Filter, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

interface NewsCardProps {
  item?: NewsItem;
  news?: any; // For backward compatibility with old interface
  onFilter?: (source: string) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ item, news, onFilter }) => {
  const router = useRouter();
  const [translatedContent, setTranslatedContent] = useState<{ title: string; content: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Seslendirme Fonksiyonu (Web Speech API) - Hooks must be called before any return
  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR'; // Türkçe seslendirme

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Tarayıcınız sesli okumayı desteklemiyor.');
    }
  }, []);

  // Use either item or news (backward compatibility)
  const newsItem = item || news;

  if (!newsItem) {
    return null;
  }

  // Gerçek Çeviri Fonksiyonu - Gemini API
  const toggleTranslation = async () => {
    // Eğer zaten çevrilmişse, orjinaline dön
    if (translatedContent) {
      setTranslatedContent(null);
      setTranslationError(null);
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);

    try {
      // Başlığı çevir
      const titleResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newsItem.title,
          targetLang: 'tr',
        }),
      });

      if (!titleResponse.ok) {
        throw new Error('Başlık çevirisi başarısız oldu.');
      }

      const titleData = await titleResponse.json();

      // İçeriği çevir
      const contentText = newsItem.content || newsItem.summary || '';
      const contentResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: contentText,
          targetLang: 'tr',
        }),
      });

      if (!contentResponse.ok) {
        throw new Error('İçerik çevirisi başarısız oldu.');
      }

      const contentData = await contentResponse.json();

      setTranslatedContent({
        title: titleData.translatedText,
        content: contentData.translatedText,
      });
    } catch (error) {
      console.error('Çeviri hatası:', error);
      setTranslationError('Çeviri şu an yapılamıyor. Lütfen API anahtarını kontrol edin.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Ön İzleme Fonksiyonu
  const handlePreview = () => {
    const title = encodeURIComponent(newsItem.title);
    const content = encodeURIComponent(newsItem.content || newsItem.summary || 'İçerik mevcut değil');
    const source = encodeURIComponent(newsItem.source);
    router.push(`/preview/haber-detay?title=${title}&content=${content}&source=${source}`);
  };

  // Ses İndirme Fonksiyonu
  const handleDownload = () => {
    alert('Doğrudan ses dosyası indirme, harici bir API gerektirir. Metin panoya kopyalandı.');
    navigator.clipboard.writeText(newsItem.content || newsItem.summary || '');
  };

  // Metin Kopyalama Fonksiyonu
  const handleCopy = () => {
    navigator.clipboard.writeText(newsItem.content || newsItem.summary || '');
    alert('Haber içeriği panoya kopyalandı.');
  };

  const displayTitle = translatedContent ? translatedContent.title : newsItem.title;
  const displayContent = translatedContent ? translatedContent.content : (newsItem.content || newsItem.summary || 'Haber içeriği mevcut değil. Detay için kaynağa gidin.');

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mb-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold mb-2 text-gray-800">{displayTitle}</h2>

      <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
        <span className="font-medium">Kaynak:
          {onFilter && (
            <button
              onClick={() => onFilter(newsItem.source)}
              className="text-blue-600 hover:text-blue-800 ml-1 underline flex items-center"
              aria-label={`Filtrele: ${newsItem.source}`}
            >
              {newsItem.source} <Filter size={14} className="ml-1" />
            </button>
          )}
          {!onFilter && <span className="ml-1">{newsItem.source}</span>}
        </span>
        {newsItem.score !== undefined && (
          <span>Puan: <span className="font-bold text-green-600">{newsItem.score}/10</span></span>
        )}
        {newsItem.interestScore !== undefined && (
          <span>Puan: <span className="font-bold text-green-600">{newsItem.interestScore}/10</span></span>
        )}
        <span>Tarih: {new Date(newsItem.pubDate || newsItem.date).toLocaleDateString('tr-TR')}</span>
      </div>

      {/* Çeviri Durumu ve Hata Mesajı */}
      {isTranslating && (
        <div className="mb-3 p-2 bg-blue-50 border-l-4 border-blue-500 text-blue-700 text-sm">
          <span className="animate-pulse">⏳ Çevriliyor... Lütfen bekleyin</span>
        </div>
      )}

      {translationError && (
        <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
          ⚠️ {translationError}
        </div>
      )}

      <p className="text-gray-700 mb-4 leading-relaxed">{displayContent}</p>

      <div className="flex flex-wrap gap-3 text-sm">
        <a
          href={newsItem.link || newsItem.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center font-medium"
        >
          🔗 Kaynağa Git
        </a>

        {/* Ön İzleme Butonu */}
        <button
          onClick={handlePreview}
          className="text-indigo-600 hover:text-indigo-800 flex items-center font-medium"
          aria-label="Haberi ön izle"
        >
          <Eye size={16} className="mr-1" /> 📝 Ön İzleme
        </button>

        {/* Çeviri Butonu */}
        <button
          onClick={toggleTranslation}
          disabled={isTranslating}
          className={`flex items-center font-medium ${
            isTranslating
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-purple-600 hover:text-purple-800'
          }`}
          aria-label={`Haber içeriğini ${translatedContent ? 'orijinaline döndür' : 'Türkçeye çevir'}`}
        >
          <Languages size={16} className="mr-1" />
          {isTranslating ? 'Çevriliyor...' : translatedContent ? 'Orijinal (EN)' : 'Çevir (TR)'}
        </button>

        {/* Seslendir Butonu */}
        <button
          onClick={() => speakText(displayContent)}
          className={`flex items-center font-medium ${
            isSpeaking ? 'text-red-500' : 'text-green-600 hover:text-green-800'
          }`}
          aria-label={isSpeaking ? 'Seslendirme durduruluyor...' : 'Seslendir'}
        >
          <Volume2 size={16} className="mr-1" /> Seslendir
        </button>

        {/* İndir Butonu */}
        <button
          onClick={handleDownload}
          className="text-gray-600 hover:text-gray-800 flex items-center font-medium"
          aria-label="Ses dosyasını indir"
        >
          <Download size={16} className="mr-1" /> İndir
        </button>

        {/* Kopyala Butonu */}
        <button
          onClick={handleCopy}
          className="text-gray-600 hover:text-gray-800 flex items-center font-medium"
          aria-label="Haber içeriğini kopyala"
        >
          <Copy size={16} className="mr-1" /> Kopyala
        </button>
      </div>
    </div>
  );
};

export default NewsCard;
