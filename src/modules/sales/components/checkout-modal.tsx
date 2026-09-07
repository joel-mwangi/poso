import React, { useState, useEffect } from 'react';
import { localDb, LocalProduct, LocalCustomer, LocalSale, LocalPayment } from '@/platform/database/dexie-db';
import { syncService } from '@/modules/sync/sync-service';
import { formatKes, formatKesCompact, kesToCents } from '@/shared/formatting/money';
import { X, Banknote, Smartphone, BookOpen, Check, AlertCircle, UserCheck } from 'lucide-react';

interface CartItem {
  product: LocalProduct;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  totalAmount: number; // KES cents
  onSaleCompleted: (completedSale: LocalSale) => void;
}

type PaymentMethod = 'cash' | 'mpesa' | 'deni' | 'split';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  totalAmount,
  onSaleCompleted,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  
  // Cash states
  const [cashTenderedKes, setCashTenderedKes] = useState<string>('');
  
  // M-Pesa states
  const [mpesaReference, setMpesaReference] = useState<string>('');
  const [mpesaPhone, setMpesaPhone] = useState<string>('');
  const [isStkSent, setIsStkSent] = useState(false);

  // Deni states
  const [customers, setCustomers] = useState<LocalCustomer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [deniNotes, setDeniNotes] = useState<string>('To pay next weekend');

  // Split states
  const [splitCashKes, setSplitCashKes] = useState<string>('');
  const [splitMpesaRef, setSplitMpesaRef] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Pre-fill exact cash
      setCashTenderedKes((totalAmount / 100).toString());
      setMpesaReference('QK' + Math.random().toString(36).substring(2, 7).toUpperCase());
      setSplitCashKes((Math.floor(totalAmount / 200) * 100).toString());
      
      // Load customers
      localDb.customers.toArray().then((custs) => {
        setCustomers(custs);
        if (custs.length > 0) setSelectedCustomerId(custs[0].id);
      });
    }
  }, [isOpen, totalAmount]);

  if (!isOpen) return null;

  const totalShillings = totalAmount / 100;
  const cashGivenNumber = parseFloat(cashTenderedKes) || 0;
  const changeCents = Math.max(0, kesToCents(cashGivenNumber) - totalAmount);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleQuickCashPreset = (amount: number) => {
    setCashTenderedKes(amount.toString());
  };

  const handleSimulateStk = () => {
    if (!mpesaPhone || mpesaPhone.length < 9) {
      setError('Please enter a valid phone number (e.g. 0712345678)');
      return;
    }
    setError(null);
    setIsStkSent(true);
    setTimeout(() => {
      setMpesaReference('STK' + Math.random().toString(36).substring(2, 8).toUpperCase());
      setIsStkSent(false);
    }, 1500);
  };

  const handleCompleteSale = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      const saleId = 'sale_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const localSaleId = 'REC-' + Math.floor(100000 + Math.random() * 900000);
      const payments: LocalPayment[] = [];

      if (method === 'cash') {
        if (kesToCents(cashGivenNumber) < totalAmount) {
          setError(`Cash given is less than the total of ${formatKes(totalAmount)}`);
          setIsProcessing(false);
          return;
        }
        payments.push({
          id: 'pay_' + crypto.randomUUID(),
          saleId,
          method: 'cash',
          amount: totalAmount,
          status: 'completed',
          createdAt: new Date().toISOString(),
        });
      } else if (method === 'mpesa') {
        if (!mpesaReference.trim()) {
          setError('M-Pesa reference code is required (e.g. QK89...)');
          setIsProcessing(false);
          return;
        }
        payments.push({
          id: 'pay_' + crypto.randomUUID(),
          saleId,
          method: 'mpesa',
          amount: totalAmount,
          reference: mpesaReference.trim().toUpperCase(),
          status: 'completed',
          createdAt: new Date().toISOString(),
        });
      } else if (method === 'deni') {
        if (!selectedCustomer) {
          setError('Please select a customer for Deni credit ledger');
          setIsProcessing(false);
          return;
        }
        const newDeniTotal = selectedCustomer.deniBalance + totalAmount;
        if (selectedCustomer.deniLimit && newDeniTotal > selectedCustomer.deniLimit) {
          setError(
            `Customer exceeds credit limit! Current: ${formatKes(selectedCustomer.deniBalance)}, Limit: ${formatKes(selectedCustomer.deniLimit)}`
          );
          setIsProcessing(false);
          return;
        }

        payments.push({
          id: 'pay_' + crypto.randomUUID(),
          saleId,
          method: 'deni',
          amount: totalAmount,
          reference: `Customer: ${selectedCustomer.name}`,
          status: 'completed',
          createdAt: new Date().toISOString(),
        });

        // Update customer balance
        await localDb.customers.update(selectedCustomer.id, {
          deniBalance: newDeniTotal,
          updatedAt: new Date().toISOString(),
        });

        // Record Deni transaction
        await localDb.deni_transactions.add({
          id: 'deni_tx_' + Date.now(),
          shopId: 'shop_main_01',
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          saleId,
          type: 'borrow',
          amount: totalAmount,
          balanceAfter: newDeniTotal,
          notes: deniNotes,
          createdAt: new Date().toISOString(),
          synced: false,
        });
      } else if (method === 'split') {
        const splitCashVal = parseFloat(splitCashKes) || 0;
        const splitCashCents = kesToCents(splitCashVal);
        const splitMpesaCents = totalAmount - splitCashCents;

        if (splitCashCents <= 0 || splitMpesaCents <= 0) {
          setError('Split amounts must both be greater than 0');
          setIsProcessing(false);
          return;
        }

        payments.push({
          id: 'pay_split_cash_' + crypto.randomUUID(),
          saleId,
          method: 'cash',
          amount: splitCashCents,
          status: 'completed',
          createdAt: new Date().toISOString(),
        });

        payments.push({
          id: 'pay_split_mpesa_' + crypto.randomUUID(),
          saleId,
          method: 'mpesa',
          amount: splitMpesaCents,
          reference: splitMpesaRef.trim().toUpperCase() || 'MPESA-SPLIT',
          status: 'completed',
          createdAt: new Date().toISOString(),
        });
      }

      // Decrement inventory stock locally
      for (const item of cart) {
        const product = await localDb.products.get(item.product.id);
        if (product) {
          const newStock = Math.max(0, product.currentStock - item.quantity);
          await localDb.products.update(item.product.id, {
            currentStock: newStock,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      const completedSale: LocalSale = {
        id: saleId,
        localSaleId,
        shopId: 'shop_main_01',
        organizationId: 'org_duka_01',
        cashierId: 'cashier_joel',
        cashierName: 'Joel G.',
        customerId: method === 'deni' ? selectedCustomer?.id : undefined,
        customerName: method === 'deni' ? selectedCustomer?.name : undefined,
        subtotal: totalAmount,
        discount: 0,
        total: totalAmount,
        status: 'completed',
        paymentStatus: 'paid',
        items: cart.map((c) => ({
          id: 'item_' + crypto.randomUUID(),
          saleId,
          productId: c.product.id,
          productName: c.product.name,
          unitPrice: c.product.sellingPrice,
          quantity: c.quantity,
          total: c.product.sellingPrice * c.quantity,
        })),
        payments,
        notes: method === 'deni' ? deniNotes : undefined,
        createdAt: new Date().toISOString(),
        synced: false,
      };

      await localDb.sales.add(completedSale);
      await syncService.queueOperation('sale', 'insert', completedSale);

      onSaleCompleted(completedSale);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error processing sale');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
              Complete Payment
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900">
                {formatKes(totalAmount)}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                ({cart.reduce((acc, i) => acc + i.quantity, 0)} items)
              </span>
            </div>
          </div>
          <button
            id="close-checkout-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Methods Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
          <button
            type="button"
            id="tab-method-cash"
            onClick={() => { setMethod('cash'); setError(null); }}
            className={`py-2.5 rounded-xl flex flex-col items-center gap-1 transition-all ${
              method === 'cash'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Banknote className="w-4 h-4" />
            Cash
          </button>

          <button
            type="button"
            id="tab-method-mpesa"
            onClick={() => { setMethod('mpesa'); setError(null); }}
            className={`py-2.5 rounded-xl flex flex-col items-center gap-1 transition-all ${
              method === 'mpesa'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            M-Pesa
          </button>

          <button
            type="button"
            id="tab-method-deni"
            onClick={() => { setMethod('deni'); setError(null); }}
            className={`py-2.5 rounded-xl flex flex-col items-center gap-1 transition-all ${
              method === 'deni'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Deni (Credit)
          </button>

          <button
            type="button"
            id="tab-method-split"
            onClick={() => { setMethod('split'); setError(null); }}
            className={`py-2.5 rounded-xl flex flex-col items-center gap-1 transition-all ${
              method === 'split'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-xs font-bold leading-none mt-0.5">½</span>
            Split
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* CASH VIEW */}
          {method === 'cash' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cash Received (KES)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-600 font-bold text-sm">
                    KES
                  </span>
                  <input
                    id="input-cash-tendered"
                    type="number"
                    step="5"
                    value={cashTenderedKes}
                    onChange={(e) => setCashTenderedKes(e.target.value)}
                    className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-700 text-lg font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                  Quick Note Presets
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickCashPreset(totalShillings)}
                    className="py-2 px-2 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800"
                  >
                    Exact
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCashPreset(Math.ceil(totalShillings / 500) * 500 || 500)}
                    className="py-2 px-2 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800"
                  >
                    KES {Math.ceil(totalShillings / 500) * 500 || 500}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCashPreset(1000)}
                    className="py-2 px-2 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800"
                  >
                    KES 1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCashPreset(2000)}
                    className="py-2 px-2 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800"
                  >
                    KES 2,000
                  </button>
                </div>
              </div>

              {/* Change Output */}
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-teal-900">Change Due to Customer</span>
                <span className="text-lg font-extrabold text-teal-800">
                  {formatKes(changeCents)}
                </span>
              </div>
            </div>
          )}

          {/* M-PESA VIEW */}
          {method === 'mpesa' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-emerald-900">Shop Buy Goods / Till:</span>
                  <span className="font-mono font-bold text-emerald-950 text-sm bg-white px-2 py-0.5 rounded border border-emerald-300">
                    5428901
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-emerald-700">Till Name:</span>
                  <span className="font-semibold text-emerald-900">DUKAFLOW CENTRAL NAIROBI</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  M-Pesa Transaction Code * (From Customer's SMS)
                </label>
                <input
                  id="input-mpesa-ref"
                  type="text"
                  placeholder="e.g. QK89XZ77P"
                  value={mpesaReference}
                  onChange={(e) => setMpesaReference(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-700 font-mono font-bold text-slate-900 text-sm uppercase tracking-wider"
                />
              </div>

              {/* Optional STK push prompt */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Or Send M-Pesa STK Prompt to Phone
                </span>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="07XX XXX XXX"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleSimulateStk}
                    disabled={isStkSent}
                    className="px-3 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 disabled:opacity-50"
                  >
                    {isStkSent ? 'Sending prompt...' : 'Prompt Phone'}
                  </button>
                </div>
                {isStkSent && (
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium animate-pulse">
                    STK Push prompt sent! Waiting for customer PIN...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* DENI VIEW */}
          {method === 'deni' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Customer for Credit Ledger *
                </label>
                <select
                  id="select-deni-customer"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) — Existing debt: {formatKesCompact(c.deniBalance)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-800 font-medium">Customer:</span>
                    <span className="font-bold text-amber-950">{selectedCustomer.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-800 font-medium">Current Debt:</span>
                    <span className="font-bold text-amber-900">{formatKes(selectedCustomer.deniBalance)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-800 font-medium">+ This New Sale:</span>
                    <span className="font-bold text-amber-900">{formatKes(totalAmount)}</span>
                  </div>
                  <div className="pt-1.5 border-t border-amber-200/70 flex items-center justify-between text-sm">
                    <span className="font-bold text-amber-950">New Total Debt:</span>
                    <span className="font-extrabold text-amber-950">
                      {formatKes(selectedCustomer.deniBalance + totalAmount)}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Promised Settlement Date / Notes
                </label>
                <input
                  id="input-deni-notes"
                  type="text"
                  placeholder="e.g. Will settle Friday when salary arrives"
                  value={deniNotes}
                  onChange={(e) => setDeniNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-600 text-xs"
                />
              </div>
            </div>
          )}

          {/* SPLIT VIEW */}
          {method === 'split' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cash Portion (KES)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={splitCashKes}
                    onChange={(e) => setSplitCashKes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    M-Pesa Portion
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm font-bold text-emerald-800">
                    {formatKes(Math.max(0, totalAmount - kesToCents(parseFloat(splitCashKes) || 0)))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  M-Pesa Code for Remaining Amount
                </label>
                <input
                  type="text"
                  placeholder="e.g. QK99SPLIT"
                  value={splitMpesaRef}
                  onChange={(e) => setSplitMpesaRef(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs uppercase"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Cancel
          </button>

          <button
            id="confirm-checkout-btn"
            type="button"
            disabled={isProcessing}
            onClick={handleCompleteSale}
            className="flex-1 py-3 px-4 bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            {isProcessing ? 'Confirming Sale...' : `Confirm & Issue Receipt (${formatKes(totalAmount)})`}
          </button>
        </div>
      </div>
    </div>
  );
};
