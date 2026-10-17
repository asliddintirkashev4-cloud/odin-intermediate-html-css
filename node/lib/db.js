import pg from 'pg';
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', error => console.error('Database connection failed:', error.message));
