"use client";

import { NewsItem } from "@/lib/mockData";
import { ExternalLink, Eye, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

interface NewsCardProps {
  news: NewsItem;
}

export default function NewsCard({ news }: NewsCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      AI: "bg-purple-500",
      Hardware: "bg-blue-500",
      Computing: "bg-green-500",
      Automotive: "bg-red-500",
      Social: "bg-pink-500",
      Software: "bg-indigo-500",
      Network: "bg-yellow-500",
      Entertainment: "bg-orange-500",
    };
    return colors[category] || "bg-gray-500";
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return "bg-green-500";
    if (score >= 7) return "bg-blue-500";
    if (score >= 5) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-smooth p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex-1 pr-4">
          {news.title}
        </h2>
        <div className="flex flex-col items-end space-y-2">
          <span
            className={`${getScoreColor(
              news.interestScore
            )} text-white px-3 py-1 rounded-full text-sm font-semibold`}
          >
            {news.interestScore}/10
          </span>
          <span
            className={`${getCategoryColor(
              news.category
            )} text-white px-3 py-1 rounded-full text-xs font-medium`}
          >
            {news.category}
          </span>
        </div>
      </div>

      {/* Meta Information */}
      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
        <span className="font-medium">{news.source}</span>
        <span>•</span>
        <span>{news.date}</span>
      </div>

      {/* Summary */}
      <p className="text-gray-600 italic mb-4 leading-relaxed">{news.summary}</p>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed">{news.content}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {news.tags.map((tag, index) => (
          <span
            key={index}
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition-smooth"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-3">
          <a
            href={news.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-primary hover:text-primary-light transition-smooth font-medium"
          >
            <ExternalLink size={18} />
            <span>Haberin Kaynağına Git</span>
          </a>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-smooth font-medium"
          >
            <Eye size={18} />
            <span>Gönderim Öncesi Ön İzleme</span>
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2">
          {news.isSent ? (
            <>
              <CheckCircle size={20} className="text-green-500" />
              <span className="text-green-600 font-semibold">Gönderildi</span>
            </>
          ) : (
            <>
              <XCircle size={20} className="text-red-500" />
              <span className="text-red-600 font-semibold">Gönderilmedi</span>
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-primary">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            📝 Gönderim Ön İzlemesi
          </h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Başlık:</strong> {news.title}
            </p>
            <p>
              <strong>Özet:</strong> {news.summary}
            </p>
            <p>
              <strong>Kaynak:</strong> {news.source}
            </p>
            <p>
              <strong>Etiketler:</strong> {news.tags.join(", ")}
            </p>
          </div>
          <button
            onClick={() => setShowPreview(false)}
            className="mt-3 text-primary hover:text-primary-dark font-medium"
          >
            Kapat
          </button>
        </div>
      )}
    </div>
  );
}
