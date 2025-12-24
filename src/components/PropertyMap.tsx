import { MapPin } from "lucide-react";

interface PropertyMapProps {
  lat: number;
  lng: number;
  location: string;
  isBlurred?: boolean;
}

const PropertyMap = ({ lat, lng, location, isBlurred = false }: PropertyMapProps) => {
  // Using Google Maps embed
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sph!4v1699000000000!5m2!1sen!2sph`;

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-accent" />
          <h3 className="font-semibold">Location</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{location}</p>
      </div>
      <div className={`relative ${isBlurred ? "blur-content" : ""}`}>
        <iframe
          src={mapUrl}
          width="100%"
          height="300"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map showing ${location}`}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default PropertyMap;
