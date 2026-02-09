import { Module } from '@nestjs/common';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { MeterIngestion } from './ingestion/meter.ingestion';
import { VehicleIngestion } from './ingestion/vehicle.ingestion';

@Module({
  controllers: [TelemetryController],
  providers: [
    TelemetryService,
    MeterIngestion,
    VehicleIngestion,
  ],
})
export class TelemetryModule {}
