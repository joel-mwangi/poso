import React, { useState, useEffect } from 'react';
import { localDb, LocalSale, LocalProduct } from '@/platform/database/dexie-db';
import { authService } from '@/modules/auth/auth-service';
import { formatKes, formatKesCompact } from '@/shared/formatting/money';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Package,
  AlertTriangle,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [sales, setSales] = useState<LocalSale[]>([]);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'all'>('today');
  const [loading, setLoading] = useState(true);

  const activeShop = authService.getActiveShop();

  const loadData = async () => {
    setLoading(true);
    try {
      let salesPromise = localDb.sales.toArray();
      let productsPromise = localDb.products.toArray();

      if (activeShop?.id) {
        salesPromise = localDb.sales.where('shopId').equals(activeShop.id).toArray();
        productsPromise = localDb.products.where('shopId').equals(activeShop.id).toArray();
      }

      const [allSales, allProducts] = await Promise.all([
        salesPromise,
        productsPromise,
      ]);
      setSales(allSales);
      setProducts(allProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeShop?.id]);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const filteredSales = sales.filter((s) => {
    if (s.status === 'voided') return false;
    if (timeframe === 'today') return s.createdAt.startsWith(todayStr);
    if (timeframe === 'week') return s.createdAt >= sevenDaysAgo;
    return true;
  });

  // Calculate gross revenue
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);

  // Calculate COGS and profit
  // Map product cost lookup
  const productCostMap = new Map<string, number>();
  products.forEach((p) => productCostMap.set(p.id, p.costPrice));

  let totalCogs = 0;
  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      const unitCost = productCostMap.get(item.productId) ?? item.unitPrice * 0.8;
      totalCogs += unitCost * item.quantity;
    });
  });

  const grossProfit = Math.max(0, totalRevenue - totalCogs);
  const profitMarginPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  // Payment Breakdown
  let cashTotal = 0;
  let mpesaTotal = 0;
  let deniTotal = 0;

  filteredSales.forEach((s) => {
    s.payments.forEach((p) => {
      if (p.method === 'cash') cashTotal += p.amount;
      if (p.method === 'mpesa') mpesaTotal += p.amount;
      if (p.method === 'deni') deniTotal += p.amount;
    });
  });

  const paymentSum = cashTotal + mpesaTotal + deniTotal || 1;
  const cashPct = Math.round((cashTotal / paymentSum) * 100);
  const mpesaPct = Math.round((mpesaTotal / paymentSum) * 100);
  const deniPct = Math.round((deniTotal / paymentSum) * 100);

  // Top products
  const productStats = new Map<string, { name: string; quantity: number; revenue: number }>();
  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      const existing = productStats.get(item.productId) || {
        name: item.productName,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += item.total;
      productStats.set(item.productId, existing);
    });
  });

  const topProducts = Array.from(productStats.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // Low stock products
  const lowStockItems = products.filter(
    (p) => !p.isArchived && p.currentStock <= p.minStockAlert
  );

  const handleQuickRestock = async (productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    const addQty = 20;
    await localDb.products.update(productId, {
      currentStock: p.currentStock + addQty,
      updatedAt: new Date().toISOString(),
    });
    loadData();
  };

  const handleExportFullReport = () => {
    const rows = [
      ['DukaFlow POS Financial & Business Report'],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Timeframe: ${timeframe.toUpperCase()}`],
      [''],
      ['Metric', 'Amount (KES)'],
      ['Gross Revenue', (totalRevenue / 100).toFixed(2)],
      ['Cost of Goods Sold (COGS)', (totalCogs / 100).toFixed(2)],
      ['Gross Profit', (grossProfit / 100).toFixed(2)],
      ['Profit Margin', `${profitMarginPct}%`],
      [''],
      ['Payment Method Breakdown', 'Amount (KES)', 'Share %'],
      ['M-Pesa', (mpesaTotal / 100).toFixed(2), `${mpesaPct}%`],
      ['Cash', (cashTotal / 100).toFixed(2), `${cashPct}%`],
      ['Deni (Credit)', (deniTotal / 100).toFixed(2), `${deniPct}%`],
      [''],
      ['Top Products by Revenue', 'Quantity Sold', 'Revenue (KES)'],
      ...topProducts.map((tp) => [tp.name, tp.quantity, (tp.revenue / 100).toFixed(2)]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `DukaFlow_Business_Report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-teal-700" />
            Financial Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Profitability, channel distribution, top velocity items, and inventory insights
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe pill */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                timeframe === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                timeframe === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                timeframe === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={handleExportFullReport}
            className="px-3 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Gross Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Gross Revenue</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatKes(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            From {filteredSales.length} customer sales
          </div>
        </div>

        {/* Cost of Goods Sold */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Cost of Goods (COGS)</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-700 mt-2">
            {formatKes(totalCogs)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Direct wholesale inventory cost
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-white rounded-2xl p-4 border border-teal-200 shadow-xs bg-gradient-to-br from-teal-50/40 to-white">
          <div className="flex items-center justify-between text-teal-800 text-xs font-semibold uppercase tracking-wider">
            <span>Gross Profit</span>
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-teal-900 mt-2">
            {formatKes(grossProfit)}
          </div>
          <div className="text-[11px] text-teal-700 mt-1 font-semibold">
            {profitMarginPct}% profit margin
          </div>
        </div>

        {/* Deni Outstanding Warning */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold uppercase tracking-wider">
            <span>Deni Extended</span>
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-950 mt-2">
            {formatKes(deniTotal)}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            Credit given to trusted customers
          </div>
        </div>
      </div>

      {/* Row 2: Payment Methods & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Channels Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-teal-700" />
              Payment Channels Distribution
            </h2>
            <span className="text-xs text-slate-400 font-medium">By Volume</span>
          </div>

          {/* Graphical bar */}
          <div className="h-4 w-full rounded-full bg-slate-100 flex overflow-hidden">
            {mpesaTotal > 0 && (
              <div
                style={{ width: `${mpesaPct}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`M-Pesa: ${mpesaPct}%`}
              />
            )}
            {cashTotal > 0 && (
              <div
                style={{ width: `${cashPct}%` }}
                className="bg-teal-700 h-full transition-all"
                title={`Cash: ${cashPct}%`}
              />
            )}
            {deniTotal > 0 && (
              <div
                style={{ width: `${deniPct}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`Deni: ${deniPct}%`}
              />
            )}
          </div>

          <div className="space-y-2.5 pt-1 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-bold text-emerald-950">M-Pesa Mobile Money</span>
              </div>
              <div className="text-right">
                <span className="font-black text-emerald-900">{formatKes(mpesaTotal)}</span>
                <span className="text-slate-500 ml-2">({mpesaPct}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-50/70 border border-teal-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-700" />
                <span className="font-bold text-teal-950">Cash in Till</span>
              </div>
              <div className="text-right">
                <span className="font-black text-teal-900">{formatKes(cashTotal)}</span>
                <span className="text-slate-500 ml-2">({cashPct}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="font-bold text-amber-950">Deni (Credit Ledger)</span>
              </div>
              <div className="text-right">
                <span className="font-black text-amber-900">{formatKes(deniTotal)}</span>
                <span className="text-slate-500 ml-2">({deniPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Velocity Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-700" />
              Top Fast-Moving Products
            </h2>
            <span className="text-xs text-slate-400 font-medium">Ranked by revenue</span>
          </div>

          {topProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No sales logged for this timeframe yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {topProducts.map((prod, idx) => (
                <div key={prod.name} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-100 font-black text-slate-600 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{prod.name}</div>
                      <div className="text-slate-400 text-[11px]">{prod.quantity} units sold</div>
                    </div>
                  </div>
                  <div className="text-right font-black text-slate-900">
                    {formatKes(prod.revenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Low Stock Alerts & Quick Restock */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Inventory Stock Alerts ({lowStockItems.length} items low or out)
          </h2>
          <span className="text-xs text-slate-500">Auto-calculated from minimum alert levels</span>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="p-6 text-center text-xs text-emerald-700 bg-emerald-50 rounded-xl font-medium border border-emerald-100">
            ✓ All shop products are comfortably above minimum stock thresholds!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{item.name}</h4>
                  <div className="text-[11px] text-amber-900 mt-0.5">
                    Remaining: <span className="font-black">{item.currentStock} {item.unit}</span> (Min: {item.minStockAlert})
                  </div>
                </div>
                <button
                  onClick={() => handleQuickRestock(item.id)}
                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  +20 Restock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
