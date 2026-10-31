import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { setPublicMenuState } from '@/lib/menu-store';
import { MenuCategory, MenuItem } from '@/types';
import crypto from 'crypto';

// GET İSTEKLERİ KESİNLİKLE KAPALIDIR
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'GET metodu güvenlik nedeniyle tamamen kapatılmıştır.',
    },
    { status: 405 }
  );
}

// SADECE ENVIRONMENT VARIABLE (MENU_API_KEY) İLE DOĞRULANAN POST İSTEĞİNİ KABUL EDER
export async function POST(req: Request) {
  try {
    const expectedKey = process.env.MENU_API_KEY;

    // Eğer sunucuda MENU_API_KEY tanımlanmamışsa hiçbir isteği kabul etme
    if (!expectedKey || expectedKey.trim().length < 16) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sunucu yapılandırma hatası: MENU_API_KEY ortam değişkeni tanımlanmamış.',
        },
        { status: 503 }
      );
    }

    const providedKey =
      req.headers.get('x-api-key') ||
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
      '';

    // Zamanlama saldırılarına (timing attack) karşı güvenli karşılaştırma
    const expectedBuf = Buffer.from(expectedKey);
    const providedBuf = Buffer.from(providedKey);
    const isValid =
      expectedBuf.length === providedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, providedBuf);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim: Geçersiz API Anahtarı.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const categories = body.categories as MenuCategory[];
    const menuItems = body.menuItems as MenuItem[];

    if (!Array.isArray(categories) || !Array.isArray(menuItems)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz menü veri formatı.' },
        { status: 400 }
      );
    }

    const updated = setPublicMenuState(categories, menuItems);

    // Opsiyonel: Vercel'de GITHUB_TOKEN ortam değişkeni tanımlıysa kalıcı dosya yedeği
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
      const repo = process.env.GITHUB_REPO;
      const filePath = 'src/data/menu-data.json';
      try {
        const getFileRes = await fetch(
          `https://api.github.com/repos/${repo}/contents/${filePath}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              Accept: 'application/vnd.github+json',
            },
          }
        );
        const fileInfo = getFileRes.ok ? await getFileRes.json() : null;
        const contentBase64 = Buffer.from(
          JSON.stringify(updated, null, 2),
          'utf-8'
        ).toString('base64');

        await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'chore: update menu via authenticated POST',
            content: contentBase64,
            ...(fileInfo?.sha ? { sha: fileInfo.sha } : {}),
          }),
        });
      } catch {
        // ignore backup error
      }
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/menu', 'layout');
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      lastUpdated: updated.lastUpdated,
      itemCount: updated.menuItems.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
