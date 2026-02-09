import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../../database/database.provider';
import { VehicleTelemetryDto } from '../dto/vehicle-telemetry.dto';
import { IngestionStrategy } from './ingestion.strategy';

@Injectable()
export class VehicleIngestion
  implements IngestionStrategy<VehicleTelemetryDto>
{
  constructor(
    @Inject(DATABASE_POOL)
    private readonly pool: Pool,
  ) {}

  async ingest(dto: VehicleTelemetryDto): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `
        INSERT INTO vehicle_readings_history
          (vehicle_id, soc, kwh_delivered_dc, battery_temp, timestamp)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          dto.vehicleId,
          dto.soc,
          dto.kwhDeliveredDc,
          dto.batteryTemp,
          dto.timestamp,
        ],
      );

      await client.query(
        `
        INSERT INTO vehicle_current_state
          (vehicle_id, soc, battery_temp, last_kwh_delivered_dc, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (vehicle_id)
        DO UPDATE SET
          soc = EXCLUDED.soc,
          battery_temp = EXCLUDED.battery_temp,
          last_kwh_delivered_dc = EXCLUDED.last_kwh_delivered_dc,
          updated_at = EXCLUDED.updated_at
        `,
        [
          dto.vehicleId,
          dto.soc,
          dto.batteryTemp,
          dto.kwhDeliveredDc,
          dto.timestamp,
        ],
      );
    } finally {
      client.release();
    }
  }
}
