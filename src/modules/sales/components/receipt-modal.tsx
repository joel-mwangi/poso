import React from 'react';
import { LocalSale } from '@/platform/database/dexie-db';
import { formatKes } from '@/shared/formatting/money';
import { Printer, CheckCircle, X, Share2 } from 'lucide-react';

interface ReceiptModalProps {
  sale: LocalSale | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-teal-50/50">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-700" />
            <span className="font-bold text-teal-900 text-sm">Sale Completed</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 overflow-y-auto bg-white flex-1 font-mono text-xs text-slate-800 space-y-4">
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <h2 className="text-base font-black tracking-tight text-slate-900 uppercase">
              DUKAFLOW CENTRAL
            </h2>
            <p className="text-[11px] text-slate-600">Nairobi CBD Branch • Tom Mboya St</p>
            <p className="text-[11px] text-slate-600">Tel: +254 712 345 678</p>
            <div className="pt-2 text-[10px] text-slate-500 flex justify-between">
              <span>Receipt: #{sale.localSaleId}</span>
              <span>{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="text-[10px] text-slate-500 text-left">
              <span>Date: {new Date(sale.createdAt).toLocaleDateString('en-KE')}</span>
            </div>
            <div className="text-[10px] text-slate-500 text-left">
              <span>Cashier: {sale.cashierName}</span>
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between font-bold text-slate-900 text-[11px]">
              <span>ITEM</span>
              <span>QTY × PRICE</span>
              <span>TOTAL</span>
            </div>
            {sale.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start text-[11px]">
                <div className="max-w-[170px] truncate">
                  <p className="font-medium text-slate-900 truncate">{item.productName}</p>
                </div>
                <div className="text-slate-600 text-[10px]">
                  {item.quantity} × {formatKes(item.unitPrice)}
                </div>
                <div className="font-semibold text-slate-900 text-right">
                  {formatKes(item.total)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-semibold">{formatKes(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-xs text-rose-600">
                <span>Discount:</span>
                <span>-{formatKes(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-950 pt-1">
              <span>TOTAL:</span>
              <span>{formatKes(sale.total)}</span>
            </div>
          </div>

          {/* Payments Breakdown */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
            <span className="font-bold text-slate-900 block mb-1">PAYMENT DETAILS:</span>
            {sale.payments.map((p) => (
              <div key={p.id} className="flex justify-between">
                <span className="capitalize text-slate-600">
                  {p.method === 'mpesa' ? `M-Pesa (${p.reference || ''})` : p.method === 'deni' ? `Deni Credit (${sale.customerName || 'Ledger'})` : 'Cash'}
                </span>
                <span className="font-bold">{formatKes(p.amount)}</span>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="text-center pt-2 space-y-1 text-[10px] text-slate-500">
            <p className="font-semibold">Asante kwa kununua nasi!</p>
            <p>Goods once sold are not returnable without receipt.</p>
            <p className="text-[9px] text-slate-400 pt-1">Powered by DukaFlow POS • Offline-Ready</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            Print Thermal
          </button>

          <button
            id="new-sale-btn"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
          >
            Start Next Sale
          </button>
        </div>
      </div>
    </div>
  );
};
