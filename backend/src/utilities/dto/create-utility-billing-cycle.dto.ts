export class CreateUtilityBillingCycleDto {
  propertyId?: string;
  unitId?: string;
  periodStart?: string;
  periodEnd?: string;
  previousReading?: number;
  currentReading?: number;
  electricityRate?: number;
  waterRate?: number;
  additionalFees?: number;
}
