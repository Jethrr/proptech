import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../config/supabase/supabase.service';
import { CreateUtilityBillingCycleDto } from './dto/create-utility-billing-cycle.dto';
import { UtilityBillingCycleRecord } from './interfaces/utility-billing-cycle.interface';

type UserClient = ReturnType<SupabaseService['createUserClient']>;

@Injectable()
export class UtilitiesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async list(userId: string, jwt: string) {
    const db = this.supabaseService.createUserClient(jwt);
    const { data: rows, error } = await db
      .from('rental_utility_billing_cycles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);

    const unitIds = [...new Set((rows ?? []).map((r) => r.unit_id as string))];
    const unitLabels = await this.getUnitLabelsById(db, userId, unitIds);

    return {
      cycles: (rows ?? []).map((r) => this.mapRowToCycle(r, unitLabels.get(r.unit_id as string) ?? '')),
    };
  }

  async create(userId: string, jwt: string, body: CreateUtilityBillingCycleDto) {
    const db = this.supabaseService.createUserClient(jwt);
    const payload = this.sanitizeCreate(body);
    await this.assertUnitOnProperty(db, userId, payload.propertyId, payload.unitId);

    const billingPeriod = `${payload.periodStart} to ${payload.periodEnd}`;
    const insertRow = {
      user_id: userId,
      property_id: payload.propertyId,
      unit_id: payload.unitId,
      billing_period: billingPeriod,
      period_start: payload.periodStart,
      period_end: payload.periodEnd,
      previous_reading: payload.previousReading,
      current_reading: payload.currentReading,
      electricity_rate: payload.electricityRate,
      water_rate: payload.waterRate,
      additional_fees: payload.additionalFees,
    };

    const { data, error } = await db
      .from('rental_utility_billing_cycles')
      .insert(insertRow)
      .select('*')
      .single();

    if (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new BadRequestException(
          'A utility billing cycle already exists for this unit and billing period.',
        );
      }
      throw new BadRequestException(error.message);
    }

    const unitLabel = await this.getSingleUnitLabel(db, userId, payload.unitId);
    return { cycle: this.mapRowToCycle(data, unitLabel) };
  }

  private sanitizeCreate(body: CreateUtilityBillingCycleDto) {
    const propertyId = typeof body.propertyId === 'string' ? body.propertyId.trim() : '';
    const unitId = typeof body.unitId === 'string' ? body.unitId.trim() : '';
    const periodStart = typeof body.periodStart === 'string' ? body.periodStart.trim() : '';
    const periodEnd = typeof body.periodEnd === 'string' ? body.periodEnd.trim() : '';
    const previousReading = Number(body.previousReading);
    const currentReading = Number(body.currentReading);
    const electricityRate = Number(body.electricityRate);
    const waterRate = body.waterRate === undefined || body.waterRate === null ? 0 : Number(body.waterRate);
    const additionalFees =
      body.additionalFees === undefined || body.additionalFees === null ? 0 : Number(body.additionalFees);

    if (!propertyId || !unitId || !periodStart || !periodEnd) {
      throw new BadRequestException('Property, unit, and billing period dates are required.');
    }
    if (periodEnd < periodStart) {
      throw new BadRequestException('Period end must be on or after period start.');
    }
    if (!Number.isFinite(previousReading) || previousReading < 0) {
      throw new BadRequestException('Previous reading must be a non-negative number.');
    }
    if (!Number.isFinite(currentReading) || currentReading < 0) {
      throw new BadRequestException('Current reading must be a non-negative number.');
    }
    if (!Number.isFinite(electricityRate) || electricityRate < 0) {
      throw new BadRequestException('Electricity rate must be a non-negative number.');
    }
    if (!Number.isFinite(waterRate) || waterRate < 0) {
      throw new BadRequestException('Water amount must be a non-negative number.');
    }
    if (!Number.isFinite(additionalFees) || additionalFees < 0) {
      throw new BadRequestException('Additional fees must be a non-negative number.');
    }

    return {
      propertyId,
      unitId,
      periodStart,
      periodEnd,
      previousReading,
      currentReading,
      electricityRate,
      waterRate,
      additionalFees,
    };
  }

  private mapRowToCycle(row: Record<string, unknown>, unitLabel: string): UtilityBillingCycleRecord {
    return {
      id: row.id as string,
      propertyId: row.property_id as string,
      unitId: row.unit_id as string,
      unitLabel,
      billingPeriod: (row.billing_period as string) ?? '',
      periodStart: String(row.period_start).slice(0, 10),
      periodEnd: String(row.period_end).slice(0, 10),
      previousReading: Number(row.previous_reading),
      currentReading: Number(row.current_reading),
      electricityRate: Number(row.electricity_rate),
      waterRate: Number(row.water_rate),
      additionalFees: Number(row.additional_fees),
      createdAt: String(row.created_at).slice(0, 10),
    };
  }

  private async getUnitLabelsById(db: UserClient, userId: string, unitIds: string[]) {
    const map = new Map<string, string>();
    if (unitIds.length === 0) return map;

    const { data, error } = await db
      .from('rental_property_units')
      .select('id, unit_number')
      .eq('user_id', userId)
      .in('id', unitIds);

    if (error) throw new BadRequestException(error.message);
    for (const row of data ?? []) {
      map.set(row.id as string, (row.unit_number as string) ?? '');
    }
    return map;
  }

  private async getSingleUnitLabel(db: UserClient, userId: string, unitId: string) {
    const { data, error } = await db
      .from('rental_property_units')
      .select('unit_number')
      .eq('id', unitId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new BadRequestException(error.message);
    return (data?.unit_number as string) ?? '';
  }

  private async assertUnitOnProperty(db: UserClient, userId: string, propertyId: string, unitId: string) {
    const { data: rows, error } = await db
      .from('rental_property_units')
      .select('id, property_id')
      .eq('id', unitId)
      .eq('user_id', userId)
      .limit(1);

    if (error) throw new BadRequestException(error.message);
    const row = rows?.[0];
    if (!row) throw new NotFoundException('Unit not found.');
    if ((row.property_id as string) !== propertyId) {
      throw new BadRequestException('Unit does not belong to the selected property.');
    }
  }
}
