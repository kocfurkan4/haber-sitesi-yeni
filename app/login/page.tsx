"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, User, Lock, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const success = login(username, password);
    if (success) {
      router.push("/admin");
    } else {
      setError("Kullanıcı adı veya şifre hatalı!");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-military-900 via-military-800 to-military-700">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-military-600">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-green to-primary rounded-full mb-4 shadow-lg">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-accent-green mb-2">
              Admin Girişi
            </h1>
            <p className="text-gray-700">
              Yönetim paneline erişmek için giriş yapın
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-accent-red/20 border-2 border-accent-red text-accent-red px-4 py-3 rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-gray-800 font-semibold mb-2"
              >
                Kullanıcı Adı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={20} className="text-gray-500" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-3 bg-military-900 border-2 border-military-600 rounded-lg focus:ring-2 focus:ring-accent-green focus:border-accent-green transition-smooth text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-gray-800 font-semibold mb-2"
              >
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-military-900 border-2 border-military-600 rounded-lg focus:ring-2 focus:ring-accent-green focus:border-accent-green transition-smooth text-gray-900 placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-accent-green transition-smooth"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 bg-military-900 border-military-600 rounded focus:ring-2 focus:ring-accent-green cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-3 text-gray-800 font-medium cursor-pointer select-none"
              >
                30 gün boyunca oturumu açık tut
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-accent-green to-primary hover:from-primary hover:to-accent-green text-white font-bold py-4 px-6 rounded-lg transition-smooth flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <LogIn size={20} />
              <span>Giriş Yap</span>
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-military-900 rounded-lg border border-military-600">
            <p className="text-gray-700 text-sm text-center">
              <strong className="text-accent-green">Varsayılan giriş:</strong><br />
              Kullanıcı: <code className="text-accent-green">admin</code><br />
              Şifre: <code className="text-accent-green">Axer2019*</code>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Güvenli bağlantı ile korunmaktasınız 🔒
          </p>
        </div>
      </div>
    </div>
  );
}
