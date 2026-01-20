// components/Layout.tsx - Footer ve Global Yapı
import React from 'react';
import Navbar from './Navbar'; // Navbar bileşeninin var olduğu varsayılmıştır

interface LayoutProps {
  children: React.ReactNode;
}

const Footer: React.FC = () => (
  <footer className="bg-gray-100 border-t border-gray-200 mt-10 py-4 text-center text-sm text-gray-600">
    <div className="container mx-auto">
      &copy; {new Date().getFullYear()} Piyade Haberleri. Axer tarafından yapılmıştır. Tüm hakları saklıdır.
    </div>
  </footer>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
