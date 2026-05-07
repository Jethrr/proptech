import { useEffect, useMemo, useState } from "react";
import { Building2, ChevronRight, Loader2, MapPin, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { OccupancyStatus, RentalProperty, RentalUnit, formatPhp } from "@/data/rental";
import { ApiError, api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const FALLBACK_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&h=900&fit=crop";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState<RentalProperty[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditNameDialogOpen, setIsEditNameDialogOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [editPropertyName, setEditPropertyName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "Apartment",
    address: "",
    statusTag: "RFO",
    notes: "",
  });

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const response = await api.getProperties();
        setProperties(response.properties);
        setLoadError(null);
      } catch (error) {
        const isNetworkOrServer = error instanceof TypeError || (error instanceof ApiError && error.status >= 500);
        if (isNetworkOrServer) {
          setLoadError("Backend unavailable. No data to show — start the API server.");
        } else {
          setLoadError(error instanceof ApiError ? `Failed to load properties: ${error.message}` : "Failed to load properties.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    void bootstrap();
  }, []);

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

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        !query ||
        property.name.toLowerCase().includes(query.toLowerCase()) ||
        property.address.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === "all" || property.type === typeFilter;
      const matchesStatus = statusFilter === "all" || getOccupancy(property.units) === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [properties, query, statusFilter, typeFilter]);

  const summary = useMemo(() => {
    const totalUnits = properties.reduce((sum, property) => sum + property.units.length, 0);
    const estimatedIncome = properties.reduce(
      (sum, property) => sum + property.units.reduce((unitSum, unit) => unitSum + unit.monthlyRent, 0),
      0,
    );
    return {
      propertiesCount: properties.length,
      totalUnits,
      estimatedIncome,
    };
  }, [properties]);

  const handleSaveProperty = async () => {
    setIsSaving(true);
    try {
      const response = await api.createProperty({
        name: formData.name,
        type: formData.type as RentalProperty["type"],
        address: formData.address,
        imagePath: "",
        statusTag: formData.statusTag as RentalProperty["statusTag"],
        notes: formData.notes,
      });
      setProperties((prev) => [response.property, ...prev]);
      setIsDialogOpen(false);
      setFormData({ name: "", type: "Apartment", address: "", statusTag: "RFO", notes: "" });
      toast({
        title: "Property added",
        description: `${response.property.name} saved successfully.`,
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

  const openEditPropertyName = (property: RentalProperty) => {
    setEditingPropertyId(property.id);
    setEditPropertyName(property.name);
    setIsEditNameDialogOpen(true);
  };

  const handleSavePropertyName = async () => {
    if (!editingPropertyId) return;
    const target = properties.find((p) => p.id === editingPropertyId);
    if (!target) return;

    const nextName = editPropertyName.trim();
    if (!nextName) return;

    setIsSaving(true);
    try {
      const res = await api.updateProperty(editingPropertyId, {
        name: nextName,
        type: target.type,
        address: target.address,
        imagePath: target.imagePath ?? "",
        statusTag: target.statusTag,
        notes: target.notes ?? "",
      });
      const updated = res.property as unknown as RentalProperty;
      setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setIsEditNameDialogOpen(false);
      setEditingPropertyId(null);
      toast({
        title: "Property updated",
        description: `Property name changed to "${updated.name}".`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof ApiError ? error.message : "Could not connect to server.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProperty = async (property: RentalProperty) => {
    if (!window.confirm(`Delete "${property.name}"? This cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      await api.deleteProperty(property.id);
      setProperties((prev) => prev.filter((p) => p.id !== property.id));

      // If we deleted the property currently being edited, reset edit UI.
      if (editingPropertyId === property.id) {
        setIsEditNameDialogOpen(false);
        setEditingPropertyId(null);
        setEditPropertyName("");
      }

      toast({
        title: "Property deleted",
        description: `"${property.name}" was removed.`,
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof ApiError ? error.message : "Could not connect to server.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="rounded-2xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Properties Management</h1>
              <p className="text-sm text-white/80">Pick a property to open a dedicated units workspace.</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2 w-fit bg-white text-slate-900 hover:bg-white/90">
              <Plus className="h-4 w-4" /> Add Property
            </Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-white/15 bg-white/10 p-3">
              <p className="text-xs text-white/70">Total Properties</p>
              <p className="mt-1 text-2xl font-semibold">{summary.propertiesCount}</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-3">
              <p className="text-xs text-white/70">Total Units</p>
              <p className="mt-1 text-2xl font-semibold">{summary.totalUnits}</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-3">
              <p className="text-xs text-white/70">Estimated Income</p>
              <p className="mt-1 text-2xl font-semibold">{formatPhp(summary.estimatedIncome)}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Loading properties...
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Property Directory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Search property or address..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="Dorm">Dorm</SelectItem>
                    <SelectItem value="Condo">Condo</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Airbnb">Airbnb</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                    <SelectItem value="Vacant">Vacant</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredProperties.length > 0 ? (
                <div className="space-y-3">
                  {filteredProperties.map((property) => {
                    const occupancy = getOccupancy(property.units);
                    return (
                      <div
                        key={property.id}
                        onClick={() => navigate(`/properties/${property.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate(`/properties/${property.id}`);
                          }
                        }}
                        className="group w-full rounded-xl border bg-card p-3 text-left transition hover:border-accent/50 hover:shadow-sm cursor-pointer"
                      >
                        <div className="grid gap-4 md:grid-cols-[240px_1fr_auto] md:items-start">
                          <div className="relative h-32 w-full overflow-hidden rounded-lg">
                            <img
                              src={property.image || FALLBACK_PROPERTY_IMAGE}
                              alt={property.name}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                            <Badge className={`absolute left-2 top-2 ${getStatusTagClass(property.statusTag)}`}>
                              {property.statusTag}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-semibold line-clamp-1">{property.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="line-clamp-1">{property.address}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <Badge variant="secondary">{property.type}</Badge>
                              <Badge variant="outline">{property.units.length} units</Badge>
                              <Badge className={getOccupancyBadgeClass(occupancy)}>{occupancy}</Badge>
                            </div>
                            {property.units.length > 0 ? (
                              <p className="text-xs text-muted-foreground">
                                Starting rent:{" "}
                                <span className="font-medium text-foreground">
                                  {formatPhp(Math.min(...property.units.map((u) => u.monthlyRent)))}
                                </span>
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground">No units yet</p>
                            )}
                          </div>

                          <div className="flex items-start justify-end gap-2 pt-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => e.stopPropagation()}
                                  disabled={isDeleting}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownMenuItem onClick={() => openEditPropertyName(property)} disabled={isDeleting}>
                                  <Pencil className="h-4 w-4" />
                                  Edit name
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => void handleDeleteProperty(property)}
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <div className="hidden md:flex md:items-center">
                              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No properties match your filters</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search, type, or status filter.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      setTypeFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add Property</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Property Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dorm">Dorm</SelectItem>
                      <SelectItem value="Condo">Condo</SelectItem>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Airbnb">Airbnb</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Tag</Label>
                  <Select
                    value={formData.statusTag}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, statusTag: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pre-selling">Pre-selling</SelectItem>
                      <SelectItem value="RFO">RFO</SelectItem>
                      <SelectItem value="Under Construction">Under Construction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={() => void handleSaveProperty()} disabled={!formData.name || !formData.address || isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Property
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditNameDialogOpen} onOpenChange={setIsEditNameDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Property Name</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Property Name</Label>
                <Input
                  value={editPropertyName}
                  onChange={(e) => setEditPropertyName(e.target.value)}
                  placeholder="e.g. Rizadа Apartments"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditNameDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={() => void handleSavePropertyName()} disabled={!editPropertyName.trim() || isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Index;
