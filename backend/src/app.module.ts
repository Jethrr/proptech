import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './common/guards/auth.guard';
import { SupabaseModule } from './config/supabase/supabase.module';
import { ProfileModule } from './profile/profile.module';
import { PropertiesModule } from './properties/properties.module';
import { SystemModule } from './system/system.module';

@Module({
  imports: [SupabaseModule, SystemModule, AuthModule, ProfileModule, PropertiesModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
