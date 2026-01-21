import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Piyade - Savunma Sanayi Haberleri",
  description: "En güncel savunma sanayi ve piyade haberlerini takip edin",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

const Footer = () => (
  <footer className="bg-black border-t border-gray-800 mt-10 py-4 text-center">
    <div className="container mx-auto px-4">
      <p className="text-xs text-gray-400">
        &copy; 2026 - Axer tarafından yapılmıştır. Tüm hakları saklıdır.
      </p>
    </div>
  </footer>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-white flex flex-col min-h-screen">
        <Providers>
          <Navbar />
          <main className="flex-grow bg-white">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
