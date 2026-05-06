import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../config/supabase/supabase.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpsertPropertyDto } from './dto/upsert-property.dto';
import {
  OccupancyStatus,
  PropertyType,
  RentalUnit,
  StatusTag,
  UnitSize,
} from './interfaces/property.interface';

const PROPERTY_TYPES = new Set<PropertyType>(['Dorm', 'Condo', 'Apartment', 'Airbnb', 'House']);
const STATUS_TAGS = new Set<StatusTag>(['Pre-selling', 'RFO', 'Under Construction']);
const UNIT_SIZES = new Set<UnitSize>(['Small', 'Medium', 'Big']);
const OCCUPANCY_STATUSES = new Set<OccupancyStatus>(['Occupied', 'Vacant', 'Maintenance']);

@Injectable()
export class PropertiesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async list(userId: string, jwt: string) {
    const db = this.supabaseService.createUserClient(jwt);
    const { data: propertyRows, error } = await db
      .from('rental_properties')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    const propertyIds = (propertyRows ?? []).map((row) => row.id);
    const unitsByPropertyId = await this.getUnitsByPropertyId(db, userId, propertyIds);
    const properties = await Promise.all(
      (propertyRows ?? []).map((row) =>
        this.mapDbRowToProperty(db, row, unitsByPropertyId.get(row.id) ?? []),
      ),
    );

    return { properties };
  }

  async create(userId: string, jwt: string, body: UpsertPropertyDto) {
    const db = this.supabaseService.createUserClient(jwt);
    const propertyPayload = this.sanitizePropertyPayload(body);
    if (!propertyPayload.name || !propertyPayload.address) {
      throw new BadRequestException('Property name and address are required.');
    }

    const { data, error } = await db
      .from('rental_properties')
      .insert({ ...propertyPayload, user_id: userId })
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    return { property: await this.mapDbRowToProperty(db, data, []) };
  }

  async update(userId: string, jwt: string, id: string, body: UpsertPropertyDto) {
    const db = this.supabaseService.createUserClient(jwt);
    const { data: existing, error: existingError } = await db
      .from('rental_properties')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingError) throw new BadRequestException(existingError.message);
    if (!existing) throw new NotFoundException('Property not found.');

    const propertyPayload = this.sanitizePropertyPayload(body);
    if (!propertyPayload.name || !propertyPayload.address) {
      throw new BadRequestException('Property name and address are required.');
    }

    const { data, error } = await db
      .from('rental_properties')
      .update(propertyPayload)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    const unitsByPropertyId = await this.getUnitsByPropertyId(db, userId, [id]);
    return {
      property: await this.mapDbRowToProperty(db, data, unitsByPropertyId.get(id) ?? []),
    };
  }

  async createUnit(userId: string, jwt: string, propertyId: string, body: CreateUnitDto) {
    const db = this.supabaseService.createUserClient(jwt);
    const { data: property, error: propertyError } = await db
      .from('rental_properties')
      .select('id')
      .eq('id', propertyId)
      .eq('user_id', userId)
      .maybeSingle();

    if (propertyError) throw new BadRequestException(propertyError.message);
    if (!property) throw new NotFoundException('Property not found.');

    const unit = this.sanitizeUnit(body);
    if (!unit.label || unit.monthlyRent <= 0) {
      throw new BadRequestException('Unit label and monthly rent are required.');
    }

    const { data, error } = await db
      .from('rental_property_units')
      .insert({
        property_id: propertyId,
        user_id: userId,
        unit_number: unit.label,
        monthly_rent: unit.monthlyRent,
        occupancy_status: unit.status,
        unit_data: {
          id: unit.id,
          label: unit.label,
          occupantsCount: unit.occupantsCount,
          size: unit.size,
          monthlyRent: unit.monthlyRent,
          status: unit.status,
        },
      })
      .select('*')
      .maybeSingle();

    if (error) throw new BadRequestException(error.message);
    const row = await this.requirePropertyRow(db, userId, propertyId);
    const unitsByPropertyId = await this.getUnitsByPropertyId(db, userId, [propertyId]);
    return {
      property: await this.mapDbRowToProperty(db, row, unitsByPropertyId.get(propertyId) ?? []),
    };
  }

  async updateUnit(userId: string, jwt: string, propertyId: string, unitId: string, body: CreateUnitDto) {
    const db = this.supabaseService.createUserClient(jwt);
    const { data: property, error: propertyError } = await db
      .from('rental_properties')
      .select('id')
      .eq('id', propertyId)
      .eq('user_id', userId)
      .maybeSingle();

    if (propertyError) throw new BadRequestException(propertyError.message);
    if (!property) throw new NotFoundException('Property not found.');

    const { data: existingUnitRows, error: existingUnitError } = await db
      .from('rental_property_units')
      .select('*')
      .eq('id', unitId)
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .limit(1);
    if (existingUnitError) throw new BadRequestException(existingUnitError.message);
    const existingUnit = existingUnitRows?.[0];
    if (!existingUnit) throw new NotFoundException('Unit not found.');

    const previousData =
      existingUnit.unit_data && typeof existingUnit.unit_data === 'object'
        ? (existingUnit.unit_data as Partial<RentalUnit>)
        : {};
    const mergedUnit = this.sanitizeUnit({
      ...previousData,
      id: unitId,
      ...body,
    });
    if (!mergedUnit.label || mergedUnit.monthlyRent <= 0) {
      throw new BadRequestException('Unit label and monthly rent are required.');
    }

    const { data, error } = await db
      .from('rental_property_units')
      .update({
        unit_number: mergedUnit.label,
        monthly_rent: mergedUnit.monthlyRent,
        occupancy_status: mergedUnit.status,
        unit_data: {
          id: mergedUnit.id,
          label: mergedUnit.label,
          occupantsCount: mergedUnit.occupantsCount,
          size: mergedUnit.size,
          monthlyRent: mergedUnit.monthlyRent,
          status: mergedUnit.status,
        },
      })
      .eq('id', unitId)
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();

    if (error) throw new BadRequestException(error.message);
    const row = await this.requirePropertyRow(db, userId, propertyId);
    const unitsByPropertyId = await this.getUnitsByPropertyId(db, userId, [propertyId]);
    return {
      property: await this.mapDbRowToProperty(db, row, unitsByPropertyId.get(propertyId) ?? []),
    };
  }

  async deleteUnit(userId: string, jwt: string, propertyId: string, unitId: string) {
    const db = this.supabaseService.createUserClient(jwt);
    const { data: property, error: propertyError } = await db
      .from('rental_properties')
      .select('id')
      .eq('id', propertyId)
      .eq('user_id', userId)
      .maybeSingle();

    if (propertyError) throw new BadRequestException(propertyError.message);
    if (!property) throw new NotFoundException('Property not found.');

    const { data, error } = await db
      .from('rental_property_units')
      .delete()
      .eq('id', unitId)
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();

    if (error) throw new BadRequestException(error.message);
    if (!data || data.length === 0) throw new NotFoundException('Unit not found.');
    const row = await this.requirePropertyRow(db, userId, propertyId);
    const unitsByPropertyId = await this.getUnitsByPropertyId(db, userId, [propertyId]);
    return {
      property: await this.mapDbRowToProperty(db, row, unitsByPropertyId.get(propertyId) ?? []),
    };
  }

  async remove(userId: string, jwt: string, propertyId: string) {
    const db = this.supabaseService.createUserClient(jwt);
    const { error } = await db
      .from('rental_properties')
      .delete()
      .eq('id', propertyId)
      .eq('user_id', userId);

    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }

  private sanitizeUnit(unit: CreateUnitDto = {}): RentalUnit {
    const safeSize = UNIT_SIZES.has(unit.size as UnitSize) ? (unit.size as UnitSize) : 'Small';
    const safeStatus = OCCUPANCY_STATUSES.has(unit.status as OccupancyStatus)
      ? (unit.status as OccupancyStatus)
      : 'Vacant';

    return {
      id: typeof unit.id === 'string' ? unit.id : `unit-${Date.now()}`,
      label: typeof unit.label === 'string' ? unit.label.trim() : '',
      occupantsCount: Number(unit.occupantsCount) > 0 ? Number(unit.occupantsCount) : 1,
      size: safeSize,
      monthlyRent: Number(unit.monthlyRent) > 0 ? Number(unit.monthlyRent) : 0,
      status: safeStatus,
    };
  }

  private sanitizePropertyPayload(payload: UpsertPropertyDto = {}) {
    const safeType = PROPERTY_TYPES.has(payload.type as PropertyType)
      ? (payload.type as PropertyType)
      : 'Apartment';
    const safeStatusTag = STATUS_TAGS.has(payload.statusTag as StatusTag)
      ? (payload.statusTag as StatusTag)
      : 'RFO';
    return {
      name: typeof payload.name === 'string' ? payload.name.trim() : '',
      type: safeType,
      address: typeof payload.address === 'string' ? payload.address.trim() : '',
      image_path: typeof payload.imagePath === 'string' ? payload.imagePath.trim() : '',
      status_tag: safeStatusTag,
      notes: typeof payload.notes === 'string' ? payload.notes.trim() : '',
    };
  }

  private async mapDbRowToProperty(
    db: ReturnType<SupabaseService['createUserClient']>,
    row: {
    id: string;
    name: string;
    type: string;
    address: string;
    image_path: string | null;
    status_tag: string;
    notes: string | null;
    },
    units: RentalUnit[],
  ) {
    const imagePath = row.image_path ?? '';
    const image = await this.resolvePropertyImageUrl(db, imagePath);
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      address: row.address,
      image,
      imagePath,
      statusTag: row.status_tag,
      notes: row.notes ?? '',
      units,
    };
  }

  private async resolvePropertyImageUrl(
    db: ReturnType<SupabaseService['createUserClient']>,
    imagePath: string,
  ) {
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&h=900&fit=crop';
    }

    const { data, error } = await db.storage.from('property-images').createSignedUrl(imagePath, 60 * 60);
    if (error || !data?.signedUrl) {
      return 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&h=900&fit=crop';
    }
    return data.signedUrl;
  }

  private async getUnitsByPropertyId(
    db: ReturnType<SupabaseService['createUserClient']>,
    userId: string,
    propertyIds: string[],
  ) {
    const map = new Map<string, RentalUnit[]>();
    if (propertyIds.length === 0) return map;

    const { data, error } = await db
      .from('rental_property_units')
      .select('*')
      .eq('user_id', userId)
      .in('property_id', propertyIds)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw new BadRequestException(error.message);

    for (const row of data ?? []) {
      const propertyId = row.property_id as string;
      const next = map.get(propertyId) ?? [];
      next.push(this.mapUnitRow(row));
      map.set(propertyId, next);
    }
    return map;
  }

  private mapUnitRow(row: any): RentalUnit {
    const raw = row?.unit_data && typeof row.unit_data === 'object' ? row.unit_data : {};
    const unit = this.sanitizeUnit({
      id: typeof row.id === 'string' ? row.id : undefined,
      label: typeof row.unit_number === 'string' ? row.unit_number : raw.label,
      monthlyRent:
        typeof row.monthly_rent === 'number' ? row.monthly_rent : Number(raw.monthlyRent ?? raw.rent ?? 0),
      status:
        typeof row.occupancy_status === 'string' ? row.occupancy_status : raw.status,
      occupantsCount: raw.occupantsCount,
      size: raw.size,
    });
    return { ...unit, id: typeof row.id === 'string' ? row.id : unit.id };
  }

  private async requirePropertyRow(
    db: ReturnType<SupabaseService['createUserClient']>,
    userId: string,
    propertyId: string,
  ) {
    const { data, error } = await db
      .from('rental_properties')
      .select('*')
      .eq('id', propertyId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Property not found.');
    return data;
  }
}
