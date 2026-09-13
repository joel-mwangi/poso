import {
  localDb,
  LocalOrganization,
  LocalShop,
  LocalStaffInvitation,
  seedStarterCatalogForShop,
  seedDemoDataForShop,
} from '@/platform/database/dexie-db';
import { AuthUser, HelperInput, NewShopInput, OwnerChecklistAnswers } from './auth-types';

const STORAGE_KEY_USER = 'dukaflow_auth_user';
const STORAGE_KEY_ACTIVE_SHOP_ID = 'dukaflow_active_shop_id';

class AuthService {
  private currentUser: AuthUser | null = null;
  private currentOrg: LocalOrganization | null = null;
  private shops: LocalShop[] = [];
  private activeShopId: string | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.restoreSession();
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  public async restoreSession(): Promise<void> {
    const rawUser = localStorage.getItem(STORAGE_KEY_USER);
    if (!rawUser) {
      this.currentUser = null;
      this.currentOrg = null;
      this.shops = [];
      this.activeShopId = null;
      this.notify();
      return;
    }

    try {
      this.currentUser = JSON.parse(rawUser);

      if (this.currentUser?.organizationId) {
        // Load organization from Dexie
        const org = await localDb.organizations.get(this.currentUser.organizationId);
        this.currentOrg = org || null;

        // Load shops
        const shopList = await localDb.shops.where('organizationId').equals(this.currentUser.organizationId).toArray();
        this.shops = shopList;

        const storedShopId = localStorage.getItem(STORAGE_KEY_ACTIVE_SHOP_ID);
        if (storedShopId && shopList.some((s) => s.id === storedShopId)) {
          this.activeShopId = storedShopId;
        } else if (shopList.length > 0) {
          this.activeShopId = shopList[0].id;
          localStorage.setItem(STORAGE_KEY_ACTIVE_SHOP_ID, shopList[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
      this.currentUser = null;
    }

    this.notify();
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public getCurrentOrg(): LocalOrganization | null {
    return this.currentOrg;
  }

  public getShops(): LocalShop[] {
    return this.shops;
  }

  public getActiveShop(): LocalShop | null {
    if (!this.activeShopId) return this.shops[0] || null;
    return this.shops.find((s) => s.id === this.activeShopId) || this.shops[0] || null;
  }

  public setActiveShop(shopId: string): void {
    this.activeShopId = shopId;
    localStorage.setItem(STORAGE_KEY_ACTIVE_SHOP_ID, shopId);
    this.notify();
  }

  public async reloadShops(): Promise<void> {
    if (this.currentUser?.organizationId) {
      this.shops = await localDb.shops
        .where('organizationId')
        .equals(this.currentUser.organizationId)
        .toArray();
      this.notify();
    }
  }

  // Register a new Owner account (does not have an organization yet, routes to Onboarding Checklist)
  public async registerOwner(name: string, email: string, phone?: string): Promise<AuthUser> {
    const user: AuthUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      phone,
      role: 'owner',
      status: 'active',
    };

    this.currentUser = user;
    this.currentOrg = null;
    this.shops = [];
    this.activeShopId = null;

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    localStorage.removeItem(STORAGE_KEY_ACTIVE_SHOP_ID);
    this.notify();
    return user;
  }

  // Log in existing account
  public async login(email: string): Promise<AuthUser> {
    // Check if there is an organization with this owner email in localDb
    const org = await localDb.organizations.where('ownerEmail').equalsIgnoreCase(email).first();
    
    if (org) {
      const user: AuthUser = {
        id: org.ownerId,
        name: org.name.replace(/ Retail| Enterprise| Duka/i, '') || 'Shop Owner',
        email,
        role: 'owner',
        status: 'active',
        organizationId: org.id,
      };

      this.currentUser = user;
      this.currentOrg = org;
      const shopList = await localDb.shops.where('organizationId').equals(org.id).toArray();
      this.shops = shopList;
      if (shopList.length > 0) {
        this.activeShopId = shopList[0].id;
        localStorage.setItem(STORAGE_KEY_ACTIVE_SHOP_ID, shopList[0].id);
      }

      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      this.notify();
      return user;
    }

    // Check if it is an invited helper
    const invitation = await localDb.staff_invitations.where('email').equalsIgnoreCase(email).first();
    if (invitation && invitation.status === 'accepted') {
      const user: AuthUser = {
        id: `usr_helper_${invitation.id}`,
        name: invitation.name,
        email: invitation.email,
        phone: invitation.phone,
        role: 'staff',
        status: 'active',
        organizationId: invitation.organizationId,
        assignedShopIds: [invitation.shopId],
        permissions: invitation.permissions,
      };

      this.currentUser = user;
      const linkedOrg = await localDb.organizations.get(invitation.organizationId);
      this.currentOrg = linkedOrg || null;
      const assignedShop = await localDb.shops.get(invitation.shopId);
      this.shops = assignedShop ? [assignedShop] : [];
      this.activeShopId = invitation.shopId;

      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_ACTIVE_SHOP_ID, invitation.shopId);
      this.notify();
      return user;
    }

    // Default fallback if not found in db: log in as new owner
    return this.registerOwner(email.split('@')[0], email);
  }

  // Accept helper invitation
  public async acceptInvitation(email: string, invitationCode?: string): Promise<AuthUser> {
    // Look up or create staff invitation
    let invitation = await localDb.staff_invitations.where('email').equalsIgnoreCase(email).first();
    
    if (!invitation) {
      // Create mock accepted invitation for test ease
      invitation = {
        id: `inv_${Date.now()}`,
        organizationId: 'org_main_01',
        shopId: 'shop_main_01',
        shopName: 'Duka Central Nairobi',
        name: email.split('@')[0],
        email,
        permissions: {
          sellProducts: true,
          receivePayments: true,
          manageStock: false,
        },
        status: 'accepted',
        createdAt: new Date().toISOString(),
      };
      await localDb.staff_invitations.put(invitation);
    } else {
      invitation.status = 'accepted';
      await localDb.staff_invitations.put(invitation);
    }

    const user: AuthUser = {
      id: `usr_helper_${invitation.id}`,
      name: invitation.name,
      email: invitation.email,
      phone: invitation.phone,
      role: 'staff',
      status: 'active',
      organizationId: invitation.organizationId,
      assignedShopIds: [invitation.shopId],
      permissions: invitation.permissions,
    };

    this.currentUser = user;
    const org = await localDb.organizations.get(invitation.organizationId);
    this.currentOrg = org || null;
    const shop = await localDb.shops.get(invitation.shopId);
    this.shops = shop ? [shop] : [];
    this.activeShopId = invitation.shopId;

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_ACTIVE_SHOP_ID, invitation.shopId);
    this.notify();
    return user;
  }

  // Complete Owner Onboarding: Bootstrap Organization and Shops
  public async completeOwnerOnboarding(params: {
    answers: OwnerChecklistAnswers;
    orgName: string;
    primaryShop: NewShopInput;
    additionalShops: NewShopInput[];
    helper?: HelperInput;
    mpesaType?: 'till' | 'paybill';
    mpesaNumber?: string;
  }): Promise<{ org: LocalOrganization; shops: LocalShop[] }> {
    if (!this.currentUser) {
      throw new Error('No authenticated user session found');
    }

    const orgId = `org_${Date.now()}`;
    const now = new Date().toISOString();

    const newOrg: LocalOrganization = {
      id: orgId,
      ownerId: this.currentUser.id,
      ownerEmail: this.currentUser.email,
      name: params.orgName.trim() || 'My Kenyan Retail Org',
      hasMultipleShops: params.answers.hasMultipleShops,
      acceptsMpesa: params.answers.acceptsMpesa,
      allowsDeni: params.answers.allowsDeni,
      buysFromSuppliers: params.answers.buysFromSuppliers,
      runsAlone: params.answers.runsAlone,
      setupMode: params.answers.setupChoice,
      createdAt: now,
    };

    await localDb.organizations.put(newOrg);

    const createdShops: LocalShop[] = [];

    // Primary shop
    const primaryShopId = `shop_${Date.now()}_1`;
    const primaryShop: LocalShop = {
      id: primaryShopId,
      organizationId: orgId,
      name: params.primaryShop.name.trim() || 'Main Shop',
      location: params.primaryShop.location.trim() || 'Nairobi Central',
      currency: 'KSh',
      language: 'English',
      timezone: 'East Africa Time',
      payments: {
        cash: true,
        mpesa: {
          enabled: params.answers.acceptsMpesa,
          type: params.mpesaType || 'till',
          number: params.mpesaNumber || (params.answers.acceptsMpesa ? '5428901' : ''),
          mode: 'live',
        },
        deni: {
          enabled: params.answers.allowsDeni,
        },
      },
      hasHelper: Boolean(params.helper),
      helperName: params.helper?.name,
      helperEmail: params.helper?.email,
      helperPhone: params.helper?.phone,
      helperPermissions: params.helper?.permissions,
      createdAt: now,
    };

    await localDb.shops.put(primaryShop);
    createdShops.push(primaryShop);

    // If helper added, record invitation
    if (params.helper && params.helper.email) {
      const invitation: LocalStaffInvitation = {
        id: `inv_${Date.now()}`,
        organizationId: orgId,
        shopId: primaryShopId,
        shopName: primaryShop.name,
        name: params.helper.name,
        email: params.helper.email,
        phone: params.helper.phone,
        permissions: params.helper.permissions,
        status: 'pending',
        createdAt: now,
      };
      await localDb.staff_invitations.put(invitation);
    }

    // Additional shops (if multi-shop was selected)
    for (let i = 0; i < params.additionalShops.length; i++) {
      const extra = params.additionalShops[i];
      if (extra.name.trim()) {
        const extraShopId = `shop_${Date.now()}_${i + 2}`;
        const extraShop: LocalShop = {
          id: extraShopId,
          organizationId: orgId,
          name: extra.name.trim(),
          location: extra.location.trim() || 'Town Branch',
          currency: 'KSh',
          language: 'English',
          timezone: 'East Africa Time',
          payments: {
            cash: true,
            mpesa: {
              enabled: params.answers.acceptsMpesa,
              type: 'till',
              number: '5428902',
              mode: 'live',
            },
            deni: {
              enabled: params.answers.allowsDeni,
            },
          },
          hasHelper: false,
          createdAt: now,
        };
        await localDb.shops.put(extraShop);
        createdShops.push(extraShop);
      }
    }

    // If owner opted to load Kenyan retail starter templates, seed them with 0 stock
    if (params.answers.catalogChoice === 'kenyan_essentials') {
      await seedStarterCatalogForShop(primaryShopId, 0);
    }
    // If 'empty', no products are pre-seeded; owner starts with clean, empty shelves.

    // Update state
    this.currentUser.organizationId = orgId;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
    this.currentOrg = newOrg;
    this.shops = createdShops;
    this.activeShopId = primaryShopId;
    localStorage.setItem(STORAGE_KEY_ACTIVE_SHOP_ID, primaryShopId);

    this.notify();
    return { org: newOrg, shops: createdShops };
  }

  // Switch demo account for quick evaluation
  public async switchDemoAccount(type: 'owner' | 'staff' | 'new_owner'): Promise<void> {
    if (type === 'new_owner') {
      await this.registerOwner('Kariuki Mwangi', 'kariuki@mwangazaduka.ke', '0722 000 111');
      return;
    }

    if (type === 'owner') {
      const demoOrgId = 'org_demo_mwangaza';
      const demoShopId = 'shop_demo_01';

      // Ensure demo org exists
      let org = await localDb.organizations.get(demoOrgId);
      if (!org) {
        org = {
          id: demoOrgId,
          ownerId: 'usr_demo_owner',
          ownerEmail: 'mwangi@dukaflow.ke',
          name: 'Mwangaza Retail Enterprises',
          hasMultipleShops: true,
          acceptsMpesa: true,
          allowsDeni: true,
          buysFromSuppliers: true,
          runsAlone: false,
          setupMode: 'recommended',
          createdAt: new Date().toISOString(),
        };
        await localDb.organizations.put(org);

        const shop1: LocalShop = {
          id: demoShopId,
          organizationId: demoOrgId,
          name: 'Mwangaza Duka • Kawangware',
          location: 'Kawangware Market, Nairobi',
          currency: 'KSh',
          language: 'English',
          timezone: 'East Africa Time',
          payments: {
            cash: true,
            mpesa: { enabled: true, type: 'till', number: '5428901', mode: 'live' },
            deni: { enabled: true },
          },
          hasHelper: true,
          helperName: 'Joel Gachahi',
          helperEmail: 'joel@dukaflow.ke',
          createdAt: new Date().toISOString(),
        };

        const shop2: LocalShop = {
          id: 'shop_demo_02',
          organizationId: demoOrgId,
          name: 'Mwangaza Wholesale • Kilifi',
          location: 'Kilifi Town Center',
          currency: 'KSh',
          language: 'English',
          timezone: 'East Africa Time',
          payments: {
            cash: true,
            mpesa: { enabled: true, type: 'till', number: '5428902', mode: 'live' },
            deni: { enabled: true },
          },
          hasHelper: false,
          createdAt: new Date().toISOString(),
        };

        await localDb.shops.put(shop1);
        await localDb.shops.put(shop2);
        await seedDemoDataForShop(demoShopId);
      }

      const user: AuthUser = {
        id: 'usr_demo_owner',
        name: 'Mwangi J. (Owner)',
        email: 'mwangi@dukaflow.ke',
        phone: '0712 345 678',
        role: 'owner',
        status: 'active',
        organizationId: demoOrgId,
      };

      this.currentUser = user;
      this.currentOrg = org;
      this.shops = await localDb.shops.where('organizationId').equals(demoOrgId).toArray();
      this.activeShopId = demoShopId;

      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_ACTIVE_SHOP_ID, demoShopId);
      this.notify();
      return;
    }

    if (type === 'staff') {
      const user: AuthUser = {
        id: 'usr_demo_staff',
        name: 'Joel G. (Cashier)',
        email: 'joel@dukaflow.ke',
        phone: '0799 123 456',
        role: 'staff',
        status: 'active',
        organizationId: 'org_demo_mwangaza',
        assignedShopIds: ['shop_demo_01'],
        permissions: {
          sellProducts: true,
          receivePayments: true,
          manageStock: true,
        },
      };

      this.currentUser = user;
      this.currentOrg = (await localDb.organizations.get('org_demo_mwangaza')) || null;
      const shop = await localDb.shops.get('shop_demo_01');
      this.shops = shop ? [shop] : [];
      this.activeShopId = 'shop_demo_01';

      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_ACTIVE_SHOP_ID, 'shop_demo_01');
      this.notify();
    }
  }

  // Logout
  public logout(): void {
    this.currentUser = null;
    this.currentOrg = null;
    this.shops = [];
    this.activeShopId = null;
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_SHOP_ID);
    this.notify();
  }
}

export const authService = new AuthService();
