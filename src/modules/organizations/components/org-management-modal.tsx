import React, { useState } from 'react';
import { authService } from '@/modules/auth/auth-service';
import { LocalShop } from '@/platform/database/dexie-db';
import {
  Building2,
  Store,
  Users,
  CreditCard,
  X,
  Plus,
  Check,
  MapPin,
  Smartphone,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

interface OrgManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrgManagementModal: React.FC<OrgManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const currentUser = authService.getCurrentUser();
  const currentOrg = authService.getCurrentOrg();
  const shops = authService.getShops();
  const activeShop = authService.getActiveShop();

  const [selectedShopId, setSelectedShopId] = useState<string>(activeShop?.id || '');

  if (!isOpen) return null;

  const handleSelectShop = (shopId: string) => {
    setSelectedShopId(shopId);
    authService.setActiveShop(shopId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">
                {currentOrg?.name || 'Organization Workspace'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Owner: {currentUser?.name} ({currentUser?.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
          {/* Shop Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-teal-800" />
                Shops & Branches ({shops.length})
              </span>
            </div>

            <div className="space-y-2">
              {shops.map((shop) => {
                const isActive = shop.id === (activeShop?.id || selectedShopId);
                return (
                  <div
                    key={shop.id}
                    onClick={() => handleSelectShop(shop.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isActive
                        ? 'border-teal-700 bg-teal-50/50 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{shop.name}</span>
                        {isActive && (
                          <span className="text-[10px] font-bold bg-teal-800 text-white px-2 py-0.5 rounded-full">
                            Active Shop
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {shop.location}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block font-medium">
                        {shop.payments?.mpesa?.enabled
                          ? `Till: ${shop.payments.mpesa.number}`
                          : 'Cash only'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Shop Configuration Overview */}
          {activeShop && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 block text-xs">
                Active Shop Details: {activeShop.name}
              </span>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Currency & Locale</span>
                  <span className="font-bold text-slate-800">
                    {activeShop.currency} • {activeShop.timezone}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Deni (Credit)</span>
                  <span className="font-bold text-emerald-700">
                    {activeShop.payments?.deni?.enabled ? 'Allowed' : 'Disabled'}
                  </span>
                </div>
              </div>

              {activeShop.payments?.mpesa?.enabled && (
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Smartphone className="w-3.5 h-3.5 text-teal-800" />
                    M-Pesa {activeShop.payments.mpesa.type === 'till' ? 'Till Number' : 'PayBill'}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeShop.payments.mpesa.number}
                  </span>
                </div>
              )}

              {/* Helper status */}
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] mb-1">Staff / Helper</span>
                {activeShop.hasHelper && activeShop.helperName ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {activeShop.helperName}
                      </span>
                      <span className="text-[10px] text-slate-500">{activeShop.helperEmail}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                      Helper Active
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-500">Owner-operated (No helping staff assigned)</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
