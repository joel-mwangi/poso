import React, { useState, useEffect } from 'react';
import { localDb, LocalProduct } from '@/platform/database/dexie-db';
import { authService } from '@/modules/auth/auth-service';
import { syncService } from '@/modules/sync/sync-service';
import { formatKes } from '@/shared/formatting/money';
import { EditProductModal } from '@/modules/catalog/components/edit-product-modal';
import {
  Package,
  Search,
  AlertTriangle,
  Plus,
  Minus,
  ArrowUpDown,
  Edit2,
  Check,
  X,
  Download,
} from 'lucide-react';

interface InventoryViewProps {
  onOpenAddProduct: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onOpenAddProduct }) => {
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<LocalProduct | null>(null);
  const [editingProduct, setEditingProduct] = useState<LocalProduct | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('10');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  const [adjustmentReason, setAdjustmentReason] = useState('Received supplier delivery');

  const activeShop = authService.getActiveShop();

  const loadData = async () => {
    let query = localDb.products.filter((p) => !p.isArchived);
    if (activeShop?.id) {
      query = localDb.products.where('shopId').equals(activeShop.id).filter((p) => !p.isArchived);
    }
    const list = await query.toArray();
    setProducts(list);
  };

  useEffect(() => {
    loadData();
  }, [activeShop?.id]);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search)) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const isLow = p.currentStock <= p.minStockAlert;
    return matchesSearch && matchesCategory && (!filterLowStockOnly || isLow);
  });

  const totalRetailValue = products.reduce((sum, p) => sum + p.sellingPrice * p.currentStock, 0);
  const totalCostValue = products.reduce((sum, p) => sum + p.costPrice * p.currentStock, 0);
  const lowStockCount = products.filter((p) => p.currentStock <= p.minStockAlert).length;

  const handleExportCsv = () => {
    if (products.length === 0) return;
    const headers = ['SKU', 'Product Name', 'Category', 'Barcode', 'Selling Price (KES)', 'Cost Price (KES)', 'Stock', 'Unit', 'Min Alert'];
    const rows = products.map((p) => [
      p.sku || '',
      p.name,
      p.category,
      p.barcode || '',
      (p.sellingPrice / 100).toFixed(2),
      (p.costPrice / 100).toFixed(2),
      p.currentStock,
      p.unit,
      p.minStockAlert,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `DukaFlow_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    const delta = parseInt(adjustmentAmount, 10);
    if (isNaN(delta) || delta <= 0) return;

    const newStock =
      adjustmentType === 'add'
        ? adjustingProduct.currentStock + delta
        : Math.max(0, adjustingProduct.currentStock - delta);

    await localDb.products.update(adjustingProduct.id, {
      currentStock: newStock,
      updatedAt: new Date().toISOString(),
    });

    await syncService.queueOperation('product', 'update', {
      id: adjustingProduct.id,
      currentStock: newStock,
      reason: adjustmentReason,
      updatedAt: new Date().toISOString(),
    });

    setAdjustingProduct(null);
    loadData();
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Total Catalog Items</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{products.length} Products</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Retail Inventory Value</span>
          <span className="text-xl font-black text-teal-800 mt-1 block">
            {formatKes(totalRetailValue)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Stock Cost Value</span>
          <span className="text-xl font-black text-slate-700 mt-1 block">
            {formatKes(totalCostValue)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Low Stock Warnings</span>
          <span className={`text-xl font-black mt-1 block ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
            {lowStockCount} Items
          </span>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search inventory by name, SKU, barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-teal-700"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              filterLowStockOnly
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Low Stock ({lowStockCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="flex-1 sm:flex-none px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Product</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Product / Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Cost Price</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">No items found</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {products.length === 0
                        ? 'Your shelves are empty. Tap "Add New Item" or import stock to get started.'
                        : 'No products match your current search or category filter.'}
                    </p>
                    {products.length === 0 && (
                      <button
                        onClick={onOpenAddProduct}
                        className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-teal-900"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add First Product
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                const isOut = prod.currentStock <= 0;
                const isLow = !isOut && prod.currentStock <= prod.minStockAlert;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{prod.name}</div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        SKU: {prod.sku || 'N/A'} {prod.barcode && `• Barcode: ${prod.barcode}`}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {prod.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-teal-900">
                      {formatKes(prod.sellingPrice)}
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      {formatKes(prod.costPrice)}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-black text-slate-900 text-sm">
                        {prod.currentStock}
                      </span>{' '}
                      <span className="text-slate-600 text-[11px]">{prod.unit}</span>
                    </td>

                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px]">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                          Low Stock ({prod.currentStock})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Available
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingProduct(prod)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-teal-700 transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setAdjustingProduct(prod);
                            setAdjustmentAmount('10');
                            setAdjustmentType('add');
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs"
                        >
                          <ArrowUpDown className="w-3 h-3 text-teal-700" />
                          Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          isOpen={!!editingProduct}
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onProductUpdated={loadData}
        />
      )}

      {/* Adjust Stock Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Adjust Inventory Stock</h3>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyAdjustment} className="p-4 space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{adjustingProduct.name}</span>
                <span className="text-slate-500">
                  Current Stock: {adjustingProduct.currentStock} {adjustingProduct.unit}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('add')}
                  className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1 border ${
                    adjustmentType === 'add'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add / Restock
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustmentType('subtract')}
                  className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1 border ${
                    adjustmentType === 'subtract'
                      ? 'bg-rose-50 border-rose-500 text-rose-800'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  Deduct / Damaged
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity ({adjustingProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Note</label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Received supplier delivery">Received supplier delivery</option>
                  <option value="Physical count correction">Physical count correction</option>
                  <option value="Damaged / Expired goods">Damaged / Expired goods</option>
                  <option value="Customer return">Customer return</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 text-white rounded-xl font-bold hover:bg-teal-900"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
