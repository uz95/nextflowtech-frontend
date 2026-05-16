import { QueryParams } from './api.models';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category?: string | null;
  description?: string | null;
  quantityOnHand: number;
  reorderLevel: number;
  unitCost: number;
  unitPrice: number;
  isActive: boolean;
  isLowStock: boolean;
  createdAt: string;
}

export interface UpsertInventoryItemRequest {
  name: string;
  sku: string;
  category?: string | null;
  description?: string | null;
  quantityOnHand: number;
  reorderLevel: number;
  unitCost: number;
  unitPrice: number;
  isActive: boolean;
}

export interface AdjustInventoryRequest {
  quantityChange: number;
}

export interface InventoryQueryParams extends QueryParams {
  category?: string;
  isActive?: boolean;
  lowStockOnly?: boolean;
}
