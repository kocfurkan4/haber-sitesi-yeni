"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Shield, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  const navLinks = [
    { href: "/haberler", label: "Haberler" },
    { href: "/ayarlar", label: "Ayarlar" },
    ...(isAuthenticated
      ? [{ href: "/admin", label: "Admin Panel", icon: Shield }]
      : []),
    ...(!isAuthenticated ? [{ href: "/login", label: "Giriş Yap" }] : []),
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-military-700 sticky top-0 z-50 shadow-lg border-b-2 border-military-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-accent-green font-bold text-xl hover:text-primary transition-smooth"
          >
            <span>📰</span>
            <span>Teknoloji Haberleri</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 text-gray-800 font-medium hover:text-accent-green transition-smooth relative px-3 py-2 rounded ${
                  isActive(link.href) ? "text-accent-green bg-military-600" : ""
                }`}
              >
                {link.icon && <link.icon size={18} />}
                <span>{link.label}</span>
              </Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-800 font-medium hover:text-accent-red transition-smooth px-3 py-2 rounded"
              >
                <LogOut size={18} />
                <span>Çıkış</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-800 hover:text-accent-green transition-smooth"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 text-gray-800 font-medium hover:text-accent-green hover:bg-military-600 px-4 py-2 rounded transition-smooth ${
                  isActive(link.href) ? "bg-military-600 text-accent-green" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon && <link.icon size={18} />}
                <span>{link.label}</span>
              </Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full text-gray-800 font-medium hover:text-accent-red hover:bg-military-600 px-4 py-2 rounded transition-smooth"
              >
                <LogOut size={18} />
                <span>Çıkış</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
