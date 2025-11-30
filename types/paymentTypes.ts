export type PaymentType = {
  id: string;
  name: string;
  description?: string;
  amount: number;
  amountType: 'FIXED' | 'PARTIAL_ALLOWED' | 'FLEXIBLE';
  isActive: boolean;
  allowPartialPayment: boolean;
  minimumAmount?: number;
  dueDay?: number;
  isRecurring: boolean;
  cooperativeId: string;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type PaymentTypesResponse = {
  data: PaymentType[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type PaymentTypeFilters = {
  page?: number;
  limit?: number;
  search?: string;
  includeInactive?: boolean;
};

export type CreatePaymentTypeBody = {
  name: string;
  description?: string;
  amount: number;
  amountType: 'FIXED' | 'PARTIAL_ALLOWED' | 'FLEXIBLE';
  allowPartialPayment?: boolean;
  minimumAmount?: number;
  dueDay?: number;
  isRecurring?: boolean;
  isActive?: boolean;
  settings?: Record<string, unknown>;
};