import React, { useState, useEffect } from 'react';
import { localDb, LocalSale, LocalDeniTransaction } from '@/platform/database/dexie-db';
import { authService } from '@/modules/auth/auth-service';
import { formatKes, kesToCents, centsToKes } from '@/shared/formatting/money';
import {
  Calculator,
  Banknote,
  Smartphone,
  BookOpen,
  ArrowUpRight,
  Receipt,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface ExpenseItem {
  id: string;
  reason: string;
  amount: number; // KES cents
  time: string;
}

export const ShiftReconciliationView: React.FC = () => {
  const [openingFloatKes, setOpeningFloatKes] = useState('2000');
  const [sales, setSales] = useState<LocalSale[]>([]);
  const [deniTransactions, setDeniTransactions] = useState<LocalDeniTransaction[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: 'exp_1', reason: 'Packaging polythene bags', amount: 15000, time: '10:15 AM' },
    { id: 'exp_2', reason: 'Shop tea & milk', amount: 10000, time: '1:30 PM' },
  ]);

  // Expense modal
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseReason, setExpenseReason] = useState('');
  const [expenseAmountKes, setExpenseAmountKes] = useState('');

  // Cash count modal
  const [countedCashKes, setCountedCashKes] = useState('');
  const [shiftClosedMessage, setShiftClosedMessage] = useState<string | null>(null);

  const activeShop = authService.getActiveShop();

  useEffect(() => {
    if (activeShop?.id) {
      localDb.sales.where('shopId').equals(activeShop.id).toArray().then(setSales);
      localDb.deni_transactions.where('shopId').equals(activeShop.id).toArray().then(setDeniTransactions);
    } else {
      localDb.sales.toArray().then(setSales);
      localDb.deni_transactions.toArray().then(setDeniTransactions);
    }
  }, [activeShop?.id]);

  // Compute metrics
  const openingFloatCents = kesToCents(parseFloat(openingFloatKes) || 0);

  let totalCashSalesCents = 0;
  let totalMpesaSalesCents = 0;
  let totalDeniSalesCents = 0;

  for (const sale of sales) {
    for (const p of sale.payments) {
      if (p.method === 'cash') totalCashSalesCents += p.amount;
      else if (p.method === 'mpesa') totalMpesaSalesCents += p.amount;
      else if (p.method === 'deni') totalDeniSalesCents += p.amount;
    }
  }

  const cashRepaidCents = deniTransactions
    .filter((t) => t.type === 'repay' && t.notes?.includes('CASH'))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpensesCents = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Expected physical drawer cash = Opening float + cash sales + cash debt repaid - petty cash expenses
  const expectedCashCents =
    openingFloatCents + totalCashSalesCents + cashRepaidCents - totalExpensesCents;

  const countedCashNumber = parseFloat(countedCashKes);
  const countedCashCents = isNaN(countedCashNumber) ? expectedCashCents : kesToCents(countedCashNumber);
  const varianceCents = countedCashCents - expectedCashCents;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmountKes);
    if (!expenseReason.trim() || isNaN(amt) || amt <= 0) return;

    setExpenses((prev) => [
      ...prev,
      {
        id: 'exp_' + Date.now(),
        reason: expenseReason.trim(),
        amount: kesToCents(amt),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setIsAddExpenseOpen(false);
    setExpenseReason('');
    setExpenseAmountKes('');
  };

  const handleCloseShift = async () => {
    const currentUser = authService.getCurrentUser();
    const currentShopId = activeShop?.id || 'shop_main_01';
    const currentCashierId = currentUser?.id || 'cashier_joel';
    const currentCashierName = currentUser?.name || 'Cashier';

    await localDb.shifts.add({
      id: 'shift_' + Date.now(),
      shopId: currentShopId,
      cashierId: currentCashierId,
      cashierName: currentCashierName,
      openedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      closedAt: new Date().toISOString(),
      openingCash: openingFloatCents,
      closingCash: countedCashCents,
      expectedCash: expectedCashCents,
      actualCash: countedCashCents,
      cashSales: totalCashSalesCents,
      mpesaSales: totalMpesaSalesCents,
      deniGiven: totalDeniSalesCents,
      deniRepaid: cashRepaidCents,
      expenses: totalExpensesCents,
      notes: `Variance: ${formatKes(varianceCents)}`,
      status: 'closed',
    });

    setShiftClosedMessage(
      `Shift closed successfully. Counted ${formatKes(countedCashCents)} (Variance: ${formatKes(varianceCents)}). Summary stored for audit.`
    );
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Alert banner if closed */}
      {shiftClosedMessage && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-teal-700 shrink-0" />
          <span>{shiftClosedMessage}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Banknote className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-semibold">Cash Sales In Drawer</span>
          </div>
          <span className="text-xl font-black text-slate-900">{formatKes(totalCashSalesCents)}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Smartphone className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-semibold">M-Pesa Till Total</span>
          </div>
          <span className="text-xl font-black text-emerald-900">{formatKes(totalMpesaSalesCents)}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-semibold">Deni Credit Given</span>
          </div>
          <span className="text-xl font-black text-amber-900">{formatKes(totalDeniSalesCents)}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Receipt className="w-4 h-4 text-rose-700" />
            <span className="text-xs font-semibold">Shop Expenses Paid</span>
          </div>
          <span className="text-xl font-black text-rose-800">{formatKes(totalExpensesCents)}</span>
        </div>
      </div>

      {/* Main Reconciliation Calculation Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Shift Cash Drawer Balancing</h2>
            <p className="text-xs text-slate-500">
              Verify actual physical money in drawer matches logged sales and floats.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Morning Cash Float:</span>
            <div className="relative">
              <span className="absolute left-2 top-1.5 text-xs text-slate-400 font-bold">KES</span>
              <input
                type="number"
                value={openingFloatKes}
                onChange={(e) => setOpeningFloatKes(e.target.value)}
                className="w-28 pl-9 pr-2 py-1 rounded-lg border border-slate-300 text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Ledger Balance Breakdown */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-600">(+) Starting Cash Float in Morning:</span>
            <span className="font-bold text-slate-900">{formatKes(openingFloatCents)}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-600">(+) Cash Collected From Completed Sales:</span>
            <span className="font-bold text-teal-800">+{formatKes(totalCashSalesCents)}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-600">(+) Cash Received From Customer Deni Repayments:</span>
            <span className="font-bold text-emerald-800">+{formatKes(cashRepaidCents)}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-600">(-) Shop Petty Cash Out / Expenses:</span>
            <span className="font-bold text-rose-700">-{formatKes(totalExpensesCents)}</span>
          </div>

          <div className="flex justify-between py-3 text-sm font-black text-slate-900 bg-slate-50 px-3 rounded-xl">
            <span>(=) Expected Cash In Drawer:</span>
            <span className="text-teal-900 text-base">{formatKes(expectedCashCents)}</span>
          </div>
        </div>

        {/* Counted Cash and Variance Check */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-0.5">
                Physical Cash Counted At Shift End
              </label>
              <span className="text-[11px] text-slate-500">
                Count all Kenyan Shilling notes and coins in the till.
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-bold text-slate-700">KES</span>
              <input
                type="number"
                placeholder={centsToKes(expectedCashCents).toString()}
                value={countedCashKes}
                onChange={(e) => setCountedCashKes(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-black text-base text-slate-900 w-36 text-right"
              />
            </div>
          </div>

          {/* Variance Display */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Drawer Cash Variance:</span>
            <span
              className={`text-sm font-black px-2.5 py-1 rounded-md ${
                varianceCents === 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : varianceCents > 0
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {varianceCents === 0
                ? 'Balanced (KES 0.00)'
                : varianceCents > 0
                ? `Overage: +${formatKes(varianceCents)}`
                : `Shortage: -${formatKes(Math.abs(varianceCents))}`}
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleCloseShift}
              className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs active:scale-[0.98]"
            >
              Close & Balance Shift
            </button>
          </div>
        </div>
      </div>

      {/* Petty Cash Expenses Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recorded Petty Cash Out / Expenses
            </h3>
            <span className="text-[11px] text-slate-500">
              Small shop expenses deducted directly from till cash
            </span>
          </div>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>Record Expense</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {expenses.map((exp) => (
            <div key={exp.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">{exp.reason}</span>
                <span className="text-slate-400 text-[11px] ml-2">• {exp.time}</span>
              </div>
              <span className="font-black text-rose-700">-{formatKes(exp.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Record Shop Expense / Cash Out</h3>
            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lunch, Polythene bags, KPLC tokens"
                  value={expenseReason}
                  onChange={(e) => setExpenseReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (KES) *</label>
                <input
                  type="number"
                  step="5"
                  required
                  placeholder="e.g. 150"
                  value={expenseAmountKes}
                  onChange={(e) => setExpenseAmountKes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 text-white rounded-xl font-bold hover:bg-rose-800"
                >
                  Deduct from Cash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
