import { useEffect, useMemo, useState } from "react";
import { FilePlus2, Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Invoice, Tenant, formatPhp } from "@/data/rental";
import {
  loadInvoices,
  loadRentalProperties,
  loadTenants,
  loadUtilityBillingCycles,
  saveInvoices,
  saveTenants,
} from "@/lib/rentalStorage";
import { useToast } from "@/hooks/use-toast";
import {
  calculateUtilityCharge,
  findCycleForUnitAndPeriod,
  getCurrentPeriodRange,
} from "@/lib/utilities";

const Tenants = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const properties = useMemo(() => loadRentalProperties(), []);
  const utilityCycles = useMemo(() => loadUtilityBillingCycles(), []);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    propertyId: "",
    unitLabel: "",
    leaseStart: "",
    leaseEnd: "",
    dueDate: "1",
  });

  useEffect(() => {
    setTenants(loadTenants());
  }, []);

  const filtered = useMemo(
    () =>
      tenants.filter(
        (t) =>
          t.fullName.toLowerCase().includes(query.toLowerCase()) ||
          t.email.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, tenants],
  );

  const availableUnitsForSelectedProperty = useMemo(() => {
    if (!formData.propertyId) return [];
    const property = properties.find((p) => p.id === formData.propertyId);
    if (!property) return [];

    const occupiedUnitLabels = new Set(
      tenants
        .filter((tenant) => tenant.propertyId === formData.propertyId)
        .map((tenant) => tenant.unitLabel),
    );

    return property.units.filter(
      (unit) => unit.status !== "Maintenance" && !occupiedUnitLabels.has(unit.label),
    );
  }, [formData.propertyId, properties, tenants]);

  const addTenant = () => {
    const next: Tenant = {
      id: `tenant-${Date.now()}`,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      propertyId: formData.propertyId,
      unitLabel: formData.unitLabel,
      leaseStart: formData.leaseStart,
      leaseEnd: formData.leaseEnd,
      dueDate: Number(formData.dueDate),
      paymentStatus: "Due Soon",
      contractFileName: `${formData.fullName.toLowerCase().replace(/\s+/g, "-")}-contract.pdf`,
    };
    const updated = [...tenants, next];
    setTenants(updated);
    saveTenants(updated);
    setIsDialogOpen(false);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      propertyId: "",
      unitLabel: "",
      leaseStart: "",
      leaseEnd: "",
      dueDate: "1",
    });
    toast({ title: "Tenant added", description: `${next.fullName} is now in your tenant list.` });
  };

  const openDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDetailOpen(true);
  };

  const generateInvoiceForTenant = (tenant: Tenant) => {
    const { periodStart, periodEnd } = getCurrentPeriodRange();
    const billingPeriod = `${periodStart} to ${periodEnd}`;
    const property = properties.find((p) => p.id === tenant.propertyId);
    const unit = property?.units.find((u) => u.label === tenant.unitLabel);
    const baseRent = unit?.monthlyRent ?? 0;
    const utilityCycle = findCycleForUnitAndPeriod(
      utilityCycles,
      tenant.propertyId,
      tenant.unitLabel,
      billingPeriod,
      periodStart,
      periodEnd,
    );
    const utilitiesTotal = utilityCycle ? calculateUtilityCharge(utilityCycle) : 0;
    const amount = baseRent + utilitiesTotal;

    if (!property || amount <= 0) {
      toast({
        title: "Unable to generate invoice",
        description: "This tenant has no matched property unit rent yet.",
        variant: "destructive",
      });
      return;
    }

    const invoices = loadInvoices();
    const dueDate = `2026-05-${String(tenant.dueDate).padStart(2, "0")}`;
    const nextInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      tenantId: tenant.id,
      propertyId: tenant.propertyId,
      billingPeriod,
      periodStart,
      periodEnd,
      baseRent,
      utilitiesTotal,
      amount,
      dueDate,
      status: "Draft",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    saveInvoices([nextInvoice, ...invoices]);
    toast({
      title: "Invoice generated",
      description: `Draft invoice for ${tenant.fullName} created at ${formatPhp(amount)} (including utilities).`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tenants Management</h1>
            <p className="text-muted-foreground">View all tenant details, contracts, and due dates.</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2 w-fit">
            <Plus className="h-4 w-4" /> Add Tenant
          </Button>
        </div>

        <Input
          placeholder="Search tenant by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <Card>
          <CardHeader>
            <CardTitle>Tenant Table View</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No tenants found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Property / Unit</TableHead>
                    <TableHead>Due Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((tenant) => {
                    const property = properties.find((p) => p.id === tenant.propertyId);
                    return (
                      <TableRow
                        key={tenant.id}
                        className="cursor-pointer"
                        onClick={() => openDetails(tenant)}
                      >
                        <TableCell>
                          <p className="font-medium">{tenant.fullName}</p>
                          <p className="text-xs text-muted-foreground">{tenant.email}</p>
                        </TableCell>
                        <TableCell>
                          {property?.name ?? "Unknown"} ({tenant.unitLabel})
                        </TableCell>
                        <TableCell>Day {tenant.dueDate}</TableCell>
                        <TableCell>
                          <Badge>{tenant.paymentStatus}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              generateInvoiceForTenant(tenant);
                            }}
                            className="gap-1"
                          >
                            <FilePlus2 className="h-3.5 w-3.5" />
                            Generate Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tenant</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Property</Label>
                <Select
                  value={formData.propertyId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, propertyId: value, unitLabel: "" }))
                  }
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
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Unit Label</Label>
                  <Select
                    value={formData.unitLabel}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, unitLabel: value }))}
                    disabled={!formData.propertyId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          formData.propertyId
                            ? availableUnitsForSelectedProperty.length > 0
                              ? "Select available unit"
                              : "No available units"
                            : "Select property first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnitsForSelectedProperty.map((unit) => (
                        <SelectItem key={unit.id} value={unit.label}>
                          {unit.label} - {unit.size} - {unit.occupantsCount} pax - {formatPhp(unit.monthlyRent)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Monthly Due Day</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={formData.dueDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Lease Start</Label>
                  <Input
                    type="date"
                    value={formData.leaseStart}
                    onChange={(e) => setFormData((prev) => ({ ...prev, leaseStart: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Lease End</Label>
                  <Input
                    type="date"
                    value={formData.leaseEnd}
                    onChange={(e) => setFormData((prev) => ({ ...prev, leaseEnd: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={addTenant}
                  disabled={
                    !formData.fullName ||
                    !formData.email ||
                    !formData.propertyId ||
                    !formData.unitLabel ||
                    !formData.leaseStart ||
                    !formData.leaseEnd
                  }
                >
                  Save Tenant
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tenant Details</DialogTitle>
            </DialogHeader>
            {selectedTenant ? (
              <div className="space-y-2 text-sm">
                {(() => {
                  const property = properties.find((p) => p.id === selectedTenant.propertyId);
                  const unit = property?.units.find((u) => u.label === selectedTenant.unitLabel);
                  return (
                    <>
                      <p>
                        <span className="text-muted-foreground">Full Name: </span>
                        {selectedTenant.fullName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Email: </span>
                        {selectedTenant.email}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Phone: </span>
                        {selectedTenant.phone}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Property: </span>
                        {property?.name ?? "Unknown"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Unit: </span>
                        {selectedTenant.unitLabel}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Unit Rent: </span>
                        {unit ? formatPhp(unit.monthlyRent) : "N/A"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Unit Size: </span>
                        {unit ? unit.size : "N/A"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Occupants Count: </span>
                        {unit ? unit.occupantsCount : "N/A"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Lease Period: </span>
                        {selectedTenant.leaseStart} to {selectedTenant.leaseEnd}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Due Date: </span>
                        Day {selectedTenant.dueDate} monthly
                      </p>
                      <p>
                        <span className="text-muted-foreground">Payment Status: </span>
                        {selectedTenant.paymentStatus}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Contract: </span>
                        {selectedTenant.contractFileName}
                      </p>
                    </>
                  );
                })()}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedTenant) generateInvoiceForTenant(selectedTenant);
                    }}
                  >
                    Generate Invoice
                  </Button>
                  <Button onClick={() => navigate("/invoices")}>Go to Invoices</Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Tenants;
