"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Save,
  Copy,
  Volume2,
  Download,
  Play,
  Pause,
  SkipBack,
} from "lucide-react";
import { mockNews } from "@/lib/mockData";
import { useSettings } from "@/contexts/SettingsContext";

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { geminiApiKey, elevenlabsApiKey } = useSettings();
  const audioRef = useRef<HTMLAudioElement>(null);

  const newsId = params.id as string;
  const news = mockNews.find((n) => n.id === newsId);

  const [title, setTitle] = useState(news?.title || "");
  const [summary, setSummary] = useState(news?.summary || "");
  const [content, setContent] = useState(news?.content || "");
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  // History management
  const [history, setHistory] = useState<Array<{title: string, summary: string, content: string}>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const totalCharacters = title.length + summary.length + content.length;
  const totalWords =
    title.split(/\s+/).filter(Boolean).length +
    summary.split(/\s+/).filter(Boolean).length +
    content.split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    if (!news) {
      router.push("/haberler");
    } else {
      // Initialize history with the original news content
      const initialEntry = { title: news.title, summary: news.summary, content: news.content };
      setHistory([initialEntry]);
      setHistoryIndex(0);
    }
  }, [news, router]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => {
        audioRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current?.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [audioUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setAudioTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Add to history when content changes
  const addToHistory = () => {
    const newEntry = { title, summary, content };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newEntry);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setTitle(prevState.title);
      setSummary(prevState.summary);
      setContent(prevState.content);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setTitle(nextState.title);
      setSummary(nextState.summary);
      setContent(nextState.content);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const translateNews = async () => {
    if (!geminiApiKey) {
      alert("Gemini API anahtarı girilmemiş! Lütfen Admin Panel'den ekleyin.");
      return;
    }

    setIsTranslating(true);
    try {
      // Simulated translation - Replace with actual Gemini API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Demo translation
      setTitle("Çevrilmiş Başlık: " + title);
      setSummary("Çevrilmiş Özet: " + summary);
      setContent("Çevrilmiş İçerik: " + content);

      alert("Haber başarıyla çevrildi!");
    } catch (error) {
      alert("Çeviri sırasında hata oluştu!");
    } finally {
      setIsTranslating(false);
    }
  };

  const generateAudio = async () => {
    // Get ElevenLabs keys from localStorage
    const storedKeys = localStorage.getItem("elevenlabsKeys");
    let apiKey = elevenlabsApiKey;

    if (storedKeys) {
      try {
        const keys = JSON.parse(storedKeys);
        if (keys.length > 0) {
          // Select a random key for load balancing
          const randomKey = keys[Math.floor(Math.random() * keys.length)];
          apiKey = randomKey.value;
        }
      } catch (error) {
        console.error("Error parsing ElevenLabs keys:", error);
      }
    }

    if (!apiKey) {
      alert("ElevenLabs API anahtarı girilmemiş! Lütfen Admin Panel'den ekleyin.");
      return;
    }

    console.log("ElevenLabs API Key:", apiKey);

    setIsGeneratingAudio(true);
    try {
      // Combine title, summary, and content for audio
      const textToConvert = `${title}\n\n${summary}\n\n${content}`;

      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textToConvert,
          apiKey: apiKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ses oluşturulamadı");
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);

      alert("Ses başarıyla oluşturuldu!");
    } catch (error: any) {
      console.error("Audio generation error:", error);
      alert("Ses oluşturma sırasında hata oluştu: " + error.message);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const saveChanges = () => {
    // Add to history before saving
    addToHistory();

    // In a real application, you would save to a database here
    // For now, we'll just show a confirmation
    alert("Değişiklikler kaydedildi!");
  };

  const copyToClipboard = () => {
    if (!news) return;

    const formattedText = `Başlık: ${title}

Özet: ${summary}

İçerik: ${content}

Tarih: ${news.date}

Link: ${news.sourceUrl}`;

    navigator.clipboard.writeText(formattedText);
    alert("Panoya kopyalandı!");
  };

  const downloadAudio = () => {
    if (!audioUrl) {
      alert("Önce ses oluşturmanız gerekiyor!");
      return;
    }

    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `${title.substring(0, 50)}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("Ses dosyası indiriliyor!");
    } catch (error) {
      console.error("Download error:", error);
      alert("İndirme sırasında hata oluştu!");
    }
  };

  const copyAudioUrl = () => {
    if (!audioUrl) {
      alert("Önce ses oluşturmanız gerekiyor!");
      return;
    }

    try {
      navigator.clipboard.writeText(audioUrl);
      alert("Ses URL'si panoya kopyalandı!");
    } catch (error) {
      console.error("Copy error:", error);
      alert("Kopyalama sırasında hata oluştu!");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!news) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/haberler")}
            className="flex items-center space-x-2 text-accent-green hover:text-primary transition-smooth font-bold"
          >
            <ArrowLeft size={20} />
            <span>← Haberlere Dön</span>
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-military-600 shadow-xl mb-6">
          <h1 className="text-3xl font-bold text-accent-green mb-4 flex items-center space-x-3">
            <span>📝</span>
            <span>Gönderim Öncesi Ön İzleme</span>
          </h1>

          {/* News Info */}
          <div className="bg-primary/20 rounded-lg p-6 mb-6 border-2 border-primary">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{news.title}</h2>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">📅</span>
                <span className="text-gray-700">
                  <strong>Tarih:</strong> {news.date}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">⭐</span>
                <span className="text-gray-700">
                  <strong>İlgi Puanı:</strong> {news.interestScore}/10
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">📂</span>
                <span className="text-gray-700">
                  <strong>Kategori:</strong> {news.category}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">📰</span>
                <span className="text-gray-700">
                  <strong>Kaynak:</strong> {news.source}
                </span>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Title Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-800">* BAŞLIK</h3>
              </div>
              <textarea
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  addToHistory();
                }}
                className="w-full bg-military-900 border-2 border-military-600 rounded-lg p-4 text-gray-900 min-h-[80px] focus:ring-2 focus:ring-accent-green focus:border-accent-green transition-smooth"
                placeholder="Haber başlığı..."
              />
            </div>

            {/* Summary Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-800">* ÖZET</h3>
              </div>
              <textarea
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  addToHistory();
                }}
                className="w-full bg-military-900 border-2 border-military-600 rounded-lg p-4 text-gray-900 min-h-[120px] focus:ring-2 focus:ring-accent-green focus:border-accent-green transition-smooth"
                placeholder="Haber özeti..."
              />
            </div>

            {/* Content Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-800">* İÇERİK</h3>
              </div>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  addToHistory();
                }}
                className="w-full bg-military-900 border-2 border-military-600 rounded-lg p-4 text-gray-900 min-h-[300px] focus:ring-2 focus:ring-accent-green focus:border-accent-green transition-smooth"
                placeholder="Haber içeriği..."
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 bg-military-900 rounded-lg p-6 border border-military-600">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-accent-blue mb-2">{totalCharacters}</div>
                <div className="text-gray-700 font-medium">Toplam Karakter</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent-green mb-2">{totalWords}</div>
                <div className="text-gray-700 font-medium">Toplam Kelime</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="flex items-center justify-center space-x-2 bg-accent-yellow hover:bg-accent-yellow/80 text-gray-900 px-4 py-3 rounded-lg font-bold transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo2 size={18} />
              <span>Geri Al</span>
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="flex items-center justify-center space-x-2 bg-accent-blue hover:bg-accent-blue/80 text-white px-4 py-3 rounded-lg font-bold transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Redo2 size={18} />
              <span>İleri Al</span>
            </button>
            <button
              onClick={saveChanges}
              className="flex items-center justify-center space-x-2 bg-accent-green hover:bg-accent-green/80 text-white px-4 py-3 rounded-lg font-bold transition-smooth"
            >
              <Save size={18} />
              <span>Kaydet</span>
            </button>
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-bold transition-smooth"
            >
              <Copy size={18} />
              <span>Kopyala</span>
            </button>
            <button
              onClick={generateAudio}
              disabled={isGeneratingAudio}
              className="flex items-center justify-center space-x-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-3 rounded-lg font-bold transition-smooth disabled:opacity-50"
            >
              <Volume2 size={18} />
              <span>{isGeneratingAudio ? "Oluşturuluyor..." : "Ses Oluştur"}</span>
            </button>
            <button
              onClick={downloadAudio}
              disabled={!audioUrl}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-bold transition-smooth disabled:opacity-50"
            >
              <Download size={18} />
              <span>Sesi İndir</span>
            </button>
            <button
              onClick={copyAudioUrl}
              disabled={!audioUrl}
              className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-bold transition-smooth disabled:opacity-50"
            >
              <Copy size={18} />
              <span>Ses URL Kopyala</span>
            </button>
          </div>

          {/* Audio Player */}
          {audioUrl && (
            <div className="mt-6 bg-military-900 rounded-lg p-6 border border-military-600">
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-purple-500">🎵</span>
                <h3 className="text-lg font-bold text-gray-800">Audio Player</h3>
              </div>

              <audio ref={audioRef} src={audioUrl} className="hidden" />

              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlayPause}
                  className="bg-accent-green hover:bg-accent-green/80 text-white p-3 rounded-full transition-smooth"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                <button
                  onClick={handleRestart}
                  className="bg-accent-yellow hover:bg-accent-yellow/80 text-gray-900 p-3 rounded-full transition-smooth"
                >
                  <SkipBack size={24} />
                </button>

                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max={audioDuration || 100}
                    value={audioTime}
                    onChange={(e) => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Number(e.target.value);
                      }
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>{formatTime(audioTime)}</span>
                    <span>{formatTime(audioDuration)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center text-gray-600 text-sm">
          Piyade Haberleri Projesi © 2025
        </div>
      </div>
    </div>
  );
}
