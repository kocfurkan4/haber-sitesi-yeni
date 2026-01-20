"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Volume2,
  VolumeX,
  Download,
  ExternalLink,
} from "lucide-react";

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // URL'den parametreleri al
  const title = searchParams.get("title") || "";
  const content = searchParams.get("content") || "";
  const source = searchParams.get("source") || "";
  const link = searchParams.get("link") || "";

  useEffect(() => {
    // Eğer başlık veya içerik yoksa ana sayfaya yönlendir
    if (!title || !content) {
      router.push("/");
    }

    // Component unmount olduğunda sesi durdur
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [title, content, router]);

  // Kopyala Fonksiyonu
  const handleCopy = () => {
    const textToCopy = `Başlık: ${title}\n\nKaynak: ${source}\n\nİçerik:\n${content}\n\nBağlantı: ${link}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Sesli Okuma Fonksiyonu (Web Speech API)
  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      alert("Tarayıcınız sesli okuma özelliğini desteklemiyor.");
      return;
    }

    if (isSpeaking) {
      // Sesi durdur
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Yeni konuşma oluştur
    const textToSpeak = `${title}. ${content}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "tr-TR";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Metin İndirme Fonksiyonu
  const handleDownload = () => {
    const textToDownload = `Başlık: ${title}\n\nKaynak: ${source}\n\nİçerik:\n${content}\n\nBağlantı: ${link}`;
    const blob = new Blob([textToDownload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.substring(0, 50)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Geri Al / İleri Al (Placeholder)
  const handleUndo = () => {
    console.log("Geri Al: Bu özellik için state yönetimi gerekiyor");
    alert("Geri Al: Bu özellik için state yönetimi eklenmelidir.");
  };

  const handleRedo = () => {
    console.log("İleri Al: Bu özellik için state yönetimi gerekiyor");
    alert("İleri Al: Bu özellik için state yönetimi eklenmelidir.");
  };

  if (!title || !content) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section with Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900">📰 Haber Ön İzleme</h2>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Geri Al */}
              <button
                onClick={handleUndo}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                title="Geri Al (Placeholder)"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Geri Al</span>
              </button>

              {/* İleri Al */}
              <button
                onClick={handleRedo}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                title="İleri Al (Placeholder)"
              >
                <ArrowRight size={18} />
                <span className="hidden sm:inline">İleri Al</span>
              </button>

              {/* Kopyala */}
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  copySuccess
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
                title="Kopyala"
              >
                <Copy size={18} />
                <span className="hidden sm:inline">
                  {copySuccess ? "Kopyalandı!" : "Kopyala"}
                </span>
              </button>

              {/* Ses Oluştur */}
              <button
                onClick={handleSpeak}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  isSpeaking
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
                title="Sesli Oku"
              >
                {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                <span className="hidden sm:inline">
                  {isSpeaking ? "Durdur" : "Seslendir"}
                </span>
              </button>

              {/* İndir */}
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                title="Metin olarak indir"
              >
                <Download size={18} />
                <span className="hidden sm:inline">İndir</span>
              </button>
            </div>
          </div>
        </div>

        {/* News Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Title */}
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            {title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-semibold">📰 Kaynak:</span>
              <span className="text-blue-600 font-medium">{source}</span>
            </div>

            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                <ExternalLink size={16} />
                Orijinal Habere Git
              </a>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>

          {/* Back Button */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeft size={20} />
              Geri Dön
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong className="text-blue-700">Not:</strong> &quot;Geri Al&quot; ve &quot;İleri
            Al&quot; butonları için state yönetimi (örn: Redux, Zustand) eklenmelidir.
            Şu an sadece placeholder olarak çalışmaktadır.
          </p>
        </div>
      </div>
    </div>
  );
}
