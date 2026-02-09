import { MeterTelemetryDto } from './meter-telemetry.dto';
import { VehicleTelemetryDto } from './vehicle-telemetry.dto';

export type TelemetryPayload =
  | MeterTelemetryDto
  | VehicleTelemetryDto;
