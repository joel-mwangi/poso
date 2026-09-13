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

// Kenyan retail essentials catalog templates for new shops
export const KENYAN_RETAIL_STARTER_PRODUCTS: Omit<LocalProduct, 'id' | 'shopId' | 'updatedAt'>[] = [
  {
    name: 'Jogoo Maize Meal (Unga) 2kg',
    category: 'Food & Grains',
    barcode: '616110001001',
    sku: 'UNG-001',
    sellingPrice: 19000, // KES 190.00
    costPrice: 16500,
    currentStock: 0,
    minStockAlert: 10,
    unit: 'packet',
    isArchived: false,
  },
  {
    name: 'Mumias Sugar 1kg',
    category: 'Food & Grains',
    barcode: '616110001002',
    sku: 'SUG-001',
    sellingPrice: 16000, // KES 160.00
    costPrice: 14000,
    currentStock: 0,
    minStockAlert: 8,
    unit: 'kg',
    isArchived: false,
  },
  {
    name: 'Rina Salad Cooking Oil 1L',
    category: 'Oils & Fats',
    barcode: '616110001003',
    sku: 'OIL-001',
    sellingPrice: 28000, // KES 280.00
    costPrice: 24500,
    currentStock: 0,
    minStockAlert: 5,
    unit: 'ltr',
    isArchived: false,
  },
  {
    name: 'Brookside Fresh Milk 500ml',
    category: 'Dairy',
    barcode: '616110001004',
    sku: 'MLK-001',
    sellingPrice: 6500, // KES 65.00
    costPrice: 5400,
    currentStock: 0,
    minStockAlert: 6,
    unit: 'packet',
    isArchived: false,
  },
  {
    name: 'Menengai Cream Bar Soap 800g',
    category: 'Detergents & Cleaners',
    barcode: '616110001005',
    sku: 'SOP-001',
    sellingPrice: 17500, // KES 175.00
    costPrice: 15000,
    currentStock: 0,
    minStockAlert: 5,
    unit: 'bar',
    isArchived: false,
  },
  {
    name: 'Festive Bread 400g (White)',
    category: 'Bakery',
    barcode: '616110001006',
    sku: 'BRD-001',
    sellingPrice: 6500, // KES 65.00
    costPrice: 5500,
    currentStock: 0,
    minStockAlert: 5,
    unit: 'loaf',
    isArchived: false,
  },
  {
    name: 'Ketepa Pride Tea Leaves 250g',
    category: 'Beverages',
    barcode: '616110001007',
    sku: 'TEA-001',
    sellingPrice: 14500, // KES 145.00
    costPrice: 12500,
    currentStock: 0,
    minStockAlert: 10,
    unit: 'packet',
    isArchived: false,
  },
  {
    name: 'Kensalt Iodized Table Salt 1kg',
    category: 'Spices & Salt',
    barcode: '616110001008',
    sku: 'SLT-001',
    sellingPrice: 4000, // KES 40.00
    costPrice: 3200,
    currentStock: 0,
    minStockAlert: 12,
    unit: 'packet',
    isArchived: false,
  },
  {
    name: 'Fresh Farm Eggs (Tray of 30)',
    category: 'Poultry',
    barcode: '616110001009',
    sku: 'EGG-030',
    sellingPrice: 46000, // KES 460.00
    costPrice: 41000,
    currentStock: 0,
    minStockAlert: 3,
    unit: 'tray',
    isArchived: false,
  },
  {
    name: 'Safaricom Airtime Scratch Card 100',
    category: 'Telecom & Cards',
    barcode: '616110001010',
    sku: 'TEL-100',
    sellingPrice: 10000, // KES 100.00
    costPrice: 9600,
    currentStock: 0,
    minStockAlert: 10,
    unit: 'card',
    isArchived: false,
  },
];

// Helper to seed starter catalog templates (Unga, Sugar, Milk) for a real shop without mock sales/debt
export async function seedStarterCatalogForShop(shopId: string, initialStock: number = 0) {
  const existingCount = await localDb.products.where('shopId').equals(shopId).count();
  if (existingCount > 0) return;

  const starterProducts: LocalProduct[] = KENYAN_RETAIL_STARTER_PRODUCTS.map((p, idx) => ({
    ...p,
    id: `prod_${shopId}_${idx + 1}`,
    shopId,
    currentStock: initialStock,
    updatedAt: new Date().toISOString(),
  }));

  await localDb.products.bulkAdd(starterProducts);
}

// Seed full mock data ONLY for live demo / testing evaluation
export async function seedDemoDataForShop(shopId: string = 'shop_demo_01') {
  const count = await localDb.products.where('shopId').equals(shopId).count();
  if (count === 0) {
    const demoProducts: LocalProduct[] = KENYAN_RETAIL_STARTER_PRODUCTS.map((p, idx) => {
      const demoStock = [48, 35, 22, 30, 26, 18, 15, 60, 7, 50][idx] ?? 20;
      return {
        ...p,
        id: `prod_demo_${idx + 1}`,
        shopId,
        currentStock: demoStock,
        updatedAt: new Date().toISOString(),
      };
    });
    await localDb.products.bulkAdd(demoProducts);
  }

  // Seed sample customers for Deni tracking (only for demo shop)
  const customerCount = await localDb.customers.where('shopId').equals(shopId).count();
  if (customerCount === 0) {
    const defaultCustomers: LocalCustomer[] = [
      {
        id: `cust_${shopId}_mama_boi`,
        shopId,
        name: 'Mama Boi (Plot 4)',
        phone: '0712345678',
        deniBalance: 45000, // KES 450.00 existing debt
        deniLimit: 200000,  // KES 2,000.00 limit
        notes: 'Pays every end of month reliably',
        updatedAt: new Date().toISOString(),
      },
      {
        id: `cust_${shopId}_boda_john`,
        shopId,
        name: 'John Boda (Stage)',
        phone: '0722987654',
        deniBalance: 28000, // KES 280.00
        deniLimit: 150000,  // KES 1,500.00 limit
        notes: 'Daily customer at stage',
        updatedAt: new Date().toISOString(),
      },
      {
        id: `cust_${shopId}_teacher_mary`,
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

  // Seed sample suppliers if empty for demo
  const supplierCount = await localDb.suppliers.where('shopId').equals(shopId).count();
  if (supplierCount === 0) {
    const defaultSuppliers: LocalSupplier[] = [
      {
        id: `supp_${shopId}_kapa_oil`,
        shopId,
        organizationId: 'org_demo_mwangaza',
        name: 'Kapa Oil Refineries (Distributor)',
        phone: '0722100200',
        email: 'orders@kapa-distributor.co.ke',
        contactPerson: 'David Kamau',
        notes: 'Delivers cooking oil and bar soaps on Tuesdays',
        balanceOwed: 1200000, // KES 12,000.00
        updatedAt: new Date().toISOString(),
      },
      {
        id: `supp_${shopId}_brookside`,
        shopId,
        organizationId: 'org_demo_mwangaza',
        name: 'Brookside Dairy East Africa',
        phone: '0733400500',
        contactPerson: 'Eunice Wanjiku',
        notes: 'Daily early morning fresh milk drop-off',
        balanceOwed: 0,
        updatedAt: new Date().toISOString(),
      },
      {
        id: `supp_${shopId}_unga_group`,
        shopId,
        organizationId: 'org_demo_mwangaza',
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

  // Seed initial realistic sales and an active shift if sales table is empty
  const salesCount = await localDb.sales.where('shopId').equals(shopId).count();
  if (salesCount === 0) {
    const todayIso = new Date().toISOString();

    const initialSales: LocalSale[] = [
      {
        id: `sale_demo_${shopId}_01`,
        localSaleId: 'REC-104921',
        shopId,
        organizationId: 'org_demo_mwangaza',
        cashierId: 'user_owner_01',
        cashierName: 'Mary Wanjiku',
        customerId: `cust_${shopId}_boda_john`,
        customerName: 'John Boda (Stage)',
        subtotal: 25500, // KES 255.00
        discount: 0,
        total: 25500,
        status: 'completed',
        paymentStatus: 'paid',
        items: [
          {
            id: 'item_01',
            saleId: `sale_demo_${shopId}_01`,
            productId: `prod_demo_1`,
            productName: 'Jogoo Maize Meal (Unga) 2kg',
            unitPrice: 19000,
            quantity: 1,
            total: 19000,
          },
          {
            id: 'item_02',
            saleId: `sale_demo_${shopId}_01`,
            productId: `prod_demo_4`,
            productName: 'Brookside Fresh Milk 500ml',
            unitPrice: 6500,
            quantity: 1,
            total: 6500,
          },
        ],
        payments: [
          {
            id: 'pay_01',
            saleId: `sale_demo_${shopId}_01`,
            method: 'cash',
            amount: 25500,
            status: 'completed',
            createdAt: todayIso,
          },
        ],
        createdAt: todayIso,
        synced: true,
      },
      {
        id: `sale_demo_${shopId}_02`,
        localSaleId: 'REC-104922',
        shopId,
        organizationId: 'org_demo_mwangaza',
        cashierId: 'user_owner_01',
        cashierName: 'Mary Wanjiku',
        subtotal: 44000, // KES 440.00
        discount: 0,
        total: 44000,
        status: 'completed',
        paymentStatus: 'paid',
        items: [
          {
            id: 'item_03',
            saleId: `sale_demo_${shopId}_02`,
            productId: `prod_demo_3`,
            productName: 'Rina Salad Cooking Oil 1L',
            unitPrice: 28000,
            quantity: 1,
            total: 28000,
          },
          {
            id: 'item_04',
            saleId: `sale_demo_${shopId}_02`,
            productId: `prod_demo_2`,
            productName: 'Mumias Sugar 1kg',
            unitPrice: 16000,
            quantity: 1,
            total: 16000,
          },
        ],
        payments: [
          {
            id: 'pay_02',
            saleId: `sale_demo_${shopId}_02`,
            method: 'mpesa',
            amount: 44000,
            reference: 'QK89901M',
            status: 'completed',
            createdAt: todayIso,
          },
        ],
        createdAt: todayIso,
        synced: true,
      },
      {
        id: `sale_demo_${shopId}_03`,
        localSaleId: 'REC-104923',
        shopId,
        organizationId: 'org_demo_mwangaza',
        cashierId: 'user_owner_01',
        cashierName: 'Mary Wanjiku',
        customerId: `cust_${shopId}_mama_boi`,
        customerName: 'Mama Boi (Plot 4)',
        subtotal: 36500, // KES 365.00
        discount: 0,
        total: 36500,
        status: 'completed',
        paymentStatus: 'unpaid',
        items: [
          {
            id: 'item_05',
            saleId: `sale_demo_${shopId}_03`,
            productId: `prod_demo_1`,
            productName: 'Jogoo Maize Meal (Unga) 2kg',
            unitPrice: 19000,
            quantity: 1,
            total: 19000,
          },
          {
            id: 'item_06',
            saleId: `sale_demo_${shopId}_03`,
            productId: `prod_demo_5`,
            productName: 'Menengai Cream Bar Soap 800g',
            unitPrice: 17500,
            quantity: 1,
            total: 17500,
          },
        ],
        payments: [
          {
            id: 'pay_03',
            saleId: `sale_demo_${shopId}_03`,
            method: 'deni',
            amount: 36500,
            reference: 'Customer: Mama Boi (Plot 4)',
            status: 'completed',
            createdAt: todayIso,
          },
        ],
        createdAt: todayIso,
        synced: true,
      },
      {
        id: `sale_demo_${shopId}_04`,
        localSaleId: 'REC-104924',
        shopId,
        organizationId: 'org_demo_mwangaza',
        cashierId: 'user_owner_01',
        cashierName: 'Mary Wanjiku',
        subtotal: 13000, // KES 130.00
        discount: 0,
        total: 13000,
        status: 'completed',
        paymentStatus: 'partial',
        items: [
          {
            id: 'item_07',
            saleId: `sale_demo_${shopId}_04`,
            productId: `prod_demo_6`,
            productName: 'Festive Bread 400g (White)',
            unitPrice: 6500,
            quantity: 1,
            total: 6500,
          },
          {
            id: 'item_08',
            saleId: `sale_demo_${shopId}_04`,
            productId: `prod_demo_4`,
            productName: 'Brookside Fresh Milk 500ml',
            unitPrice: 6500,
            quantity: 1,
            total: 6500,
          },
        ],
        payments: [
          {
            id: 'pay_04',
            saleId: `sale_demo_${shopId}_04`,
            method: 'mpesa',
            amount: 13000,
            reference: 'Pending Till SMS',
            status: 'pending',
            createdAt: todayIso,
          },
        ],
        createdAt: todayIso,
        synced: false,
      },
    ];

    await localDb.sales.bulkAdd(initialSales);

    // Also record Mama Boi's Deni transaction
    await localDb.deni_transactions.add({
      id: `deni_tx_${shopId}_01`,
      shopId,
      customerId: `cust_${shopId}_mama_boi`,
      customerName: 'Mama Boi (Plot 4)',
      saleId: `sale_demo_${shopId}_03`,
      type: 'borrow',
      amount: 36500,
      balanceAfter: 45000,
      notes: 'Unga 2kg + Menengai Soap taken on credit',
      createdAt: todayIso,
      synced: true,
    });
  }

  // Seed an open shift for the demo shop
  const shiftCount = await localDb.shifts.where('shopId').equals(shopId).count();
  if (shiftCount === 0) {
    await localDb.shifts.add({
      id: `shift_${shopId}_01`,
      shopId,
      cashierId: 'user_owner_01',
      cashierName: 'Mary Wanjiku',
      openedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      openingCash: 250000, // KES 2,500.00 cash float
      expectedCash: 275500, // Float 2,500 + Cash Sale 255.00 = KES 2,755.00
      cashSales: 25500,
      mpesaSales: 57000,
      deniGiven: 36500,
      deniRepaid: 0,
      expenses: 0,
      status: 'open',
    });
  }
}

// Backward-compatibility shim
export async function seedInitialLocalDataIfEmpty(shopId: string = 'shop_demo_01') {
  await seedDemoDataForShop(shopId);
}

// Helper: Confirm a pending M-Pesa payment
export async function confirmPendingMpesaPayment(saleId: string, reference: string = 'QK' + Math.random().toString(36).substring(2, 7).toUpperCase()) {
  const sale = await localDb.sales.get(saleId);
  if (!sale) return;

  const updatedPayments = sale.payments.map((p) => {
    if (p.method === 'mpesa' && p.status === 'pending') {
      return {
        ...p,
        status: 'completed' as const,
        reference: reference,
      };
    }
    return p;
  });

  await localDb.sales.update(saleId, {
    payments: updatedPayments,
    paymentStatus: 'paid',
  });
}

// Helper: Quick restock a product
export async function quickRestockProduct(productId: string, unitsToAdd: number, shopId: string = 'shop_main_01') {
  const product = await localDb.products.get(productId);
  if (!product) return;

  const newStock = product.currentStock + unitsToAdd;
  await localDb.products.update(productId, {
    currentStock: newStock,
    updatedAt: new Date().toISOString(),
  });

  // Record stock movement
  await localDb.stock_movements.add({
    id: 'sm_' + Date.now(),
    shopId,
    productId,
    productName: product.name,
    quantityChange: unitsToAdd,
    balanceAfter: newStock,
    reason: 'purchase_received',
    performedBy: 'Shop Owner',
    notes: `Quick restock of ${unitsToAdd} ${product.unit}`,
    createdAt: new Date().toISOString(),
  });
}
