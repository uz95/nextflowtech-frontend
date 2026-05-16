export type BusinessStatus = 'Active' | 'Suspended';
export type AdminSubscriptionStatus = 'Active' | 'Expired' | 'Trial' | 'Suspended';
export type AdminPlanCode = 'FREE' | 'PRO';

export interface SuperAdminDashboard {
  totalBusinesses: number;
  activeBusinesses: number;
  suspendedBusinesses: number;
  expiredSubscriptions: number;
  trialAccounts: number;
}

export interface AdminBusinessSubscription {
  planName: string;
  planCode: AdminPlanCode | string;
  price: number;
  startDate: string;
  endDate?: string | null;
  status: AdminSubscriptionStatus;
}

export interface AdminBusiness {
  businessId: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  phone?: string | null;
  status: BusinessStatus;
  createdAt: string;
  subscription?: AdminBusinessSubscription | null;
}

export interface UpsertAdminBusinessRequest {
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  phone?: string | null;
  status: BusinessStatus;
  planCode: AdminPlanCode;
}

export interface UpdateBusinessSubscriptionRequest {
  planName: string;
  price: number;
  startDate: string;
  endDate?: string | null;
  status: AdminSubscriptionStatus;
}
