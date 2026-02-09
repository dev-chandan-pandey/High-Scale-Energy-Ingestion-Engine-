import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../../database/database.provider';
import { MeterTelemetryDto } from '../dto/meter-telemetry.dto';
import { IngestionStrategy } from './ingestion.strategy';

@Injectable()
export class MeterIngestion
  implements IngestionStrategy<MeterTelemetryDto>
{
  constructor(
    @Inject(DATABASE_POOL)
    private readonly pool: Pool,
  ) {}

  async ingest(dto: MeterTelemetryDto): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `
        INSERT INTO meter_readings_history
          (meter_id, kwh_consumed_ac, voltage, timestamp)
        VALUES ($1, $2, $3, $4)
        `,
        [
          dto.meterId,
          dto.kwhConsumedAc,
          dto.voltage,
          dto.timestamp,
        ],
      );

      await client.query(
        `
        INSERT INTO meter_current_state
          (meter_id, last_kwh_consumed_ac, voltage, updated_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (meter_id)
        DO UPDATE SET
          last_kwh_consumed_ac = EXCLUDED.last_kwh_consumed_ac,
          voltage = EXCLUDED.voltage,
          updated_at = EXCLUDED.updated_at
        `,
        [
          dto.meterId,
          dto.kwhConsumedAc,
          dto.voltage,
          dto.timestamp,
        ],
      );
    } finally {
      client.release();
    }
  }
}
