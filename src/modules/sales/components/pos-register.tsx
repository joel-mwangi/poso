import React, { useState, useEffect } from 'react';
import { localDb, LocalProduct, LocalSale } from '@/platform/database/dexie-db';
import { ProductCard } from '@/modules/catalog/components/product-card';
import { CheckoutModal } from '@/modules/sales/components/checkout-modal';
import { ReceiptModal } from '@/modules/sales/components/receipt-modal';
import { formatKes } from '@/shared/formatting/money';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Barcode,
  ShoppingBag,
  PackagePlus,
} from 'lucide-react';

interface CartItem {
  product: LocalProduct;
  quantity: number;
}

interface PosRegisterProps {
  onOpenAddProduct: () => void;
}

export const PosRegister: React.FC<PosRegisterProps> = ({ onOpenAddProduct }) => {
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<LocalSale | null>(null);

  const loadProducts = async () => {
    const list = await localDb.products.filter((p) => !p.isArchived).toArray();
    setProducts(list);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchQuery)) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: LocalProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.currentStock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSaleSuccess = (sale: LocalSale) => {
    setCompletedSale(sale);
    setCart([]);
    loadProducts(); // Refresh local stock counts
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Product Catalog Section */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search & Action Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="search-pos-products"
              type="text"
              placeholder="Search by product name, barcode (e.g. Unga, Milk, 6161...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-700 text-sm shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          <button
            id="btn-add-product-pos"
            onClick={onOpenAddProduct}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:border-teal-700 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] shrink-0"
          >
            <PackagePlus className="w-4 h-4 text-teal-700" />
            <span>New Item</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No products found</h4>
              <p className="text-xs text-slate-500 mt-0.5">Try searching another term or add a new item.</p>
              <button
                onClick={onOpenAddProduct}
                className="mt-3 px-4 py-2 bg-teal-800 text-white text-xs font-bold rounded-xl"
              >
                Add First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* POS Cart Section */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[540px] lg:h-[calc(100vh-140px)] shrink-0">
        {/* Cart Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-teal-800" />
            <h2 className="text-sm font-bold text-slate-900">Current Sale Cart</h2>
            <span className="text-xs font-extrabold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full">
              {totalItemCount}
            </span>
          </div>
          {cart.length > 0 && (
            <button
              id="btn-clear-cart"
              onClick={handleClearCart}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingCart className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Cart is currently empty</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                Tap any product card on the left to add it to this sale.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-teal-800 font-semibold">
                      {formatKes(item.product.sellingPrice)}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      (Stock: {item.product.currentStock})
                    </span>
                  </div>
                </div>

                {/* Stepper Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleUpdateQuantity(item.product.id, -1)}
                    className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-black text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(item.product.id, 1)}
                    disabled={item.quantity >= item.product.currentStock}
                    className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleRemoveFromCart(item.product.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Checkout Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Total:</span>
              <span>{formatKes(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-950 pt-1 border-t border-slate-200">
              <span>Total Payable:</span>
              <span className="text-teal-900">{formatKes(cartSubtotal)}</span>
            </div>
          </div>

          <button
            id="btn-open-checkout"
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cart.length === 0}
            className="w-full py-3.5 px-4 bg-teal-800 hover:bg-teal-900 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Charge</span>
            <span className="font-mono bg-teal-950/40 px-2 py-0.5 rounded-md">
              {formatKes(cartSubtotal)}
            </span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        totalAmount={cartSubtotal}
        onSaleCompleted={handleSaleSuccess}
      />

      <ReceiptModal
        sale={completedSale}
        onClose={() => setCompletedSale(null)}
      />
    </div>
  );
};
