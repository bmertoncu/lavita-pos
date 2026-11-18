'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, MenuCategory } from '@/types';
import { CartDrawer, CartItem, CustomerOrderData } from './CartDrawer';
import {
  Search,
  Pizza,
  UtensilsCrossed,
  Salad,
  Cake,
  CupSoda,
  Utensils,
  MapPin,
  ArrowUp,
  ArrowDown,
  Eye,
  Sun,
  Moon,
  Phone,
  MessageCircle,
  X,
  Plus,
  Minus,
  Sparkles,
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
  const [categories, setCategories] = useState<MenuCategory[]>(initialCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableNumber] = useState<string | null>(initialTable);
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategories[0]?.id || '');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // Photo Zoom Lightbox Modal State
  const [zoomedImage, setZoomedImage] = useState<{
    src: string;
    alt: string;
    price: number;
    description: string;
  } | null>(null);

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
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const autoTheme = prefersDark ? 'dark' : 'light';
        setThemeMode(autoTheme);
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
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

  const handleSubmitOrder = async (orderData: CustomerOrderData) => {
    setSubmitting(true);
    try {
      const subtotal = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
      const orderNumber = `#WA-${Math.floor(1000 + Math.random() * 9000)}`;

      const restaurantPhone = '905529160166';
      const itemsText = cart
        .map((ci) => `• ${ci.quantity}x ${ci.item.name} (${ci.item.price * ci.quantity} ₺)`)
        .join('\n');
      const deliveryTypeText =
        orderData.deliveryType === 'delivery'
          ? '🛵 *Teslimat Şekli:* Adrese Teslim (Paket Servis)'
          : '🛍️ *Teslimat Şekli:* Gel-Al (Restorandan Teslim)';

      const message =
        `🌿 *La'Vita Yeni Sipariş*\n` +
        `${deliveryTypeText}\n` +
        `Sipariş No: ${orderNumber}\n` +
        `👤 *Müşteri:* ${orderData.name}\n` +
        (orderData.phone && orderData.phone !== '-' ? `📞 *Telefon:* ${orderData.phone}\n` : '') +
        (orderData.deliveryType === 'delivery' && orderData.address
          ? `📍 *Teslimat Adresi:*\n${orderData.address}\n`
          : '') +
        `\n*Ürünler:*\n${itemsText}\n\n` +
        (orderData.note ? `📝 *Sipariş Notu:* ${orderData.note}\n\n` : '') +
        `💰 *Toplam Tutar:* ${subtotal} ₺`;

      const waUrl = `https://wa.me/${restaurantPhone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      setCart([]);
      setIsCartOpen(false);
    } catch (e) {
      console.error('Error submitting order:', e);
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

  const scrollToSection = (id: string) => {
    setActiveCategory(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -120;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const getItemPortionOrTag = (item: MenuItem): string => {
    const macroMatch = item.description.match(/\[([^\]]+)\]/);
    if (macroMatch && macroMatch[1]) {
      return macroMatch[1];
    }
    const gramMatch = item.description.match(/\(([^)]+g|[^)]+gr)\)/i);
    if (gramMatch && gramMatch[1]) {
      return gramMatch[1];
    }
    if (item.badges && item.badges.length > 0) {
      if (item.badges.includes('bestseller')) return '⭐ Çok Satan';
      if (item.badges.includes('chef_choice')) return '👨‍🍳 Şefin Seçimi';
      if (item.badges.includes('vegetarian')) return '🌱 Vejetaryen';
    }
    return 'Porsiyon';
  };

  const getCleanDescription = (description: string): string => {
    return description.replace(/\s*\[[^\]]+\]\s*/g, '').trim();
  };

  const totalCartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalCartAmount = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  return (
    <div className="min-h-screen bg-[#faf8f2] dark:bg-[#0c130c] text-[#1a2819] dark:text-[#f4f6f0] antialiased selection:bg-[#5b7333]/20 pb-28">
      {/* 1. HERO HEADER (Katmer Park Style with La'Vita Botanical Olive Green Tones) */}
      <header className="relative bg-gradient-to-b from-[#102410] via-[#163016] to-[#0e1d0e] text-white border-b-2 border-[#2b442b] shadow-xl overflow-hidden" id="ust">
        {/* Subtle decorative overlay glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#5b7333]/25 via-transparent to-transparent pointer-events-none" />

        {/* Topbar */}
        <nav className="relative max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 border-b border-white/10" aria-label="Menü Navigasyonu">
          <a href="#ust" className="flex items-center gap-3 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white p-1 border-2 border-[#c5a059]/70 shadow-md overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="La'Vita Logosu" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-brand italic font-black text-2xl sm:text-3xl text-white tracking-tight leading-none block">
                La&apos;Vita
              </span>
              <span className="text-[10px] sm:text-xs text-[#d8c28a] font-bold tracking-wider uppercase block mt-0.5">
                Mutfak &amp; Cafe
              </span>
            </div>
          </a>

          <div className="flex items-center gap-2">
            {tableNumber && (
              <div className="px-3 py-1 rounded-full bg-[#243e24] border border-[#487348] text-[#f3ebd3] text-xs font-black flex items-center gap-1.5 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Masa {tableNumber}</span>
              </div>
            )}

            {isViewOnly && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5b7333]/80 text-white text-xs font-black shadow-sm">
                <Eye className="w-3.5 h-3.5" />
                <span>Katalog Görünümü</span>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleManualTheme}
              aria-label="Temayı Değiştir"
              className="p-2 sm:p-2.5 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95"
              title={themeMode === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300 stroke-[2.5]" />
              ) : (
                <Moon className="w-4 h-4 text-white stroke-[2.5]" />
              )}
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#d8c28a] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Doğal, Zeytinyağlı &amp; Sağlıklı Lezzetler</span>
          </p>

          <h1 className="font-brand italic font-bold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-none mb-3">
            La&apos;Vita Menü
          </h1>

          <p className="text-white/80 text-sm sm:text-lg max-w-2xl leading-relaxed mb-6 font-medium">
            {isViewOnly
              ? 'Taze malzemelerle hazırlanan günün zeytinyağlı yemeklerini, sporcu öğünlerini ve tatlılarını inceleyebilirsiniz.'
              : 'Ürününüzü seçin; siparişinizi doğrudan WhatsApp üzerinden teslimat veya gel-al olarak kolayca verin.'}
          </p>

          {/* Hero Order Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/905529160166?text=Merhaba%2C%20La%27Vita%20men%C3%BCs%C3%BC%20hakk%C4%B1nda%20bilgi%20almak%20ve%20sipari%C5%9F%20vermek%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#c5a059] hover:bg-[#b08e4c] active:scale-95 text-[#1a2819] font-black text-xs sm:text-sm shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current stroke-none" />
              <span>Sipariş &amp; WhatsApp: 0552 916 0166</span>
            </a>

            <button
              onClick={() => scrollToSection('menu-categories')}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full border border-white/40 hover:border-white hover:bg-white/10 active:scale-95 text-white font-extrabold text-xs sm:text-sm transition-all"
            >
              <span>Menüyü İncele</span>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. STICKY CATEGORY TABS (Katmer Park Style) */}
      <nav
        id="menu-categories"
        className="sticky top-0 z-30 bg-[#faf8f2]/95 dark:bg-[#0c130c]/95 backdrop-blur-md border-b border-[#e3decb] dark:border-[#223322] shadow-sm py-2 px-3 sm:px-4"
        aria-label="Menü Kategorileri"
      >
        <div className="max-w-5xl mx-auto flex flex-col gap-2">
          {/* Horizontal scrollable pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              const isActive = activeCategory === `cat-${cat.id}`;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToSection(`cat-${cat.id}`)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all border shrink-0 ${
                    isActive
                      ? 'bg-[#1e3a1e] text-[#f3ebd3] border-[#1e3a1e] shadow-md dark:bg-[#5b7333] dark:border-[#5b7333]'
                      : 'bg-white dark:bg-[#162116] text-[#243822] dark:text-[#dbe6ca] border-[#e0dac7] dark:border-[#293d29] hover:border-[#1e3a1e] hover:bg-[#f3f0e6] dark:hover:bg-[#1e2d1e]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search bar inside navigation container */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5b7333]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Yemek, sporcu öğünü, çorba veya tatlı ara..."
              className="w-full pl-10 pr-8 py-2 bg-white dark:bg-[#152015] border border-[#dfd8c2] dark:border-[#283928] rounded-full text-xs sm:text-sm font-semibold shadow-inner placeholder:text-stone-400 focus:outline-none focus:border-[#5b7333]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 3. MENU SECTIONS & CARDS (Exact Katmer Park Grid & Card Architecture) */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-10">
        {categories.map((cat) => {
          let items = menuItems.filter((i) => i.categoryId === cat.id);

          if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            items = items.filter(
              (i) =>
                i.name.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q)
            );
          }

          if (items.length === 0 && searchQuery.trim() !== '') {
            return null;
          }

          return (
            <section
              key={cat.id}
              id={`cat-${cat.id}`}
              className="scroll-mt-28 space-y-3.5"
            >
              {/* Section Title (Katmer Park Architecture) */}
              <div className="border-b-2 border-[#e3decb] dark:border-[#223322] pb-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#917539] dark:text-[#d8c28a]">
                  {cat.name}
                </p>
                <h2 className="font-brand italic text-2xl sm:text-3xl font-black text-[#1e3a1e] dark:text-[#e4edd2]">
                  {cat.name}
                </h2>
                {cat.description && (
                  <p className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
                    {cat.description}
                  </p>
                )}
              </div>

              {/* Menu Card Grid (Katmer Park 2-column Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {items.map((item) => {
                  const inCart = cart.find((ci) => ci.item.id === item.id);
                  const portionTag = getItemPortionOrTag(item);
                  const cleanDesc = getCleanDescription(item.description);

                  return (
                    <article
                      key={item.id}
                      className={`relative bg-white dark:bg-[#141e14] border border-[#e4decb] dark:border-[#253625] rounded-2xl p-3 sm:p-3.5 shadow-sm transition-all hover:border-[#b4c496] hover:shadow-md flex items-center gap-3.5 ${
                        !item.isAvailable ? 'opacity-60 bg-stone-50 dark:bg-[#111811]' : ''
                      }`}
                    >
                      {/* Left: Circular / Rounded Thumbnail (Katmer Park Click-to-Zoom style) */}
                      <div className="relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          onClick={() =>
                            setZoomedImage({
                              src: item.image,
                              alt: item.name,
                              price: item.price,
                              description: item.description,
                            })
                          }
                          className="w-18 h-18 sm:w-20 sm:h-20 rounded-full sm:rounded-2xl border-2 border-[#c5a059]/40 object-cover cursor-zoom-in hover:scale-105 active:scale-95 transition-transform bg-stone-100 dark:bg-stone-800 shadow-sm"
                          title="Fotoğrafı büyütmek için dokunun"
                        />
                        {!item.isAvailable && (
                          <span className="absolute inset-0 bg-black/60 rounded-full sm:rounded-2xl flex items-center justify-center text-[10px] font-black text-white uppercase tracking-wider">
                            Tükendi
                          </span>
                        )}
                      </div>

                      {/* Right: Item Body (Katmer Park Architecture) */}
                      <div className="flex-1 min-w-0">
                        {/* Head: Title & Price on the same row */}
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-brand italic font-bold text-sm sm:text-base text-[#1a2819] dark:text-white leading-tight truncate">
                            {item.name}
                          </h3>
                          <strong className="text-sm sm:text-base font-black text-[#1e3a1e] dark:text-[#b4d882] font-mono whitespace-nowrap">
                            {item.price.toLocaleString('tr-TR')} ₺
                          </strong>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                          {cleanDesc}
                        </p>

                        {/* Footer: Portion Tag + Order/Add Button */}
                        <div className="mt-2.5 pt-1.5 border-t border-[#f2efe4] dark:border-[#223022] flex items-center justify-between gap-2">
                          {/* Portion / Macro Tag */}
                          <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f4f1e4] dark:bg-[#1e2a1e] text-[#4a6332] dark:text-[#b0c88c] max-w-[170px] truncate">
                            {portionTag}
                          </span>

                          {/* Action Button */}
                          {!isViewOnly && (
                            <>
                              {item.isAvailable ? (
                                inCart ? (
                                  <div className="flex items-center gap-1.5 bg-[#edf2e3] dark:bg-[#23351f] px-1.5 py-0.5 rounded-full border border-[#cad8b0] dark:border-[#385233]">
                                    <button
                                      onClick={() => handleUpdateQuantity(item.id, -1)}
                                      className="w-6 h-6 rounded-full bg-white dark:bg-zinc-800 text-[#1e3a1e] dark:text-white flex items-center justify-center font-black text-xs shadow-sm hover:scale-110 active:scale-95 transition-transform"
                                      aria-label="Azalt"
                                    >
                                      <Minus className="w-3 h-3 stroke-[3]" />
                                    </button>
                                    <span className="font-black text-xs text-[#1e3a1e] dark:text-[#d4e3bc] px-1 font-mono">
                                      {inCart.quantity}
                                    </span>
                                    <button
                                      onClick={() => handleUpdateQuantity(item.id, 1)}
                                      className="w-6 h-6 rounded-full bg-[#1e3a1e] text-white flex items-center justify-center font-black text-xs shadow-sm hover:scale-110 active:scale-95 transition-transform"
                                      aria-label="Artır"
                                    >
                                      <Plus className="w-3 h-3 stroke-[3]" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleAddToCart(item)}
                                    className="px-3 py-1 bg-[#1e3a1e] hover:bg-[#2a4e2a] dark:bg-[#5b7333] dark:hover:bg-[#6c883e] active:scale-95 text-white font-extrabold text-[11px] sm:text-xs rounded-full transition-all shadow-sm flex items-center gap-1"
                                    aria-label={`${item.name} sepete ekle`}
                                  >
                                    <span>Sepete Ekle</span>
                                    <Plus className="w-3 h-3 stroke-[3]" />
                                  </button>
                                )
                              ) : (
                                <span className="text-[11px] font-bold text-stone-400">
                                  Servis Dışı
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* 4. FOOTER (Katmer Park Style) */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-6 border-t border-[#e2dcc8] dark:border-[#223322] mt-12 text-center space-y-4" aria-label="Menü Alt Bağlantıları">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#ust"
            className="px-4 py-2 rounded-full border border-[#ded8c4] dark:border-[#2b3c2b] bg-white dark:bg-[#141e14] text-xs font-bold text-[#1e3a1e] dark:text-[#d6e2c1] hover:bg-[#f3f0e6] transition-all flex items-center gap-1.5"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>En Üste Dön</span>
          </a>

          <a
            href="https://wa.me/905529160166"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full border border-[#c5a059] bg-[#faf6eb] dark:bg-[#222e1b] text-xs font-bold text-[#1e3a1e] dark:text-[#e4edd2] hover:bg-[#f2ece0] transition-all flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 text-[#5b7333]" />
            <span>WhatsApp Sipariş: 0552 916 0166</span>
          </a>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
          🌿 La&apos;Vita Cafe &amp; Restoran · Doğal, Zeytinyağlı &amp; Sağlıklı Lezzetler
        </p>
      </footer>

      {/* 5. FLOATING BOTTOM BAR */}
      {/* A) If Cart has items: Floating Cart Button */}
      {!isViewOnly && totalCartCount > 0 && (
        <div className="fixed bottom-4 inset-x-0 z-40 px-4 max-w-md mx-auto animate-bounce-subtle">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-[#1e3a1e] via-[#2d4f20] to-[#1e3a1e] text-white rounded-full shadow-2xl flex items-center justify-between font-black text-sm sm:text-base border-2 border-[#c5a059]/60 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">
                {totalCartCount}
              </span>
              <span>Sepeti Görüntüle</span>
            </div>
            <span className="font-mono font-black text-[#f3ebd3] text-base">
              {totalCartAmount.toLocaleString('tr-TR')} ₺
            </span>
          </button>
        </div>
      )}

      {/* B) If View-Only: Katmer Park Style Mobile Phone Bar */}
      {isViewOnly && (
        <aside className="fixed bottom-0 inset-x-0 z-30 bg-[#1e3a1e] border-t-2 border-[#c5a059] text-white px-4 py-2.5 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#c5a059]" />
            <span className="text-xs font-bold text-white/90">Telefon &amp; WhatsApp:</span>
          </div>
          <a
            href="tel:+905529160166"
            className="font-mono font-black text-xs sm:text-sm text-[#f3ebd3] hover:underline"
          >
            0552 916 0166
          </a>
        </aside>
      )}

      {/* 6. PHOTO ZOOM LIGHTBOX MODAL (Katmer Park Style) */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setZoomedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative bg-white dark:bg-[#141e14] border-2 border-[#e0dac7] dark:border-[#293d29] rounded-3xl overflow-hidden max-w-sm sm:max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomedImage.src}
              alt={zoomedImage.alt}
              className="w-full h-72 sm:h-80 object-cover"
            />

            <div className="p-4 sm:p-5 space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-brand italic font-black text-lg sm:text-xl text-[#1e3a1e] dark:text-[#e4edd2]">
                  {zoomedImage.alt}
                </h3>
                <span className="font-mono font-black text-base text-[#1e3a1e] dark:text-[#b4d882]">
                  {zoomedImage.price.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                {zoomedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. CART DRAWER (For Ordering) */}
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
