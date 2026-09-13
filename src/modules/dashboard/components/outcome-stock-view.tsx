import React, { useState } from 'react';
import { LocalProduct } from '@/platform/database/dexie-db';
import { ProductVelocity } from './outcome-types';
import { formatKes } from '@/shared/formatting/money';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  PackagePlus,
  CheckCircle2,
  Filter,
  BarChart3,
  Layers,
} from 'lucide-react';

interface OutcomeStockViewProps {
  products: LocalProduct[];
  velocities: ProductVelocity[];
  lowStockProducts: LocalProduct[];
  onOpenRestockModal: (product: LocalProduct) => void;
  onNavigateTab: (tab: string) => void;
}

export const OutcomeStockView: React.FC<OutcomeStockViewProps> = ({
  products,
  velocities,
  lowStockProducts,
  onOpenRestockModal,
  onNavigateTab,
}) => {
  const [velocityFilter, setVelocityFilter] = useState<'all' | 'fast' | 'stagnant'>('all');

  const totalUnits = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalRetailVal = products.reduce((acc, p) => acc + p.sellingPrice * p.currentStock, 0);
  const totalCostVal = products.reduce((acc, p) => acc + p.costPrice * p.currentStock, 0);
  const potentialGrossMargin = totalRetailVal - totalCostVal;

  const fastMovers = velocities.filter((v) => v.velocityStatus === 'fast');
  const slowMovers = velocities.filter((v) => v.velocityStatus === 'stagnant');

  const displayedVelocities =
    velocityFilter === 'fast'
      ? fastMovers
      : velocityFilter === 'stagnant'
      ? slowMovers
      : velocities;

  return (
    <div className="space-y-4">
      {/* Outcome Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-black">
              1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-teal-800">
                  Outcome 1
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold text-[10px]">
                  Shelf & Warehouse Control
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Know Your Stock
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('purchasing')}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <PackagePlus className="w-3.5 h-3.5 text-teal-800" />
              <span>Supplier Orders</span>
            </button>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <span>Full Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Core Stock Truth Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Shelf Stock
            </span>
            <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">
              {totalUnits.toLocaleString()} units
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Across {products.length} active SKUs
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Inventory Cost Value
            </span>
            <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">
              {formatKes(totalCostVal)}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Capital tied up at cost
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Retail Sale Value
            </span>
            <span className="text-xl font-black text-teal-900 font-mono mt-0.5 block">
              {formatKes(totalRetailVal)}
            </span>
            <span className="text-[11px] text-emerald-700 font-bold">
              +{formatKes(potentialGrossMargin)} potential gross
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl border ${
              lowStockProducts.length > 0
                ? 'bg-rose-50/70 border-rose-200'
                : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Low Stock Runway
            </span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span
                className={`text-xl font-black font-mono ${
                  lowStockProducts.length > 0 ? 'text-rose-700' : 'text-slate-900'
                }`}
              >
                {lowStockProducts.length} items
              </span>
              {lowStockProducts.length > 0 && (
                <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                  Needs restock
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Below threshold alert
            </span>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Action Table */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-rose-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h4 className="text-sm font-extrabold text-slate-900">
                Products Running Low (Action Required)
              </h4>
            </div>
            <span className="text-xs text-slate-500">
              Order before next supplier truck arrives
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {lowStockProducts.map((p) => {
              const vel = velocities.find((v) => v.product.id === p.id);
              const runway = vel && vel.runwayDays > 0 ? `${vel.runwayDays} days left` : 'Critical level';

              return (
                <div
                  key={p.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        {p.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                      <span>
                        Current Stock:{' '}
                        <strong className="text-rose-600 font-bold">
                          {p.currentStock} {p.unit}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>Min Threshold: {p.minStockAlert} {p.unit}</span>
                      <span>•</span>
                      <span className="text-amber-800 font-semibold">{runway}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenRestockModal(p)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
                    >
                      <PackagePlus className="w-3.5 h-3.5" />
                      <span>Restock Shelves</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Velocity Analysis: Fast Moving vs Stagnant Products */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400">
              <BarChart3 className="w-3.5 h-3.5 text-teal-800" />
              <span>Sales Velocity Breakdown</span>
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">
              Which Products Are Moving vs Sitting Idle
            </h4>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start">
            <button
              onClick={() => setVelocityFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                velocityFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({velocities.length})
            </button>
            <button
              onClick={() => setVelocityFilter('fast')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                velocityFilter === 'fast'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fast Movers ({fastMovers.length})
            </button>
            <button
              onClick={() => setVelocityFilter('stagnant')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                velocityFilter === 'stagnant'
                  ? 'bg-white text-amber-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stagnant ({slowMovers.length})
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedVelocities.slice(0, 6).map((item) => (
            <div
              key={item.product.id}
              className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs line-clamp-1">
                    {item.product.name}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.product.category}
                  </span>
                </div>
                {item.velocityStatus === 'fast' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black shrink-0">
                    Fast Mover
                  </span>
                ) : item.velocityStatus === 'stagnant' ? (
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold shrink-0">
                    Slow / 0 Sales
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold shrink-0">
                    Steady
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-400 block text-[10px]">On Shelf</span>
                  <span className="font-extrabold text-slate-800 font-mono">
                    {item.product.currentStock} {item.product.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Units Sold</span>
                  <span className="font-extrabold text-teal-900 font-mono">
                    {item.unitsSold} sold
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                <span>
                  {item.runwayDays > 0 ? (
                    <strong className="font-semibold text-slate-700">
                      ~{item.runwayDays} days runway
                    </strong>
                  ) : item.unitsSold === 0 ? (
                    <span className="text-amber-800 font-medium">Capital tied up</span>
                  ) : (
                    <span className="text-rose-700 font-bold">Stockout risk</span>
                  )}
                </span>

                <button
                  onClick={() => onOpenRestockModal(item.product)}
                  className="text-teal-800 hover:text-teal-950 font-bold text-[11px] hover:underline"
                >
                  Restock &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
