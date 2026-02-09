CREATE TABLE efficiency_alerts (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  efficiency_ratio NUMERIC NOT NULL,
  "window"  TEXT NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_efficiency_alerts_vehicle_time
  ON efficiency_alerts (vehicle_id, triggered_at);
