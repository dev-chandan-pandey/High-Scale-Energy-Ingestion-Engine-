export interface IngestionStrategy<T> {
  ingest(payload: T): Promise<void>;
}
