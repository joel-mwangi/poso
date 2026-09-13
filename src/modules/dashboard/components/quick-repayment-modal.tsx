import React, { useState } from 'react';
import { localDb, LocalCustomer } from '@/platform/database/dexie-db';
import { syncService } from '@/modules/sync/sync-service';
import { formatKes, kesToCents } from '@/shared/formatting/money';
import { X, Banknote, Smartphone, Check, BookOpen } from 'lucide-react';

interface QuickRepaymentModalProps {
  isOpen: boolean;
  customer: LocalCustomer | null;
  onClose: () => void;
  onRepaymentRecorded: () => void;
}

export const QuickRepaymentModal: React.FC<QuickRepaymentModalProps> = ({
  isOpen,
  customer,
  onClose,
  onRepaymentRecorded,
}) => {
  const [amountKes, setAmountKes] = useState<string>('');
  const [method, setMethod] = useState<'cash' | 'mpesa'>('cash');
  const [ref, setRef] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !customer) return null;

  const handlePayFull = () => {
    setAmountKes((customer.deniBalance / 100).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amountKes);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const amountCents = kesToCents(amountNum);
    setIsSubmitting(true);

    try {
      const newBalance = Math.max(0, customer.deniBalance - amountCents);

      // Update customer balance
      await localDb.customers.update(customer.id, {
        deniBalance: newBalance,
        updatedAt: new Date().toISOString(),
      });

      // Record transaction
      const txId = 'deni_tx_' + Date.now();
      await localDb.deni_transactions.add({
        id: txId,
        shopId: customer.shopId || 'shop_main_01',
        customerId: customer.id,
        customerName: customer.name,
        type: 'repay',
        amount: amountCents,
        balanceAfter: newBalance,
        notes: `Quick repayment via ${method.toUpperCase()} ${ref ? `(${ref})` : ''}`,
        createdAt: new Date().toISOString(),
        synced: false,
      });

      // Queue in outbox
      await syncService.queueOperation('deni', 'insert', {
        id: txId,
        customerId: customer.id,
        amount: amountCents,
        balanceAfter: newBalance,
        method,
      });

      onRepaymentRecorded();
      onClose();
    } catch (err) {
      console.error('Failed to record repayment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                Record Deni Repayment
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                {customer.name}
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

        <div className="my-4 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block">Total Owed by Customer:</span>
            <span className="text-xl font-black text-amber-950">
              {formatKes(customer.deniBalance)}
            </span>
          </div>
          <button
            type="button"
            onClick={handlePayFull}
            className="px-3 py-1.5 rounded-xl bg-amber-800 text-white font-bold text-[11px] shadow-2xs hover:bg-amber-900"
          >
            Pay Full Balance
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Amount Paid (KES):
            </label>
            <input
              type="number"
              min="1"
              step="any"
              placeholder="e.g. 500"
              value={amountKes}
              onChange={(e) => setAmountKes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-700 text-base font-black text-slate-900"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Payment Received Via:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  method === 'cash'
                    ? 'border-teal-800 bg-teal-50 text-teal-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-700" />
                <span>Cash in Drawer</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('mpesa')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  method === 'mpesa'
                    ? 'border-teal-800 bg-teal-50 text-teal-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-teal-800" />
                <span>M-Pesa Till</span>
              </button>
            </div>
          </div>

          {method === 'mpesa' && (
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                M-Pesa Reference / Code (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. QK89201"
                value={ref}
                onChange={(e) => setRef(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase"
              />
            </div>
          )}

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
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
