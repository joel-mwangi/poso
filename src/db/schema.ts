import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

// Users table authenticated via Firebase Auth (UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('cashier').notNull(), // 'owner' | 'manager' | 'cashier'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Retail Organizations
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  orgId: text('org_id').notNull().unique(),
  name: text('name').notNull(),
  ownerUid: text('owner_uid').notNull(),
  currency: text('currency').default('KES').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Stores / Shops
export const stores = pgTable('stores', {
  id: serial('id').primaryKey(),
  storeId: text('store_id').notNull().unique(),
  orgId: text('org_id').notNull(),
  name: text('name').notNull(),
  location: text('location'),
  phone: text('phone'),
  mpesaTill: text('mpesa_till'),
  mpesaPaybill: text('mpesa_paybill'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Products & Inventory Items
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  productId: text('product_id').notNull().unique(),
  storeId: text('store_id').notNull(),
  name: text('name').notNull(),
  category: text('category').default('General').notNull(),
  unit: text('unit').default('pcs').notNull(),
  sellingPrice: numeric('selling_price', { precision: 12, scale: 2 }).notNull(),
  costPrice: numeric('cost_price', { precision: 12, scale: 2 }).default('0.00').notNull(),
  stockQuantity: numeric('stock_quantity', { precision: 12, scale: 2 }).default('0.00').notNull(),
  lowStockThreshold: numeric('low_stock_threshold', { precision: 12, scale: 2 }).default('5.00').notNull(),
  barcode: text('barcode'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Customers & Deni (Store Credit) Ledger
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  customerId: text('customer_id').notNull().unique(),
  storeId: text('store_id').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  creditLimit: numeric('credit_limit', { precision: 12, scale: 2 }).default('5000.00').notNull(),
  currentDeni: numeric('current_deni', { precision: 12, scale: 2 }).default('0.00').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sales Transactions
export const sales = pgTable('sales', {
  id: serial('id').primaryKey(),
  saleId: text('sale_id').notNull().unique(),
  storeId: text('store_id').notNull(),
  cashierUid: text('cashier_uid').notNull(),
  cashierName: text('cashier_name'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull(), // 'cash' | 'mpesa' | 'deni' | 'split'
  paymentStatus: text('payment_status').default('completed').notNull(),
  customerId: text('customer_id'),
  receiptNumber: text('receipt_number').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Sale Line Items
export const saleItems = pgTable('sale_items', {
  id: serial('id').primaryKey(),
  saleId: text('sale_id').notNull(),
  productId: text('product_id').notNull(),
  productName: text('product_name').notNull(),
  quantity: numeric('quantity', { precision: 12, scale: 2 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  costPrice: numeric('cost_price', { precision: 12, scale: 2 }).default('0.00').notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Deni Transactions (Credit Issue & Repayments)
export const deniTransactions = pgTable('deni_transactions', {
  id: serial('id').primaryKey(),
  transactionId: text('transaction_id').notNull().unique(),
  customerId: text('customer_id').notNull(),
  storeId: text('store_id').notNull(),
  saleId: text('sale_id'),
  type: text('type').notNull(), // 'charge' | 'payment'
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  balanceAfter: numeric('balance_after', { precision: 12, scale: 2 }).notNull(),
  recordedByUid: text('recorded_by_uid').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Inventory Movements / Adjustments
export const inventoryMovements = pgTable('inventory_movements', {
  id: serial('id').primaryKey(),
  movementId: text('movement_id').notNull().unique(),
  productId: text('product_id').notNull(),
  storeId: text('store_id').notNull(),
  type: text('type').notNull(), // 'sale' | 'restock' | 'damaged' | 'count_adjustment'
  quantityDelta: numeric('quantity_delta', { precision: 12, scale: 2 }).notNull(),
  balanceAfter: numeric('balance_after', { precision: 12, scale: 2 }).notNull(),
  reason: text('reason'),
  performedByUid: text('performed_by_uid').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Outbox Sync Ingest Journal
export const syncJournal = pgTable('sync_journal', {
  id: serial('id').primaryKey(),
  operationId: text('operation_id').notNull().unique(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  entity: text('entity').notNull(),
  action: text('action').notNull(),
  storeId: text('store_id').notNull(),
  actorUid: text('actor_uid').notNull(),
  payload: jsonb('payload').notNull(),
  processedAt: timestamp('processed_at').defaultNow().notNull(),
});

// Relations
export const salesRelations = relations(sales, ({ many }) => ({
  items: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.saleId],
  }),
}));

export const customerRelations = relations(customers, ({ many }) => ({
  deniTransactions: many(deniTransactions),
}));
