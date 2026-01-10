import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST || 'db',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'postgres',
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const getClient = () => pool.connect();
