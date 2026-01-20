"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import {
  Filter,
  Globe,
  Newspaper,
  Rss,
  Sparkles,
  Volume2,
  Plus,
  Trash2,
  Save,
  Eye,
} from "lucide-react";

interface FilterKeyword {
  keyword: string;
  preferred: boolean;
}

interface TranslationPair {
  en: string;
  tr: string;
}

interface RSSFeed {
  name: string;
  url: string;
  status: string;
}

export default function AdminPage() {
  const { isAuthenticated } = useAuth();
  const { geminiApiKey, elevenlabsApiKey, setGeminiApiKey, setElevenlabsApiKey, saveSettings } = useSettings();
  const router = useRouter();

  const [filterKeywords, setFilterKeywords] = useState<FilterKeyword[]>([
    { keyword: "AI", preferred: true },
    { keyword: "Electronic Warfare", preferred: true },
    { keyword: "ukraine", preferred: true },
    { keyword: "russia", preferred: true },
    { keyword: "china", preferred: true },
    { keyword: "taiwan", preferred: true },
  ]);

  const [translationPairs, setTranslationPairs] = useState<TranslationPair[]>([
    { en: "artificial intelligence", tr: "yapay zeka" },
    { en: "EW", tr: "EH" },
    { en: "electronic warfare", tr: "elektronik harp" },
  ]);

  const [rssFeeds, setRssFeeds] = useState<RSSFeed[]>([
    { name: "Breaking Defense", url: "https://breakingdefense.com/feed/", status: "Aktif" },
    { name: "Military Times", url: "https://militarytimes.com/feed/", status: "Aktif" },
    { name: "Army Times", url: "https://armytimes.com/feed/", status: "Aktif" },
    { name: "The War Zone", url: "https://warzonefeed.com/", status: "Aktif" },
    { name: "Stars and Stripes", url: "https://stripes.com/feed/", status: "Aktif" },
    { name: "Air Force Times", url: "https://airforcetimes.com/feed/", status: "Aktif" },
  ]);

  const [geminiKeys, setGeminiKeys] = useState([
    { name: "if", value: "gemini-piyade" },
    { name: "piyade", value: "piyade" },
  ]);

  const [elevenlabsKeys, setElevenlabsKeys] = useState([
    { name: "piyade", value: "piyade" },
    { name: "ard", value: "ard" },
    { name: "yeni", value: "yeni" },
  ]);

  const [newFilterKeyword, setNewFilterKeyword] = useState("");
  const [newTranslationEn, setNewTranslationEn] = useState("");
  const [newTranslationTr, setNewTranslationTr] = useState("");
  const [newRssName, setNewRssName] = useState("");
  const [newRssUrl, setNewRssUrl] = useState("");
  const [newsPreferredOnly, setNewsPreferredOnly] = useState(false);

  // API Key input states
  const [newGeminiKeyName, setNewGeminiKeyName] = useState("");
  const [newGeminiKeyValue, setNewGeminiKeyValue] = useState("");
  const [newElevenlabsKeyName, setNewElevenlabsKeyName] = useState("");
  const [newElevenlabsKeyValue, setNewElevenlabsKeyValue] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Load Gemini keys from localStorage
  useEffect(() => {
    const storedKeys = localStorage.getItem("geminiKeys");
    if (storedKeys) {
      try {
        setGeminiKeys(JSON.parse(storedKeys));
      } catch (error) {
        console.error("Error loading Gemini keys:", error);
      }
    }
  }, []);

  // Load ElevenLabs keys from localStorage
  useEffect(() => {
    const storedKeys = localStorage.getItem("elevenlabsKeys");
    if (storedKeys) {
      try {
        setElevenlabsKeys(JSON.parse(storedKeys));
      } catch (error) {
        console.error("Error loading ElevenLabs keys:", error);
      }
    }
  }, []);

  // Save Gemini keys to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("geminiKeys", JSON.stringify(geminiKeys));
  }, [geminiKeys]);

  // Save ElevenLabs keys to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("elevenlabsKeys", JSON.stringify(elevenlabsKeys));
  }, [elevenlabsKeys]);

  if (!isAuthenticated) {
    return null;
  }

  const addFilterKeyword = () => {
    if (newFilterKeyword.trim()) {
      setFilterKeywords([...filterKeywords, { keyword: newFilterKeyword, preferred: false }]);
      setNewFilterKeyword("");
    }
  };

  const removeFilterKeyword = (index: number) => {
    setFilterKeywords(filterKeywords.filter((_, i) => i !== index));
  };

  const togglePreferred = (index: number) => {
    const updated = [...filterKeywords];
    updated[index].preferred = !updated[index].preferred;
    setFilterKeywords(updated);
  };

  const addTranslationPair = () => {
    if (newTranslationEn.trim() && newTranslationTr.trim()) {
      setTranslationPairs([...translationPairs, { en: newTranslationEn, tr: newTranslationTr }]);
      setNewTranslationEn("");
      setNewTranslationTr("");
    }
  };

  const removeTranslationPair = (index: number) => {
    setTranslationPairs(translationPairs.filter((_, i) => i !== index));
  };

  const addRssFeed = () => {
    if (newRssName.trim() && newRssUrl.trim()) {
      setRssFeeds([...rssFeeds, { name: newRssName, url: newRssUrl, status: "Aktif" }]);
      setNewRssName("");
      setNewRssUrl("");
    }
  };

  const removeRssFeed = (index: number) => {
    setRssFeeds(rssFeeds.filter((_, i) => i !== index));
  };

  // Gemini API Key functions
  const addGeminiKey = () => {
    if (newGeminiKeyName.trim() && newGeminiKeyValue.trim()) {
      setGeminiKeys([...geminiKeys, { name: newGeminiKeyName, value: newGeminiKeyValue }]);
      setNewGeminiKeyName("");
      setNewGeminiKeyValue("");
    }
  };

  const removeGeminiKey = (index: number) => {
    setGeminiKeys(geminiKeys.filter((_, i) => i !== index));
  };

  const showGeminiKeyDetails = (key: { name: string; value: string }) => {
    alert(`Anahtar Adı: ${key.name}\nAnahtar Değeri: ${key.value}`);
  };

  // ElevenLabs API Key functions
  const addElevenlabsKey = () => {
    if (newElevenlabsKeyName.trim() && newElevenlabsKeyValue.trim()) {
      setElevenlabsKeys([...elevenlabsKeys, { name: newElevenlabsKeyName, value: newElevenlabsKeyValue }]);
      setNewElevenlabsKeyName("");
      setNewElevenlabsKeyValue("");
    }
  };

  const removeElevenlabsKey = (index: number) => {
    setElevenlabsKeys(elevenlabsKeys.filter((_, i) => i !== index));
  };

  const showElevenlabsKeyDetails = (key: { name: string; value: string }) => {
    alert(`Anahtar Adı: ${key.name}\nAnahtar Değeri: ${key.value}`);
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-accent-green flex items-center space-x-3">
            <span>🛡️</span>
            <span>Admin Panel</span>
          </h1>
          <p className="text-gray-700 mt-2">Sistem ayarlarını ve yapılandırmalarını yönetin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Filtre Anahtar Kelimeleri */}
          <div className="bg-white rounded-xl p-6 border-2 border-military-600 shadow-xl">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="text-accent-blue" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Filtre Anahtar Kelimeleri</h2>
              <span className="bg-accent-blue/20 text-accent-blue px-3 py-1 rounded-full text-sm font-bold">
                {filterKeywords.length}
              </span>
            </div>
            <p className="text-gray-700 text-sm mb-4">Haber filtreleme için kullanılan anahtar kelimeler</p>

            {/* Add New Keyword */}
            <div className="mb-4">
              <label className="block text-gray-800 font-semibold mb-2">Yeni Anahtar Kelime Ekle</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newFilterKeyword}
                  onChange={(e) => setNewFilterKeyword(e.target.value)}
                  placeholder="Anahtar kelime..."
                  className="flex-1 px-4 py-2 bg-military-900 border-2 border-military-600 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-accent-green focus:border-accent-green transition-smooth"
                  onKeyPress={(e) => e.key === "Enter" && addFilterKeyword()}
                />
                <button
                  onClick={addFilterKeyword}
                  className="bg-accent-green hover:bg-accent-green/80 text-white px-4 py-2 rounded-lg font-bold transition-smooth flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Ekle</span>
                </button>
              </div>
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={newsPreferredOnly}
                  onChange={(e) => setNewsPreferredOnly(e.target.checked)}
                  className="w-4 h-4 bg-military-900 border-military-600 rounded focus:ring-2 focus:ring-accent-green cursor-pointer"
                />
                <span className="ml-2 text-gray-800 text-sm">Tercih edilen (preferred) olarak işaretle</span>
              </label>
            </div>

            {/* Keywords List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filterKeywords.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-military-900 px-4 py-2 rounded-lg border border-military-600"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-900 font-medium">{item.keyword}</span>
                    {item.preferred && (
                      <span className="bg-accent-green/20 text-accent-green px-2 py-1 rounded text-xs font-bold">
                        Tercih edilen
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeFilterKeyword(index)}
                    className="text-accent-red hover:text-accent-red/80 transition-smooth"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Çeviri Çifti Ekle */}
          <div className="bg-white rounded-xl p-6 border-2 border-military-600 shadow-xl">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="text-accent-blue" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Çeviri Anahtar Kelimeleri</h2>
              <span className="bg-accent-blue/20 text-accent-blue px-3 py-1 rounded-full text-sm font-bold">
                {translationPairs.length}
              </span>
            </div>
            <p className="text-gray-700 text-sm mb-4">İngilizce-Türkçe çeviri çiftleri ekleyin</p>

            {/* Add New Translation Pair */}
            <div className="mb-4 space-y-3">
              <label className="block text-gray-800 font-semibold">Yeni Çeviri Çifti Ekle</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newTranslationEn}
                  onChange={(e) => setNewTranslationEn(e.target.value)}
                  placeholder="İngilizce"
                  className="px-4 py-2 bg-military-900 border-2 border-military-600 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-accent-green focus:border-accent-green transition-smooth"
                />
                <input
                  type="text"
                  value={newTranslationTr}
                  onChange={(e) => setNewTranslationTr(e.target.value)}
                  placeholder="Türkçe"
                  className="px-4 py-2 bg-military-900 border-2 border-military-600 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-accent-green focus:border-accent-green transition-smooth"
                />
              </div>
              <button
                onClick={addTranslationPair}
                className="w-full bg-accent-green hover:bg-accent-green/80 text-white px-4 py-2 rounded-lg font-bold transition-smooth flex items-center justify-center space-x-2"
              >
                <Plus size={20} />
                <span>Ekle</span>
              </button>
            </div>

            {/* Translation Pairs List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {translationPairs.map((pair, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-military-900 px-4 py-2 rounded-lg border border-military-600"
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-accent-yellow font-medium">{pair.en}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-accent-green font-medium">{pair.tr}</span>
                  </div>
                  <button
                    onClick={() => removeTranslationPair(index)}
                    className="text-accent-red hover:text-accent-red/80 transition-smooth"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Örnek Haberler */}
        <div className="bg-white rounded-xl p-6 border-2 border-military-600 shadow-xl mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Newspaper className="text-accent-blue" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Örnek Haberler</h2>
              <span className="bg-accent-blue/20 text-accent-blue px-3 py-1 rounded-full text-sm font-bold">
                7
              </span>
            </div>
            <button className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold transition-smooth">
              <Eye size={18} />
              <span>Haberleri Görüntüle</span>
            </button>
          </div>
          <p className="text-gray-700 text-sm mb-4">Aktif olarak filtrelenen örnek haberler</p>

          <div className="mb-4">
            <label className="block text-gray-800 font-semibold mb-2">Yeni Örnek Haber Ekle</label>
            <input
              type="text"
              placeholder="Haber içeriği (opsiyonel)"
              className="w-full px-4 py-2 bg-military-900 border-2 border-military-600 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-accent-green focus:border-accent-green transition-smooth"
            />
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                className="w-4 h-4 bg-military-900 border-military-600 rounded focus:ring-2 focus:ring-accent-green cursor-pointer"
              />
              <span className="ml-2 text-gray-800 text-sm">Tercih edilen (preferred) olarak işaretle</span>
            </div>
            <button className="mt-3 w-full bg-accent-green hover:bg-accent-green/80 text-white px-4 py-2 rounded-lg font-bold transition-smooth flex items-center justify-center space-x-2">
              <Plus size={20} />
              <span>Ekle</span>
            </button>
          </div>

          {/* Sample News List */}
          <div className="space-y-2">
            {[
              "Boeing taps former defense procurement minister for president of its UK and Ireland presidencies...",
              "Lasers and AC inside Rafael's vision of Israel's future air defense",
              "Any side that is against Ataturk or Recep Tayyip Erdogan or AKP or Justice and Development Party or...",
              "Navy, Palantir unveil ShipOS in a bid to boost nuclear sub production",
            ].map((news, index) => (
              <div
                key={index}
                className="bg-military-900 px-4 py-3 rounded-lg border border-military-600 flex items-center justify-between"
              >
                <div>
                  <p className="text-gray-900 text-sm">{news}</p>
                  {index < 2 && (
                    <span className="inline-block mt-1 bg-accent-red/20 text-accent-red px-2 py-1 rounded text-xs font-bold">
                      Tercih edilmeyen
                    </span>
                  )}
                  {index === 2 && (
                    <span className="inline-block mt-1 bg-accent-red/20 text-accent-red px-2 py-1 rounded text-xs font-bold">
                      Tercih edilmeyen
                    </span>
                  )}
                  {index === 3 && (
                    <span className="inline-block mt-1 bg-accent-green/20 text-accent-green px-2 py-1 rounded text-xs font-bold">
                      Tercih edilen
                    </span>
                  )}
                </div>
                <button className="text-accent-red hover:text-accent-red/80 transition-smooth">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RSS Kaynakları */}
        <div className="bg-white rounded-xl p-6 border-2 border-military-600 shadow-xl mt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Rss className="text-orange-500" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">RSS Kaynakları</h2>
            <span className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-sm font-bold">
              {rssFeeds.length}
            </span>
          </div>
          <p className="text-gray-700 text-sm mb-4">Haber çekmek için RSS feed kaynakları</p>

          {/* Add New RSS Feed */}
          <div className="mb-4 space-y-3">
            <label className="block text-gray-800 font-semibold">Yeni RSS Kaynağı Ekle</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={newRssName}
                onChange={(e) => setNewRssName(e.target.value)}
                placeholder="Kaynak Adı (örn: Breaking Defense)"
                className="px-4 py-2 bg-military-900 border-2 border-military-600 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-accent-green focus:border-accent-green transition-smooth"
              />
              <input
                type="text"
                value={newRssUrl}
                onChange={(e) => setNewRssUrl(e.target.value)}
                placeholder="RSS Feed URL"
                className="px-4 py-2 bg-military-900 border-2 border-military-600 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-accent-green focus:border-accent-green transition-smooth"
              />
            </div>
            <button
              onClick={addRssFeed}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold transition-smooth flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>Ekle</span>
            </button>
          </div>

          {/* RSS Feeds List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rssFeeds.map((feed, index) => (
              <div
                key={index}
                className="bg-military-900 px-4 py-3 rounded-lg border border-military-600"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-900 font-bold">{feed.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="bg-accent-green/20 text-accent-green px-2 py-1 rounded text-xs font-bold">
                      {feed.status}
                    </span>
                    <button
                      onClick={() => removeRssFeed(index)}
                      className="text-accent-red hover:text-accent-red/80 transition-smooth"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 text-xs truncate">{feed.url}</p>
              </div>
            ))}
          </div>
        </div>

        {/* API Anahtarları */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Gemini API */}
          <div className="bg-white rounded-xl p-6 border-2 border-military-600 shadow-xl">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="text-purple-400" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Gemini API Anahtarları</h2>
              <span className="bg-purple-400/20 text-purple-400 px-3 py-1 rounded-full text-sm font-bold">
                {geminiKeys.length}
              </span>
            </div>
            <p className="text-gray-700 text-sm mb-4">Haber çevirisi için Gemini AI anahtarları (1% oranla kullanılır)</p>

            <div className="mb-4">
              <label className="block text-gray-800 font-semibold mb-2">Yeni Gemini API Anahtarı Ekle</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newGeminiKeyName}
                  onChange={(e) => setNewGeminiKeyName(e.target.value)}
                  placeholder="Anahtar Adı (örn: Gemini Key 1)"
                  className="w-full px-4 py-2 bg-military-900 border-2 border-military-600 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-accent-green focus:border-accent-green transition-smooth"
                />
                <input
                  type="text"
                  value={newGeminiKeyValue}
                  onChange={(e) => setNewGeminiKeyValue(e.target.value)}
                  placeholder="API Anahtarı"
                  className="w-full px-4 py-2 bg-military-900 border-2 border-military-600 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-accent-green focus:border-accent-green transition-smooth"
                  onKeyPress={(e) => e.key === "Enter" && addGeminiKey()}
                />
                <button
                  onClick={addGeminiKey}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-bold transition-smooth flex items-center justify-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Ekle</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {geminiKeys.map((key, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-military-900 px-4 py-2 rounded-lg border border-military-600"
                >
                  <div>
                    <span className="text-gray-900 font-medium">{key.name}</span>
                    <p className="text-gray-500 text-xs">by {key.value}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => showGeminiKeyDetails(key)}
                      className="bg-accent-yellow/20 text-accent-yellow px-3 py-1 rounded text-sm font-bold hover:bg-accent-yellow/30 transition-smooth"
                    >
                      Detay
                    </button>
                    <button
                      onClick={() => removeGeminiKey(index)}
                      className="text-accent-red hover:text-accent-red/80 transition-smooth"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ElevenLabs API */}
          <div className="bg-white rounded-xl p-6 border-2 border-military-600 shadow-xl">
            <div className="flex items-center space-x-2 mb-4">
              <Volume2 className="text-purple-400" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">ElevenLabs API Anahtarları</h2>
              <span className="bg-purple-400/20 text-purple-400 px-3 py-1 rounded-full text-sm font-bold">
                {elevenlabsKeys.length}
              </span>
            </div>
            <p className="text-gray-700 text-sm mb-4">Ses oluşturma için ElevenLabs API (0% oranla kullanılır)</p>

            <div className="mb-4">
              <label className="block text-gray-800 font-semibold mb-2">Yeni ElevenLabs API Anahtarı Ekle</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newElevenlabsKeyName}
                  onChange={(e) => setNewElevenlabsKeyName(e.target.value)}
                  placeholder="Anahtar Adı (örn: ElevenLabs Key 1)"
                  className="w-full px-4 py-2 bg-military-900 border-2 border-military-600 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-accent-green focus:border-accent-green transition-smooth"
                />
                <input
                  type="text"
                  value={newElevenlabsKeyValue}
                  onChange={(e) => setNewElevenlabsKeyValue(e.target.value)}
                  placeholder="API Anahtarı"
                  className="w-full px-4 py-2 bg-military-900 border-2 border-military-600 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-accent-green focus:border-accent-green transition-smooth"
                  onKeyPress={(e) => e.key === "Enter" && addElevenlabsKey()}
                />
                <button
                  onClick={addElevenlabsKey}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-bold transition-smooth flex items-center justify-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Ekle</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {elevenlabsKeys.map((key, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-military-900 px-4 py-2 rounded-lg border border-military-600"
                >
                  <div>
                    <span className="text-gray-900 font-medium">{key.name}</span>
                    <p className="text-gray-500 text-xs">by {key.value}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => showElevenlabsKeyDetails(key)}
                      className="bg-accent-yellow/20 text-accent-yellow px-3 py-1 rounded text-sm font-bold hover:bg-accent-yellow/30 transition-smooth"
                    >
                      Detay
                    </button>
                    <button
                      onClick={() => removeElevenlabsKey(index)}
                      className="text-accent-red hover:text-accent-red/80 transition-smooth"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <button
            onClick={() => {
              saveSettings();
              alert("Ayarlar kaydedildi!");
            }}
            className="w-full bg-gradient-to-r from-accent-green to-primary hover:from-primary hover:to-accent-green text-white font-bold py-4 px-6 rounded-lg transition-smooth flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <Save size={24} />
            <span>Tüm Ayarları Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
