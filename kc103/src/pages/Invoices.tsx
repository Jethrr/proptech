import { useEffect, useMemo, useState } from "react";
import { FilePlus2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Invoice, formatPhp } from "@/data/rental";
import {
  loadInvoices,
  loadRentalProperties,
  loadTenants,
  loadUtilityBillingCycles,
  saveInvoices,
} from "@/lib/rentalStorage";
import { useToast } from "@/hooks/use-toast";
import {
  calculateUtilityCharge,
  findCycleForUnitAndPeriod,
  formatPeriodRangeLabel,
  getCurrentPeriodRange,
} from "@/lib/utilities";

const Invoices = () => {
  const { toast } = useToast();
  const tenants = useMemo(() => loadTenants(), []);
  const properties = useMemo(() => loadRentalProperties(), []);
  const utilityCycles = useMemo(() => loadUtilityBillingCycles(), []);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentRange = getCurrentPeriodRange();
  const [formData, setFormData] = useState({
    propertyId: "",
    unitLabel: "",
    periodStart: currentRange.periodStart,
    periodEnd: currentRange.periodEnd,
    amount: "",
    dueDate: "",
  });

  useEffect(() => {
    setInvoices(loadInvoices());
  }, []);

  const selectedProperty = properties.find((property) => property.id === formData.propertyId);
  const selectedUnit = selectedProperty?.units.find((unit) => unit.label === formData.unitLabel);
  const matchedTenant =
    tenants.find(
      (tenant) =>
        tenant.propertyId === formData.propertyId && tenant.unitLabel === formData.unitLabel,
    ) ?? null;
  const matchedUtilityCycle =
    selectedUnit && formData.propertyId
      ? findCycleForUnitAndPeriod(
          utilityCycles,
          formData.propertyId,
          formData.unitLabel,
          `${formData.periodStart} to ${formData.periodEnd}`,
          formData.periodStart,
          formData.periodEnd,
        )
      : undefined;
  const computedBaseRent = selectedUnit?.monthlyRent ?? 0;
  const computedUtilities = matchedUtilityCycle ? calculateUtilityCharge(matchedUtilityCycle) : 0;
  const computedTotal = computedBaseRent + computedUtilities;

  const generateInvoice = () => {
    if (!formData.propertyId || !formData.unitLabel || !matchedTenant || !selectedUnit) {
      toast({
        title: "Cannot generate invoice",
        description: "Please select a property and room that has an assigned tenant.",
        variant: "destructive",
      });
      return;
    }

    const next: Invoice = {
      id: `inv-${Date.now()}`,
      tenantId: matchedTenant.id,
      propertyId: formData.propertyId,
      billingPeriod: `${formData.periodStart} to ${formData.periodEnd}`,
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
    setIsDialogOpen(false);
    toast({
      title: "Invoice generated",
      description: `Draft invoice created for ${matchedTenant.fullName} (${selectedProperty?.name ?? "Property"}) with utilities included.`,
    });
  };

  const viewInvoicePdf = (invoice: Invoice) => {
    const tenant = tenants.find((t) => t.id === invoice.tenantId);
    const property = properties.find((p) => p.id === invoice.propertyId);

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("KwenTech Rental Invoice", 14, 20);

    doc.setFontSize(11);
    doc.text(`Invoice ID: ${invoice.id}`, 14, 32);
    doc.text(`Created: ${invoice.createdAt}`, 14, 39);
    doc.text(`Status: ${invoice.status}`, 14, 46);

    doc.text(`Tenant: ${tenant?.fullName ?? "Unknown Tenant"}`, 14, 58);
    doc.text(`Email: ${tenant?.email ?? "N/A"}`, 14, 65);
    doc.text(`Phone: ${tenant?.phone ?? "N/A"}`, 14, 72);

    doc.text(`Property: ${property?.name ?? "Unknown Property"}`, 14, 84);
    doc.text(`Unit: ${tenant?.unitLabel ?? "N/A"}`, 14, 91);
    doc.text(`Billing Period: ${formatPeriodRangeLabel(invoice.periodStart, invoice.periodEnd)}`, 14, 98);
    doc.text(`Due Date: ${invoice.dueDate}`, 14, 105);

    doc.setFontSize(11);
    doc.text(`Base Rent: ${formatPhp(invoice.baseRent ?? invoice.amount)}`, 14, 116);
    doc.text(`Utilities: ${formatPhp(invoice.utilitiesTotal ?? 0)}`, 14, 123);

    doc.setFontSize(13);
    doc.text(`Total Amount: ${formatPhp(invoice.amount)}`, 14, 132);

    doc.setFontSize(10);
    doc.text("This is a system-generated mock invoice for demo purposes.", 14, 282);

    const blob = doc.output("blob");
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Invoice Generator</h1>
            <p className="text-muted-foreground">
              Select property and room, review details, then generate invoice.
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2 w-fit">
            <FilePlus2 className="h-4 w-4" /> Generate Invoice
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices generated yet.</p>
            ) : (
              invoices.map((invoice) => {
                const tenant = tenants.find((t) => t.id === invoice.tenantId);
                const property = properties.find((p) => p.id === invoice.propertyId);
                return (
                  <div key={invoice.id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{tenant?.fullName ?? "Unknown Tenant"}</p>
                      <p className="text-xs text-muted-foreground">
                        {property?.name ?? "Unknown Property"} | {formatPeriodRangeLabel(invoice.periodStart, invoice.periodEnd)} | Due{" "}
                        {invoice.dueDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Base: {formatPhp(invoice.baseRent ?? invoice.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Utilities: {formatPhp(invoice.utilitiesTotal ?? 0)}
                      </p>
                      <p className="font-semibold">{formatPhp(invoice.amount)}</p>
                      <p className="text-xs text-muted-foreground">{invoice.status}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => viewInvoicePdf(invoice)}
                      >
                        View PDF
                      </Button>
                    </div>
                  </div>
                );
              })
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
                      unitLabel: "",
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
                  value={formData.unitLabel}
                  onValueChange={(value) => {
                    const property = properties.find((p) => p.id === formData.propertyId);
                    const unit = property?.units.find((u) => u.label === value);
                    const tenant = tenants.find(
                      (t) => t.propertyId === formData.propertyId && t.unitLabel === value,
                    );
                    const latestCycle = utilityCycles
                      .filter(
                        (cycle) =>
                          cycle.propertyId === formData.propertyId && cycle.unitLabel === value,
                      )
                      .sort((a, b) => (b.periodEnd ?? "").localeCompare(a.periodEnd ?? ""))[0];
                    const periodStart = latestCycle?.periodStart ?? currentRange.periodStart;
                    const periodEnd = latestCycle?.periodEnd ?? currentRange.periodEnd;
                    const utilityCycle =
                      property && unit
                        ? findCycleForUnitAndPeriod(
                            utilityCycles,
                            formData.propertyId,
                            value,
                            `${periodStart} to ${periodEnd}`,
                            periodStart,
                            periodEnd,
                          )
                        : undefined;
                    const utilitiesTotal = utilityCycle ? calculateUtilityCharge(utilityCycle) : 0;
                    const total = (unit?.monthlyRent ?? 0) + utilitiesTotal;
                    setFormData((prev) => ({
                      ...prev,
                      unitLabel: value,
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
                      <SelectItem key={unit.id} value={unit.label}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.propertyId && formData.unitLabel ? (
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={generateInvoice}
                  disabled={!formData.propertyId || !formData.unitLabel || !matchedTenant || !formData.dueDate}
                >
                  Generate
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
