export interface Property {
  id: string;
  name: string;
  developer: string;
  location: string;
  region: "Luzon" | "Visayas" | "Mindanao";
  city: string;
  price: number;
  pricePerSqm: number;
  floorArea: number;
  bedrooms: number;
  bathrooms: number;
  type: "Condo" | "House & Lot" | "Townhouse";
  status: "Pre-selling" | "RFO" | "Under Construction";
  image: string;
  description: string;
  amenities: string[];
  mapCoords: { lat: number; lng: number };
}

export const properties: Property[] = [
  {
    id: "cebu-condo-1",
    name: "Azure Residences Cebu",
    developer: "Ayala Land Premier",
    location: "Cebu Business Park, Cebu City",
    region: "Visayas",
    city: "Cebu City",
    price: 8500000,
    pricePerSqm: 185000,
    floorArea: 46,
    bedrooms: 1,
    bathrooms: 1,
    type: "Condo",
    status: "Pre-selling",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
    description: "Experience elevated living at Azure Residences, a premier condominium development in the heart of Cebu Business Park. Enjoy breathtaking city views and world-class amenities.",
    amenities: ["Swimming Pool", "Gym", "Sky Lounge", "Parking", "24/7 Security"],
    mapCoords: { lat: 10.3157, lng: 123.8854 }
  },
  {
    id: "davao-house-1",
    name: "Woodlands Heights",
    developer: "Damosa Land",
    location: "Lanang, Davao City",
    region: "Mindanao",
    city: "Davao City",
    price: 12500000,
    pricePerSqm: 65000,
    floorArea: 120,
    bedrooms: 3,
    bathrooms: 2,
    type: "House & Lot",
    status: "RFO",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    description: "Nestled in the prestigious Lanang area, Woodlands Heights offers spacious modern homes perfect for growing families. Enjoy the cool Davao breeze and lush surroundings.",
    amenities: ["Clubhouse", "Basketball Court", "Playground", "Gated Community", "CCTV"],
    mapCoords: { lat: 7.1074, lng: 125.6351 }
  },
  {
    id: "manila-condo-1",
    name: "The Seasons Residences",
    developer: "Federal Land",
    location: "BGC, Taguig City",
    region: "Luzon",
    city: "Taguig",
    price: 15800000,
    pricePerSqm: 280000,
    floorArea: 56,
    bedrooms: 2,
    bathrooms: 2,
    type: "Condo",
    status: "Under Construction",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
    description: "Japan-inspired luxury living in the heart of BGC. The Seasons Residences brings the art of Japanese hospitality and design to the Philippine skyline.",
    amenities: ["Infinity Pool", "Japanese Garden", "Spa", "Co-working Space", "Concierge"],
    mapCoords: { lat: 14.5547, lng: 121.0509 }
  },
  {
    id: "iloilo-townhouse-1",
    name: "Savannah Grove",
    developer: "Megaworld",
    location: "Iloilo Business Park",
    region: "Visayas",
    city: "Iloilo City",
    price: 4200000,
    pricePerSqm: 52000,
    floorArea: 80,
    bedrooms: 2,
    bathrooms: 2,
    type: "Townhouse",
    status: "RFO",
    image: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&h=600&fit=crop",
    description: "Modern townhouse living in the rapidly growing Iloilo Business Park. Perfect for young professionals and small families looking for their first home.",
    amenities: ["Community Pool", "Parks", "Commercial Strip", "Jogging Path"],
    mapCoords: { lat: 10.7202, lng: 122.5621 }
  },
  {
    id: "clark-house-1",
    name: "Versailles Estate",
    developer: "Filinvest",
    location: "Clark Green City, Pampanga",
    region: "Luzon",
    city: "Clark",
    price: 9800000,
    pricePerSqm: 58000,
    floorArea: 150,
    bedrooms: 4,
    bathrooms: 3,
    type: "House & Lot",
    status: "Pre-selling",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    description: "European-inspired homes in the thriving Clark Green City. Enjoy spacious living with premium finishes and excellent investment potential.",
    amenities: ["Golf Course", "Clubhouse", "Tennis Court", "Function Hall", "Eco Park"],
    mapCoords: { lat: 15.1850, lng: 120.5483 }
  },
  {
    id: "cagayan-condo-1",
    name: "One Centrio Tower",
    developer: "Robinsons Land",
    location: "CDO Downtown, Cagayan de Oro",
    region: "Mindanao",
    city: "Cagayan de Oro",
    price: 5200000,
    pricePerSqm: 130000,
    floorArea: 40,
    bedrooms: 1,
    bathrooms: 1,
    type: "Condo",
    status: "RFO",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    description: "Strategically located above Robinsons Cybergate Mall, One Centrio offers convenience and modern living in the heart of CDO's business district.",
    amenities: ["Mall Access", "Rooftop Pool", "Function Room", "Lobby Lounge"],
    mapCoords: { lat: 8.4542, lng: 124.6319 }
  },
  {
    id: "makati-condo-1",
    name: "Park Central Towers",
    developer: "SMDC",
    location: "Makati CBD",
    region: "Luzon",
    city: "Makati",
    price: 22500000,
    pricePerSqm: 320000,
    floorArea: 70,
    bedrooms: 2,
    bathrooms: 2,
    type: "Condo",
    status: "RFO",
    image: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&h=600&fit=crop",
    description: "Ultra-premium living in the heart of Makati's financial district. Park Central Towers redefines luxury with its exclusive amenities and prime location.",
    amenities: ["Sky Garden", "Lap Pool", "Private Theater", "Wine Cellar", "Valet Parking"],
    mapCoords: { lat: 14.5574, lng: 121.0233 }
  },
  {
    id: "bacolod-house-1",
    name: "Capitol Hills",
    developer: "Vista Land",
    location: "Capitol Area, Bacolod City",
    region: "Visayas",
    city: "Bacolod",
    price: 6800000,
    pricePerSqm: 45000,
    floorArea: 110,
    bedrooms: 3,
    bathrooms: 2,
    type: "House & Lot",
    status: "Pre-selling",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    description: "Experience the charm of Bacolod living at Capitol Hills. Spacious homes designed for comfort with easy access to schools, malls, and the city center.",
    amenities: ["Covered Court", "Playground", "Landscaped Gardens", "Guard House"],
    mapCoords: { lat: 10.6840, lng: 122.9563 }
  }
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateMonthlyPayment = (
  principal: number,
  annualInterestRate: number,
  months: number
): number => {
  const monthlyRate = annualInterestRate / 100 / 12;
  if (monthlyRate === 0) {
    return principal / months;
  }
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
  return payment;
};

export const calculateRequiredIncome = (monthlyPayment: number): number => {
  return monthlyPayment / 0.35;
};
