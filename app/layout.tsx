import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Piyade - Teknoloji Haberleri",
  description: "En güncel teknoloji haberlerini takip edin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-military-900">
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-military-900">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
