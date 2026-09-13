import React from 'react';
import { BusinessRecommendation } from './outcome-types';
import { X, CheckCircle2, Database, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

interface EvidenceModalProps {
  isOpen: boolean;
  recommendation: BusinessRecommendation | null;
  onClose: () => void;
  onExecuteAction?: (rec: BusinessRecommendation) => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  recommendation,
  onClose,
  onExecuteAction,
}) => {
  if (!isOpen || !recommendation) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                Transparent Evidence Check
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                Why DukaFlow is Recommending This
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Suggestion */}
        <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Recommendation:
          </span>
          <p className="text-sm font-bold text-slate-900 leading-snug">
            {recommendation.headline}
          </p>
        </div>

        {/* Recorded Facts from Database */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Supporting Facts Recorded in Shop Database:</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-600">
            {recommendation.evidence.supportingData.map((fact, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80"
              >
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-medium">{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Calculation Logic / Principle */}
        <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/70 text-xs text-teal-950 space-y-1 mb-5">
          <div className="flex items-center gap-1.5 font-bold text-teal-900">
            <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
            <span>Mathematical Basis:</span>
          </div>
          <p className="text-teal-800 leading-relaxed font-medium">
            {recommendation.evidence.calculationNote}
          </p>
          <p className="text-[11px] text-teal-700 pt-1 border-t border-teal-200/50">
            Last recorded fact: {recommendation.evidence.lastRecordedFact}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
          >
            Close
          </button>

          {onExecuteAction && (
            <button
              onClick={() => {
                onExecuteAction(recommendation);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs"
            >
              {recommendation.actionLabel} &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
