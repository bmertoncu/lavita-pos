import React, { useState, useEffect } from 'react';
import { MenuItem } from '@/types';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  MessageCircle,
  Bike,
  Store,
  MapPin,
  Phone,
  User,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

export interface CustomerOrderData {
  deliveryType: 'delivery' | 'pickup';
  name: string;
  phone: string;
  address?: string;
  note: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  tableNumber: string | number | null;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onClearCart: () => void;
  onSubmitOrder: (customerData: CustomerOrderData) => Promise<void>;
  submitting: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onClearCart,
  onSubmitOrder,
  submitting,
}) => {
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [saveInfo, setSaveInfo] = useState(true);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load saved address & customer info on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('lavita_customer_name') || '';
      const savedPhone = localStorage.getItem('lavita_customer_phone') || '';
      const savedAddress = localStorage.getItem('lavita_customer_address') || '';

      if (savedName || savedPhone || savedAddress) {
        setCustomerName(savedName);
        setCustomerPhone(savedPhone);
        setDeliveryAddress(savedAddress);
        setHasSavedData(true);
      }
    }
  }, []);

  if (!isOpen) return null;

  const total = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  const handleClearSavedInfo = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lavita_customer_name');
      localStorage.removeItem('lavita_customer_phone');
      localStorage.removeItem('lavita_customer_address');
    }
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setHasSavedData(false);
  };

  const handleWhatsAppSubmit = async () => {
    setValidationError(null);

    const cleanName = customerName.trim();
    const cleanPhone = customerPhone.trim();
    const cleanAddress = deliveryAddress.trim();
    const cleanNote = orderNote.trim();

    if (!cleanName) {
      setValidationError('Lütfen adınızı ve soyadınızı belirtin.');
      return;
    }

    if (deliveryType === 'delivery' && !cleanAddress) {
      setValidationError('Lütfen teslimat yapılacak açık adresinizi girin.');
      return;
    }

    // Save information if checkbox is checked
    if (typeof window !== 'undefined' && saveInfo) {
      localStorage.setItem('lavita_customer_name', cleanName);
      if (cleanPhone) localStorage.setItem('lavita_customer_phone', cleanPhone);
      if (deliveryType === 'delivery' && cleanAddress) {
        localStorage.setItem('lavita_customer_address', cleanAddress);
      }
      setHasSavedData(true);
    }

    await onSubmitOrder({
      deliveryType,
      name: cleanName,
      phone: cleanPhone || '-',
      address: deliveryType === 'delivery' ? cleanAddress : undefined,
      note: cleanNote,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 h-full flex flex-col shadow-2xl border-l border-zinc-200 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#e3decb] dark:border-zinc-800 flex items-center justify-between bg-[#faf8f2] dark:bg-zinc-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1e3a1e] text-[#f3ebd3]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand text-xl text-[#1e3a1e] dark:text-[#d6e2c1]">
                Sipariş Sepeti
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Instagram & WhatsApp Sipariş Hattı
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-400">
            <ShoppingBag className="w-12 h-12 stroke-1 mb-2 opacity-50" />
            <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
              Sepetiniz henüz boş
            </p>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs">
              Menüden dilediğiniz lezzetleri sepete ekleyerek paket servis veya gel-al siparişinizi oluşturabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Delivery Type Selector: Adrese Teslim vs Gel-Al */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Teslimat Yöntemi
              </label>
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#f4f7ee] dark:bg-zinc-800/80 rounded-2xl border border-[#dbe6ca] dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    deliveryType === 'delivery'
                      ? 'bg-[#1e3a1e] text-[#f3ebd3] shadow-md scale-101'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
                  }`}
                >
                  <Bike className="w-4 h-4 stroke-[2.5]" />
                  <span>Adrese Teslim</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    deliveryType === 'pickup'
                      ? 'bg-[#1e3a1e] text-[#f3ebd3] shadow-md scale-101'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
                  }`}
                >
                  <Store className="w-4 h-4 stroke-[2.5]" />
                  <span>Gel-Al (Restorandan)</span>
                </button>
              </div>
            </div>

            {/* Items list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Seçilen Ürünler ({cart.reduce((sum, c) => sum + c.quantity, 0)})
                </span>
                <button
                  onClick={onClearCart}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sepeti Boşalt</span>
                </button>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                {cart.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="p-3 flex items-center justify-between gap-3 bg-white dark:bg-zinc-900"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                        {(item.price * quantity).toLocaleString('tr-TR')} ₺
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 w-4 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center hover:opacity-90 transition-opacity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Data Indicator */}
            {hasSavedData && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Kayıtlı teslimat bilgileriniz yüklendi.</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearSavedInfo}
                  className="text-[11px] underline font-bold hover:text-emerald-950 dark:hover:text-emerald-200"
                >
                  Bilgileri Sıfırla
                </button>
              </div>
            )}

            {/* Customer Details Form */}
            <div className="space-y-3.5 pt-1">
              {/* Name Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#5b7333]" />
                  <span>Adınız & Soyadınız</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5b7333]/50 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#5b7333]" />
                  <span>Telefon Numaranız</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Örn: 0532 123 45 67"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5b7333]/50 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Delivery Address Field (Only if 'delivery' is selected) */}
              {deliveryType === 'delivery' && (
                <div className="space-y-2 animate-fade-in">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#5b7333]" />
                    <span>Teslimat Adresi (Açık Adres)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Mahalle, Cadde / Sokak, Bina No, Daire No ve varsa kurye için adres tarifi..."
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5b7333]/50 text-zinc-900 dark:text-zinc-100"
                  />

                  {/* Save Address Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={saveInfo}
                      onChange={(e) => setSaveInfo(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1e3a1e] focus:ring-[#5b7333] border-zinc-300 dark:border-zinc-700"
                    />
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                      <BookmarkCheck className="w-3.5 h-3.5 text-[#5b7333]" />
                      <span>Bu adresi sonraki siparişlerim için kaydet</span>
                    </span>
                  </label>
                </div>
              )}

              {/* Order Note Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                  Sipariş Notu (İsteğe Bağlı)
                </label>
                <textarea
                  rows={2}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Örn: Zili çalmayın bebek uyuyor, ekstra peçete..."
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#5b7333]/50 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Validation Error Message */}
              {validationError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer & Submit Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                  Toplam Tutar
                </span>
                <span className="text-[11px] font-semibold text-[#5b7333] dark:text-[#a1b87a]">
                  {deliveryType === 'delivery' ? '🛵 Adrese Teslim' : '🛍️ Gel-Al'}
                </span>
              </div>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {total.toLocaleString('tr-TR')} ₺
              </span>
            </div>

            <button
              disabled={submitting}
              onClick={handleWhatsAppSubmit}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <MessageCircle className="w-5 h-5 stroke-[2.5]" />
              <span>WhatsApp ile Siparişi Gönder</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
