export class CreateInvoiceDto {
  tenantId: string;
  propertyId: string;
  billingPeriod: string;
  periodStart?: string;
  periodEnd?: string;
  baseRent?: number;
  utilitiesTotal?: number;
  amount: number;
  dueDate: string;
  status?: string;
  lineItems?: unknown;
  notes?: string;
}
