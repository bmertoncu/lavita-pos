import React from 'react';
import { QRMenuView } from '@/components/qr-menu/QRMenuView';
import { getPublicMenuState } from '@/lib/menu-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MenuPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const table = typeof params?.table === 'string' ? params.table : null;
  const view = params?.view;
  const isViewOnly =
    view === 'only' || view === 'catalog' || view === 'sepetsiz';

  const { categories, menuItems } = getPublicMenuState();

  return (
    <QRMenuView
      initialCategories={categories}
      initialMenuItems={menuItems}
      initialTable={table}
      isViewOnly={isViewOnly}
    />
  );
}
