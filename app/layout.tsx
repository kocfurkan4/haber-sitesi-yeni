import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Piyade - Piyade Haberleri",
  description: "En güncel piyade haberlerini takip edin",
};

const Footer = () => (
  <footer className="bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 mt-10 py-6 text-center text-sm text-gray-300">
    <div className="container mx-auto px-4">
      <p className="mb-2">
        &copy; {new Date().getFullYear()} Piyade Haberleri - Tüm hakları saklıdır.
      </p>
      <p className="text-gray-400">
        <span className="text-blue-400 font-semibold">Axer</span> tarafından yapılmıştır.
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
