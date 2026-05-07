import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Droplets, Gauge, Loader2, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { RentalProperty, UtilityBillingCycle, formatPhp } from "@/data/rental";
import { ApiError, api } from "@/lib/api";
import {
  calculateUtilityCharge,
  formatPeriodRangeLabel,
  getCurrentPeriodRange,
} from "@/lib/utilities";

const Utilities = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<RentalProperty[]>([]);
  const [cycles, setCycles] = useState<UtilityBillingCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentRange = useMemo(() => getCurrentPeriodRange(), []);
  const [formData, setFormData] = useState({
    propertyId: "",
    unitId: "",
    periodStart: currentRange.periodStart,
    periodEnd: currentRange.periodEnd,
    previousReading: "",
    currentReading: "",
    electricityRate: "12",
    waterRate: "0",
    additionalFees: "0",
  });

  const refreshData = useCallback(async () => {
    const [propsRes, cyclesRes] = await Promise.all([
      api.getProperties(),
      api.getUtilityBillingCycles(),
    ]);
    setProperties(propsRes.properties as RentalProperty[]);
    setCycles(cyclesRes.cycles as UtilityBillingCycle[]);
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
              ? `Failed to load utilities: ${error.message}`
              : "Failed to load utilities.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    void bootstrap();
  }, [refreshData]);

  const selectedProperty = properties.find((property) => property.id === formData.propertyId);
  const selectedUnits = selectedProperty?.units ?? [];
  const summary = useMemo(() => {
    const totalCycles = cycles.length;
    const totalBilled = cycles.reduce((sum, cycle) => sum + calculateUtilityCharge(cycle), 0);
    const currentMonth = getCurrentPeriodRange();
    const thisPeriodCycles = cycles.filter(
      (cycle) => cycle.periodStart === currentMonth.periodStart && cycle.periodEnd === currentMonth.periodEnd,
    ).length;
    return { totalCycles, totalBilled, thisPeriodCycles };
  }, [cycles]);

  const addCycle = async () => {
    setIsSaving(true);
    try {
      const { cycle } = await api.createUtilityBillingCycle({
        propertyId: formData.propertyId,
        unitId: formData.unitId,
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd,
        previousReading: Number(formData.previousReading),
        currentReading: Number(formData.currentReading),
        electricityRate: Number(formData.electricityRate),
        waterRate: Number(formData.waterRate),
        additionalFees: Number(formData.additionalFees),
      });
      setCycles((prev) => [cycle as UtilityBillingCycle, ...prev]);
      setIsDialogOpen(false);
      toast({
        title: "Billing cycle created",
        description: `${cycle.unitLabel} (${formatPeriodRangeLabel(cycle.periodStart, cycle.periodEnd)}) utility cycle saved.`,
      });
    } catch (error) {
      toast({
        title: "Could not save billing cycle",
        description: error instanceof ApiError ? error.message : "Unexpected error.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <main className="flex-1 overflow-auto p-6 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading utilities…
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
              <h1 className="text-2xl font-bold">Utilities</h1>
              <p className="text-sm text-white/80">
                Create billing cycles, enter meter readings, and manage utility rates per unit.
              </p>
            </div>
            <Button
              onClick={() => {
                setFormData({
                  propertyId: "",
                  unitId: "",
                  periodStart: currentRange.periodStart,
                  periodEnd: currentRange.periodEnd,
                  previousReading: "",
                  currentReading: "",
                  electricityRate: "12",
                  waterRate: "0",
                  additionalFees: "0",
                });
                setIsDialogOpen(true);
              }}
              className="gap-2 w-fit bg-white text-slate-900 hover:bg-white/90"
            >
              <Plus className="h-4 w-4" /> New Billing Cycle
            </Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-white/15 bg-white/10 p-3">
              <p className="text-xs text-white/70">Billing Cycles</p>
              <p className="mt-1 text-2xl font-semibold">{summary.totalCycles}</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-3">
              <p className="text-xs text-white/70">Total Utility Charges</p>
              <p className="mt-1 text-2xl font-semibold">{formatPhp(summary.totalBilled)}</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-3">
              <p className="text-xs text-white/70">Current Period Cycles</p>
              <p className="mt-1 text-2xl font-semibold">{summary.thisPeriodCycles}</p>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20 px-6 py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl">Utility Billing Directory</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review consumption, rates, and final utility totals per billing cycle.
                </p>
              </div>
              <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs">
                {cycles.length} cycle{cycles.length === 1 ? "" : "s"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {cycles.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                No utility cycles yet.
              </div>
            ) : (
              cycles.map((cycle) => {
                const property = properties.find((p) => p.id === cycle.propertyId);
                const usage = Math.max(0, cycle.currentReading - cycle.previousReading);
                const total = calculateUtilityCharge(cycle);
                return (
                  <div
                    key={cycle.id}
                    className="rounded-2xl border bg-gradient-to-r from-background to-muted/30 p-5 transition hover:shadow-md"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-3.5">
                          <div className="rounded-xl bg-slate-900 p-2.5 text-white">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold tracking-tight">
                              {property?.name ?? "Unknown Property"} - {cycle.unitLabel}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatPeriodRangeLabel(cycle.periodStart, cycle.periodEnd)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5">
                            <Gauge className="h-3.5 w-3.5" />
                            Usage: {usage} kWh
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5">
                            <Zap className="h-3.5 w-3.5" />
                            Elec rate: {formatPhp(cycle.electricityRate)}/kWh
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5">
                            <Droplets className="h-3.5 w-3.5" />
                            Water: {formatPhp(cycle.waterRate)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5">
                            Additional: {formatPhp(cycle.additionalFees)}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-[190px] rounded-xl border bg-background/80 p-4 text-right">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Utility Total</p>
                        <p className="mt-1 text-2xl font-bold">{formatPhp(total)}</p>
                      </div>
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
              <DialogTitle>Create Utility Billing Cycle</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label>Property</Label>
                <Select
                  value={formData.propertyId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, propertyId: value, unitId: "" }))
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
              <div className="grid gap-2">
                <Label>Unit</Label>
                <Select
                  value={formData.unitId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, unitId: value }))}
                  disabled={!formData.propertyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Period Start</Label>
                <Input
                  type="date"
                  value={formData.periodStart}
                  onChange={(e) => setFormData((prev) => ({ ...prev, periodStart: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Period End</Label>
                <Input
                  type="date"
                  value={formData.periodEnd}
                  onChange={(e) => setFormData((prev) => ({ ...prev, periodEnd: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Previous Meter Reading</Label>
                  <Input
                    type="number"
                    value={formData.previousReading}
                    onChange={(e) => setFormData((prev) => ({ ...prev, previousReading: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Current Meter Reading</Label>
                  <Input
                    type="number"
                    value={formData.currentReading}
                    onChange={(e) => setFormData((prev) => ({ ...prev, currentReading: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label>Electricity Rate (/kWh)</Label>
                  <Input
                    type="number"
                    value={formData.electricityRate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, electricityRate: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Water</Label>
                  <Input
                    type="number"
                    value={formData.waterRate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, waterRate: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Additional Fees</Label>
                  <Input
                    type="number"
                    value={formData.additionalFees}
                    onChange={(e) => setFormData((prev) => ({ ...prev, additionalFees: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button
                  onClick={() => void addCycle()}
                  disabled={
                    isSaving ||
                    !formData.propertyId ||
                    !formData.unitId ||
                    !formData.periodStart ||
                    !formData.periodEnd ||
                    formData.previousReading === "" ||
                    formData.currentReading === "" ||
                    formData.electricityRate === ""
                  }
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving…
                    </>
                  ) : (
                    "Save Billing Cycle"
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

export default Utilities;
