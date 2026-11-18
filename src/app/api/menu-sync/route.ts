import { NextResponse } from 'next/server';

// Güvenlik Koruması: Dışarıdan API anahtarı ile menü güncelleme tamamen kapatılmıştır.
// Menü güncellemeleri yalnızca yerel POS üzerinden Git (SSH/Token) ile güvenli şekilde dağıtılır.
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Bu uç nokta güvenlik nedeniyle tamamen kapatılmıştır.',
    },
    { status: 403 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Yetkisiz erişim: API anahtarı ile menü güncelleme özelliği güvenlik nedeniyle tamamen devre dışı bırakılmıştır. Menü güncellemeleri yalnızca kasa POS uygulaması üzerinden Git ile güvenli şekilde yapılır.',
    },
    { status: 403 }
  );
}
