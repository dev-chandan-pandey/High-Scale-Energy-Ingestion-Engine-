import { BadRequestException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MeterTelemetryDto } from './dto/meter-telemetry.dto';
import { VehicleTelemetryDto } from './dto/vehicle-telemetry.dto';
import { MeterIngestion } from './ingestion/meter.ingestion';
import { VehicleIngestion } from './ingestion/vehicle.ingestion';

@Injectable()
export class TelemetryService {
  constructor(
    private readonly meterIngestion: MeterIngestion,
    private readonly vehicleIngestion: VehicleIngestion,
  ) {}

  async ingest(payload: unknown) {
    if ((payload as any)?.meterId) {
      const dto = plainToInstance(MeterTelemetryDto, payload);
      const errors = await validate(dto);
      if (errors.length) throw new BadRequestException(errors);

      await this.meterIngestion.ingest(dto);
      return { status: 'meter_ingested' };
    }

    if ((payload as any)?.vehicleId) {
      const dto = plainToInstance(VehicleTelemetryDto, payload);
      const errors = await validate(dto);
      if (errors.length) throw new BadRequestException(errors);

      await this.vehicleIngestion.ingest(dto);
      return { status: 'vehicle_ingested' };
    }

    throw new BadRequestException('Unknown telemetry payload');
  }
}
