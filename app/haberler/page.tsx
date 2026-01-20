"use client";

import { useState, useMemo, useEffect } from "react";
import NewsCard from "@/components/NewsCard";
import { NewsItem } from "@/lib/mockData";
import Link from "next/link";

export default function HaberlerPage() {
  const [showOnlyUnsent, setShowOnlyUnsent] = useState(false);
  const [selectedSource, setSelectedSource] = useState("all");
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRssSources, setHasRssSources] = useState(true);

  // Load news from localStorage (collected news)
  useEffect(() => {
    const loadNews = () => {
      // First check if there are RSS sources configured
      const rssFeeds = localStorage.getItem("rssFeeds");
      if (!rssFeeds || JSON.parse(rssFeeds).length === 0) {
        setHasRssSources(false);
        setIsLoading(false);
        return;
      }

      // Load collected news from localStorage
      const stored = localStorage.getItem("collectedNews");
      if (stored) {
        try {
          const collected = JSON.parse(stored);
          setAllNews(collected);
          setHasRssSources(true);
        } catch (error) {
          console.error("Error loading collected news:", error);
        }
      } else {
        // No collected news yet, but sources exist
        setAllNews([]);
        setHasRssSources(true);
      }
      setIsLoading(false);
    };

    loadNews();

    // Listen for storage changes (when news is collected from admin panel)
    const handleStorageChange = () => {
      loadNews();
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event from admin panel
    window.addEventListener('newsCollected', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('newsCollected', handleStorageChange);
    };
  }, []);

  // Tüm kaynakları al
  const allSources = useMemo(() => {
    const sources = Array.from(new Set(allNews.map((news) => news.source)));
    return ["all", ...sources.sort()];
  }, [allNews]);

  const filteredNews = useMemo(() => {
    let filtered = allNews;

    // Kaynak filtreleme
    if (selectedSource !== "all") {
      filtered = filtered.filter((news) => news.source === selectedSource);
    }

    // Gönderilmemiş filtreleme
    if (showOnlyUnsent) {
      filtered = filtered.filter((news) => !news.isSent);
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [showOnlyUnsent, selectedSource, allNews]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-military-600">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-accent-green mb-2">
                📰 Haberler
              </h1>
              <p className="text-gray-700">
                <span className="font-semibold text-accent-green">
                  {filteredNews.length}
                </span>{" "}
                haber gösteriliyor
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center space-x-3">
              <label
                htmlFor="unsent-toggle"
                className="text-gray-800 font-medium cursor-pointer select-none"
              >
                Sadece gönderilmeyenleri göster
              </label>
              <button
                id="unsent-toggle"
                role="switch"
                aria-checked={showOnlyUnsent}
                onClick={() => setShowOnlyUnsent(!showOnlyUnsent)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-smooth ${
                  showOnlyUnsent ? "bg-accent-green" : "bg-military-600"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-smooth shadow-md ${
                    showOnlyUnsent ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Kaynak Filtresi */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t-2 border-military-600">
            <label className="text-gray-800 font-semibold">
              📰 Kaynağa Göre Filtrele:
            </label>
            <div className="flex flex-wrap gap-2">
              {allSources.map((source) => (
                <button
                  key={source}
                  onClick={() => setSelectedSource(source)}
                  className={`px-4 py-2 rounded-lg font-medium transition-smooth border-2 ${
                    selectedSource === source
                      ? "bg-accent-green text-white border-accent-green"
                      : "bg-white text-gray-800 border-military-600 hover:bg-military-900"
                  }`}
                >
                  {source === "all" ? "Tüm Kaynaklar" : source}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-military-600">
            <div className="animate-pulse">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-gray-700 text-lg font-medium">Haberler yükleniyor...</p>
            </div>
          </div>
        ) : !hasRssSources ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-accent-red">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-accent-red mb-4">
              RSS Kaynağı Bulunamadı!
            </h2>
            <p className="text-gray-700 text-lg mb-6">
              Haber görebilmek için önce RSS kaynakları eklemeniz gerekiyor.
            </p>
            <Link
              href="/admin"
              className="inline-block bg-accent-green hover:bg-accent-green/80 text-white font-bold py-3 px-6 rounded-lg transition-smooth"
            >
              🛡️ Admin Panel&apos;e Git
            </Link>
          </div>
        ) : filteredNews.length > 0 ? (
          filteredNews.map((news) => <NewsCard key={news.id} news={news} />)
        ) : allNews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-accent-yellow">
            <div className="text-6xl mb-4">📡</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Henüz Haber Toplanmamış!
            </h2>
            <p className="text-gray-700 text-lg mb-6">
              RSS kaynaklarınızdan haber toplamak için Admin Panel&apos;deki &quot;Manuel Haber Topla&quot; butonuna tıklayın.
            </p>
            <Link
              href="/admin"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-smooth"
            >
              📰 Haber Topla
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-military-600">
            <p className="text-gray-700 text-lg">
              {selectedSource !== "all"
                ? `${selectedSource} kaynağından ${
                    showOnlyUnsent ? "gönderilmemiş " : ""
                  }haber bulunmamaktadır.`
                : showOnlyUnsent
                ? "Henüz gönderilmemiş haber bulunmamaktadır."
                : "Haber bulunmamaktadır."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
