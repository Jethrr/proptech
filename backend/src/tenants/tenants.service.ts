import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../config/supabase/supabase.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PaymentStatus, TenantRecord } from './interfaces/tenant.interface';

const PAYMENT_STATUSES = new Set<PaymentStatus>(['Paid', 'Due Soon', 'Overdue']);

type UserClient = ReturnType<SupabaseService['createUserClient']>;

@Injectable()
export class TenantsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async list(userId: string, jwt: string) {
    const db = this.supabaseService.createUserClient(jwt);
    const { data: rows, error } = await db
      .from('rental_tenants')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    const unitIds = [...new Set((rows ?? []).map((r) => r.unit_id as string))];
    const unitLabels = await this.getUnitLabelsById(db, userId, unitIds);

    return {
      tenants: (rows ?? []).map((r) => this.mapRowToTenant(r, unitLabels.get(r.unit_id as string) ?? '')),
    };
  }

  async create(userId: string, jwt: string, body: CreateTenantDto) {
    const db = this.supabaseService.createUserClient(jwt);
    const payload = this.sanitizeCreate(body);
    await this.assertUnitHasCapacity(db, userId, payload.propertyId, payload.unitId);

    const insertRow = {
      user_id: userId,
      property_id: payload.propertyId,
      unit_id: payload.unitId,
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      lease_start: payload.leaseStart,
      lease_end: payload.leaseEnd,
      due_day: payload.dueDate,
      payment_status: payload.paymentStatus,
      contract_file_name: payload.contractFileName,
    };

    const { data, error } = await db.from('rental_tenants').insert(insertRow).select('*').single();
    if (error) throw new BadRequestException(error.message);

    await this.setUnitOccupancy(db, userId, payload.propertyId, payload.unitId, 'Occupied');
    const unitLabel = await this.getSingleUnitLabel(db, userId, payload.unitId);
    return { tenant: this.mapRowToTenant(data, unitLabel) };
  }

  async update(userId: string, jwt: string, tenantId: string, body: UpdateTenantDto) {
    const db = this.supabaseService.createUserClient(jwt);
    const { data: existingRows, error: existingErr } = await db
      .from('rental_tenants')
      .select('*')
      .eq('id', tenantId)
      .eq('user_id', userId)
      .limit(1);
    if (existingErr) throw new BadRequestException(existingErr.message);
    const existing = existingRows?.[0];
    if (!existing) throw new NotFoundException('Tenant not found.');

    const patch = this.sanitizeUpdate(body);
    const propertyId = existing.property_id as string;
    const unitId = existing.unit_id as string;

    const updateRow: Record<string, unknown> = {};
    if (patch.fullName !== undefined) updateRow.full_name = patch.fullName;
    if (patch.email !== undefined) updateRow.email = patch.email;
    if (patch.phone !== undefined) updateRow.phone = patch.phone;
    if (patch.leaseStart !== undefined) updateRow.lease_start = patch.leaseStart;
    if (patch.leaseEnd !== undefined) updateRow.lease_end = patch.leaseEnd;
    if (patch.dueDate !== undefined) updateRow.due_day = patch.dueDate;
    if (patch.paymentStatus !== undefined) updateRow.payment_status = patch.paymentStatus;
    if (patch.contractFileName !== undefined) updateRow.contract_file_name = patch.contractFileName;

    if (Object.keys(updateRow).length === 0) {
      const unitLabel = await this.getSingleUnitLabel(db, userId, unitId);
      return { tenant: this.mapRowToTenant(existing, unitLabel) };
    }

    const nextLeaseStart = (updateRow.lease_start as string | undefined) ?? (existing.lease_start as string);
    const nextLeaseEnd = (updateRow.lease_end as string | undefined) ?? (existing.lease_end as string);
    if (nextLeaseEnd < nextLeaseStart) {
      throw new BadRequestException('Lease end must be on or after lease start.');
    }

    const { data, error } = await db
      .from('rental_tenants')
      .update(updateRow)
      .eq('id', tenantId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    const unitLabel = await this.getSingleUnitLabel(db, userId, unitId);
    return { tenant: this.mapRowToTenant(data, unitLabel) };
  }

  async remove(userId: string, jwt: string, tenantId: string) {
    const db = this.supabaseService.createUserClient(jwt);
    const { data: existingRows, error: existingErr } = await db
      .from('rental_tenants')
      .select('*')
      .eq('id', tenantId)
      .eq('user_id', userId)
      .limit(1);
    if (existingErr) throw new BadRequestException(existingErr.message);
    const existing = existingRows?.[0];
    if (!existing) throw new NotFoundException('Tenant not found.');

    const propertyId = existing.property_id as string;
    const unitId = existing.unit_id as string;

    const { error } = await db.from('rental_tenants').delete().eq('id', tenantId).eq('user_id', userId);
    if (error) throw new BadRequestException(error.message);

    const remainingTenantCount = await this.countTenantsForUnit(db, userId, unitId);
    await this.setUnitOccupancy(
      db,
      userId,
      propertyId,
      unitId,
      remainingTenantCount > 0 ? 'Occupied' : 'Vacant',
    );
    return { success: true };
  }

  private sanitizeCreate(body: CreateTenantDto) {
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const propertyId = typeof body.propertyId === 'string' ? body.propertyId.trim() : '';
    const unitId = typeof body.unitId === 'string' ? body.unitId.trim() : '';
    const leaseStart = typeof body.leaseStart === 'string' ? body.leaseStart.trim() : '';
    const leaseEnd = typeof body.leaseEnd === 'string' ? body.leaseEnd.trim() : '';
    const dueDate = Number(body.dueDate);
    const paymentStatus = PAYMENT_STATUSES.has(body.paymentStatus as PaymentStatus)
      ? (body.paymentStatus as PaymentStatus)
      : 'Due Soon';
    let contractFileName =
      typeof body.contractFileName === 'string' ? body.contractFileName.trim() : '';
    if (!contractFileName && fullName) {
      contractFileName = `${fullName.toLowerCase().replace(/\s+/g, '-')}-contract.pdf`;
    }

    if (!fullName || !email || !propertyId || !unitId || !leaseStart || !leaseEnd) {
      throw new BadRequestException('Full name, email, property, unit, and lease dates are required.');
    }
    if (!Number.isInteger(dueDate) || dueDate < 1 || dueDate > 31) {
      throw new BadRequestException('Due day must be an integer from 1 to 31.');
    }
    if (leaseEnd < leaseStart) {
      throw new BadRequestException('Lease end must be on or after lease start.');
    }

    return {
      fullName,
      email,
      phone,
      propertyId,
      unitId,
      leaseStart,
      leaseEnd,
      dueDate,
      paymentStatus,
      contractFileName,
    };
  }

  private sanitizeUpdate(body: UpdateTenantDto) {
    const out: {
      fullName?: string;
      email?: string;
      phone?: string;
      leaseStart?: string;
      leaseEnd?: string;
      dueDate?: number;
      paymentStatus?: PaymentStatus;
      contractFileName?: string;
    } = {};

    if (body.fullName !== undefined) {
      const v = typeof body.fullName === 'string' ? body.fullName.trim() : '';
      if (!v) throw new BadRequestException('Full name cannot be empty.');
      out.fullName = v;
    }
    if (body.email !== undefined) {
      const v = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      if (!v) throw new BadRequestException('Email cannot be empty.');
      out.email = v;
    }
    if (body.phone !== undefined) {
      out.phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    }
    if (body.leaseStart !== undefined) {
      const v = typeof body.leaseStart === 'string' ? body.leaseStart.trim() : '';
      if (!v) throw new BadRequestException('Lease start cannot be empty.');
      out.leaseStart = v;
    }
    if (body.leaseEnd !== undefined) {
      const v = typeof body.leaseEnd === 'string' ? body.leaseEnd.trim() : '';
      if (!v) throw new BadRequestException('Lease end cannot be empty.');
      out.leaseEnd = v;
    }
    if (body.dueDate !== undefined) {
      const dueDate = Number(body.dueDate);
      if (!Number.isInteger(dueDate) || dueDate < 1 || dueDate > 31) {
        throw new BadRequestException('Due day must be an integer from 1 to 31.');
      }
      out.dueDate = dueDate;
    }
    if (body.paymentStatus !== undefined) {
      if (!PAYMENT_STATUSES.has(body.paymentStatus as PaymentStatus)) {
        throw new BadRequestException('Invalid payment status.');
      }
      out.paymentStatus = body.paymentStatus as PaymentStatus;
    }
    if (body.contractFileName !== undefined) {
      out.contractFileName =
        typeof body.contractFileName === 'string' ? body.contractFileName.trim() : '';
    }

    return out;
  }

  private mapRowToTenant(row: Record<string, unknown>, unitLabel: string): TenantRecord {
    return {
      id: row.id as string,
      fullName: row.full_name as string,
      email: row.email as string,
      phone: (row.phone as string) ?? '',
      propertyId: row.property_id as string,
      unitId: row.unit_id as string,
      unitLabel,
      leaseStart: String(row.lease_start).slice(0, 10),
      leaseEnd: String(row.lease_end).slice(0, 10),
      dueDate: Number(row.due_day),
      paymentStatus: row.payment_status as PaymentStatus,
      contractFileName: (row.contract_file_name as string) ?? '',
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

  private async assertUnitHasCapacity(db: UserClient, userId: string, propertyId: string, unitId: string) {
    const { data: rows, error } = await db
      .from('rental_property_units')
      .select('id, property_id, occupancy_status, unit_data')
      .eq('id', unitId)
      .eq('user_id', userId)
      .limit(1);

    if (error) throw new BadRequestException(error.message);
    const row = rows?.[0];
    if (!row) throw new NotFoundException('Unit not found.');
    if ((row.property_id as string) !== propertyId) {
      throw new BadRequestException('Unit does not belong to the selected property.');
    }
    if ((row.occupancy_status as string) === 'Maintenance') {
      throw new BadRequestException('Cannot assign a tenant to a unit in maintenance.');
    }

    const raw =
      row.unit_data && typeof row.unit_data === 'object' ? (row.unit_data as Record<string, unknown>) : {};
    const configuredCapacity =
      typeof raw.occupantsCount === 'number' && Number.isFinite(raw.occupantsCount)
        ? Math.floor(raw.occupantsCount)
        : 1;
    const unitCapacity = Math.max(1, configuredCapacity);
    const currentTenantCount = await this.countTenantsForUnit(db, userId, unitId);
    if (currentTenantCount >= unitCapacity) {
      throw new BadRequestException(
        `This unit is already full (${currentTenantCount}/${unitCapacity} tenants). Increase occupants count or choose another unit.`,
      );
    }
  }

  private async countTenantsForUnit(db: UserClient, userId: string, unitId: string): Promise<number> {
    const { count, error } = await db
      .from('rental_tenants')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', userId)
      .eq('unit_id', unitId);
    if (error) throw new BadRequestException(error.message);
    return count ?? 0;
  }

  private async setUnitOccupancy(
    db: UserClient,
    userId: string,
    propertyId: string,
    unitId: string,
    status: 'Occupied' | 'Vacant',
  ) {
    const { data: rows, error } = await db
      .from('rental_property_units')
      .select('*')
      .eq('id', unitId)
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .limit(1);

    if (error) throw new BadRequestException(error.message);
    const row = rows?.[0];
    if (!row) throw new NotFoundException('Unit not found.');

    const raw = row.unit_data && typeof row.unit_data === 'object' ? (row.unit_data as Record<string, unknown>) : {};
    const label =
      typeof row.unit_number === 'string' ? row.unit_number : (raw.label as string) ?? '';
    const monthlyRent =
      typeof row.monthly_rent === 'number' ? row.monthly_rent : Number(raw.monthlyRent ?? 0);
    const occupantsCount =
      typeof raw.occupantsCount === 'number' && raw.occupantsCount > 0 ? raw.occupantsCount : 1;
    const size = typeof raw.size === 'string' ? raw.size : 'Small';

    const { error: upErr } = await db
      .from('rental_property_units')
      .update({
        occupancy_status: status,
        unit_data: {
          id: unitId,
          label,
          occupantsCount,
          size,
          monthlyRent,
          status,
        },
      })
      .eq('id', unitId)
      .eq('property_id', propertyId)
      .eq('user_id', userId);

    if (upErr) throw new BadRequestException(upErr.message);
  }
}
