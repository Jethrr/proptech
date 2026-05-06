export type PropertyType = 'Dorm' | 'Condo' | 'Apartment' | 'Airbnb' | 'House';
export type StatusTag = 'Pre-selling' | 'RFO' | 'Under Construction';
export type UnitSize = 'Small' | 'Medium' | 'Big';
export type OccupancyStatus = 'Occupied' | 'Vacant' | 'Maintenance';

export interface RentalUnit {
  id: string;
  label: string;
  occupantsCount: number;
  size: UnitSize;
  monthlyRent: number;
  status: OccupancyStatus;
}

export interface RentalProperty {
  id: string;
  name: string;
  type: PropertyType;
  address: string;
  image: string;
  imagePath: string;
  statusTag: StatusTag;
  units: RentalUnit[];
  notes?: string;
}
