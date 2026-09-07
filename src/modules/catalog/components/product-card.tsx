import React from 'react';
import { LocalProduct } from '@/platform/database/dexie-db';
import { formatKes } from '@/shared/formatting/money';
import { Plus, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: LocalProduct;
  onAddToCart: (product: LocalProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const isOutOfStock = product.currentStock <= 0;
  const isLowStock = !isOutOfStock && product.currentStock <= product.minStockAlert;

  return (
    <button
      id={`product-card-${product.id}`}
      onClick={() => !isOutOfStock && onAddToCart(product)}
      disabled={isOutOfStock}
      className={`relative flex flex-col justify-between text-left p-3.5 rounded-xl border transition-all duration-150 active:scale-[0.98] ${
        isOutOfStock
          ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
          : 'bg-white border-slate-200 hover:border-teal-600 hover:shadow-sm cursor-pointer'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-1.5 mb-1.5">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 truncate max-w-[130px]">
            {product.category}
          </span>
          {isLowStock && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
              <AlertTriangle className="w-3 h-3" />
              Low
            </span>
          )}
        </div>

        <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        
        {product.barcode && (
          <p className="text-[11px] text-slate-600 font-mono mt-0.5">
            {product.barcode}
          </p>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-600 block">Price</span>
          <span className="text-sm font-bold text-teal-800">
            {formatKes(product.sellingPrice)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-medium ${isOutOfStock ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
            {isOutOfStock ? 'Out' : `${product.currentStock} ${product.unit}`}
          </span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400'
                : 'bg-teal-50 text-teal-700 group-hover:bg-teal-700 group-hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
          </div>
        </div>
      </div>
    </button>
  );
};
