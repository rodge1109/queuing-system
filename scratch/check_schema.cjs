
const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'clinic_booking',
  password: 'Ch3l3l3t110977',
  port: 5432,
});

async function check() {
  try {
    const res = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'corporate_accounts'");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
