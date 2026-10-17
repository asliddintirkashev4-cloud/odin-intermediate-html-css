import { readFile } from 'node:fs/promises';
import { pool } from '../lib/db.js';
try {
  await pool.query(await readFile(new URL('schema.sql', import.meta.url), 'utf8'));
  if (!(await pool.query('SELECT 1 FROM board_messages LIMIT 1')).rowCount) {
    await pool.query('INSERT INTO board_messages ("user",text) VALUES ($1,$2),($3,$4)', ['Amando', 'Hi there!', 'Charles', 'Hello World!']);
  }
  await pool.query("INSERT INTO categories(name,description) VALUES ('Notebooks','Paper for everyday ideas'),('Writing tools','Pens and pencils') ON CONFLICT(name) DO NOTHING");
  if (!(await pool.query('SELECT 1 FROM inventory_items LIMIT 1')).rowCount) {
    await pool.query("INSERT INTO inventory_items(category_id,name,description,price_cents,stock) SELECT id,'Field notes','A pocket notebook for observations.',650,24 FROM categories WHERE name='Notebooks'");
  }
  console.log('Database tables and example records are ready.');
} finally { await pool.end(); }
