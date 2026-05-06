import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatPhp } from "@/data/rental";
import {
  loadRentalProperties,
  loadUtilityBillingCycles,
  saveUtilityBillingCycles,
} from "@/lib/rentalStorage";
import {
  calculateUtilityCharge,
  formatPeriodRangeLabel,
  getCurrentPeriodRange,
} from "@/lib/utilities";

const Utilities = () => {
  const { toast } = useToast();
  const properties = useMemo(() => loadRentalProperties(), []);
  const [cycles, setCycles] = useState(loadUtilityBillingCycles());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentRange = getCurrentPeriodRange();
  const [formData, setFormData] = useState({
    propertyId: "",
    unitLabel: "",
    periodStart: currentRange.periodStart,
    periodEnd: currentRange.periodEnd,
    previousReading: "",
    currentReading: "",
    electricityRate: "12",
    waterRate: "0",
    additionalFees: "0",
  });

  const selectedProperty = properties.find((property) => property.id === formData.propertyId);
  const selectedUnits = selectedProperty?.units ?? [];

  const addCycle = () => {
    const next = {
      id: `util-${Date.now()}`,
      propertyId: formData.propertyId,
      unitLabel: formData.unitLabel,
      billingPeriod: `${formData.periodStart} to ${formData.periodEnd}`,
      periodStart: formData.periodStart,
      periodEnd: formData.periodEnd,
      previousReading: Number(formData.previousReading),
      currentReading: Number(formData.currentReading),
      electricityRate: Number(formData.electricityRate),
      waterRate: Number(formData.waterRate),
      additionalFees: Number(formData.additionalFees),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const updated = [next, ...cycles];
    setCycles(updated);
    saveUtilityBillingCycles(updated);
    setIsDialogOpen(false);
    toast({
      title: "Billing cycle created",
      description: `${next.unitLabel} (${next.billingPeriod}) utility cycle saved.`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Utilities</h1>
            <p className="text-muted-foreground">
              Create billing cycles, enter meter readings, and manage utility rates per unit.
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2 w-fit">
            <Plus className="h-4 w-4" /> New Billing Cycle
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Utility Billing Cycles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cycles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No utility cycles yet.</p>
            ) : (
              cycles.map((cycle) => {
                const property = properties.find((property) => property.id === cycle.propertyId);
                const usage = Math.max(0, cycle.currentReading - cycle.previousReading);
                const total = calculateUtilityCharge(cycle);
                return (
                  <div key={cycle.id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {property?.name ?? "Unknown Property"} - {cycle.unitLabel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPeriodRangeLabel(cycle.periodStart, cycle.periodEnd)} | Usage: {usage} kWh | Elec rate:{" "}
                        {cycle.electricityRate}/kWh
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Water: {formatPhp(cycle.waterRate)} | Additional: {formatPhp(cycle.additionalFees)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Utility Total</p>
                      <p className="font-semibold">{formatPhp(total)}</p>
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
              <div className="grid gap-2">
                <Label>Unit</Label>
                <Select
                  value={formData.unitLabel}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, unitLabel: value }))}
                  disabled={!formData.propertyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.label}>
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={addCycle}
                  disabled={
                    !formData.propertyId ||
                    !formData.unitLabel ||
                    !formData.periodStart ||
                    !formData.periodEnd ||
                    formData.previousReading === "" ||
                    formData.currentReading === "" ||
                    formData.electricityRate === ""
                  }
                >
                  Save Billing Cycle
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
