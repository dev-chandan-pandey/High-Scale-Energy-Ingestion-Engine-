CREATE TABLE meter_readings_history (
  id BIGSERIAL PRIMARY KEY,
  meter_id TEXT NOT NULL,
  kwh_consumed_ac NUMERIC NOT NULL,
  voltage NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL
);

-- Optimized for time-range queries per meter
CREATE INDEX idx_meter_history_meter_time
  ON meter_readings_history (meter_id, timestamp);

CREATE TABLE vehicle_readings_history (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  soc INTEGER NOT NULL,
  kwh_delivered_dc NUMERIC NOT NULL,
  battery_temp NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL
);

-- Optimized for per-vehicle analytics
CREATE INDEX idx_vehicle_history_vehicle_time
  ON vehicle_readings_history (vehicle_id, timestamp);


CREATE TABLE vehicle_current_state (
  vehicle_id TEXT PRIMARY KEY,
  soc INTEGER,
  battery_temp NUMERIC,
  last_kwh_delivered_dc NUMERIC,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE meter_current_state (
  meter_id TEXT PRIMARY KEY,
  last_kwh_consumed_ac NUMERIC,
  voltage NUMERIC,
  updated_at TIMESTAMPTZ NOT NULL
);


CREATE TABLE vehicle_meter_map (
  vehicle_id TEXT PRIMARY KEY,
  meter_id TEXT NOT NULL
);
