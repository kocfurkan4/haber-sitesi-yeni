"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Copy,
  Volume2,
  Download,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface NewsState {
  title: string;
  content: string;
  summary: string;
  source: string;
  link: string;
  date: string;
}

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initial state from URL params
  const initialState: NewsState = {
    title: searchParams.get("title") || "",
    content: searchParams.get("content") || "",
    summary: "",
    source: searchParams.get("source") || "",
    link: searchParams.get("link") || "",
    date: searchParams.get("date") || "",
  };

  // State management with history for undo/redo
  const [history, setHistory] = useState<NewsState[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentState, setCurrentState] = useState<NewsState>(initialState);

  // UI states
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Refs to prevent duplicate history entries
  const isUpdatingFromHistory = useRef(false);

  useEffect(() => {
    // Redirect if no data
    if (!initialState.title || !initialState.content) {
      router.push("/haberler");
    }
  }, [initialState.title, initialState.content, router]);

  // Add to history when state changes (but not from undo/redo)
  const addToHistory = (newState: NewsState) => {
    if (isUpdatingFromHistory.current) {
      isUpdatingFromHistory.current = false;
      return;
    }

    // Remove any "future" history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Update field and add to history
  const updateField = (field: keyof NewsState, value: string) => {
    const newState = { ...currentState, [field]: value };
    setCurrentState(newState);
    addToHistory(newState);
  };

  // Undo functionality
  const handleUndo = () => {
    if (historyIndex > 0) {
      isUpdatingFromHistory.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentState(history[newIndex]);
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUpdatingFromHistory.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentState(history[newIndex]);
    }
  };

  // Copy to clipboard with new format
  const handleCopy = () => {
    const textToCopy = `Başlık: ${currentState.title}

Özet: ${currentState.summary || "(Özet henüz oluşturulmadı)"}

İçerik: ${currentState.content}

Tarih: ${currentState.date || ""}

Link: ${currentState.link}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Generate summary using Gemini API
  const generateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const apiKey = localStorage.getItem("gemini_api_key");
      if (!apiKey) {
        alert("Gemini API anahtarı bulunamadı! Lütfen Admin panelinden API anahtarını girin.");
        setIsGeneratingSummary(false);
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Lütfen aşağıdaki haberin kısa bir özetini çıkar (maksimum 2-3 cümle):\n\n${currentState.content}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Gemini API hatası");
      }

      const data = await response.json();
      const summary = data.candidates[0]?.content?.parts[0]?.text || "";

      updateField("summary", summary);
    } catch (error) {
      console.error("Özet oluşturma hatası:", error);
      alert("Özet oluşturulurken bir hata oluştu!");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Generate speech using ElevenLabs API and auto-download
  const generateSpeech = async () => {
    if (!currentState.summary) {
      alert("Önce özet oluşturmanız gerekiyor!");
      return;
    }

    setIsGeneratingSpeech(true);
    try {
      // Get ElevenLabs API keys from localStorage
      const keysString = localStorage.getItem("elevenlabsKeys");
      let apiKey = "";

      if (keysString) {
        try {
          const keys = JSON.parse(keysString);
          if (Array.isArray(keys) && keys.length > 0) {
            apiKey = keys[0].value; // Use first key
          }
        } catch (e) {
          console.error("Error parsing ElevenLabs keys:", e);
        }
      }

      if (!apiKey) {
        alert("ElevenLabs API anahtarı bulunamadı! Lütfen Admin panelinden API anahtarını girin.");
        setIsGeneratingSpeech(false);
        return;
      }

      // Using default voice ID for Turkish (you can make this configurable)
      const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice (clear, neutral)

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify({
            text: currentState.summary,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("ElevenLabs API hatası");
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Auto-download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentState.title.substring(0, 50)}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Ses oluşturma hatası:", error);
      alert("Ses oluşturulurken bir hata oluştu!");
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  // Manual download of generated audio
  const handleDownloadAudio = () => {
    if (!audioUrl) {
      alert("Önce ses oluşturmanız gerekiyor!");
      return;
    }

    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `${currentState.title.substring(0, 50)}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!initialState.title || !initialState.content) {
    return null;
  }

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              📰 Gönderim Öncesi Ön İzleme
            </h2>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Geri Al */}
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  canUndo
                    ? "bg-gray-700 hover:bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                title="Geri Al"
              >
                <Undo2 size={18} />
                <span className="hidden sm:inline">Geri Al</span>
              </button>

              {/* İleri Al */}
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  canRedo
                    ? "bg-gray-700 hover:bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                title="İleri Al"
              >
                <Redo2 size={18} />
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
                {copySuccess ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                <span className="hidden sm:inline">
                  {copySuccess ? "Kopyalandı!" : "Kopyala"}
                </span>
              </button>

              {/* Ses Oluştur */}
              <button
                onClick={generateSpeech}
                disabled={isGeneratingSpeech || !currentState.summary}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  isGeneratingSpeech || !currentState.summary
                    ? "bg-purple-300 text-white cursor-not-allowed"
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
                title="Ses Oluştur (ElevenLabs)"
              >
                <Volume2 size={18} />
                <span className="hidden sm:inline">
                  {isGeneratingSpeech ? "Oluşturuluyor..." : "Ses Oluştur"}
                </span>
              </button>

              {/* Ses İndir */}
              <button
                onClick={handleDownloadAudio}
                disabled={!audioUrl}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  audioUrl
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                title="Sesi İndir"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Ses İndir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Editable News Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Source */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📰 Haber Kaynağı
            </label>
            <input
              type="text"
              value={currentState.source}
              onChange={(e) => updateField("source", e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Kaynak adı"
            />
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Başlık
            </label>
            <textarea
              value={currentState.title}
              onChange={(e) => updateField("title", e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-xl font-bold resize-none"
              placeholder="Haber başlığı"
            />
          </div>

          {/* Summary with Generate Button */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                ✨ Özet
              </label>
              <button
                onClick={generateSummary}
                disabled={isGeneratingSummary}
                className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-colors font-medium ${
                  isGeneratingSummary
                    ? "bg-indigo-300 text-white cursor-not-allowed"
                    : "bg-indigo-500 hover:bg-indigo-600 text-white"
                }`}
              >
                <Sparkles size={16} />
                {isGeneratingSummary ? "Oluşturuluyor..." : "Gemini ile Özet Oluştur"}
              </button>
            </div>
            <textarea
              value={currentState.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"
              placeholder="Haber özeti (Gemini ile oluşturabilirsiniz)"
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📄 İçerik
            </label>
            <textarea
              value={currentState.content}
              onChange={(e) => updateField("content", e.target.value)}
              rows={12}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-y"
              placeholder="Haber içeriği"
            />
          </div>

          {/* Date */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📅 Tarih
            </label>
            <input
              type="text"
              value={currentState.date}
              onChange={(e) => updateField("date", e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Haber tarihi ve saati (ör: 2024-01-20 14:30)"
            />
          </div>

          {/* Link */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔗 Link
            </label>
            <input
              type="text"
              value={currentState.link}
              onChange={(e) => updateField("link", e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Haber linki"
            />
          </div>

          {/* Back Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeft size={20} />
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
