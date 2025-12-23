import { MapPin, Bed, Bath, Maximize, Building2 } from "lucide-react";
import { Property, formatCurrency } from "@/data/properties";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface PropertyCardProps {
  property: Property;
  index: number;
}

const PropertyCard = ({ property, index }: PropertyCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/project/${property.id}`);
  };

  const statusColors = {
    "Pre-selling": "bg-accent text-accent-foreground",
    "RFO": "bg-success text-success-foreground",
    "Under Construction": "bg-primary text-primary-foreground",
  };

  return (
    <div
      onClick={handleClick}
      className="property-card cursor-pointer group"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        
        {/* Status Badge */}
        <Badge className={`absolute top-3 left-3 ${statusColors[property.status]}`}>
          {property.status}
        </Badge>

        {/* Price Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-primary-foreground font-bold text-xl">
            {formatCurrency(property.price)}
          </p>
          <p className="text-primary-foreground/80 text-sm">
            {formatCurrency(property.pricePerSqm)}/sqm
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-card-foreground mb-1 line-clamp-1">
          {property.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">{property.developer}</p>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{property.location}</span>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-3">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms} BR</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms} BA</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-4 w-4" />
            <span>{property.floorArea} sqm</span>
          </div>
        </div>

        {/* Type Badge */}
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            <Building2 className="h-3 w-3 mr-1" />
            {property.type}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {property.region}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
