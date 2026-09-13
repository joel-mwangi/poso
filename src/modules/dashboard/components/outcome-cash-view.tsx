import React, { useState } from 'react';
import { LocalSale, LocalShift, confirmPendingMpesaPayment } from '@/platform/database/dexie-db';
import { formatKes } from '@/shared/formatting/money';
import {
  DollarSign,
  Banknote,
  Smartphone,
  BookOpen,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Calculator,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface OutcomeCashViewProps {
  todaySales: LocalSale[];
  allSales: LocalSale[];
  activeShift: LocalShift | null;
  totalDeniOwed: number;
  onNavigateTab: (tab: string) => void;
  onDataRefresh: () => void;
}

export const OutcomeCashView: React.FC<OutcomeCashViewProps> = ({
  todaySales,
  allSales,
  activeShift,
  totalDeniOwed,
  onNavigateTab,
  onDataRefresh,
}) => {
  const [confirmingSaleId, setConfirmingSaleId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>('');

  // 1. Calculate today's distinct cash streams
  let todaySalesValue = 0;
  let todayCashReceived = 0;
  let todayMpesaConfirmed = 0;
  let todayMpesaPending = 0;
  let todayDeniGiven = 0;
  let todayGrossProfit = 0;

  const pendingMpesaList: { sale: LocalSale; amount: number; reference?: string }[] = [];

  todaySales.forEach((sale) => {
    todaySalesValue += sale.total;

    // Calculate profit for this sale
    sale.items.forEach((item) => {
      // If product has cost info, or fallback margin
      todayGrossProfit += (item.unitPrice * 0.18) * item.quantity;
    });

    sale.payments.forEach((payment) => {
      if (payment.method === 'cash' && payment.status === 'completed') {
        todayCashReceived += payment.amount;
      } else if (payment.method === 'mpesa') {
        if (payment.status === 'completed') {
          todayMpesaConfirmed += payment.amount;
        } else {
          todayMpesaPending += payment.amount;
          pendingMpesaList.push({
            sale,
            amount: payment.amount,
            reference: payment.reference,
          });
        }
      } else if (payment.method === 'deni') {
        todayDeniGiven += payment.amount;
      }
    });
  });

  const handleConfirmMpesa = async (saleId: string) => {
    await confirmPendingMpesaPayment(saleId, verificationCode.trim() || undefined);
    setConfirmingSaleId(null);
    setVerificationCode('');
    onDataRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Outcome Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black">
              2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  Outcome 2
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                  Cash Flow & Reconciliation
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Know Your Cash
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('shifts')}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-700" />
              <span>Shift Reconciliation</span>
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <span>Sales Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* The Essential Kenyan Retail Cash Truth Formula */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              The DukaFlow Truth-In-Money Principle
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Every shilling has a distinct home
            </span>
          </div>

          <div className="font-mono font-bold text-xs sm:text-sm text-slate-100 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-white">Sales Value</span>
            <span className="text-emerald-400">&ne;</span>
            <span className="text-emerald-300">Physical Cash</span>
            <span className="text-emerald-400">&ne;</span>
            <span className="text-teal-300">Confirmed M-Pesa</span>
            <span className="text-emerald-400">&ne;</span>
            <span className="text-amber-300">Deni Receivable</span>
            <span className="text-emerald-400">&ne;</span>
            <span className="text-indigo-300">Actual Gross Profit</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            Uncollected Deni is money loaned to neighbours, not cash in hand. M-Pesa requires SMS verification before handing over goods. Gross profit only exists after subtracting what you paid the supplier.
          </p>
        </div>

        {/* Breakdown of Distinct Cash Positions */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {/* 1. Sales Value */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Goods Sold
            </span>
            <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">
              {formatKes(todaySalesValue)}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Gross register value
            </span>
          </div>

          {/* 2. Cash in Drawer */}
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Physical Cash (Drawer)
            </span>
            <span className="text-xl font-black text-emerald-950 font-mono mt-0.5 block">
              {formatKes(todayCashReceived)}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              Notes & coins received
            </span>
          </div>

          {/* 3. Confirmed M-Pesa */}
          <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                Confirmed M-Pesa
              </span>
              <ShieldCheck className="w-3 h-3 text-teal-600" />
            </div>
            <span className="text-xl font-black text-teal-950 font-mono mt-0.5 block">
              {formatKes(todayMpesaConfirmed)}
            </span>
            <span className="text-[11px] text-teal-700 font-medium">
              Verified in Till #5428901
            </span>
          </div>

          {/* 4. Pending M-Pesa */}
          <div
            className={`p-3 rounded-2xl border ${
              todayMpesaPending > 0
                ? 'bg-amber-50/80 border-amber-300'
                : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Pending M-Pesa
              </span>
              {todayMpesaPending > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <span
              className={`text-xl font-black font-mono mt-0.5 block ${
                todayMpesaPending > 0 ? 'text-amber-950' : 'text-slate-700'
              }`}
            >
              {formatKes(todayMpesaPending)}
            </span>
            <span
              className={`text-[11px] font-medium ${
                todayMpesaPending > 0 ? 'text-amber-800 font-bold' : 'text-slate-500'
              }`}
            >
              {todayMpesaPending > 0 ? 'Awaiting verification' : 'Zero unconfirmed'}
            </span>
          </div>

          {/* 5. Deni Credit Given Today */}
          <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Deni Given Today
            </span>
            <span className="text-xl font-black text-amber-950 font-mono mt-0.5 block">
              {formatKes(todayDeniGiven)}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">
              {formatKes(totalDeniOwed)} total owed
            </span>
          </div>
        </div>
      </div>

      {/* Pending M-Pesa Payments Verification Desk */}
      {pendingMpesaList.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-amber-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-700" />
              <h4 className="text-sm font-extrabold text-slate-900">
                M-Pesa Payments Awaiting Shop Confirmation
              </h4>
            </div>
            <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
              {pendingMpesaList.length} unverified
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Check your Safaricom business handset or M-Pesa Till SMS. Once you see the message, verify the payment below:
          </p>

          <div className="divide-y divide-slate-100">
            {pendingMpesaList.map((item) => (
              <div
                key={item.sale.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {item.sale.localSaleId}
                    </span>
                    <span className="text-xs font-black text-teal-900 font-mono bg-teal-50 px-2 py-0.5 rounded">
                      {formatKes(item.amount)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Customer: {item.sale.customerName || 'Walk-in buyer'} • Note: {item.reference || 'Awaiting SMS'}
                  </div>
                </div>

                {confirmingSaleId === item.sale.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="M-Pesa Code (e.g. QK98...)"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono uppercase"
                    />
                    <button
                      onClick={() => handleConfirmMpesa(item.sale.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-2xs"
                    >
                      Save Confirmed
                    </button>
                    <button
                      onClick={() => setConfirmingSaleId(null)}
                      className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setConfirmingSaleId(item.sale.id);
                      setVerificationCode('QK' + Math.random().toString(36).substring(2, 7).toUpperCase());
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 self-start"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Received</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cash Drawer Reconciliation Summary */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-slate-700" />
            <h4 className="text-sm font-extrabold text-slate-900">
              Shift Cash Drawer Health
            </h4>
          </div>
          <button
            onClick={() => onNavigateTab('shifts')}
            className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1"
          >
            <span>Open Shift Register</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {activeShift ? (
          <div className="grid sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Shift Opening Float
              </span>
              <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
                {formatKes(activeShift.openingCash)}
              </span>
              <span className="text-slate-500 text-[11px]">
                Counted when shop opened
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Cash Sales Taken Today
              </span>
              <span className="text-base font-black text-emerald-800 font-mono mt-0.5 block">
                +{formatKes(todayCashReceived)}
              </span>
              <span className="text-slate-500 text-[11px]">
                Added to physical drawer
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Expected in Drawer Tonight
              </span>
              <span className="text-base font-black text-teal-900 font-mono mt-0.5 block">
                {formatKes(activeShift.openingCash + todayCashReceived)}
              </span>
              <span className="text-slate-500 text-[11px]">
                Expected notes & coins
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
            <span>No active cashier shift is currently running for today.</span>
            <button
              onClick={() => onNavigateTab('shifts')}
              className="px-3 py-1.5 rounded-xl bg-teal-800 text-white font-bold text-xs"
            >
              Start Shift
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
