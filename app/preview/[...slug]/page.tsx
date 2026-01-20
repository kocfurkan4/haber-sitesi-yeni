// app/preview/[...slug]/page.tsx - Ön İzleme Sayfası
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const PreviewPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    title: '',
    content: '',
    source: '',
  });

  useEffect(() => {
    // URL'den gelen veriyi decode et
    const decodedTitle = decodeURIComponent(searchParams.get('title') || '');
    const decodedContent = decodeURIComponent(searchParams.get('content') || '');
    const decodedSource = decodeURIComponent(searchParams.get('source') || '');

    if (!decodedTitle || !decodedContent) {
      // Veri yoksa ana sayfaya yönlendir
      router.push('/');
      return;
    }

    setData({
      title: decodedTitle,
      content: decodedContent,
      source: decodedSource,
    });
    setLoading(false);
  }, [searchParams, router]);

  if (loading) {
    return <div className="text-center py-20 text-xl">Ön İzleme Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-4 text-gray-800">{data.title}</h1>
      <p className="text-sm text-gray-500 mb-6">Kaynak: {data.source}</p>

      <div className="prose max-w-none">
        <p className="text-lg leading-relaxed whitespace-pre-wrap">{data.content}</p>
      </div>

      <button
        onClick={() => router.back()}
        className="mt-10 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
      >
        Geri Dön
      </button>
    </div>
  );
};

export default PreviewPage;
