import Dexie, { type Table } from 'dexie';

export interface LocalProduct {
  id: string;
  shopId: string;
  name: string;
  category: string;
  barcode?: string;
  sku?: string;
  sellingPrice: number; // in KES cents (e.g. 15000 = KES 150.00)
  costPrice: number;    // in KES cents
  currentStock: number;
  minStockAlert: number;
  unit: string;         // 'pcs', 'kg', 'ltr', 'packet', 'bundle'
  isArchived: boolean;
  updatedAt: string;
}

export interface LocalSaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  unitPrice: number; // KES cents
  quantity: number;
  total: number;     // KES cents
}

export interface LocalPayment {
  id: string;
  saleId: string;
  method: 'cash' | 'mpesa' | 'deni' | 'bank';
  amount: number;    // KES cents
  reference?: string; // e.g. M-Pesa Transaction Code (QK48X...)
  status: 'completed' | 'pending';
  createdAt: string;
}

export interface LocalSale {
  id: string;
  localSaleId: string;
  shopId: string;
  organizationId: string;
  cashierId: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  subtotal: number;   // KES cents
  discount: number;   // KES cents
  total: number;      // KES cents
  status: 'completed' | 'voided' | 'returned';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  items: LocalSaleItem[];
  payments: LocalPayment[];
  notes?: string;
  createdAt: string;
  synced: boolean;
}

export interface LocalCustomer {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  deniBalance: number; // KES cents (amount customer owes)
  deniLimit: number;   // KES cents (max credit allowed)
  notes?: string;
  updatedAt: string;
}

export interface LocalDeniTransaction {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  saleId?: string;
  type: 'borrow' | 'repay';
  amount: number;       // KES cents
  balanceAfter: number; // KES cents
  notes?: string;
  createdAt: string;
  synced: boolean;
}

export interface LocalShift {
  id: string;
  shopId: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;  // KES cents
  closingCash?: number; // KES cents
  expectedCash: number; // KES cents
  actualCash?: number;  // KES cents
  cashSales: number;    // KES cents
  mpesaSales: number;   // KES cents
  deniGiven: number;    // KES cents
  deniRepaid: number;   // KES cents
  expenses: number;     // KES cents
  notes?: string;
  status: 'open' | 'closed';
}

export interface LocalOutboxItem {
  id: string;
  operationId: string;
  entity: 'sale' | 'product' | 'customer' | 'deni' | 'shift';
  action: 'insert' | 'update' | 'delete';
  payload: any;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  createdAt: string;
  lastAttemptAt?: string;
  error?: string;
}

export interface LocalOrganization {
  id: string;
  ownerId: string;
  ownerEmail: string;
  name: string;
  hasMultipleShops: boolean;
  acceptsMpesa: boolean;
  allowsDeni: boolean;
  buysFromSuppliers: boolean;
  runsAlone: boolean;
  setupMode: 'simple' | 'recommended';
  createdAt: string;
}

export interface LocalShop {
  id: string;
  organizationId: string;
  name: string;
  location: string;
  photoUrl?: string;
  currency: string;
  language: string;
  timezone: string;
  payments: {
    cash: boolean;
    mpesa: {
      enabled: boolean;
      type: 'till' | 'paybill';
      number: string;
      mode: 'sandbox' | 'live';
    };
    deni: {
      enabled: boolean;
    };
  };
  hasHelper: boolean;
  helperName?: string;
  helperEmail?: string;
  helperPhone?: string;
  helperPermissions?: {
    sellProducts: boolean;
    receivePayments: boolean;
    manageStock: boolean;
  };
  createdAt: string;
}

export interface LocalSupplier {
  id: string;
  shopId: string;
  organizationId: string;
  name: string;
  phone: string;
  email?: string;
  contactPerson?: string;
  notes?: string;
  balanceOwed: number; // KES cents (amount shop owes supplier)
  updatedAt: string;
}

export interface LocalPurchaseItem {
  productId: string;
  productName: string;
  unitCost: number; // KES cents
  quantity: number;
  totalCost: number; // KES cents
}

export interface LocalPurchase {
  id: string;
  shopId: string;
  organizationId: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  totalCost: number; // KES cents
  paidAmount: number; // KES cents
  balanceDue: number; // KES cents
  paymentMethod: 'cash' | 'mpesa' | 'credit';
  status: 'received' | 'pending';
  items: LocalPurchaseItem[];
  notes?: string;
  createdAt: string;
}

export interface LocalStockMovement {
  id: string;
  shopId: string;
  productId: string;
  productName: string;
  quantityChange: number; // positive for addition, negative for reduction
  balanceAfter: number;
  reason: 'sale' | 'purchase_received' | 'adjustment_damage' | 'adjustment_spoilage' | 'adjustment_loss' | 'adjustment_found' | 'count_correction' | 'opening_stock';
  referenceId?: string;
  notes?: string;
  performedBy: string;
  createdAt: string;
}

export interface LocalStaffInvitation {
  id: string;
  organizationId: string;
  shopId: string;
  shopName: string;
  name: string;
  email: string;
  phone?: string;
  permissions: {
    sellProducts: boolean;
    receivePayments: boolean;
    manageStock: boolean;
  };
  status: 'pending' | 'accepted' | 'cancelled';
  createdAt: string;
}

export class DukaFlowDatabase extends Dexie {
  products!: Table<LocalProduct, string>;
  sales!: Table<LocalSale, string>;
  customers!: Table<LocalCustomer, string>;
  deni_transactions!: Table<LocalDeniTransaction, string>;
  shifts!: Table<LocalShift, string>;
  outbox!: Table<LocalOutboxItem, string>;
  organizations!: Table<LocalOrganization, string>;
  shops!: Table<LocalShop, string>;
  staff_invitations!: Table<LocalStaffInvitation, string>;
  suppliers!: Table<LocalSupplier, string>;
  purchases!: Table<LocalPurchase, string>;
  stock_movements!: Table<LocalStockMovement, string>;

  constructor() {
    super('DukaFlowOfflineDB');
    this.version(1).stores({
      products: 'id, shopId, name, category, barcode, sku, currentStock, isArchived, updatedAt',
      sales: 'id, localSaleId, shopId, organizationId, cashierId, customerId, status, createdAt, synced',
      customers: 'id, shopId, name, phone, deniBalance',
      deni_transactions: 'id, shopId, customerId, saleId, type, createdAt, synced',
      shifts: 'id, shopId, cashierId, status, openedAt',
      outbox: 'id, operationId, entity, action, status, createdAt',
    });

    this.version(2).stores({
      organizations: 'id, ownerId, ownerEmail, name, createdAt',
      shops: 'id, organizationId, name, location, createdAt',
      staff_invitations: 'id, organizationId, shopId, email, status, createdAt',
    });

    this.version(3).stores({
      suppliers: 'id, shopId, organizationId, name, phone, balanceOwed, updatedAt',
      purchases: 'id, shopId, organizationId, supplierId, invoiceNumber, status, createdAt',
      stock_movements: 'id, shopId, productId, reason, createdAt',
    });
  }
}

export const localDb = new DukaFlowDatabase();

// Seed initial stock items if database is freshly initialized
export async function seedInitialLocalDataIfEmpty(shopId: string = 'shop_main_01') {
  const count = await localDb.products.count();
  if (count === 0) {
    const defaultProducts: LocalProduct[] = [
      {
        id: 'prod_unga_2kg',
        shopId,
        name: 'Jogoo Maize Meal (Unga) 2kg',
        category: 'Food & Grains',
        barcode: '616110001001',
        sku: 'UNG-001',
        sellingPrice: 19000, // KES 190.00
        costPrice: 16500,
        currentStock: 48,
        minStockAlert: 10,
        unit: 'packet',
        isArchived: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_sugar_1kg',
        shopId,
        name: 'Mumias Sugar 1kg',
        category: 'Food & Grains',
        barcode: '616110001002',
        sku: 'SUG-001',
        sellingPrice: 16000, // KES 160.00
        costPrice: 14000,
        currentStock: 35,
        minStockAlert: 8,
        unit: 'kg',
        isArchived: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_cooking_oil_1l',
        shopId,
        name: 'Rina Salad Cooking Oil 1L',
        category: 'Oils & Fats',
        barcode: '616110001003',
        sku: 'OIL-001',
        sellingPrice: 28000, // KES 280.00
        costPrice: 24500,
        currentStock: 22,
        minStockAlert: 5,
        unit: 'ltr',
        isArchived: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_milk_500ml',
        shopId,
        name: 'Brookside Fresh Milk 500ml',
        category: 'Dairy',
        barcode: '616110001004',
        sku: 'MLK-001',
        sellingPrice: 6500, // KES 65.00
        costPrice: 5400,
        currentStock: 30,
        minStockAlert: 6,
        unit: 'packet',
        isArchived: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_bar_soap_800g',
        shopId,
        name: 'Menengai Cream Bar Soap 800g',
        category: 'Detergents & Cleaners',
        barcode: '616110001005',
        sku: 'SOP-001',
        sellingPrice: 17500, // KES 175.00
        costPrice: 15000,
        currentStock: 26,
        minStockAlert: 5,
        unit: 'bar',
        isArchived: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_bread_400g',
        shopId,
        name: 'Festive Bread 400g (White)',
        category: 'Bakery',
        barcode: '616110001006',
        sku: 'BRD-001',
        sellingPrice: 6500, // KES 65.00
        costPrice: 5500,
        currentStock: 18,
        minStockAlert: 5,
        unit: 'loaf',
        isArchived: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_tea_leaves_100g',
        shopId,
        name: 'Ketepa Pride Tea Leaves 100g',
        category: 'Beverages',
        barcode: '616110001007',
        sku: 'TEA-001',
        sellingPrice: 5500, // KES 55.00
        costPrice: 4500,
        currentStock: 40,
        minStockAlert: 10,
        unit: 'packet',
        isArchived: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_salt_1kg',
        shopId,
        name: 'Kensalt Iodized Table Salt 1kg',
        category: 'Spices & Salt',
        barcode: '616110001008',
        sku: 'SLT-001',
        sellingPrice: 4000, // KES 40.00
        costPrice: 3200,
        currentStock: 60,
        minStockAlert: 12,
        unit: 'packet',
        isArchived: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_eggs_crate',
        shopId,
        name: 'Fresh Farm Eggs (Tray of 30)',
        category: 'Poultry',
        barcode: '616110001009',
        sku: 'EGG-030',
        sellingPrice: 46000, // KES 460.00
        costPrice: 41000,
        currentStock: 7,
        minStockAlert: 3,
        unit: 'tray',
        isArchived: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prod_airtime_safaricom_100',
        shopId,
        name: 'Safaricom Airtime Scratch Card 100',
        category: 'Telecom & Cards',
        barcode: '616110001010',
        sku: 'TEL-100',
        sellingPrice: 10000, // KES 100.00
        costPrice: 9600,
        currentStock: 50,
        minStockAlert: 10,
        unit: 'card',
        isArchived: false,
        updatedAt: new Date().toISOString(),
      },
    ];

    await localDb.products.bulkAdd(defaultProducts);
  }

  // Seed sample customers for Deni tracking
  const customerCount = await localDb.customers.count();
  if (customerCount === 0) {
    const defaultCustomers: LocalCustomer[] = [
      {
        id: 'cust_mama_boi',
        shopId,
        name: 'Mama Boi (Plot 4)',
        phone: '0712345678',
        deniBalance: 45000, // KES 450.00 existing debt
        deniLimit: 200000,  // KES 2,000.00 limit
        notes: 'Pays every end of month reliably',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cust_boda_john',
        shopId,
        name: 'John Boda (Stage)',
        phone: '0722987654',
        deniBalance: 28000, // KES 280.00
        deniLimit: 150000,  // KES 1,500.00 limit
        notes: 'Daily customer at stage',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cust_teacher_mary',
        shopId,
        name: 'Madam Mary (Primary School)',
        phone: '0733112233',
        deniBalance: 0,
        deniLimit: 300000,  // KES 3,000.00 limit
        notes: 'School teacher next door',
        updatedAt: new Date().toISOString(),
      },
    ];
    await localDb.customers.bulkAdd(defaultCustomers);
  }

  // Seed sample suppliers if empty
  const supplierCount = await localDb.suppliers.count();
  if (supplierCount === 0) {
    const defaultSuppliers: LocalSupplier[] = [
      {
        id: 'supp_kapa_oil',
        shopId,
        organizationId: 'org_main_01',
        name: 'Kapa Oil Refineries (Distributor)',
        phone: '0722100200',
        email: 'orders@kapa-distributor.co.ke',
        contactPerson: 'David Kamau',
        notes: 'Delivers cooking oil and bar soaps on Tuesdays',
        balanceOwed: 1200000, // KES 12,000.00
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'supp_brookside',
        shopId,
        organizationId: 'org_main_01',
        name: 'Brookside Dairy East Africa',
        phone: '0733400500',
        contactPerson: 'Eunice Wanjiku',
        notes: 'Daily early morning fresh milk drop-off',
        balanceOwed: 0,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'supp_unga_group',
        shopId,
        organizationId: 'org_main_01',
        name: 'Unga Farm Care / Grain Millers',
        phone: '0711900800',
        contactPerson: 'Peter Ochieng',
        notes: 'Maize meal and wheat flour wholesale',
        balanceOwed: 1850000, // KES 18,500.00
        updatedAt: new Date().toISOString(),
      },
    ];
    await localDb.suppliers.bulkAdd(defaultSuppliers);
  }
}
