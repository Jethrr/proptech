import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Home, Loader2, MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { OccupancyStatus, RentalProperty, RentalUnit, formatPhp } from "@/data/rental";
import { ApiError, api } from "@/lib/api";

const PropertyDetail = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [property, setProperty] = useState<RentalProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUnit, setEditingUnit] = useState<RentalUnit | null>(null);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [unitForm, setUnitForm] = useState({
    label: "",
    occupantsCount: "",
    size: "Small",
    monthlyRent: "",
    status: "Vacant",
  });

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) return;
      try {
        const response = await api.getProperties();
        const selected = response.properties.find((p) => p.id === propertyId) ?? null;
        setProperty(selected);
        setLoadError(selected ? null : "Property not found.");
      } catch (error) {
        setLoadError(error instanceof ApiError ? error.message : "Failed to load property.");
      } finally {
        setIsLoading(false);
      }
    };
    void loadProperty();
  }, [propertyId]);

  const getOccupancy = (units: RentalUnit[]): OccupancyStatus => {
    const occupied = units.filter((u) => u.status === "Occupied").length;
    if (occupied === 0) return "Vacant";
    if (occupied === units.length) return "Occupied";
    return "Maintenance";
  };

  const getStatusTagClass = (tag: RentalProperty["statusTag"]) => {
    if (tag === "RFO") return "bg-emerald-500 text-white";
    if (tag === "Pre-selling") return "bg-sky-500 text-white";
    return "bg-slate-700 text-white";
  };

  const getOccupancyBadgeClass = (status: OccupancyStatus) => {
    if (status === "Occupied") return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    if (status === "Vacant") return "bg-amber-100 text-amber-800 border border-amber-200";
    return "bg-slate-100 text-slate-800 border border-slate-200";
  };

  const openAddUnit = () => {
    setEditingUnit(null);
    setUnitForm({ label: "", occupantsCount: "", size: "Small", monthlyRent: "", status: "Vacant" });
    setIsUnitDialogOpen(true);
  };

  const openEditUnit = (unit: RentalUnit) => {
    setEditingUnit(unit);
    setUnitForm({
      label: unit.label,
      occupantsCount: String(unit.occupantsCount),
      size: unit.size,
      monthlyRent: String(unit.monthlyRent),
      status: unit.status,
    });
    setIsUnitDialogOpen(true);
  };

  const handleSaveUnit = async () => {
    if (!propertyId) return;
    setIsSaving(true);
    const nextUnit: RentalUnit = {
      id: editingUnit?.id ?? `unit-${Date.now()}`,
      label: unitForm.label,
      occupantsCount: Number(unitForm.occupantsCount),
      size: unitForm.size as RentalUnit["size"],
      monthlyRent: Number(unitForm.monthlyRent),
      status: unitForm.status as OccupancyStatus,
    };

    try {
      const response = editingUnit
        ? await api.updateUnit(propertyId, editingUnit.id, nextUnit)
        : await api.createUnit(propertyId, nextUnit);
      setProperty(response.property);
      setIsUnitDialogOpen(false);
      setEditingUnit(null);
      toast({
        title: editingUnit ? "Unit updated" : "Unit added",
        description: editingUnit ? `${nextUnit.label} has been updated.` : `${nextUnit.label} added to property units.`,
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof ApiError ? error.message : "Could not connect to server.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUnit = async (unit: RentalUnit) => {
    if (!propertyId) return;
    try {
      const response = await api.deleteUnit(propertyId, unit.id);
      setProperty(response.property);
      toast({ title: "Unit deleted", description: `${unit.label} removed from property.` });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof ApiError ? error.message : "Could not connect to server.",
        variant: "destructive",
      });
    }
  };

  const summary = useMemo(() => {
    if (!property) return null;
    const totalUnits = property.units.length;
    const occupiedUnits = property.units.filter((u) => u.status === "Occupied").length;
    const vacantUnits = property.units.filter((u) => u.status === "Vacant").length;
    const estimatedIncome = property.units.reduce((sum, unit) => sum + unit.monthlyRent, 0);
    return { totalUnits, occupiedUnits, vacantUnits, estimatedIncome };
  }, [property]);

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <Button variant="outline" onClick={() => navigate("/properties")} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Loading property workspace...
            </CardContent>
          </Card>
        ) : loadError ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 max-w-md mx-auto">
                {loadError}
              </div>
            </CardContent>
          </Card>
        ) : !property ? null : (
          <div className="space-y-5">
            <Card className="overflow-hidden border-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-white/70">Property Workspace</p>
                    <h1 className="text-3xl font-bold">{property.name}</h1>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <MapPin className="h-4 w-4" />
                      <span>{property.address}</span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-white text-slate-900 hover:bg-white/90" onClick={openAddUnit}>
                    <Plus className="h-4 w-4 mr-1" /> Add Unit
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <Badge className={getStatusTagClass(property.statusTag)}>{property.statusTag}</Badge>
                  <Badge className="bg-white/15 text-white border-white/20">{property.type}</Badge>
                  <Badge className="bg-white/15 text-white border-white/20">
                    {property.units.length} total units
                  </Badge>
                  <Badge className="bg-white/15 text-white border-white/20">
                    {getOccupancy(property.units)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Total Units</p>
                  <p className="mt-1 text-2xl font-bold">{summary?.totalUnits ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Occupied</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">{summary?.occupiedUnits ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Vacant</p>
                  <p className="mt-1 text-2xl font-bold text-amber-600">{summary?.vacantUnits ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Estimated Income</p>
                  <p className="mt-1 text-2xl font-bold">{formatPhp(summary?.estimatedIncome ?? 0)}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Units</CardTitle>
                  <p className="text-xs text-muted-foreground">Manage all units under this property.</p>
                </div>
                
              </CardHeader>
              <CardContent>
                {property.units.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-8 text-center space-y-3 bg-muted/20">
                    <div className="mx-auto w-fit rounded-full bg-muted p-3">
                      <Home className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No units yet for <span className="font-medium text-foreground">{property.name}</span>.
                    </p>
                    <div>
                      <Button size="sm" onClick={openAddUnit} className="gap-1">
                        <Plus className="h-4 w-4" />
                        Add first unit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {property.units.map((unit) => (
                      <div
                        key={unit.id}
                        className="rounded-xl border bg-card px-4 py-3 transition hover:border-accent/40 hover:shadow-sm"
                      >
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr_auto] md:items-center">
                          <div>
                            <p className="font-semibold">{unit.label}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                                <Users className="h-3 w-3" /> {unit.occupantsCount} occupants
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                                Size: {unit.size}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm">
                            <p className="text-xs text-muted-foreground">Monthly Rent</p>
                            <p className="font-semibold">{formatPhp(unit.monthlyRent)}</p>
                          </div>
                          <div className="text-sm">
                            <p className="text-xs text-muted-foreground">Status</p>
                            <Badge className={getOccupancyBadgeClass(unit.status)}>{unit.status}</Badge>
                          </div>
                          <div className="flex items-center gap-2 md:justify-end">
                            <Button variant="outline" size="sm" onClick={() => openEditUnit(unit)}>
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => void handleDeleteUnit(unit)}>
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUnit ? "Edit Unit" : "Add Unit"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label>Unit Label</Label>
                <Input
                  value={unitForm.label}
                  onChange={(e) => setUnitForm((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder="Unit 302 / Room 8"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label>Occupants Count</Label>
                  <Input
                    type="number"
                    min={1}
                    value={unitForm.occupantsCount}
                    onChange={(e) => setUnitForm((prev) => ({ ...prev, occupantsCount: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Size</Label>
                  <Select
                    value={unitForm.size}
                    onValueChange={(value) => setUnitForm((prev) => ({ ...prev, size: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Small">Small</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Big">Big</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Monthly Rent</Label>
                  <Input
                    type="number"
                    value={unitForm.monthlyRent}
                    onChange={(e) => setUnitForm((prev) => ({ ...prev, monthlyRent: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={unitForm.status}
                  onValueChange={(value) => setUnitForm((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                    <SelectItem value="Vacant">Vacant</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUnitDialogOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button
                  onClick={() => void handleSaveUnit()}
                  disabled={!unitForm.label || !unitForm.occupantsCount || !unitForm.monthlyRent || isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingUnit ? "Update Unit" : "Save Unit"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default PropertyDetail;
