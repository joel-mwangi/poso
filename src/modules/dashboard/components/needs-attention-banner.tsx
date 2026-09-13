import React from 'react';
import { LocalProduct, LocalSale, LocalCustomer, LocalShift } from '@/platform/database/dexie-db';
import { formatKes } from '@/shared/formatting/money';
import {
  AlertTriangle,
  Package,
  Smartphone,
  BookOpen,
  Calculator,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface NeedsAttentionBannerProps {
  lowStockCount: number;
  pendingMpesaSales: LocalSale[];
  overdueDeniCustomers: LocalCustomer[];
  activeShift: LocalShift | null;
  onNavigateTab: (tab: string) => void;
  onOpenRestockModal: (product?: LocalProduct) => void;
  onConfirmPendingMpesa: (sale: LocalSale) => void;
  onSendWhatsappReminder: (customer: LocalCustomer) => void;
}

export const NeedsAttentionBanner: React.FC<NeedsAttentionBannerProps> = ({
  lowStockCount,
  pendingMpesaSales,
  overdueDeniCustomers,
  activeShift,
  onNavigateTab,
  onOpenRestockModal,
  onConfirmPendingMpesa,
  onSendWhatsappReminder,
}) => {
  const hasUrgentIssues =
    lowStockCount > 0 || pendingMpesaSales.length > 0 || overdueDeniCustomers.length > 0;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              hasUrgentIssues ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {hasUrgentIssues ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Priority 1 • Action Centre
            </h2>
            <h3 className="text-sm font-black text-slate-900">
              {hasUrgentIssues ? 'Needs Your Attention Today' : 'All Core Operations Are Up To Date'}
            </h3>
          </div>
        </div>

        <span className="text-[11px] font-bold text-slate-400">
          {hasUrgentIssues
            ? `${(lowStockCount > 0 ? 1 : 0) + (pendingMpesaSales.length > 0 ? 1 : 0) + (overdueDeniCustomers.length > 0 ? 1 : 0)} items pending`
            : 'No urgent alerts'}
        </span>
      </div>

      {/* Grid of Alert Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Low Stock Alert */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            lowStockCount > 0
              ? 'bg-amber-50/60 border-amber-200'
              : 'bg-slate-50/60 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold flex items-center gap-1.5 text-slate-800">
              <Package className="w-3.5 h-3.5 text-amber-700" />
              <span>Stock Runway</span>
            </span>
            {lowStockCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-black text-[10px]">
                {lowStockCount} LOW
              </span>
            ) : (
              <span className="text-emerald-700 font-bold text-[10px]">HEALTHY</span>
            )}
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            {lowStockCount > 0
              ? `${lowStockCount} items have reached minimum alert levels.`
              : 'All retail products have sufficient shelf stock.'}
          </p>
          {lowStockCount > 0 ? (
            <button
              onClick={() => onOpenRestockModal()}
              className="mt-2 text-[11px] font-extrabold text-amber-900 hover:underline flex items-center gap-1"
            >
              <span>Restock Shelves</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab('inventory')}
              className="mt-2 text-[11px] font-bold text-slate-500 hover:underline flex items-center gap-1"
            >
              <span>Check Inventory</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* 2. Pending M-Pesa Alert */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            pendingMpesaSales.length > 0
              ? 'bg-amber-50/60 border-amber-200'
              : 'bg-slate-50/60 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold flex items-center gap-1.5 text-slate-800">
              <Smartphone className="w-3.5 h-3.5 text-teal-800" />
              <span>M-Pesa Till Verification</span>
            </span>
            {pendingMpesaSales.length > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-black text-[10px]">
                {pendingMpesaSales.length} PENDING
              </span>
            ) : (
              <span className="text-emerald-700 font-bold text-[10px]">CONFIRMED</span>
            )}
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            {pendingMpesaSales.length > 0
              ? `${pendingMpesaSales.length} sale waiting for Till confirmation.`
              : 'All recorded M-Pesa payments have been verified.'}
          </p>
          {pendingMpesaSales.length > 0 ? (
            <button
              onClick={() => onConfirmPendingMpesa(pendingMpesaSales[0])}
              className="mt-2 text-[11px] font-extrabold text-teal-900 hover:underline flex items-center gap-1"
            >
              <span>Confirm Reference ({pendingMpesaSales[0].localSaleId})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <span className="mt-2 block text-[11px] font-medium text-slate-400">
              Till #5428901 active
            </span>
          )}
        </div>

        {/* 3. Deni Debtors Needing Follow-up */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            overdueDeniCustomers.length > 0
              ? 'bg-amber-50/60 border-amber-200'
              : 'bg-slate-50/60 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold flex items-center gap-1.5 text-slate-800">
              <BookOpen className="w-3.5 h-3.5 text-amber-800" />
              <span>Deni Debt Collection</span>
            </span>
            {overdueDeniCustomers.length > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-black text-[10px]">
                {overdueDeniCustomers.length} OWED
              </span>
            ) : (
              <span className="text-emerald-700 font-bold text-[10px]">BALANCED</span>
            )}
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            {overdueDeniCustomers.length > 0
              ? `${overdueDeniCustomers[0].name} owes ${formatKes(overdueDeniCustomers[0].deniBalance)}.`
              : 'No customers are currently overdue on credit.'}
          </p>
          {overdueDeniCustomers.length > 0 ? (
            <button
              onClick={() => onSendWhatsappReminder(overdueDeniCustomers[0])}
              className="mt-2 text-[11px] font-extrabold text-amber-900 hover:underline flex items-center gap-1"
            >
              <span>Send WhatsApp Reminder</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab('deni')}
              className="mt-2 text-[11px] font-bold text-slate-500 hover:underline flex items-center gap-1"
            >
              <span>View Credit Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
