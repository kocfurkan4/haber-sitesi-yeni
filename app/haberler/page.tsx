"use client";

import { useState, useMemo, useEffect } from "react";
import NewsCard from "@/components/NewsCard";
import { mockNews } from "@/lib/mockData";

export default function HaberlerPage() {
  const [showOnlyUnsent, setShowOnlyUnsent] = useState(false);
  const [selectedSource, setSelectedSource] = useState("all");
  const [collectedNews, setCollectedNews] = useState<any[]>([]);

  // Load collected news from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("collectedNews");
    if (stored) {
      try {
        setCollectedNews(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading collected news:", error);
      }
    }
  }, []);

  // Combine mock news and collected news
  const allNews = useMemo(() => {
    return [...mockNews, ...collectedNews];
  }, [collectedNews]);

  // Tüm kaynakları al (hem mock hem collected'dan)
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
        {filteredNews.length > 0 ? (
          filteredNews.map((news) => <NewsCard key={news.id} news={news} />)
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
