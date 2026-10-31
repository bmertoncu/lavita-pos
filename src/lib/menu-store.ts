import { MenuCategory, MenuItem } from '@/types';
import initialMenuData from '@/data/menu-data.json';

export interface PublicMenuState {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  lastUpdated: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __lavitaPublicMenu: PublicMenuState | undefined;
}

export function getPublicMenuState(): PublicMenuState {
  if (global.__lavitaPublicMenu) {
    return global.__lavitaPublicMenu;
  }
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
  return updated;
}
