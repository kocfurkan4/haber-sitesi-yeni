import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Settings interface
interface Settings {
  geminiKeys?: Array<{ name: string; value: string }>;
  elevenlabsKeys?: Array<{ name: string; value: string }>;
  filterKeywords?: Array<{ keyword: string; preferred: boolean }>;
  translationPairs?: Array<{ en: string; tr: string }>;
  rssFeeds?: Array<{ name: string; url: string; status: string }>;
}

// GET - Tüm ayarları getir
export async function GET() {
  try {
    // Fallback: If KV not configured, return empty settings
    if (!process.env.KV_REST_API_URL) {
      console.warn('KV not configured, using default empty settings');
      return NextResponse.json({
        geminiKeys: [],
        elevenlabsKeys: [],
        filterKeywords: [],
        translationPairs: [],
        rssFeeds: [],
      });
    }

    const settings = await kv.get<Settings>('admin_settings');

    return NextResponse.json(settings || {
      geminiKeys: [],
      elevenlabsKeys: [],
      filterKeywords: [],
      translationPairs: [],
      rssFeeds: [],
    });
  } catch (error: any) {
    console.error('Failed to load settings:', error);
    return NextResponse.json(
      { error: error.message || 'Ayarlar yüklenemedi' },
      { status: 500 }
    );
  }
}

// POST - Ayarları kaydet
export async function POST(req: NextRequest) {
  try {
    const settings: Settings = await req.json();

    // Fallback: If KV not configured, just return success
    if (!process.env.KV_REST_API_URL) {
      console.warn('KV not configured, settings not saved to database');
      return NextResponse.json({
        success: true,
        message: 'Settings received (KV not configured)',
      });
    }

    // Save to Vercel KV
    await kv.set('admin_settings', settings);

    return NextResponse.json({
      success: true,
      message: 'Ayarlar başarıyla kaydedildi',
    });
  } catch (error: any) {
    console.error('Failed to save settings:', error);
    return NextResponse.json(
      { error: error.message || 'Ayarlar kaydedilemedi' },
      { status: 500 }
    );
  }
}

// PUT - Belirli bir ayarı güncelle
export async function PUT(req: NextRequest) {
  try {
    const { key, value } = await req.json();

    if (!key) {
      return NextResponse.json(
        { error: 'Key gereklidir' },
        { status: 400 }
      );
    }

    if (!process.env.KV_REST_API_URL) {
      return NextResponse.json({
        success: true,
        message: 'Setting updated (KV not configured)',
      });
    }

    // Get current settings
    const settings = await kv.get<Settings>('admin_settings') || {};

    // Update specific key
    (settings as any)[key] = value;

    // Save back
    await kv.set('admin_settings', settings);

    return NextResponse.json({
      success: true,
      message: `${key} güncellendi`,
    });
  } catch (error: any) {
    console.error('Failed to update setting:', error);
    return NextResponse.json(
      { error: error.message || 'Ayar güncellenemedi' },
      { status: 500 }
    );
  }
}
