import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import configuration from './config/configuration';
import { TelemetryModule } from './telemetry/telemetry.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { MeterModule } from './meter/meter.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [
    // global config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // scheduling
    ScheduleModule.forRoot(),
    // feature modules
    DatabaseModule,
    TelemetryModule,
    VehicleModule,
    MeterModule,
    AnalyticsModule,
    HealthModule,
    AlertsModule,
  ],
})
export class AppModule {}
