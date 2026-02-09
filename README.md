
## Overview

This project implements the **core ingestion and analytics layer** for a high-scale fleet energy platform managing **10,000+ smart meters and EVs**, each reporting telemetry every minute.

The system ingests two independent telemetry streams, correlates them, and exposes fast analytical insights into **energy efficiency and vehicle performance**, while remaining scalable to **tens of millions of records per day**.

---

## Problem Statement

Fleet operators receive energy data from:

### Smart Meter (Grid Side)

* Measures **AC energy consumed from the grid**
* Represents what the fleet owner is billed for
* Field: `kwhConsumedAc`

### EV / Charger (Vehicle Side)

* Converts AC → DC
* Reports **DC energy actually stored in the battery**
* Field: `kwhDeliveredDc`
* Also reports battery **State of Charge (SoC)** and temperature

### Power Loss Reality

AC energy consumed is always higher than DC energy delivered due to conversion losses.
A sustained drop in efficiency (e.g. below **85%**) indicates:

* Hardware faults
* Energy leakage
* Charger degradation

---

## Architecture Overview

### Core Design Principle: **Data Temperature Separation**

| Layer          | Purpose                      | Strategy           |
| -------------- | ---------------------------- | ------------------ |
| **Hot Store**  | Current dashboard state      | UPSERT             |
| **Cold Store** | Historical analytics & audit | Append-only INSERT |

This prevents expensive queries like *“latest row per vehicle”* over billions of records.

---

## High-Level Flow

```
Smart Meter / EV
     ↓
POST /v1/telemetry
     ↓
Polymorphic ingestion
     ↓
┌───────────────┐     ┌─────────────────┐
│ Cold Store    │     │ Hot Store        │
│ (History)     │     │ (Current State) │
│ INSERT only   │     │ UPSERT           │
└───────────────┘     └─────────────────┘
           ↓
GET /v1/analytics/performance/:vehicleId
```

---

## Technology Stack

* **Node.js / TypeScript**
* **NestJS**
* **PostgreSQL**
* **Docker / Docker Compose**
* **pg (connection pooling)**

No ORM is used for analytics-critical paths to ensure **predictable performance**.

---

## Database Schema

### Cold (Historical) Tables – Append-Only

#### `meter_readings_history`

Stores every AC meter reading.

* Indexed by `(meter_id, timestamp)`
* Optimized for time-range analytics

#### `vehicle_readings_history`

Stores every EV telemetry heartbeat.

* Indexed by `(vehicle_id, timestamp)`
* Supports fast per-vehicle aggregation

---

### Hot (Operational) Tables – Current State

#### `vehicle_current_state`

One row per vehicle:

* Latest SoC
* Latest battery temperature
* Latest DC energy reading

#### `meter_current_state`

One row per meter:

* Latest AC energy
* Latest voltage

These tables enable **O(1) dashboard reads** without scanning history.

---

### Correlation Table

#### `vehicle_meter_map`

Explicit mapping between vehicles and meters.

This reflects real fleet configuration systems and avoids ambiguous joins.

---

## Ingestion API

### Endpoint

```
POST /v1/telemetry
```

### Meter Payload

```json
{
  "meterId": "meter-1",
  "kwhConsumedAc": 4.5,
  "voltage": 230,
  "timestamp": "2026-02-08T10:00:00Z"
}
```

### Vehicle Payload

```json
{
  "vehicleId": "vehicle-1",
  "soc": 70,
  "kwhDeliveredDc": 3.9,
  "batteryTemp": 32,
  "timestamp": "2026-02-08T10:00:00Z"
}
```

### Ingestion Behavior

* Payload type is detected polymorphically
* DTO validation rejects malformed data
* **Cold path:** append-only INSERT into history tables
* **Hot path:** UPSERT into current state tables

---

## Analytics API

### Endpoint

```
GET /v1/analytics/performance/:vehicleId
```

### Metrics Returned (Last 24h)

* Total AC energy consumed
* Total DC energy delivered
* Efficiency ratio (`DC / AC`)
* Average battery temperature

### Performance Guarantees

* Time-window bounded queries
* Index-only scans
* No `ORDER BY`, no `LIMIT` scans
* No full table scans even at high data volume

---

## Scalability Considerations

### Ingestion Volume

* 10,000 devices
* 2 telemetry streams
* 1 message per minute

➡️ **~28.8 million records per day**

This system handles the load by:

* Append-only writes
* Connection pooling
* Avoiding transactional coupling between streams
* Separating hot vs cold access paths

---

## Running the Project

### Start PostgreSQL

```bash
docker compose up -d
```

### Start API

```bash
npm install
npm run start:dev
```

### Health Check

```bash
curl http://localhost:3000/health
```

---

## Why This Design Works

* Scales linearly with data volume
* Avoids read amplification
* Mirrors real-world telemetry systems
* Easy to extend with:

  * Alerting (efficiency < 85%)
  * Partitioned history tables
  * Materialized views
  * Streaming consumers (Kafka)

---

## Future Improvements

* Daily partitioning of history tables
* Efficiency anomaly alerts
* Backpressure handling for ingestion spikes
* Read replicas for analytics
* Pre-aggregated hourly rollups

---

## Conclusion

This project demonstrates a **production-ready ingestion and analytics core** capable of handling high-frequency telemetry while delivering fast, meaningful insights to fleet operators.

---




