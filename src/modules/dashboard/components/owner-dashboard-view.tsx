import React, { useState, useEffect } from 'react';
import {
  localDb,
  LocalSale,
  LocalProduct,
  LocalCustomer,
  LocalSupplier,
  LocalShift,
} from '@/platform/database/dexie-db';
import { authService } from '@/modules/auth/auth-service';
import { formatKes } from '@/shared/formatting/money';
import {
  TrendingUp,
  DollarSign,
  Package,
  BookOpen,
  Truck,
  ShoppingCart,
  Calculator,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Store,
  ChevronRight,
  Sparkles,
  Smartphone,
  Banknote,
  Users,
} from 'lucide-react';

interface OwnerDashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const OwnerDashboardView: React.FC<OwnerDashboardViewProps> = ({ onNavigate }) => {
  const currentUser = authService.getCurrentUser();
  const currentOrg = authService.getCurrentOrg();
  const activeShop = authService.getActiveShop();

  const [todaySales, setTodaySales] = useState<LocalSale[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LocalProduct[]>([]);
  const [totalDeniOwed, setTotalDeniOwed] = useState(0);
  const [totalSupplierPayables, setTotalSupplierPayables] = useState(0);
  const [activeShift, setActiveShift] = useState<LocalShift | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    if (!activeShop) return;
    setLoading(true);

    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Sales today
      const allSales = await localDb.sales
        .where('shopId')
        .equals(activeShop.id)
        .reverse()
        .sortBy('createdAt');
      
      const salesToday = allSales.filter(
        (s) => s.createdAt.startsWith(todayStr) && s.status !== 'voided'
      );
      setTodaySales(salesToday);

      // 2. Low stock items
      const products = await localDb.products.where('shopId').equals(activeShop.id).toArray();
      const lowStock = products.filter(
        (p) => !p.isArchived && p.currentStock <= p.minStockAlert
      );
      setLowStockProducts(lowStock);

      // 3. Customer Deni total
      const customers = await localDb.customers.where('shopId').equals(activeShop.id).toArray();
      const deniSum = customers.reduce((sum, c) => sum + (c.deniBalance || 0), 0);
      setTotalDeniOwed(deniSum);

      // 4. Supplier Payables total
      const suppliers = await localDb.suppliers.where('shopId').equals(activeShop.id).toArray();
      const payableSum = suppliers.reduce((sum, s) => sum + (s.balanceOwed || 0), 0);
      setTotalSupplierPayables(payableSum);

      // 5. Active shift
      const shifts = await localDb.shifts.where('shopId').equals(activeShop.id).toArray();
      const openShift = shifts.find((s) => s.status === 'open') || null;
      setActiveShift(openShift);
    } catch (err) {
      console.error('Failed loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeShop?.id]);

  // Calculations for today's summary
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

  let cashCollectedToday = 0;
  let mpesaCollectedToday = 0;
  let deniIssuedToday = 0;

  todaySales.forEach((s) => {
    s.payments.forEach((p) => {
      if (p.method === 'cash') cashCollectedToday += p.amount;
      if (p.method === 'mpesa') mpesaCollectedToday += p.amount;
      if (p.method === 'deni') deniIssuedToday += p.amount;
    });
  });

  return (
    <div className="space-y-6">
      {/* Top Greeting & Business Identity */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>{currentOrg?.name || 'Retail Enterprise'}</span>
              <span>•</span>
              <Store className="w-3.5 h-3.5" />
              <span>{activeShop?.name || 'Main Branch'}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Habari, {currentUser?.name || 'Owner'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Here is what is happening in your shop today. All sales, M-Pesa till transactions, and stock movements are tracked and stored locally for offline resilience.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('register')}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Open POS Register</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Today's Total Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Today's Sales
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2 block">
            {formatKes(todayRevenue)}
          </span>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>{todaySales.length} Transactions</span>
            <span className="text-teal-700 font-bold">
              Avg: {formatKes(todaySales.length > 0 ? Math.round(todayRevenue / todaySales.length) : 0)}
            </span>
          </div>
        </div>

        {/* M-Pesa Collections */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              M-Pesa Till Total
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-teal-900 mt-2 block">
            {formatKes(mpesaCollectedToday)}
          </span>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Cash: {formatKes(cashCollectedToday)}</span>
            <span className="text-emerald-700 font-bold">In Drawer</span>
          </div>
        </div>

        {/* Outstanding Deni */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Customer Deni (Debt)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-amber-900 mt-2 block">
            {formatKes(totalDeniOwed)}
          </span>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Given today: {formatKes(deniIssuedToday)}</span>
            <button
              onClick={() => onNavigate('deni')}
              className="text-amber-800 font-bold hover:underline"
            >
              Collect &rarr;
            </button>
          </div>
        </div>

        {/* Supplier Payables */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Supplier Payables
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-rose-600 mt-2 block">
            {formatKes(totalSupplierPayables)}
          </span>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Owed for stock</span>
            <button
              onClick={() => onNavigate('purchasing')}
              className="text-rose-700 font-bold hover:underline"
            >
              Payables &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Operations Strip */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Frequent Shop Actions
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => onNavigate('register')}
            className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-teal-700 hover:bg-teal-50/50 transition-all text-left flex items-center gap-3 shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs block">Sell / New Order</span>
              <span className="text-[10px] text-slate-400">Ring up customer</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('purchasing')}
            className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-teal-700 hover:bg-teal-50/50 transition-all text-left flex items-center gap-3 shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs block">Receive Delivery</span>
              <span className="text-[10px] text-slate-400">Stock in from truck</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('deni')}
            className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-teal-700 hover:bg-teal-50/50 transition-all text-left flex items-center gap-3 shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs block">Record Repayment</span>
              <span className="text-[10px] text-slate-400">Deni debt collection</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('reconciliation')}
            className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-teal-700 hover:bg-teal-50/50 transition-all text-left flex items-center gap-3 shadow-2xs group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs block">Shift Balancing</span>
              <span className="text-[10px] text-slate-400">Drawer cash count</span>
            </div>
          </button>
        </div>
      </div>

      {/* Two Column Grid: Low Stock Alert vs Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Low Stock Alerts</h3>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1"
            >
              <span>Manage Stock</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">Inventory is healthy</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All fast-moving retail products have sufficient stock.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{p.name}</span>
                    <span className="text-[10px] text-slate-500">
                      Category: {p.category} • Alert at {p.minStockAlert} {p.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-rose-600 text-xs block">
                      {p.currentStock} {p.unit} left
                    </span>
                    <button
                      onClick={() => onNavigate('purchasing')}
                      className="text-[10px] font-bold text-teal-800 hover:underline"
                    >
                      Re-order &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales Activity Feed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-slate-900 text-sm">Recent Sales Feed</h3>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todaySales.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">No sales recorded yet today</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Head over to the POS register to ring up customer items.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todaySales.slice(0, 5).map((sale) => (
                <div
                  key={sale.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{sale.localSaleId}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(sale.createdAt).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {sale.items.length} items • Sold by {sale.cashierName}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-slate-900 block">{formatKes(sale.total)}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {sale.payments.map((p) => p.method).join(' + ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
