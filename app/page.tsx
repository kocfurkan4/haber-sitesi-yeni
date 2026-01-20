import Link from "next/link";
import { Newspaper, Settings, LogIn, TrendingUp, Clock, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary-dark to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              💻 Teknoloji Haberleri
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              En güncel teknoloji haberlerini takip edin. Yapay zeka, yazılım, donanım ve daha fazlası...
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/haberler"
                className="bg-white text-primary hover:bg-blue-50 font-bold py-4 px-8 rounded-lg transition-smooth shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
              >
                <Newspaper size={24} />
                <span>Haberleri Görüntüle</span>
              </Link>
              <Link
                href="/login"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-bold py-4 px-8 rounded-lg transition-smooth flex items-center space-x-2"
              >
                <LogIn size={24} />
                <span>Giriş Yap</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Öne Çıkan Özellikler
          </h2>
          <p className="text-xl text-gray-600">
            Teknoloji dünyasını takip etmenin en kolay yolu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-smooth border-t-4 border-primary">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <TrendingUp size={40} className="text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              Güncel Haberler
            </h3>
            <p className="text-gray-600 text-center">
              Teknoloji dünyasındaki en son gelişmeleri anında takip edin. Yapay zeka, yazılım, donanım ve daha fazlası.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-smooth border-t-4 border-green-500">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <Star size={40} className="text-green-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              İlgi Puanlaması
            </h3>
            <p className="text-gray-600 text-center">
              Her haber için özel ilgi puanı sistemi. En önemli haberleri kolayca ayırt edin.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-smooth border-t-4 border-purple-500">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 p-4 rounded-full">
                <Settings size={40} className="text-purple-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              Kişiselleştirme
            </h3>
            <p className="text-gray-600 text-center">
              Haber akışınızı tercihlerinize göre özelleştirin. Minimum puan ve görüntüleme sayısı ayarlayın.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">8+</div>
              <div className="text-xl text-blue-200">Güncel Haber</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">10/10</div>
              <div className="text-xl text-blue-200">Maksimum İlgi Puanı</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">7</div>
              <div className="text-xl text-blue-200">Farklı Kategori</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl p-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Hemen Başlayın
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Teknoloji dünyasındaki en güncel haberlere hemen erişin ve tercihlerinize göre özelleştirin.
          </p>
          <Link
            href="/haberler"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-4 px-8 rounded-lg transition-smooth shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Newspaper size={24} />
            <span>Haberleri Keşfet</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
