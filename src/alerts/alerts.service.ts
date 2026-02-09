import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.provider';
import { EFFICIENCY_ALERT_QUERY } from './queries/efficiency-alert.query';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @Inject(DATABASE_POOL)
    private readonly pool: Pool,
  ) {}

  async checkEfficiencyAlerts(): Promise<void> {
    const { rows } = await this.pool.query(EFFICIENCY_ALERT_QUERY);

    for (const row of rows) {
      await this.pool.query(
        `
        INSERT INTO efficiency_alerts
          (vehicle_id, efficiency_ratio, window)
        VALUES ($1, $2, $3)
        `,
        [row.vehicle_id, row.efficiency_ratio, '24h'],
      );

      this.logger.warn(
        `⚠️ Efficiency alert for vehicle ${row.vehicle_id}: ${row.efficiency_ratio}`,
      );
    }
  }
}
