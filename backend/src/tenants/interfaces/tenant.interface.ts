export type PaymentStatus = 'Paid' | 'Due Soon' | 'Overdue';

export interface TenantRecord {
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
