export type UserRole = 'owner' | 'staff';
export type UserStatus = 'active' | 'invited' | 'suspended' | 'on_leave';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  organizationId?: string;
  assignedShopIds?: string[];
  permissions?: {
    sellProducts: boolean;
    receivePayments: boolean;
    manageStock: boolean;
  };
}

export interface OwnerChecklistAnswers {
  hasMultipleShops: boolean;
  acceptsMpesa: boolean;
  allowsDeni: boolean;
  buysFromSuppliers: boolean;
  runsAlone: boolean;
  otherPeopleUseSystem: boolean;
  setupChoice: 'simple' | 'recommended';
}

export interface NewShopInput {
  name: string;
  location: string;
}

export interface HelperInput {
  name: string;
  email: string;
  phone?: string;
  permissions: {
    sellProducts: boolean;
    receivePayments: boolean;
    manageStock: boolean;
  };
}
