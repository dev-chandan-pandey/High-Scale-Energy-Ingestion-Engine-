export const EFFICIENCY_ALERT_QUERY = `
WITH vehicle_efficiency AS (
  SELECT
    vmm.vehicle_id,
    SUM(vrh.kwh_delivered_dc) AS total_dc,
    SUM(mrh.kwh_consumed_ac) AS total_ac
  FROM vehicle_meter_map vmm
  JOIN vehicle_readings_history vrh
    ON vrh.vehicle_id = vmm.vehicle_id
  JOIN meter_readings_history mrh
    ON mrh.meter_id = vmm.meter_id
  WHERE vrh.timestamp >= NOW() - INTERVAL '24 hours'
    AND mrh.timestamp >= NOW() - INTERVAL '24 hours'
  GROUP BY vmm.vehicle_id
)
SELECT
  vehicle_id,
  total_dc / NULLIF(total_ac, 0) AS efficiency_ratio
FROM vehicle_efficiency
WHERE total_ac IS NOT NULL
  AND (total_dc / total_ac) < 0.85;
`;
