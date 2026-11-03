'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, MenuCategory } from '@/types';
import { CartDrawer, CartItem } from './CartDrawer';
import {
  Search,
  Pizza,
  UtensilsCrossed,
  Salad,
  Cake,
  CupSoda,
  Utensils,
  MapPin,
  ArrowDown,
  Eye,
  Sun,
  Moon,
  ShoppingBag,
} from 'lucide-react';

interface QRMenuViewProps {
  initialCategories: MenuCategory[];
  initialMenuItems: MenuItem[];
  initialTable?: string | null;
  isViewOnly?: boolean;
}

export const QRMenuView: React.FC<QRMenuViewProps> = ({
  initialCategories,
  initialMenuItems,
  initialTable = null,
  isViewOnly = false,
}) => {
  // HİÇBİR GET /api İSTEĞİ ÇEKİLMEZ — Doğrudan sunucu verisi kullanılır
  const categories = initialCategories;
  const menuItems = initialMenuItems;
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableNumber] = useState<string | null>(initialTable);
  const [submitting, setSubmitting] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lavita_theme');
      if (saved === 'dark' || saved === 'light') {
        setThemeMode(saved);
        if (saved === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        const prefersDark =
          window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const autoTheme = prefersDark ? 'dark' : 'light';
        setThemeMode(autoTheme);
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const savedPref = localStorage.getItem('lavita_theme');
        if (!savedPref) {
          if (e.matches) {
            document.documentElement.classList.add('dark');
            setThemeMode('dark');
          } else {
            document.documentElement.classList.remove('dark');
            setThemeMode('light');
          }
        }
      };

      try {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } catch {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, []);

  const toggleManualTheme = () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('lavita_theme', next);
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!item.isAvailable || isViewOnly) return;

    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    if (isViewOnly) return;
    setCart((prev) => {
      return prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleSubmitOrder = async (customerData: {
    name: string;
    phone: string;
    note: string;
  }) => {
    setSubmitting(true);
    try {
      const subtotal = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
      const itemLines = cart
        .map(
          (ci) =>
            `• ${ci.quantity}x ${ci.item.name} (${(ci.item.price * ci.quantity).toLocaleString(
              'tr-TR'
            )} ₺)`
        )
        .join('\n');

      const message = encodeURIComponent(
        `🌿 *La'Vita Yeni Sipariş*\n` +
          (tableNumber ? `📍 *Masa:* Masa ${tableNumber}\n` : '') +
          (customerData.name ? `👤 *İsim / Not:* ${customerData.name}\n` : '') +
          `\n*Ürünler:*\n${itemLines}\n\n` +
          (customerData.note ? `📝 *Sipariş Notu:* ${customerData.note}\n\n` : '') +
          `💰 *Toplam:* ${subtotal.toLocaleString('tr-TR')} ₺`
      );
      window.open(`https://wa.me/905529160166?text=${message}`, '_blank');
      setCart([]);
      setIsCartOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Pizza':
        return Pizza;
      case 'UtensilsCrossed':
        return UtensilsCrossed;
      case 'Salad':
        return Salad;
      case 'Cake':
        return Cake;
      case 'CupSoda':
        return CupSoda;
      default:
        return Utensils;
    }
  };

  const scrollToCategory = (categoryId: string) => {
    const el = document.getElementById(`qr-cat-${categoryId}`);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const totalCartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalCartAmount = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  return (
    <div className="min-h-screen bg-[#faf9f5] dark:bg-[#0d130d] text-[#1a2819] dark:text-[#f4f6f0] pb-32">
      {/* Hero Header with Official La'Vita Logo & Botanical Olive Styling */}
      <div className="relative bg-gradient-to-b from-[#fcfbf7] via-[#f5f2e8] to-[#faf9f5] dark:from-[#121a12] dark:via-[#152015] dark:to-[#0d130d] border-b-2 border-[#e4decb] dark:border-[#243424] pt-7 pb-10 px-4 text-center shadow-sm">
        {/* Quick Theme Toggle Button for Customers */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleManualTheme}
            aria-label="Temayı Değiştir"
            className="p-2.5 rounded-2xl bg-white/80 dark:bg-[#1a261a]/80 backdrop-blur-md border-2 border-[#e2dcc8] dark:border-[#2f422f] text-[#1e3a1e] dark:text-[#d6e2c1] shadow-sm hover:scale-105 active:scale-95 transition-all"
            title={themeMode === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
          >
            {themeMode === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 stroke-[2.5]" />
            ) : (
              <Moon className="w-5 h-5 text-[#1e3a1e] stroke-[2.5]" />
            )}
          </button>
        </div>

        <div className="max-w-xl mx-auto flex flex-col items-center space-y-2.5">
          {/* Official Logo */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-white dark:bg-[#faf8f2] border-2 border-[#e2dcc8] shadow-md p-2 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="La'Vita" className="w-full h-full object-contain" />
          </div>

          <p className="font-brand italic text-lg sm:text-xl text-[#3d5428] dark:text-[#b7cf87] font-bold pt-1">
            Doğal, Zeytinyağlı & Sağlıklı Lezzetler
          </p>

          {/* Badges: Table & View Mode */}
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            {tableNumber && (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1e3a1e] text-[#f3ebd3] rounded-full text-xs font-black shadow-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>Masa {tableNumber}</span>
              </div>
            )}
            {isViewOnly ? (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#5b7333] text-white rounded-full text-xs font-black shadow-sm">
                <Eye className="w-3.5 h-3.5" />
                <span>Dijital Katalog Menüsü (Sadece İnceleme)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1e3a1e] text-[#f3ebd3] rounded-full text-xs font-black shadow-sm">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>WhatsApp Siparişli Menü</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-5">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#5b7333]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Yemek, sporcu öğünü, meze veya tatlı ara..."
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#141d14] border-2 border-[#dfd8c2] dark:border-[#283928] rounded-2xl text-base font-bold shadow-md placeholder:text-stone-400 focus:outline-none focus:border-[#5b7333]"
          />
        </div>

        {/* Sticky Horizontal Anchor Bar */}
        <div className="sticky top-2 z-30 py-2.5 bg-[#faf9f5]/95 dark:bg-[#0d130d]/95 backdrop-blur-md">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className="px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all shadow-sm flex items-center gap-2 border-2 border-[#dfd8c2] dark:border-[#283928] bg-white dark:bg-[#141d14] text-[#1e3a1e] dark:text-[#e6eed6] hover:border-[#1e3a1e] hover:bg-[#f2efe4] dark:hover:bg-[#1e2c1e]"
                >
                  <Icon className="w-4 h-4 text-[#5b7333]" />
                  <span>{cat.name}</span>
                  <ArrowDown className="w-3 h-3 opacity-40" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Continuous Category Sections */}
        <div className="mt-6 space-y-12">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            let items = menuItems.filter((i) => i.categoryId === cat.id);

            if (searchQuery.trim() !== '') {
              const q = searchQuery.toLowerCase();
              items = items.filter(
                (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
              );
            }

            if (items.length === 0) return null;

            return (
              <section key={cat.id} id={`qr-cat-${cat.id}`} className="scroll-mt-24 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b-4 border-[#e5dec9] dark:border-[#243424]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#1e3a1e] text-[#f3ebd3] rounded-2xl shadow-sm">
                      <Icon className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h2 className="font-brand italic text-2xl sm:text-3xl font-black text-[#1e3a1e] dark:text-[#e6eed6]">
                        {cat.name}
                      </h2>
                      {cat.description && (
                        <p className="text-xs sm:text-sm font-bold text-[#5b7333] dark:text-[#98b06f]">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 bg-[#eef2e6] dark:bg-[#1b281b] rounded-xl text-[#1e3a1e] dark:text-[#c7d9a7] shrink-0">
                    {items.length} Çeşit
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => {
                    const inCart = cart.find((ci) => ci.item.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className={`bg-white dark:bg-[#141d14] border-2 rounded-3xl p-4 flex gap-4 shadow-sm transition-all ${
                          item.isAvailable
                            ? 'border-[#e6e0cc] dark:border-[#243424]'
                            : 'border-stone-200 dark:border-zinc-800 opacity-60 grayscale'
                        }`}
                      >
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-stone-100 dark:bg-zinc-800 shrink-0 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {!item.isAvailable && (
                            <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
                              <span className="text-[11px] font-black uppercase bg-red-600 text-white px-2.5 py-1 rounded-lg">
                                Tükendi
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="font-extrabold text-base sm:text-lg text-[#1a2819] dark:text-zinc-100 leading-snug">
                              {item.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed font-medium">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#f0ece1] dark:border-[#223022]">
                            <span className="font-black text-lg sm:text-xl text-[#1e3a1e] dark:text-[#b7cf87] font-mono">
                              {item.price.toLocaleString('tr-TR')} ₺
                            </span>

                            {!isViewOnly && item.isAvailable && (
                              <div>
                                {inCart ? (
                                  <div className="flex items-center gap-2 bg-[#eef2e6] dark:bg-[#223322] rounded-xl p-1 border border-[#c5d4a9] dark:border-[#395239]">
                                    <button
                                      onClick={() => handleUpdateQuantity(item.id, -1)}
                                      className="w-7 h-7 rounded-lg bg-white dark:bg-[#141d14] text-[#1e3a1e] dark:text-white font-black text-sm flex items-center justify-center shadow-sm"
                                    >
                                      -
                                    </button>
                                    <span className="text-sm font-black text-[#1e3a1e] dark:text-white px-1">
                                      {inCart.quantity}
                                    </span>
                                    <button
                                      onClick={() => handleUpdateQuantity(item.id, 1)}
                                      className="w-7 h-7 rounded-lg bg-[#1e3a1e] text-white font-black text-sm flex items-center justify-center shadow-sm"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleAddToCart(item)}
                                    className="px-4 py-2 bg-[#1e3a1e] hover:bg-[#2c522c] text-[#f3ebd3] text-xs font-black rounded-xl transition-all active:scale-95 shadow-sm"
                                  >
                                    + Ekle
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Button */}
      {!isViewOnly && totalCartCount > 0 && (
        <div className="fixed bottom-6 inset-x-0 z-40 px-4 max-w-md mx-auto animate-bounce-subtle">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-4 px-6 bg-gradient-to-r from-[#1e3a1e] to-[#3c5a27] text-white rounded-2xl shadow-2xl flex items-center justify-between font-black text-base border border-[#788d47]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-black">
                {totalCartCount}
              </div>
              <span>Seçilenleri Gör</span>
            </div>
            <span className="text-lg font-black font-mono text-[#f3ebd3]">
              {totalCartAmount.toLocaleString('tr-TR')} ₺
            </span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {!isViewOnly && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          tableNumber={tableNumber}
          onUpdateQuantity={handleUpdateQuantity}
          onClearCart={() => setCart([])}
          onSubmitOrder={handleSubmitOrder}
          submitting={submitting}
        />
      )}
    </div>
  );
};
