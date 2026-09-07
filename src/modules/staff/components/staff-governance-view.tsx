import React, { useState, useEffect } from 'react';
import {
  localDb,
  LocalStaffInvitation,
  LocalShop,
} from '@/platform/database/dexie-db';
import { authService } from '@/modules/auth/auth-service';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Store,
  X,
  Lock,
  Mail,
  Phone,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

export const StaffGovernanceView: React.FC = () => {
  const currentOrg = authService.getCurrentOrg();
  const shops = authService.getShops();
  const activeShop = authService.getActiveShop();

  const [invitations, setInvitations] = useState<LocalStaffInvitation[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Invite Form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [targetShopId, setTargetShopId] = useState(activeShop?.id || '');
  const [permSell, setPermSell] = useState(true);
  const [permPayment, setPermPayment] = useState(true);
  const [permStock, setPermStock] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStaffData = async () => {
    if (!currentOrg) return;
    const invList = await localDb.staff_invitations
      .where('organizationId')
      .equals(currentOrg.id)
      .reverse()
      .sortBy('createdAt');
    setInvitations(invList);
  };

  useEffect(() => {
    loadStaffData();
  }, [currentOrg?.id]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg || !inviteName.trim() || !inviteEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const assignedShop = shops.find((s) => s.id === targetShopId) || activeShop;
      const newInv: LocalStaffInvitation = {
        id: `inv_${Date.now()}`,
        organizationId: currentOrg.id,
        shopId: assignedShop?.id || 'shop_main_01',
        shopName: assignedShop?.name || 'Main Shop',
        name: inviteName.trim(),
        email: inviteEmail.trim().toLowerCase(),
        phone: invitePhone.trim() || undefined,
        permissions: {
          sellProducts: permSell,
          receivePayments: permPayment,
          manageStock: permStock,
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await localDb.staff_invitations.add(newInv);

      // Also update shop helper status if matching
      if (assignedShop) {
        await localDb.shops.update(assignedShop.id, {
          hasHelper: true,
          helperName: newInv.name,
          helperEmail: newInv.email,
          helperPhone: newInv.phone,
          helperPermissions: newInv.permissions,
        });
      }

      setIsInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInvitePhone('');
      await loadStaffData();
    } catch (err) {
      console.error('Failed to send staff invitation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePermission = async (
    invitation: LocalStaffInvitation,
    permKey: 'sellProducts' | 'receivePayments' | 'manageStock'
  ) => {
    const updated = {
      ...invitation.permissions,
      [permKey]: !invitation.permissions[permKey],
    };

    await localDb.staff_invitations.update(invitation.id, {
      permissions: updated,
    });

    // Also update shop record
    await localDb.shops.update(invitation.shopId, {
      helperPermissions: updated,
    });

    await loadStaffData();
  };

  const handleToggleStatus = async (
    invitation: LocalStaffInvitation,
    newStatus: 'accepted' | 'cancelled'
  ) => {
    await localDb.staff_invitations.update(invitation.id, {
      status: newStatus,
    });
    await loadStaffData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-800" />
            Staff & Access Governance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer cashiers, shop helpers, granular operation permissions, and branch assignments
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite New Staff Member</span>
        </button>
      </div>

      {/* Owner Identity Summary */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-black text-base">
            OW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">
                {authService.getCurrentUser()?.name}
              </span>
              <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full border border-teal-200">
                Organization Owner
              </span>
            </div>
            <span className="text-xs text-slate-500 block">
              {authService.getCurrentUser()?.email} • Complete administrative authority across all {shops.length} shop branches
            </span>
          </div>
        </div>

        <div className="hidden sm:block text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Security Clearance
          </span>
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
            Full Access & Secrets Boundary
          </span>
        </div>
      </div>

      {/* Staff Members & Invitations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Assigned Helpers & Cashiers ({invitations.length})
          </h2>
          <span className="text-[11px] text-slate-500">
            Permission grants enforced on server and client
          </span>
        </div>

        {invitations.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No staff members invited yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add trusted cashiers or family members to help run the shop counter. You can control exactly whether they can sell, take money, or adjust inventory.
            </p>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="mt-4 px-4 py-2 bg-teal-800 text-white text-xs font-bold rounded-xl hover:bg-teal-900"
            >
              Invite First Helper
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm">{inv.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : inv.status === 'pending'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {inv.status === 'accepted'
                        ? 'Active Worker'
                        : inv.status === 'pending'
                        ? 'Pending Acceptance'
                        : 'Deactivated'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {inv.email}
                    </span>
                    {inv.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {inv.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Store className="w-3.5 h-3.5 text-teal-800" />
                      {inv.shopName}
                    </span>
                  </div>
                </div>

                {/* Granular Permission Toggles */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePermission(inv, 'sellProducts')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      inv.permissions.sellProducts
                        ? 'bg-teal-50 border-teal-300 text-teal-900'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    Sell: {inv.permissions.sellProducts ? '✓ ON' : '✗ OFF'}
                  </button>

                  <button
                    onClick={() => handleTogglePermission(inv, 'receivePayments')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      inv.permissions.receivePayments
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    Pay: {inv.permissions.receivePayments ? '✓ ON' : '✗ OFF'}
                  </button>

                  <button
                    onClick={() => handleTogglePermission(inv, 'manageStock')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      inv.permissions.manageStock
                        ? 'bg-blue-50 border-blue-300 text-blue-900'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    Stock: {inv.permissions.manageStock ? '✓ ON' : '✗ OFF'}
                  </button>

                  {/* Status Toggle */}
                  {inv.status === 'accepted' ? (
                    <button
                      onClick={() => handleToggleStatus(inv, 'cancelled')}
                      title="Deactivate staff member access"
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(inv, 'accepted')}
                      title="Activate staff member access"
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Invite New Staff */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Invite Shop Helper</h3>
                  <p className="text-[11px] text-slate-500">
                    Grant scoped operational access to a cashier or storekeeper
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Staff Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Joel Gachigi"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="joel@dukaflow.co.ke"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kenyan Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="0712 345 678"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Assign to Shop Branch *
                  </label>
                  <select
                    value={targetShopId}
                    onChange={(e) => setTargetShopId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.location})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Granular Permissions Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">
                  Operational Permissions
                </span>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">Sell Products</span>
                      <span className="text-[10px] text-slate-500">
                        Can scan barcodes, build customer carts, and complete sales
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={permSell}
                      onChange={(e) => setPermSell(e.target.checked)}
                      className="w-4 h-4 text-teal-800 rounded-md"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">Receive Payments</span>
                      <span className="text-[10px] text-slate-500">
                        Can accept Cash and verify M-Pesa till transactions
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={permPayment}
                      onChange={(e) => setPermPayment(e.target.checked)}
                      className="w-4 h-4 text-teal-800 rounded-md"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block">Manage Stock & Receiving</span>
                      <span className="text-[10px] text-slate-500">
                        Can record supplier deliveries and adjust damaged stock
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={permStock}
                      onChange={(e) => setPermStock(e.target.checked)}
                      className="w-4 h-4 text-teal-800 rounded-md"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending Invite...' : 'Send Staff Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
