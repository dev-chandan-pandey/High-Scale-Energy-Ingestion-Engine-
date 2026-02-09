import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'high-scale-energy-ingestion-engine',
      timestamp: new Date().toISOString(),
    };
  }
}
