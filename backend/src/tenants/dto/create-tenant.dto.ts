import { PaymentStatus } from '../interfaces/tenant.interface';

export class CreateTenantDto {
  fullName?: string;
  email?: string;
  phone?: string;
  propertyId?: string;
  unitId?: string;
  leaseStart?: string;
  leaseEnd?: string;
  dueDate?: number;
  paymentStatus?: PaymentStatus;
  contractFileName?: string;
}
