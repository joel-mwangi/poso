import React, { useState } from 'react';
import {
  Store,
  Smartphone,
  WifiOff,
  CreditCard,
  TrendingUp,
  PackageCheck,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  LogIn,
  UserPlus,
  Users,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  ShoppingBag,
  CircleDollarSign,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register' | 'accept_invitation') => void;
  onQuickDemo: (type: 'owner' | 'staff' | 'new_owner') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onQuickDemo,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqItems = [
    {
      q: 'Does DukaFlow work without internet?',
      a: 'Yes. Supported shop operations—such as recording cash sales, checking stock, and logging Deni—continue offline on your device and synchronize automatically when your internet connection returns.',
    },
    {
      q: 'Can I accept M-Pesa?',
      a: 'Yes. You can record M-Pesa payments manually or connect your Safaricom Daraja M-Pesa Till (Buy Goods) or PayBill directly when your business is ready.',
    },
    {
      q: 'Can I use Cash and Deni?',
      a: 'Yes. Cash and Deni (store credit) are first-class payment methods in DukaFlow. You can set customer credit limits and track repayments with full balance histories.',
    },
    {
      q: 'Do helpers create their own shops?',
      a: 'No. The shop owner creates the organization and shop, then invites helpers. The owner controls what each helper can sell, record, view, or manage.',
    },
    {
      q: 'Can I manage more than one shop?',
      a: 'Yes. You can manage multiple shop branches under one merchant organization, view a consolidated organization summary, and switch into individual shops with one tap.',
    },
    {
      q: 'Do I need a barcode scanner or computer?',
      a: 'No. DukaFlow is engineered mobile-first to run directly on standard Android and iOS smartphones. You can scan barcodes using your phone camera or tap products directly.',
    },
    {
      q: 'Can I start with a simple setup?',
      a: 'Yes. You can start in less than two minutes with one owner and one shop, and add staff permissions, suppliers, or additional branches only when your business expands.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Top Notification Banner */}
      <div className="bg-teal-950 text-teal-200 text-xs py-2 px-4 text-center border-b border-teal-900 flex items-center justify-center gap-2">
        <span className="font-semibold text-white">Built for Kenyan Retailers</span>
        <span className="text-teal-400">•</span>
        <span>Works offline on your phone with Cash, M-Pesa & Deni</span>
        <button
          onClick={() => onQuickDemo('owner')}
          className="ml-2 underline font-bold text-amber-400 hover:text-amber-300"
        >
          Try Live Demo →
        </button>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-black text-lg shadow-sm">
              DF
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900">DukaFlow</span>
              <span className="hidden sm:inline text-xs text-slate-500 ml-2 font-medium">
                Kenyan Retail OS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-teal-800 transition-colors">
              How it works
            </a>
            <a href="#for-shops" className="hover:text-teal-800 transition-colors">
              For shops
            </a>
            <a href="#outcomes" className="hover:text-teal-800 transition-colors">
              Features
            </a>
            <a href="#faq" className="hover:text-teal-800 transition-colors">
              Help & FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-2 font-bold text-slate-700 hover:text-teal-800 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>Create account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Simple, Reliable Point of Sale</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Run your shop with confidence.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              DukaFlow is a simple POS for Kenyan shops. Sell, track your stock, understand your money, and make better decisions from your real business history—even when internet access is interrupted.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onOpenAuth('register')}
                className="px-6 py-3.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Create owner account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenAuth('login')}
                className="px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-slate-500" />
                <span>Log in</span>
              </button>
            </div>

            {/* Helper invitation sub-action */}
            <div className="pt-1 flex items-center gap-2 text-xs text-slate-500">
              <span>Already invited by an owner?</span>
              <button
                onClick={() => onOpenAuth('accept_invitation')}
                className="font-bold text-teal-800 hover:underline flex items-center gap-1"
              >
                Accept invitation →
              </button>
            </div>

            {/* Trust Pill */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-teal-800" />
                <span>Works on your phone</span>
              </div>
              <div className="flex items-center gap-1.5">
                <WifiOff className="w-4 h-4 text-teal-800" />
                <span>Offline-first</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Cash, M-Pesa & Deni</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Realistic Smartphone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[320px]">
              {/* Phone Frame */}
              <div className="bg-slate-900 p-3.5 rounded-[40px] shadow-2xl border-4 border-slate-800">
                {/* Speaker notch */}
                <div className="w-20 h-4 bg-slate-950 rounded-full mx-auto mb-3" />

                {/* Phone Screen Mockup Content */}
                <div className="bg-slate-50 rounded-[28px] overflow-hidden p-4 space-y-3.5 text-xs">
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                        DukaFlow
                      </span>
                      <span className="font-extrabold text-slate-900 text-xs">
                        Mwangaza Demo Shop
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Open
                    </span>
                  </div>

                  {/* Today Summary */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">Today's Sales</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-slate-900 font-mono">
                        KSh 18,450
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        +14% vs avg
                      </span>
                    </div>
                  </div>

                  {/* Quick Status Badges */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Stock Alerts
                      </span>
                      <span className="text-xs font-bold text-amber-700 font-mono">
                        6 low items
                      </span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        M-Pesa Till
                      </span>
                      <span className="text-xs font-bold text-teal-800 font-mono">
                        5428901 Live
                      </span>
                    </div>
                  </div>

                  {/* Recent Activity Card */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Recent Activity
                    </span>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center text-slate-700">
                        <span>Jogoo Maize Meal 2kg</span>
                        <span className="font-bold text-slate-900 font-mono">KSh 190</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span>Deni: Mama Mary</span>
                        <span className="font-bold text-amber-700 font-mono">KSh 400</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Action */}
                  <button
                    type="button"
                    onClick={() => onQuickDemo('owner')}
                    className="w-full py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-center shadow-xs transition-colors"
                  >
                    Open Live Register
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOUR OWNER OUTCOMES */}
      <section id="outcomes" className="py-16 bg-white border-y border-slate-200 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Four outcomes for every shop owner
            </h2>
            <p className="text-sm text-slate-500">
              Clear answers to the daily questions that determine whether your business thrives or struggles.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Outcome 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-teal-700 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <PackageCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Know your stock</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                See exactly what you have on your shelves, what items are moving fastest, and what is running low before you run out of stock.
              </p>
            </div>

            {/* Outcome 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-teal-700 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <CircleDollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Know your cash</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clearly separate physical drawer cash, M-Pesa payments received, pending settlements, and Deni given so your cash count balances every night.
              </p>
            </div>

            {/* Outcome 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-teal-700 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Understand customers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Keep useful customer purchase histories and see who owes Deni, when they borrowed, and their credit limits without messy paper books.
              </p>
            </div>

            {/* Outcome 4 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-teal-700 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Grow your business</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive simple, transparent recommendations generated directly from your own historical sales trends and profit margins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BUILT FOR THE WAY SHOPS OPERATE */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Built for the way Kenyan shops operate
          </h2>
          <p className="text-sm text-slate-500">
            No bulky computers or constant Wi-Fi required. DukaFlow fits directly into the reality of everyday retail.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 flex gap-4">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900">Sell from your phone</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                A smartphone-first workflow with large touch targets, fast barcode scanning using your phone camera, and quick cash change calculations.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 flex gap-4">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900">Keep working when disconnected</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When network bundles run out or cellular reception drops, your shop keeps selling. Local IndexedDB saves transactions safely and syncs when back online.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 flex gap-4">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900">Use payments your customers use</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accept Cash, Safaricom M-Pesa (Buy Goods Till & PayBill), and Deni credit without forcing your buyers to change how they pay.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 flex gap-4">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900">Start simple and grow gradually</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Begin as a solo owner-operator. Add helper accounts, suppliers, purchase tracking, and multiple branch locations whenever you are ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 bg-slate-100/70 border-t border-slate-200 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Step-by-step onboarding
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How DukaFlow works
            </h2>
            <p className="text-sm text-slate-500">
              From signing up to ringing up your first customer sale in less than two minutes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900">Create owner account</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Answer a quick 5-question Yes/No checklist so DukaFlow configures your starting setup.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900">Set up your shop</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add your shop name, town/location, M-Pesa Till number, and optionally invite helpers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900">Add products & stock</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add items with selling prices, buying costs, and opening inventory count.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="text-sm font-bold text-slate-900">Sell and learn</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Record daily sales, balance end-of-day shifts, and watch your business history grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOR ONE SHOP OR SEVERAL */}
      <section id="for-shops" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            For one shop or several
          </h2>
          <p className="text-sm text-slate-500">
            DukaFlow adapts to your current operational scale and grows with you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">One Shop</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Start with a simple owner-operated setup. No complicated role hierarchies or extra overhead—just fast point of sale and accurate cash counting.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">A Staffed Shop</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Invite helping staff and grant specific permissions: who can ring up sales, who can receive payments, and who can adjust inventory.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Multiple Shops</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Manage branches across estates or towns. View a consolidated organization summary and switch between shops seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* TRUST AND CLARITY */}
      <section className="py-14 bg-teal-900 text-white px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800 text-teal-200 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Auditability & Clear Records</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Your records should make sense.
          </h2>
          <p className="text-sm sm:text-base text-teal-100 max-w-2xl mx-auto leading-relaxed">
            Every sale, payment, stock adjustment, and Deni balance has an indelible local audit history. DukaFlow cleanly separates recorded financial facts from estimates and explains where business insights come from.
          </p>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">
            Everything you need to know about setting up and running DukaFlow.
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 hover:text-teal-800"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-teal-800' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-16 bg-slate-900 text-white px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to organize your Kenyan shop?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join shop owners across Kenya taking control of their stock, cash drawers, and customer Deni.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-7 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Get Started as Owner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onQuickDemo('owner')}
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Explore Interactive Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 bg-slate-950 text-slate-500 text-xs px-4 sm:px-6 border-t border-slate-900">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-teal-900 text-teal-200 flex items-center justify-center font-black text-xs">
              DF
            </div>
            <span className="font-bold text-slate-300">DukaFlow Kenya</span>
            <span className="text-slate-600">•</span>
            <span>Simple POS & Shop Operating System</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hover:text-slate-300">
              How it works
            </a>
            <a href="#for-shops" className="hover:text-slate-300">
              For shops
            </a>
            <a href="#faq" className="hover:text-slate-300">
              Help
            </a>
            <button
              onClick={() => onOpenAuth('login')}
              className="hover:text-slate-300 font-bold"
            >
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
