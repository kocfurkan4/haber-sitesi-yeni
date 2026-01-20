"use client";

import { useState, useMemo, useEffect } from "react";
import { NewsItem } from "@/lib/mockData";
import Link from "next/link";
import { ExternalLink, Eye } from "lucide-react";

export default function HaberlerPage() {
  const [showOnlyUnsent, setShowOnlyUnsent] = useState(false);
  const [selectedSource, setSelectedSource] = useState("all");
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRssSources, setHasRssSources] = useState(true);

  // Load news from localStorage (collected news)
  useEffect(() => {
    const loadNews = () => {
      try {
        // First check if there are RSS sources configured
        const rssFeeds = localStorage.getItem("rssFeeds");
        if (!rssFeeds) {
          setHasRssSources(false);
          setIsLoading(false);
          return;
        }

        let parsedFeeds = [];
        try {
          parsedFeeds = JSON.parse(rssFeeds);
        } catch (e) {
          console.error("Error parsing RSS feeds:", e);
          setHasRssSources(false);
          setIsLoading(false);
          return;
        }

        if (!Array.isArray(parsedFeeds) || parsedFeeds.length === 0) {
          setHasRssSources(false);
          setIsLoading(false);
          return;
        }

        // Load collected news from localStorage
        const stored = localStorage.getItem("collectedNews");
        if (stored) {
          try {
            const collected = JSON.parse(stored);
            // Ensure it's an array
            if (Array.isArray(collected)) {
              setAllNews(collected);
            } else {
              console.error("Collected news is not an array");
              setAllNews([]);
            }
            setHasRssSources(true);
          } catch (error) {
            console.error("Error loading collected news:", error);
            setAllNews([]);
            setHasRssSources(true);
          }
        } else {
          // No collected news yet, but sources exist
          setAllNews([]);
          setHasRssSources(true);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error in loadNews:", error);
        setAllNews([]);
        setHasRssSources(false);
        setIsLoading(false);
      }
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

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

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
      <div className="space-y-4">
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
          // Simple list view - full width
          filteredNews.map((news) => (
            <div
              key={news.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 p-6"
            >
              <div className="flex flex-col gap-3">
                {/* Header: Source and Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-blue-600">
                    📰 {news.source}
                  </span>
                  <span className="text-gray-500">
                    {formatDate(news.date)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  {news.title}
                </h3>

                {/* Summary/Content preview */}
                <p className="text-gray-700 line-clamp-2">
                  {news.summary || news.content?.substring(0, 200) || "İçerik bulunamadı"}
                  {(news.content?.length || 0) > 200 && "..."}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {/* Preview Button */}
                  <Link
                    href={`/preview/haber-detay?title=${encodeURIComponent(
                      news.title
                    )}&content=${encodeURIComponent(
                      news.content || news.summary || ""
                    )}&source=${encodeURIComponent(
                      news.source
                    )}&link=${encodeURIComponent(
                      news.sourceUrl || ""
                    )}&date=${encodeURIComponent(news.date)}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium text-sm"
                  >
                    <Eye size={16} />
                    Ön İzleme
                  </Link>

                  {/* Original Link */}
                  {news.sourceUrl && (
                    <a
                      href={news.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
                    >
                      <ExternalLink size={16} />
                      Orijinal Haber
                    </a>
                  )}

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      news.isSent
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {news.isSent ? "✓ Gönderildi" : "⏳ Bekliyor"}
                  </span>

                  {/* Interest Score */}
                  {news.interestScore && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      ⭐ {news.interestScore}/10
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
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
