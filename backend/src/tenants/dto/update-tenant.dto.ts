import { PaymentStatus } from '../interfaces/tenant.interface';

export class UpdateTenantDto {
  fullName?: string;
  email?: string;
  phone?: string;
  leaseStart?: string;
  leaseEnd?: string;
  dueDate?: number;
  paymentStatus?: PaymentStatus;
  contractFileName?: string;
}
