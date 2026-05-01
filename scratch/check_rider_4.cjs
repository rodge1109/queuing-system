const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'clinic_booking',
  user: 'postgres',
  password: 'Ch3l3l3t110977',
});

async function checkRider() {
  try {
    const res = await pool.query('SELECT * FROM riders WHERE id = 4');
    console.log(JSON.stringify(res.rows[0], null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkRider();
