import { useState } from "react";
import { Search, MapPin, DollarSign, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  onSearchChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onPriceRangeChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

const SearchFilters = ({
  onSearchChange,
  onRegionChange,
  onPriceRangeChange,
  onTypeChange,
}: SearchFiltersProps) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearchChange(e.target.value);
  };

  return (
    <div className="glass-card rounded-xl p-4 mb-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10 bg-background/50"
          />
        </div>

        {/* Region Filter */}
        <Select onValueChange={onRegionChange}>
          <SelectTrigger className="bg-background/50">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="Luzon">Luzon</SelectItem>
            <SelectItem value="Visayas">Visayas</SelectItem>
            <SelectItem value="Mindanao">Mindanao</SelectItem>
          </SelectContent>
        </Select>

        {/* Price Range Filter */}
        <Select onValueChange={onPriceRangeChange}>
          <SelectTrigger className="bg-background/50">
            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="0-5000000">Under ₱5M</SelectItem>
            <SelectItem value="5000000-10000000">₱5M - ₱10M</SelectItem>
            <SelectItem value="10000000-20000000">₱10M - ₱20M</SelectItem>
            <SelectItem value="20000000-999999999">Above ₱20M</SelectItem>
          </SelectContent>
        </Select>

        {/* Property Type Filter */}
        <Select onValueChange={onTypeChange}>
          <SelectTrigger className="bg-background/50">
            <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Condo">Condo</SelectItem>
            <SelectItem value="House & Lot">House & Lot</SelectItem>
            <SelectItem value="Townhouse">Townhouse</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchFilters;
