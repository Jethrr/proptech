import { useParams } from "react-router-dom";
import { Bed, Bath, Maximize, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { properties, formatCurrency } from "@/data/properties";
import FinancialCalculator from "@/components/FinancialCalculator";
import PropertyMap from "@/components/PropertyMap";
import ShareButton from "@/components/ShareButton";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();

  const property = properties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    "Pre-selling": "bg-accent text-accent-foreground",
    "RFO": "bg-success text-success-foreground",
    "Under Construction": "bg-primary text-primary-foreground",
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto p-6">
        <div className="flex justify-end mb-4">
          <ShareButton property={property} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative rounded-xl overflow-hidden animate-fade-in">
              <img
                src={property.image}
                alt={property.name}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <Badge className={statusColors[property.status]}>{property.status}</Badge>
                <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground mt-2">
                  {property.name}
                </h1>
                <p className="text-primary-foreground/80">{property.developer}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card rounded-xl p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <Bed className="h-5 w-5 mx-auto mb-1 text-accent" />
                  <p className="font-semibold">{property.bedrooms} BR</p>
                  <p className="text-xs text-muted-foreground">Bedrooms</p>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <Bath className="h-5 w-5 mx-auto mb-1 text-accent" />
                  <p className="font-semibold">{property.bathrooms} BA</p>
                  <p className="text-xs text-muted-foreground">Bathrooms</p>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <Maximize className="h-5 w-5 mx-auto mb-1 text-accent" />
                  <p className="font-semibold">{property.floorArea} sqm</p>
                  <p className="text-xs text-muted-foreground">Floor Area</p>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <Building2 className="h-5 w-5 mx-auto mb-1 text-accent" />
                  <p className="font-semibold">{property.type}</p>
                  <p className="text-xs text-muted-foreground">Type</p>
                </div>
              </div>
            </div>

            {/* Price Card */}
            <div className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Contract Price</p>
                  <p className="text-3xl font-bold text-gradient">{formatCurrency(property.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Price per sqm</p>
                  <p className="text-xl font-semibold">{formatCurrency(property.pricePerSqm)}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <h3 className="font-semibold text-lg mb-3">About This Property</h3>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>

              {/* Amenities */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="mt-6 flex items-start gap-2">
                <MapPin className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium">{property.location}</p>
                  <p className="text-sm text-muted-foreground">{property.region}</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <PropertyMap
              lat={property.mapCoords.lat}
              lng={property.mapCoords.lng}
              location={property.location}
            />
          </div>

          {/* Right Column - Calculator */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <FinancialCalculator totalPrice={property.price} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;
