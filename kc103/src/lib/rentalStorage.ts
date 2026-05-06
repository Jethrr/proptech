import {
  Invoice,
  Reminder,
  RentalProperty,
  Tenant,
  UtilityBillingCycle,
  mockInvoices,
  mockReminders,
  mockRentalProperties,
  mockTenants,
  mockUtilityBillingCycles,
} from "@/data/rental";

const KEYS = {
  properties: "rental_properties",
  tenants: "rental_tenants",
  reminders: "rental_reminders",
  invoices: "rental_invoices",
  utilityCycles: "rental_utility_cycles",
};

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T[];
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const loadRentalProperties = (): RentalProperty[] =>
  loadFromStorage(KEYS.properties, mockRentalProperties);
export const saveRentalProperties = (data: RentalProperty[]): void =>
  saveToStorage(KEYS.properties, data);

export const loadTenants = (): Tenant[] => loadFromStorage(KEYS.tenants, mockTenants);
export const saveTenants = (data: Tenant[]): void => saveToStorage(KEYS.tenants, data);

export const loadReminders = (): Reminder[] =>
  loadFromStorage(KEYS.reminders, mockReminders);
export const saveReminders = (data: Reminder[]): void =>
  saveToStorage(KEYS.reminders, data);

export const loadInvoices = (): Invoice[] => loadFromStorage(KEYS.invoices, mockInvoices);
export const saveInvoices = (data: Invoice[]): void => saveToStorage(KEYS.invoices, data);

export const loadUtilityBillingCycles = (): UtilityBillingCycle[] =>
  loadFromStorage(KEYS.utilityCycles, mockUtilityBillingCycles);
export const saveUtilityBillingCycles = (data: UtilityBillingCycle[]): void =>
  saveToStorage(KEYS.utilityCycles, data);
