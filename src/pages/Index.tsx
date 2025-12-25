import { useState, useMemo, useEffect } from "react";
import { Building2, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import SearchFilters from "@/components/SearchFilters";
import PropertyCard from "@/components/PropertyCard";
import { PropertyForm } from "@/components/PropertyForm";
import { properties as defaultProperties, Property } from "@/data/properties";
import { savePropertiesToStorage, loadPropertiesFromStorage } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>(defaultProperties);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);

  // Load properties from localStorage on mount
  useEffect(() => {
    const storedProperties = loadPropertiesFromStorage();
    if (storedProperties && storedProperties.length > 0) {
      setProperties(storedProperties);
    } else {
      // Initialize with default properties if no stored data
      savePropertiesToStorage(defaultProperties);
    }
  }, []);

  const handleAddProperty = () => {
    setEditingProperty(undefined);
    setIsDialogOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsDialogOpen(true);
  };

  const handleSaveProperty = (propertyData: Property) => {
    let updatedProperties: Property[];
    
    if (editingProperty) {
      // Update existing property
      updatedProperties = properties.map((p) =>
        p.id === editingProperty.id ? propertyData : p
      );
      toast({
        title: "Property updated",
        description: `${propertyData.name} has been updated successfully.`,
      });
    } else {
      // Add new property
      updatedProperties = [...properties, propertyData];
      toast({
        title: "Property added",
        description: `${propertyData.name} has been added successfully.`,
      });
    }

    setProperties(updatedProperties);
    savePropertiesToStorage(updatedProperties);
    setIsDialogOpen(false);
    setEditingProperty(undefined);
  };

  const handleDeleteProperty = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    const updatedProperties = properties.filter((p) => p.id !== propertyId);
    setProperties(updatedProperties);
    savePropertiesToStorage(updatedProperties);
    toast({
      title: "Property deleted",
      description: property ? `${property.name} has been deleted.` : "Property deleted.",
    });
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((property: Property) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Region filter
      const matchesRegion =
        selectedRegion === "all" || property.region === selectedRegion;

      // Price range filter
      let matchesPrice = true;
      if (selectedPriceRange !== "all") {
        const [min, max] = selectedPriceRange.split("-").map(Number);
        matchesPrice = property.price >= min && property.price <= max;
      }

      // Type filter
      const matchesType = selectedType === "all" || property.type === selectedType;

      return matchesSearch && matchesRegion && matchesPrice && matchesType;
    });
  }, [searchQuery, selectedRegion, selectedPriceRange, selectedType]);

  return (
    <div className="flex flex-col h-full">
      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Manage & Quote Properties <span className="text-gradient">Instantly</span>
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Search projects, calculate monthly payments, and generate lead-capturing links for your clients.
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <Button onClick={handleAddProperty} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Property
              </Button>
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <SearchFilters
          onSearchChange={setSearchQuery}
          onRegionChange={setSelectedRegion}
          onPriceRangeChange={setSelectedPriceRange}
          onTypeChange={setSelectedType}
        />

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredProperties.length}</span>{" "}
            {filteredProperties.length === 1 ? "project" : "projects"}
          </p>
        </div>

        {/* Property Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property, index) => (
              <div key={property.id} className="relative group">
                <PropertyCard property={property} index={index} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProperty(property);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProperty(property.id);
                        }}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No projects found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to find more properties.
            </p>
          </div>
        )}

        {/* Add/Edit Property Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProperty ? "Edit Property" : "Add New Property"}
              </DialogTitle>
              <DialogDescription>
                {editingProperty
                  ? "Update the property information below."
                  : "Fill in the details to add a new property to the database."}
              </DialogDescription>
            </DialogHeader>
            <PropertyForm
              property={editingProperty}
              onSubmit={handleSaveProperty}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingProperty(undefined);
              }}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Index;
