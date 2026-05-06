import { OccupancyStatus, UnitSize } from '../interfaces/property.interface';

export class CreateUnitDto {
  id?: string;
  label?: string;
  occupantsCount?: number;
  size?: UnitSize;
  monthlyRent?: number;
  status?: OccupancyStatus;
}
