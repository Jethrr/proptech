import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FilePlus2,
  FileText,
  Loader2,
  WalletCards,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Invoice, RentalProperty, Tenant, UtilityBillingCycle, formatPhp } from "@/data/rental";
import { loadInvoices, saveInvoices } from "@/lib/rentalStorage";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  calculateUtilityCharge,
  findCycleForUnitAndPeriod,
  formatPeriodRangeLabel,
  getCurrentPeriodRange,
} from "@/lib/utilities";

const Invoices = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<RentalProperty[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [utilityCycles, setUtilityCycles] = useState<UtilityBillingCycle[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentRange = getCurrentPeriodRange();
  const [formData, setFormData] = useState({
    propertyId: "",
    unitId: "",
    periodStart: currentRange.periodStart,
    periodEnd: currentRange.periodEnd,
    amount: "",
    dueDate: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [propsRes, tenantsRes, cyclesRes, invoicesRes] = await Promise.all([
          api.getProperties(),
          api.getTenants(),
          api.getUtilityBillingCycles(),
          api.getInvoices(),
        ]);
        setProperties(propsRes.properties as RentalProperty[]);
        setTenants(tenantsRes.tenants as Tenant[]);
        setUtilityCycles(cyclesRes.cycles as UtilityBillingCycle[]);
        const apiInvoices = invoicesRes.invoices as Invoice[];
        setInvoices(apiInvoices);
        saveInvoices(apiInvoices);
      } catch {
        setProperties([]);
        setTenants([]);
        setUtilityCycles([]);
        setInvoices(loadInvoices());
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const selectedProperty = properties.find((property) => property.id === formData.propertyId);
  const selectedUnit = selectedProperty?.units.find((unit) => unit.id === formData.unitId);
  const matchedTenant =
    tenants.find(
      (tenant) => tenant.propertyId === formData.propertyId && tenant.unitId === formData.unitId,
    ) ?? null;
  const matchedUtilityCycle =
    selectedUnit && formData.propertyId
      ? findCycleForUnitAndPeriod(
          utilityCycles,
          formData.propertyId,
          selectedUnit.label,
          `${formData.periodStart} to ${formData.periodEnd}`,
          formData.periodStart,
          formData.periodEnd,
          selectedUnit.id,
        )
      : undefined;
  const computedBaseRent = selectedUnit?.monthlyRent ?? 0;
  const computedUtilities = matchedUtilityCycle ? calculateUtilityCharge(matchedUtilityCycle) : 0;
  const computedTotal = computedBaseRent + computedUtilities;
  const summary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paid = invoices.filter((inv) => inv.status === "Paid").length;
    const paidAmount = invoices.filter((inv) => inv.status === "Paid").reduce((sum, inv) => sum + inv.amount, 0);
    const draftCount = invoices.filter((inv) => inv.status === "Draft").length;
    const sentCount = invoices.filter((inv) => inv.status === "Sent").length;
    const unpaidCount = invoices.filter((inv) => inv.status !== "Paid").length;
    const unpaidAmount = invoices.filter((inv) => inv.status !== "Paid").reduce((sum, inv) => sum + inv.amount, 0);
    const overdueCount = invoices.filter((inv) => inv.status !== "Paid" && inv.dueDate < today).length;
    const overdueAmount = invoices
      .filter((inv) => inv.status !== "Paid" && inv.dueDate < today)
      .reduce((sum, inv) => sum + inv.amount, 0);

    return {
      totalInvoices,
      totalAmount,
      paid,
      paidAmount,
      draftCount,
      sentCount,
      unpaidCount,
      unpaidAmount,
      overdueCount,
      overdueAmount,
    };
  }, [invoices]);

  const getInvoiceStatusBadgeClass = (status: Invoice["status"]) => {
    if (status === "Paid") return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    if (status === "Sent") return "bg-blue-100 text-blue-800 border border-blue-200";
    return "bg-amber-100 text-amber-800 border border-amber-200";
  };

  const generateInvoice = async () => {
    if (!formData.propertyId || !formData.unitId || !matchedTenant || !selectedUnit) {
      toast({
        title: "Cannot generate invoice",
        description: "Please select a property and room that has an assigned tenant.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    const billingPeriod = `${formData.periodStart} to ${formData.periodEnd}`;
    try {
      const res = await api.createInvoice({
        tenantId: matchedTenant.id,
        propertyId: formData.propertyId,
        billingPeriod,
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd,
        baseRent: computedBaseRent,
        utilitiesTotal: computedUtilities,
        amount: computedTotal,
        dueDate: formData.dueDate,
        status: "Draft",
      });
      const next = res.invoice as Invoice;
      const updated = [next, ...invoices];
      setInvoices(updated);
      saveInvoices(updated);
    } catch {
      const next: Invoice = {
        id: `inv-${Date.now()}`,
        tenantId: matchedTenant.id,
        propertyId: formData.propertyId,
        billingPeriod,
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd,
        baseRent: computedBaseRent,
        utilitiesTotal: computedUtilities,
        amount: computedTotal,
        dueDate: formData.dueDate,
        status: "Draft",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      const updated = [next, ...invoices];
      setInvoices(updated);
      saveInvoices(updated);
    } finally {
      setIsGenerating(false);
    }

    setIsDialogOpen(false);
    toast({
      title: "Invoice generated",
      description: `Draft invoice created for ${matchedTenant.fullName} (${selectedProperty?.name ?? "Property"}) with utilities included.`,
    });
  };

  const viewInvoicePdf = (invoice: Invoice) => {
    const tenant = tenants.find((t) => t.id === invoice.tenantId);
    const property = properties.find((p) => p.id === invoice.propertyId);

    // Theme palette (matches index.css light mode)
    const C = {
      primary:   [18, 18, 18]   as [number,number,number], // hsl(0 0% 7%)
      accent:    [230, 168, 61] as [number,number,number], // hsl(38 77% 57%)
      secondary: [242, 238, 232] as [number,number,number], // hsl(36 27% 93%)
      border:    [230, 230, 230] as [number,number,number], // hsl(0 0% 90%)
      muted:     [107, 107, 107] as [number,number,number], // hsl(0 0% 42%)
      white:     [255, 255, 255] as [number,number,number],
      success:   [76, 175, 79]  as [number,number,number], // hsl(122 39% 49%)
    };

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = 210;
    const margin = 14;
    const contentW = pageW - margin * 2;

    const phpFmt = (n: number) =>
      `PHP ${new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;

    // ── Header band (primary near-black) ─────────────────────────
    doc.setFillColor(...C.primary);
    doc.rect(0, 0, pageW, 28, "F");

    // accent left stripe
    doc.setFillColor(...C.accent);
    doc.rect(0, 0, 4, 28, "F");

    // doc.setTextColor(...C.white);
    // doc.setFontSize(18);
    // doc.setFont("helvetica", "bold");
    // doc.text("KwenTech", margin + 2, 12);

    // doc.setFontSize(9);
    // doc.setFont("helvetica", "normal");
    // doc.setTextColor(...C.accent);
    // doc.text("Rental Management System", margin + 2, 19);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.white);
    doc.text("INVOICE", pageW - margin, 12, { align: "right" });

    const shortId = invoice.id.length > 20 ? invoice.id.slice(0, 8).toUpperCase() : invoice.id;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.accent);
    doc.text(`#${shortId}`, pageW - margin, 19, { align: "right" });

    // ── Status badge ──────────────────────────────────────────────
    let badgeBg: [number,number,number] = C.muted;
    let badgeFg: [number,number,number] = C.white;
    if (invoice.status === "Paid") { badgeBg = C.success; badgeFg = C.white; }
    if (invoice.status === "Sent") { badgeBg = C.accent;  badgeFg = C.primary; }
    doc.setFillColor(...badgeBg);
    doc.roundedRect(pageW - margin - 22, 31, 22, 8, 2, 2, "F");
    doc.setTextColor(...badgeFg);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.status.toUpperCase(), pageW - margin - 11, 36.5, { align: "center" });

    // ── Meta row ──────────────────────────────────────────────────
    doc.setTextColor(...C.muted);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("ISSUE DATE", margin, 37);
    doc.text("DUE DATE", margin + 50, 37);
    doc.setTextColor(...C.primary);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.createdAt, margin, 43);
    doc.text(invoice.dueDate, margin + 50, 43);

    // ── Divider ───────────────────────────────────────────────────
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.4);
    doc.line(margin, 48, pageW - margin, 48);

    // ── Bill To / Property ────────────────────────────────────────
    let y = 56;
    doc.setTextColor(...C.muted);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO", margin, y);
    doc.text("PROPERTY", margin + 90, y);

    y += 6;
    doc.setTextColor(...C.primary);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(tenant?.fullName ?? "Unknown Tenant", margin, y);
    doc.text(property?.name ?? "Unknown Property", margin + 90, y);

    y += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.muted);
    doc.text(tenant?.email ?? "N/A", margin, y);
    doc.text(`Unit: ${tenant?.unitLabel ?? "N/A"}`, margin + 90, y);

    y += 5;
    doc.text(tenant?.phone ?? "N/A", margin, y);
    doc.text(`Period: ${formatPeriodRangeLabel(invoice.periodStart, invoice.periodEnd)}`, margin + 90, y);

    // ── Divider ───────────────────────────────────────────────────
    y += 10;
    doc.setDrawColor(...C.border);
    doc.line(margin, y, pageW - margin, y);

    // ── Line items table header (secondary/beige bg) ──────────────
    y += 1;
    doc.setFillColor(...C.secondary);
    doc.rect(margin, y, contentW, 9, "F");
    doc.setTextColor(...C.muted);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTION", margin + 3, y + 6);
    doc.text("AMOUNT", pageW - margin - 3, y + 6, { align: "right" });

    // ── Line items ────────────────────────────────────────────────
    const baseRent = invoice.baseRent ?? invoice.amount;
    const utilitiesTotal = invoice.utilitiesTotal ?? 0;

    const lineItems: { label: string; amount: number }[] = [
      { label: "Monthly Base Rent", amount: baseRent },
    ];
    if (utilitiesTotal > 0) {
      lineItems.push({ label: "Utilities (Electricity + Water)", amount: utilitiesTotal });
    }

    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const item of lineItems) {
      doc.setTextColor(...C.primary);
      doc.text(item.label, margin + 3, y);
      doc.setFont("helvetica", "bold");
      doc.text(phpFmt(item.amount), pageW - margin - 3, y, { align: "right" });
      doc.setFont("helvetica", "normal");
      y += 8;
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.2);
      doc.line(margin, y - 3, pageW - margin, y - 3);
    }

    // ── Subtotal row ──────────────────────────────────────────────
    y += 4;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.muted);
    doc.text("Subtotal", pageW - margin - 68, y);
    doc.setTextColor(...C.primary);
    doc.setFont("helvetica", "bold");
    doc.text(phpFmt(invoice.amount), pageW - margin - 3, y, { align: "right" });

    // ── Total block (primary bg + accent amount) ──────────────────
    y += 9;
    doc.setFillColor(...C.primary);
    doc.rect(pageW - margin - 72, y - 6, 72, 13, "F");
    // "TOTAL DUE" label in white
    doc.setTextColor(...C.white);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("TOTAL DUE", pageW - margin - 68, y + 1);
    // amount in accent gold
    doc.setTextColor(...C.accent);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(phpFmt(invoice.amount), pageW - margin - 3, y + 1, { align: "right" });

    // ── Footer ────────────────────────────────────────────────────
    const footerY = 282;
    doc.setFillColor(...C.secondary);
    doc.rect(0, footerY - 8, pageW, 15, "F");
    doc.setFillColor(...C.accent);
    doc.rect(0, footerY - 8, 4, 15, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text("This is a system-generated invoice. KwenTech Rental Management.", pageW / 2, footerY - 1, { align: "center" });
    doc.text(`Invoice ID: ${invoice.id}`, pageW / 2, footerY + 4, { align: "center" });

    const blob = doc.output("blob");
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  };

  const markInvoiceAsPaid = async (invoice: Invoice) => {
    if (invoice.status === "Paid") return;

    try {
      const res = await api.updateInvoice(invoice.id, { status: "Paid" });
      const updatedInvoice = res.invoice as Invoice;
      const updated = invoices.map((inv) => (inv.id === invoice.id ? updatedInvoice : inv));
      setInvoices(updated);
      saveInvoices(updated);
      toast({
        title: "Invoice updated",
        description: "Invoice marked as Paid.",
      });
    } catch {
      const updated = invoices.map((inv) =>
        inv.id === invoice.id ? ({ ...inv, status: "Paid" } as Invoice) : inv,
      );
      setInvoices(updated);
      saveInvoices(updated);
      toast({
        title: "Invoice updated locally",
        description: "Invoice marked as Paid (offline mode).",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <main className="flex-1 overflow-auto p-6 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading invoices…
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="rounded-2xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Invoice Generator</h1>
              <p className="text-sm text-white/80">
                Select property and room, review details, then generate invoice.
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2 w-fit bg-white text-slate-900 hover:bg-white/90">
              <FilePlus2 className="h-4 w-4" /> Generate Invoice
            </Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-emerald-300/30 bg-white p-4 text-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500">Paid Invoices</p>
                  <p className="mt-1 text-3xl font-bold leading-none">{formatPhp(summary.paidAmount)}</p>
                  <p className="mt-2 text-xs text-slate-500">{summary.paid} settled invoices</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-amber-300/30 bg-white p-4 text-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                  <WalletCards className="h-4 w-4" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500">Unpaid Balance</p>
                  <p className="mt-1 text-3xl font-bold leading-none">{formatPhp(summary.unpaidAmount)}</p>
                  <p className="mt-2 text-xs text-slate-500">{summary.unpaidCount} active receivables</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-blue-300/30 bg-white p-4 text-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500">Pending Invoices</p>
                  <p className="mt-1 text-3xl font-bold leading-none">{summary.sentCount + summary.draftCount}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {summary.sentCount} sent • {summary.draftCount} draft
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-rose-300/30 bg-white p-4 text-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-lg bg-rose-100 p-2 text-rose-700">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500">Overdue</p>
                  <p className="mt-1 text-3xl font-bold leading-none">{formatPhp(summary.overdueAmount)}</p>
                  <p className="mt-2 text-xs text-slate-500">{summary.overdueCount} past due invoices</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20 px-6 py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl">Invoice Directory</CardTitle>
                <p className="text-sm text-muted-foreground">Track billing, due dates, and generated invoice files.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs">
                  {invoices.length} invoice{invoices.length === 1 ? "" : "s"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {invoices.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                No invoices generated yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="bg-muted/30">
                    <tr className="text-left">
                      <th className="px-5 py-3.5 font-medium text-muted-foreground">Tenant</th>
                      <th className="px-5 py-3.5 font-medium text-muted-foreground">Property</th>
                      <th className="px-5 py-3.5 font-medium text-muted-foreground">Period</th>
                      <th className="px-5 py-3.5 font-medium text-muted-foreground">Due Date</th>
                      <th className="px-5 py-3.5 font-medium text-muted-foreground">Charges</th>
                      <th className="px-5 py-3.5 font-medium text-muted-foreground">Status</th>
                      <th className="px-5 py-3.5 font-medium text-muted-foreground text-right">Total</th>
                      <th className="px-5 py-3.5 font-medium text-muted-foreground text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => {
                      const tenant = tenants.find((t) => t.id === invoice.tenantId);
                      const property = properties.find((p) => p.id === invoice.propertyId);
                      return (
                        <tr key={invoice.id} className="border-t hover:bg-muted/20">
                          <td className="px-5 py-3.5 font-medium">{tenant?.fullName ?? "Unknown Tenant"}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">{property?.name ?? "Unknown Property"}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {formatPeriodRangeLabel(invoice.periodStart, invoice.periodEnd)}
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">{invoice.dueDate}</td>
                          <td className="px-5 py-3.5">
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p>Base: {formatPhp(invoice.baseRent ?? invoice.amount)}</p>
                              <p>Utilities: {formatPhp(invoice.utilitiesTotal ?? 0)}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge className={getInvoiceStatusBadgeClass(invoice.status)}>{invoice.status}</Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right font-semibold">{formatPhp(invoice.amount)}</td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant={invoice.status === "Paid" ? "secondary" : "default"}
                                className="gap-1"
                                onClick={() => void markInvoiceAsPaid(invoice)}
                                disabled={invoice.status === "Paid"}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {invoice.status === "Paid" ? "Paid" : "Mark as Paid"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => viewInvoicePdf(invoice)}
                              >
                                <FileText className="h-3.5 w-3.5" />
                                PDF
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label>Property</Label>
                <Select
                  value={formData.propertyId}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      propertyId: value,
                      unitId: "",
                      periodStart: currentRange.periodStart,
                      periodEnd: currentRange.periodEnd,
                      amount: "",
                      dueDate: "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Room / Unit</Label>
                <Select
                  value={formData.unitId}
                  onValueChange={(value) => {
                    const property = properties.find((p) => p.id === formData.propertyId);
                    const unit = property?.units.find((u) => u.id === value);
                    const tenant = tenants.find(
                      (t) => t.propertyId === formData.propertyId && t.unitId === value,
                    );
                    const unitLabel = unit?.label ?? "";
                    const latestCycle = utilityCycles
                      .filter(
                        (cycle) =>
                          cycle.propertyId === formData.propertyId && cycle.unitId === value,
                      )
                      .sort((a, b) => (b.periodEnd ?? "").localeCompare(a.periodEnd ?? ""))[0];
                    const periodStart = latestCycle?.periodStart ?? currentRange.periodStart;
                    const periodEnd = latestCycle?.periodEnd ?? currentRange.periodEnd;
                    const utilityCycle =
                      property && unit
                        ? findCycleForUnitAndPeriod(
                            utilityCycles,
                            formData.propertyId,
                            unitLabel,
                            `${periodStart} to ${periodEnd}`,
                            periodStart,
                            periodEnd,
                            value,
                          )
                        : undefined;
                    const utilitiesTotal = utilityCycle ? calculateUtilityCharge(utilityCycle) : 0;
                    const total = (unit?.monthlyRent ?? 0) + utilitiesTotal;
                    setFormData((prev) => ({
                      ...prev,
                      unitId: value,
                      periodStart,
                      periodEnd,
                      amount: String(total),
                      dueDate: tenant
                        ? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(
                            tenant.dueDate,
                          ).padStart(2, "0")}`
                        : prev.dueDate,
                    }));
                  }}
                  disabled={!formData.propertyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room/unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedProperty?.units ?? []).map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.propertyId && formData.unitId ? (
                <div className="rounded-lg border p-3 space-y-1 text-sm bg-muted/30">
                  <p>
                    <span className="text-muted-foreground">Tenant: </span>
                    {matchedTenant?.fullName ?? "No assigned tenant"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Base Rent: </span>
                    {formatPhp(computedBaseRent)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Utilities: </span>
                    {formatPhp(computedUtilities)}
                  </p>
                  <p className="font-semibold">
                    <span className="text-muted-foreground font-normal">Total: </span>
                    {formatPhp(computedTotal)}
                  </p>
                  {!matchedUtilityCycle ? (
                    <p className="text-xs text-muted-foreground">
                      No utility cycle found for this room and billing month.
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="grid gap-2">
                <Label>Billing Period</Label>
                <Input
                  value={formatPeriodRangeLabel(formData.periodStart, formData.periodEnd)}
                  readOnly
                  disabled
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Total (Base Rent + Utilities)</Label>
                  <Input type="number" value={formData.amount} readOnly disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                    disabled={!matchedTenant}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isGenerating}>
                  Cancel
                </Button>
                <Button
                  onClick={() => void generateInvoice()}
                  disabled={!formData.propertyId || !formData.unitId || !matchedTenant || !formData.dueDate || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating…
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Invoices;
