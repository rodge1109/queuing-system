const pool = require('../server/db');

async function check() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('--- TABLES ---');
    console.table(res.rows);
    console.log('--------------');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    process.exit();
  }
}

check();
