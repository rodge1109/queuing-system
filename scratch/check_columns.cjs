const pool = require('../server/db');

async function check() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'booking_services'");
    console.log('--- COLUMNS ---');
    console.table(res.rows);
    console.log('---------------');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    process.exit();
  }
}

check();
