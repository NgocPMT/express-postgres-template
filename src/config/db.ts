import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from './env.js';
import * as schema from '../models/index.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export async function connectDatabase(): Promise<typeof db> {
  const client = await pool.connect();
  client.release();
  return db;
}

export async function disconnectDatabase(): Promise<void> {
  await pool.end();
}
