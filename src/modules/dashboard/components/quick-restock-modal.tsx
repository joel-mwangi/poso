import React, { useState } from 'react';
import { LocalProduct, quickRestockProduct } from '@/platform/database/dexie-db';
import { formatKes } from '@/shared/formatting/money';
import { X, PackagePlus, Check, AlertCircle } from 'lucide-react';

interface QuickRestockModalProps {
  isOpen: boolean;
  product: LocalProduct | null;
  onClose: () => void;
  onRestocked: () => void;
}

export const QuickRestockModal: React.FC<QuickRestockModalProps> = ({
  isOpen,
  product,
  onClose,
  onRestocked,
}) => {
  const [units, setUnits] = useState<string>('12');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !product) return null;

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(units, 10);
    if (isNaN(qty) || qty <= 0) return;

    setLoading(true);
    try {
      await quickRestockProduct(product.id, qty);
      onRestocked();
      onClose();
    } catch (err) {
      console.error('Failed to quick restock:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                Fast Restock
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                Add Stock to Shelves
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
          <div className="font-extrabold text-slate-900 text-sm">{product.name}</div>
          <div className="text-slate-500 flex justify-between">
            <span>Current on hand:</span>
            <span className="font-bold text-rose-600">
              {product.currentStock} {product.unit} (Alert at {product.minStockAlert})
            </span>
          </div>
          <div className="text-slate-500 flex justify-between">
            <span>Wholesale Cost Price:</span>
            <span className="font-medium text-slate-700">{formatKes(product.costPrice)}</span>
          </div>
        </div>

        <form onSubmit={handleRestock} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Units to Add ({product.unit}):
            </label>
            <div className="flex items-center gap-2">
              {[6, 12, 24, 48].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setUnits(preset.toString())}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    units === preset.toString()
                      ? 'bg-teal-800 text-white border-teal-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  +{preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-700 text-sm font-bold text-slate-900"
              required
            />
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900 text-xs flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              New stock level will be{' '}
              <strong className="font-bold">
                {product.currentStock + (parseInt(units, 10) || 0)} {product.unit}
              </strong>
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs"
            >
              {loading ? 'Adding Stock...' : 'Confirm Restock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
