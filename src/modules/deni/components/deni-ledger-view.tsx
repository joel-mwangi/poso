import React, { useState, useEffect } from 'react';
import {
  localDb,
  LocalCustomer,
  LocalDeniTransaction,
} from '@/platform/database/dexie-db';
import { authService } from '@/modules/auth/auth-service';
import { syncService } from '@/modules/sync/sync-service';
import { formatKes, kesToCents } from '@/shared/formatting/money';
import {
  BookOpen,
  UserPlus,
  ArrowDownLeft,
  Search,
  CheckCircle2,
  Clock,
  Banknote,
  Smartphone,
  X,
  MessageCircle,
  FileText,
  Download,
} from 'lucide-react';

export const DeniLedgerView: React.FC = () => {
  const [customers, setCustomers] = useState<LocalCustomer[]>([]);
  const [transactions, setTransactions] = useState<LocalDeniTransaction[]>([]);
  const [search, setSearch] = useState('');
  
  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [repayingCustomer, setRepayingCustomer] = useState<LocalCustomer | null>(null);
  const [statementCustomer, setStatementCustomer] = useState<LocalCustomer | null>(null);
  const [customerTransactions, setCustomerTransactions] = useState<LocalDeniTransaction[]>([]);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLimitKes, setNewLimitKes] = useState('2000');
  const [newNotes, setNewNotes] = useState('');

  // Repayment Form State
  const [repayAmountKes, setRepayAmountKes] = useState('');
  const [repayMethod, setRepayMethod] = useState<'cash' | 'mpesa'>('cash');
  const [repayRef, setRepayRef] = useState('');

  const activeShop = authService.getActiveShop();

  const loadData = async () => {
    let custs: LocalCustomer[] = [];
    let txs: LocalDeniTransaction[] = [];
    if (activeShop?.id) {
      custs = await localDb.customers.where('shopId').equals(activeShop.id).toArray();
      txs = await localDb.deni_transactions.where('shopId').equals(activeShop.id).reverse().sortBy('createdAt');
      txs = txs.slice(0, 30);
    } else {
      custs = await localDb.customers.toArray();
      txs = await localDb.deni_transactions.orderBy('createdAt').reverse().limit(30).toArray();
    }
    setCustomers(custs);
    setTransactions(txs);
  };

  useEffect(() => {
    loadData();
  }, [activeShop?.id]);

  const openCustomerStatement = async (cust: LocalCustomer) => {
    setStatementCustomer(cust);
    const txs = await localDb.deni_transactions
      .where('customerId')
      .equals(cust.id)
      .reverse()
      .sortBy('createdAt');
    setCustomerTransactions(txs);
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const totalDeniOwed = customers.reduce((acc, c) => acc + c.deniBalance, 0);
  const activeDebtorsCount = customers.filter((c) => c.deniBalance > 0).length;

  const handleExportDebtorsCsv = () => {
    const debtors = customers.filter((c) => c.deniBalance > 0);
    if (debtors.length === 0) return;

    const headers = ['Customer Name', 'Phone', 'Deni Balance (KES)', 'Credit Limit (KES)', 'Notes', 'Last Updated'];
    const rows = debtors.map((c) => [
      c.name,
      c.phone,
      (c.deniBalance / 100).toFixed(2),
      (c.deniLimit / 100).toFixed(2),
      c.notes || '',
      c.updatedAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `DukaFlow_Debtors_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendWhatsAppReminder = (customer: LocalCustomer) => {
    let cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith('7') || cleanPhone.startsWith('1')) {
      cleanPhone = '254' + cleanPhone;
    }
    const message = `Habari ${customer.name}, salio lako la Deni kwa DukaFlow ni ${formatKes(
      customer.deniBalance
    )}. Tafadhali lipa kupitia M-Pesa Till: 5428901 (DUKAFLOW CENTRAL). Asante sana!`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const limit = parseFloat(newLimitKes) || 2000;
    const currentShopId = activeShop?.id || 'shop_main_01';
    const newCustomer: LocalCustomer = {
      id: 'cust_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      shopId: currentShopId,
      name: newName.trim(),
      phone: newPhone.trim(),
      deniBalance: 0,
      deniLimit: kesToCents(limit),
      notes: newNotes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    await localDb.customers.add(newCustomer);
    await syncService.queueOperation('customer', 'insert', newCustomer);

    setIsAddCustomerOpen(false);
    setNewName('');
    setNewPhone('');
    setNewNotes('');
    loadData();
  };

  const handleRecordRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayingCustomer) return;

    const amountNum = parseFloat(repayAmountKes);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const repayCents = kesToCents(amountNum);
    const newBalance = Math.max(0, repayCustomerBalance - repayCents);

    await localDb.customers.update(repayingCustomer.id, {
      deniBalance: newBalance,
      updatedAt: new Date().toISOString(),
    });

    const currentShopId = activeShop?.id || repayingCustomer.shopId || 'shop_main_01';
    const tx: LocalDeniTransaction = {
      id: 'deni_repay_' + Date.now(),
      shopId: currentShopId,
      customerId: repayingCustomer.id,
      customerName: repayingCustomer.name,
      type: 'repay',
      amount: repayCents,
      balanceAfter: newBalance,
      notes: `Repaid via ${repayMethod.toUpperCase()} ${repayRef ? '(' + repayRef + ')' : ''}`,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await localDb.deni_transactions.add(tx);
    await syncService.queueOperation('deni', 'insert', tx);

    setRepayingCustomer(null);
    setRepayAmountKes('');
    setRepayRef('');
    loadData();
  };

  const repayCustomerBalance = repayingCustomer?.deniBalance || 0;

  return (
    <div className="space-y-4 pb-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Total Deni Owed to Shop</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {formatKes(totalDeniOwed)}
          </span>
          <span className="text-[11px] text-slate-400">Across all customers with credit</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">Customers With Active Debt</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {activeDebtorsCount} <span className="text-sm font-normal text-slate-500">of {customers.length} customers</span>
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Customer Credit Actions</span>
            <span className="text-xs text-slate-400 mt-0.5 block">Record phone number & credit limit</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportDebtorsCsv}
              title="Export Debtors CSV"
              className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>New Customer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer List & Search */}
      <div className="flex flex-col sm:flex-row gap-2.5 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search customers by name or phone (e.g. Mama, John, 07...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-teal-700"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Deni Balance</th>
                <th className="py-3 px-4">Credit Limit</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">No customers registered yet</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {customers.length === 0
                        ? 'Add customers to record credit purchases, track balances, and send repayment reminders.'
                        : 'No customer matches your search filter.'}
                    </p>
                    {customers.length === 0 && (
                      <button
                        onClick={() => setIsAddCustomerOpen(true)}
                        className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-teal-900"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Add First Customer
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                    {cust.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono">
                    {cust.phone}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-black text-sm ${
                        cust.deniBalance > 0 ? 'text-amber-800' : 'text-slate-400'
                      }`}
                    >
                      {formatKes(cust.deniBalance)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {formatKes(cust.deniLimit)}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                    {cust.notes || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openCustomerStatement(cust)}
                        title="View Statement History"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {cust.deniBalance > 0 && (
                        <button
                          onClick={() => handleSendWhatsAppReminder(cust)}
                          title="Send WhatsApp Reminder"
                          className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {cust.deniBalance > 0 ? (
                        <button
                          onClick={() => {
                            setRepayingCustomer(cust);
                            setRepayAmountKes((cust.deniBalance / 100).toString());
                          }}
                          className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg shadow-2xs inline-flex items-center gap-1"
                        >
                          <ArrowDownLeft className="w-3 h-3" />
                          Repay
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Settled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Deni Ledger Movements */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Recent Credit Ledger Entries
        </h3>
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No credit activity logged yet.</p>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                      tx.type === 'borrow'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {tx.type === 'borrow' ? 'DR' : 'CR'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {tx.customerName} — {tx.type === 'borrow' ? 'Took Goods on Credit' : 'Repaid Debt'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {tx.notes} • Balance after: {formatKes(tx.balanceAfter)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black text-sm block ${
                      tx.type === 'borrow' ? 'text-amber-800' : 'text-emerald-700'
                    }`}
                  >
                    {tx.type === 'borrow' ? '+' : '-'} {formatKes(tx.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Customer Statement Drawer / Modal */}
      {statementCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{statementCustomer.name}</h3>
                <p className="text-[11px] text-slate-500 font-mono">{statementCustomer.phone}</p>
              </div>
              <button
                onClick={() => setStatementCustomer(null)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between text-xs">
              <span className="font-medium text-amber-900">Current Outstanding Balance:</span>
              <span className="font-black text-amber-950 text-base">
                {formatKes(statementCustomer.deniBalance)}
              </span>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1 text-xs">
              <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] pb-1">
                Transaction History
              </div>
              {customerTransactions.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No transactions recorded for this customer yet.</div>
              ) : (
                customerTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {tx.type === 'borrow' ? 'Credit Purchase (Sale)' : 'Debt Repayment'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(tx.createdAt).toLocaleString()} • {tx.notes}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-black ${
                          tx.type === 'borrow' ? 'text-amber-800' : 'text-emerald-700'
                        }`}
                      >
                        {tx.type === 'borrow' ? '+' : '-'} {formatKes(tx.amount)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Bal: {formatKes(tx.balanceAfter)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setStatementCustomer(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Repayment Modal */}
      {repayingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
              <h3 className="text-sm font-bold text-emerald-950">Record Debt Repayment</h3>
              <button
                onClick={() => setRepayingCustomer(null)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordRepayment} className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block">Customer</span>
                <span className="text-base font-bold text-slate-900">{repayingCustomer.name}</span>
                <span className="text-xs text-amber-800 font-bold block mt-0.5">
                  Current Debt: {formatKes(repayCustomerBalance)}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Repayment Amount (KES)</label>
                <input
                  type="number"
                  step="10"
                  max={repayCustomerBalance / 100}
                  required
                  value={repayAmountKes}
                  onChange={(e) => setRepayAmountKes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-base text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRepayMethod('cash')}
                  className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border ${
                    repayMethod === 'cash'
                      ? 'bg-teal-50 border-teal-600 text-teal-900'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setRepayMethod('mpesa')}
                  className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border ${
                    repayMethod === 'mpesa'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  M-Pesa
                </button>
              </div>

              {repayMethod === 'mpesa' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    M-Pesa Confirmation Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. QK89REPAY"
                    value={repayRef}
                    onChange={(e) => setRepayRef(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs uppercase"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRepayingCustomer(null)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Save Repayment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Add New Customer</h3>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mama Kevin (Plot 12)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0712 345 678"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Credit Limit (KES)</label>
                <input
                  type="number"
                  step="500"
                  value={newLimitKes}
                  onChange={(e) => setNewLimitKes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Shop regular, lives across road"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 text-white rounded-xl font-bold hover:bg-teal-900"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
