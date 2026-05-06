import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Property } from "@/data/properties";

const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  developer: z.string().min(1, "Developer name is required"),
  location: z.string().min(1, "Location is required"),
  region: z.enum(["Luzon", "Visayas", "Mindanao"]),
  city: z.string().min(1, "City is required"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  pricePerSqm: z.coerce.number().min(1, "Price per sqm must be greater than 0"),
  floorArea: z.coerce.number().min(1, "Floor area must be greater than 0"),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  type: z.enum(["Condo", "House & Lot", "Townhouse"]),
  status: z.enum(["Pre-selling", "RFO", "Under Construction"]),
  image: z.string().url("Please enter a valid image URL").min(1, "Image URL is required"),
  description: z.string().min(1, "Description is required"),
  amenities: z.string().min(1, "At least one amenity is required"),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: Property) => void;
  onCancel: () => void;
}

export function PropertyForm({ property, onSubmit, onCancel }: PropertyFormProps) {
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: property
      ? {
          name: property.name,
          developer: property.developer,
          location: property.location,
          region: property.region,
          city: property.city,
          price: property.price,
          pricePerSqm: property.pricePerSqm,
          floorArea: property.floorArea,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          type: property.type,
          status: property.status,
          image: property.image,
          description: property.description,
          amenities: property.amenities.join(", "),
          lat: property.mapCoords.lat,
          lng: property.mapCoords.lng,
        }
      : {
          name: "",
          developer: "",
          location: "",
          region: "Luzon",
          city: "",
          price: 0,
          pricePerSqm: 0,
          floorArea: 0,
          bedrooms: 0,
          bathrooms: 0,
          type: "Condo",
          status: "Pre-selling",
          image: "",
          description: "",
          amenities: "",
          lat: 14.5995,
          lng: 120.9842,
        },
  });

  const handleSubmit = (data: PropertyFormValues) => {
    const propertyData: Property = {
      id: property?.id || `property-${Date.now()}`,
      name: data.name,
      developer: data.developer,
      location: data.location,
      region: data.region,
      city: data.city,
      price: data.price,
      pricePerSqm: data.pricePerSqm,
      floorArea: data.floorArea,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      type: data.type,
      status: data.status,
      image: data.image,
      description: data.description,
      amenities: data.amenities.split(",").map((a) => a.trim()).filter(Boolean),
      mapCoords: {
        lat: data.lat,
        lng: data.lng,
      },
    };
    onSubmit(propertyData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Azure Residences Cebu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="developer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Developer *</FormLabel>
                <FormControl>
                  <Input placeholder="Ayala Land Premier" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location *</FormLabel>
              <FormControl>
                <Input placeholder="Cebu Business Park, Cebu City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Luzon">Luzon</SelectItem>
                    <SelectItem value="Visayas">Visayas</SelectItem>
                    <SelectItem value="Mindanao">Mindanao</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input placeholder="Cebu City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Condo">Condo</SelectItem>
                    <SelectItem value="House & Lot">House & Lot</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Pre-selling">Pre-selling</SelectItem>
                  <SelectItem value="RFO">RFO</SelectItem>
                  <SelectItem value="Under Construction">Under Construction</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (PHP) *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="8500000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pricePerSqm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per sqm (PHP) *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="185000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="floorArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Floor Area (sqm) *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="46" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bathrooms</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL *</FormLabel>
              <FormControl>
                <Input placeholder="https://images.unsplash.com/photo-..." {...field} />
              </FormControl>
              <FormDescription>
                Enter a valid image URL (e.g., from Unsplash)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Experience elevated living at Azure Residences..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amenities *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Swimming Pool, Gym, Sky Lounge, Parking"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Separate multiple amenities with commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="lat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="10.3418" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lng"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="123.8975" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{property ? "Update Property" : "Add Property"}</Button>
        </div>
      </form>
    </Form>
  );
}

