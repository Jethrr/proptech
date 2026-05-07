export interface UtilityBillingCycleRecord {
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
