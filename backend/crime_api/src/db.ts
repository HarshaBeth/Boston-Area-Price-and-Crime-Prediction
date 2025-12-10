import "dotenv/config";
import { Pool, QueryResult, QueryResultRow } from "pg";

const connectionString = process.env.CRIME_DB_URL;

if (!connectionString) {
  throw new Error("CRIME_DB_URL env var is required for crime_api database connection");
}

export const pool = new Pool({ connectionString });

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}
