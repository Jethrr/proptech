import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemService {
  health() {
    return { ok: true };
  }

  protected(userId: string) {
    return { message: 'Protected API reached.', userId };
  }
}
