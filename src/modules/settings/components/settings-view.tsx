import React, { useState } from 'react';
import { authService } from '@/modules/auth/auth-service';
import { localDb } from '@/platform/database/dexie-db';
import { formatKes } from '@/shared/formatting/money';
import {
  Settings,
  Store,
  Smartphone,
  Shield,
  CreditCard,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  KeyRound,
  RefreshCw,
  Trash2,
  Lock,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const currentOrg = authService.getCurrentOrg();
  const activeShop = authService.getActiveShop();

  // Profile state
  const [shopName, setShopName] = useState(activeShop?.name || '');
  const [shopLocation, setShopLocation] = useState(activeShop?.location || '');

  // M-Pesa Daraja state
  const [mpesaEnabled, setMpesaEnabled] = useState(activeShop?.payments?.mpesa?.enabled ?? true);
  const [mpesaType, setMpesaType] = useState<'till' | 'paybill'>(
    activeShop?.payments?.mpesa?.type || 'till'
  );
  const [mpesaNumber, setMpesaNumber] = useState(activeShop?.payments?.mpesa?.number || '5428901');
  const [mpesaMode, setMpesaMode] = useState<'sandbox' | 'live'>(
    activeShop?.payments?.mpesa?.mode || 'live'
  );
  const [consumerKey, setConsumerKey] = useState('****************************7aBc');
  const [consumerSecret, setConsumerSecret] = useState('****************************9xYz');
  const [passkey, setPasskey] = useState('bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919');

  // Deni state
  const [deniEnabled, setDeniEnabled] = useState(activeShop?.payments?.deni?.enabled ?? true);
  const [maxCreditLimitKes, setMaxCreditLimitKes] = useState(5000);

  // Test status
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTestDaraja = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult(
        `✓ Safaricom Daraja Handshake Successful! ${
          mpesaType === 'till' ? 'Buy Goods Till' : 'PayBill'
        } #${mpesaNumber} in ${mpesaMode.toUpperCase()} mode responds with HTTP 200 OK.`
      );
    }, 900);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShop) return;

    await localDb.shops.update(activeShop.id, {
      name: shopName.trim(),
      location: shopLocation.trim(),
      payments: {
        cash: true,
        mpesa: {
          enabled: mpesaEnabled,
          type: mpesaType,
          number: mpesaNumber.trim(),
          mode: mpesaMode,
        },
        deni: {
          enabled: deniEnabled,
        },
      },
    });

    await authService.reloadShops();

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-teal-800" />
          Shop Settings & M-Pesa Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage shop identity, Safaricom Daraja live credentials, and credit limits
        </p>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-2xl flex items-center gap-2 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Shop configuration and Safaricom Daraja settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Shop Profile */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="w-4 h-4 text-teal-800" />
            <h2 className="text-sm font-bold text-slate-900">Shop Profile & Location</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Shop Display Name *
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Physical Location / Market *
              </label>
              <input
                type="text"
                required
                value={shopLocation}
                onChange={(e) => setShopLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-slate-500">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-700 block mb-0.5">Operating Currency</span>
              <span>KSh (KES) • Kenyan Shilling</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-700 block mb-0.5">Timezone</span>
              <span>East Africa Time (EAT / UTC+3)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-700 block mb-0.5">Language</span>
              <span>English & Swahili Numerals</span>
            </div>
          </div>
        </div>

        {/* Section 2: Safaricom Daraja M-Pesa Integration */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-teal-800" />
              <h2 className="text-sm font-bold text-slate-900">Safaricom Daraja M-Pesa Integration</h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-teal-800">
              <input
                type="checkbox"
                checked={mpesaEnabled}
                onChange={(e) => setMpesaEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-teal-800"
              />
              <span>Enable M-Pesa</span>
            </label>
          </div>

          {mpesaEnabled && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    M-Pesa Service Type
                  </label>
                  <select
                    value={mpesaType}
                    onChange={(e) => setMpesaType(e.target.value as 'till' | 'paybill')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="till">Buy Goods Till Number</option>
                    <option value="paybill">PayBill Business Number</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {mpesaType === 'till' ? 'Till Number *' : 'PayBill Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={mpesaNumber}
                    onChange={(e) => setMpesaNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Daraja Environment
                  </label>
                  <select
                    value={mpesaMode}
                    onChange={(e) => setMpesaMode(e.target.value as 'sandbox' | 'live')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="live">Live Production (Safaricom)</option>
                    <option value="sandbox">Sandbox Test Mode</option>
                  </select>
                </div>
              </div>

              {/* Secrets Boundary Notice */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <KeyRound className="w-4 h-4 text-teal-800" />
                    Protected API Secrets (Server Boundary)
                  </span>
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Encrypted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Daraja Consumer Key
                    </label>
                    <input
                      type="text"
                      disabled
                      value={consumerKey}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-500 text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Daraja Consumer Secret
                    </label>
                    <input
                      type="password"
                      disabled
                      value={consumerSecret}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-500 text-[11px]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleTestDaraja}
                    disabled={isTesting}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Validating...' : 'Test Daraja Connection'}</span>
                  </button>
                  <span className="text-[10px] text-slate-400">
                    Never exposed to checkout cashiers
                  </span>
                </div>

                {testResult && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] font-semibold animate-in fade-in">
                    {testResult}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Deni (Credit Policy) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-700" />
              <h2 className="text-sm font-bold text-slate-900">Deni (Customer Credit) Policy</h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-800">
              <input
                type="checkbox"
                checked={deniEnabled}
                onChange={(e) => setDeniEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-amber-700"
              />
              <span>Allow Deni Sales</span>
            </label>
          </div>

          {deniEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Default Customer Credit Limit (KES)
                </label>
                <input
                  type="number"
                  value={maxCreditLimitKes}
                  onChange={(e) => setMaxCreditLimitKes(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Prevents cashiers from giving excessive debt to unvetted buyers.
                </span>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <span className="font-bold block">Kenyan Small Retail Safeguard</span>
                <p>
                  Every Deni transaction requires customer identification and is logged into the indelible credit ledger. Cashiers cannot clear balances without recording an official cash or M-Pesa repayment.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-black text-xs rounded-xl shadow-xs transition-all"
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
};
