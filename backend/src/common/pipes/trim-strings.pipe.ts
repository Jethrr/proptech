import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimStringsPipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata) {
    if (!value || typeof value !== 'object') return value;
    const entries = Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      typeof item === 'string' ? item.trim() : item,
    ]);
    return Object.fromEntries(entries);
  }
}
