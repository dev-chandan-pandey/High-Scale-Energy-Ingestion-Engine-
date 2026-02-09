import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.provider';
import { PERFORMANCE_QUERY } from './queries/performance.query';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(DATABASE_POOL)
    private readonly pool: Pool,
  ) {}

  async getPerformance(vehicleId: string) {
    const { rows } = await this.pool.query(PERFORMANCE_QUERY, [vehicleId]);

    if (!rows.length) {
      throw new NotFoundException('No analytics data found');
    }

    const result = rows[0];

    return {
      vehicleId,
      totalEnergyConsumedAc: Number(result.total_ac ?? 0),
      totalEnergyDeliveredDc: Number(result.total_dc ?? 0),
      efficiencyRatio: result.efficiency_ratio
        ? Number(result.efficiency_ratio)
        : null,
      averageBatteryTemperature: result.avg_battery_temp
        ? Number(result.avg_battery_temp)
        : null,
      window: '24h',
    };
  }
}
