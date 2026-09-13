import React, { useState } from 'react';
import { LocalCustomer, LocalSale } from '@/platform/database/dexie-db';
import { CustomerInsight } from './outcome-types';
import { formatKes } from '@/shared/formatting/money';
import {
  Users,
  BookOpen,
  ArrowRight,
  Phone,
  MessageSquare,
  DollarSign,
  AlertCircle,
  Star,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface OutcomeCustomersViewProps {
  customers: LocalCustomer[];
  customerInsights: CustomerInsight[];
  onOpenRepaymentModal: (customer: LocalCustomer) => void;
  onSendWhatsappReminder: (customer: LocalCustomer) => void;
  onNavigateTab: (tab: string) => void;
}

export const OutcomeCustomersView: React.FC<OutcomeCustomersViewProps> = ({
  customers,
  customerInsights,
  onOpenRepaymentModal,
  onSendWhatsappReminder,
  onNavigateTab,
}) => {
  const [filter, setFilter] = useState<'all' | 'deni' | 'returning'>('all');

  const debtors = customers.filter((c) => c.deniBalance > 0);
  const totalDeniAmount = debtors.reduce((sum, c) => sum + c.deniBalance, 0);

  // Returning customers (those with > 1 visits or notable spend)
  const returningCustomers = customerInsights.filter(
    (ci) => ci.purchaseCount >= 1 || ci.totalSpend > 0
  );

  const displayedList =
    filter === 'deni'
      ? customerInsights.filter((ci) => ci.customer.deniBalance > 0)
      : filter === 'returning'
      ? returningCustomers
      : customerInsights;

  return (
    <div className="space-y-4">
      {/* Outcome Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-700 text-white flex items-center justify-center font-black">
              3
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                  Outcome 3
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px]">
                  Community & Credit Ledger
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Understand Your Customers
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('deni')}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>Full Deni Ledger</span>
            </button>
            <button
              onClick={() => onNavigateTab('customers')}
              className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <span>Manage Customers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Customer Truth Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Registered Buyers
            </span>
            <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">
              {customers.length} people
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Saved in local shop directory
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Returning Regulars
            </span>
            <span className="text-xl font-black text-teal-900 font-mono mt-0.5 block">
              {returningCustomers.length} regulars
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Multiple documented visits
            </span>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Active Debtors (Deni)
            </span>
            <span className="text-xl font-black text-amber-950 font-mono mt-0.5 block">
              {debtors.length} buyers
            </span>
            <span className="text-[11px] text-amber-800 font-medium">
              Currently holding goods on credit
            </span>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Total Deni Balance
            </span>
            <span className="text-xl font-black text-amber-950 font-mono mt-0.5 block">
              {formatKes(totalDeniAmount)}
            </span>
            <span className="text-[11px] text-amber-800 font-medium">
              Outstanding working capital
            </span>
          </div>
        </div>
      </div>

      {/* Customer List & Action Hub */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400">
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span>Customer Relationship & Credit Status</span>
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">
              Returning Regulars & Deni Balances
            </h4>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setFilter('deni')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filter === 'deni'
                  ? 'bg-white text-amber-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Has Deni ({debtors.length})
            </button>
            <button
              onClick={() => setFilter('returning')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filter === 'returning'
                  ? 'bg-white text-teal-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Regulars ({returningCustomers.length})
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {displayedList.map((item) => {
            const hasDeni = item.customer.deniBalance > 0;
            const isOverLimit =
              item.customer.deniLimit && item.customer.deniBalance > item.customer.deniLimit;

            return (
              <div
                key={item.customer.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {item.customer.name}
                    </span>
                    {item.purchaseCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-teal-800" />
                        <span>{item.purchaseCount} visit{item.purchaseCount > 1 ? 's' : ''}</span>
                      </span>
                    )}
                    {item.isOverdue && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        {item.deniAgingDays}d Overdue
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{item.customer.phone || 'No phone recorded'}</span>
                    </span>

                    {item.favoriteProduct && (
                      <span>• Favorite: <strong className="text-slate-700">{item.favoriteProduct}</strong></span>
                    )}

                    {item.customer.notes && (
                      <span>• Note: <span className="italic text-slate-600">{item.customer.notes}</span></span>
                    )}
                  </div>

                  {hasDeni && (
                    <div className="flex items-center gap-3 pt-0.5">
                      <span className="text-xs font-bold text-amber-950">
                        Owes: {formatKes(item.customer.deniBalance)}
                      </span>
                      {item.customer.deniLimit && (
                        <span className="text-[11px] text-slate-400">
                          (Limit: {formatKes(item.customer.deniLimit)})
                        </span>
                      )}
                      {isOverLimit && (
                        <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                          OVER LIMIT
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Direct Shopkeeper Actions */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  {hasDeni && (
                    <>
                      <button
                        onClick={() => onSendWhatsappReminder(item.customer)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
                        title="Send courteous payment reminder via WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Reminder</span>
                      </button>

                      <button
                        onClick={() => onOpenRepaymentModal(item.customer)}
                        className="px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
                        title="Record customer paying down their debt"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Record Pay</span>
                      </button>
                    </>
                  )}

                  {!hasDeni && (
                    <button
                      onClick={() => onNavigateTab('pos')}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
                    >
                      Ring Up Sale
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
