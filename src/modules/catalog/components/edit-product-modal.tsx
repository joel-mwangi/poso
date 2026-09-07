import React, { useState, useEffect } from 'react';
import { localDb, LocalProduct } from '@/platform/database/dexie-db';
import { syncService } from '@/modules/sync/sync-service';
import { kesToCents, centsToKes } from '@/shared/formatting/money';
import { X, Edit3, Barcode, Trash2 } from 'lucide-react';

interface EditProductModalProps {
  product: LocalProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
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

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onProductUpdated,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [sellingPriceKes, setSellingPriceKes] = useState('');
  const [costPriceKes, setCostPriceKes] = useState('');
  const [currentStock, setCurrentStock] = useState('0');
  const [minStockAlert, setMinStockAlert] = useState('5');
  const [unit, setUnit] = useState('pcs');
  const [isArchived, setIsArchived] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product && isOpen) {
      setName(product.name);
      setCategory(product.category);
      setBarcode(product.barcode || '');
      setSku(product.sku || '');
      setSellingPriceKes(centsToKes(product.sellingPrice).toString());
      setCostPriceKes(centsToKes(product.costPrice).toString());
      setCurrentStock(product.currentStock.toString());
      setMinStockAlert(product.minStockAlert.toString());
      setUnit(product.unit);
      setIsArchived(product.isArchived);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const sellPrice = parseFloat(sellingPriceKes);
    const costPrice = parseFloat(costPriceKes);
    const stock = parseInt(currentStock, 10);
    const minAlert = parseInt(minStockAlert, 10);

    if (!name.trim()) {
      setError('Product name is required');
      return;
    }

    if (isNaN(sellPrice) || sellPrice <= 0) {
      setError('Please enter a valid selling price');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedProduct: LocalProduct = {
        ...product,
        name: name.trim(),
        category,
        barcode: barcode.trim() || undefined,
        sku: sku.trim() || undefined,
        sellingPrice: kesToCents(sellPrice),
        costPrice: kesToCents(isNaN(costPrice) ? sellPrice : costPrice),
        currentStock: isNaN(stock) ? product.currentStock : stock,
        minStockAlert: isNaN(minAlert) ? 5 : minAlert,
        unit,
        isArchived,
        updatedAt: new Date().toISOString(),
      };

      await localDb.products.put(updatedProduct);
      await syncService.queueOperation('product', 'update', updatedProduct);

      onProductUpdated();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to archive "${product.name}"? It will be hidden from the register.`)) {
      await localDb.products.update(product.id, { isArchived: true, updatedAt: new Date().toISOString() });
      await syncService.queueOperation('product', 'update', { id: product.id, isArchived: true });
      onProductUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Product Details</h2>
              <p className="text-xs text-slate-500">Update pricing, barcodes & inventory limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-700 text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Barcode / EAN</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Barcode number"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-mono"
                />
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Selling Price (KES) *</label>
              <input
                type="number"
                step="0.5"
                required
                value={sellingPriceKes}
                onChange={(e) => setSellingPriceKes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-teal-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cost Price (KES) (Wholesale)</label>
              <input
                type="number"
                step="0.5"
                value={costPriceKes}
                onChange={(e) => setCostPriceKes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-sm text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Stock</label>
              <input
                type="number"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Low Alert At</label>
              <input
                type="number"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-2 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={handleDelete}
              className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1.5 py-2 px-2 rounded-lg hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Archive Product
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-white bg-teal-800 hover:bg-teal-900 font-bold rounded-xl shadow-xs"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
