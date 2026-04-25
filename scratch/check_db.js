const pool = require('../server/db');

async function check() {
  try {
    const res = await pool.query('SELECT username, role, is_active FROM queue_staff');
    console.log('--- STAFF ACCOUNTS ---');
    console.table(res.rows);
    console.log('----------------------');
  } catch (e) {
    console.error('Error checking staff:', e.message);
  } finally {
    process.exit();
  }
}

check();
