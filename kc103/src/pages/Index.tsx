import { useEffect, useMemo, useState } from "react";
import { Building2, Loader2, MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { OccupancyStatus, RentalProperty, RentalUnit, formatPhp } from "@/data/rental";
import { ApiError, api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const PROPERTY_IMAGE_BUCKET = "property-images";
const FALLBACK_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&h=900&fit=crop";

const Index = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<RentalProperty[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProperty, setEditingProperty] = useState<RentalProperty | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingUnit, setEditingUnit] = useState<RentalUnit | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Apartment",
    address: "",
    imagePath: "",
    imagePreviewUrl: "",
    statusTag: "RFO",
    notes: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [unitForm, setUnitForm] = useState({
    label: "",
    occupantsCount: "",
    size: "Small",
    monthlyRent: "",
    status: "Vacant",
  });

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const response = await api.getProperties();
        setProperties(response.properties);
        setLoadError(null);
        if (response.properties.length > 0) setSelectedPropertyId(response.properties[0].id);
      } catch (error) {
        const isNetworkOrServer =
          error instanceof TypeError ||
          (error instanceof ApiError && error.status >= 500);

        if (isNetworkOrServer) {
          setLoadError("Backend unavailable. No data to show — start the API server.");
        } else {
          setLoadError(
            error instanceof ApiError
              ? `Failed to load properties: ${error.message}`
              : "Failed to load properties.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const handleAddProperty = () => {
    setEditingProperty(null);
    setImageFile(null);
    setFormData({
      name: "",
      type: "Apartment",
      address: "",
      imagePath: "",
      imagePreviewUrl: "",
      statusTag: "RFO",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditProperty = (property: RentalProperty) => {
    setEditingProperty(property);
    setImageFile(null);
    setFormData({
      name: property.name,
      type: property.type,
      address: property.address,
      imagePath: property.imagePath ?? "",
      imagePreviewUrl: property.image,
      statusTag: property.statusTag,
      notes: property.notes ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
      return;
    }
    setImageFile(file);
    const localPreview = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, imagePreviewUrl: localPreview }));
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setFormData((prev) => ({ ...prev, imagePath: "", imagePreviewUrl: "" }));
  };

  const uploadImageIfNeeded = async (propertyId: string, currentPath: string): Promise<string> => {
    if (!imageFile) return currentPath;
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("You must be signed in before uploading property images.");
    }
    const extension = imageFile.name.includes(".")
      ? imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
      : "jpg";
    const objectPath = `${user.id}/${propertyId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(PROPERTY_IMAGE_BUCKET).upload(objectPath, imageFile, {
      upsert: true,
      contentType: imageFile.type,
    });
    if (error) throw error;
    return objectPath;
  };

  const handleSaveProperty = async () => {
    setIsSaving(true);
    try {
      let saved: RentalProperty;
      const propertyId = editingProperty?.id ?? crypto.randomUUID();
      const imagePath = await uploadImageIfNeeded(propertyId, formData.imagePath);

      if (editingProperty) {
        const response = await api.updateProperty(editingProperty.id, {
          name: formData.name,
          type: formData.type as RentalProperty["type"],
          address: formData.address,
          imagePath,
          statusTag: formData.statusTag as RentalProperty["statusTag"],
          notes: formData.notes,
        });
        saved = response.property;
        setProperties((prev) => prev.map((p) => (p.id === editingProperty.id ? saved : p)));
      } else {
        const response = await api.createProperty({
          name: formData.name,
          type: formData.type as RentalProperty["type"],
          address: formData.address,
          imagePath,
          statusTag: formData.statusTag as RentalProperty["statusTag"],
          notes: formData.notes,
        });
        saved = response.property;
        setProperties((prev) => [saved, ...prev]);
        setSelectedPropertyId(saved.id);
      }

      setIsDialogOpen(false);
      setEditingProperty(null);
      toast({
        title: editingProperty ? "Property updated" : "Property added",
        description: `${saved.name} saved successfully.`,
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not connect to server.";
      toast({
        title: "Save failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    try {
      await api.deleteProperty(propertyId);
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      if (selectedPropertyId === propertyId) {
        setSelectedPropertyId((prev) => {
          const remaining = properties.filter((p) => p.id !== propertyId);
          return remaining[0]?.id ?? null;
        });
      }
      toast({
        title: "Property deleted",
        description: property ? `${property.name} has been deleted.` : "Property deleted.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof ApiError ? error.message : "Could not connect to server.",
        variant: "destructive",
      });
    }
  };

  function getOccupancy(units: RentalUnit[]): OccupancyStatus {
    const occupied = units.filter((u) => u.status === "Occupied").length;
    if (occupied === 0) return "Vacant";
    if (occupied === units.length) return "Occupied";
    return "Maintenance";
  }

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

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId) ?? null;

  const getStatusTagClass = (tag: RentalProperty["statusTag"]) => {
    if (tag === "RFO") return "bg-emerald-500 text-white";
    if (tag === "Pre-selling") return "bg-sky-500 text-white";
    return "bg-slate-700 text-white";
  };

  const openAddUnit = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setEditingUnit(null);
    setUnitForm({ label: "", occupantsCount: "", size: "Small", monthlyRent: "", status: "Vacant" });
    setIsUnitDialogOpen(true);
  };

  const openEditUnit = (propertyId: string, unit: RentalUnit) => {
    setSelectedPropertyId(propertyId);
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
    if (!selectedPropertyId) return;
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
        ? await api.updateUnit(selectedPropertyId, editingUnit.id, nextUnit)
        : await api.createUnit(selectedPropertyId, nextUnit);

      setProperties((prev) =>
        prev.map((p) => (p.id === selectedPropertyId ? response.property : p)),
      );
      setIsUnitDialogOpen(false);
      setEditingUnit(null);
      toast({
        title: editingUnit ? "Unit updated" : "Unit added",
        description: editingUnit
          ? `${nextUnit.label} has been updated.`
          : `${nextUnit.label} added to property units.`,
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

  const handleDeleteUnit = async (propertyId: string, unit: RentalUnit) => {
    try {
      const response = await api.deleteUnit(propertyId, unit.id);
      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? response.property : p)),
      );
      toast({ title: "Unit deleted", description: `${unit.label} removed from property.` });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof ApiError ? error.message : "Could not connect to server.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Properties Management</h1>
            <p className="text-muted-foreground">
              Properties and units are separate so each unit can have different rent and area.
            </p>
          </div>
          <Button onClick={handleAddProperty} className="gap-2 w-fit">
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>

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
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="property-card cursor-pointer group overflow-hidden"
                onClick={() => setSelectedPropertyId(property.id)}
              >
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={property.image || FALLBACK_PROPERTY_IMAGE}
                    alt={property.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                  <Badge className={`absolute top-3 left-3 ${getStatusTagClass(property.statusTag)}`}>
                    {property.statusTag}
                  </Badge>
                  <div className="absolute bottom-3 left-3 right-3">
                    {property.units.length > 0 ? (
                      <>
                        <p className="text-white font-bold text-xl">
                          {formatPhp(Math.min(...property.units.map((u) => u.monthlyRent)))}
                        </p>
                        <p className="text-white/80 text-sm">Starting monthly rent</p>
                      </>
                    ) : (
                      <p className="text-white/80 text-sm">No units yet</p>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{property.type}</p>
                  <div className="flex items-center gap-1 text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm line-clamp-1">{property.address}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{property.units.length} units</span>
                    </div>
                    <Badge variant="outline">{getOccupancy(property.units)}</Badge>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEditProperty(property); }}>
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); openAddUnit(property.id); }}>
                      <Plus className="h-4 w-4 mr-1" /> Add Unit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); void handleDeleteProperty(property.id); }}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No properties yet</h3>
              <p className="text-muted-foreground mb-4">Add your first property to get started.</p>
              <Button onClick={handleAddProperty} className="gap-2">
                <Plus className="h-4 w-4" /> Add Property
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Units List {selectedProperty ? `- ${selectedProperty.name}` : ""}</CardTitle>
            {selectedProperty ? (
              <Button size="sm" onClick={() => openAddUnit(selectedProperty.id)} className="gap-1">
                <Plus className="h-4 w-4" /> Add Unit
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            {!selectedProperty || selectedProperty.units.length === 0 ? (
              <p className="text-sm text-muted-foreground">Select a property to manage its units.</p>
            ) : (
              <div className="space-y-3">
                {selectedProperty.units.map((unit) => (
                  <div key={unit.id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{unit.label}</p>
                      <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" /> {unit.occupantsCount} occupants
                        </span>
                        <span className="inline-flex items-center gap-1">
                          Size: {unit.size}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPhp(unit.monthlyRent)}</p>
                      <Badge variant="secondary">{unit.status}</Badge>
                      <div className="mt-2 flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditUnit(selectedProperty.id, unit)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => void handleDeleteUnit(selectedProperty.id, unit)}
                        >
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingProperty ? "Edit Property" : "Add Property"}</DialogTitle>
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
              <div className="grid gap-2">
                <Label>Property Image</Label>
                <Input type="file" accept="image/*" onChange={handleSelectImage} />
                {formData.imagePreviewUrl ? (
                  <div className="rounded-md border p-2">
                    <img
                      src={formData.imagePreviewUrl}
                      alt="Property preview"
                      className="h-40 w-full rounded object-cover"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={clearImageSelection}>
                        Remove image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Upload to Supabase Storage. Image path will be saved in the property record.
                  </p>
                )}
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
                <Button
                  onClick={() => void handleSaveProperty()}
                  disabled={!formData.name || !formData.address || isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Property
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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

export default Index;
