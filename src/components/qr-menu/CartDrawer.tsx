import React from 'react';
import { MenuItem } from '@/types';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react';

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  tableNumber: string | number | null;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onClearCart: () => void;
  onSubmitOrder: (customerData: { name: string; phone: string; note: string }) => Promise<void>;
  submitting: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  tableNumber,
  onUpdateQuantity,
  onClearCart,
  onSubmitOrder,
  submitting,
}) => {
  const [customerName, setCustomerName] = React.useState('');
  const [orderNote, setOrderNote] = React.useState('');

  if (!isOpen) return null;

  const total = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  const handleWhatsAppSubmit = async () => {
    await onSubmitOrder({
      name: customerName.trim(),
      phone: '-',
      note: orderNote.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 h-full flex flex-col shadow-2xl border-l border-zinc-200 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#e3decb] dark:border-zinc-800 flex items-center justify-between bg-[#faf8f2] dark:bg-zinc-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1e3a1e] text-[#f3ebd3]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand text-xl text-[#1e3a1e] dark:text-[#d6e2c1]">
                Seçilen Lezzetler
              </h3>
              {tableNumber && (
                <span className="text-xs font-bold text-[#5b7333]">
                  📍 Masa {tableNumber}
                </span>
              )}
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
              Henüz ürün seçmediniz
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Menüden dilediğiniz lezzetleri ekleyerek seçiminizi oluşturabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Items list */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
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

            {/* Clear Cart */}
            <div className="flex justify-end">
              <button
                onClick={onClearCart}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Listeyi Temizle</span>
              </button>
            </div>

            {/* Note & Information Form */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Masa No veya İsim (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Örn: Masa 3 veya Burak B."
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#5b7333]/50 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Sipariş Notu (İsteğe Bağlı)
                </label>
                <textarea
                  rows={2}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Örn: Çorba az tuzlu olsun..."
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#5b7333]/50 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer & Submit Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Toplam Tutar:
              </span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {total.toLocaleString('tr-TR')} ₺
              </span>
            </div>

            <button
              disabled={submitting}
              onClick={handleWhatsAppSubmit}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp ile Siparişi İlet</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
