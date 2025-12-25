import { useState, useMemo } from "react";
import { TrendingUp, Users, Building2 } from "lucide-react";
import propQuoteLogo from "@/assets/propqoute-logo.png";
import SearchFilters from "@/components/SearchFilters";
import PropertyCard from "@/components/PropertyCard";
import { properties, Property } from "@/data/properties";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={propQuoteLogo} alt="PropQoute Logo" className="h-20 w-auto" />
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span>{properties.length} Projects</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-accent" />
                <span>Agent Portal</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Find & Quote Properties <span className="text-gradient">Instantly</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Search projects, calculate monthly payments, and generate lead-capturing links for your clients.
          </p>
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
              <PropertyCard key={property.id} property={property} index={index} />
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
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>PropQuote CPQ — Built for Philippine Real Estate Agents</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
