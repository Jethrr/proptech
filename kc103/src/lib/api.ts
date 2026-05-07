import { supabase } from "@/lib/supabase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

const getAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const token = await getAccessToken();
  const headers = new Headers(options.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      (payload as { error?: string }).error ?? "API request failed.",
      response.status,
    );
  }

  return payload as T;
};

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

export type PropertyType = "Dorm" | "Condo" | "Apartment" | "Airbnb" | "House";
export type OccupancyStatus = "Occupied" | "Vacant" | "Maintenance";
export type UnitSize = "Small" | "Medium" | "Big";

export interface RentalUnitDto {
  id: string;
  label: string;
  occupantsCount: number;
  size: UnitSize;
  monthlyRent: number;
  status: OccupancyStatus;
}

export interface RentalPropertyDto {
  id: string;
  name: string;
  type: PropertyType;
  address: string;
  image: string;
  imagePath: string;
  statusTag: "Pre-selling" | "RFO" | "Under Construction";
  units: RentalUnitDto[];
  notes?: string;
}

export interface UpsertPropertyInput {
  name: string;
  type: PropertyType;
  address: string;
  imagePath: string;
  statusTag: "Pre-selling" | "RFO" | "Under Construction";
  notes?: string;
}

export interface CreateUnitInput {
  label: string;
  occupantsCount: number;
  size: UnitSize;
  monthlyRent: number;
  status: OccupancyStatus;
}

export type PaymentStatus = "Paid" | "Due Soon" | "Overdue";

export interface TenantDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  propertyId: string;
  unitId: string;
  unitLabel: string;
  leaseStart: string;
  leaseEnd: string;
  dueDate: number;
  paymentStatus: PaymentStatus;
  contractFileName: string;
}

export interface CreateTenantInput {
  fullName: string;
  email: string;
  phone: string;
  propertyId: string;
  unitId: string;
  leaseStart: string;
  leaseEnd: string;
  dueDate: number;
  paymentStatus?: PaymentStatus;
  contractFileName?: string;
}

export interface UpdateTenantInput {
  fullName?: string;
  email?: string;
  phone?: string;
  leaseStart?: string;
  leaseEnd?: string;
  dueDate?: number;
  paymentStatus?: PaymentStatus;
  contractFileName?: string;
}

export interface UtilityBillingCycleDto {
  id: string;
  propertyId: string;
  unitId: string;
  unitLabel: string;
  billingPeriod: string;
  periodStart: string;
  periodEnd: string;
  previousReading: number;
  currentReading: number;
  electricityRate: number;
  waterRate: number;
  additionalFees: number;
  createdAt: string;
}

export interface CreateUtilityBillingCycleInput {
  propertyId: string;
  unitId: string;
  periodStart: string;
  periodEnd: string;
  previousReading: number;
  currentReading: number;
  electricityRate: number;
  waterRate: number;
  additionalFees: number;
}

export type InvoiceStatus = "Draft" | "Sent" | "Paid";

export interface InvoiceDto {
  id: string;
  tenantId: string;
  propertyId: string;
  billingPeriod: string;
  periodStart?: string;
  periodEnd?: string;
  baseRent: number;
  utilitiesTotal: number;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  lineItems?: unknown;
  notes?: string;
  createdAt: string;
}

export interface CreateInvoiceInput {
  tenantId: string;
  propertyId: string;
  billingPeriod: string;
  periodStart?: string;
  periodEnd?: string;
  baseRent?: number;
  utilitiesTotal?: number;
  amount: number;
  dueDate: string;
  status?: InvoiceStatus;
  notes?: string;
}

export interface UpdateInvoiceInput {
  status?: InvoiceStatus;
  dueDate?: string;
  notes?: string;
}

export const api = {
  me: () => request<{ user: { id: string; email?: string } }>("/api/auth/me", { method: "GET" }),
  protected: () =>
    request<{ message: string; userId: string }>("/api/protected", { method: "GET" }),
  getProfile: () => request<{ profile: Profile | null }>("/api/profile", { method: "GET" }),
  updateProfile: (first_name: string, last_name: string) =>
    request<{ profile: Profile }>("/api/profile", {
      method: "PUT",
      body: JSON.stringify({ first_name, last_name }),
    }),
  getProperties: () => request<{ properties: RentalPropertyDto[] }>("/api/properties", { method: "GET" }),
  createProperty: (payload: UpsertPropertyInput) =>
    request<{ property: RentalPropertyDto }>("/api/properties", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateProperty: (id: string, payload: UpsertPropertyInput) =>
    request<{ property: RentalPropertyDto }>(`/api/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteProperty: (id: string) =>
    request<void>(`/api/properties/${id}`, {
      method: "DELETE",
    }),
  createUnit: (propertyId: string, payload: CreateUnitInput) =>
    request<{ property: RentalPropertyDto }>(`/api/properties/${propertyId}/units`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateUnit: (propertyId: string, unitId: string, payload: CreateUnitInput) =>
    request<{ property: RentalPropertyDto }>(`/api/properties/${propertyId}/units/${unitId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteUnit: (propertyId: string, unitId: string) =>
    request<{ property: RentalPropertyDto }>(`/api/properties/${propertyId}/units/${unitId}`, {
      method: "DELETE",
    }),
  getTenants: () => request<{ tenants: TenantDto[] }>("/api/tenants", { method: "GET" }),
  createTenant: (payload: CreateTenantInput) =>
    request<{ tenant: TenantDto }>("/api/tenants", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateTenant: (id: string, payload: UpdateTenantInput) =>
    request<{ tenant: TenantDto }>(`/api/tenants/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteTenant: (id: string) =>
    request<{ success: boolean }>(`/api/tenants/${id}`, {
      method: "DELETE",
    }),
  getUtilityBillingCycles: () =>
    request<{ cycles: UtilityBillingCycleDto[] }>("/api/utilities/billing-cycles", { method: "GET" }),
  createUtilityBillingCycle: (payload: CreateUtilityBillingCycleInput) =>
    request<{ cycle: UtilityBillingCycleDto }>("/api/utilities/billing-cycles", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getInvoices: () =>
    request<{ invoices: InvoiceDto[] }>("/api/invoices", { method: "GET" }),
  createInvoice: (payload: CreateInvoiceInput) =>
    request<{ invoice: InvoiceDto }>("/api/invoices", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateInvoice: (id: string, payload: UpdateInvoiceInput) =>
    request<{ invoice: InvoiceDto }>(`/api/invoices/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteInvoice: (id: string) =>
    request<{ success: boolean }>(`/api/invoices/${id}`, { method: "DELETE" }),
};
