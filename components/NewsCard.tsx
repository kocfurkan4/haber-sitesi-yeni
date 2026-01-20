// components/NewsCard.tsx - Kapsamlı Haber Kartı Bileşeni
'use client';

import React, { useState, useCallback } from 'react';
import { Download, Copy, Languages, Volume2, Filter } from 'lucide-react';

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

// Basit bir çeviri fonksiyonu (Gerçekte API çağrısı yapılmalı)
// Bu örnekte, sadece Türkçe ve İngilizce arasında geçiş yapacak bir mock fonksiyon kullanıyoruz.
const mockTranslate = (text: string, targetLang: 'tr' | 'en') => {
  if (targetLang === 'tr') {
    // İngilizce olduğunu varsayarak Türkçe çeviri döndür
    return `[TR Çeviri] ${text}`;
  }
  // Türkçe olduğunu varsayarak İngilizce çeviri döndür
  return `[EN Translation] ${text}`;
};

const NewsCard: React.FC<NewsCardProps> = ({ item, news, onFilter }) => {
  const [isTranslated, setIsTranslated] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Seslendirme Fonksiyonu (Web Speech API)
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

  // Ses İndirme Fonksiyonu (Web Speech API ile doğrudan dosya indirmek mümkün değildir,
  // bu yüzden kullanıcıya kopyalama seçeneği sunulur veya bir API'ye yönlendirilir.)
  const handleDownload = () => {
    // Gerçek bir indirme için bir TTS API'sine (örn. Google Cloud TTS) ihtiyaç vardır.
    // Bu örnekte, kullanıcıya metni kopyalamasını öneriyoruz.
    alert('Doğrudan ses dosyası indirme, harici bir API gerektirir. Metin panoya kopyalandı.');
    navigator.clipboard.writeText(newsItem.content || newsItem.summary || '');
  };

  // Metin Kopyalama Fonksiyonu
  const handleCopy = () => {
    navigator.clipboard.writeText(newsItem.content || newsItem.summary || '');
    alert('Haber içeriği panoya kopyalandı.');
  };

  // Çeviri Fonksiyonu
  const toggleTranslation = () => {
    setIsTranslated(prev => !prev);
  };

  const displayTitle = isTranslated ? mockTranslate(newsItem.title, 'tr') : newsItem.title;
  const displayContent = isTranslated ? mockTranslate(newsItem.content || newsItem.summary || '', 'tr') : (newsItem.content || newsItem.summary || '');
  const translationLang = isTranslated ? 'EN' : 'TR';

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mb-4 border border-gray-200">
      <h2 className="text-xl font-bold mb-2">{displayTitle}</h2>
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
        <span>Tarih: {new Date(newsItem.pubDate || newsItem.date).toLocaleDateString()}</span>
      </div>

      <p className="text-gray-700 mb-4">{displayContent}</p>

      <div className="flex space-x-3 text-sm">
        <a href={newsItem.link || newsItem.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
          🔗 Haberin Kaynağına Git
        </a>

        {/* Aksiyon Butonları */}
        <button
          onClick={toggleTranslation}
          className="text-purple-600 hover:text-purple-800 flex items-center"
          aria-label={`Haber içeriğini ${translationLang} diline çevir`}
        >
          <Languages size={16} className="mr-1" /> Çevir ({translationLang})
        </button>

        <button
          onClick={() => speakText(displayContent)}
          className={`flex items-center ${isSpeaking ? 'text-red-500' : 'text-green-600 hover:text-green-800'}`}
          aria-label={isSpeaking ? 'Seslendirme durduruluyor...' : 'Seslendir'}
        >
          <Volume2 size={16} className="mr-1" /> Seslendir
        </button>

        <button
          onClick={handleDownload}
          className="text-gray-600 hover:text-gray-800 flex items-center"
          aria-label="Ses dosyasını indir"
        >
          <Download size={16} className="mr-1" /> İndir
        </button>

        <button
          onClick={handleCopy}
          className="text-gray-600 hover:text-gray-800 flex items-center"
          aria-label="Haber içeriğini kopyala"
        >
          <Copy size={16} className="mr-1" /> Kopyala
        </button>
      </div>
    </div>
  );
};

export default NewsCard;
