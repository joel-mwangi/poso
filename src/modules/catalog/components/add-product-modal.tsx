import React, { useState } from 'react';
import { localDb, LocalProduct } from '@/platform/database/dexie-db';
import { authService } from '@/modules/auth/auth-service';
import { syncService } from '@/modules/sync/sync-service';
import { kesToCents } from '@/shared/formatting/money';
import { X, PackagePlus, Barcode } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

const CATEGORIES = [
  'Food & Grains',
  'Oils & Fats',
  'Dairy',
  'Bakery',
  'Beverages',
  'Detergents & Cleaners',
  'Personal Care',
  'Spices & Salt',
  'Poultry',
  'Telecom & Cards',
  'Snacks & Confectionery',
  'General Household',
];

const UNITS = ['pcs', 'packet', 'kg', 'ltr', 'bar', 'loaf', 'tray', 'bottle', 'bundle'];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [barcode, setBarcode] = useState('');
  const [sellingPriceKes, setSellingPriceKes] = useState('');
  const [costPriceKes, setCostPriceKes] = useState('');
  const [currentStock, setCurrentStock] = useState('10');
  const [minStockAlert, setMinStockAlert] = useState('5');
  const [unit, setUnit] = useState('pcs');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const sellPrice = parseFloat(sellingPriceKes);
    const costPrice = parseFloat(costPriceKes || sellingPriceKes);
    const stock = parseInt(currentStock, 10);
    const minAlert = parseInt(minStockAlert, 10);

    if (!name.trim()) {
      setError('Product name is required');
      return;
    }

    if (isNaN(sellPrice) || sellPrice <= 0) {
      setError('Please enter a valid selling price in KES');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      setError('Please enter a valid stock quantity');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeShop = authService.getActiveShop();
      const currentShopId = activeShop?.id || 'shop_main_01';

      const newProduct: LocalProduct = {
        id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        shopId: currentShopId,
        name: name.trim(),
        category,
        barcode: barcode.trim() || undefined,
        sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
        sellingPrice: kesToCents(sellPrice),
        costPrice: kesToCents(isNaN(costPrice) ? sellPrice : costPrice),
        currentStock: stock,
        minStockAlert: isNaN(minAlert) ? 5 : minAlert,
        unit,
        isArchived: false,
        updatedAt: new Date().toISOString(),
      };

      await localDb.products.add(newProduct);
      await syncService.queueOperation('product', 'insert', newProduct);

      onProductAdded();
      onClose();
      // Reset form
      setName('');
      setBarcode('');
      setSellingPriceKes('');
      setCostPriceKes('');
      setCurrentStock('10');
    } catch (err: any) {
      setError(err?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Shop Product</h2>
              <p className="text-xs text-slate-500">Save to local catalog & sync with Supabase</p>
            </div>
          </div>
          <button
            id="close-add-product-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Name *
            </label>
            <input
              id="input-product-name"
              type="text"
              required
              placeholder="e.g. Royco Cubes 40pcs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                id="select-product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-600 text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Barcode / EAN (Optional)
              </label>
              <div className="relative">
                <input
                  id="input-product-barcode"
                  type="text"
                  placeholder="Scan or type barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-sm font-mono"
                />
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price (KES) *
              </label>
              <input
                id="input-product-selling-price"
                type="number"
                step="0.5"
                min="0"
                required
                placeholder="e.g. 150"
                value={sellingPriceKes}
                onChange={(e) => setSellingPriceKes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost Price (KES) (Wholesale)
              </label>
              <input
                id="input-product-cost-price"
                type="number"
                step="0.5"
                min="0"
                placeholder="e.g. 125"
                value={costPriceKes}
                onChange={(e) => setCostPriceKes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Stock *
              </label>
              <input
                id="input-product-stock"
                type="number"
                min="0"
                required
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Low Alert At
              </label>
              <input
                id="input-product-min-stock"
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit
              </label>
              <select
                id="select-product-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-2 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-600 text-sm"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              id="submit-create-product-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
