import { UtilityBillingCycle } from "@/data/rental";

export const calculateUtilityCharge = (cycle: UtilityBillingCycle): number => {
  const usage = Math.max(0, cycle.currentReading - cycle.previousReading);
  return usage * cycle.electricityRate + cycle.waterRate + cycle.additionalFees;
};

export const getCurrentBillingPeriod = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const getCurrentPeriodRange = (): { periodStart: string; periodEnd: string } => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    periodStart: start.toISOString().slice(0, 10),
    periodEnd: end.toISOString().slice(0, 10),
  };
};

export const normalizeBillingPeriod = (billingPeriod: string): string => {
  const trimmed = billingPeriod.trim();
  const monthFormat = /^\d{4}-\d{2}$/;
  if (monthFormat.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed.toLowerCase();
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const formatBillingPeriodLabel = (billingPeriod: string): string => {
  const normalized = normalizeBillingPeriod(billingPeriod);
  if (!/^\d{4}-\d{2}$/.test(normalized)) return billingPeriod;
  const [year, month] = normalized.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
};

export const formatPeriodRangeLabel = (periodStart?: string, periodEnd?: string): string => {
  if (!periodStart || !periodEnd) return "N/A";
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${periodStart} to ${periodEnd}`;
  }
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
};

export const findCycleForUnitAndPeriod = (
  cycles: UtilityBillingCycle[],
  propertyId: string,
  unitLabel: string,
  billingPeriod: string,
  periodStart?: string,
  periodEnd?: string,
  unitId?: string,
): UtilityBillingCycle | undefined =>
  cycles.find((cycle) => {
    if (cycle.propertyId !== propertyId) return false;
    const unitMatches =
      unitId && cycle.unitId ? cycle.unitId === unitId : cycle.unitLabel === unitLabel;
    if (!unitMatches) return false;
    if (periodStart && periodEnd && cycle.periodStart && cycle.periodEnd) {
      return cycle.periodStart === periodStart && cycle.periodEnd === periodEnd;
    }
    return normalizeBillingPeriod(cycle.billingPeriod) === normalizeBillingPeriod(billingPeriod);
  });
