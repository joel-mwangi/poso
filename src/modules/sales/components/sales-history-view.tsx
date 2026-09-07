import React, { useState, useEffect } from 'react';
import { localDb, LocalSale, LocalProduct, LocalCustomer } from '@/platform/database/dexie-db';
import { syncService } from '@/modules/sync/sync-service';
import { formatKes, formatKesCompact } from '@/shared/formatting/money';
import { ReceiptModal } from './receipt-modal';
import {
  History,
  Search,
  Receipt,
  RotateCcw,
  Download,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  BookOpen,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const SalesHistoryView: React.FC = () => {
  const [sales, setSales] = useState<LocalSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | 'cash' | 'mpesa' | 'deni'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<LocalSale | null>(null);

  const loadSales = async () => {
    setLoading(true);
    try {
      const allSales = await localDb.sales.reverse().toArray();
      setSales(allSales);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredSales = sales.filter((sale) => {
    // Date filter
    if (dateFilter === 'today') {
      if (!sale.createdAt.startsWith(todayStr)) return false;
    }

    // Method filter
    if (methodFilter !== 'all') {
      const hasMethod = sale.payments.some((p) => p.method === methodFilter);
      if (!hasMethod) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesId = sale.localSaleId.toLowerCase().includes(q);
      const matchesCustomer = sale.customerName?.toLowerCase().includes(q);
      const matchesItems = sale.items.some((i) => i.productName.toLowerCase().includes(q));
      const matchesRef = sale.payments.some((p) => p.reference?.toLowerCase().includes(q));
      if (!matchesId && !matchesCustomer && !matchesItems && !matchesRef) return false;
    }

    return true;
  });

  const totalRevenue = filteredSales
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + s.total, 0);

  const cashTotal = filteredSales
    .filter((s) => s.status === 'completed')
    .flatMap((s) => s.payments)
    .filter((p) => p.method === 'cash')
    .reduce((sum, p) => sum + p.amount, 0);

  const mpesaTotal = filteredSales
    .filter((s) => s.status === 'completed')
    .flatMap((s) => s.payments)
    .filter((p) => p.method === 'mpesa')
    .reduce((sum, p) => sum + p.amount, 0);

  const deniTotal = filteredSales
    .filter((s) => s.status === 'completed')
    .flatMap((s) => s.payments)
    .filter((p) => p.method === 'deni')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleVoidSale = async (sale: LocalSale) => {
    if (sale.status === 'voided') return;

    const confirmed = window.confirm(
      `Are you sure you want to VOID receipt ${sale.localSaleId}? This will restore the sold stock back to inventory and roll back customer credit if applicable.`
    );
    if (!confirmed) return;

    // 1. Restore product inventory
    for (const item of sale.items) {
      const product = await localDb.products.get(item.productId);
      if (product) {
        await localDb.products.update(item.productId, {
          currentStock: product.currentStock + item.quantity,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 2. Roll back customer Deni if sale was on credit
    if (sale.customerId) {
      const customer = await localDb.customers.get(sale.customerId);
      if (customer) {
        const deniPaid = sale.payments
          .filter((p) => p.method === 'deni')
          .reduce((sum, p) => sum + p.amount, 0);

        if (deniPaid > 0) {
          const newBalance = Math.max(0, customer.deniBalance - deniPaid);
          await localDb.customers.update(customer.id, {
            deniBalance: newBalance,
            updatedAt: new Date().toISOString(),
          });
          await localDb.deni_transactions.add({
            id: 'deni_void_' + Date.now(),
            shopId: sale.shopId,
            customerId: customer.id,
            customerName: customer.name,
            saleId: sale.id,
            type: 'repay',
            amount: deniPaid,
            balanceAfter: newBalance,
            notes: `Voided Sale: ${sale.localSaleId}`,
            createdAt: new Date().toISOString(),
            synced: false,
          });
        }
      }
    }

    // 3. Mark sale as voided
    await localDb.sales.update(sale.id, {
      status: 'voided',
    });
    await syncService.queueOperation('sale', 'update', {
      id: sale.id,
      status: 'voided',
    });

    loadSales();
  };

  const handleExportCsv = () => {
    if (filteredSales.length === 0) return;

    const headers = ['Receipt #', 'Date Time', 'Items Count', 'Total KES', 'Status', 'Payment Method(s)', 'Customer'];
    const rows = filteredSales.map((s) => [
      s.localSaleId,
      new Date(s.createdAt).toLocaleString(),
      s.items.reduce((acc, i) => acc + i.quantity, 0),
      (s.total / 100).toFixed(2),
      s.status,
      s.payments.map((p) => p.method).join('+'),
      s.customerName || 'Walk-in',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DukaFlow_Sales_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <History className="w-6 h-6 text-teal-700" />
              Sales History & Receipts
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review completed transactions, re-issue thermal slips, and track cashflow
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Aggregate KPI Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Filtered Sales Total
            </span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">
              {formatKes(totalRevenue)}
            </span>
            <span className="text-[11px] text-slate-500">
              {filteredSales.filter((s) => s.status === 'completed').length} completed receipts
            </span>
          </div>

          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
              <Banknote className="w-3.5 h-3.5" /> Cash Collected
            </div>
            <span className="text-lg font-black text-teal-900 mt-0.5 block">
              {formatKes(cashTotal)}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5" /> M-Pesa Inflow
            </div>
            <span className="text-lg font-black text-emerald-900 mt-0.5 block">
              {formatKes(mpesaTotal)}
            </span>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" /> Deni Credit Sales
            </div>
            <span className="text-lg font-black text-amber-900 mt-0.5 block">
              {formatKes(deniTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by receipt #, customer, item or M-Pesa ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-teal-700 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Date toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                dateFilter === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                dateFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Payment Method filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setMethodFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                methodFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setMethodFilter('cash')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                methodFilter === 'cash' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Cash
            </button>
            <button
              onClick={() => setMethodFilter('mpesa')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                methodFilter === 'mpesa' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              M-Pesa
            </button>
            <button
              onClick={() => setMethodFilter('deni')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                methodFilter === 'deni' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              Deni
            </button>
          </div>
        </div>
      </div>

      {/* Sales Records List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading sales history...</div>
        ) : filteredSales.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No transactions found</h3>
            <p className="text-xs text-slate-500">
              Completed sales on the POS register will appear here immediately.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      sale.status === 'voided' ? 'opacity-60 bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {sale.localSaleId}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(sale.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 max-w-[200px]">
                      <div className="font-semibold truncate">
                        {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {sale.items.reduce((acc, i) => acc + i.quantity, 0)} total items
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {sale.payments.map((p) => (
                          <span
                            key={p.id}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 ${
                              p.method === 'cash'
                                ? 'bg-teal-100 text-teal-800'
                                : p.method === 'mpesa'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.method}
                            {p.reference && <span className="text-[9px] font-normal font-mono">({p.reference})</span>}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {sale.customerName || <span className="text-slate-400">Walk-in</span>}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {formatKes(sale.total)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {sale.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" /> Voided
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReceiptSale(sale)}
                          title="View / Reprint Thermal Receipt"
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>

                        {sale.status === 'completed' && (
                          <button
                            onClick={() => handleVoidSale(sale)}
                            title="Void sale and restore stock"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal for Re-printing */}
      {selectedReceiptSale && (
        <ReceiptModal
          onClose={() => setSelectedReceiptSale(null)}
          sale={selectedReceiptSale}
        />
      )}
    </div>
  );
};
