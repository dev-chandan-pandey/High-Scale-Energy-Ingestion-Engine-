export const PERFORMANCE_QUERY = `
WITH vehicle_energy AS (
  SELECT
    SUM(kwh_delivered_dc) AS total_dc,
    AVG(battery_temp) AS avg_battery_temp
  FROM vehicle_readings_history
  WHERE vehicle_id = $1
    AND timestamp >= NOW() - INTERVAL '24 hours'
),
meter_energy AS (
  SELECT
    SUM(m.kwh_consumed_ac) AS total_ac
  FROM meter_readings_history m
  JOIN vehicle_meter_map vmm
    ON vmm.meter_id = m.meter_id
  WHERE vmm.vehicle_id = $1
    AND m.timestamp >= NOW() - INTERVAL '24 hours'
)
SELECT
  total_ac,
  total_dc,
  avg_battery_temp,
  CASE
    WHEN total_ac = 0 OR total_ac IS NULL THEN NULL
    ELSE total_dc / total_ac
  END AS efficiency_ratio
FROM vehicle_energy, meter_energy;
`;
