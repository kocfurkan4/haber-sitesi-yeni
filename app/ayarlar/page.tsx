"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Save, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [minScore, setMinScore] = useState("5");
  const [newsCount, setNewsCount] = useState("10");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Simulate saving preferences
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center space-x-3">
          <SettingsIcon size={40} className="text-primary" />
          <span>Ayarlar</span>
        </h1>
      </div>

      {/* Settings Card */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          🎯 Haber Görüntüleme Tercihleri
        </h2>

        <div className="space-y-6">
          {/* Minimum Interest Score */}
          <div>
            <label
              htmlFor="min-score"
              className="block text-gray-700 font-semibold mb-3 text-lg"
            >
              Minimum İlgi Puanı
            </label>
            <select
              id="min-score"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-smooth text-gray-900 font-medium cursor-pointer hover:border-gray-400"
            >
              <option value="1">1 - Tüm haberler</option>
              <option value="3">3 - Düşük öncelikli</option>
              <option value="5">5 - Orta öncelikli</option>
              <option value="7">7 - Yüksek öncelikli</option>
              <option value="9">9 - Çok yüksek öncelikli</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Bu değerin altındaki haberler gösterilmeyecek
            </p>
          </div>

          {/* News Count */}
          <div>
            <label
              htmlFor="news-count"
              className="block text-gray-700 font-semibold mb-3 text-lg"
            >
              Gösterilecek Haber Sayısı
            </label>
            <select
              id="news-count"
              value={newsCount}
              onChange={(e) => setNewsCount(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-smooth text-gray-900 font-medium cursor-pointer hover:border-gray-400"
            >
              <option value="5">5 haber</option>
              <option value="10">10 haber</option>
              <option value="20">20 haber</option>
              <option value="50">50 haber</option>
              <option value="100">100 haber</option>
              <option value="all">Tüm haberler</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Sayfa başına gösterilecek haber sayısı
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-4 px-6 rounded-lg transition-smooth flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Save size={20} />
            <span>Tercihleri Kaydet</span>
          </button>

          {/* Success Message */}
          {saved && (
            <div className="bg-green-50 border-2 border-green-500 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2 animate-pulse">
              <span className="text-2xl">✓</span>
              <span className="font-semibold">
                Tercihleriniz başarıyla kaydedildi!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg shadow-sm">
        <div className="flex items-start space-x-3">
          <AlertCircle size={24} className="text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-blue-900 font-bold text-lg mb-1">
              Bilgilendirme
            </h3>
            <p className="text-blue-700">
              Şifrenizi değiştirmek için giriş yapmalısınız. Güvenlik
              ayarlarınız için lütfen{" "}
              <a
                href="/login"
                className="underline font-semibold hover:text-blue-900 transition-smooth"
              >
                giriş yapın
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-gray-900 font-bold mb-2 flex items-center space-x-2">
          <span>ℹ️</span>
          <span>Ayarlar Hakkında</span>
        </h3>
        <ul className="text-gray-600 space-y-2 text-sm">
          <li>• Tercihleriniz tarayıcınızda yerel olarak saklanır</li>
          <li>• İlgi puanı filtreleri anında uygulanır</li>
          <li>• Ayarlarınızı istediğiniz zaman değiştirebilirsiniz</li>
        </ul>
      </div>
    </div>
  );
}
