import { LocalProduct, LocalSale, LocalCustomer, LocalPayment, LocalShift } from '@/platform/database/dexie-db';

export interface ProductVelocity {
  product: LocalProduct;
  unitsSold: number;
  revenue: number;
  runwayDays: number;
  velocityStatus: 'fast' | 'moderate' | 'stagnant';
  dailyRunRate: number;
}

export interface CustomerInsight {
  customer: LocalCustomer;
  purchaseCount: number;
  totalSpend: number;
  lastVisit: string;
  favoriteProduct?: string;
  deniAgingDays: number;
  isOverdue: boolean;
}

export interface PendingMpesaItem {
  sale: LocalSale;
  payment: LocalPayment;
}

export interface BusinessRecommendation {
  id: string;
  category: 'stock' | 'cash' | 'customer' | 'margin';
  title: string;
  headline: string;
  actionLabel: string;
  actionType: 'restock' | 'confirm_mpesa' | 'remind_customer' | 'balance_shift' | 'view_inventory';
  payload?: any;
  priority: 'urgent' | 'important' | 'opportunity';
  evidence: {
    supportingData: string[];
    recordsCount: number;
    calculationNote: string;
    lastRecordedFact: string;
  };
}

export type OutcomeTab = 'all' | 'stock' | 'cash' | 'customers' | 'growth';
