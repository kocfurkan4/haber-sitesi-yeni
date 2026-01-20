"use client";

import { NewsItem } from "@/lib/mockData";
import { ExternalLink, Eye, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface NewsCardProps {
  news: NewsItem;
}

export default function NewsCard({ news }: NewsCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      AI: "bg-purple-500",
      Hardware: "bg-accent-blue",
      Computing: "bg-accent-green",
      Automotive: "bg-accent-red",
      Social: "bg-pink-500",
      Software: "bg-indigo-500",
      Network: "bg-accent-yellow",
      Entertainment: "bg-orange-500",
    };
    return colors[category] || "bg-gray-500";
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return "bg-accent-green";
    if (score >= 7) return "bg-accent-blue";
    if (score >= 5) return "bg-accent-yellow";
    return "bg-gray-500";
  };

  return (
    <div className="bg-military-800 rounded-xl shadow-lg hover:shadow-2xl transition-smooth p-6 border-2 border-military-700">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-gray-200 flex-1 pr-4">
          {news.title}
        </h2>
        <div className="flex flex-col items-end space-y-2">
          <span
            className={`${getScoreColor(
              news.interestScore
            )} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md`}
          >
            {news.interestScore}/10
          </span>
          <span
            className={`${getCategoryColor(
              news.category
            )} text-white px-3 py-1 rounded-full text-xs font-medium shadow-md`}
          >
            {news.category}
          </span>
        </div>
      </div>

      {/* Meta Information */}
      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
        <span className="font-medium">{news.source}</span>
        <span>•</span>
        <span>{news.date}</span>
      </div>

      {/* Summary */}
      <p className="text-gray-400 italic mb-4 leading-relaxed">{news.summary}</p>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-300 leading-relaxed">{news.content}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {news.tags.map((tag, index) => (
          <span
            key={index}
            className="bg-military-700 text-accent-green px-3 py-1 rounded-md text-sm font-medium hover:bg-military-600 border border-military-600 transition-smooth"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t-2 border-military-700">
        <div className="flex flex-wrap gap-3">
          <a
            href={news.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-accent-green hover:text-accent-yellow transition-smooth font-medium"
          >
            <ExternalLink size={18} />
            <span>🔗 Haberin Kaynağına Git</span>
          </a>
          <Link
            href={`/preview/${news.id}`}
            className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-smooth font-medium shadow-md hover:shadow-lg"
          >
            <Eye size={18} />
            <span>📝 Gönderim Öncesi Ön İzleme</span>
          </Link>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2">
          {news.isSent ? (
            <>
              <CheckCircle size={20} className="text-accent-green" />
              <span className="text-accent-green font-semibold">✓ Gönderildi</span>
            </>
          ) : (
            <>
              <XCircle size={20} className="text-accent-red" />
              <span className="text-accent-red font-semibold">✗ Gönderilmedi</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
