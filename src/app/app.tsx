import React, { useState, useEffect } from 'react';
import { syncService, SyncStats } from '@/modules/sync/sync-service';
import { authService } from '@/modules/auth/auth-service';
import { AuthUser } from '@/modules/auth/auth-types';
import { LandingPage } from '@/modules/landing/components/landing-page';
import { AuthModal } from '@/modules/auth/components/auth-modal';
import { OwnerOnboardingModal } from '@/modules/auth/components/owner-onboarding-modal';
import { OrgManagementModal } from '@/modules/organizations/components/org-management-modal';
import { OwnerDashboardView } from '@/modules/dashboard/components/owner-dashboard-view';
import { PosRegister } from '@/modules/sales/components/pos-register';
import { InventoryView } from '@/modules/inventory/components/inventory-view';
import { DeniLedgerView } from '@/modules/deni/components/deni-ledger-view';
import { PurchasingView } from '@/modules/purchasing/components/purchasing-view';
import { ShiftReconciliationView } from '@/modules/reconciliation/components/shift-reconciliation-view';
import { ReportsView } from '@/modules/reports/components/reports-view';
import { StaffGovernanceView } from '@/modules/staff/components/staff-governance-view';
import { SettingsView } from '@/modules/settings/components/settings-view';
import { AddProductModal } from '@/modules/catalog/components/add-product-modal';
import { SyncModal } from '@/modules/sync/components/sync-modal';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BookOpen,
  Truck,
  Calculator,
  TrendingUp,
  Users,
  Settings,
  Wifi,
  WifiOff,
  RefreshCw,
  Store,
  User,
  LogOut,
  Building2,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'register'
  | 'inventory'
  | 'deni'
  | 'purchasing'
  | 'reconciliation'
  | 'reports'
  | 'staff'
  | 'settings';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(authService.getCurrentUser());
  const [currentOrg, setCurrentOrg] = useState(authService.getCurrentOrg());
  const [activeShop, setActiveShop] = useState(authService.getActiveShop());
  const [shops, setShops] = useState(authService.getShops());

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'accept_invitation'>('login');
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const [syncStats, setSyncStats] = useState<SyncStats>({
    pendingCount: 0,
    lastSyncAt: null,
    isOnline: true,
    isSyncing: false,
    lastError: null,
  });

  useEffect(() => {
    // Subscribe to auth changes
    const unsubAuth = authService.subscribe(() => {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      setCurrentOrg(authService.getCurrentOrg());
      setActiveShop(authService.getActiveShop());
      setShops(authService.getShops());

      // If user is staff, ensure they start on POS Register
      if (user && user.role === 'staff' && activeTab === 'dashboard') {
        setActiveTab('register');
      }
    });

    // Subscribe to outbox sync status
    const unsubSync = syncService.subscribe((stats) => {
      setSyncStats(stats);
    });

    return () => {
      unsubAuth();
      unsubSync();
    };
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' | 'accept_invitation') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleQuickDemo = async (type: 'owner' | 'staff' | 'new_owner') => {
    await authService.switchDemoAccount(type);
    if (type === 'staff') {
      setActiveTab('register');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setActiveTab('dashboard');
  };

  // ROUTE 1: Not authenticated -> Show Public Landing Page
  if (!currentUser) {
    return (
      <>
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onQuickDemo={handleQuickDemo}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  // ROUTE 2: Authenticated as Owner, but no Organization -> Show Owner Onboarding Flow
  const needsOnboarding = currentUser.role === 'owner' && (!currentUser.organizationId || !currentOrg);

  // Compute Allowed Tabs based on User Role and Permissions (docs/user-workspace-and-daily-workflow.md)
  const isOwner = currentUser.role === 'owner';
  const perms = currentUser.permissions || {
    sellProducts: true,
    receivePayments: true,
    manageStock: false,
  };

  const canAccessTab = (tab: ActiveTab): boolean => {
    if (isOwner) return true;

    // Staff access rules:
    switch (tab) {
      case 'dashboard':
        return false; // Owner-only business overview
      case 'register':
        return perms.sellProducts;
      case 'inventory':
        return perms.manageStock;
      case 'deni':
        return perms.sellProducts;
      case 'purchasing':
        return perms.manageStock;
      case 'reconciliation':
        return perms.receivePayments;
      case 'reports':
        return false; // Sensitive profit & COGS margins reserved for owner
      case 'staff':
        return false; // Governance reserved for owner
      case 'settings':
        return false; // M-Pesa secrets reserved for owner
      default:
        return false;
    }
  };

  // Ensure current active tab is permitted
  const currentTabAllowed = canAccessTab(activeTab);
  const effectiveTab: ActiveTab = currentTabAllowed
    ? activeTab
    : isOwner
    ? 'dashboard'
    : 'register';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* If newly registered owner needs onboarding */}
      {needsOnboarding && (
        <OwnerOnboardingModal
          isOpen={true}
          onComplete={() => {
            // Updated in service
          }}
        />
      )}

      {/* Offline Alert Strip (if disconnected) */}
      {!syncStats.isOnline && (
        <div className="bg-amber-600 text-white text-xs px-4 py-1.5 flex items-center justify-center gap-2 font-semibold">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active • Sales and stock movements are saved securely in local storage and will sync automatically when back online.</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & Shop Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-black text-lg shadow-sm">
              DF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 tracking-tight">
                  DukaFlow
                </h1>
                {currentOrg && isOwner && (
                  <button
                    onClick={() => setIsOrgModalOpen(true)}
                    className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  >
                    <Building2 className="w-3 h-3 text-teal-800" />
                    <span>{currentOrg.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                )}
                {currentOrg && !isOwner && (
                  <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-teal-800" />
                    <span>{currentOrg.name}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Store className="w-3 h-3 text-teal-700" />
                  {activeShop ? activeShop.name : 'Main Shop'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {currentUser.name} ({isOwner ? 'Owner' : 'Cashier / Staff'})
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Multi-Shop Switcher, Sync, and Logout */}
          <div className="flex items-center gap-2">
            {/* Multi-Shop selector if > 1 shop */}
            {shops.length > 1 && isOwner && (
              <button
                onClick={() => setIsOrgModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs"
              >
                <Store className="w-3.5 h-3.5 text-teal-800" />
                <span>Switch Branch ({shops.length})</span>
              </button>
            )}

            {/* Sync & Cloud Status Button */}
            <button
              id="open-sync-status-btn"
              onClick={() => setIsSyncModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center gap-2 text-xs transition-all shadow-2xs"
            >
              <div className="flex items-center gap-1">
                {syncStats.isOnline ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
                <span className="font-semibold text-slate-700 hidden sm:inline">
                  {syncStats.isOnline ? 'Cloud Ready' : 'Offline Mode'}
                </span>
              </div>

              {syncStats.pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                  {syncStats.pendingCount} pending
                </span>
              )}

              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${syncStats.isSyncing ? 'animate-spin' : ''}`} />
            </button>

            {/* Logout button */}
            <button
              id="logout-btn"
              onClick={handleLogout}
              title="Log out and return to landing page"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-500 transition-colors shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Responsive Scrollable Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none border-t border-slate-100 py-1.5">
          {/* 1. Home / Executive Dashboard (Owner only) */}
          {canAccessTab('dashboard') && (
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                effectiveTab === 'dashboard'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
          )}

          {/* 2. POS Register */}
          {canAccessTab('register') && (
            <button
              id="nav-tab-register"
              onClick={() => setActiveTab('register')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                effectiveTab === 'register'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>POS Register</span>
            </button>
          )}

          {/* 3. Inventory & Stock */}
          {canAccessTab('inventory') && (
            <button
              id="nav-tab-inventory"
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                effectiveTab === 'inventory'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Inventory</span>
            </button>
          )}

          {/* 4. Customers & Deni Ledger */}
          {canAccessTab('deni') && (
            <button
              id="nav-tab-deni"
              onClick={() => setActiveTab('deni')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                effectiveTab === 'deni'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Customers & Deni</span>
            </button>
          )}

          {/* 5. Purchasing & Suppliers */}
          {canAccessTab('purchasing') && (
            <button
              id="nav-tab-purchasing"
              onClick={() => setActiveTab('purchasing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                effectiveTab === 'purchasing'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Purchasing</span>
            </button>
          )}

          {/* 6. Shift Balancing */}
          {canAccessTab('reconciliation') && (
            <button
              id="nav-tab-reconciliation"
              onClick={() => setActiveTab('reconciliation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                effectiveTab === 'reconciliation'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Shift Balancing</span>
            </button>
          )}

          {/* 7. Reports & Profit (Owner only) */}
          {canAccessTab('reports') && (
            <button
              id="nav-tab-reports"
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                effectiveTab === 'reports'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Reports & Margins</span>
            </button>
          )}

          {/* 8. Staff & Governance (Owner only) */}
          {canAccessTab('staff') && (
            <button
              id="nav-tab-staff"
              onClick={() => setActiveTab('staff')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                effectiveTab === 'staff'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff & Access</span>
            </button>
          )}

          {/* 9. Settings (Owner only) */}
          {canAccessTab('settings') && (
            <button
              id="nav-tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                effectiveTab === 'settings'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Shop Settings</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {effectiveTab === 'dashboard' && (
          <OwnerDashboardView onNavigate={(t) => setActiveTab(t as ActiveTab)} />
        )}

        {effectiveTab === 'register' && (
          <PosRegister onOpenAddProduct={() => setIsAddProductOpen(true)} />
        )}

        {effectiveTab === 'inventory' && (
          <InventoryView onOpenAddProduct={() => setIsAddProductOpen(true)} />
        )}

        {effectiveTab === 'deni' && <DeniLedgerView />}

        {effectiveTab === 'purchasing' && <PurchasingView />}

        {effectiveTab === 'reconciliation' && <ShiftReconciliationView />}

        {effectiveTab === 'reports' && <ReportsView />}

        {effectiveTab === 'staff' && <StaffGovernanceView />}

        {effectiveTab === 'settings' && <SettingsView />}
      </main>

      {/* Global Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onProductAdded={() => {
          // Trigger catalog refresh
        }}
      />

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

      <OrgManagementModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
      />
    </div>
  );
};
