import React, { useState } from 'react';
import { BusinessRecommendation } from './outcome-types';
import {
  TrendingUp,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ShieldCheck,
} from 'lucide-react';

interface OutcomeGrowthViewProps {
  recommendations: BusinessRecommendation[];
  onOpenEvidence: (rec: BusinessRecommendation) => void;
  onExecuteAction: (rec: BusinessRecommendation) => void;
  onNavigateTab: (tab: string) => void;
}

export const OutcomeGrowthView: React.FC<OutcomeGrowthViewProps> = ({
  recommendations,
  onOpenEvidence,
  onExecuteAction,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-4">
      {/* Outcome Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-700 text-white flex items-center justify-center font-black">
              4
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-800">
                  Outcome 4
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 font-bold text-[10px]">
                  Explainable Business Decisions
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Grow Your Business
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-3.5 py-2 rounded-xl bg-indigo-800 hover:bg-indigo-900 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <span>Margins & Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Explainability Pledge */}
        <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-bold">Transparent decisions, no guesswork:</strong> Every recommendation below is calculated directly from recorded sales, stock movements, and customer balances. Click <em>"Explain Why"</em> on any item to view the underlying database facts and math.
          </p>
        </div>
      </div>

      {/* Decision Cards List */}
      <div className="space-y-3">
        {recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      rec.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : rec.priority === 'important'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {rec.priority}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {rec.title}
                  </span>
                </div>

                <button
                  onClick={() => onOpenEvidence(rec)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                  title="View the exact recorded receipts and math that produced this recommendation"
                >
                  <Database className="w-3 h-3 text-teal-800" />
                  <span>Explain Why</span>
                </button>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  {rec.headline}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {rec.evidence.calculationNote}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Based on {rec.evidence.recordsCount} recorded database event{rec.evidence.recordsCount > 1 ? 's' : ''}
                </span>

                <button
                  onClick={() => onExecuteAction(rec)}
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
                >
                  <span>{rec.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Building Shop Velocity History
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Continue recording your everyday Cash, M-Pesa, and Deni sales. As your sales history grows, DukaFlow will surface restock guidance, customer buying patterns, and margin opportunities here.
            </p>
          </div>
        )}
      </div>

      {/* Owner Daily Rhythm Checklist */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <h4 className="text-sm font-extrabold text-slate-900">
            DukaFlow Shopkeeper Daily Routine
          </h4>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="font-extrabold text-slate-900 block">1. Morning Opening</span>
            <p className="text-slate-500 leading-snug">
              Count opening cash float in drawer. Check products running low on shelf and submit supplier orders.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="font-extrabold text-slate-900 block">2. During the Day</span>
            <p className="text-slate-500 leading-snug">
              Ring up every sale. Confirm customer M-Pesa SMS codes immediately before letting goods leave the counter.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="font-extrabold text-slate-900 block">3. Evening Closing</span>
            <p className="text-slate-500 leading-snug">
              Perform drawer shift count. Check Deni debtors and send friendly WhatsApp reminders to preserve cash flow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
