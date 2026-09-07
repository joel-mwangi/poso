import React, { useState, useEffect } from 'react';
import {
  localDb,
  LocalSupplier,
  LocalPurchase,
  LocalProduct,
  LocalPurchaseItem,
} from '@/platform/database/dexie-db';
import { authService } from '@/modules/auth/auth-service';
import { formatKes } from '@/shared/formatting/money';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Clock,
  Building,
  Phone,
  FileText,
  X,
  PackageCheck,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react';

export const PurchasingView: React.FC = () => {
  const activeShop = authService.getActiveShop();
  const currentOrg = authService.getCurrentOrg();

  const [suppliers, setSuppliers] = useState<LocalSupplier[]>([]);
  const [purchases, setPurchases] = useState<LocalPurchase[]>([]);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'purchases' | 'suppliers'>('purchases');

  // New Purchase Modal
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<LocalPurchaseItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa' | 'credit'>('cash');
  const [paidAmountKes, setPaidAmountKes] = useState<number>(0);
  const [purchaseNotes, setPurchaseNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Supplier Modal
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');
  const [newSupplierNotes, setNewSupplierNotes] = useState('');

  const loadData = async () => {
    if (!activeShop) return;
    const [suppList, purchList, prodList] = await Promise.all([
      localDb.suppliers.where('shopId').equals(activeShop.id).toArray(),
      localDb.purchases.where('shopId').equals(activeShop.id).reverse().sortBy('createdAt'),
      localDb.products.where('shopId').equals(activeShop.id).toArray(),
    ]);

    setSuppliers(suppList);
    setPurchases(purchList);
    setProducts(prodList);
  };

  useEffect(() => {
    loadData();
  }, [activeShop?.id]);

  // Handle Add Item to Purchase Draft
  const handleAddItem = (product: LocalProduct) => {
    const existing = purchaseItems.find((i) => i.productId === product.id);
    if (existing) {
      setPurchaseItems(
        purchaseItems.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, totalCost: (i.quantity + 1) * i.unitCost }
            : i
        )
      );
    } else {
      setPurchaseItems([
        ...purchaseItems,
        {
          productId: product.id,
          productName: product.name,
          unitCost: product.costPrice,
          quantity: 1,
          totalCost: product.costPrice,
        },
      ]);
    }
  };

  const handleUpdateItemQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setPurchaseItems(purchaseItems.filter((i) => i.productId !== productId));
    } else {
      setPurchaseItems(
        purchaseItems.map((i) =>
          i.productId === productId
            ? { ...i, quantity: newQty, totalCost: newQty * i.unitCost }
            : i
        )
      );
    }
  };

  const handleUpdateItemCost = (productId: string, newUnitCostKes: number) => {
    const costCents = Math.round(newUnitCostKes * 100);
    setPurchaseItems(
      purchaseItems.map((i) =>
        i.productId === productId
          ? { ...i, unitCost: costCents, totalCost: i.quantity * costCents }
          : i
      )
    );
  };

  const totalPurchaseCost = purchaseItems.reduce((acc, i) => acc + i.totalCost, 0);

  // Auto-set paid amount when payment method changes
  useEffect(() => {
    if (paymentMethod === 'credit') {
      setPaidAmountKes(0);
    } else {
      setPaidAmountKes(totalPurchaseCost / 100);
    }
  }, [paymentMethod, totalPurchaseCost]);

  // Submit Received Purchase
  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShop || !currentOrg || purchaseItems.length === 0 || !selectedSupplierId) return;

    setIsSubmitting(true);
    try {
      const supplier = suppliers.find((s) => s.id === selectedSupplierId);
      const paidCents = Math.round(paidAmountKes * 100);
      const balanceDue = Math.max(0, totalPurchaseCost - paidCents);

      const purchaseId = `purch_${Date.now()}`;
      const newPurchase: LocalPurchase = {
        id: purchaseId,
        shopId: activeShop.id,
        organizationId: currentOrg.id,
        supplierId: selectedSupplierId,
        supplierName: supplier?.name || 'Supplier',
        invoiceNumber: invoiceNumber.trim() || `INV-${Date.now().toString().slice(-6)}`,
        totalCost: totalPurchaseCost,
        paidAmount: paidCents,
        balanceDue,
        paymentMethod,
        status: 'received',
        items: purchaseItems,
        notes: purchaseNotes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      // 1. Save purchase
      await localDb.purchases.add(newPurchase);

      // 2. Increment stock in products table & record stock movement audit
      for (const item of purchaseItems) {
        const prod = await localDb.products.get(item.productId);
        if (prod) {
          const updatedStock = prod.currentStock + item.quantity;
          await localDb.products.update(item.productId, {
            currentStock: updatedStock,
            costPrice: item.unitCost, // Update latest cost price
            updatedAt: new Date().toISOString(),
          });

          await localDb.stock_movements.add({
            id: `sm_${Date.now()}_${item.productId}`,
            shopId: activeShop.id,
            productId: item.productId,
            productName: item.productName,
            quantityChange: item.quantity,
            balanceAfter: updatedStock,
            reason: 'purchase_received',
            referenceId: purchaseId,
            notes: `Delivery from ${newPurchase.supplierName} (Inv: ${newPurchase.invoiceNumber})`,
            performedBy: authService.getCurrentUser()?.name || 'Owner',
            createdAt: new Date().toISOString(),
          });
        }
      }

      // 3. Update supplier balance owed if purchase is on credit or partial payment
      if (balanceDue > 0 && supplier) {
        await localDb.suppliers.update(supplier.id, {
          balanceOwed: (supplier.balanceOwed || 0) + balanceDue,
          updatedAt: new Date().toISOString(),
        });
      }

      // Reset form
      setIsNewPurchaseOpen(false);
      setPurchaseItems([]);
      setInvoiceNumber('');
      setPurchaseNotes('');
      await loadData();
    } catch (err) {
      console.error('Failed to record purchase:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit New Supplier
  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShop || !currentOrg || !newSupplierName.trim()) return;

    const suppId = `supp_${Date.now()}`;
    const newSupp: LocalSupplier = {
      id: suppId,
      shopId: activeShop.id,
      organizationId: currentOrg.id,
      name: newSupplierName.trim(),
      phone: newSupplierPhone.trim() || '0700000000',
      contactPerson: newSupplierContact.trim() || undefined,
      notes: newSupplierNotes.trim() || undefined,
      balanceOwed: 0,
      updatedAt: new Date().toISOString(),
    };

    await localDb.suppliers.add(newSupp);
    setIsNewSupplierOpen(false);
    setNewSupplierName('');
    setNewSupplierPhone('');
    setNewSupplierContact('');
    setNewSupplierNotes('');
    await loadData();
  };

  // Financial Summary Cards
  const totalPayables = suppliers.reduce((acc, s) => acc + (s.balanceOwed || 0), 0);
  const totalPurchasesSum = purchases.reduce((acc, p) => acc + p.totalCost, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-teal-800" />
            Purchasing & Suppliers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record supplier deliveries, stock replenishment costs, and wholesale credit payables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="add-supplier-btn"
            onClick={() => setIsNewSupplierOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Building className="w-4 h-4 text-teal-800" />
            <span>Add Supplier</span>
          </button>

          <button
            id="receive-stock-btn"
            onClick={() => setIsNewPurchaseOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Receive Delivery / Purchase</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Supplier Payables (Due)
            </span>
            <span className="text-xl font-black text-rose-600 mt-1 block">
              {formatKes(totalPayables)}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Amount shop owes to suppliers on credit
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Stock Purchased
            </span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {formatKes(totalPurchasesSum)}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              {purchases.length} recorded delivery receipts
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Distributors
            </span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {suppliers.length} Partners
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Direct millers, depots & wholesalers
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'purchases'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Received Deliveries ({purchases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'suppliers'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Suppliers Directory ({suppliers.length})</span>
        </button>
      </div>

      {/* Tab 1: Purchases List */}
      {activeTab === 'purchases' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {purchases.length === 0 ? (
            <div className="p-12 text-center">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No stock purchases recorded yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                When distributor trucks deliver stock to your shop, record the delivery here to update your inventory quantities and cost prices automatically.
              </p>
              <button
                onClick={() => setIsNewPurchaseOpen(true)}
                className="mt-4 px-4 py-2 bg-teal-800 text-white text-xs font-bold rounded-xl hover:bg-teal-900"
              >
                Record First Delivery
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="px-4 py-3">Date & Invoice</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Delivered Items</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3 text-right">Total Cost</th>
                    <th className="px-4 py-3 text-right">Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="font-bold">{p.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(p.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {p.supplierName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="font-medium text-slate-900">
                          {p.items.length} product{p.items.length > 1 ? 's' : ''} (
                          {p.items.reduce((sum, item) => sum + item.quantity, 0)} units)
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {p.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.paymentMethod === 'cash'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : p.paymentMethod === 'mpesa'
                              ? 'bg-teal-50 text-teal-800 border border-teal-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {p.paymentMethod === 'credit' ? 'Supplier Credit' : p.paymentMethod.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-slate-900">
                        {formatKes(p.totalCost)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {p.balanceDue > 0 ? (
                          <span className="font-black text-rose-600">
                            {formatKes(p.balanceDue)}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold flex items-center justify-end gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Suppliers Directory */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{s.name}</h3>
                  {s.contactPerson && (
                    <span className="text-[11px] text-slate-500 block">
                      Rep: {s.contactPerson}
                    </span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Building className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{s.phone}</span>
                </div>
                {s.notes && (
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    {s.notes}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Owed to Supplier
                </span>
                <span
                  className={`font-black text-xs ${
                    s.balanceOwed > 0 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {s.balanceOwed > 0 ? formatKes(s.balanceOwed) : 'KSh 0 (Settled)'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Record New Stock Delivery / Purchase */}
      {isNewPurchaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Record Stock Delivery</h3>
                  <p className="text-[11px] text-slate-500">
                    Increase shop inventory & log supplier purchase cost
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewPurchaseOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmitPurchase} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Select Supplier *
                  </label>
                  <select
                    required
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Supplier Invoice / Delivery Note #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-89241"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Add Product Line Items */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800">
                    Delivery Line Items ({purchaseItems.length})
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Pick products delivered by the truck
                  </span>
                </div>

                {/* Quick picker buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {products.slice(0, 8).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleAddItem(p)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-700 text-[11px] font-medium whitespace-nowrap text-slate-700"
                    >
                      + {p.name}
                    </button>
                  ))}
                </div>

                {/* Selected items table */}
                {purchaseItems.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <p className="text-slate-500 text-[11px]">
                      Click a product above or pick an item to add to this purchase.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {purchaseItems.map((item) => (
                      <div
                        key={item.productId}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div className="flex-1">
                          <span className="font-bold text-slate-900 block">{item.productName}</span>
                          <span className="text-[10px] text-slate-400">
                            Unit Cost: {formatKes(item.unitCost)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(item.productId, item.quantity - 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                            >
                              -
                            </button>
                            <span className="px-2 font-bold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(item.productId, item.quantity + 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right min-w-[70px]">
                            <span className="font-black text-slate-900 block">
                              {formatKes(item.totalCost)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(item.productId, 0)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment & Terms */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Total Purchase Value:</span>
                  <span className="text-base font-black text-slate-900">
                    {formatKes(totalPurchaseCost)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                      paymentMethod === 'cash'
                        ? 'border-teal-700 bg-teal-50 text-teal-900'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-teal-800" />
                    <span>Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                      paymentMethod === 'mpesa'
                        ? 'border-teal-700 bg-teal-50 text-teal-900'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-teal-800" />
                    <span>M-Pesa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 ${
                      paymentMethod === 'credit'
                        ? 'border-amber-600 bg-amber-50 text-amber-900'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-amber-700" />
                    <span>Supplier Credit</span>
                  </button>
                </div>

                {paymentMethod !== 'credit' ? (
                  <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <span className="font-bold">Fully paid upon delivery</span>
                    <span>No outstanding supplier debt</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    <span className="font-bold">Goods received on credit</span>
                    <span>Will be recorded in Supplier Payables</span>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPurchaseOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || purchaseItems.length === 0 || !selectedSupplierId}
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Receiving Goods...' : 'Confirm Delivery & Stock In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add New Supplier */}
      {isNewSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Add Supplier or Distributor</h3>
              <button
                onClick={() => setIsNewSupplierOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Supplier / Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brookside Dairy East Africa"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0712 345 678"
                  value={newSupplierPhone}
                  onChange={(e) => setNewSupplierPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Contact Person / Sales Rep
                </label>
                <input
                  type="text"
                  placeholder="e.g. David Kamau"
                  value={newSupplierContact}
                  onChange={(e) => setNewSupplierContact(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Notes / Delivery Days
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Delivers early Tuesday morning"
                  value={newSupplierNotes}
                  onChange={(e) => setNewSupplierNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewSupplierOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
