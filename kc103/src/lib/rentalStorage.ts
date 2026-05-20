import {
  Invoice,
  Reminder,
  RentalProperty,
  Tenant,
  mockInvoices,
  mockReminders,
  mockRentalProperties,
  mockTenants,
} from "@/data/rental";

const KEYS = {
  properties: "rental_properties",
  tenants: "rental_tenants",
  reminders: "rental_reminders",
  invoices: "rental_invoices",
};

const STORAGE_PREFIX = "kc103:rental";

const scopedKey = (key: string, ownerId?: string | null): string =>
  ownerId
    ? `${STORAGE_PREFIX}:${ownerId}:${key}`
    : `${STORAGE_PREFIX}:shared:${key}`;

function loadFromStorage<T>(
  key: string,
  fallback: T[],
  ownerId?: string | null,
): T[] {
  try {
    const raw = localStorage.getItem(scopedKey(key, ownerId));
    if (!raw) return fallback;
    return JSON.parse(raw) as T[];
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(
  key: string,
  data: T[],
  ownerId?: string | null,
): void {
  localStorage.setItem(scopedKey(key, ownerId), JSON.stringify(data));
}

export const loadRentalProperties = (
  ownerId?: string | null,
): RentalProperty[] =>
  loadFromStorage(
    KEYS.properties,
    ownerId ? [] : mockRentalProperties,
    ownerId,
  );
export const saveRentalProperties = (
  data: RentalProperty[],
  ownerId?: string | null,
): void => saveToStorage(KEYS.properties, data, ownerId);

export const loadTenants = (ownerId?: string | null): Tenant[] =>
  loadFromStorage(KEYS.tenants, ownerId ? [] : mockTenants, ownerId);
export const saveTenants = (data: Tenant[], ownerId?: string | null): void =>
  saveToStorage(KEYS.tenants, data, ownerId);

export const loadReminders = (ownerId?: string | null): Reminder[] =>
  loadFromStorage(KEYS.reminders, ownerId ? [] : mockReminders, ownerId);
export const saveReminders = (
  data: Reminder[],
  ownerId?: string | null,
): void => saveToStorage(KEYS.reminders, data, ownerId);

export const loadInvoices = (ownerId?: string | null): Invoice[] =>
  loadFromStorage(KEYS.invoices, ownerId ? [] : mockInvoices, ownerId);
export const saveInvoices = (data: Invoice[], ownerId?: string | null): void =>
  saveToStorage(KEYS.invoices, data, ownerId);
