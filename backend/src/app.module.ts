import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './common/guards/auth.guard';
import { SupabaseModule } from './config/supabase/supabase.module';
import { ProfileModule } from './profile/profile.module';
import { PropertiesModule } from './properties/properties.module';
import { SystemModule } from './system/system.module';
import { TenantsModule } from './tenants/tenants.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    SupabaseModule,
    SystemModule,
    AuthModule,
    ProfileModule,
    PropertiesModule,
    TenantsModule,
    UtilitiesModule,
    InvoicesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
