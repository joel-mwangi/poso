import React, { useState } from 'react';
import { authService } from '../auth-service';
import { HelperInput, NewShopInput, OwnerChecklistAnswers } from '../auth-types';
import {
  Store,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  Smartphone,
  Banknote,
  BookOpen,
  Truck,
  Building2,
  MapPin,
  Check,
  Sparkles,
  ShieldCheck,
  Mail,
  User,
  Phone,
  Package,
  PackageOpen,
} from 'lucide-react';

interface OwnerOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OwnerOnboardingModal: React.FC<OwnerOnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const currentUser = authService.getCurrentUser();

  // Wizard Steps:
  // 1: Checklist
  // 2: Organization & Shop Creation
  // 3: "Your Shop is Ready" Preview
  // 4: Shop Profile Settings & People/Payments
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Checklist Answers
  const [hasMultipleShops, setHasMultipleShops] = useState<boolean>(false);
  const [acceptsMpesa, setAcceptsMpesa] = useState<boolean>(true);
  const [allowsDeni, setAllowsDeni] = useState<boolean>(true);
  const [buysFromSuppliers, setBuysFromSuppliers] = useState<boolean>(true);
  const [runsAlone, setRunsAlone] = useState<boolean>(true);

  // Step 2: Org and Shops
  const [orgName, setOrgName] = useState('');
  const [primaryShopName, setPrimaryShopName] = useState('');
  const [primaryShopLocation, setPrimaryShopLocation] = useState('');
  const [additionalShops, setAdditionalShops] = useState<NewShopInput[]>([]);
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraLocation, setNewExtraLocation] = useState('');
  const [showAddExtra, setShowAddExtra] = useState(false);

  // Step 4: Shop Profile & People Access
  const [operatorChoice, setOperatorChoice] = useState<'myself' | 'helper'>('myself');
  const [catalogChoice, setCatalogChoice] = useState<'empty' | 'kenyan_essentials'>('empty');
  const [helperName, setHelperName] = useState('');
  const [helperEmail, setHelperEmail] = useState('');
  const [helperPhone, setHelperPhone] = useState('');
  const [canSell, setCanSell] = useState<boolean>(true);
  const [canReceivePayment, setCanReceivePayment] = useState<boolean>(true);
  const [canManageStock, setCanManageStock] = useState<boolean>(false);
  const [helperSaved, setHelperSaved] = useState(false);

  // Payments in Step 4
  const [mpesaType, setMpesaType] = useState<'till' | 'paybill'>('till');
  const [mpesaNumber, setMpesaNumber] = useState('5428901');

  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Handle proceed from Step 1
  const handleChecklistProceed = (choice: 'simple' | 'recommended') => {
    if (!orgName) {
      setOrgName(`${currentUser?.name || 'My'} Retail Enterprises`);
    }
    if (!primaryShopName) {
      setPrimaryShopName('Mwangaza Duka');
    }
    if (!primaryShopLocation) {
      setPrimaryShopLocation('Nairobi Central');
    }
    setStep(2);
  };

  // Add extra shop in Step 2
  const handleAddExtraShop = () => {
    if (newExtraName.trim()) {
      setAdditionalShops([
        ...additionalShops,
        { name: newExtraName.trim(), location: newExtraLocation.trim() || 'Town Center' },
      ]);
      setNewExtraName('');
      setNewExtraLocation('');
      setShowAddExtra(false);
    }
  };

  // Step 2 submit -> goes to Step 3
  const handleCreateShopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !primaryShopName.trim() || !primaryShopLocation.trim()) return;
    setStep(3);
  };

  // Step 4 Helper Save
  const handleSaveHelper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helperName.trim() || !helperEmail.trim()) return;
    setHelperSaved(true);
  };

  // Final Complete Setup
  const handleFinalSubmit = async () => {
    setIsLoading(true);
    const answers: OwnerChecklistAnswers = {
      hasMultipleShops,
      acceptsMpesa,
      allowsDeni,
      buysFromSuppliers,
      runsAlone,
      otherPeopleUseSystem: !runsAlone || operatorChoice === 'helper',
      setupChoice: 'recommended',
      catalogChoice,
    };

    let helper: HelperInput | undefined;
    if (operatorChoice === 'helper' && helperName && helperEmail) {
      helper = {
        name: helperName,
        email: helperEmail,
        phone: helperPhone,
        permissions: {
          sellProducts: canSell,
          receivePayments: canReceivePayment,
          manageStock: canManageStock,
        },
      };
    }

    try {
      await authService.completeOwnerOnboarding({
        answers,
        orgName,
        primaryShop: {
          name: primaryShopName,
          location: primaryShopLocation,
        },
        additionalShops,
        helper,
        mpesaType,
        mpesaNumber,
      });

      onComplete();
    } catch (err) {
      console.error('Failed to complete setup:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Progress Header */}
        <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-800 border border-teal-700 flex items-center justify-center font-bold text-sm">
              {step}
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                {step === 1 && 'New Owner Setup Checklist'}
                {step === 2 && 'Create Organization & First Shop'}
                {step === 3 && 'Your Shop is Ready'}
                {step === 4 && 'Shop Profile & Operating Preferences'}
              </h2>
              <p className="text-[11px] text-teal-200">
                Step {step} of 4 • Set up your Kenyan retail workspace
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-1.5 rounded-full transition-all ${
                  s === step ? 'bg-amber-400 w-6' : s < step ? 'bg-teal-400' : 'bg-teal-950'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Checklist */}
        {step === 1 && (
          <div className="p-6 space-y-5 text-xs">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Karibu, {currentUser?.name || 'Shop Owner'}!
              </h3>
              <p className="text-slate-500 mt-1">
                Answer these 5 simple Yes/No questions so DukaFlow configures the best starting workflow for your shop. You can adjust any setting later.
              </p>
            </div>

            <div className="space-y-3">
              {/* Q1 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    1. Do you have more than one shop?
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Single kiosk/duka vs. multiple branches or wholesale stores
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setHasMultipleShops(true)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      hasMultipleShops ? 'bg-teal-800 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasMultipleShops(false)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      !hasMultipleShops ? 'bg-teal-800 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Q2 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    2. Do you accept M-Pesa?
                  </span>
                  <span className="text-[11px] text-slate-500">
                    M-Pesa Till (Buy Goods) or Business PayBill
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAcceptsMpesa(true)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      acceptsMpesa ? 'bg-teal-800 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setAcceptsMpesa(false)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      !acceptsMpesa ? 'bg-teal-800 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Q3 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    3. Do you allow Deni (Store Credit)?
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Track trusted regular customers who pay later
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAllowsDeni(true)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      allowsDeni ? 'bg-teal-800 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllowsDeni(false)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      !allowsDeni ? 'bg-teal-800 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Q4 */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    4. Do you buy stock from suppliers?
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Track distributor orders and purchase costs
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBuysFromSuppliers(true)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      buysFromSuppliers ? 'bg-teal-800 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuysFromSuppliers(false)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      !buysFromSuppliers ? 'bg-teal-800 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Q5 (Conditional if single shop) */}
              {!hasMultipleShops && (
                <div className="p-3.5 rounded-2xl border border-teal-200 bg-teal-50/50 flex items-center justify-between animate-in fade-in">
                  <div>
                    <span className="font-bold text-teal-950 block text-xs">
                      5. Do you run the shop alone?
                    </span>
                    <span className="text-[11px] text-teal-700">
                      If No, you will be able to invite helping staff later
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRunsAlone(true)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                        runsAlone ? 'bg-teal-800 text-white' : 'bg-white border border-teal-200 text-teal-800 hover:bg-teal-100/50'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setRunsAlone(false)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                        !runsAlone ? 'bg-teal-800 text-white' : 'bg-white border border-teal-200 text-teal-800 hover:bg-teal-100/50'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Starting setup choice */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => handleChecklistProceed('simple')}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Start with simple setup</span>
              </button>
              <button
                type="button"
                onClick={() => handleChecklistProceed('recommended')}
                className="flex-1 py-3 px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <span>Use recommended setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Create Organization & Shop */}
        {step === 2 && (
          <form onSubmit={handleCreateShopSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <h3 className="text-base font-black text-slate-900">Organization & Shop Details</h3>
              <p className="text-slate-500 mt-1">
                Name your business organization and add your primary retail shop location.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Organization Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Mwangi Retail Enterprises"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Store className="w-4 h-4 text-teal-800" />
                <span>Primary Shop</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shop Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mwangaza Duka"
                  value={primaryShopName}
                  onChange={(e) => setPrimaryShopName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Shop Location (Town, estate, street, or area) *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kawangware Market, Nairobi"
                    value={primaryShopLocation}
                    onChange={(e) => setPrimaryShopLocation(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Additional Shops if multi-shop = true */}
            {hasMultipleShops && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Additional Shops</span>
                  {!showAddExtra && (
                    <button
                      type="button"
                      onClick={() => setShowAddExtra(true)}
                      className="text-teal-800 font-bold hover:underline"
                    >
                      + Add another shop
                    </button>
                  )}
                </div>

                {additionalShops.map((extra, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{extra.name}</span>
                      <span className="text-slate-400 block text-[11px]">{extra.location}</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                      Branch #{idx + 2}
                    </span>
                  </div>
                ))}

                {showAddExtra && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                    <input
                      type="text"
                      placeholder="Branch name (e.g. Kilifi Wholesale)"
                      value={newExtraName}
                      onChange={(e) => setNewExtraName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Branch location (e.g. Kilifi Town)"
                      value={newExtraLocation}
                      onChange={(e) => setNewExtraLocation(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddExtra(false)}
                        className="px-2.5 py-1 text-slate-500 font-semibold text-[11px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddExtraShop}
                        className="px-3 py-1 bg-teal-800 text-white rounded-lg font-bold text-[11px]"
                      >
                        Add Shop
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <span>Create Shop</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: "Your shop is ready" */}
        {step === 3 && (
          <div className="p-6 space-y-5 text-xs">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {additionalShops.length > 0 ? 'Your shops are ready!' : 'Your shop is ready!'}
              </h3>
              <p className="text-slate-500 text-xs">
                {orgName} has been initialized. Tap "Set up shop" to configure operational settings.
              </p>
            </div>

            {/* Shop Cards */}
            <div className="space-y-2.5">
              {/* Primary Shop Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-700 transition-all flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{primaryShopName}</h4>
                    <p className="text-slate-500 text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {primaryShopLocation}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Set up shop
                </button>
              </div>

              {/* Additional Shops Cards */}
              {additionalShops.map((extra, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{extra.name}</h4>
                      <p className="text-slate-500 text-[11px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {extra.location}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Ready</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2.5 bg-teal-800 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <span>Continue to Shop Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Shop Profile Settings & People Access */}
        {step === 4 && (
          <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Shop Profile & Operating Preferences
              </h3>
              <p className="text-slate-500 mt-0.5">
                Configure who operates <strong className="text-slate-800">{primaryShopName}</strong>, M-Pesa till details, and retail preferences.
              </p>
            </div>

            {/* Who will operate this shop? */}
            <div className="space-y-2.5">
              <label className="block font-bold text-slate-800">Who will operate this shop?</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setOperatorChoice('myself')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    operatorChoice === 'myself'
                      ? 'border-teal-700 bg-teal-50/60 text-teal-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-bold">I will operate it myself</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-normal">
                    Owner-operated POS register
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOperatorChoice('helper')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    operatorChoice === 'helper'
                      ? 'border-teal-700 bg-teal-50/60 text-teal-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-bold">Someone else will help operate it</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 font-normal">
                    Invite helper with specific duties
                  </span>
                </button>
              </div>
            </div>

            {/* Helper invitation form if 'helper' selected */}
            {operatorChoice === 'helper' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-teal-800" />
                    Add Helping Person
                  </span>
                  {helperSaved && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Saved
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amina Hassan"
                    value={helperName}
                    onChange={(e) => setHelperName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email address — primary login *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. amina@example.com"
                    value={helperEmail}
                    onChange={(e) => setHelperEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone number — optional for now
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 0712 345 678"
                    value={helperPhone}
                    onChange={(e) => setHelperPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>

                {/* What can this person do? */}
                <div className="space-y-2 pt-1 border-t border-slate-200">
                  <span className="font-bold text-slate-800 block text-[11px]">
                    What can this person do?
                  </span>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-700">Sell products</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setCanSell(true)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          canSell ? 'bg-teal-800 text-white' : 'bg-white border text-slate-600'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setCanSell(false)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          !canSell ? 'bg-teal-800 text-white' : 'bg-white border text-slate-600'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-700">Receive payments</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setCanReceivePayment(true)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          canReceivePayment ? 'bg-teal-800 text-white' : 'bg-white border text-slate-600'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setCanReceivePayment(false)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          !canReceivePayment ? 'bg-teal-800 text-white' : 'bg-white border text-slate-600'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-700">Manage stock</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setCanManageStock(true)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          canManageStock ? 'bg-teal-800 text-white' : 'bg-white border text-slate-600'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setCanManageStock(false)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          !canManageStock ? 'bg-teal-800 text-white' : 'bg-white border text-slate-600'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>

                {helperSaved ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="font-bold text-emerald-900 block">Invitation ready</span>
                    <span className="text-[11px] text-emerald-700 block">
                      {helperName} ({helperEmail}) will be recorded with pending invitation status.
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveHelper}
                    className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs shadow-2xs"
                  >
                    Save Helping Person
                  </button>
                )}
              </div>
            )}

            {/* Catalog & Inventory Starting State */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800 text-xs">
                  Initial Catalog & Stock Setup
                </label>
                <span className="text-[10px] font-semibold text-slate-500">
                  Choose your starting point
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setCatalogChoice('empty')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    catalogChoice === 'empty'
                      ? 'border-teal-700 bg-white shadow-xs text-slate-900 ring-2 ring-teal-700/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        catalogChoice === 'empty' ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <PackageOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">
                        Start with Empty Shelves
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5 leading-tight">
                        Clean slate. Add only your custom items, barcodes, and current inventory.
                      </span>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-slate-500">Recommended for real shops</span>
                    {catalogChoice === 'empty' && (
                      <span className="text-teal-800 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCatalogChoice('kenyan_essentials')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    catalogChoice === 'kenyan_essentials'
                      ? 'border-teal-700 bg-white shadow-xs text-slate-900 ring-2 ring-teal-700/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        catalogChoice === 'kenyan_essentials' ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">
                        Load Starter Retail Catalog
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5 leading-tight">
                        Pre-fills standard Kenyan staples (Jogoo Unga, Mumias Sugar, Brookside Milk, Airtime).
                      </span>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-slate-500">10 essential products (0 stock)</span>
                    {catalogChoice === 'kenyan_essentials' && (
                      <span className="text-teal-800 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Business Preferences */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block text-xs">Business Preferences</span>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 bg-white rounded-xl border border-slate-200 font-medium">
                  <span className="text-slate-400 block text-[10px]">Currency</span>
                  <span className="font-bold text-slate-800">KSh (KES)</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200 font-medium">
                  <span className="text-slate-400 block text-[10px]">Language</span>
                  <span className="font-bold text-slate-800">English</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200 font-medium">
                  <span className="text-slate-400 block text-[10px]">Timezone</span>
                  <span className="font-bold text-slate-800">EAT (UTC+3)</span>
                </div>
              </div>
            </div>

            {/* Payments Configuration */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 block text-xs">Payment Methods</span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-teal-800" />
                    Cash Payments
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Enabled
                  </span>
                </div>

                {acceptsMpesa && (
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-700" />
                        M-Pesa Merchant Setup
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Option
                        </label>
                        <select
                          value={mpesaType}
                          onChange={(e: any) => setMpesaType(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                        >
                          <option value="till">Business Till (Buy Goods)</option>
                          <option value="paybill">Business PayBill</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Till / PayBill Number
                        </label>
                        <input
                          type="text"
                          value={mpesaNumber}
                          onChange={(e) => setMpesaNumber(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {allowsDeni && (
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-700" />
                      Deni (Store Credit Ledger)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Enabled
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isLoading}
                className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Saving Shop Setup...</span>
                ) : (
                  <>
                    <span>Complete Setup & Start Selling</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
