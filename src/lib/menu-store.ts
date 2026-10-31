import { MenuCategory, MenuItem } from '@/types';
import initialMenuData from '@/data/menu-data.json';
import fs from 'fs';

export interface PublicMenuState {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  lastUpdated: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __lavitaPublicMenu: PublicMenuState | undefined;
}

const TMP_STATE_FILE = '/tmp/lavita-public-menu.json';

export function getPublicMenuState(): PublicMenuState {
  // 1. Önce paylaşımlı /tmp dosyasını kontrol et (güncel POST verisi)
  try {
    if (fs.existsSync(TMP_STATE_FILE)) {
      const raw = fs.readFileSync(TMP_STATE_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as PublicMenuState;
      if (Array.isArray(parsed.categories) && Array.isArray(parsed.menuItems) && parsed.menuItems.length > 0) {
        global.__lavitaPublicMenu = parsed;
        return parsed;
      }
    }
  } catch {
    // ignore tmp read error
  }

  // 2. Bellek önbelleğini kontrol et
  if (global.__lavitaPublicMenu && global.__lavitaPublicMenu.menuItems.length > 0) {
    return global.__lavitaPublicMenu;
  }

  // 3. Varsayılan gömülü menu-data.json
  return {
    categories: (initialMenuData.categories || []) as MenuCategory[],
    menuItems: (initialMenuData.menuItems || []) as MenuItem[],
    lastUpdated: initialMenuData.lastUpdated || new Date().toISOString(),
  };
}

export function setPublicMenuState(categories: MenuCategory[], menuItems: MenuItem[]): PublicMenuState {
  const updated: PublicMenuState = {
    categories,
    menuItems,
    lastUpdated: new Date().toISOString(),
  };
  global.__lavitaPublicMenu = updated;

  try {
    fs.writeFileSync(TMP_STATE_FILE, JSON.stringify(updated), 'utf-8');
  } catch {
    // ignore tmp write error
  }

  return updated;
}
