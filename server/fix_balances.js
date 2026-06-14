require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'queuing_system',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

async function run() {
  try {
    const result = await pool.query(`
      UPDATE corporate_accounts ca
      SET balance = COALESCE((
          SELECT SUM(debit - credit) 
          FROM corporate_ledgers cl 
          WHERE cl.account_id = ca.id
      ), 0)
      RETURNING id, company_name, balance;
    `);
    console.log("Updated accounts:", result.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
