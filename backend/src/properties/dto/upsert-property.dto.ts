import { PropertyType, StatusTag } from '../interfaces/property.interface';

export class UpsertPropertyDto {
  name?: string;
  type?: PropertyType;
  address?: string;
  imagePath?: string;
  statusTag?: StatusTag;
  notes?: string;
}
