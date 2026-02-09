import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AlertsService } from './alerts.service';

@Injectable()
export class AlertsScheduler {
  constructor(private readonly alertsService: AlertsService) {}

  // Runs every 10 minutes
  @Cron('*/10 * * * *')
  async handleEfficiencyCheck() {
    await this.alertsService.checkEfficiencyAlerts();
  }
}
