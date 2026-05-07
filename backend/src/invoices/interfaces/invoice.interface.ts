export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid';

export interface InvoiceRecord {
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
