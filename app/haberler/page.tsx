"use client";

import { useState, useMemo } from "react";
import NewsCard from "@/components/NewsCard";
import { mockNews } from "@/lib/mockData";

export default function HaberlerPage() {
  const [showOnlyUnsent, setShowOnlyUnsent] = useState(false);

  const filteredNews = useMemo(() => {
    if (showOnlyUnsent) {
      return mockNews.filter((news) => !news.isSent);
    }
    return mockNews;
  }, [showOnlyUnsent]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="bg-military-800 rounded-xl shadow-lg p-6 mb-8 border-2 border-military-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-accent-green mb-2">
              📰 Haberler
            </h1>
            <p className="text-gray-400">
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
              className="text-gray-300 font-medium cursor-pointer select-none"
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
      </div>

      {/* News List */}
      <div className="space-y-6">
        {filteredNews.length > 0 ? (
          filteredNews.map((news) => <NewsCard key={news.id} news={news} />)
        ) : (
          <div className="bg-military-800 rounded-xl shadow-lg p-12 text-center border-2 border-military-700">
            <p className="text-gray-400 text-lg">
              Henüz gönderilmemiş haber bulunmamaktadır.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
