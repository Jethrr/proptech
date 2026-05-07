import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, MoreHorizontal, Pencil, Trash2, Loader2, Plus, Users } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Invoice, RentalProperty, Tenant, UtilityBillingCycle, formatPhp } from "@/data/rental";
import { loadInvoices, saveInvoices } from "@/lib/rentalStorage";
import { ApiError, api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  calculateUtilityCharge,
  findCycleForUnitAndPeriod,
  getCurrentPeriodRange,
} from "@/lib/utilities";

const Tenants = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<RentalProperty[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [utilityCycles, setUtilityCycles] = useState<UtilityBillingCycle[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    propertyId: "",
    unitId: "",
    leaseStart: "",
    leaseEnd: "",
    dueDate: "1",
  });

  const refreshData = useCallback(async () => {
    const [propsRes, tenantsRes, cyclesRes] = await Promise.all([
      api.getProperties(),
      api.getTenants(),
      api.getUtilityBillingCycles(),
    ]);
    setProperties(propsRes.properties as RentalProperty[]);
    setTenants(tenantsRes.tenants as Tenant[]);
    setUtilityCycles(cyclesRes.cycles as UtilityBillingCycle[]);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshData();
        setLoadError(null);
      } catch (error) {
        const isNetworkOrServer =
          error instanceof TypeError || (error instanceof ApiError && error.status >= 500);
        setLoadError(
          isNetworkOrServer
            ? "Backend unavailable. Start the API server and ensure you are signed in."
            : error instanceof ApiError
              ? `Failed to load tenants: ${error.message}`
              : "Failed to load tenants.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    void bootstrap();
  }, [refreshData]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tenants.filter((tenant) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        tenant.fullName.toLowerCase().includes(normalizedQuery) ||
        tenant.email.toLowerCase().includes(normalizedQuery);
      const matchesProperty =
        propertyFilter === "all" || tenant.propertyId === propertyFilter;
      const matchesUnit = unitFilter === "all" || tenant.unitId === unitFilter;
      const matchesStatus =
        statusFilter === "all" || tenant.paymentStatus === statusFilter;
      return matchesQuery && matchesProperty && matchesUnit && matchesStatus;
    });
  }, [propertyFilter, query, statusFilter, tenants, unitFilter]);

  const unitFilterOptions = useMemo(() => {
    if (propertyFilter === "all") {
      return [];
    }
    const property = properties.find((item) => item.id === propertyFilter);
    return property?.units ?? [];
  }, [properties, propertyFilter]);

  const summary = useMemo(() => {
    const active = tenants.length;
    const paid = tenants.filter((t) => t.paymentStatus === "Paid").length;
    const dueSoon = tenants.filter((t) => t.paymentStatus === "Due Soon").length;
    const overdue = tenants.filter((t) => t.paymentStatus === "Overdue").length;
    return { active, paid, dueSoon, overdue };
  }, [tenants]);

  const availableUnitsForSelectedProperty = useMemo(() => {
    if (!formData.propertyId) return [];
    const property = properties.find((p) => p.id === formData.propertyId);
    if (!property) return [];

    const tenantCountByUnitId = tenants
      .filter((tenant) => tenant.propertyId === formData.propertyId)
      .reduce<Record<string, number>>((acc, tenant) => {
        acc[tenant.unitId] = (acc[tenant.unitId] ?? 0) + 1;
        return acc;
      }, {});

    return property.units.filter((unit) => {
      if (unit.status === "Maintenance") return false;
      const capacity = Math.max(1, unit.occupantsCount || 1);
      const currentTenantCount = tenantCountByUnitId[unit.id] ?? 0;
      return currentTenantCount < capacity;
    });
  }, [formData.propertyId, properties, tenants]);

  const resetTenantForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      propertyId: "",
      unitId: "",
      leaseStart: "",
      leaseEnd: "",
      dueDate: "1",
    });
    setEditingTenantId(null);
  };

  const upsertTenant = async () => {
    setIsSaving(true);
    const addedName = formData.fullName;
    try {
      const due = Number(formData.dueDate);
      if (editingTenantId) {
        await api.updateTenant(editingTenantId, {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          leaseStart: formData.leaseStart,
          leaseEnd: formData.leaseEnd,
          dueDate: due,
        });
      } else {
        await api.createTenant({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          propertyId: formData.propertyId,
          unitId: formData.unitId,
          leaseStart: formData.leaseStart,
          leaseEnd: formData.leaseEnd,
          dueDate: due,
        });
      }
      await refreshData();
      setIsDialogOpen(false);
      resetTenantForm();
      toast({
        title: editingTenantId ? "Tenant updated" : "Tenant added",
        description: editingTenantId ? `${addedName} details were updated.` : `${addedName} is now in your tenant list.`,
      });
    } catch (error) {
      toast({
        title: editingTenantId ? "Could not update tenant" : "Could not save tenant",
        description: error instanceof ApiError ? error.message : "Unexpected error.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const removeSelectedTenant = async () => {
    if (!selectedTenant) return;
    setIsSaving(true);
    try {
      await api.deleteTenant(selectedTenant.id);
      await refreshData();
      setIsDetailOpen(false);
      setSelectedTenant(null);
      toast({
        title: "Tenant removed",
        description: "The unit is available again for assignment.",
      });
    } catch (error) {
      toast({
        title: "Could not remove tenant",
        description: error instanceof ApiError ? error.message : "Unexpected error.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDetailOpen(true);
  };

  const openEditTenant = (tenant: Tenant) => {
    setEditingTenantId(tenant.id);
    setFormData({
      fullName: tenant.fullName,
      email: tenant.email,
      phone: tenant.phone,
      propertyId: tenant.propertyId,
      unitId: tenant.unitId,
      leaseStart: tenant.leaseStart,
      leaseEnd: tenant.leaseEnd,
      dueDate: String(tenant.dueDate),
    });
    setIsDialogOpen(true);
  };

  const markTenantAsPaid = async (tenant: Tenant) => {
    try {
      await api.updateTenant(tenant.id, { paymentStatus: "Paid" });
      await refreshData();
      toast({
        title: "Payment status updated",
        description: `${tenant.fullName} is now marked as Paid.`,
      });
    } catch (error) {
      toast({
        title: "Could not update payment status",
        description: error instanceof ApiError ? error.message : "Unexpected error.",
        variant: "destructive",
      });
    }
  };

  const removeTenant = async (tenant: Tenant) => {
    try {
      await api.deleteTenant(tenant.id);
      await refreshData();
      toast({
        title: "Tenant removed",
        description: `${tenant.fullName} was removed from tenant list.`,
      });
    } catch (error) {
      toast({
        title: "Could not remove tenant",
        description: error instanceof ApiError ? error.message : "Unexpected error.",
        variant: "destructive",
      });
    }
  };

  const generateInvoiceForTenant = async (tenant: Tenant) => {
    const { periodStart, periodEnd } = getCurrentPeriodRange();
    const billingPeriod = `${periodStart} to ${periodEnd}`;
    const property = properties.find((p) => p.id === tenant.propertyId);
    const unit = property?.units.find((u) => u.id === tenant.unitId);
    const baseRent = unit?.monthlyRent ?? 0;
    const utilityCycle = findCycleForUnitAndPeriod(
      utilityCycles,
      tenant.propertyId,
      tenant.unitLabel,
      billingPeriod,
      periodStart,
      periodEnd,
      tenant.unitId,
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

    const now = new Date();
    const dueDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(tenant.dueDate).padStart(2, "0")}`;

    try {
      const res = await api.createInvoice({
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
      });
      const nextInvoice = res.invoice as Invoice;
      saveInvoices([nextInvoice, ...loadInvoices()]);
    } catch {
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
      saveInvoices([nextInvoice, ...loadInvoices()]);
    }

    toast({
      title: "Invoice generated",
      description: `Draft invoice for ${tenant.fullName} created at ${formatPhp(amount)} (including utilities).`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <main className="flex-1 overflow-auto p-6 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading tenants…
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col h-full">
        <main className="flex-1 overflow-auto p-6">
          <p className="text-sm text-destructive">{loadError}</p>
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
              <h1 className="text-2xl font-bold">Tenants Management</h1>
              <p className="text-sm text-white/80">View all tenant details, contracts, and due dates.</p>
            </div>
            <Button
              onClick={() => {
                resetTenantForm();
                setIsDialogOpen(true);
              }}
              className="gap-2 w-fit bg-white text-slate-900 hover:bg-white/90"
            >
              <Plus className="h-4 w-4" /> Add Tenant
            </Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-white/15 bg-white/10 p-3">
              <p className="text-xs text-white/70">Active Tenants</p>
              <p className="mt-1 text-2xl font-semibold">{summary.active}</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-3">
              <p className="text-xs text-white/70">Paid</p>
              <p className="mt-1 text-2xl font-semibold">{summary.paid}</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-3">
              <p className="text-xs text-white/70">Due Soon</p>
              <p className="mt-1 text-2xl font-semibold">{summary.dueSoon}</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-3">
              <p className="text-xs text-white/70">Overdue</p>
              <p className="mt-1 text-2xl font-semibold">{summary.overdue}</p>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="grid gap-3 md:grid-cols-4">
              <Input
                placeholder="Search tenant by name or email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Select
                value={propertyFilter}
                onValueChange={(value) => {
                  setPropertyFilter(value);
                  setUnitFilter("all");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={unitFilter}
                onValueChange={setUnitFilter}
                disabled={propertyFilter === "all"}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      propertyFilter === "all" ? "Select property first" : "Filter by unit"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All units</SelectItem>
                  {unitFilterOptions.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Due Soon">Due Soon</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20 px-6 py-5">
            <CardTitle>Tenant Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/20 py-12 text-center">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No tenants found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="px-5 py-3.5">Tenant</TableHead>
                    <TableHead className="px-5 py-3.5">Property</TableHead>
                    <TableHead className="px-5 py-3.5">Unit</TableHead>
                    <TableHead className="px-5 py-3.5">Due Day</TableHead>
                    <TableHead className="px-5 py-3.5">Status</TableHead>
                    <TableHead className="px-5 py-3.5 text-right">Actions</TableHead>
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
                        <TableCell className="px-5 py-3.5">
                          <p className="font-medium">{tenant.fullName}</p>
                          <p className="text-xs text-muted-foreground">{tenant.email}</p>
                        </TableCell>
                        <TableCell className="px-5 py-3.5">
                          {property?.name ?? "Unknown"}
                        </TableCell>
                        <TableCell className="px-5 py-3.5">
                          {tenant.unitLabel}
                        </TableCell>
                        <TableCell className="px-5 py-3.5">Day {tenant.dueDate}</TableCell>
                        <TableCell className="px-5 py-3.5">
                          <Badge>{tenant.paymentStatus}</Badge>
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => void markTenantAsPaid(tenant)}
                              >
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                Mark as Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => openEditTenant(tenant)}>
                                <Pencil className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-destructive focus:text-destructive"
                                onClick={() => void removeTenant(tenant)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTenantId ? "Edit Tenant" : "Add Tenant"}</DialogTitle>
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
                    setFormData((prev) => ({ ...prev, propertyId: value, unitId: "" }))
                  }
                    disabled={Boolean(editingTenantId)}
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
                  <Label>Unit</Label>
                  <Select
                    value={formData.unitId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, unitId: value }))}
                    disabled={!formData.propertyId || Boolean(editingTenantId)}
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
                        <SelectItem key={unit.id} value={unit.id}>
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button
                  onClick={() => void upsertTenant()}
                  disabled={
                    isSaving ||
                    !formData.fullName ||
                    !formData.email ||
                    !formData.propertyId ||
                    !formData.unitId ||
                    !formData.leaseStart ||
                    !formData.leaseEnd
                  }
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving…
                    </>
                  ) : (
                    editingTenantId ? "Update Tenant" : "Save Tenant"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Tenant Details</DialogTitle>
            </DialogHeader>
            {selectedTenant ? (
              <div className="space-y-5">
                {(() => {
                  const property = properties.find((p) => p.id === selectedTenant.propertyId);
                  const unit = property?.units.find((u) => u.id === selectedTenant.unitId);
                  const todayDay = new Date().getDate();
                  const dueDelta = selectedTenant.dueDate - todayDay;
                  const dueHint =
                    dueDelta > 0
                      ? `${dueDelta} day${dueDelta > 1 ? "s" : ""} until due date`
                      : dueDelta === 0
                        ? "Due today"
                        : `${Math.abs(dueDelta)} day${Math.abs(dueDelta) > 1 ? "s" : ""} past due in current month`;
                  return (
                    <>
                      <div className="rounded-xl border bg-muted/20 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-2xl font-semibold tracking-tight">{selectedTenant.fullName}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {selectedTenant.email} • {selectedTenant.phone}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge>{selectedTenant.paymentStatus}</Badge>
                            <Badge variant="outline">Day {selectedTenant.dueDate} due</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border p-4">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly Rent</p>
                          <p className="mt-1 text-2xl font-semibold">{unit ? formatPhp(unit.monthlyRent) : "N/A"}</p>
                        </div>
                        <div className="rounded-xl border p-4">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Payment Status</p>
                          <p className="mt-1 text-2xl font-semibold">{selectedTenant.paymentStatus}</p>
                        </div>
                        <div className="rounded-xl border p-4">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Due Date Tracker</p>
                          <p className="mt-1 text-base font-semibold">Day {selectedTenant.dueDate} monthly</p>
                          <p className="mt-1 text-xs text-muted-foreground">{dueHint}</p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border p-4 space-y-3">
                          <p className="text-sm font-semibold">Contact & Contract</p>
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="text-muted-foreground">Email: </span>
                              {selectedTenant.email}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Phone: </span>
                              {selectedTenant.phone}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Contract File: </span>
                              {selectedTenant.contractFileName}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-xl border p-4 space-y-3">
                          <p className="text-sm font-semibold">Lease & Property Assignment</p>
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="text-muted-foreground">Property: </span>
                              {property?.name ?? "Unknown"}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Unit: </span>
                              {selectedTenant.unitLabel}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Lease Period: </span>
                              {selectedTenant.leaseStart} to {selectedTenant.leaseEnd}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Unit Size: </span>
                              {unit ? unit.size : "N/A"}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Occupants Count: </span>
                              {unit ? unit.occupantsCount : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
                <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1"
                    disabled={isSaving}
                    onClick={() => void removeSelectedTenant()}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedTenant) void generateInvoiceForTenant(selectedTenant);
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
