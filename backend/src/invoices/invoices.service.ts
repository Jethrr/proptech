import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../config/supabase/supabase.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceRecord, InvoiceStatus } from './interfaces/invoice.interface';

const INVOICE_STATUSES = new Set<InvoiceStatus>(['Draft', 'Sent', 'Paid']);

@Injectable()
export class InvoicesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async list(userId: string, jwt: string) {
    const db = this.supabaseService.createUserClient(jwt);
    const { data, error } = await db
      .from('rental_invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return { invoices: (data ?? []).map((r) => this.mapRow(r)) };
  }

  async create(userId: string, jwt: string, body: CreateInvoiceDto) {
    const db = this.supabaseService.createUserClient(jwt);
    const payload = this.sanitize(body);

    const { data, error } = await db
      .from('rental_invoices')
      .insert({
        user_id: userId,
        tenant_id: payload.tenantId,
        property_id: payload.propertyId,
        billing_period: payload.billingPeriod,
        period_start: payload.periodStart ?? null,
        period_end: payload.periodEnd ?? null,
        base_rent: payload.baseRent,
        utilities_total: payload.utilitiesTotal,
        amount: payload.amount,
        due_date: payload.dueDate,
        status: payload.status,
        line_items: payload.lineItems ?? null,
        notes: payload.notes ?? null,
      })
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    return { invoice: this.mapRow(data) };
  }

  async update(userId: string, jwt: string, invoiceId: string, body: UpdateInvoiceDto) {
    const db = this.supabaseService.createUserClient(jwt);
    const { data: existing, error: fetchErr } = await db
      .from('rental_invoices')
      .select('id')
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr) throw new BadRequestException(fetchErr.message);
    if (!existing) throw new NotFoundException('Invoice not found.');

    const patch: Record<string, unknown> = {};
    if (body.status !== undefined) {
      if (!INVOICE_STATUSES.has(body.status as InvoiceStatus)) {
        throw new BadRequestException('Invalid invoice status.');
      }
      patch.status = body.status;
    }
    if (body.dueDate !== undefined) patch.due_date = body.dueDate;
    if (body.notes !== undefined) patch.notes = body.notes;

    if (Object.keys(patch).length === 0) {
      const { data } = await db.from('rental_invoices').select('*').eq('id', invoiceId).single();
      return { invoice: this.mapRow(data) };
    }

    const { data, error } = await db
      .from('rental_invoices')
      .update(patch)
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    return { invoice: this.mapRow(data) };
  }

  async remove(userId: string, jwt: string, invoiceId: string) {
    const db = this.supabaseService.createUserClient(jwt);
    const { data: existing, error: fetchErr } = await db
      .from('rental_invoices')
      .select('id')
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr) throw new BadRequestException(fetchErr.message);
    if (!existing) throw new NotFoundException('Invoice not found.');

    const { error } = await db
      .from('rental_invoices')
      .delete()
      .eq('id', invoiceId)
      .eq('user_id', userId);

    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }

  private sanitize(body: CreateInvoiceDto) {
    const tenantId = typeof body.tenantId === 'string' ? body.tenantId.trim() : '';
    const propertyId = typeof body.propertyId === 'string' ? body.propertyId.trim() : '';
    const billingPeriod = typeof body.billingPeriod === 'string' ? body.billingPeriod.trim() : '';
    const dueDate = typeof body.dueDate === 'string' ? body.dueDate.trim() : '';
    const amount = Number(body.amount);

    if (!tenantId || !propertyId || !billingPeriod || !dueDate) {
      throw new BadRequestException('tenantId, propertyId, billingPeriod, and dueDate are required.');
    }
    if (isNaN(amount) || amount < 0) {
      throw new BadRequestException('amount must be a non-negative number.');
    }

    const status = INVOICE_STATUSES.has(body.status as InvoiceStatus)
      ? (body.status as InvoiceStatus)
      : 'Draft';

    return {
      tenantId,
      propertyId,
      billingPeriod,
      periodStart: typeof body.periodStart === 'string' ? body.periodStart.trim() : undefined,
      periodEnd: typeof body.periodEnd === 'string' ? body.periodEnd.trim() : undefined,
      baseRent: Number(body.baseRent ?? 0),
      utilitiesTotal: Number(body.utilitiesTotal ?? 0),
      amount,
      dueDate,
      status,
      lineItems: body.lineItems ?? null,
      notes: typeof body.notes === 'string' ? body.notes.trim() : undefined,
    };
  }

  private mapRow(row: Record<string, unknown>): InvoiceRecord {
    return {
      id: row.id as string,
      tenantId: row.tenant_id as string,
      propertyId: row.property_id as string,
      billingPeriod: row.billing_period as string,
      periodStart: row.period_start ? String(row.period_start).slice(0, 10) : undefined,
      periodEnd: row.period_end ? String(row.period_end).slice(0, 10) : undefined,
      baseRent: Number(row.base_rent ?? 0),
      utilitiesTotal: Number(row.utilities_total ?? 0),
      amount: Number(row.amount),
      dueDate: String(row.due_date).slice(0, 10),
      status: row.status as InvoiceStatus,
      lineItems: row.line_items ?? undefined,
      notes: row.notes ? (row.notes as string) : undefined,
      createdAt: String(row.created_at).slice(0, 10),
    };
  }
}
